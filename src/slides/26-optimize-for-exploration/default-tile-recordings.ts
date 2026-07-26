import type { TileRecording } from "./tile-recording";

const defaultTileRecordings: Readonly<Record<string, TileRecording>> = {
  "optimize-exploration-scratch": {
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
  },
  "optimize-exploration-tiles-2": {
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
  },
};

export function getDefaultTileRecording(
  frameId: string,
): TileRecording | undefined {
  const recording = defaultTileRecordings[frameId];

  return recording
    ? {
        ...recording,
        events: recording.events.map((event) => ({ ...event })),
      }
    : undefined;
}
