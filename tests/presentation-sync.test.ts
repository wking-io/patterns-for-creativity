import assert from "node:assert/strict";
import {
  acceptPresentationInteractionState,
  acceptPresentationPortalMaskState,
  acceptPresentationState,
  acceptPresentationTileRevealState,
  createAudienceBlackoutUrl,
  createAudienceConnectionState,
  createAudienceDisplayUrl,
  createAudiencePresenceMessage,
  createDefaultTileRevealState,
  createPresentationInteractionCursor,
  createPresentationInteractionMessage,
  createPresentationPortalMaskCursor,
  createPresentationPortalMaskMessage,
  createPresentationStateCursor,
  createPresentationStateMessage,
  createPresentationTileRevealCursor,
  createPresentationTileRevealMessage,
  deliverPresentationMessage,
  getDeckViewMode,
  getInitialAudienceBlackout,
  mergePresentationInteractionState,
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

const defaultTileRevealState = createDefaultTileRevealState();
assert.deepEqual(defaultTileRevealState, {
  rows: 6,
  columns: 10,
  removedTileIds: [],
});
const tileRevealState = {
  rows: 6,
  columns: 10,
  removedTileIds: [2, 7, 38],
};
const tileRevealMessage = createPresentationTileRevealMessage(
  "presenter-a",
  0,
  "optimize-exploration-scratch",
  tileRevealState,
);
assert.deepEqual(tileRevealMessage, {
  type: "presentation-tile-reveal",
  version: 1,
  sessionId: "presenter-a",
  revision: 0,
  frameId: "optimize-exploration-scratch",
  state: tileRevealState,
});
assert.notEqual(
  tileRevealMessage.state.removedTileIds,
  tileRevealState.removedTileIds,
  "tile reveal messages copy their mutable tile-id list",
);
assert.deepEqual(
  parsePresentationMessage(tileRevealMessage, 29),
  tileRevealMessage,
);
const tilePlaybackState = {
  rows: 6,
  columns: 10,
  removedTileIds: [],
  playback: {
    id: "tile-run-1",
    startedAt: 1_725_000_000_250,
    recording: {
      version: 1 as const,
      rows: 6,
      columns: 10,
      events: [
        { tileId: 7, atMs: 125 },
        { tileId: 38, atMs: 480 },
      ],
    },
  },
};
const tilePlaybackMessage = createPresentationTileRevealMessage(
  "presenter-a",
  1,
  "optimize-exploration-scratch",
  tilePlaybackState,
);
assert.deepEqual(
  parsePresentationMessage(tilePlaybackMessage, 29),
  tilePlaybackMessage,
  "a synchronized tile snapshot can carry a timed playback run",
);
assert.notEqual(
  tilePlaybackMessage.state.playback?.recording.events,
  tilePlaybackState.playback.recording.events,
  "playback events are copied before crossing the presentation channel",
);
assert.equal(
  parsePresentationMessage({
    ...tilePlaybackMessage,
    state: {
      ...tilePlaybackState,
      playback: { ...tilePlaybackState.playback, id: "" },
    },
  }, 29),
  undefined,
  "playback runs require an identity",
);
assert.equal(
  parsePresentationMessage({
    ...tilePlaybackMessage,
    state: {
      ...tilePlaybackState,
      playback: {
        ...tilePlaybackState.playback,
        recording: {
          ...tilePlaybackState.playback.recording,
          rows: 9,
        },
      },
    },
  }, 29),
  undefined,
  "playback dimensions must match the visible grid",
);
assert.equal(
  parsePresentationMessage({
    ...tileRevealMessage,
    frameId: "",
  }, 29),
  undefined,
  "tile reveal messages identify a non-empty frame",
);
assert.equal(
  parsePresentationMessage({
    ...tileRevealMessage,
    state: { ...tileRevealState, rows: 1 },
  }, 29),
  undefined,
  "tile reveal rows must stay within the control range",
);
assert.equal(
  parsePresentationMessage({
    ...tileRevealMessage,
    state: { ...tileRevealState, rows: 17 },
  }, 29),
  undefined,
  "tile reveal rows cannot exceed the control range",
);
assert.equal(
  parsePresentationMessage({
    ...tileRevealMessage,
    state: { ...tileRevealState, rows: 6.5 },
  }, 29),
  undefined,
  "tile reveal rows must be integers",
);
assert.equal(
  parsePresentationMessage({
    ...tileRevealMessage,
    state: { ...tileRevealState, columns: 1 },
  }, 29),
  undefined,
  "tile reveal columns must stay within the control range",
);
assert.equal(
  parsePresentationMessage({
    ...tileRevealMessage,
    state: { ...tileRevealState, columns: 25 },
  }, 29),
  undefined,
  "tile reveal columns cannot exceed the control range",
);
assert.equal(
  parsePresentationMessage({
    ...tileRevealMessage,
    state: { ...tileRevealState, removedTileIds: [2, 2] },
  }, 29),
  undefined,
  "tile ids must be unique",
);
assert.equal(
  parsePresentationMessage({
    ...tileRevealMessage,
    state: { ...tileRevealState, removedTileIds: [-1] },
  }, 29),
  undefined,
  "tile ids must be non-negative integers",
);
assert.equal(
  parsePresentationMessage({
    ...tileRevealMessage,
    state: { ...tileRevealState, removedTileIds: [2.5] },
  }, 29),
  undefined,
  "tile ids cannot be fractional",
);
assert.equal(
  parsePresentationMessage({
    ...tileRevealMessage,
    state: { ...tileRevealState, removedTileIds: [60] },
  }, 29),
  undefined,
  "tile ids must stay within the current grid",
);

let tileRevealCursor = createPresentationTileRevealCursor();
let tileRevealResult = acceptPresentationTileRevealState(
  tileRevealCursor,
  tileRevealMessage,
);
assert.equal(tileRevealResult.accepted, true);
tileRevealCursor = tileRevealResult.cursor;
tileRevealResult = acceptPresentationTileRevealState(
  tileRevealCursor,
  tileRevealMessage,
);
assert.equal(
  tileRevealResult.accepted,
  false,
  "duplicate tile reveal delivery is ignored",
);
tileRevealResult = acceptPresentationTileRevealState(
  tileRevealCursor,
  createPresentationTileRevealMessage(
    "presenter-a",
    1,
    "optimize-exploration-scratch",
    {
      ...tileRevealState,
      removedTileIds: [...tileRevealState.removedTileIds, 42],
    },
  ),
);
assert.equal(
  tileRevealResult.accepted,
  true,
  "new tile reveal snapshots are accepted in order",
);
tileRevealCursor = tileRevealResult.cursor;

const presenterReloadReset = createPresentationTileRevealMessage(
  "presenter-reloaded",
  0,
  "optimize-exploration-scratch",
  createDefaultTileRevealState(),
);
assert.deepEqual(presenterReloadReset, {
  type: "presentation-tile-reveal",
  version: 1,
  sessionId: "presenter-reloaded",
  revision: 0,
  frameId: "optimize-exploration-scratch",
  state: {
    rows: 6,
    columns: 10,
    removedTileIds: [],
  },
});
tileRevealResult = acceptPresentationTileRevealState(
  tileRevealCursor,
  presenterReloadReset,
);
assert.equal(
  tileRevealResult.accepted,
  true,
  "a reloaded presenter starts a new tile session that can reset the audience",
);
tileRevealCursor = tileRevealResult.cursor;

const secondTileRevealMessage = createPresentationTileRevealMessage(
  "presenter-reloaded",
  1,
  "optimize-exploration-tiles-2",
  {
    rows: 8,
    columns: 16,
    removedTileIds: [18],
  },
);
assert.deepEqual(parsePresentationMessage(secondTileRevealMessage, 29), {
  type: "presentation-tile-reveal",
  version: 1,
  sessionId: "presenter-reloaded",
  revision: 1,
  frameId: "optimize-exploration-tiles-2",
  state: {
    rows: 8,
    columns: 16,
    removedTileIds: [18],
  },
});
tileRevealResult = acceptPresentationTileRevealState(
  tileRevealCursor,
  secondTileRevealMessage,
);
assert.equal(
  tileRevealResult.accepted,
  true,
  "the same presenter session can publish independent tile frames in order",
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
const synthInteractionState = {
  frameId: "synth-demo",
  pointer: { x: 0.4, y: 0.6 },
  synth: {
    wave: "sawtooth" as const,
    detune: 6,
    attack: 0.02,
    decay: 0.25,
    sustain: 0.75,
    release: 0.6,
    cutoff: 3200,
    chordCutoff: 1250,
    resonance: 0.8,
    filterEnvelope: 0.07,
    lfoEnabled: true,
    tremoloDepth: 0.3,
    tremoloRate: 5,
    vibratoDepth: 0.25,
    voices: 4,
    voiceDetune: 10,
    drive: 0.12,
    chorusMix: 0.2,
    delayMix: 0.1,
    reverbMix: 0.3,
    selectedDemo: "Tape Bloom",
    demoTempo: 112,
    isLooping: true,
    currentDemoStep: "E major · B4",
    isPowered: true,
    pressedMidi: [48, 52, 55],
  },
};
const synthInteractionMessage = createPresentationInteractionMessage(
  "presenter-a",
  1,
  synthInteractionState,
);
assert.deepEqual(
  parsePresentationMessage(synthInteractionMessage, 100),
  synthInteractionMessage,
  "synth controls, keys, and pointer survive the presentation wire together",
);
assert.equal(
  parsePresentationMessage({
    ...synthInteractionMessage,
    state: {
      ...synthInteractionState,
      synth: { ...synthInteractionState.synth, wave: "invalid-wave" },
    },
  }, 100),
  undefined,
  "unknown synth waveforms are rejected",
);
assert.equal(
  parsePresentationMessage({
    ...synthInteractionMessage,
    state: {
      ...synthInteractionState,
      synth: { ...synthInteractionState.synth, pressedMidi: [48, 48] },
    },
  }, 100),
  undefined,
  "duplicate pressed synth keys are rejected",
);
const movedSynthPointerState = mergePresentationInteractionState(
  synthInteractionState,
  {
    frameId: "synth-demo",
    pointer: { x: 0.7, y: 0.2 },
  },
);
assert.deepEqual(
  movedSynthPointerState,
  {
    ...synthInteractionState,
    pointer: { x: 0.7, y: 0.2 },
  },
  "moving the fake mouse does not erase the synth controls or keys",
);
assert.deepEqual(
  mergePresentationInteractionState(movedSynthPointerState, {
    frameId: "synth-demo",
    synth: { ...synthInteractionState.synth, cutoff: 8000 },
  }),
  {
    ...movedSynthPointerState,
    synth: { ...synthInteractionState.synth, cutoff: 8000 },
  },
  "changing a synth control does not erase the fake mouse",
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
  frame: { id: "tile-reveal" },
  isGridVisible: false,
  interactionState,
  mode: "live" as const,
  onAdvance: () => undefined,
  onInteractionState: () => undefined,
  onPortalMaskRect: () => undefined,
  portalMaskRect,
  tileRevealState,
  onTileRevealState: () => undefined,
};
assert.equal(
  areMotionStagePropsEqual(stableStageProps, { ...stableStageProps }),
  true,
  "unrelated presenter rerenders do not restart the current slide",
);
assert.equal(
  areMotionStagePropsEqual(stableStageProps, {
    ...stableStageProps,
    tileRevealState: {
      ...tileRevealState,
      removedTileIds: [...tileRevealState.removedTileIds, 42],
    },
  }),
  false,
  "new tile reveal state still redraws the slide",
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
