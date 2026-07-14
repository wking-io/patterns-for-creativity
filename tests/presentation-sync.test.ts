import assert from "node:assert/strict";
import {
  acceptPresentationState,
  createAudienceBlackoutUrl,
  createAudienceConnectionState,
  createAudienceDisplayUrl,
  createAudiencePresenceMessage,
  createPresentationStateCursor,
  createPresentationStateMessage,
  deliverPresentationMessage,
  getDeckViewMode,
  getInitialAudienceBlackout,
  parsePresentationMessage,
  reduceAudienceConnection,
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
assert.equal(
  createAudienceDisplayUrl("file:///tmp/motion-deck.html?view=presenter#/3", 4, 29),
  "file:///tmp/motion-deck.html?view=audience#/5",
);
assert.equal(
  createAudienceDisplayUrl(
    "https://example.test/talk?theme=dark&view=presenter#/3",
    4,
    29,
    true,
  ),
  "https://example.test/talk?theme=dark&view=audience&blackout=1#/5",
);
assert.equal(
  createAudienceBlackoutUrl(
    "https://example.test/talk?view=audience&blackout=1#/5",
    false,
  ),
  "https://example.test/talk?view=audience#/5",
);
assert.equal(getInitialAudienceBlackout("?view=audience&blackout=1"), true);
assert.equal(getInitialAudienceBlackout("?view=audience"), false);

const initialState = createPresentationStateMessage("presenter-a", 0, 7, 1);
assert.deepEqual(initialState, {
  type: "presentation-state",
  version: 1,
  sessionId: "presenter-a",
  revision: 0,
  direction: 1,
  frameIndex: 7,
  isAudienceBlackout: false,
});
assert.deepEqual(parsePresentationMessage(initialState, 29), initialState);

const readyMessage = createAudiencePresenceMessage("audience-ready", "audience-a");
assert.deepEqual(parsePresentationMessage(readyMessage, 29), readyMessage);
assert.equal(parsePresentationMessage({ ...initialState, frameIndex: 29 }, 29), undefined);
assert.equal(parsePresentationMessage({ ...initialState, revision: -1 }, 29), undefined);
assert.equal(parsePresentationMessage({ ...initialState, direction: 0 }, 29), undefined);
assert.equal(parsePresentationMessage({ ...initialState, sessionId: "" }, 29), undefined);
assert.equal(
  parsePresentationMessage({ ...initialState, isAudienceBlackout: "yes" }, 29),
  undefined,
);
assert.equal(parsePresentationMessage({ ...initialState, version: 2 }, 29), undefined);
assert.equal(parsePresentationMessage("not a message", 29), undefined);

let cursor = createPresentationStateCursor();
let result = acceptPresentationState(cursor, initialState);
assert.equal(result.accepted, true, "a late join accepts the presenter's complete state");
cursor = result.cursor;

result = acceptPresentationState(cursor, initialState);
assert.equal(result.accepted, false, "a duplicate delivery is ignored");

result = acceptPresentationState(
  cursor,
  createPresentationStateMessage("presenter-a", 2, 9, 1),
);
assert.equal(result.accepted, true);
cursor = result.cursor;

result = acceptPresentationState(
  cursor,
  createPresentationStateMessage("presenter-a", 1, 8, -1),
);
assert.equal(result.accepted, false, "an older revision cannot rewind the audience");

result = acceptPresentationState(
  cursor,
  createPresentationStateMessage("presenter-b", 0, 4, -1),
);
assert.equal(result.accepted, true, "a reloaded presenter can start a new session");
cursor = result.cursor;

result = acceptPresentationState(
  cursor,
  createPresentationStateMessage("presenter-a", 3, 10, 1),
);
assert.equal(result.accepted, false, "a delayed message from a retired session stays rejected");

const blackoutState = createPresentationStateMessage("presenter-b", 1, 4, 1, true);
result = acceptPresentationState(cursor, blackoutState);
assert.equal(result.accepted, true, "the presenter can black out without changing frames");
cursor = result.cursor;

const navigationDuringBlackout = createPresentationStateMessage(
  "presenter-b",
  2,
  8,
  1,
  true,
);
result = acceptPresentationState(cursor, navigationDuringBlackout);
assert.equal(result.accepted, true, "navigation remains synchronized during blackout");
assert.equal(navigationDuringBlackout.frameIndex, 8);
assert.equal(navigationDuringBlackout.isAudienceBlackout, true);
cursor = result.cursor;

const lateAudienceResult = acceptPresentationState(
  createPresentationStateCursor(),
  navigationDuringBlackout,
);
assert.equal(lateAudienceResult.accepted, true, "a late audience accepts blackout state");
assert.equal(navigationDuringBlackout.isAudienceBlackout, true);

const restoredState = createPresentationStateMessage("presenter-b", 3, 8, 1, false);
result = acceptPresentationState(cursor, restoredState);
assert.equal(result.accepted, true, "restoring reveals the latest synchronized frame");
assert.equal(restoredState.frameIndex, navigationDuringBlackout.frameIndex);

let connection = createAudienceConnectionState();
connection = reduceAudienceConnection(connection, { type: "open-requested", at: 100 });
assert.deepEqual(connection, { status: "opening", lastSeenAt: 100 });
connection = reduceAudienceConnection(connection, {
  type: "audience-ready",
  audienceId: "audience-a",
  at: 200,
});
assert.deepEqual(connection, {
  status: "connected",
  audienceId: "audience-a",
  lastSeenAt: 200,
});
connection = reduceAudienceConnection(connection, { type: "connection-timeout" });
assert.equal(connection.status, "disconnected");
connection = reduceAudienceConnection(connection, {
  type: "audience-ready",
  audienceId: "audience-b",
  at: 400,
});
assert.equal(connection.status, "connected", "a replacement audience reconnects");
connection = reduceAudienceConnection(connection, {
  type: "audience-heartbeat",
  audienceId: "audience-a",
  at: 450,
});
assert.equal(connection.audienceId, "audience-b", "a stale heartbeat cannot replace it");
connection = reduceAudienceConnection(connection, {
  type: "audience-closing",
  audienceId: "audience-a",
});
assert.equal(connection.status, "connected", "a stale close cannot close the replacement");
connection = reduceAudienceConnection(connection, {
  type: "audience-closing",
  audienceId: "audience-b",
});
assert.deepEqual(connection, { status: "closed" });
assert.deepEqual(
  reduceAudienceConnection(connection, { type: "popup-blocked" }),
  { status: "popup-blocked" },
);

const locallyDelivered: string[] = [];
assert.equal(deliverPresentationMessage(initialState, [
  (message) => locallyDelivered.push(`channel:${message.type}`),
  (message) => locallyDelivered.push(`opener:${message.type}`),
]), 2);
assert.deepEqual(locallyDelivered, [
  "channel:presentation-state",
  "opener:presentation-state",
]);
assert.equal(deliverPresentationMessage(initialState, [
  () => { throw new Error("closed window"); },
  (message) => locallyDelivered.push(`fallback:${message.type}`),
]), 1, "one local transport can recover when the other is unavailable");

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
