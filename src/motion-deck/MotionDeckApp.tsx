import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MotionConfig } from "motion/react";
import { motionDeckFrames } from "./frames";
import { MotionStage } from "./MotionStage";
import { PresenterView } from "./PresenterView";
import {
  createDefaultTileRevealState,
  getDeckViewMode,
} from "./presentation-sync";
import type {
  PortalMaskRect,
  PresentationInteractionMessage,
  PresentationInteractionState,
  PresentationPortalMaskMessage,
  PresentationTileRevealMessage,
  TileRevealState,
} from "./presentation-sync";
import { usePresentationSession } from "./usePresentationSession";
import {
  createFrameHash,
  getFrameIndexFromHash,
  getInitialDeckNavigationState,
  getKeyboardNavigationIntent,
  getSwipeNavigationIntent,
  resolveFrameNavigation,
  shouldToggleAudienceBlackout,
} from "./navigation";
import "./styles.css";

const frameCount = motionDeckFrames.length;

export function MotionDeckApp() {
  const [{ direction, frameIndex }, setNavigation] = useState(() => (
    getInitialDeckNavigationState(window.location.hash, frameCount)
  ));
  const [isGridVisible, setIsGridVisible] = useState(false);
  const [tileRevealStates, setTileRevealStates] = useState<
    Record<string, TileRevealState>
  >(
    createInitialTileRevealStates,
  );
  const [portalMaskRect, setPortalMaskRect] = useState<PortalMaskRect>();
  const [interactionState, setInteractionState] = useState<PresentationInteractionState>();
  const touchStartRef = useRef<{ x: number; y: number } | undefined>(undefined);
  const frame = motionDeckFrames[frameIndex] ?? motionDeckFrames[0];
  const tileRevealState = tileRevealStates[frame.id];
  const viewMode = getDeckViewMode(window.location.search);
  const isPresenterView = viewMode === "presenter";
  const isAudienceView = viewMode === "audience";

  const goToFrame = useCallback((nextIndex: number) => {
    setNavigation((currentState) => {
      const nextNavigation = resolveFrameNavigation(currentState, nextIndex, frameCount);

      if (!nextNavigation.didChange) {
        return currentState;
      }

      writeFrameHash(nextNavigation.state.frameIndex);
      return nextNavigation.state;
    });
  }, []);

  const applyAudienceState = useCallback((message: {
    direction: -1 | 1;
    frameIndex: number;
  }) => {
    writeFrameHash(message.frameIndex, "replace");
    setNavigation({
      direction: message.direction,
      frameIndex: message.frameIndex,
    });
  }, []);

  const applyAudienceTileRevealState = useCallback((
    message: PresentationTileRevealMessage,
  ) => {
    setTileRevealStates((current) => ({
      ...current,
      [message.frameId]: message.state,
    }));
  }, []);

  const applyAudiencePortalMaskState = useCallback((message: PresentationPortalMaskMessage) => {
    setPortalMaskRect(message.rect);
  }, []);

  const applyAudienceInteractionState = useCallback((message: PresentationInteractionMessage) => {
    setInteractionState(message.state);
  }, []);

  const {
    audienceStatus,
    broadcastInteractionState,
    broadcastPortalMaskRect,
    isAudienceBlackout,
    openAudienceDisplay,
    toggleAudienceBlackout,
  } = usePresentationSession({
    direction,
    frameCount,
    frameIndex,
    interactionState,
    onAudienceInteractionState: applyAudienceInteractionState,
    onAudiencePortalMaskState: applyAudiencePortalMaskState,
    onAudienceState: applyAudienceState,
    onTileRevealState: applyAudienceTileRevealState,
    portalMaskRect,
    tileRevealFrameId: tileRevealState ? frame.id : undefined,
    tileRevealState,
    viewMode,
  });

  const handleTileRevealState = useCallback((
    tileFrameId: string,
    state: TileRevealState,
  ) => {
    setTileRevealStates((current) => ({
      ...current,
      [tileFrameId]: state,
    }));
  }, []);

  const handlePortalMaskRect = useCallback((rect: PortalMaskRect) => {
    setPortalMaskRect(rect);
    broadcastPortalMaskRect(rect);
  }, [broadcastPortalMaskRect]);

  const handleInteractionState = useCallback((state: PresentationInteractionState) => {
    setInteractionState(state);
    broadcastInteractionState(state);
  }, [broadcastInteractionState]);

  const controls = useMemo(() => ({
    goNext: () => goToFrame(frameIndex + 1),
    goPrevious: () => goToFrame(frameIndex - 1),
  }), [frameIndex, goToFrame]);

  useEffect(() => {
    if (!window.location.hash) {
      writeFrameHash(frameIndex, "replace");
    }
  }, [frameIndex]);

  useEffect(() => {
    const handleHashChange = () => {
      setNavigation((currentState) => {
        const nextIndex = getFrameIndexFromHash(window.location.hash, frameCount);
        const nextNavigation = resolveFrameNavigation(currentState, nextIndex, frameCount);

        return nextNavigation.state;
      });
    };

    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  useEffect(() => {
    if (isAudienceView) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      const hasEditableTarget = isEditableTarget(event.target);

      if (
        isPresenterView &&
        shouldToggleAudienceBlackout(event, hasEditableTarget)
      ) {
        event.preventDefault();
        toggleAudienceBlackout();
        return;
      }

      if (hasEditableTarget) {
        return;
      }

      const intent = getKeyboardNavigationIntent(event);

      if (intent === "toggle-grid") {
        event.preventDefault();
        setIsGridVisible((isVisible) => !isVisible);
        return;
      }

      if (intent === "next") {
        event.preventDefault();
        controls.goNext();
        return;
      }

      if (intent === "previous") {
        event.preventDefault();
        controls.goPrevious();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [controls, isAudienceView, isPresenterView, toggleAudienceBlackout]);

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    const touch = event.changedTouches[0];

    if (!touch) {
      return;
    }

    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    const touch = event.changedTouches[0];
    const start = touchStartRef.current;
    touchStartRef.current = undefined;

    if (!touch || !start) {
      return;
    }

    const intent = getSwipeNavigationIntent(start, { x: touch.clientX, y: touch.clientY });

    if (!intent) {
      return;
    }

    if (intent === "next") {
      controls.goNext();
    } else {
      controls.goPrevious();
    }
  };

  return (
    <MotionConfig transition={{ type: "spring", stiffness: 120, damping: 20, mass: 0.95 }}>
      {isPresenterView ? (
        <PresenterView
          audienceStatus={audienceStatus}
          direction={direction}
          frameIndex={frameIndex}
          isAudienceBlackout={isAudienceBlackout}
          isGridVisible={isGridVisible}
          onNext={controls.goNext}
          onOpenAudience={openAudienceDisplay}
          onInteractionState={handleInteractionState}
          onPortalMaskRect={handlePortalMaskRect}
          onTileRevealState={handleTileRevealState}
          onToggleAudienceBlackout={toggleAudienceBlackout}
          portalMaskRect={portalMaskRect}
          interactionState={interactionState}
          tileRevealStates={tileRevealStates}
        />
      ) : isAudienceView && isAudienceBlackout ? (
        <main aria-label="Audience display blacked out" className="audience-blackout" />
      ) : (
        <main
          className="motion-deck-root"
          onTouchEnd={isAudienceView ? undefined : handleTouchEnd}
          onTouchStart={isAudienceView ? undefined : handleTouchStart}
        >
          <div className="motion-deck-viewport">
            <MotionStage
              direction={direction}
              frame={frame}
              isGridVisible={isGridVisible}
              mode={isAudienceView ? "audience" : "live"}
              interactionState={interactionState}
              onAdvance={isAudienceView ? undefined : controls.goNext}
              onPortalMaskRect={isAudienceView ? undefined : handlePortalMaskRect}
              onInteractionState={isAudienceView ? undefined : handleInteractionState}
              onTileRevealState={isAudienceView ? undefined : handleTileRevealState}
              tileRevealState={tileRevealState}
              portalMaskRect={portalMaskRect}
            />
          </div>
        </main>
      )}
    </MotionConfig>
  );
}

function createInitialTileRevealStates() {
  const defaults = createDefaultTileRevealState();

  return motionDeckFrames.reduce<Record<string, TileRevealState>>((states, frame) => {
    if (
      frame.tileRevealRows === undefined &&
      frame.tileRevealColumns === undefined
    ) {
      return states;
    }

    states[frame.id] = {
      rows: frame.tileRevealRows ?? defaults.rows,
      columns: frame.tileRevealColumns ?? defaults.columns,
      removedTileIds: [],
    };
    return states;
  }, {});
}

function writeFrameHash(frameIndex: number, mode: "push" | "replace" = "push") {
  const nextHash = createFrameHash(frameIndex, frameCount);

  if (window.location.hash === nextHash) {
    return;
  }

  if (mode === "replace") {
    window.history.replaceState(null, "", nextHash);
    return;
  }

  window.history.pushState(null, "", nextHash);
}

function isEditableTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement ||
    (target instanceof HTMLElement && target.isContentEditable)
  );
}
