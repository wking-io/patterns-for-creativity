import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MotionConfig } from "motion/react";
import { motionDeckFrames } from "./frames";
import { MotionStage } from "./MotionStage";
import { PresenterView } from "./PresenterView";
import {
  createAudienceDisplayUrl,
  createPresentationFrameMessage,
  getDeckViewMode,
  parsePresentationFrameMessage,
  presentationChannelName,
} from "./presentation-sync";
import {
  createFrameHash,
  getFrameIndexFromHash,
  getInitialDeckNavigationState,
  getKeyboardNavigationIntent,
  getSwipeNavigationIntent,
  resolveFrameNavigation,
} from "./navigation";
import "./styles.css";

const frameCount = motionDeckFrames.length;

export function MotionDeckApp() {
  const [{ direction, frameIndex }, setNavigation] = useState(() => (
    getInitialDeckNavigationState(window.location.hash, frameCount)
  ));
  const [isGridVisible, setIsGridVisible] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number } | undefined>(undefined);
  const syncChannelRef = useRef<BroadcastChannel | undefined>(undefined);
  const frame = motionDeckFrames[frameIndex] ?? motionDeckFrames[0];
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

  const controls = useMemo(() => ({
    goNext: () => goToFrame(frameIndex + 1),
    goPrevious: () => goToFrame(frameIndex - 1),
  }), [frameIndex, goToFrame]);

  const openAudienceDisplay = useCallback(() => {
    const audienceUrl = createAudienceDisplayUrl(
      window.location.href,
      frameIndex,
      frameCount,
    );

    window.open(
      audienceUrl,
      "patterns-for-creativity-audience",
      "popup=yes,width=1280,height=720",
    );
  }, [frameIndex]);

  useEffect(() => {
    if (viewMode === "deck" || typeof BroadcastChannel === "undefined") {
      return undefined;
    }

    const channel = new BroadcastChannel(presentationChannelName);
    syncChannelRef.current = channel;

    if (viewMode === "audience") {
      const handlePresentationMessage = (event: MessageEvent<unknown>) => {
        const message = parsePresentationFrameMessage(event.data, frameCount);

        if (!message) {
          return;
        }

        setNavigation((currentState) => {
          if (
            currentState.frameIndex === message.frameIndex &&
            currentState.direction === message.direction
          ) {
            return currentState;
          }

          writeFrameHash(message.frameIndex, "replace");
          return {
            direction: message.direction,
            frameIndex: message.frameIndex,
          };
        });
      };

      channel.addEventListener("message", handlePresentationMessage);

      return () => {
        channel.removeEventListener("message", handlePresentationMessage);
        channel.close();
        syncChannelRef.current = undefined;
      };
    }

    return () => {
      channel.close();
      syncChannelRef.current = undefined;
    };
  }, [viewMode]);

  useEffect(() => {
    if (viewMode !== "presenter") {
      return;
    }

    syncChannelRef.current?.postMessage(
      createPresentationFrameMessage(frameIndex, direction),
    );
  }, [direction, frameIndex, viewMode]);

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
      if (isEditableTarget(event.target)) {
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
  }, [controls, isAudienceView]);

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
          direction={direction}
          frameIndex={frameIndex}
          isGridVisible={isGridVisible}
          onNext={controls.goNext}
          onOpenAudience={openAudienceDisplay}
          onPrevious={controls.goPrevious}
        />
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
              onAdvance={isAudienceView ? undefined : controls.goNext}
            />
          </div>
        </main>
      )}
    </MotionConfig>
  );
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
