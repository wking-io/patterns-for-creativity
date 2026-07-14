import assert from "node:assert/strict";
import {
  createEmptySpeakerNotesFile,
  getSpeakerNote,
  parseSpeakerNotesFile,
  serializeSpeakerNotesFile,
  updateSpeakerNote,
} from "../src/motion-deck/speaker-notes.js";
import {
  createInitialNotesSessionState,
  notesSessionReducer,
  selectSessionNote,
} from "../src/motion-deck/notes-session.js";
import { getMotionStageBehavior } from "../src/motion-deck/stage-mode.js";
import { saveSpeakerNotesFile } from "../src/motion-deck/speaker-notes-files.js";
import type { WritableNotesFileHandle } from "../src/motion-deck/speaker-notes-files.js";

const emptyDocument = createEmptySpeakerNotesFile();
const withCoverNote = updateSpeakerNote(emptyDocument, "cover", {
  body: "Welcome everyone.\r\nSet up the premise.",
  cue: "  Pause before advancing.  ",
});
const withTwoNotes = updateSpeakerNote(withCoverNote, "bloom", {
  body: "Expansion and contraction.",
});
const serialized = serializeSpeakerNotesFile(withTwoNotes);
const reparsed = parseSpeakerNotesFile(serialized);

assert.deepEqual(getSpeakerNote(reparsed, "cover"), {
  body: "Welcome everyone.\nSet up the premise.",
  cue: "Pause before advancing.",
});
assert.deepEqual(getSpeakerNote(reparsed, "missing"), { body: "" });
assert.ok(serialized.indexOf('"bloom"') < serialized.indexOf('"cover"'));

assert.throws(
  () => parseSpeakerNotesFile("not json"),
  /not valid JSON/,
);
assert.throws(
  () => parseSpeakerNotesFile(JSON.stringify({ ...emptyDocument, version: 2 })),
  /Unsupported notes file version/,
);
assert.throws(
  () => parseSpeakerNotesFile(JSON.stringify({ ...emptyDocument, deckId: "other" })),
  /different deck/,
);
assert.throws(
  () => parseSpeakerNotesFile(JSON.stringify({ ...emptyDocument, notes: { cover: { body: 42 } } })),
  /malformed/,
);

let session = createInitialNotesSessionState();
assert.equal(session.phase, "empty");
assert.equal(session.isDirty, false);

session = notesSessionReducer(session, {
  type: "replace-document",
  document: withCoverNote,
  fileName: "talk-notes.json",
  persisted: true,
});
assert.equal(session.phase, "clean");
assert.equal(session.isDirty, false);
assert.equal(selectSessionNote(session, "cover").cue, "Pause before advancing.");

session = notesSessionReducer(session, {
  type: "edit-note",
  frameId: "cover",
  note: { body: "A revised opening." },
});
assert.equal(session.phase, "dirty");
assert.equal(session.isDirty, true);

session = notesSessionReducer(session, { type: "save-start" });
assert.equal(session.phase, "saving");

session = notesSessionReducer(session, {
  type: "save-failure",
  message: "Disk unavailable.",
});
assert.equal(session.phase, "error");
assert.equal(session.isDirty, true);

session = notesSessionReducer(session, {
  type: "save-success",
  fileName: "talk-notes.json",
  message: "Saved.",
});
assert.equal(session.phase, "saved");
assert.equal(session.isDirty, false);

const savedDocument = session.document;
session = notesSessionReducer(session, {
  type: "invalid-file",
  message: "Unsupported file.",
});
assert.equal(session.phase, "invalid");
assert.strictEqual(session.document, savedDocument);

assert.deepEqual(getMotionStageBehavior("preview"), {
  animateContent: false,
  animateLayout: false,
  autoAdvance: false,
  autoplayMedia: false,
});
assert.deepEqual(getMotionStageBehavior("live"), {
  animateContent: true,
  animateLayout: true,
  autoAdvance: true,
  autoplayMedia: true,
});

let writtenNotes = "";
let didCloseWritable = false;
const writableHandle: WritableNotesFileHandle = {
  name: "talk-notes.json",
  getFile: async () => new File([], "talk-notes.json"),
  createWritable: async () => ({
    write: async (contents) => {
      writtenNotes = contents;
    },
    close: async () => {
      didCloseWritable = true;
    },
  }),
};
const saveResult = await saveSpeakerNotesFile(
  withTwoNotes,
  writableHandle,
  "ignored.json",
  {} as Window,
);

assert.equal(writtenNotes, serializeSpeakerNotesFile(withTwoNotes));
assert.equal(didCloseWritable, true);
assert.deepEqual(saveResult, {
  fileName: "talk-notes.json",
  handle: writableHandle,
  mode: "overwrite",
});

console.log("speaker notes tests passed");
