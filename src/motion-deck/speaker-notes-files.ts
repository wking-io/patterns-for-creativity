import {
  defaultSpeakerNotesFileName,
  serializeSpeakerNotesFile,
} from "./speaker-notes.js";
import type { SpeakerNotesFile } from "./speaker-notes.js";

export type WritableNotesFileHandle = {
  name: string;
  getFile: () => Promise<File>;
  createWritable: () => Promise<{
    write: (contents: string) => Promise<void>;
    close: () => Promise<void>;
  }>;
};

export type OpenedNotesFile = {
  contents: string;
  fileName: string;
  handle?: WritableNotesFileHandle;
};

type NotesFilePickerWindow = Window & {
  showOpenFilePicker?: (options: object) => Promise<WritableNotesFileHandle[]>;
  showSaveFilePicker?: (options: object) => Promise<WritableNotesFileHandle>;
};

const pickerOptions = {
  types: [{
    description: "Speaker notes",
    accept: { "application/json": [".json"] },
  }],
};

export function supportsPersistentNotesFiles(browserWindow: Window = window) {
  const pickerWindow = browserWindow as NotesFilePickerWindow;

  return Boolean(pickerWindow.showOpenFilePicker && pickerWindow.showSaveFilePicker);
}

export async function openSpeakerNotesFile(browserWindow: Window = window): Promise<OpenedNotesFile> {
  const pickerWindow = browserWindow as NotesFilePickerWindow;

  if (pickerWindow.showOpenFilePicker) {
    const [handle] = await pickerWindow.showOpenFilePicker({
      ...pickerOptions,
      multiple: false,
    });

    if (!handle) {
      throw new Error("No notes file was selected.");
    }

    const file = await handle.getFile();

    return {
      contents: await file.text(),
      fileName: file.name,
      handle,
    };
  }

  return openSpeakerNotesFileWithInput(browserWindow.document);
}

export async function createSpeakerNotesFile(
  document: SpeakerNotesFile,
  browserWindow: Window = window,
): Promise<{ fileName: string; handle?: WritableNotesFileHandle; persisted: boolean }> {
  const pickerWindow = browserWindow as NotesFilePickerWindow;

  if (!pickerWindow.showSaveFilePicker) {
    return { fileName: defaultSpeakerNotesFileName, persisted: false };
  }

  const handle = await pickerWindow.showSaveFilePicker({
    ...pickerOptions,
    suggestedName: defaultSpeakerNotesFileName,
  });
  await writeSpeakerNotesFile(handle, document);

  return { fileName: handle.name, handle, persisted: true };
}

export async function saveSpeakerNotesFile(
  document: SpeakerNotesFile,
  handle: WritableNotesFileHandle | undefined,
  fileName = defaultSpeakerNotesFileName,
  browserWindow: Window = window,
) {
  if (handle) {
    await writeSpeakerNotesFile(handle, document);
    return { fileName: handle.name, handle, mode: "overwrite" as const };
  }

  const pickerWindow = browserWindow as NotesFilePickerWindow;

  if (pickerWindow.showSaveFilePicker) {
    const nextHandle = await pickerWindow.showSaveFilePicker({
      ...pickerOptions,
      suggestedName: fileName,
    });
    await writeSpeakerNotesFile(nextHandle, document);
    return { fileName: nextHandle.name, handle: nextHandle, mode: "overwrite" as const };
  }

  downloadSpeakerNotesFile(document, fileName, browserWindow.document);
  return { fileName, handle: undefined, mode: "download" as const };
}

export function isFilePickerAbort(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}

async function writeSpeakerNotesFile(
  handle: WritableNotesFileHandle,
  document: SpeakerNotesFile,
) {
  const writable = await handle.createWritable();
  await writable.write(serializeSpeakerNotesFile(document));
  await writable.close();
}

function openSpeakerNotesFileWithInput(document: Document): Promise<OpenedNotesFile> {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,application/json";
    input.style.display = "none";

    const removeInput = () => input.remove();

    input.addEventListener("change", async () => {
      const file = input.files?.[0];

      if (!file) {
        removeInput();
        reject(new DOMException("No file selected.", "AbortError"));
        return;
      }

      try {
        resolve({ contents: await file.text(), fileName: file.name });
      } catch (error) {
        reject(error);
      } finally {
        removeInput();
      }
    }, { once: true });

    input.addEventListener("cancel", () => {
      removeInput();
      reject(new DOMException("No file selected.", "AbortError"));
    }, { once: true });

    document.body.append(input);
    input.click();
  });
}

function downloadSpeakerNotesFile(
  document: SpeakerNotesFile,
  fileName: string,
  browserDocument: Document,
) {
  const blob = new Blob([serializeSpeakerNotesFile(document)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = browserDocument.createElement("a");
  link.download = fileName;
  link.href = url;
  link.style.display = "none";
  browserDocument.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
