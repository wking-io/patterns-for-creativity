import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { SpeakerNote } from "./speaker-notes";
import {
  createEmptySpeakerNotesFile,
  defaultSpeakerNotesFileName,
  parseSpeakerNotesFile,
} from "./speaker-notes";
import {
  createInitialNotesSessionState,
  notesSessionReducer,
  selectSessionNote,
} from "./notes-session";
import {
  createSpeakerNotesFile,
  isFilePickerAbort,
  openSpeakerNotesFile,
  saveSpeakerNotesFile,
  supportsPersistentNotesFiles,
} from "./speaker-notes-files";
import type { WritableNotesFileHandle } from "./speaker-notes-files";
import { motionDeckFrames } from "./frames";
import { MotionStage } from "./MotionStage";
import type { AudienceConnectionStatus } from "./presentation-sync";
import {
  createElapsedTimerState,
  defaultNotesTextSize,
  elapsedTimerReducer,
  formatElapsedTime,
  getElapsedMilliseconds,
  notesTextSizeOptions,
  readNotesTextSize,
  updateNotesTextSize,
  writeNotesTextSize,
} from "./presenter-controls";

type PresenterViewProps = {
  audienceStatus: AudienceConnectionStatus;
  direction: number;
  frameIndex: number;
  isAudienceBlackout: boolean;
  isGridVisible: boolean;
  onNext: () => void;
  onOpenAudience: () => void;
  onPrevious: () => void;
  onToggleAudienceBlackout: () => void;
};

export function PresenterView({
  audienceStatus,
  direction,
  frameIndex,
  isAudienceBlackout,
  isGridVisible,
  onNext,
  onOpenAudience,
  onPrevious,
  onToggleAudienceBlackout,
}: PresenterViewProps) {
  const [notesSession, dispatchNotes] = useReducer(
    notesSessionReducer,
    undefined,
    createInitialNotesSessionState,
  );
  const [editingFrameId, setEditingFrameId] = useState<string>();
  const [editStartNote, setEditStartNote] = useState<SpeakerNote>();
  const [hasWritableHandle, setHasWritableHandle] = useState(false);
  const [timer, dispatchTimer] = useReducer(
    elapsedTimerReducer,
    undefined,
    createElapsedTimerState,
  );
  const [now, setNow] = useState(() => Date.now());
  const [notesTextSize, setNotesTextSize] = useState(() => (
    readNotesTextSize(getPresenterPreferenceStorage())
  ));
  const fileHandleRef = useRef<WritableNotesFileHandle | undefined>(undefined);
  const frame = motionDeckFrames[frameIndex] ?? motionDeckFrames[0];
  const nextFrame = motionDeckFrames[frameIndex + 1];
  const currentNote = selectSessionNote(notesSession, frame.id);
  const isEditing = editingFrameId === frame.id;
  const hasPersistentFileSupport = supportsPersistentNotesFiles();
  const audienceStatusContent = getAudienceStatusContent(
    audienceStatus,
    isAudienceBlackout,
  );
  const canToggleAudienceBlackout = (
    audienceStatus === "connected" || isAudienceBlackout
  );
  const elapsedTime = formatElapsedTime(getElapsedMilliseconds(timer, now));
  const timerAction = timer.status === "idle"
    ? "Start"
    : timer.status === "running"
      ? "Pause"
      : "Resume";

  const confirmDiscardUnsavedNotes = useCallback(() => (
    !notesSession.isDirty || window.confirm(
      "Discard unsaved speaker-note changes and switch files?",
    )
  ), [notesSession.isDirty]);

  const handleCreate = async () => {
    if (!confirmDiscardUnsavedNotes()) {
      return;
    }

    const emptyDocument = createEmptySpeakerNotesFile();

    try {
      const created = await createSpeakerNotesFile(emptyDocument);
      fileHandleRef.current = created.handle;
      setHasWritableHandle(Boolean(created.handle));
      setEditingFrameId(undefined);
      dispatchNotes({
        type: "replace-document",
        document: emptyDocument,
        fileName: created.fileName,
        persisted: created.persisted,
      });
    } catch (error) {
      if (!isFilePickerAbort(error)) {
        dispatchNotes({ type: "save-failure", message: getErrorMessage(error) });
      }
    }
  };

  const handleOpen = async () => {
    if (!confirmDiscardUnsavedNotes()) {
      return;
    }

    try {
      const opened = await openSpeakerNotesFile();
      const document = parseSpeakerNotesFile(opened.contents);
      fileHandleRef.current = opened.handle;
      setHasWritableHandle(Boolean(opened.handle));
      setEditingFrameId(undefined);
      dispatchNotes({
        type: "replace-document",
        document,
        fileName: opened.fileName,
        persisted: true,
      });
    } catch (error) {
      if (!isFilePickerAbort(error)) {
        dispatchNotes({ type: "invalid-file", message: getErrorMessage(error) });
      }
    }
  };

  const handleSave = useCallback(async () => {
    if (notesSession.phase === "saving") {
      return;
    }

    dispatchNotes({ type: "save-start" });

    try {
      const result = await saveSpeakerNotesFile(
        notesSession.document,
        fileHandleRef.current,
        notesSession.fileName ?? defaultSpeakerNotesFileName,
      );
      fileHandleRef.current = result.handle;
      setHasWritableHandle(Boolean(result.handle));
      dispatchNotes({
        type: "save-success",
        fileName: result.fileName,
        message: result.mode === "download"
          ? `Downloaded ${result.fileName}. Future saves will download another copy.`
          : `Saved ${result.fileName}.`,
      });
    } catch (error) {
      if (isFilePickerAbort(error)) {
        dispatchNotes({ type: "save-failure", message: "Save canceled. Changes remain unsaved." });
        return;
      }

      dispatchNotes({ type: "save-failure", message: getErrorMessage(error) });
    }
  }, [notesSession.document, notesSession.fileName, notesSession.phase]);

  const updateCurrentNote = (note: SpeakerNote) => {
    dispatchNotes({ type: "edit-note", frameId: frame.id, note });
  };

  const startEditing = () => {
    setEditStartNote(currentNote);
    setEditingFrameId(frame.id);
  };

  const cancelEditing = () => {
    if (editStartNote) {
      updateCurrentNote(editStartNote);
    }

    setEditingFrameId(undefined);
    setEditStartNote(undefined);
  };

  useEffect(() => {
    const clockTimer = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => window.clearInterval(clockTimer);
  }, []);

  useEffect(() => {
    writeNotesTextSize(getPresenterPreferenceStorage(), notesTextSize);
  }, [notesTextSize]);

  useEffect(() => {
    setEditingFrameId(undefined);
    setEditStartNote(undefined);
  }, [frame.id]);

  useEffect(() => {
    if (!notesSession.isDirty) {
      return undefined;
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [notesSession.isDirty]);

  useEffect(() => {
    const handleSaveShortcut = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "s") {
        return;
      }

      event.preventDefault();
      void handleSave();
    };

    window.addEventListener("keydown", handleSaveShortcut);
    return () => window.removeEventListener("keydown", handleSaveShortcut);
  }, [handleSave]);

  const handleTimerAction = () => {
    const at = Date.now();

    if (timer.status === "idle") {
      dispatchTimer({ type: "start", at });
    } else if (timer.status === "running") {
      dispatchTimer({ type: "pause", at });
    } else {
      dispatchTimer({ type: "resume", at });
    }

    setNow(at);
  };

  const changeNotesTextSize = (action: "increase" | "decrease" | "reset") => {
    setNotesTextSize((currentSize) => updateNotesTextSize(currentSize, action));
  };

  return (
    <main className="presenter-view-root">
      <header className="presenter-view-header">
        <div className="presenter-view-header__title">
          <p className="presenter-view-eyebrow">Presenter View</p>
          <h1>{frame.label}</h1>
        </div>
        <section aria-label="Presentation timing" className="presenter-timing">
          <div className="presenter-time-readout">
            <span>Local time</span>
            <time dateTime={new Date(now).toISOString()}>{formatLocalTime(now)}</time>
          </div>
          <div className="presenter-time-readout" data-timer-status={timer.status}>
            <span>Elapsed</span>
            <output>{elapsedTime}</output>
          </div>
          <div className="presenter-timer-actions">
            <button onClick={handleTimerAction} type="button">{timerAction}</button>
            <button
              disabled={timer.status === "idle"}
              onClick={() => {
                dispatchTimer({ type: "reset" });
                setNow(Date.now());
              }}
              type="button"
            >
              Reset
            </button>
          </div>
        </section>
        <div className="presenter-view-header__status">
          <div className="presenter-view-header__presentation-actions">
            <span>{frameIndex + 1} / {motionDeckFrames.length}</span>
            <button
              aria-keyshortcuts="B"
              aria-pressed={isAudienceBlackout}
              className="presenter-blackout-control"
              data-active={isAudienceBlackout}
              disabled={!canToggleAudienceBlackout}
              onClick={onToggleAudienceBlackout}
              type="button"
            >
              {isAudienceBlackout ? "Restore audience (B)" : "Black out audience (B)"}
            </button>
            <button onClick={onOpenAudience} type="button">
              {audienceStatusContent.action}
            </button>
          </div>
          <span
            aria-live="polite"
            className="presenter-audience-status"
            data-blackout={isAudienceBlackout ? "active" : "inactive"}
            data-status={audienceStatus}
          >
            <strong>{audienceStatusContent.label}</strong>
            <span>{audienceStatusContent.detail}</span>
          </span>
          <span
            aria-live="polite"
            className="presenter-notes-status"
            data-phase={notesSession.phase}
          >
            {notesSession.message ?? "No notes file open."}
          </span>
        </div>
      </header>

      <div className="presenter-view-workspace">
        <section aria-label="Slide previews" className="presenter-preview-column">
          <div className="presenter-preview-card presenter-preview-card--current">
            <div className="presenter-preview-card__label">Current</div>
            <div className="presenter-stage-shell">
              <MotionStage
                direction={direction}
                frame={frame}
                isGridVisible={isGridVisible}
                onAdvance={onNext}
              />
            </div>
          </div>

          <div className="presenter-preview-footer">
            <div className="presenter-navigation-controls">
              <button disabled={frameIndex === 0} onClick={onPrevious} type="button">
                Previous
              </button>
              <button
                className="presenter-button--primary"
                disabled={!nextFrame}
                onClick={onNext}
                type="button"
              >
                Next
              </button>
            </div>

            <div className="presenter-preview-card presenter-preview-card--next">
              <div className="presenter-preview-card__label">
                {nextFrame ? `Next · ${nextFrame.label}` : "End of deck"}
              </div>
              {nextFrame ? (
                <button
                  aria-label={`Advance to ${nextFrame.label}`}
                  className="presenter-stage-shell presenter-stage-shell--next"
                  onClick={onNext}
                  type="button"
                >
                  <MotionStage
                    direction={1}
                    frame={nextFrame}
                    isGridVisible={false}
                    mode="preview"
                  />
                </button>
              ) : (
                <div className="presenter-end-state">You’re at the final frame.</div>
              )}
            </div>
          </div>
        </section>

        <section
          aria-label="Speaker notes"
          className="presenter-notes-panel"
          style={{ "--presenter-notes-text-size": `${notesTextSize}px` } as CSSProperties}
        >
          <div className="presenter-notes-panel__toolbar">
            <div>
              <p className="presenter-view-eyebrow">Speaker notes</p>
              <strong>{notesSession.fileName ?? "Unsaved notes"}</strong>
            </div>
            <div className="presenter-notes-file-actions">
              <button disabled={notesSession.phase === "saving"} onClick={handleCreate} type="button">
                New
              </button>
              <button disabled={notesSession.phase === "saving"} onClick={handleOpen} type="button">
                Open
              </button>
              <button
                className="presenter-button--primary"
                disabled={!notesSession.isDirty || notesSession.phase === "saving"}
                onClick={() => void handleSave()}
                type="button"
              >
                {hasWritableHandle ? "Save" : "Save As"}
              </button>
            </div>
          </div>

          {!hasPersistentFileSupport ? (
            <p className="presenter-file-fallback-note">
              This browser cannot overwrite a selected file. Save As downloads a complete new copy.
            </p>
          ) : null}

          {isEditing ? (
            <div className="presenter-notes-editor">
              <label>
                <span>Notes</span>
                <textarea
                  autoFocus
                  onChange={(event) => updateCurrentNote({
                    ...currentNote,
                    body: event.target.value,
                  })}
                  placeholder="Add what you want to say for this frame…"
                  rows={12}
                  value={currentNote.body}
                />
              </label>
              <label>
                <span>Presenter cue</span>
                <input
                  onChange={(event) => updateCurrentNote({
                    ...currentNote,
                    cue: event.target.value,
                  })}
                  placeholder="Pause, ask the room, wait for animation…"
                  type="text"
                  value={currentNote.cue ?? ""}
                />
              </label>
              <div className="presenter-notes-editor__actions">
                <button onClick={cancelEditing} type="button">Cancel edits</button>
                <button
                  className="presenter-button--primary"
                  onClick={() => setEditingFrameId(undefined)}
                  type="button"
                >
                  Done editing
                </button>
              </div>
            </div>
          ) : (
            <div className="presenter-notes-reader">
              {currentNote.cue ? (
                <div className="presenter-note-cue">
                  <span>Cue</span>
                  <p>{currentNote.cue}</p>
                </div>
              ) : null}
              {currentNote.body ? (
                <div className="presenter-note-body">{currentNote.body}</div>
              ) : (
                <div className="presenter-note-empty">
                  <strong>No notes for this frame.</strong>
                  <span>Add a thought, transition, or reminder when you’re ready.</span>
                </div>
              )}
              <button className="presenter-edit-notes" onClick={startEditing} type="button">
                Edit this frame’s notes
              </button>
            </div>
          )}

          <div className="presenter-notes-panel__footer">
            <div aria-label="Notes text size" className="presenter-notes-text-size" role="group">
              <button
                aria-label="Decrease notes text size"
                disabled={notesTextSize === notesTextSizeOptions[0]}
                onClick={() => changeNotesTextSize("decrease")}
                type="button"
              >
                A−
              </button>
              <output aria-live="polite">{notesTextSize}px</output>
              <button
                aria-label="Increase notes text size"
                disabled={notesTextSize === notesTextSizeOptions.at(-1)}
                onClick={() => changeNotesTextSize("increase")}
                type="button"
              >
                A+
              </button>
              <button
                disabled={notesTextSize === defaultNotesTextSize}
                onClick={() => changeNotesTextSize("reset")}
                type="button"
              >
                Default
              </button>
            </div>
            <div className="presenter-notes-panel__footer-meta">
              <span>⌘/Ctrl+S saves</span>
              <span>Notes keyed to <code>{frame.id}</code></span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Speaker notes could not be saved.";
}

function formatLocalTime(timestamp: number) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  }).format(timestamp);
}

function getPresenterPreferenceStorage() {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

function getAudienceStatusContent(
  status: AudienceConnectionStatus,
  isAudienceBlackout: boolean,
) {
  const content = (() => {
    switch (status) {
      case "opening":
        return {
          action: "Open again",
          detail: "Waiting for the audience window to check in.",
          label: "Audience display opening",
        };
      case "connected":
        return {
          action: "Refresh audience display",
          detail: "Following the current presenter frame.",
          label: "Audience display connected",
        };
      case "disconnected":
        return {
          action: "Reconnect audience display",
          detail: "No recent response. Reopen it to restore the current frame.",
          label: "Audience display disconnected",
        };
      case "popup-blocked":
        return {
          action: "Try opening again",
          detail: "Allow pop-ups for this page, then try again.",
          label: "Audience display blocked",
        };
      case "closed":
        return {
          action: "Open audience display",
          detail: "Open or reopen a second display when ready.",
          label: "Audience display closed",
        };
    }
  })();

  if (!isAudienceBlackout) {
    return content;
  }

  return {
    ...content,
    label: status === "connected" ? "Audience blacked out" : "Blackout remains active",
    detail: status === "connected"
      ? "Navigation continues; press B to restore the latest frame."
      : "A reconnected audience will remain black until you restore it.",
  };
}
