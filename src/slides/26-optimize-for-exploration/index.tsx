import type {
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
} from "react";
import {
  useEffect,
  useRef,
  useState,
} from "react";
import { motion } from "motion/react";
import type { TileRevealState } from "../../motion-deck/presentation-sync";
import {
  appendTileRecordingEvent,
  createTilePlaybackSchedule,
  getTileCursorCenter,
  parseTileRecording,
  serializeTileRecording,
  tileRevealMaxColumns,
  tileRevealMaxRows,
  tileRevealMinColumns,
  tileRevealMinRows,
} from "./tile-recording";
import type { TileRecording } from "./tile-recording";
import { getDefaultTileRecording } from "./default-tile-recordings";
import sucksUrl from "./sucks.webp";
import waldoUrl from "./waldo.webp";

type TileRevealSlideProps = {
  className?: string;
  frameId: string;
  isInteractive?: boolean;
  onStateChange?: (state: TileRevealState) => void;
  showControls?: boolean;
  state: TileRevealState;
};

const playbackLeadInMs = 350;
const playbackTailMs = 180;
const playbackClickPulseMs = 100;
const copyFeedbackDurationMs = 1_800;
const tileRecordingStoragePrefix =
  "patterns-for-creativity:tile-reveal-recording:v1:";

type ActiveTileRecording = {
  recording: TileRecording;
  startedAt: number;
};

type TilePlaybackVisualState = {
  eventCount: number;
  playbackId: string;
  removedTileIds: number[];
};

function clampDimension(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, Math.round(value)));
}

function getTileRecordingStorageKey(frameId: string) {
  return `${tileRecordingStoragePrefix}${encodeURIComponent(frameId)}`;
}

function createPlaybackId(frameId: string) {
  const uniquePart = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return `${frameId}:${uniquePart}`;
}

function smoothStep(value: number) {
  const clamped = Math.min(1, Math.max(0, value));
  return clamped * clamped * (3 - (2 * clamped));
}

function stopPointerPropagation(event: ReactPointerEvent<HTMLElement>) {
  event.stopPropagation();
}

function stopKeyboardPropagation(event: ReactKeyboardEvent<HTMLElement>) {
  event.stopPropagation();
}

function consumeClick(event: ReactMouseEvent<HTMLElement>) {
  event.preventDefault();
  event.stopPropagation();
}

export function TileRevealSlide({
  className = "",
  frameId,
  isInteractive = true,
  onStateChange,
  showControls = true,
  state,
}: TileRevealSlideProps) {
  const [savedRecording, setSavedRecording] = useState<TileRecording>();
  const [recordingSource, setRecordingSource] =
    useState<"default" | "local" | undefined>(undefined);
  const [recordingFrameId, setRecordingFrameId] = useState<string>();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingEventCount, setRecordingEventCount] = useState(0);
  const [copyStatus, setCopyStatus] =
    useState<"idle" | "copied" | "failed">("idle");
  const [playbackVisualState, setPlaybackVisualState] =
    useState<TilePlaybackVisualState>();
  const activeRecordingRef = useRef<ActiveTileRecording | undefined>(undefined);
  const copyFeedbackTimerRef = useRef<number | undefined>(undefined);
  const cursorRef = useRef<HTMLDivElement>(null);
  const isInteractiveRef = useRef(isInteractive);
  const onStateChangeRef = useRef(onStateChange);
  const completedPlaybackIdsRef = useRef(new Set<string>());
  const autoplayedFrameIdRef = useRef<string | undefined>(undefined);

  isInteractiveRef.current = isInteractive;
  onStateChangeRef.current = onStateChange;

  const rows = clampDimension(
    state.rows,
    tileRevealMinRows,
    tileRevealMaxRows,
  );
  const columns = clampDimension(
    state.columns,
    tileRevealMinColumns,
    tileRevealMaxColumns,
  );
  const tileCount = rows * columns;
  const visibleRemovedTileIds = (
    state.playback
    && playbackVisualState?.playbackId === state.playback.id
  )
    ? playbackVisualState.removedTileIds
    : state.playback
      ? []
    : state.removedTileIds;
  const removedTileIds = new Set(
    visibleRemovedTileIds.filter((tileId) => (
      Number.isInteger(tileId) && tileId >= 0 && tileId < tileCount
    )),
  );
  const isPlaying = Boolean(state.playback);

  useEffect(() => {
    activeRecordingRef.current = undefined;
    setIsRecording(false);
    setRecordingEventCount(0);
    setCopyStatus("idle");
    const defaultRecording = getDefaultTileRecording(frameId);

    if (typeof window === "undefined") {
      setSavedRecording(defaultRecording);
      setRecordingSource(defaultRecording ? "default" : undefined);
      setRecordingFrameId(frameId);
      return;
    }

    try {
      const serialized = window.localStorage.getItem(
        getTileRecordingStorageKey(frameId),
      );
      const localRecording = serialized === null
        ? undefined
        : parseTileRecording(serialized);
      setSavedRecording(localRecording ?? defaultRecording);
      setRecordingSource(
        localRecording
          ? "local"
          : defaultRecording
            ? "default"
            : undefined,
      );
      setRecordingFrameId(frameId);
    } catch {
      setSavedRecording(defaultRecording);
      setRecordingSource(defaultRecording ? "default" : undefined);
      setRecordingFrameId(frameId);
    }
  }, [frameId]);

  useEffect(() => () => {
    if (copyFeedbackTimerRef.current !== undefined) {
      window.clearTimeout(copyFeedbackTimerRef.current);
    }
  }, []);

  useEffect(() => {
    const playback = state.playback;
    const cursor = cursorRef.current;

    if (!playback) {
      setPlaybackVisualState(undefined);
      if (cursor) {
        cursor.style.opacity = "0";
        cursor.removeAttribute("data-clicking");
      }
      return;
    }

    const schedule = createTilePlaybackSchedule(playback.recording);
    const finalRemovedTileIds = schedule.map(({ tileId }) => tileId);
    let frameRequest = 0;
    let appliedEventCount = 0;
    let clickingUntilMs = Number.NEGATIVE_INFINITY;

    setPlaybackVisualState({
      eventCount: 0,
      playbackId: playback.id,
      removedTileIds: [],
    });

    const updateCursor = (elapsedMs: number) => {
      if (!cursor || schedule.length === 0) {
        return;
      }

      let fromEventIndex = -1;
      for (let index = 0; index < schedule.length; index += 1) {
        if (schedule[index].atMs <= elapsedMs) {
          fromEventIndex = index;
        } else {
          break;
        }
      }

      const isApproachingFirstEvent = fromEventIndex < 0;
      const fromEvent = schedule[Math.max(0, fromEventIndex)];
      const toEvent = schedule[Math.min(
        schedule.length - 1,
        Math.max(0, fromEventIndex + 1),
      )];
      const fromCenter = isApproachingFirstEvent
        ? { xPercent: 4.5, yPercent: 92 }
        : getTileCursorCenter(
            fromEvent.tileId,
            playback.recording.rows,
            playback.recording.columns,
          );
      const toCenter = getTileCursorCenter(
        isApproachingFirstEvent ? schedule[0].tileId : toEvent.tileId,
        playback.recording.rows,
        playback.recording.columns,
      );
      const intervalStart = isApproachingFirstEvent
        ? -playbackLeadInMs
        : fromEvent.atMs;
      const intervalDuration = isApproachingFirstEvent
        ? playbackLeadInMs
        : Math.max(1, toEvent.atMs - intervalStart);
      const progress = smoothStep(
        (elapsedMs - intervalStart) / intervalDuration,
      );
      const xPercent = fromCenter.xPercent
        + ((toCenter.xPercent - fromCenter.xPercent) * progress);
      const yPercent = fromCenter.yPercent
        + ((toCenter.yPercent - fromCenter.yPercent) * progress);

      cursor.style.left = `${xPercent}%`;
      cursor.style.top = `${yPercent}%`;
      cursor.style.opacity = elapsedMs >= -playbackLeadInMs ? "1" : "0";
    };

    const finishPlayback = () => {
      if (cursor) {
        cursor.style.opacity = "0";
        cursor.removeAttribute("data-clicking");
      }

      if (
        isInteractiveRef.current
        && !completedPlaybackIdsRef.current.has(playback.id)
      ) {
        completedPlaybackIdsRef.current.add(playback.id);
        onStateChangeRef.current?.({
          rows: playback.recording.rows,
          columns: playback.recording.columns,
          removedTileIds: finalRemovedTileIds,
        });
      }
    };

    const tick = () => {
      const elapsedMs = Date.now() - playback.startedAt;
      let dueEventCount = 0;

      while (
        dueEventCount < schedule.length
        && schedule[dueEventCount].atMs <= elapsedMs
      ) {
        dueEventCount += 1;
      }

      updateCursor(elapsedMs);

      if (dueEventCount !== appliedEventCount) {
        appliedEventCount = dueEventCount;
        setPlaybackVisualState({
          eventCount: dueEventCount,
          playbackId: playback.id,
          removedTileIds: schedule
            .slice(0, dueEventCount)
            .map(({ tileId }) => tileId),
        });
        if (cursor && dueEventCount > 0) {
          cursor.dataset.clicking = "true";
          clickingUntilMs = elapsedMs + playbackClickPulseMs;
        }
      } else if (
        cursor?.dataset.clicking === "true"
        && elapsedMs >= clickingUntilMs
      ) {
        cursor.removeAttribute("data-clicking");
      }

      if (
        schedule.length === 0
        || (
          dueEventCount === schedule.length
          && elapsedMs
            >= schedule[schedule.length - 1].atMs + playbackTailMs
        )
      ) {
        finishPlayback();
        return;
      }

      frameRequest = window.requestAnimationFrame(tick);
    };

    frameRequest = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frameRequest);
    };
  }, [state.playback?.id]);

  const cancelActiveSequence = () => {
    activeRecordingRef.current = undefined;
    setIsRecording(false);
    setRecordingEventCount(0);
  };

  const updateDimensions = (nextRows: number, nextColumns: number) => {
    if (!isInteractive) {
      return;
    }

    cancelActiveSequence();
    onStateChange?.({
      rows: clampDimension(
        nextRows,
        tileRevealMinRows,
        tileRevealMaxRows,
      ),
      columns: clampDimension(
        nextColumns,
        tileRevealMinColumns,
        tileRevealMaxColumns,
      ),
      removedTileIds: [],
    });
  };

  const revealTile = (tileId: number) => {
    if (!isInteractive || isPlaying || removedTileIds.has(tileId)) {
      return;
    }

    const activeRecording = activeRecordingRef.current;
    if (activeRecording) {
      const atMs = Math.max(
        0,
        Math.round(performance.now() - activeRecording.startedAt),
      );
      activeRecording.recording = appendTileRecordingEvent(
        activeRecording.recording,
        tileId,
        atMs,
      );
      setRecordingEventCount(activeRecording.recording.events.length);
    }

    onStateChange?.({
      rows,
      columns,
      removedTileIds: [...removedTileIds, tileId].sort((a, b) => a - b),
    });
  };

  const resetTiles = () => {
    if (!isInteractive) {
      return;
    }

    cancelActiveSequence();
    onStateChange?.({ rows, columns, removedTileIds: [] });
  };

  const startRecording = () => {
    if (!isInteractive || isRecording) {
      return;
    }

    activeRecordingRef.current = {
      recording: {
        version: 1,
        rows,
        columns,
        events: [],
      },
      startedAt: performance.now(),
    };
    setIsRecording(true);
    setRecordingEventCount(0);
    onStateChange?.({ rows, columns, removedTileIds: [] });
  };

  const stopRecording = () => {
    const activeRecording = activeRecordingRef.current;
    if (!isInteractive || !activeRecording) {
      return;
    }

    activeRecordingRef.current = undefined;
    setIsRecording(false);
    setRecordingEventCount(0);

    if (activeRecording.recording.events.length === 0) {
      return;
    }

    setSavedRecording(activeRecording.recording);
    setRecordingSource("local");
    try {
      window.localStorage.setItem(
        getTileRecordingStorageKey(frameId),
        serializeTileRecording(activeRecording.recording),
      );
    } catch {
      // Keep the take available for this session if persistent storage is blocked.
    }
  };

  const playRecording = () => {
    if (!isInteractive || isRecording || isPlaying || !savedRecording) {
      return;
    }

    onStateChange?.({
      rows: savedRecording.rows,
      columns: savedRecording.columns,
      removedTileIds: [],
      playback: {
        id: createPlaybackId(frameId),
        startedAt: Date.now() + playbackLeadInMs,
        recording: savedRecording,
      },
    });
  };

  useEffect(() => {
    if (
      !isInteractive
      || isRecording
      || isPlaying
      || !savedRecording
      || recordingFrameId !== frameId
      || autoplayedFrameIdRef.current === frameId
    ) {
      return;
    }

    autoplayedFrameIdRef.current = frameId;
    onStateChange?.({
      rows: savedRecording.rows,
      columns: savedRecording.columns,
      removedTileIds: [],
      playback: {
        id: createPlaybackId(frameId),
        startedAt: Date.now() + playbackLeadInMs,
        recording: savedRecording,
      },
    });
  }, [
    frameId,
    isInteractive,
    isPlaying,
    isRecording,
    onStateChange,
    recordingFrameId,
    savedRecording,
  ]);

  const stopPlayback = () => {
    const playback = state.playback;
    if (!isInteractive || !playback) {
      return;
    }

    const elapsedMs = Date.now() - playback.startedAt;
    const currentRemovedTileIds = createTilePlaybackSchedule(
      playback.recording,
    )
      .filter(({ atMs }) => atMs <= elapsedMs)
      .map(({ tileId }) => tileId);

    onStateChange?.({
      rows: playback.recording.rows,
      columns: playback.recording.columns,
      removedTileIds: currentRemovedTileIds,
    });
  };

  const clearRecording = () => {
    if (
      !isInteractive
      || isRecording
      || isPlaying
      || recordingSource !== "local"
    ) {
      return;
    }

    const defaultRecording = getDefaultTileRecording(frameId);
    setSavedRecording(defaultRecording);
    setRecordingSource(defaultRecording ? "default" : undefined);
    try {
      window.localStorage.removeItem(getTileRecordingStorageKey(frameId));
    } catch {
      // The in-memory take is still cleared when persistent storage is blocked.
    }
  };

  const showTemporaryCopyStatus = (nextStatus: "copied" | "failed") => {
    if (copyFeedbackTimerRef.current !== undefined) {
      window.clearTimeout(copyFeedbackTimerRef.current);
    }

    setCopyStatus(nextStatus);
    copyFeedbackTimerRef.current = window.setTimeout(() => {
      setCopyStatus("idle");
      copyFeedbackTimerRef.current = undefined;
    }, copyFeedbackDurationMs);
  };

  const copyRecording = async () => {
    if (!isInteractive || isRecording || isPlaying || !savedRecording) {
      return;
    }

    try {
      await navigator.clipboard.writeText(serializeTileRecording(savedRecording));
      showTemporaryCopyStatus("copied");
    } catch {
      showTemporaryCopyStatus("failed");
    }
  };

  const handleTileClick = (
    event: ReactMouseEvent<HTMLButtonElement>,
    tileId: number,
  ) => {
    consumeClick(event);
    revealTile(tileId);
  };

  const handleDimensionClick = (
    event: ReactMouseEvent<HTMLButtonElement>,
    nextRows: number,
    nextColumns: number,
  ) => {
    consumeClick(event);
    updateDimensions(nextRows, nextColumns);
  };

  const handleResetClick = (event: ReactMouseEvent<HTMLButtonElement>) => {
    consumeClick(event);
    resetTiles();
  };

  const handleRecordClick = (event: ReactMouseEvent<HTMLButtonElement>) => {
    consumeClick(event);
    startRecording();
  };

  const handleStopClick = (event: ReactMouseEvent<HTMLButtonElement>) => {
    consumeClick(event);
    if (isRecording) {
      stopRecording();
      return;
    }

    stopPlayback();
  };

  const handlePlayClick = (event: ReactMouseEvent<HTMLButtonElement>) => {
    consumeClick(event);
    playRecording();
  };

  const handleClearClick = (event: ReactMouseEvent<HTMLButtonElement>) => {
    consumeClick(event);
    clearRecording();
  };

  const handleCopyClick = (event: ReactMouseEvent<HTMLButtonElement>) => {
    consumeClick(event);
    void copyRecording();
  };

  const status = isRecording
    ? `Recording · ${recordingEventCount} click${recordingEventCount === 1 ? "" : "s"}`
    : isPlaying
      ? `Playing · ${
          playbackVisualState?.playbackId === state.playback?.id
            ? (playbackVisualState?.eventCount ?? 0)
            : 0
        }/${state.playback?.recording.events.length ?? 0}`
      : copyStatus === "copied"
        ? "Copied take JSON"
        : copyStatus === "failed"
          ? "Could not copy take"
      : savedRecording
        ? `${recordingSource === "default" ? "Default" : "Saved"} · ${savedRecording.rows}×${savedRecording.columns} · ${savedRecording.events.length} click${savedRecording.events.length === 1 ? "" : "s"}`
        : "No saved take";

  return (
    <div
      aria-label="Tile reveal with a hidden image"
      className={`tile-reveal-slide ${className}`.trim()}
    >
      <div className="tile-reveal-slide__field">
        <img
          aria-hidden="true"
          className="tile-reveal-slide__waldo"
          draggable={false}
          src={waldoUrl}
        />
        <div
          aria-label={`${rows} by ${columns} reveal tile grid`}
          className="tile-reveal-slide__grid"
          onClick={consumeClick}
          onKeyDown={stopKeyboardPropagation}
          onPointerDown={stopPointerPropagation}
          role="grid"
          style={{
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
          }}
        >
          {Array.from({ length: tileCount }, (_, tileId) => {
            const isRemoved = removedTileIds.has(tileId);
            const row = Math.floor(tileId / columns) + 1;
            const column = (tileId % columns) + 1;

            return (
              <motion.button
                animate={isRemoved
                  ? { opacity: 0, scale: 0.88 }
                  : { opacity: 1, scale: 1 }}
                aria-label={`Reveal tile at row ${row}, column ${column}`}
                className={[
                  "tile-reveal-slide__tile",
                  isRemoved ? "tile-reveal-slide__tile--removed" : "",
                ].join(" ")}
                disabled={!isInteractive || isPlaying || isRemoved}
                initial={false}
                key={tileId}
                onClick={(event) => handleTileClick(event, tileId)}
                onKeyDown={stopKeyboardPropagation}
                onPointerDown={stopPointerPropagation}
                role="gridcell"
                tabIndex={isRemoved ? -1 : undefined}
                transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                type="button"
              />
            );
          })}
        </div>

        <div
          aria-hidden="true"
          className="tile-reveal-slide__playback-cursor"
          ref={cursorRef}
        >
          <svg
            className="tile-reveal-slide__playback-cursor-icon"
            viewBox="0 0 28 36"
          >
            <path
              d="M2 2v27l7.2-6.2 5.1 11.1 5.2-2.4-5.1-10.8H25L2 2Z"
              fill="currentColor"
              stroke="var(--color-dark-s0)"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
        </div>
      </div>

      {showControls ? (
        <div
          aria-label="Tile grid controls"
          className="tile-reveal-slide__controls"
          onKeyDown={stopKeyboardPropagation}
          onPointerDown={stopPointerPropagation}
          role="group"
        >
          <div className="tile-reveal-slide__stepper">
            <span className="tile-reveal-slide__stepper-label">Rows</span>
            <button
              aria-label="Decrease tile rows"
              className="tile-reveal-slide__stepper-button"
              disabled={
                !isInteractive
                || isRecording
                || isPlaying
                || rows <= tileRevealMinRows
              }
              onClick={(event) => handleDimensionClick(event, rows - 1, columns)}
              type="button"
            >
              −
            </button>
            <output
              aria-label={`${rows} rows`}
              className="tile-reveal-slide__stepper-value"
            >
              {rows}
            </output>
            <button
              aria-label="Increase tile rows"
              className="tile-reveal-slide__stepper-button"
              disabled={
                !isInteractive
                || isRecording
                || isPlaying
                || rows >= tileRevealMaxRows
              }
              onClick={(event) => handleDimensionClick(event, rows + 1, columns)}
              type="button"
            >
              +
            </button>
          </div>

          <div className="tile-reveal-slide__stepper">
            <span className="tile-reveal-slide__stepper-label">Columns</span>
            <button
              aria-label="Decrease tile columns"
              className="tile-reveal-slide__stepper-button"
              disabled={
                !isInteractive
                || isRecording
                || isPlaying
                || columns <= tileRevealMinColumns
              }
              onClick={(event) => handleDimensionClick(event, rows, columns - 1)}
              type="button"
            >
              −
            </button>
            <output
              aria-label={`${columns} columns`}
              className="tile-reveal-slide__stepper-value"
            >
              {columns}
            </output>
            <button
              aria-label="Increase tile columns"
              className="tile-reveal-slide__stepper-button"
              disabled={
                !isInteractive
                || isRecording
                || isPlaying
                || columns >= tileRevealMaxColumns
              }
              onClick={(event) => handleDimensionClick(event, rows, columns + 1)}
              type="button"
            >
              +
            </button>
          </div>

          <button
            className="tile-reveal-slide__reset"
            disabled={
              !isInteractive
              || (!isRecording && !isPlaying && removedTileIds.size === 0)
            }
            onClick={handleResetClick}
            type="button"
          >
            Reset
          </button>

          <div
            aria-label="Tile recording controls"
            className="tile-reveal-slide__recording-controls"
            role="group"
          >
            <button
              aria-pressed={isRecording}
              className="tile-reveal-slide__transport-button tile-reveal-slide__transport-button--record"
              disabled={!isInteractive || isRecording || isPlaying}
              onClick={handleRecordClick}
              type="button"
            >
              Record
            </button>
            <button
              className="tile-reveal-slide__transport-button"
              disabled={!isInteractive || (!isRecording && !isPlaying)}
              onClick={handleStopClick}
              type="button"
            >
              Stop
            </button>
            <button
              className="tile-reveal-slide__transport-button"
              disabled={
                !isInteractive || isRecording || isPlaying || !savedRecording
              }
              onClick={handlePlayClick}
              type="button"
            >
              Play
            </button>
            <button
              aria-label="Copy saved tile recording as JSON"
              className="tile-reveal-slide__transport-button"
              disabled={
                !isInteractive || isRecording || isPlaying || !savedRecording
              }
              onClick={handleCopyClick}
              type="button"
            >
              {copyStatus === "copied" ? "Copied" : "Copy"}
            </button>
            <button
              className="tile-reveal-slide__transport-button"
              disabled={
                !isInteractive
                || isRecording
                || isPlaying
                || recordingSource !== "local"
              }
              onClick={handleClearClick}
              type="button"
            >
              Clear
            </button>
          </div>

          <output
            aria-live="polite"
            className="tile-reveal-slide__recording-status"
          >
            {status}
          </output>
        </div>
      ) : null}
    </div>
  );
}

type FirstIdeaSlideProps = {
  className?: string;
  isAnimated?: boolean;
  showStamp?: boolean;
};

export function FirstIdeaSlide({
  className = "",
  isAnimated = true,
  showStamp = false,
}: FirstIdeaSlideProps) {
  return (
    <div className={`first-idea-slide ${className}`.trim()}>
      <div className="first-idea-slide__headline" role="heading" aria-level={1}>
        <span
          aria-hidden="true"
          className="first-idea-slide__headline-shadow"
          style={{ mixBlendMode: "luminosity" }}
        >
          1st idea
        </span>
        <span className="first-idea-slide__headline-copy">1st idea</span>
      </div>

      {showStamp ? (
        <motion.img
          alt="Sucks"
          animate={{ opacity: 1, scale: 1 }}
          className="first-idea-slide__stamp"
          draggable={false}
          initial={isAnimated ? { opacity: 1, scale: 1.2 } : false}
          src={sucksUrl}
          transition={isAnimated
            ? {
                duration: 0.18,
                ease: [0.22, 1, 0.36, 1],
              }
            : { duration: 0 }}
        />
      ) : null}
    </div>
  );
}
