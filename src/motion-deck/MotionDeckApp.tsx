import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MotionConfig } from "motion/react";
import { motionDeckFrames } from "./frames";
import { MotionStage } from "./MotionStage";
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
  const frame = motionDeckFrames[frameIndex] ?? motionDeckFrames[0];

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
  }, [controls]);

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
      <main
        className="motion-deck-root"
        onTouchEnd={handleTouchEnd}
        onTouchStart={handleTouchStart}
      >
        <div className="motion-deck-viewport">
          <MotionStage direction={direction} frame={frame} isGridVisible={isGridVisible} />
        </div>
      </main>
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
