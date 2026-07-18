import { useEffect, useMemo, useRef, useState } from "react";
import type { DragEvent } from "react";
import { motionDeckFrames } from "./frames";
import { MotionStage } from "./MotionStage";
import {
  countMovedFrameIds,
  createSlideOrderRequest,
  formatSlideOrderRequestForCodex,
  moveFrameId,
  reorderFrameIds,
} from "./slide-order";
import type { SlideOrderDropEdge } from "./slide-order";
import "./organizer.css";

const initialFrameIds = motionDeckFrames.map((frame) => frame.id);
const framesById = new Map(motionDeckFrames.map((frame) => [frame.id, frame]));

type DropTarget = {
  edge: SlideOrderDropEdge;
  frameId: string;
};

export function SlideOrganizer() {
  const [frameIds, setFrameIds] = useState(initialFrameIds);
  const [draggedFrameId, setDraggedFrameId] = useState<string>();
  const [dropTarget, setDropTarget] = useState<DropTarget>();
  const [copyStatus, setCopyStatus] = useState<string>();
  const movedFrameCount = countMovedFrameIds(frameIds, initialFrameIds);
  const hasChanges = movedFrameCount > 0;

  const frames = useMemo(() => frameIds.map((frameId) => {
    const frame = framesById.get(frameId);

    if (!frame) {
      throw new Error(`Unknown motion deck frame: ${frameId}`);
    }

    return frame;
  }), [frameIds]);

  const moveFrame = (frameId: string, offset: -1 | 1) => {
    setFrameIds((currentFrameIds) => moveFrameId(currentFrameIds, frameId, offset));
    setCopyStatus(undefined);
  };

  const handleDragStart = (event: DragEvent<HTMLElement>, frameId: string) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", frameId);
    setDraggedFrameId(frameId);
    setCopyStatus(undefined);
  };

  const handleDragOver = (event: DragEvent<HTMLElement>, frameId: string) => {
    if (draggedFrameId === frameId) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    const bounds = event.currentTarget.getBoundingClientRect();
    const edge = event.clientY < bounds.top + bounds.height / 2 ? "before" : "after";

    setDropTarget((currentTarget) => (
      currentTarget?.frameId === frameId && currentTarget.edge === edge
        ? currentTarget
        : { edge, frameId }
    ));
  };

  const handleDrop = (event: DragEvent<HTMLElement>, frameId: string) => {
    event.preventDefault();
    const sourceFrameId = draggedFrameId || event.dataTransfer.getData("text/plain");
    const bounds = event.currentTarget.getBoundingClientRect();
    const edge = event.clientY < bounds.top + bounds.height / 2 ? "before" : "after";

    if (sourceFrameId) {
      setFrameIds((currentFrameIds) => (
        reorderFrameIds(currentFrameIds, sourceFrameId, frameId, edge)
      ));
    }

    setDraggedFrameId(undefined);
    setDropTarget(undefined);
  };

  const handleCopyForCodex = async () => {
    const request = createSlideOrderRequest(frameIds);
    const requestText = formatSlideOrderRequestForCodex(request);

    try {
      await copyText(requestText);
      setCopyStatus("Copied. Paste the reorder request into your Codex thread.");
    } catch {
      setCopyStatus("Could not access the clipboard. Select and copy the request below.");
    }
  };

  const requestPreview = hasChanges
    ? formatSlideOrderRequestForCodex(createSlideOrderRequest(frameIds, "<generated when copied>"))
    : "Drag a slide to create a reorder request.";

  return (
    <main className="slide-organizer-root">
      <header className="slide-organizer-header">
        <div>
          <p className="slide-organizer-eyebrow">One-off deck tool</p>
          <h1>Organize slides</h1>
          <p className="slide-organizer-intro">
            Drag thumbnails into sequence. When the order feels right, copy a precise request for
            Codex to apply to the source deck.
          </p>
        </div>

        <div className="slide-organizer-actions">
          <div className="slide-organizer-change-count" aria-live="polite">
            <strong>{frameIds.length}</strong> slides
            <span>{hasChanges ? `${movedFrameCount} positions changed` : "Original order"}</span>
          </div>
          <button
            className="slide-organizer-button"
            disabled={!hasChanges}
            onClick={() => {
              setFrameIds(initialFrameIds);
              setCopyStatus(undefined);
            }}
            type="button"
          >
            Reset
          </button>
          <button
            className="slide-organizer-button slide-organizer-button--primary"
            disabled={!hasChanges}
            onClick={() => void handleCopyForCodex()}
            type="button"
          >
            Copy for Codex
          </button>
        </div>
      </header>

      <section aria-label="Slides in presentation order" className="slide-organizer-grid">
        {frames.map((frame, index) => {
          const targetEdge = dropTarget?.frameId === frame.id ? dropTarget.edge : undefined;

          return (
            <article
              className="slide-organizer-card"
              data-dragging={draggedFrameId === frame.id ? "true" : "false"}
              data-drop-edge={targetEdge}
              key={frame.id}
              onDragOver={(event) => handleDragOver(event, frame.id)}
              onDrop={(event) => handleDrop(event, frame.id)}
            >
              <div className="slide-organizer-thumbnail">
                <LazySlideThumbnail frameId={frame.id} />
                <span className="slide-organizer-number">{index + 1}</span>
              </div>

              <div className="slide-organizer-card-footer">
                <span
                  aria-label={`Drag ${frame.label}`}
                  className="slide-organizer-drag-handle"
                  draggable
                  onDragEnd={() => {
                    setDraggedFrameId(undefined);
                    setDropTarget(undefined);
                  }}
                  onDragStart={(event) => handleDragStart(event, frame.id)}
                  role="button"
                  tabIndex={0}
                  title="Drag to reorder"
                >
                  <span aria-hidden="true">⠿</span>
                </span>
                <span className="slide-organizer-card-title">
                  <strong>{frame.label}</strong>
                  <code>{frame.id}</code>
                </span>
                <span className="slide-organizer-nudge-actions">
                  <button
                    aria-label={`Move ${frame.label} earlier`}
                    disabled={index === 0}
                    onClick={() => moveFrame(frame.id, -1)}
                    title="Move earlier"
                    type="button"
                  >
                    ↑
                  </button>
                  <button
                    aria-label={`Move ${frame.label} later`}
                    disabled={index === frames.length - 1}
                    onClick={() => moveFrame(frame.id, 1)}
                    title="Move later"
                    type="button"
                  >
                    ↓
                  </button>
                </span>
              </div>
            </article>
          );
        })}
      </section>

      <footer className="slide-organizer-handoff">
        <div>
          <p className="slide-organizer-eyebrow">Code handoff</p>
          <h2>Nothing changes in the deck until Codex applies this order.</h2>
          <p aria-live="polite">{copyStatus ?? "Use “Copy for Codex,” then paste into this thread."}</p>
        </div>
        <details>
          <summary>Preview request</summary>
          <pre>{requestPreview}</pre>
        </details>
      </footer>
    </main>
  );
}

function LazySlideThumbnail({ frameId }: { frameId: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldRender, setShouldRender] = useState(() => (
    typeof IntersectionObserver === "undefined"
  ));

  useEffect(() => {
    if (shouldRender) {
      return undefined;
    }

    const container = containerRef.current;

    if (!container) {
      return undefined;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) {
        return;
      }

      setShouldRender(true);
      observer.disconnect();
    }, { rootMargin: "600px 0px" });

    observer.observe(container);
    return () => observer.disconnect();
  }, [shouldRender]);

  const frame = framesById.get(frameId);

  return (
    <div className="slide-organizer-stage-shell" ref={containerRef}>
      {shouldRender && frame ? (
        <MotionStage
          direction={1}
          frame={frame}
          isGridVisible={false}
          mode="preview"
        />
      ) : (
        <div className="slide-organizer-thumbnail-placeholder" />
      )}
    </div>
  );
}

async function copyText(text: string) {
  if (copyTextWithSelection(text)) {
    return;
  }

  if (navigator.clipboard?.writeText) {
    await Promise.race([
      navigator.clipboard.writeText(text),
      new Promise<never>((_resolve, reject) => {
        window.setTimeout(() => reject(new Error("Clipboard timed out")), 1_500);
      }),
    ]);
    return;
  }

  throw new Error("Clipboard unavailable");
}

function copyTextWithSelection(text: string) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.append(textarea);
  textarea.select();
  const didCopy = document.execCommand("copy");
  textarea.remove();
  return didCopy;
}
