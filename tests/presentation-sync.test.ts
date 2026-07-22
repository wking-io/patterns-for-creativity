import assert from "node:assert/strict";
import {
  acceptPresentationInteractionState,
  acceptPresentationPortalMaskState,
  acceptPresentationState,
  acceptPresentationScratchState,
  createAudienceBlackoutUrl,
  createAudienceConnectionState,
  createAudienceDisplayUrl,
  createAudiencePresenceMessage,
  createPresentationInteractionCursor,
  createPresentationInteractionMessage,
  createPresentationPortalMaskCursor,
  createPresentationPortalMaskMessage,
  createPresentationStateCursor,
  createPresentationStateMessage,
  createPresentationScratchCursor,
  createPresentationScratchMessage,
  createPresentationScratchSnapshot,
  deliverPresentationMessage,
  getDeckViewMode,
  getInitialAudienceBlackout,
  parsePresentationMessage,
  reduceAudienceConnection,
} from "../src/motion-deck/presentation-sync.js";
import {
  areMotionStagePropsEqual,
  getMotionStageBehavior,
} from "../src/motion-deck/stage-mode.js";

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

const scratchSegments = [
  { fromX: 0.1, fromY: 0.2, toX: 0.3, toY: 0.4 },
  { fromX: 0.3, fromY: 0.4, toX: 0.5, toY: 0.6 },
];
const scratchState = createPresentationScratchMessage(
  "presenter-a",
  0,
  "replace",
  scratchSegments,
);
assert.deepEqual(scratchState, {
  type: "presentation-scratch",
  version: 1,
  sessionId: "presenter-a",
  revision: 0,
  mode: "replace",
  segments: scratchSegments,
});
assert.deepEqual(parsePresentationMessage(scratchState, 29), scratchState);
assert.equal(
  parsePresentationMessage({
    ...scratchState,
    segments: [{ fromX: -0.1, fromY: 0.2, toX: 0.3, toY: 0.4 }],
  }, 29),
  undefined,
  "scratch coordinates must stay normalized",
);

let scratchCursor = createPresentationScratchCursor();
let scratchResult = acceptPresentationScratchState(scratchCursor, scratchState);
assert.equal(scratchResult.accepted, true);
scratchCursor = scratchResult.cursor;
scratchResult = acceptPresentationScratchState(scratchCursor, scratchState);
assert.equal(scratchResult.accepted, false, "duplicate scratch delivery is ignored");
scratchResult = acceptPresentationScratchState(
  scratchCursor,
  createPresentationScratchMessage("presenter-a", 1, "append", [scratchSegments[1]]),
);
assert.equal(scratchResult.accepted, true, "new scratch segments are accepted in order");
scratchCursor = scratchResult.cursor;

const presenterReloadReset = createPresentationScratchSnapshot(
  "presenter-reloaded",
  0,
  [],
);
assert.deepEqual(presenterReloadReset, {
  type: "presentation-scratch",
  version: 1,
  sessionId: "presenter-reloaded",
  revision: 0,
  mode: "replace",
  segments: [],
});
scratchResult = acceptPresentationScratchState(scratchCursor, presenterReloadReset);
assert.equal(
  scratchResult.accepted,
  true,
  "a reloaded presenter starts a new scratch session that can clear the audience",
);

const portalMaskRect = { x: 0.25, y: 0.2, width: 0.4, height: 0.3 };
const portalMaskState = createPresentationPortalMaskMessage(
  "presenter-a",
  0,
  portalMaskRect,
);
assert.deepEqual(portalMaskState, {
  type: "presentation-portal-mask",
  version: 1,
  sessionId: "presenter-a",
  revision: 0,
  rect: portalMaskRect,
});
assert.deepEqual(parsePresentationMessage(portalMaskState, 29), portalMaskState);
assert.equal(
  parsePresentationMessage({
    ...portalMaskState,
    rect: { ...portalMaskRect, x: 0.7 },
  }, 29),
  undefined,
  "portal mask bounds must stay normalized",
);

let portalMaskCursor = createPresentationPortalMaskCursor();
let portalMaskResult = acceptPresentationPortalMaskState(
  portalMaskCursor,
  portalMaskState,
);
assert.equal(portalMaskResult.accepted, true);
portalMaskCursor = portalMaskResult.cursor;
portalMaskResult = acceptPresentationPortalMaskState(portalMaskCursor, portalMaskState);
assert.equal(portalMaskResult.accepted, false, "duplicate portal mask delivery is ignored");
portalMaskResult = acceptPresentationPortalMaskState(
  portalMaskCursor,
  createPresentationPortalMaskMessage(
    "presenter-a",
    1,
    { ...portalMaskRect, x: 0.3 },
  ),
);
assert.equal(portalMaskResult.accepted, true, "new portal mask state is accepted in order");

const interactionState = {
  frameId: "exposure-practice-sky-remembers",
  pointer: { x: 0.45, y: 0.62 },
  exposureCollectionScroll: { startedAt: 1_750_000_000_000, speed: 1.25 },
  exposureMaskStep: 3 as const,
  exposureScoreId: "flowers-crown-of-embers",
};
const interactionMessage = createPresentationInteractionMessage(
  "presenter-a",
  0,
  interactionState,
);
assert.deepEqual(interactionMessage, {
  type: "presentation-interaction",
  version: 1,
  sessionId: "presenter-a",
  revision: 0,
  state: interactionState,
});
assert.deepEqual(parsePresentationMessage(interactionMessage, 29), interactionMessage);
assert.equal(
  parsePresentationMessage({
    ...interactionMessage,
    state: { ...interactionState, pointer: { x: 1.1, y: 0.5 } },
  }, 29),
  undefined,
  "presentation pointer coordinates must stay normalized",
);
assert.equal(
  parsePresentationMessage({
    ...interactionMessage,
    state: { ...interactionState, exposureMaskStep: 5 },
  }, 29),
  undefined,
  "exposure mask steps outside the rendered states are rejected",
);
assert.equal(
  parsePresentationMessage({
    ...interactionMessage,
    state: { ...interactionState, exposureScoreId: "" },
  }, 29),
  undefined,
  "exposure score ids must be non-empty",
);
assert.equal(
  parsePresentationMessage({
    ...interactionMessage,
    state: {
      ...interactionState,
      exposureCollectionScroll: { startedAt: -1, speed: 1 },
    },
  }, 29),
  undefined,
  "collection scroll timestamps must be non-negative",
);
assert.equal(
  parsePresentationMessage({
    ...interactionMessage,
    state: {
      ...interactionState,
      exposureCollectionScroll: { startedAt: 1_750_000_000_000, speed: 4.5 },
    },
  }, 29),
  undefined,
  "collection scroll speeds must stay within the control range",
);
let interactionCursor = createPresentationInteractionCursor();
let interactionResult = acceptPresentationInteractionState(
  interactionCursor,
  interactionMessage,
);
assert.equal(interactionResult.accepted, true);
interactionCursor = interactionResult.cursor;
interactionResult = acceptPresentationInteractionState(
  interactionCursor,
  interactionMessage,
);
assert.equal(interactionResult.accepted, false, "duplicate interaction delivery is ignored");
interactionResult = acceptPresentationInteractionState(
  interactionCursor,
  createPresentationInteractionMessage("presenter-a", 1, {
    frameId: "exposure-practice-sky-remembers",
    exposureMaskStep: 1,
  }),
);
assert.equal(interactionResult.accepted, true, "pointer hide and mask reset are accepted");

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
  audioEnabled: true,
  autoAdvance: false,
  autoplayMedia: true,
});
assert.deepEqual(getMotionStageBehavior("presenter"), {
  animateContent: true,
  animateLayout: true,
  audioEnabled: false,
  autoAdvance: true,
  autoplayMedia: true,
});
assert.equal(getMotionStageBehavior("live").audioEnabled, true);
assert.equal(getMotionStageBehavior("presenter").audioEnabled, false);
assert.equal(getMotionStageBehavior("audience").audioEnabled, true);
assert.equal(getMotionStageBehavior("preview").audioEnabled, false);
assert.equal(getMotionStageBehavior("live").autoAdvance, true);
assert.equal(getMotionStageBehavior("presenter").autoAdvance, true);
assert.equal(getMotionStageBehavior("audience").autoAdvance, false);
assert.equal(getMotionStageBehavior("preview").autoAdvance, false);

const stableStageProps = {
  direction: 1,
  frame: { id: "scratch" },
  isGridVisible: false,
  interactionState,
  mode: "live" as const,
  onAdvance: () => undefined,
  onInteractionState: () => undefined,
  onPortalMaskRect: () => undefined,
  portalMaskRect,
  scratchSegments,
  onScratchSegments: () => undefined,
};
assert.equal(
  areMotionStagePropsEqual(stableStageProps, { ...stableStageProps }),
  true,
  "unrelated presenter rerenders do not restart the current slide",
);
assert.equal(
  areMotionStagePropsEqual(stableStageProps, {
    ...stableStageProps,
    scratchSegments: [...scratchSegments],
  }),
  false,
  "new scratch state still redraws the slide",
);
assert.equal(
  areMotionStagePropsEqual(stableStageProps, {
    ...stableStageProps,
    portalMaskRect: { ...portalMaskRect },
  }),
  false,
  "new portal mask state still redraws the slide",
);
assert.equal(
  areMotionStagePropsEqual(stableStageProps, {
    ...stableStageProps,
    interactionState: { ...interactionState },
  }),
  false,
  "new pointer or exposure mask state still redraws the slide",
);
assert.equal(
  areMotionStagePropsEqual(stableStageProps, {
    ...stableStageProps,
    frame: { id: "next" },
  }),
  false,
  "navigation still renders the new frame",
);

console.log("presentation sync tests passed");
