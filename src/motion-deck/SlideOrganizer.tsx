import { useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent } from "react";
import { motionDeckFrames } from "./frames";
import { MotionStage } from "./MotionStage";
import {
  countMovedFrameIds,
  createSlideOrderRequest,
  formatSlideOrderRequestForCodex,
  reorderFrameIdGroup,
} from "./slide-order";
import type { SlideOrderDropEdge } from "./slide-order";
import "./organizer.css";

const initialFrameIds = motionDeckFrames.map((frame) => frame.id);
const framesById = new Map(motionDeckFrames.map((frame) => [frame.id, frame]));

type DropTarget = {
  edge: SlideOrderDropEdge;
  frameId: string;
};

type PointerDrag = {
  frameIds: string[];
  isDragging: boolean;
  pointerId: number;
  sourceFrameId: string;
  startX: number;
  startY: number;
};

const dragStartDistance = 6;

export function SlideOrganizer() {
  const [frameIds, setFrameIds] = useState(initialFrameIds);
  const [draggedFrameIds, setDraggedFrameIds] = useState<string[]>([]);
  const [selectedFrameIds, setSelectedFrameIds] = useState<Set<string>>(() => new Set());
  const [dropTarget, setDropTarget] = useState<DropTarget>();
  const [copyStatus, setCopyStatus] = useState<string>();
  const pointerDragRef = useRef<PointerDrag | undefined>(undefined);
  const dropTargetRef = useRef<DropTarget | undefined>(undefined);
  const selectedFrameIdsRef = useRef(selectedFrameIds);
  const movedFrameCount = countMovedFrameIds(frameIds, initialFrameIds);
  const hasChanges = movedFrameCount > 0;

  const frames = useMemo(() => frameIds.map((frameId) => {
    const frame = framesById.get(frameId);

    if (!frame) {
      throw new Error(`Unknown motion deck frame: ${frameId}`);
    }

    return frame;
  }), [frameIds]);

  const replaceSelection = (nextFrameIds: Iterable<string>) => {
    const nextSelection = new Set(nextFrameIds);
    selectedFrameIdsRef.current = nextSelection;
    setSelectedFrameIds(nextSelection);
  };

  const toggleFrameSelection = (frameId: string) => {
    const nextSelection = new Set(selectedFrameIdsRef.current);

    if (nextSelection.has(frameId)) {
      nextSelection.delete(frameId);
    } else {
      nextSelection.add(frameId);
    }

    replaceSelection(nextSelection);
  };

  const updateDropTarget = (nextTarget: DropTarget | undefined) => {
    dropTargetRef.current = nextTarget;
    setDropTarget(nextTarget);
  };

  const startPointerDrag = (
    event: PointerEvent<HTMLElement>,
    frameId: string,
    allowTouch: boolean,
  ) => {
    if (event.button !== 0 || (!allowTouch && event.pointerType !== "mouse")) {
      return;
    }

    event.preventDefault();
    const isSelected = selectedFrameIdsRef.current.has(frameId);
    pointerDragRef.current = {
      frameIds: isSelected
        ? frameIds.filter((candidateId) => selectedFrameIdsRef.current.has(candidateId))
        : [frameId],
      isDragging: false,
      pointerId: event.pointerId,
      sourceFrameId: frameId,
      startX: event.clientX,
      startY: event.clientY,
    };
  };

  const movePointerDrag = (event: PointerEvent<HTMLElement>) => {
    const pointerDrag = pointerDragRef.current;

    if (!pointerDrag || pointerDrag.pointerId !== event.pointerId) {
      return;
    }

    if (!pointerDrag.isDragging) {
      const distance = Math.hypot(
        event.clientX - pointerDrag.startX,
        event.clientY - pointerDrag.startY,
      );

      if (distance < dragStartDistance) {
        return;
      }

      pointerDrag.isDragging = true;

      if (!selectedFrameIdsRef.current.has(pointerDrag.sourceFrameId)) {
        replaceSelection([pointerDrag.sourceFrameId]);
      }

      setDraggedFrameIds(pointerDrag.frameIds);
      setCopyStatus(undefined);
    }

    event.preventDefault();
    const card = document
      .elementFromPoint(event.clientX, event.clientY)
      ?.closest<HTMLElement>("[data-organizer-frame-id]");
    const targetFrameId = card?.dataset.organizerFrameId;

    if (!card || !targetFrameId || pointerDrag.frameIds.includes(targetFrameId)) {
      updateDropTarget(undefined);
      return;
    }

    const bounds = card.getBoundingClientRect();
    const edge = event.clientY < bounds.top + bounds.height / 2 ? "before" : "after";
    const nextTarget = { edge, frameId: targetFrameId } satisfies DropTarget;

    if (
      dropTargetRef.current?.frameId !== nextTarget.frameId ||
      dropTargetRef.current.edge !== nextTarget.edge
    ) {
      updateDropTarget(nextTarget);
    }
  };

  const finishPointerDrag = (event: PointerEvent<HTMLElement>) => {
    const pointerDrag = pointerDragRef.current;

    if (!pointerDrag || pointerDrag.pointerId !== event.pointerId) {
      return;
    }

    const target = dropTargetRef.current;

    if (pointerDrag.isDragging && target) {
      setFrameIds((currentFrameIds) => (
        reorderFrameIdGroup(
          currentFrameIds,
          pointerDrag.frameIds,
          target.frameId,
          target.edge,
        )
      ));
      replaceSelection([]);
    }

    if (!pointerDrag.isDragging) {
      toggleFrameSelection(pointerDrag.sourceFrameId);
    }

    pointerDragRef.current = undefined;
    setDraggedFrameIds([]);
    updateDropTarget(undefined);
  };

  const cancelPointerDrag = (event: PointerEvent<HTMLElement>) => {
    const pointerDrag = pointerDragRef.current;

    if (!pointerDrag || pointerDrag.pointerId !== event.pointerId) {
      return;
    }

    pointerDragRef.current = undefined;
    setDraggedFrameIds([]);
    updateDropTarget(undefined);
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
    <main
      className="slide-organizer-root"
      onPointerCancel={cancelPointerDrag}
      onPointerMove={movePointerDrag}
      onPointerUp={finishPointerDrag}
    >
      <header className="slide-organizer-header">
        <div>
          <p className="slide-organizer-eyebrow">One-off deck tool</p>
          <h1>Organize slides</h1>
          <p className="slide-organizer-intro">
            Select one or more thumbnails, then drag any selected slide to move the group. When the
            order feels right, copy a precise request for Codex to apply to the source deck.
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
              replaceSelection([]);
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

      <div className="slide-organizer-selection-bar">
        <span aria-live="polite">
          {selectedFrameIds.size === 0
            ? "No slides selected"
            : `${selectedFrameIds.size} slide${selectedFrameIds.size === 1 ? "" : "s"} selected`}
        </span>
        <div>
          <button
            className="slide-organizer-button"
            disabled={selectedFrameIds.size === frameIds.length}
            onClick={() => replaceSelection(frameIds)}
            type="button"
          >
            Select all
          </button>
          <button
            className="slide-organizer-button"
            disabled={selectedFrameIds.size === 0}
            onClick={() => replaceSelection([])}
            type="button"
          >
            Clear selection
          </button>
        </div>
      </div>

      <section aria-label="Slides in presentation order" className="slide-organizer-grid">
        {frames.map((frame, index) => {
          const targetEdge = dropTarget?.frameId === frame.id ? dropTarget.edge : undefined;

          return (
            <article
              className="slide-organizer-card"
              data-dragging={draggedFrameIds.includes(frame.id) ? "true" : "false"}
              data-drop-edge={targetEdge}
              data-organizer-frame-id={frame.id}
              data-selected={selectedFrameIds.has(frame.id) ? "true" : "false"}
              key={frame.id}
            >
              <div
                className="slide-organizer-thumbnail"
                onPointerDown={(event) => startPointerDrag(event, frame.id, false)}
              >
                <LazySlideThumbnail frameId={frame.id} />
                <span className="slide-organizer-number">{index + 1}</span>
                <button
                  aria-label={`${selectedFrameIds.has(frame.id) ? "Deselect" : "Select"} ${frame.label}`}
                  aria-pressed={selectedFrameIds.has(frame.id)}
                  className="slide-organizer-select-control"
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleFrameSelection(frame.id);
                  }}
                  onPointerDown={(event) => event.stopPropagation()}
                  type="button"
                >
                  <span aria-hidden="true">✓</span>
                </button>
              </div>

              <div className="slide-organizer-card-footer">
                <span
                  aria-hidden="true"
                  className="slide-organizer-drag-handle"
                  onPointerDown={(event) => startPointerDrag(event, frame.id, true)}
                  title="Drag to reorder"
                >
                  <span aria-hidden="true">⠿</span>
                </span>
                <span className="slide-organizer-card-title">
                  <strong>{frame.label}</strong>
                  <code>{frame.id}</code>
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
