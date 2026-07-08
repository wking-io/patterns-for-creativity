import { createNoise2D } from "simplex-noise";
import { edgeBandsCloudSettings } from "./config";
import { sampleGrid as defaultSampleGrid } from "./field";
import { extractContours as defaultExtractContours } from "./marching-squares";
import { createMetaballs as defaultCreateMetaballs, updateMetaballs as defaultUpdateMetaballs } from "./metaballs";
import { createSeededRandom } from "./random";
import { drawBackground, drawCloudFieldFill, drawDotGrid, drawSegments } from "./render";
import type { CloudSettings, Metaball, Noise2D, Segment } from "./types";
import { slideWidth } from "../slideMetrics";

type CloudCanvasRenderers = {
  drawBackground: typeof drawBackground;
  drawDotGrid: typeof drawDotGrid;
  drawCloudFieldFill: typeof drawCloudFieldFill;
  drawSegments: typeof drawSegments;
};

type CloudCanvasDependencies = {
  createMetaballs: typeof defaultCreateMetaballs;
  updateMetaballs: typeof defaultUpdateMetaballs;
  sampleGrid: typeof defaultSampleGrid;
  extractContours: typeof defaultExtractContours;
  renderers: CloudCanvasRenderers;
};

type CloudCanvasDependencyOverrides = Partial<Omit<CloudCanvasDependencies, "renderers">> & {
  renderers?: Partial<CloudCanvasRenderers>;
};

export type CloudFrameScheduler = {
  now: () => number;
  requestFrame: (callback: FrameRequestCallback) => number;
  cancelFrame: (handle: number) => void;
  getDevicePixelRatio: () => number;
};

export type CloudCanvasOrchestratorOptions = {
  settings?: CloudSettings;
  noise2D?: Noise2D;
  scheduler?: CloudFrameScheduler;
  dependencies?: CloudCanvasDependencyOverrides;
};

export function startCloudCanvasOrchestrator(canvas: HTMLCanvasElement, options: CloudCanvasOrchestratorOptions = {}) {
  const orchestrator = new CloudCanvasOrchestrator(canvas, options);

  return orchestrator.start();
}

export class CloudCanvasOrchestrator {
  private readonly settings: CloudSettings;
  private readonly noise2D: Noise2D;
  private readonly scheduler: CloudFrameScheduler;
  private readonly dependencies: CloudCanvasDependencies;
  private readonly segmentsByThreshold: [Segment[], Segment[]] = [[], []];
  private animationFrame = 0;
  private lastNow = 0;
  private time = 0;
  private signature = "";
  private scaledSizeSignature = "";
  private smoothingSignature = "";
  private hasSmoothedValues = false;
  private rawValues = new Float32Array(0);
  private smoothedValues = new Float32Array(0);
  private metaballs: Metaball[] = [];
  private renderSettings: CloudSettings;
  private running = false;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    options: CloudCanvasOrchestratorOptions = {},
  ) {
    this.settings = options.settings ?? edgeBandsCloudSettings;
    this.noise2D = options.noise2D ?? createNoise2D(createSeededRandom(this.settings.seed));
    this.scheduler = options.scheduler ?? createBrowserScheduler();
    this.dependencies = mergeDependencies(options.dependencies);
    this.renderSettings = this.settings;
  }

  start() {
    const ctx = this.canvas.getContext("2d");
    if (!ctx) return () => undefined;

    this.running = true;
    this.lastNow = this.scheduler.now();
    this.animationFrame = this.scheduler.requestFrame((now) => this.renderFrame(ctx, now));

    return () => this.stop();
  }

  stop() {
    if (!this.running) return;

    this.running = false;
    this.scheduler.cancelFrame(this.animationFrame);
  }

  private renderFrame(ctx: CanvasRenderingContext2D, now: number) {
    const width = Math.max(1, this.canvas.clientWidth);
    const height = Math.max(1, this.canvas.clientHeight);
    const nextScaledSizeSignature = `${Math.round(width)}:${Math.round(height)}`;

    if (this.scaledSizeSignature !== nextScaledSizeSignature) {
      this.scaledSizeSignature = nextScaledSizeSignature;
      this.renderSettings = scaleSettingsForCanvas(this.settings, width);
    }

    syncCanvasResolution(this.canvas, ctx, width, height, this.scheduler.getDevicePixelRatio());

    const dt = Math.min(0.033, (now - this.lastNow) / 1000);
    this.lastNow = now;

    const nextSignature = getMetaballSignature(width, height, this.renderSettings);
    if (this.signature !== nextSignature) {
      this.signature = nextSignature;
      this.metaballs = this.dependencies.createMetaballs(width, height, this.renderSettings.metaballs, this.settings.seed);
      this.hasSmoothedValues = false;
    }

    this.advanceMetaballs(width, height, dt);

    const cellSize = Math.max(0.001, this.renderSettings.grid.cellSize);
    const cols = Math.ceil(width / cellSize) + 1;
    const rows = Math.ceil(height / cellSize) + 1;
    const neededLength = cols * rows;

    if (this.rawValues.length !== neededLength) {
      this.rawValues = new Float32Array(neededLength);
      this.smoothedValues = new Float32Array(neededLength);
      this.hasSmoothedValues = false;
    }

    const grid = this.dependencies.sampleGrid(width, height, cellSize, this.rawValues, {
      metaballs: this.metaballs,
      metaballSettings: this.renderSettings.metaballs,
      noise: this.renderSettings.noise,
      noise2D: this.noise2D,
      time: this.time,
    });

    this.smoothFieldValues(cellSize, dt);
    this.extractContours(grid.cols, grid.rows, cellSize);
    this.drawFrame(ctx, width, height, grid.cols, grid.rows, cellSize);

    if (this.running) {
      this.animationFrame = this.scheduler.requestFrame((nextNow) => this.renderFrame(ctx, nextNow));
    }
  }

  private advanceMetaballs(width: number, height: number, dt: number) {
    if (dt <= 0) return;

    const stepCount = Math.max(1, Math.ceil(dt / (1 / 120)));
    const stepDt = dt / stepCount;

    for (let step = 0; step < stepCount; step += 1) {
      this.time += stepDt;
      this.dependencies.updateMetaballs(this.metaballs, width, height, this.renderSettings.metaballs, stepDt, this.time);
    }
  }

  private smoothFieldValues(cellSize: number, dt: number) {
    const nextSmoothingSignature = `${this.signature}:${cellSize}`;

    if (!this.hasSmoothedValues || this.smoothingSignature !== nextSmoothingSignature) {
      this.smoothedValues.set(this.rawValues);
      this.smoothingSignature = nextSmoothingSignature;
      this.hasSmoothedValues = true;
      return;
    }

    const alpha = Math.min(1, Math.max(0.08, 1 - Math.exp(-dt * 10)));

    for (let index = 0; index < this.smoothedValues.length; index += 1) {
      this.smoothedValues[index] += (this.rawValues[index] - this.smoothedValues[index]) * alpha;
    }
  }

  private extractContours(cols: number, rows: number, cellSize: number) {
    const thresholds = this.renderSettings.thresholds;

    this.dependencies.extractContours(this.smoothedValues, cols, rows, cellSize, thresholds[0], this.segmentsByThreshold[0]);
    this.dependencies.extractContours(this.smoothedValues, cols, rows, cellSize, thresholds[1], this.segmentsByThreshold[1]);
  }

  private drawFrame(ctx: CanvasRenderingContext2D, width: number, height: number, cols: number, rows: number, cellSize: number) {
    const { renderers } = this.dependencies;
    const thresholds = this.renderSettings.thresholds;

    renderers.drawBackground(ctx, width, height, this.renderSettings);
    renderers.drawDotGrid(ctx, width, height, this.renderSettings);
    renderers.drawCloudFieldFill(ctx, width, height, this.smoothedValues, cols, rows, cellSize, thresholds, this.renderSettings);
    renderers.drawSegments(ctx, this.segmentsByThreshold, this.renderSettings);
  }
}

export function syncCanvasResolution(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  devicePixelRatio: number,
) {
  const dpr = Math.min(2, devicePixelRatio || 1);
  const canvasWidth = Math.round(width * dpr);
  const canvasHeight = Math.round(height * dpr);

  if (canvas.width !== canvasWidth || canvas.height !== canvasHeight) {
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
  }

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  return { dpr, width: canvasWidth, height: canvasHeight };
}

export function scaleSettingsForCanvas(settings: CloudSettings, width: number): CloudSettings {
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

export function getMetaballSignature(width: number, height: number, settings: CloudSettings) {
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

function createBrowserScheduler(): CloudFrameScheduler {
  return {
    now: () => performance.now(),
    requestFrame: (callback) => requestAnimationFrame(callback),
    cancelFrame: (handle) => cancelAnimationFrame(handle),
    getDevicePixelRatio: () => window.devicePixelRatio || 1,
  };
}

function mergeDependencies(overrides: CloudCanvasDependencyOverrides = {}): CloudCanvasDependencies {
  return {
    createMetaballs: overrides.createMetaballs ?? defaultCreateMetaballs,
    updateMetaballs: overrides.updateMetaballs ?? defaultUpdateMetaballs,
    sampleGrid: overrides.sampleGrid ?? defaultSampleGrid,
    extractContours: overrides.extractContours ?? defaultExtractContours,
    renderers: {
      drawBackground: overrides.renderers?.drawBackground ?? drawBackground,
      drawDotGrid: overrides.renderers?.drawDotGrid ?? drawDotGrid,
      drawCloudFieldFill: overrides.renderers?.drawCloudFieldFill ?? drawCloudFieldFill,
      drawSegments: overrides.renderers?.drawSegments ?? drawSegments,
    },
  };
}
