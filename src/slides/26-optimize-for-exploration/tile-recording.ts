export type TileRecordingEvent = {
  tileId: number;
  atMs: number;
};

export type TileRecording = {
  version: 1;
  rows: number;
  columns: number;
  events: TileRecordingEvent[];
};

export type TilePlaybackStep = TileRecordingEvent & {
  delayMs: number;
};

export type TileCursorCenter = {
  xPercent: number;
  yPercent: number;
};

export const tileRevealMinRows = 2;
export const tileRevealMaxRows = 16;
export const tileRevealMinColumns = 2;
export const tileRevealMaxColumns = 24;

const gridVerticalInsetPercent = 16;
const gridHorizontalInsetPercent = 9;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasValidDimensions(rows: unknown, columns: unknown) {
  return (
    Number.isSafeInteger(rows)
    && Number.isSafeInteger(columns)
    && (rows as number) >= tileRevealMinRows
    && (rows as number) <= tileRevealMaxRows
    && (columns as number) >= tileRevealMinColumns
    && (columns as number) <= tileRevealMaxColumns
    && Number.isSafeInteger((rows as number) * (columns as number))
  );
}

export function isTileRecording(value: unknown): value is TileRecording {
  if (!isObject(value)) {
    return false;
  }

  const { version, rows, columns, events } = value;
  if (
    version !== 1
    || !hasValidDimensions(rows, columns)
    || !Array.isArray(events)
  ) {
    return false;
  }

  const tileCount = (rows as number) * (columns as number);
  const seenTileIds = new Set<number>();
  let previousAtMs = 0;

  for (const event of events) {
    if (!isObject(event)) {
      return false;
    }

    const { tileId, atMs } = event;
    if (
      !Number.isSafeInteger(tileId)
      || (tileId as number) < 0
      || (tileId as number) >= tileCount
      || seenTileIds.has(tileId as number)
      || typeof atMs !== "number"
      || !Number.isFinite(atMs)
      || atMs < 0
      || atMs < previousAtMs
    ) {
      return false;
    }

    seenTileIds.add(tileId as number);
    previousAtMs = atMs;
  }

  return true;
}

function copyTileRecording(recording: TileRecording): TileRecording {
  return {
    version: 1,
    rows: recording.rows,
    columns: recording.columns,
    events: recording.events.map(({ tileId, atMs }) => ({ tileId, atMs })),
  };
}

function assertTileRecording(recording: unknown): asserts recording is TileRecording {
  if (!isTileRecording(recording)) {
    throw new TypeError("Invalid tile recording");
  }
}

function assertGridAndTile(tileId: number, rows: number, columns: number) {
  if (!hasValidDimensions(rows, columns)) {
    throw new RangeError("Tile grid dimensions are outside the supported range");
  }

  if (
    !Number.isSafeInteger(tileId)
    || tileId < 0
    || tileId >= rows * columns
  ) {
    throw new RangeError(`Tile ${tileId} is outside the ${rows} by ${columns} grid`);
  }
}

export function parseTileRecording(serialized: string): TileRecording | undefined {
  let parsed: unknown;

  try {
    parsed = JSON.parse(serialized);
  } catch {
    return undefined;
  }

  return isTileRecording(parsed) ? copyTileRecording(parsed) : undefined;
}

export function serializeTileRecording(recording: TileRecording): string {
  assertTileRecording(recording);
  return JSON.stringify(copyTileRecording(recording));
}

export function appendTileRecordingEvent(
  recording: TileRecording,
  tileId: number,
  atMs: number,
): TileRecording {
  assertTileRecording(recording);
  assertGridAndTile(tileId, recording.rows, recording.columns);

  if (typeof atMs !== "number" || !Number.isFinite(atMs) || atMs < 0) {
    throw new RangeError("Tile event time must be a non-negative finite number");
  }

  if (recording.events.some((event) => event.tileId === tileId)) {
    throw new RangeError(`Tile ${tileId} has already been recorded`);
  }

  const previousEvent = recording.events.at(-1);
  if (previousEvent && atMs < previousEvent.atMs) {
    throw new RangeError(
      `Tile event time ${atMs} is earlier than the previous event at ${previousEvent.atMs}`,
    );
  }

  return {
    ...copyTileRecording(recording),
    events: [
      ...recording.events.map(({ tileId: recordedTileId, atMs: recordedAtMs }) => ({
        tileId: recordedTileId,
        atMs: recordedAtMs,
      })),
      { tileId, atMs },
    ],
  };
}

export function createTilePlaybackSchedule(
  recording: TileRecording,
): TilePlaybackStep[] {
  assertTileRecording(recording);

  return recording.events.map((event, index) => ({
    tileId: event.tileId,
    atMs: event.atMs,
    delayMs: event.atMs - (recording.events[index - 1]?.atMs ?? 0),
  }));
}

export function getTileCursorCenter(
  tileId: number,
  rows: number,
  columns: number,
): TileCursorCenter {
  assertGridAndTile(tileId, rows, columns);

  const row = Math.floor(tileId / columns);
  const column = tileId % columns;
  const gridWidthPercent = 100 - (2 * gridHorizontalInsetPercent);
  const gridHeightPercent = 100 - (2 * gridVerticalInsetPercent);

  return {
    xPercent:
      gridHorizontalInsetPercent
      + ((column + 0.5) / columns) * gridWidthPercent,
    yPercent:
      gridVerticalInsetPercent
      + ((row + 0.5) / rows) * gridHeightPercent,
  };
}
