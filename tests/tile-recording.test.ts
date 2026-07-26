import assert from "node:assert/strict";
import {
  appendTileRecordingEvent,
  createTilePlaybackSchedule,
  getTileCursorCenter,
  isTileRecording,
  parseTileRecording,
  serializeTileRecording,
  type TileRecording,
} from "../src/slides/26-optimize-for-exploration/tile-recording.js";
import { getDefaultTileRecording } from "../src/slides/26-optimize-for-exploration/default-tile-recordings.js";
import { motionDeckFrames } from "../src/motion-deck/frames.js";

const firstTileFrame = motionDeckFrames.find(
  (frame) => frame.id === "optimize-exploration-scratch",
);
assert.equal(firstTileFrame?.tileRevealRows, 9);
assert.equal(firstTileFrame?.tileRevealColumns, 20);

const secondTileFrame = motionDeckFrames.find(
  (frame) => frame.id === "optimize-exploration-tiles-2",
);
assert.equal(secondTileFrame?.tileRevealRows, 4);
assert.equal(secondTileFrame?.tileRevealColumns, 10);

const defaultFirstTileRecording = getDefaultTileRecording(
  "optimize-exploration-scratch",
);
assert.equal(isTileRecording(defaultFirstTileRecording), true);
assert.deepEqual(defaultFirstTileRecording, {
  version: 1,
  rows: 9,
  columns: 20,
  events: [
    { tileId: 122, atMs: 1087 },
    { tileId: 102, atMs: 2145 },
    { tileId: 103, atMs: 2594 },
    { tileId: 67, atMs: 4215 },
    { tileId: 66, atMs: 4557 },
    { tileId: 47, atMs: 4940 },
    { tileId: 48, atMs: 5756 },
    { tileId: 130, atMs: 6961 },
    { tileId: 152, atMs: 8383 },
    { tileId: 115, atMs: 9198 },
    { tileId: 95, atMs: 9698 },
    { tileId: 96, atMs: 10069 },
    { tileId: 116, atMs: 10385 },
    { tileId: 136, atMs: 10710 },
    { tileId: 135, atMs: 11093 },
    { tileId: 114, atMs: 11469 },
    { tileId: 156, atMs: 11760 },
    { tileId: 157, atMs: 12043 },
    { tileId: 137, atMs: 12326 },
    { tileId: 117, atMs: 12944 },
    { tileId: 118, atMs: 13260 },
    { tileId: 158, atMs: 13739 },
    { tileId: 138, atMs: 14382 },
  ],
});
const defaultSecondTileRecording = getDefaultTileRecording(
  "optimize-exploration-tiles-2",
);
assert.equal(isTileRecording(defaultSecondTileRecording), true);
assert.deepEqual(defaultSecondTileRecording, {
  version: 1,
  rows: 4,
  columns: 10,
  events: [
    { tileId: 31, atMs: 1150 },
    { tileId: 15, atMs: 2279 },
    { tileId: 18, atMs: 3817 },
    { tileId: 17, atMs: 4558 },
    { tileId: 27, atMs: 4874 },
    { tileId: 28, atMs: 5232 },
    { tileId: 29, atMs: 5812 },
    { tileId: 38, atMs: 6437 },
  ],
});

const recording: TileRecording = {
  version: 1,
  rows: 9,
  columns: 20,
  events: [
    { tileId: 0, atMs: 125.5 },
    { tileId: 89, atMs: 125.5 },
    { tileId: 179, atMs: 480 },
  ],
};

assert.equal(isTileRecording(recording), true);
assert.deepEqual(
  parseTileRecording(serializeTileRecording(recording)),
  recording,
  "recordings round-trip through their persisted JSON representation",
);
assert.equal(parseTileRecording("{not json"), undefined);
assert.equal(parseTileRecording(JSON.stringify({ ...recording, version: 2 })), undefined);
assert.equal(parseTileRecording(JSON.stringify({ ...recording, rows: 0 })), undefined);
assert.equal(parseTileRecording(JSON.stringify({ ...recording, rows: 1 })), undefined);
assert.equal(parseTileRecording(JSON.stringify({ ...recording, rows: 17 })), undefined);
assert.equal(parseTileRecording(JSON.stringify({ ...recording, columns: 2.5 })), undefined);
assert.equal(parseTileRecording(JSON.stringify({ ...recording, columns: 25 })), undefined);
assert.equal(
  parseTileRecording(JSON.stringify({
    ...recording,
    events: [{ tileId: 180, atMs: 0 }],
  })),
  undefined,
  "tile ids must stay inside the recorded grid",
);
assert.equal(
  parseTileRecording(JSON.stringify({
    ...recording,
    events: [
      { tileId: 4, atMs: 10 },
      { tileId: 4, atMs: 20 },
    ],
  })),
  undefined,
  "a tile can only be revealed once",
);
assert.equal(
  parseTileRecording(JSON.stringify({
    ...recording,
    events: [
      { tileId: 4, atMs: 20 },
      { tileId: 5, atMs: 19 },
    ],
  })),
  undefined,
  "event times must be monotonic",
);
assert.equal(
  isTileRecording({
    ...recording,
    events: [{ tileId: 4, atMs: Number.POSITIVE_INFINITY }],
  }),
  false,
  "event times must be finite",
);

const appended = appendTileRecordingEvent(
  { version: 1, rows: 9, columns: 20, events: [] },
  89,
  44.25,
);
assert.deepEqual(appended.events, [{ tileId: 89, atMs: 44.25 }]);
assert.throws(
  () => appendTileRecordingEvent(appended, 90, 44),
  /earlier than the previous event/,
);
assert.throws(
  () => appendTileRecordingEvent(appended, 89, 45),
  /already been recorded/,
);
assert.throws(
  () => appendTileRecordingEvent(appended, 180, 45),
  /outside the 9 by 20 grid/,
);
assert.throws(
  () => appendTileRecordingEvent(appended, 90, -1),
  /non-negative finite number/,
);

assert.deepEqual(createTilePlaybackSchedule(recording), [
  { tileId: 0, atMs: 125.5, delayMs: 125.5 },
  { tileId: 89, atMs: 125.5, delayMs: 0 },
  { tileId: 179, atMs: 480, delayMs: 354.5 },
]);

const centerTile = getTileCursorCenter(89, 9, 20);
assert.ok(Math.abs(centerTile.xPercent - 47.95) < 1e-10);
assert.equal(centerTile.yPercent, 50);
const firstTile = getTileCursorCenter(0, 9, 20);
assert.ok(Math.abs(firstTile.xPercent - 11.05) < 1e-10);
assert.ok(
  Math.abs(firstTile.yPercent - 19.77777777777778) < 1e-10,
);
assert.throws(() => getTileCursorCenter(180, 9, 20), /outside the 9 by 20 grid/);

console.log("tile recording tests passed");
