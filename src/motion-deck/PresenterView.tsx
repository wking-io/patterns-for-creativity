import { NumberField } from "@base-ui/react/number-field";
import { useCallback, useEffect, useReducer, useState } from "react";
import type { CSSProperties } from "react";
import type { SpeakerNote } from "./speaker-notes";
import {
  createInitialNotesSessionState,
  notesSessionReducer,
  selectSessionNote,
} from "./notes-session";
import {
  getPresentationSpeakerNotes,
  presentationSpeakerNotesFileName,
  savePresentationSpeakerNotes,
} from "./presentation-speaker-notes";
import { motionDeckFrames } from "./frames";
import { MotionStage } from "./MotionStage";
import type {
  AudienceConnectionStatus,
  PortalMaskRect,
  PresentationInteractionState,
  TileRevealState,
} from "./presentation-sync";
import {
  createElapsedTimerState,
  elapsedTimerReducer,
  formatElapsedTime,
  getElapsedMilliseconds,
  notesTextSizeOptions,
  readNotesTextSize,
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
  onInteractionState: (state: PresentationInteractionState) => void;
  onPortalMaskRect: (rect: PortalMaskRect) => void;
  onTileRevealState: (frameId: string, state: TileRevealState) => void;
  onToggleAudienceBlackout: () => void;
  portalMaskRect?: PortalMaskRect;
  interactionState?: PresentationInteractionState;
  tileRevealStates: Readonly<Record<string, TileRevealState>>;
};

export function PresenterView({
  audienceStatus,
  direction,
  frameIndex,
  isAudienceBlackout,
  isGridVisible,
  onNext,
  onOpenAudience,
  onInteractionState,
  onPortalMaskRect,
  onTileRevealState,
  onToggleAudienceBlackout,
  portalMaskRect,
  interactionState,
  tileRevealStates,
}: PresenterViewProps) {
  const [notesSession, dispatchNotes] = useReducer(
    notesSessionReducer,
    undefined,
    createInitialPresentationNotesSession,
  );
  const [timer, dispatchTimer] = useReducer(
    elapsedTimerReducer,
    undefined,
    createElapsedTimerState,
  );
  const [now, setNow] = useState(() => Date.now());
  const [notesTextSize, setNotesTextSize] = useState<number>(() => (
    readNotesTextSize(getPresenterPreferenceStorage())
  ));
  const frame = motionDeckFrames[frameIndex] ?? motionDeckFrames[0];
  const nextFrame = motionDeckFrames[frameIndex + 1];
  const currentNote = selectSessionNote(notesSession, frame.id);
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

  const handleSave = useCallback(async () => {
    if (notesSession.phase === "saving" || !notesSession.isDirty) {
      return;
    }

    dispatchNotes({ type: "save-start" });

    try {
      await savePresentationSpeakerNotes(notesSession.document);
      dispatchNotes({
        type: "save-success",
        fileName: presentationSpeakerNotesFileName,
        message: "Saved speaker notes to this presentation.",
      });
    } catch (error) {
      dispatchNotes({ type: "save-failure", message: getErrorMessage(error) });
    }
  }, [notesSession.document, notesSession.isDirty, notesSession.phase]);

  const updateCurrentNote = (note: SpeakerNote) => {
    dispatchNotes({ type: "edit-note", frameId: frame.id, note });
  };

  useEffect(() => {
    const clockTimer = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => window.clearInterval(clockTimer);
  }, []);

  useEffect(() => {
    writeNotesTextSize(getPresenterPreferenceStorage(), notesTextSize);
  }, [notesTextSize]);

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

  return (
    <main className="presenter-view-root">
      <header className="presenter-view-header">
        <section aria-label="Presentation timing" className="presenter-timing">
          <output className="presenter-elapsed-time" data-timer-status={timer.status}>
            {elapsedTime}
          </output>
          <div className="presenter-timer-actions">
            <button
              aria-label={timerAction}
              className="presenter-timer-icon-control"
              onClick={handleTimerAction}
              title={timerAction}
              type="button"
            >
              {timer.status === "running" ? (
                <svg
                  aria-hidden="true"
                  height="24"
                  viewBox="0 0 24 24"
                  width="24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4 4V20H9V4H4Z"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="square"
                    strokeWidth="2"
                  />
                  <path
                    d="M15 4V20H20V4H15Z"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="square"
                    strokeWidth="2"
                  />
                </svg>
              ) : (
                <svg
                  aria-hidden="true"
                  height="24"
                  viewBox="0 0 24 24"
                  width="24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6 4V20L20 12L6 4Z"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="square"
                    strokeWidth="2"
                  />
                </svg>
              )}
            </button>
            <button
              aria-label="Reset timer"
              className="presenter-timer-icon-control"
              disabled={timer.status === "idle"}
              onClick={() => {
                dispatchTimer({ type: "reset" });
                setNow(Date.now());
              }}
              title="Reset timer"
              type="button"
            >
              <svg
                aria-hidden="true"
                height="24"
                viewBox="0 0 24 24"
                width="24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 15.5L2.5 19L6 22.5"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="square"
                  strokeMiterlimit="10"
                  strokeWidth="2"
                />
                <path
                  d="M18 8.5L21.5 5L18 1.5"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="square"
                  strokeMiterlimit="10"
                  strokeWidth="2"
                />
                <path d="M22 20H2.5V18H20V11.7402L22 9.74023V20Z" fill="currentColor" />
                <path d="M21.5 6H4V12.2617L2 14.2617V4H21.5V6Z" fill="currentColor" />
              </svg>
            </button>
          </div>
          <span className="presenter-frame-position">
            {frameIndex + 1} / {motionDeckFrames.length}
          </span>
        </section>
        <div className="presenter-view-header__status">
          <div className="presenter-view-header__presentation-actions">
            <span
              aria-live="polite"
              className="presenter-audience-status"
              data-blackout={isAudienceBlackout ? "active" : "inactive"}
              data-status={audienceStatus}
            >
              <strong>{audienceStatusContent.label}</strong>
            </span>
            <button
              aria-label={isAudienceBlackout ? "Restore audience" : "Black out audience"}
              aria-keyshortcuts="B"
              aria-pressed={isAudienceBlackout}
              className="presenter-blackout-control"
              data-active={isAudienceBlackout}
              disabled={!canToggleAudienceBlackout}
              onClick={onToggleAudienceBlackout}
              title={isAudienceBlackout ? "Restore audience (B)" : "Black out audience (B)"}
              type="button"
            >
              {isAudienceBlackout ? (
                <svg
                  aria-hidden="true"
                  height="24"
                  viewBox="0 0 24 24"
                  width="24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 17.6434L9.543 14.3559L9.45966 14.8559"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="square"
                    strokeWidth="2"
                  />
                  <path
                    d="M15 17.6434L14.438 14.3642L14.5213 14.8642"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="square"
                    strokeWidth="2"
                  />
                  <path
                    d="M3.5 15.1434L5.5 12.6434L5.21282 13.0024"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="square"
                    strokeWidth="2"
                  />
                  <path
                    d="M20.5 15.1434L18.5 12.6434L18.7872 13.0024"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="square"
                    strokeWidth="2"
                  />
                  <path
                    d="M22 8.99997C20.4711 11.0353 17.0488 14.6434 12 14.6434C6.95123 14.6434 3.52892 11.0353 2 8.99997"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="square"
                    strokeMiterlimit="10"
                    strokeWidth="2"
                  />
                </svg>
              ) : (
                <svg
                  aria-hidden="true"
                  height="24"
                  viewBox="0 0 24 24"
                  width="24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 4L9.55078 7.30907L9.46745 6.80907"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="square"
                    strokeWidth="2"
                  />
                  <path
                    d="M15 4L14.442 7.29696L14.5253 6.79696"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="square"
                    strokeWidth="2"
                  />
                  <path
                    d="M3.5 6.5L5.5 9L5.21282 8.64102"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="square"
                    strokeWidth="2"
                  />
                  <path
                    d="M20.5 6.5L18.5 9L18.7872 8.64102"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="square"
                    strokeWidth="2"
                  />
                  <path
                    d="M22 12.6435C20.4711 10.6081 17.0488 7 12 7C6.95123 7 3.52892 10.6081 2 12.6435"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="square"
                    strokeMiterlimit="10"
                    strokeWidth="2"
                  />
                  <path
                    d="M15.5 14.5C15.5 16.433 13.933 18 12 18C10.067 18 8.5 16.433 8.5 14.5C8.5 12.567 10.067 11 12 11C13.933 11 15.5 12.567 15.5 14.5Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              )}
            </button>
            <button
              aria-label={audienceStatusContent.action}
              className="presenter-audience-display-control"
              onClick={onOpenAudience}
              title={audienceStatusContent.action}
              type="button"
            >
              <svg
                aria-hidden="true"
                height="24"
                viewBox="0 0 24 24"
                width="24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22 16L22 4L2 4L2 16L22 16Z"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="square"
                  strokeMiterlimit="10"
                  strokeWidth="2"
                />
                <path
                  d="M17 21H17.01"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="square"
                  strokeWidth="2"
                />
                <path
                  d="M7 21H7.01"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="square"
                  strokeWidth="2"
                />
                <path
                  d="M12 21H12.01"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="square"
                  strokeWidth="3"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div className="presenter-view-workspace">
        <section aria-label="Slide previews" className="presenter-preview-column">
          <div className="presenter-preview-card presenter-preview-card--current">
            <div className="presenter-stage-shell">
              <MotionStage
                direction={direction}
                frame={frame}
                isGridVisible={isGridVisible}
                interactionState={interactionState}
                mode="presenter"
                onAdvance={onNext}
                onPortalMaskRect={onPortalMaskRect}
                onInteractionState={onInteractionState}
                onTileRevealState={onTileRevealState}
                tileRevealState={tileRevealStates[frame.id]}
                portalMaskRect={portalMaskRect}
              />
            </div>
          </div>

          <div className="presenter-preview-footer">
            <div className="presenter-preview-card presenter-preview-card--next">
              {nextFrame ? (
                <div
                  aria-label={`Advance to ${nextFrame.label}`}
                  className="presenter-stage-shell presenter-stage-shell--next"
                  onClick={onNext}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onNext();
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <MotionStage
                    direction={1}
                    frame={nextFrame}
                    isGridVisible={false}
                    interactionState={interactionState}
                    mode="preview"
                    portalMaskRect={portalMaskRect}
                    tileRevealState={tileRevealStates[nextFrame.id]}
                  />
                </div>
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
          <div className="presenter-notes-editor">
            <textarea
              aria-label="Speaker notes"
              onChange={(event) => updateCurrentNote({
                ...currentNote,
                body: event.target.value,
              })}
              placeholder="Add what you want to say for this frame…"
              value={currentNote.body}
            />
          </div>

          <div className="presenter-notes-panel__footer">
            <div className="presenter-notes-text-size">
              <NumberField.Root
                className="presenter-notes-text-size__field"
                max={notesTextSizeOptions.at(-1)}
                min={notesTextSizeOptions[0]}
                onValueChange={(value) => {
                  if (value !== null) {
                    setNotesTextSize(value);
                  }
                }}
                snapOnStep
                step={2}
                value={notesTextSize}
              >
                <NumberField.Group className="presenter-notes-text-size__group">
                  <NumberField.Decrement
                    aria-label="Decrease notes text size"
                    className="presenter-notes-text-size__stepper"
                  >
                    <svg
                      aria-hidden="true"
                      height="24"
                      viewBox="0 0 24 24"
                      width="24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M3 12L21 12"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="square"
                        strokeWidth="2"
                      />
                    </svg>
                  </NumberField.Decrement>
                  <NumberField.Input
                    aria-label="Notes text size in pixels"
                    className="presenter-notes-text-size__input"
                  />
                  <NumberField.Increment
                    aria-label="Increase notes text size"
                    className="presenter-notes-text-size__stepper"
                  >
                    <svg
                      aria-hidden="true"
                      height="24"
                      viewBox="0 0 24 24"
                      width="24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M3 12H21"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="square"
                        strokeMiterlimit="10"
                        strokeWidth="2"
                      />
                      <path
                        d="M12 3V21"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="square"
                        strokeMiterlimit="10"
                        strokeWidth="2"
                      />
                    </svg>
                  </NumberField.Increment>
                </NumberField.Group>
              </NumberField.Root>
            </div>
            <div className="presenter-notes-file-actions">
              <button
                className="presenter-button--primary"
                disabled={!notesSession.isDirty || notesSession.phase === "saving"}
                onClick={() => void handleSave()}
                type="button"
              >
                Save changes
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function createInitialPresentationNotesSession() {
  const initialState = createInitialNotesSessionState();

  return notesSessionReducer(initialState, {
    type: "replace-document",
    document: getPresentationSpeakerNotes(),
    fileName: presentationSpeakerNotesFileName,
    persisted: true,
  });
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Speaker notes could not be saved.";
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
          label: "Audience display opening",
        };
      case "connected":
        return {
          action: "Refresh audience display",
          label: "Audience display connected",
        };
      case "disconnected":
        return {
          action: "Reconnect audience display",
          label: "Audience display disconnected",
        };
      case "popup-blocked":
        return {
          action: "Try opening again",
          label: "Audience display blocked",
        };
      case "closed":
        return {
          action: "Open audience display",
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
  };
}
