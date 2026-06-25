// Prototype: vector-drawn foam cell contours, mounted at /prototype/simplex-foam.
import { useEffect, useMemo, useRef } from "react";
import type { DialConfig, ResolvedValues } from "dialkit";
import { useDialKitController } from "dialkit";
import { createSeededRandom, randomBetween } from "./cloud/random";
import { slideHeight, slideWidth } from "./slideMetrics";

const slider = (value: number, min: number, max: number, step?: number) =>
  (step === undefined ? [value, min, max] : [value, min, max, step]) as [number, number, number, number?];
const toggle = (value: boolean): boolean => value;
const color = (value: string) => ({ type: "color", default: value }) as const;

const simplexFoamDialConfig = {
  seed: slider(137, 1, 9999, 1),
  field: {
    cellScale: slider(1.24, 0.65, 1.65, 0.01),
    contourWidth: slider(0.12, 0.04, 0.38, 0.001),
    roundness: slider(0.44, 0.1, 1, 0.01),
    irregularity: slider(0.34, 0, 0.55, 0.01),
    connectorBias: slider(0, 0, 1, 0.01),
  },
  motion: {
    speed: slider(0.08, 0, 0.8, 0.01),
    morphSpeed: slider(0.18, 0, 1.2, 0.01),
    morphAmount: slider(0.2, 0, 1, 0.01),
    sizePulse: slider(0.045, 0, 0.3, 0.001),
    driftX: slider(0, -0.4, 0.4, 0.001),
    driftY: slider(0, -0.4, 0.4, 0.001),
    pause: toggle(false),
  },
  style: {
    background: color("#ffffff"),
    foam: color("#ffffff"),
    border: color("#050505"),
    borderPixels: slider(1, 0, 12, 0.25),
  },
} satisfies DialConfig;

type SimplexFoamDials = ResolvedValues<typeof simplexFoamDialConfig>;

type Vec2 = {
  x: number;
  y: number;
};

type FoamCell = {
  x: number;
  y: number;
  rx: number;
  ry: number;
  angle: number;
  phase: number;
  wobbleA: number;
  wobbleB: number;
  driftA: Vec2;
  driftB: Vec2;
  drawOrder: number;
};

export function SimplexFoamPrototype() {
  const dial = useDialKitController("Simplex Foam Prototype", simplexFoamDialConfig, {
    id: "prototype-simplex-foam-vector-v2",
    persist: true,
  });

  return (
    <main className="simplex-foam-page">
      <div className="simplex-foam-stage">
        <SimplexFoamCanvas values={dial.values} />
      </div>
    </main>
  );
}

function SimplexFoamCanvas({ values }: { values: SimplexFoamDials }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const valuesRef = useRef(values);
  const cells = useMemo(() => createFoamCells(values.seed), [values.seed]);
  valuesRef.current = values;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    let animationFrame = 0;
    let lastNow = performance.now();
    let time = 0;

    const draw = (now: number) => {
      const current = valuesRef.current;
      const dt = Math.min(0.033, (now - lastNow) / 1000);
      lastNow = now;
      if (!current.motion.pause) {
        time += dt;
      }

      if (canvas.width !== Math.round(slideWidth) || canvas.height !== Math.round(slideHeight)) {
        canvas.width = Math.round(slideWidth);
        canvas.height = Math.round(slideHeight);
      }

      drawFoamLayer(ctx, cells, current, time);
      animationFrame = requestAnimationFrame(draw);
    };

    animationFrame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [cells]);

  return <canvas aria-label="2D canvas foam contour prototype" className="simplex-foam-canvas" ref={canvasRef} />;
}

function createFoamCells(seed: number) {
  const random = createSeededRandom(seed);
  const cells: FoamCell[] = [];
  const columns = 6;
  const rows = 4;

  for (let row = -1; row <= rows; row += 1) {
    for (let column = -1; column <= columns; column += 1) {
      const edge = row < 0 || column < 0 || row >= rows || column >= columns;
      const spacingX = slideWidth / columns;
      const spacingY = slideHeight / rows;
      const jitterX = randomBetween(random, -0.3, 0.3) * spacingX;
      const jitterY = randomBetween(random, -0.3, 0.3) * spacingY;
      const baseX = (column + 0.5) * spacingX + jitterX;
      const baseY = (row + 0.5) * spacingY + jitterY;
      const scale = edge ? randomBetween(random, 1.05, 1.36) : randomBetween(random, 0.78, 1.18);

      cells.push({
        x: baseX,
        y: baseY,
        rx: spacingX * randomBetween(random, 0.44, 0.68) * scale,
        ry: spacingY * randomBetween(random, 0.44, 0.68) * scale,
        angle: randomBetween(random, -0.46, 0.46),
        phase: randomBetween(random, 0, Math.PI * 2),
        wobbleA: randomBetween(random, 0.7, 1.35),
        wobbleB: randomBetween(random, 0.7, 1.35),
        driftA: {
          x: randomBetween(random, -1, 1) * spacingX,
          y: randomBetween(random, -1, 1) * spacingY,
        },
        driftB: {
          x: randomBetween(random, -1, 1) * spacingX,
          y: randomBetween(random, -1, 1) * spacingY,
        },
        drawOrder: random(),
      });
    }
  }

  return cells.sort((a, b) => a.drawOrder - b.drawOrder);
}

function drawFoamLayer(ctx: CanvasRenderingContext2D, cells: FoamCell[], values: SimplexFoamDials, time: number) {
  const travelTime = time * values.motion.speed;
  const morphTime = time * values.motion.morphSpeed;

  ctx.clearRect(0, 0, slideWidth, slideHeight);
  ctx.fillStyle = values.style.background;
  ctx.fillRect(0, 0, slideWidth, slideHeight);
  ctx.save();
  ctx.fillStyle = values.style.foam;
  ctx.strokeStyle = values.style.border;
  ctx.lineWidth = values.style.borderPixels;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  for (const cell of cells) {
    const path = createCellPath(cell, values, travelTime, morphTime);
    drawClosedSpline(ctx, path);
    ctx.fill();
    if (values.style.borderPixels > 0) {
      ctx.stroke();
    }
  }

  if (values.field.connectorBias > 0 && values.style.borderPixels > 0) {
    drawSoftConnectors(ctx, cells, values, travelTime, morphTime);
  }

  ctx.restore();
}

function createCellPath(cell: FoamCell, values: SimplexFoamDials, travelTime: number, morphTime: number) {
  const pointCount = 16;
  const centerX =
    cell.x +
    values.motion.driftX * travelTime * slideWidth +
    Math.sin(morphTime * 0.87 + cell.phase) * cell.driftA.x * values.motion.morphAmount * 0.08 +
    Math.sin(morphTime * 0.53 + cell.phase * 1.7) * cell.driftB.x * values.motion.morphAmount * 0.05;
  const centerY =
    cell.y +
    values.motion.driftY * travelTime * slideHeight +
    Math.cos(morphTime * 0.81 + cell.phase) * cell.driftA.y * values.motion.morphAmount * 0.08 +
    Math.cos(morphTime * 0.49 + cell.phase * 1.3) * cell.driftB.y * values.motion.morphAmount * 0.05;
  const pulse = 1 + Math.sin(morphTime * 1.2 + cell.phase) * values.motion.sizePulse;
  const rx = cell.rx * values.field.cellScale * pulse * (1 - values.field.contourWidth * 0.15);
  const ry = cell.ry * values.field.cellScale * (2 - pulse) * (1 - values.field.contourWidth * 0.15);
  const angle = cell.angle + Math.sin(morphTime * 0.31 + cell.phase) * values.motion.morphAmount * 0.12;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const points: Vec2[] = [];

  for (let index = 0; index < pointCount; index += 1) {
    const theta = (index / pointCount) * Math.PI * 2;
    const shapeWobble =
      1 +
      values.field.irregularity *
        0.18 *
        ((1 - values.field.roundness) * Math.sin(theta * 2 + cell.phase) +
          Math.sin(theta * 3 + cell.phase * 0.7 + morphTime * 0.55) * cell.wobbleA +
          Math.sin(theta * 4 - cell.phase * 0.5 - morphTime * 0.37) * cell.wobbleB * 0.45);
    const localX = Math.cos(theta) * rx * shapeWobble;
    const localY = Math.sin(theta) * ry * shapeWobble;

    points.push({
      x: centerX + localX * cos - localY * sin,
      y: centerY + localX * sin + localY * cos,
    });
  }

  return points;
}

function drawClosedSpline(ctx: CanvasRenderingContext2D, points: Vec2[]) {
  if (points.length < 3) return;

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  for (let index = 0; index < points.length; index += 1) {
    const current = points[index];
    const next = points[(index + 1) % points.length];
    const previous = points[(index - 1 + points.length) % points.length];
    const afterNext = points[(index + 2) % points.length];
    const tension = 0.72;
    const cp1 = {
      x: current.x + ((next.x - previous.x) / 6) * tension,
      y: current.y + ((next.y - previous.y) / 6) * tension,
    };
    const cp2 = {
      x: next.x - ((afterNext.x - current.x) / 6) * tension,
      y: next.y - ((afterNext.y - current.y) / 6) * tension,
    };

    ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, next.x, next.y);
  }

  ctx.closePath();
}

function drawSoftConnectors(
  ctx: CanvasRenderingContext2D,
  cells: FoamCell[],
  values: SimplexFoamDials,
  travelTime: number,
  morphTime: number,
) {
  const connectors = Math.floor(cells.length * values.field.connectorBias * 0.18);
  if (connectors <= 0) return;

  ctx.save();
  ctx.globalAlpha = 0.38;
  ctx.lineWidth = Math.max(values.style.borderPixels, 0.75);

  for (let index = 0; index < connectors; index += 1) {
    const first = cells[index * 2];
    const second = cells[index * 2 + 1];
    if (!first || !second) continue;

    const a = createCellPath(first, values, travelTime, morphTime)[0];
    const b = createCellPath(second, values, travelTime, morphTime)[8];
    const mid = {
      x: (a.x + b.x) / 2 + Math.sin(morphTime + first.phase) * 18 * values.motion.morphAmount,
      y: (a.y + b.y) / 2 + Math.cos(morphTime + second.phase) * 18 * values.motion.morphAmount,
    };

    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.quadraticCurveTo(mid.x, mid.y, b.x, b.y);
    ctx.stroke();
  }

  ctx.restore();
}
