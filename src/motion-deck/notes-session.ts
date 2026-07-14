import {
  createEmptySpeakerNotesFile,
  getSpeakerNote,
  serializeSpeakerNotesFile,
  updateSpeakerNote,
} from "./speaker-notes.js";
import type { SpeakerNote, SpeakerNotesFile } from "./speaker-notes.js";

export type NotesSessionPhase =
  | "empty"
  | "clean"
  | "dirty"
  | "saving"
  | "saved"
  | "invalid"
  | "error";

export type NotesSessionState = {
  document: SpeakerNotesFile;
  fileName?: string;
  isDirty: boolean;
  message?: string;
  phase: NotesSessionPhase;
  savedSource?: string;
};

export type NotesSessionAction =
  | {
      type: "replace-document";
      document: SpeakerNotesFile;
      fileName: string;
      persisted: boolean;
    }
  | { type: "edit-note"; frameId: string; note: SpeakerNote }
  | { type: "save-start" }
  | { type: "save-success"; fileName: string; message: string }
  | { type: "save-failure"; message: string }
  | { type: "invalid-file"; message: string };

export function createInitialNotesSessionState(): NotesSessionState {
  const document = createEmptySpeakerNotesFile();

  return {
    document,
    isDirty: false,
    phase: "empty",
    savedSource: serializeSpeakerNotesFile(document),
  };
}

export function notesSessionReducer(
  state: NotesSessionState,
  action: NotesSessionAction,
): NotesSessionState {
  switch (action.type) {
    case "replace-document": {
      const source = serializeSpeakerNotesFile(action.document);

      return {
        document: action.document,
        fileName: action.fileName,
        isDirty: !action.persisted,
        message: action.persisted ? `Opened ${action.fileName}.` : "New notes are not saved yet.",
        phase: action.persisted ? "clean" : "dirty",
        savedSource: action.persisted ? source : undefined,
      };
    }
    case "edit-note": {
      const document = updateSpeakerNote(state.document, action.frameId, action.note);
      const isDirty = serializeSpeakerNotesFile(document) !== state.savedSource;

      return {
        ...state,
        document,
        isDirty,
        message: isDirty
          ? "Unsaved changes."
          : state.fileName
            ? "All changes saved."
            : "No notes file open.",
        phase: isDirty ? "dirty" : state.fileName ? "clean" : "empty",
      };
    }
    case "save-start":
      return {
        ...state,
        message: "Saving notes…",
        phase: "saving",
      };
    case "save-success":
      return {
        ...state,
        fileName: action.fileName,
        isDirty: false,
        message: action.message,
        phase: "saved",
        savedSource: serializeSpeakerNotesFile(state.document),
      };
    case "save-failure":
      return {
        ...state,
        isDirty: state.isDirty,
        message: action.message,
        phase: "error",
      };
    case "invalid-file":
      return {
        ...state,
        message: action.message,
        phase: "invalid",
      };
  }
}

export function selectSessionNote(state: NotesSessionState, frameId: string) {
  return getSpeakerNote(state.document, frameId);
}
