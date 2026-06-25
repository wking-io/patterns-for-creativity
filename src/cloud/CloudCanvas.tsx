import { useEffect, useMemo, useRef } from "react";
import { createNoise2D } from "simplex-noise";
import { edgeBandsCloudSettings } from "./config";
import { sampleGrid } from "./field";
import { extractContours } from "./marching-squares";
import { createMetaballs, updateMetaballs } from "./metaballs";
import { createSeededRandom } from "./random";
import { drawBackground, drawCloudFieldFill, drawDotGrid, drawSegments } from "./render";
import type { CloudSettings, Metaball, Noise2D, Segment } from "./types";
import { slideWidth } from "../slideMetrics";

export function CloudCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const noiseSeed = edgeBandsCloudSettings.seed;
  const noise2D = useMemo(() => createNoise2D(createSeededRandom(noiseSeed)), [noiseSeed]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    let animationFrame = 0;
    let lastNow = performance.now();
    let time = 0;
    let signature = "";
    let scaledSizeSignature = "";
    let smoothingSignature = "";
    let hasSmoothedValues = false;
    let rawValues = new Float32Array(0);
    let smoothedValues = new Float32Array(0);
    let metaballs: Metaball[] = [];
    let renderSettings = edgeBandsCloudSettings;
    const segmentsByThreshold: [Segment[], Segment[]] = [[], []];

    const renderFrame = (now: number) => {
      const width = Math.max(1, canvas.clientWidth);
      const height = Math.max(1, canvas.clientHeight);
      const nextScaledSizeSignature = `${Math.round(width)}:${Math.round(height)}`;

      if (scaledSizeSignature !== nextScaledSizeSignature) {
        scaledSizeSignature = nextScaledSizeSignature;
        renderSettings = scaleSettingsForCanvas(edgeBandsCloudSettings, width);
      }

      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const canvasWidth = Math.round(width * dpr);
      const canvasHeight = Math.round(height * dpr);

      if (canvas.width !== canvasWidth || canvas.height !== canvasHeight) {
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const dt = Math.min(0.033, (now - lastNow) / 1000);
      lastNow = now;

      const nextSignature = getMetaballSignature(width, height, renderSettings);
      if (signature !== nextSignature) {
        signature = nextSignature;
        metaballs = createMetaballs(width, height, renderSettings.metaballs, noiseSeed);
        hasSmoothedValues = false;
      }

      if (dt > 0) {
        const stepCount = Math.max(1, Math.ceil(dt / (1 / 120)));
        const stepDt = dt / stepCount;

        for (let step = 0; step < stepCount; step += 1) {
          time += stepDt;
          updateMetaballs(metaballs, width, height, renderSettings.metaballs, stepDt, time);
        }
      }

      const cellSize = Math.max(0.001, renderSettings.grid.cellSize);
      const cols = Math.ceil(width / cellSize) + 1;
      const rows = Math.ceil(height / cellSize) + 1;
      const neededLength = cols * rows;

      if (rawValues.length !== neededLength) {
        rawValues = new Float32Array(neededLength);
        smoothedValues = new Float32Array(neededLength);
        hasSmoothedValues = false;
      }

      const grid = sampleGrid(width, height, cellSize, rawValues, {
        metaballs,
        metaballSettings: renderSettings.metaballs,
        noise: renderSettings.noise,
        noise2D: noise2D as Noise2D,
        time,
      });
      const nextSmoothingSignature = `${signature}:${cellSize}`;

      if (!hasSmoothedValues || smoothingSignature !== nextSmoothingSignature) {
        smoothedValues.set(rawValues);
        smoothingSignature = nextSmoothingSignature;
        hasSmoothedValues = true;
      } else {
        const alpha = Math.min(1, Math.max(0.08, 1 - Math.exp(-dt * 10)));

        for (let index = 0; index < smoothedValues.length; index += 1) {
          smoothedValues[index] += (rawValues[index] - smoothedValues[index]) * alpha;
        }
      }

      const thresholds = renderSettings.thresholds;
      extractContours(smoothedValues, grid.cols, grid.rows, cellSize, thresholds[0], segmentsByThreshold[0]);
      extractContours(smoothedValues, grid.cols, grid.rows, cellSize, thresholds[1], segmentsByThreshold[1]);

      drawBackground(ctx, width, height, renderSettings);
      drawDotGrid(ctx, width, height, renderSettings);
      drawCloudFieldFill(ctx, width, height, smoothedValues, grid.cols, grid.rows, cellSize, thresholds, renderSettings);
      drawSegments(ctx, segmentsByThreshold, renderSettings);

      animationFrame = requestAnimationFrame(renderFrame);
    };

    animationFrame = requestAnimationFrame(renderFrame);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [noise2D, noiseSeed]);

  return <canvas aria-label="Animated line-art cloud contours" className="cloud-contour-canvas" ref={canvasRef} />;
}

function scaleSettingsForCanvas(settings: CloudSettings, width: number): CloudSettings {
  const scale = width / slideWidth;

  return {
    ...settings,
    metaballs: {
      ...settings.metaballs,
      spatialScale: scale,
      baseSpeed: settings.metaballs.baseSpeed * scale,
      windX: settings.metaballs.windX * scale,
      windY: settings.metaballs.windY * scale,
      shapeChange: settings.metaballs.shapeChange * scale,
    },
    grid: {
      cellSize: settings.grid.cellSize * scale,
    },
    noise: {
      ...settings.noise,
      warpScale: settings.noise.warpScale / scale,
      warpAmount: settings.noise.warpAmount * scale,
      globalDriftX: settings.noise.globalDriftX * scale,
      globalDriftY: settings.noise.globalDriftY * scale,
    },
    style: {
      ...settings.style,
      lineWidth: settings.style.lineWidth * scale,
    },
    dots: {
      ...settings.dots,
      spacing: settings.dots.spacing * scale,
      radius: settings.dots.radius * scale,
    },
  };
}

function getMetaballSignature(width: number, height: number, settings: CloudSettings) {
  return [
    Math.round(width),
    Math.round(height),
    Math.round(settings.seed),
    Math.round(settings.metaballs.count),
    Math.round(settings.metaballs.cloudGroups),
    Math.round(settings.metaballs.minRadius),
    Math.round(settings.metaballs.maxRadius),
    Math.round(settings.metaballs.baseSpeed),
    Math.round(settings.metaballs.groupSpread),
    Math.round(settings.metaballs.horizontalStretch * 100),
    Math.round(settings.metaballs.verticalStretch * 100),
    Math.round(settings.metaballs.looseBallRatio * 100),
    Math.round(settings.metaballs.speedVariance * 100),
  ].join(":");
}
