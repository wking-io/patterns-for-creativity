import assert from "node:assert/strict";
import {
  createElapsedTimerState,
  defaultNotesTextSize,
  elapsedTimerReducer,
  formatElapsedTime,
  getElapsedMilliseconds,
  notesTextSizeOptions,
  presenterPreferencesStorageKey,
  readNotesTextSize,
  updateNotesTextSize,
  writeNotesTextSize,
} from "../src/motion-deck/presenter-controls.js";

let timer = createElapsedTimerState();
assert.deepEqual(timer, { status: "idle", accumulatedMs: 0 });
assert.equal(getElapsedMilliseconds(timer, 9_000), 0);

timer = elapsedTimerReducer(timer, { type: "start", at: 1_000 });
assert.deepEqual(timer, {
  status: "running",
  accumulatedMs: 0,
  startedAt: 1_000,
});
assert.equal(getElapsedMilliseconds(timer, 3_500), 2_500);

timer = elapsedTimerReducer(timer, { type: "pause", at: 4_000 });
assert.deepEqual(timer, { status: "paused", accumulatedMs: 3_000 });
assert.equal(getElapsedMilliseconds(timer, 8_000), 3_000);

timer = elapsedTimerReducer(timer, { type: "resume", at: 5_000 });
assert.equal(getElapsedMilliseconds(timer, 6_500), 4_500);
assert.strictEqual(
  elapsedTimerReducer(timer, { type: "start", at: 7_000 }),
  timer,
  "start cannot restart an active timer",
);

timer = elapsedTimerReducer(timer, { type: "pause", at: 7_000 });
assert.equal(getElapsedMilliseconds(timer, 20_000), 5_000);
timer = elapsedTimerReducer(timer, { type: "reset" });
assert.deepEqual(timer, { status: "idle", accumulatedMs: 0 });
assert.equal(formatElapsedTime(0), "00:00:00");
assert.equal(formatElapsedTime(3_661_999), "01:01:01");

assert.equal(updateNotesTextSize(defaultNotesTextSize, "increase"), 22);
assert.equal(updateNotesTextSize(defaultNotesTextSize, "decrease"), 18);
assert.equal(updateNotesTextSize(26, "reset"), defaultNotesTextSize);
assert.equal(updateNotesTextSize(notesTextSizeOptions[0], "decrease"), 16);
assert.equal(updateNotesTextSize(notesTextSizeOptions.at(-1) ?? 0, "increase"), 32);

const stored = new Map<string, string>();
const storage = {
  getItem: (key: string) => stored.get(key) ?? null,
  setItem: (key: string, value: string) => {
    stored.set(key, value);
  },
};

assert.equal(readNotesTextSize(storage), defaultNotesTextSize);
assert.equal(writeNotesTextSize(storage, 26), true);
assert.equal(readNotesTextSize(storage), 26);
stored.set(presenterPreferencesStorageKey, JSON.stringify({ notesTextSize: 999 }));
assert.equal(readNotesTextSize(storage), 32, "stored preferences stay within the upper bound");
stored.set(presenterPreferencesStorageKey, "not json");
assert.equal(readNotesTextSize(storage), defaultNotesTextSize);
assert.equal(writeNotesTextSize(undefined, 24), false);

console.log("presenter controls tests passed");
