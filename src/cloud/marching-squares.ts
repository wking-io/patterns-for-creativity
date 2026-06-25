import type { Segment, Vec2 } from "./types";

type EdgeName = "top" | "right" | "bottom" | "left";

const caseEdges: Record<number, [EdgeName, EdgeName][]> = {
  0: [],
  1: [["left", "bottom"]],
  2: [["bottom", "right"]],
  3: [["left", "right"]],
  4: [["top", "right"]],
  5: [
    ["top", "left"],
    ["bottom", "right"],
  ],
  6: [["top", "bottom"]],
  7: [["top", "left"]],
  8: [["left", "top"]],
  9: [["top", "bottom"]],
  10: [
    ["left", "bottom"],
    ["top", "right"],
  ],
  11: [["top", "right"]],
  12: [["left", "right"]],
  13: [["bottom", "right"]],
  14: [["left", "bottom"]],
  15: [],
};

export function extractContours(
  values: Float32Array,
  cols: number,
  rows: number,
  cellSize: number,
  threshold: number,
  segments: Segment[] = [],
) {
  segments.length = 0;

  // Marching squares reads each grid cell's four corners, classifies the 16 cases, then interpolates edge crossings.
  for (let row = 0; row < rows - 1; row += 1) {
    for (let col = 0; col < cols - 1; col += 1) {
      const x = col * cellSize;
      const y = row * cellSize;
      const topLeft = values[row * cols + col];
      const topRight = values[row * cols + col + 1];
      const bottomRight = values[(row + 1) * cols + col + 1];
      const bottomLeft = values[(row + 1) * cols + col];
      const caseIndex =
        (topLeft >= threshold ? 8 : 0) |
        (topRight >= threshold ? 4 : 0) |
        (bottomRight >= threshold ? 2 : 0) |
        (bottomLeft >= threshold ? 1 : 0);
      const edges = caseEdges[caseIndex];

      for (const [first, second] of edges) {
        segments.push({
          a: edgePoint(first, x, y, cellSize, topLeft, topRight, bottomRight, bottomLeft, threshold),
          b: edgePoint(second, x, y, cellSize, topLeft, topRight, bottomRight, bottomLeft, threshold),
        });
      }
    }
  }

  return segments;
}

function edgePoint(
  edge: EdgeName,
  x: number,
  y: number,
  cellSize: number,
  topLeft: number,
  topRight: number,
  bottomRight: number,
  bottomLeft: number,
  threshold: number,
) {
  switch (edge) {
    case "top":
      return interpolate({ x, y }, { x: x + cellSize, y }, topLeft, topRight, threshold);
    case "right":
      return interpolate({ x: x + cellSize, y }, { x: x + cellSize, y: y + cellSize }, topRight, bottomRight, threshold);
    case "bottom":
      return interpolate({ x: x + cellSize, y: y + cellSize }, { x, y: y + cellSize }, bottomRight, bottomLeft, threshold);
    case "left":
      return interpolate({ x, y: y + cellSize }, { x, y }, bottomLeft, topLeft, threshold);
  }
}

function interpolate(p1: Vec2, p2: Vec2, v1: number, v2: number, threshold: number): Vec2 {
  const range = v2 - v1;
  const t = Math.abs(range) < 0.000001 ? 0.5 : (threshold - v1) / range;

  return {
    x: p1.x + (p2.x - p1.x) * t,
    y: p1.y + (p2.y - p1.y) * t,
  };
}
