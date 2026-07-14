export type DeckDirection = -1 | 1;

export type DeckNavigationState = {
  direction: DeckDirection;
  frameIndex: number;
};

export type KeyboardNavigationIntent = "next" | "previous" | "toggle-grid";

export type SwipePoint = {
  x: number;
  y: number;
};

const nextFrameKeys = new Set(["ArrowRight", "ArrowDown", "PageDown", " ", "Spacebar", "Enter", "n", "N"]);
const nextFrameCodes = new Set(["ArrowRight", "ArrowDown", "PageDown", "Space", "Enter", "KeyN", "NumpadEnter"]);
const previousFrameKeys = new Set(["ArrowLeft", "ArrowUp", "PageUp", "Backspace", "p", "P"]);
const previousFrameCodes = new Set(["ArrowLeft", "ArrowUp", "PageUp", "Backspace", "KeyP"]);
const swipeDistanceThreshold = 48;
const swipeAxisRatio = 1.25;

export function getInitialDeckNavigationState(hash: string, frameCount: number): DeckNavigationState {
  return {
    direction: 1,
    frameIndex: getFrameIndexFromHash(hash, frameCount),
  };
}

export function resolveFrameNavigation(
  currentState: DeckNavigationState,
  targetIndex: number,
  frameCount: number,
): { didChange: boolean; state: DeckNavigationState } {
  const frameIndex = clampFrameIndex(targetIndex, frameCount);

  if (frameIndex === currentState.frameIndex) {
    return { didChange: false, state: currentState };
  }

  return {
    didChange: true,
    state: {
      direction: frameIndex > currentState.frameIndex ? 1 : -1,
      frameIndex,
    },
  };
}

export function getFrameIndexFromHash(hash: string, frameCount: number) {
  const match = hash.match(/^#\/?motion-deck\/(\d+)$/) ?? hash.match(/^#\/?(\d+)$/);
  const parsedIndex = match ? Number.parseInt(match[1], 10) - 1 : 0;

  return clampFrameIndex(parsedIndex, frameCount);
}

export function createFrameHash(frameIndex: number, frameCount: number) {
  return `#/${clampFrameIndex(frameIndex, frameCount) + 1}`;
}

export function clampFrameIndex(index: number, frameCount: number) {
  const lastFrameIndex = Math.max(0, frameCount - 1);

  if (!Number.isFinite(index)) {
    return 0;
  }

  return Math.min(lastFrameIndex, Math.max(0, index));
}

export function getKeyboardNavigationIntent(event: Pick<KeyboardEvent, "code" | "key" | "shiftKey">): KeyboardNavigationIntent | undefined {
  if (event.shiftKey && (event.key.toLowerCase() === "g" || event.code === "KeyG")) {
    return "toggle-grid";
  }

  if (nextFrameKeys.has(event.key) || nextFrameCodes.has(event.code)) {
    return "next";
  }

  if (previousFrameKeys.has(event.key) || previousFrameCodes.has(event.code)) {
    return "previous";
  }

  return undefined;
}

export function shouldToggleAudienceBlackout(
  event: Pick<KeyboardEvent, "altKey" | "code" | "ctrlKey" | "key" | "metaKey" | "repeat">,
  isEditableTarget: boolean,
) {
  if (
    isEditableTarget ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    event.repeat
  ) {
    return false;
  }

  return event.key.toLowerCase() === "b" || event.code === "KeyB";
}

export function getSwipeNavigationIntent(start: SwipePoint, end: SwipePoint): Exclude<KeyboardNavigationIntent, "toggle-grid"> | undefined {
  const deltaX = end.x - start.x;
  const deltaY = end.y - start.y;

  if (Math.abs(deltaX) < swipeDistanceThreshold || Math.abs(deltaX) < Math.abs(deltaY) * swipeAxisRatio) {
    return undefined;
  }

  return deltaX < 0 ? "next" : "previous";
}
