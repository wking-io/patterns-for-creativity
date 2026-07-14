export const presenterPreferencesStorageKey = "patterns-for-creativity-presenter-preferences";
export const notesTextSizeOptions = [16, 18, 20, 22, 24, 26, 28, 30, 32] as const;
export const defaultNotesTextSize = 20;

export type ElapsedTimerState = {
  status: "idle" | "running" | "paused";
  accumulatedMs: number;
  startedAt?: number;
};

export type ElapsedTimerAction =
  | { type: "start"; at: number }
  | { type: "pause"; at: number }
  | { type: "resume"; at: number }
  | { type: "reset" };

export type NotesTextSizeAction = "increase" | "decrease" | "reset";

type PreferenceStorage = Pick<Storage, "getItem" | "setItem">;

export function createElapsedTimerState(): ElapsedTimerState {
  return {
    status: "idle",
    accumulatedMs: 0,
  };
}

export function elapsedTimerReducer(
  state: ElapsedTimerState,
  action: ElapsedTimerAction,
): ElapsedTimerState {
  switch (action.type) {
    case "start":
      return state.status === "idle"
        ? {
            status: "running",
            accumulatedMs: 0,
            startedAt: action.at,
          }
        : state;
    case "pause":
      return state.status === "running" && state.startedAt !== undefined
        ? {
            status: "paused",
            accumulatedMs: state.accumulatedMs + Math.max(0, action.at - state.startedAt),
          }
        : state;
    case "resume":
      return state.status === "paused"
        ? {
            ...state,
            status: "running",
            startedAt: action.at,
          }
        : state;
    case "reset":
      return createElapsedTimerState();
  }
}

export function getElapsedMilliseconds(state: ElapsedTimerState, now: number) {
  if (state.status !== "running" || state.startedAt === undefined) {
    return state.accumulatedMs;
  }

  return state.accumulatedMs + Math.max(0, now - state.startedAt);
}

export function formatElapsedTime(elapsedMs: number) {
  const totalSeconds = Math.max(0, Math.floor(elapsedMs / 1_000));
  const hours = Math.floor(totalSeconds / 3_600);
  const minutes = Math.floor(totalSeconds % 3_600 / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((part) => part.toString().padStart(2, "0"))
    .join(":");
}

export function updateNotesTextSize(
  currentSize: number,
  action: NotesTextSizeAction,
) {
  if (action === "reset") {
    return defaultNotesTextSize;
  }

  const normalizedSize = normalizeNotesTextSize(currentSize);
  const currentIndex = notesTextSizeOptions.indexOf(
    normalizedSize as typeof notesTextSizeOptions[number],
  );
  const offset = action === "increase" ? 1 : -1;
  const nextIndex = Math.min(
    notesTextSizeOptions.length - 1,
    Math.max(0, currentIndex + offset),
  );

  return notesTextSizeOptions[nextIndex] ?? defaultNotesTextSize;
}

export function readNotesTextSize(storage?: PreferenceStorage) {
  if (!storage) {
    return defaultNotesTextSize;
  }

  try {
    const source = storage.getItem(presenterPreferencesStorageKey);

    if (!source) {
      return defaultNotesTextSize;
    }

    const value: unknown = JSON.parse(source);

    if (
      typeof value !== "object" ||
      value === null ||
      !("notesTextSize" in value) ||
      typeof value.notesTextSize !== "number" ||
      !Number.isFinite(value.notesTextSize)
    ) {
      return defaultNotesTextSize;
    }

    return normalizeNotesTextSize(value.notesTextSize);
  } catch {
    return defaultNotesTextSize;
  }
}

export function writeNotesTextSize(storage: PreferenceStorage | undefined, notesTextSize: number) {
  if (!storage) {
    return false;
  }

  try {
    storage.setItem(
      presenterPreferencesStorageKey,
      JSON.stringify({ notesTextSize: normalizeNotesTextSize(notesTextSize) }),
    );
    return true;
  } catch {
    return false;
  }
}

function normalizeNotesTextSize(size: number) {
  return notesTextSizeOptions.reduce((closest, option) => (
    Math.abs(option - size) < Math.abs(closest - size) ? option : closest
  ));
}
