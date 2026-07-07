import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MotionConfig } from "motion/react";
import { motionDeckFrames } from "./frames";
import { MotionStage } from "./MotionStage";
import "./styles.css";

const firstFrameIndex = 0;
const lastFrameIndex = motionDeckFrames.length - 1;
const nextFrameKeys = new Set(["ArrowRight", "ArrowDown", "PageDown", " ", "Spacebar", "Enter", "n", "N"]);
const nextFrameCodes = new Set(["ArrowRight", "ArrowDown", "PageDown", "Space", "Enter", "KeyN", "NumpadEnter"]);
const previousFrameKeys = new Set(["ArrowLeft", "ArrowUp", "PageUp", "Backspace", "p", "P"]);
const previousFrameCodes = new Set(["ArrowLeft", "ArrowUp", "PageUp", "Backspace", "KeyP"]);

export function MotionDeckApp() {
  const [frameIndex, setFrameIndex] = useState(() => getFrameIndexFromHash());
  const [direction, setDirection] = useState(1);
  const touchStartRef = useRef<{ x: number; y: number } | undefined>(undefined);
  const frame = motionDeckFrames[frameIndex] ?? motionDeckFrames[firstFrameIndex];

  const goToFrame = useCallback((nextIndex: number) => {
    setFrameIndex((currentIndex) => {
      const clampedIndex = clampFrameIndex(nextIndex);

      if (clampedIndex === currentIndex) {
        return currentIndex;
      }

      setDirection(clampedIndex > currentIndex ? 1 : -1);
      writeFrameHash(clampedIndex);
      return clampedIndex;
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
      setFrameIndex((currentIndex) => {
        const nextIndex = getFrameIndexFromHash();

        if (nextIndex === currentIndex) {
          return currentIndex;
        }

        setDirection(nextIndex > currentIndex ? 1 : -1);
        return nextIndex;
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

      if (nextFrameKeys.has(event.key) || nextFrameCodes.has(event.code)) {
        event.preventDefault();
        controls.goNext();
      }

      if (previousFrameKeys.has(event.key) || previousFrameCodes.has(event.code)) {
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

    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;

    if (Math.abs(deltaX) < 48 || Math.abs(deltaX) < Math.abs(deltaY) * 1.25) {
      return;
    }

    if (deltaX < 0) {
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
          <MotionStage direction={direction} frame={frame} />
        </div>
      </main>
    </MotionConfig>
  );
}

function getFrameIndexFromHash() {
  const hash = window.location.hash;
  const match = hash.match(/motion-deck\/(\d+)/) ?? hash.match(/^#\/?(\d+)$/);
  const parsedIndex = match ? Number.parseInt(match[1], 10) - 1 : firstFrameIndex;

  return clampFrameIndex(parsedIndex);
}

function writeFrameHash(frameIndex: number, mode: "push" | "replace" = "push") {
  const nextHash = `#/motion-deck/${frameIndex + 1}`;

  if (window.location.hash === nextHash) {
    return;
  }

  if (mode === "replace") {
    window.history.replaceState(null, "", nextHash);
    return;
  }

  window.history.pushState(null, "", nextHash);
}

function clampFrameIndex(index: number) {
  if (!Number.isFinite(index)) {
    return firstFrameIndex;
  }

  return Math.min(lastFrameIndex, Math.max(firstFrameIndex, index));
}

function isEditableTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement ||
    (target instanceof HTMLElement && target.isContentEditable)
  );
}
