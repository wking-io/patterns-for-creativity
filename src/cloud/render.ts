import type { CloudSettings, Segment, Vec2 } from "./types";

export function drawBackground(ctx: CanvasRenderingContext2D, width: number, height: number, settings: CloudSettings) {
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, settings.style.backgroundGradient[0]);
  gradient.addColorStop(0.45, settings.style.backgroundGradient[1]);
  gradient.addColorStop(1, settings.style.backgroundGradient[2]);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

export function drawDotGrid(ctx: CanvasRenderingContext2D, width: number, height: number, settings: CloudSettings) {
  if (settings.dots.opacity <= 0 || settings.dots.radius <= 0) return;

  const spacing = Math.max(0.001, settings.dots.spacing);
  const radius = Math.max(0.001, settings.dots.radius);

  ctx.save();
  ctx.globalAlpha = settings.dots.opacity;
  ctx.fillStyle = settings.dots.color;

  for (let y = spacing / 2, row = 0; y < height + spacing; y += spacing, row += 1) {
    const offset = row % 2 === 0 ? 0 : spacing / 2;

    for (let x = spacing / 2 + offset; x < width + spacing; x += spacing) {
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

export function drawCloudFieldFill(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  values: Float32Array,
  cols: number,
  rows: number,
  cellSize: number,
  thresholds: readonly number[],
  settings: CloudSettings,
) {
  const fillLayer = getFillLayer(width, height);
  const layerCtx = fillLayer.getContext("2d");
  if (!layerCtx) return;

  layerCtx.clearRect(0, 0, width, height);

  for (let index = 0; index < thresholds.length; index += 1) {
    layerCtx.globalCompositeOperation = index % 2 === 0 ? "source-over" : "destination-out";
    drawThresholdFieldFill(layerCtx, values, cols, rows, cellSize, thresholds[index], settings.style.cloudFillColor);
  }

  layerCtx.globalCompositeOperation = "source-over";
  ctx.drawImage(fillLayer, 0, 0, width, height);
}

function drawThresholdFieldFill(
  ctx: CanvasRenderingContext2D,
  values: Float32Array,
  cols: number,
  rows: number,
  cellSize: number,
  threshold: number,
  fillColor: string,
) {
  ctx.save();
  ctx.fillStyle = fillColor;
  ctx.beginPath();

  for (let row = 0; row < rows - 1; row += 1) {
    for (let col = 0; col < cols - 1; col += 1) {
      const x = col * cellSize;
      const y = row * cellSize;
      const topLeftValue = values[row * cols + col];
      const topRightValue = values[row * cols + col + 1];
      const bottomRightValue = values[(row + 1) * cols + col + 1];
      const bottomLeftValue = values[(row + 1) * cols + col];
      const corners = [
        { x, y, value: topLeftValue },
        { x: x + cellSize, y, value: topRightValue },
        { x: x + cellSize, y: y + cellSize, value: bottomRightValue },
        { x, y: y + cellSize, value: bottomLeftValue },
      ];
      const caseIndex =
        (topLeftValue >= threshold ? 8 : 0) |
        (topRightValue >= threshold ? 4 : 0) |
        (bottomRightValue >= threshold ? 2 : 0) |
        (bottomLeftValue >= threshold ? 1 : 0);

      if (caseIndex === 0) continue;

      if (caseIndex === 15) {
        drawFillPolygon(ctx, corners);
        continue;
      }

      if (caseIndex === 5) {
        drawFillPolygon(ctx, [
          edgeIntersection(corners[0], corners[1], threshold),
          corners[1],
          edgeIntersection(corners[1], corners[2], threshold),
        ]);
        drawFillPolygon(ctx, [
          edgeIntersection(corners[2], corners[3], threshold),
          corners[3],
          edgeIntersection(corners[3], corners[0], threshold),
        ]);
        continue;
      }

      if (caseIndex === 10) {
        drawFillPolygon(ctx, [
          corners[0],
          edgeIntersection(corners[0], corners[1], threshold),
          edgeIntersection(corners[3], corners[0], threshold),
        ]);
        drawFillPolygon(ctx, [
          edgeIntersection(corners[1], corners[2], threshold),
          corners[2],
          edgeIntersection(corners[2], corners[3], threshold),
        ]);
        continue;
      }

      drawFillPolygon(ctx, getInsidePolygon(corners, threshold));
    }
  }

  ctx.fill();
  ctx.restore();
}

let fillLayer: HTMLCanvasElement | undefined;

function getFillLayer(width: number, height: number) {
  const nextWidth = Math.max(1, Math.ceil(width));
  const nextHeight = Math.max(1, Math.ceil(height));

  if (!fillLayer) {
    fillLayer = document.createElement("canvas");
  }

  if (fillLayer.width !== nextWidth || fillLayer.height !== nextHeight) {
    fillLayer.width = nextWidth;
    fillLayer.height = nextHeight;
  }

  return fillLayer;
}

function getInsidePolygon(corners: readonly (Vec2 & { value: number })[], threshold: number) {
  const polygon: (Vec2 & { value: number })[] = [];

  for (let index = 0; index < corners.length; index += 1) {
    const current = corners[index];
    const next = corners[(index + 1) % corners.length];
    const currentInside = current.value >= threshold;
    const nextInside = next.value >= threshold;

    if (currentInside) {
      polygon.push(current);
    }

    if (currentInside !== nextInside) {
      polygon.push(edgeIntersection(current, next, threshold));
    }
  }

  return polygon;
}

function drawFillPolygon(ctx: CanvasRenderingContext2D, points: readonly Vec2[]) {
  if (points.length < 3) return;

  ctx.moveTo(points[0].x, points[0].y);

  for (let index = 1; index < points.length; index += 1) {
    ctx.lineTo(points[index].x, points[index].y);
  }

  ctx.closePath();
}

function edgeIntersection(p1: Vec2 & { value: number }, p2: Vec2 & { value: number }, threshold: number) {
  const range = p2.value - p1.value;
  const t = Math.abs(range) < 0.000001 ? 0.5 : (threshold - p1.value) / range;

  return {
    x: p1.x + (p2.x - p1.x) * t,
    y: p1.y + (p2.y - p1.y) * t,
    value: threshold,
  };
}

export function drawSegments(
  ctx: CanvasRenderingContext2D,
  segmentsByThreshold: readonly Segment[][],
  settings: CloudSettings,
) {
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = settings.style.strokeColor;
  ctx.lineWidth = settings.style.lineWidth;

  for (let index = 0; index < segmentsByThreshold.length; index += 1) {
    const segments = segmentsByThreshold[index];
    ctx.globalAlpha = 1 - (index / segmentsByThreshold.length) * 0.42;
    ctx.beginPath();

    for (const path of chainSegments(segments)) {
      drawSmoothPath(ctx, path);
    }

    ctx.stroke();
  }

  ctx.restore();
}

function chainSegments(segments: readonly Segment[]) {
  const adjacency = new Map<string, number[]>();
  const visited = new Uint8Array(segments.length);

  segments.forEach((segment, index) => {
    addEndpoint(adjacency, pointKey(segment.a), index);
    addEndpoint(adjacency, pointKey(segment.b), index);
  });

  const paths = [];

  for (let index = 0; index < segments.length; index += 1) {
    if (visited[index]) continue;

    visited[index] = 1;
    const segment = segments[index];
    const path = [segment.a, segment.b];

    extendPath(path, adjacency, segments, visited, "end");
    extendPath(path, adjacency, segments, visited, "start");

    paths.push(path);
  }

  return paths;
}

function addEndpoint(adjacency: Map<string, number[]>, key: string, segmentIndex: number) {
  const existing = adjacency.get(key);

  if (existing) {
    existing.push(segmentIndex);
  } else {
    adjacency.set(key, [segmentIndex]);
  }
}

function extendPath(
  path: { x: number; y: number }[],
  adjacency: Map<string, number[]>,
  segments: readonly Segment[],
  visited: Uint8Array,
  side: "start" | "end",
) {
  for (;;) {
    const point = side === "start" ? path[0] : path[path.length - 1];
    const candidates = adjacency.get(pointKey(point));
    const nextIndex = candidates?.find((candidate) => !visited[candidate]);

    if (nextIndex === undefined) return;

    visited[nextIndex] = 1;
    const next = segments[nextIndex];
    const nextPoint = samePoint(point, next.a) ? next.b : next.a;

    if (side === "start") {
      path.unshift(nextPoint);
    } else {
      path.push(nextPoint);
    }
  }
}

function drawSmoothPath(ctx: CanvasRenderingContext2D, points: readonly { x: number; y: number }[]) {
  if (points.length < 2) return;

  const closed = samePoint(points[0], points[points.length - 1]);
  const basePoints = closed ? points.slice(0, -1) : [...points];
  const smoothPoints = softenCorners(basePoints, closed, 1);

  if (smoothPoints.length < 2) return;

  if (smoothPoints.length === 2) {
    ctx.moveTo(smoothPoints[0].x, smoothPoints[0].y);
    ctx.lineTo(smoothPoints[1].x, smoothPoints[1].y);
    return;
  }

  drawCatmullRomPath(ctx, smoothPoints, closed);
}

function softenCorners(points: readonly { x: number; y: number }[], closed: boolean, iterations: number) {
  let result = [...points];

  for (let iteration = 0; iteration < iterations; iteration += 1) {
    if (result.length < 3) return result;

    const next = closed ? [] : [result[0]];
    const limit = closed ? result.length : result.length - 1;

    for (let index = 0; index < limit; index += 1) {
      const a = result[index];
      const b = result[(index + 1) % result.length];
      next.push(
        {
          x: a.x * 0.75 + b.x * 0.25,
          y: a.y * 0.75 + b.y * 0.25,
        },
        {
          x: a.x * 0.25 + b.x * 0.75,
          y: a.y * 0.25 + b.y * 0.75,
        },
      );
    }

    if (!closed) {
      next.push(result[result.length - 1]);
    }

    result = next;
  }

  return result;
}

function drawCatmullRomPath(ctx: CanvasRenderingContext2D, points: readonly { x: number; y: number }[], closed: boolean) {
  const tension = 0.72;
  ctx.moveTo(points[0].x, points[0].y);

  const segmentCount = closed ? points.length : points.length - 1;

  for (let index = 0; index < segmentCount; index += 1) {
    const p0 = closed ? points[(index - 1 + points.length) % points.length] : points[Math.max(0, index - 1)];
    const p1 = points[index];
    const p2 = points[(index + 1) % points.length];
    const p3 = closed ? points[(index + 2) % points.length] : points[Math.min(points.length - 1, index + 2)];
    const cp1 = {
      x: p1.x + ((p2.x - p0.x) * tension) / 6,
      y: p1.y + ((p2.y - p0.y) * tension) / 6,
    };
    const cp2 = {
      x: p2.x - ((p3.x - p1.x) * tension) / 6,
      y: p2.y - ((p3.y - p1.y) * tension) / 6,
    };

    ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, p2.x, p2.y);
  }

  if (closed) {
    ctx.closePath();
  }
}

function samePoint(a: { x: number; y: number }, b: { x: number; y: number }) {
  return pointKey(a) === pointKey(b);
}

function pointKey(point: { x: number; y: number }) {
  return `${Math.round(point.x * 2)},${Math.round(point.y * 2)}`;
}
