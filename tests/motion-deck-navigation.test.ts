import assert from "node:assert/strict";
import {
  clampFrameIndex,
  createFrameHash,
  getFrameIndexFromHash,
  getInitialDeckNavigationState,
  getKeyboardNavigationIntent,
  getSwipeNavigationIntent,
  resolveFrameNavigation,
  shouldToggleAudienceBlackout,
} from "../src/motion-deck/navigation.js";

const frameCount = 15;

assert.equal(clampFrameIndex(Number.NaN, frameCount), 0);
assert.equal(clampFrameIndex(-1, frameCount), 0);
assert.equal(clampFrameIndex(99, frameCount), 14);
assert.equal(clampFrameIndex(1, frameCount), 1);

assert.equal(getFrameIndexFromHash("", frameCount), 0);
assert.equal(getFrameIndexFromHash("#/2", frameCount), 1);
assert.equal(getFrameIndexFromHash("#2", frameCount), 1);
assert.equal(getFrameIndexFromHash("#/motion-deck/3", frameCount), 2);
assert.equal(getFrameIndexFromHash("#/motion-deck/99", frameCount), 14);
assert.equal(getFrameIndexFromHash("#/other/2", frameCount), 0);

assert.deepEqual(getInitialDeckNavigationState("#/2", frameCount), { direction: 1, frameIndex: 1 });
assert.equal(createFrameHash(1, frameCount), "#/2");
assert.equal(createFrameHash(99, frameCount), "#/15");

assert.deepEqual(
  resolveFrameNavigation({ direction: 1, frameIndex: 0 }, 2, frameCount),
  { didChange: true, state: { direction: 1, frameIndex: 2 } },
);
assert.deepEqual(
  resolveFrameNavigation({ direction: 1, frameIndex: 2 }, 0, frameCount),
  { didChange: true, state: { direction: -1, frameIndex: 0 } },
);
assert.deepEqual(
  resolveFrameNavigation({ direction: -1, frameIndex: 1 }, 1, frameCount),
  { didChange: false, state: { direction: -1, frameIndex: 1 } },
);

assert.equal(getKeyboardNavigationIntent({ code: "ArrowRight", key: "ArrowRight", shiftKey: false }), "next");
assert.equal(getKeyboardNavigationIntent({ code: "KeyP", key: "p", shiftKey: false }), "previous");
assert.equal(getKeyboardNavigationIntent({ code: "KeyG", key: "G", shiftKey: true }), "toggle-grid");
assert.equal(getKeyboardNavigationIntent({ code: "KeyX", key: "x", shiftKey: false }), undefined);

const blackoutKey = {
  altKey: false,
  code: "KeyB",
  ctrlKey: false,
  key: "b",
  metaKey: false,
  repeat: false,
};
assert.equal(shouldToggleAudienceBlackout(blackoutKey, false), true);
assert.equal(
  shouldToggleAudienceBlackout(blackoutKey, true),
  false,
  "typing B in an editable notes field does not toggle blackout",
);
assert.equal(shouldToggleAudienceBlackout({ ...blackoutKey, repeat: true }, false), false);
assert.equal(shouldToggleAudienceBlackout({ ...blackoutKey, ctrlKey: true }, false), false);

assert.equal(getSwipeNavigationIntent({ x: 100, y: 10 }, { x: 40, y: 12 }), "next");
assert.equal(getSwipeNavigationIntent({ x: 40, y: 10 }, { x: 100, y: 12 }), "previous");
assert.equal(getSwipeNavigationIntent({ x: 100, y: 10 }, { x: 80, y: 12 }), undefined);
assert.equal(getSwipeNavigationIntent({ x: 100, y: 10 }, { x: 40, y: 90 }), undefined);

console.log("motion deck navigation tests passed");
