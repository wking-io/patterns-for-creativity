import assert from "node:assert/strict";
import {
  countMovedFrameIds,
  createSlideOrderRequest,
  formatSlideOrderRequestForCodex,
  moveFrameId,
  reorderFrameIdGroup,
  reorderFrameIds,
} from "../src/motion-deck/slide-order.js";

const original = ["cover", "think", "output", "manufacturing"];

assert.deepEqual(
  reorderFrameIds(original, "manufacturing", "think", "before"),
  ["cover", "manufacturing", "think", "output"],
);
assert.deepEqual(
  reorderFrameIds(original, "cover", "output", "after"),
  ["think", "output", "cover", "manufacturing"],
);
assert.deepEqual(reorderFrameIds(original, "think", "think", "before"), original);
assert.deepEqual(reorderFrameIds(original, "missing", "think", "before"), original);

const groupOriginal = ["cover", "think", "output", "design", "manufacturing"];
assert.deepEqual(
  reorderFrameIdGroup(groupOriginal, ["think", "design"], "manufacturing", "after"),
  ["cover", "output", "manufacturing", "think", "design"],
  "moves non-adjacent selected frames as one ordered group",
);
assert.deepEqual(
  reorderFrameIdGroup(groupOriginal, ["design", "think"], "output", "before"),
  ["cover", "think", "design", "output", "manufacturing"],
  "preserves deck order instead of selection order",
);
assert.deepEqual(
  reorderFrameIdGroup(groupOriginal, ["think", "design"], "design", "after"),
  groupOriginal,
  "does not drop a group onto one of its own frames",
);
assert.deepEqual(
  reorderFrameIdGroup(groupOriginal, ["missing"], "output", "before"),
  groupOriginal,
);

assert.deepEqual(moveFrameId(original, "output", -1), ["cover", "output", "think", "manufacturing"]);
assert.deepEqual(moveFrameId(original, "output", 1), ["cover", "think", "manufacturing", "output"]);
assert.deepEqual(moveFrameId(original, "cover", -1), original);
assert.deepEqual(moveFrameId(original, "manufacturing", 1), original);

assert.equal(countMovedFrameIds(original, original), 0);
assert.equal(countMovedFrameIds(["think", "cover", "output", "manufacturing"], original), 2);

const request = createSlideOrderRequest(original, "2026-07-17T12:00:00.000Z");
assert.deepEqual(request, {
  createdAt: "2026-07-17T12:00:00.000Z",
  frameIds: original,
  version: 1,
});

const codexRequest = formatSlideOrderRequestForCodex(request);
assert.match(codexRequest, /motionDeckFrames/);
assert.match(codexRequest, /"frameIds": \[/);
assert.match(codexRequest, /"manufacturing"/);

console.log("slide order tests passed");
