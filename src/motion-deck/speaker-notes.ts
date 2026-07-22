export const speakerNotesFileVersion = 1;
export const speakerNotesDeckId = "patterns-for-creativity";
export const speakerNotesSaveEndpoint = "/__patterns-for-creativity/speaker-notes";

export type SpeakerNote = {
  body: string;
  cue?: string;
};

export type SpeakerNotesFile = {
  version: typeof speakerNotesFileVersion;
  deckId: typeof speakerNotesDeckId;
  notes: Record<string, SpeakerNote>;
};

export function createEmptySpeakerNotesFile(): SpeakerNotesFile {
  return {
    version: speakerNotesFileVersion,
    deckId: speakerNotesDeckId,
    notes: {},
  };
}

export function parseSpeakerNotesFile(source: string): SpeakerNotesFile {
  let parsed: unknown;

  try {
    parsed = JSON.parse(source);
  } catch {
    throw new Error("This notes file is not valid JSON.");
  }

  if (!isRecord(parsed)) {
    throw new Error("This notes file does not contain a notes document.");
  }

  if (parsed.version !== speakerNotesFileVersion) {
    throw new Error(`Unsupported notes file version: ${String(parsed.version)}.`);
  }

  if (parsed.deckId !== speakerNotesDeckId) {
    throw new Error("This notes file belongs to a different deck.");
  }

  if (!isRecord(parsed.notes)) {
    throw new Error("This notes file is missing its notes map.");
  }

  const notes: Record<string, SpeakerNote> = {};

  for (const [frameId, value] of Object.entries(parsed.notes)) {
    if (!isRecord(value) || typeof value.body !== "string") {
      throw new Error(`The note for frame \"${frameId}\" is malformed.`);
    }

    if (value.cue != null && typeof value.cue !== "string") {
      throw new Error(`The cue for frame \"${frameId}\" is malformed.`);
    }

    notes[frameId] = normalizeSpeakerNote({
      body: value.body,
      cue: typeof value.cue === "string" ? value.cue : undefined,
    });
  }

  return {
    version: speakerNotesFileVersion,
    deckId: speakerNotesDeckId,
    notes,
  };
}

export function serializeSpeakerNotesFile(file: SpeakerNotesFile) {
  const sortedNotes = Object.fromEntries(
    Object.entries(file.notes).sort(([left], [right]) => left.localeCompare(right)),
  );

  return `${JSON.stringify({ ...file, notes: sortedNotes }, null, 2)}\n`;
}

export function getSpeakerNote(file: SpeakerNotesFile, frameId: string): SpeakerNote {
  return file.notes[frameId] ?? { body: "" };
}

export function updateSpeakerNote(
  file: SpeakerNotesFile,
  frameId: string,
  note: SpeakerNote,
): SpeakerNotesFile {
  const normalized = normalizeSpeakerNote(note);
  const notes = { ...file.notes };

  if (!normalized.body && !normalized.cue) {
    delete notes[frameId];
  } else {
    notes[frameId] = normalized;
  }

  return { ...file, notes };
}

function normalizeSpeakerNote(note: SpeakerNote): SpeakerNote {
  const body = note.body.replace(/\r\n/g, "\n");
  const cue = note.cue?.trim();

  return cue ? { body, cue } : { body };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
