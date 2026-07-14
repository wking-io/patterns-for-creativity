import assert from "node:assert/strict";
import {
  createAudienceDisplayUrl,
  createPresentationFrameMessage,
  getDeckViewMode,
  parsePresentationFrameMessage,
} from "../src/motion-deck/presentation-sync.js";
import { getMotionStageBehavior } from "../src/motion-deck/stage-mode.js";

assert.equal(getDeckViewMode(""), "deck");
assert.equal(getDeckViewMode("?view=presenter"), "presenter");
assert.equal(getDeckViewMode("?view=audience"), "audience");
assert.equal(getDeckViewMode("?view=unknown"), "deck");

assert.equal(
  createAudienceDisplayUrl("https://example.test/talk?theme=dark&view=presenter#/3", 4, 29),
  "https://example.test/talk?theme=dark&view=audience#/5",
);

const nextMessage = createPresentationFrameMessage(7, 1);
assert.deepEqual(nextMessage, {
  type: "presentation-frame",
  version: 1,
  direction: 1,
  frameIndex: 7,
});
assert.deepEqual(parsePresentationFrameMessage(nextMessage, 29), nextMessage);

const previousMessage = createPresentationFrameMessage(2, -1);
assert.deepEqual(parsePresentationFrameMessage(previousMessage, 29), previousMessage);
assert.equal(parsePresentationFrameMessage({ ...nextMessage, frameIndex: 29 }, 29), undefined);
assert.equal(parsePresentationFrameMessage({ ...nextMessage, direction: 0 }, 29), undefined);
assert.equal(parsePresentationFrameMessage({ ...nextMessage, version: 2 }, 29), undefined);
assert.equal(parsePresentationFrameMessage("not a message", 29), undefined);

assert.deepEqual(getMotionStageBehavior("audience"), {
  animateContent: true,
  animateLayout: true,
  autoAdvance: false,
  autoplayMedia: true,
});
assert.equal(getMotionStageBehavior("live").autoAdvance, true);
assert.equal(getMotionStageBehavior("audience").autoAdvance, false);
assert.equal(getMotionStageBehavior("preview").autoAdvance, false);

console.log("presentation sync tests passed");
