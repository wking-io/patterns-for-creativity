import presentationNotes from "./presentation-notes.json";
import {
  parseSpeakerNotesFile,
  serializeSpeakerNotesFile,
  speakerNotesSaveEndpoint,
} from "./speaker-notes.js";
import type { SpeakerNotesFile } from "./speaker-notes.js";

export const presentationSpeakerNotesFileName = "presentation-notes.json";

export function getPresentationSpeakerNotes() {
  return parseSpeakerNotesFile(JSON.stringify(presentationNotes));
}

export async function savePresentationSpeakerNotes(
  document: SpeakerNotesFile,
  request: typeof fetch = fetch,
) {
  const response = await request(speakerNotesSaveEndpoint, {
    body: serializeSpeakerNotesFile(document),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || "The presentation could not save its speaker notes.");
  }
}
