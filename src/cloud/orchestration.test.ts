import { describe, expect, it, vi } from "vitest";
import { edgeBandsCloudSettings } from "./config";
import {
  getMetaballSignature,
  scaleSettingsForCanvas,
  startCloudCanvasOrchestrator,
  syncCanvasResolution,
  type CloudFrameScheduler,
} from "./orchestration";
import { slideWidth } from "../slideMetrics";

type MutableCanvas = HTMLCanvasElement & {
  clientWidth: number;
  clientHeight: number;
};

describe("cloud canvas orchestration", () => {
  it("scales backing resolution with a clamped device pixel ratio", () => {
    const { canvas, ctx } = createCanvas(640, 360);

    const scaled = syncCanvasResolution(canvas, ctx, 640, 360, 3);

    expect(scaled).toEqual({ dpr: 2, width: 1280, height: 720 });
    expect(canvas.width).toBe(1280);
    expect(canvas.height).toBe(720);
    expect(ctx.setTransform).toHaveBeenCalledWith(2, 0, 0, 2, 0, 0);
  });

  it("scales cloud settings from the slide-width baseline", () => {
    const scaled = scaleSettingsForCanvas(edgeBandsCloudSettings, slideWidth / 2);

    expect(scaled.metaballs.spatialScale).toBe(0.5);
    expect(scaled.metaballs.baseSpeed).toBe(edgeBandsCloudSettings.metaballs.baseSpeed / 2);
    expect(scaled.grid.cellSize).toBe(edgeBandsCloudSettings.grid.cellSize / 2);
    expect(scaled.noise.warpScale).toBe(edgeBandsCloudSettings.noise.warpScale * 2);
    expect(scaled.style.lineWidth).toBe(edgeBandsCloudSettings.style.lineWidth / 2);
    expect(scaled.dots.spacing).toBe(edgeBandsCloudSettings.dots.spacing / 2);
  });

  it("includes canvas size and metaball settings in the reset signature", () => {
    const base = getMetaballSignature(640, 360, edgeBandsCloudSettings);
    const resized = getMetaballSignature(641, 360, edgeBandsCloudSettings);
    const changedCount = getMetaballSignature(640, 360, {
      ...edgeBandsCloudSettings,
      metaballs: {
        ...edgeBandsCloudSettings.metaballs,
        count: edgeBandsCloudSettings.metaballs.count + 1,
      },
    });

    expect(resized).not.toBe(base);
    expect(changedCount).not.toBe(base);
  });

  it("resets metaballs only when their signature changes", () => {
    const { canvas } = createCanvas(640, 360);
    const scheduler = createManualScheduler();
    const dependencies = createTestDependencies();

    const stop = startCloudCanvasOrchestrator(canvas, {
      scheduler: scheduler.scheduler,
      noise2D: () => 0,
      dependencies,
    });

    scheduler.tick(0);
    scheduler.tick(16);

    expect(dependencies.createMetaballs).toHaveBeenCalledTimes(1);

    canvas.clientWidth = 700;
    scheduler.tick(32);

    expect(dependencies.createMetaballs).toHaveBeenCalledTimes(2);

    stop();
  });

  it("cancels the pending animation frame on cleanup", () => {
    const { canvas } = createCanvas(640, 360);
    const scheduler = createManualScheduler();
    const dependencies = createTestDependencies();

    const stop = startCloudCanvasOrchestrator(canvas, {
      scheduler: scheduler.scheduler,
      noise2D: () => 0,
      dependencies,
    });

    scheduler.tick(0);
    const pendingFrame = scheduler.latestHandle();

    stop();

    expect(scheduler.scheduler.cancelFrame).toHaveBeenCalledWith(pendingFrame);
    expect(scheduler.hasFrame(pendingFrame)).toBe(false);
  });
});

function createCanvas(clientWidth: number, clientHeight: number) {
  const ctx = {
    setTransform: vi.fn(),
  } as unknown as CanvasRenderingContext2D;
  const canvas = {
    clientWidth,
    clientHeight,
    width: 0,
    height: 0,
    getContext: vi.fn(() => ctx),
  } as unknown as MutableCanvas;

  return { canvas, ctx };
}

function createManualScheduler() {
  let handle = 0;
  let now = 0;
  const frames = new Map<number, FrameRequestCallback>();
  const scheduler: CloudFrameScheduler = {
    now: () => now,
    requestFrame: vi.fn((callback) => {
      handle += 1;
      frames.set(handle, callback);
      return handle;
    }),
    cancelFrame: vi.fn((frameHandle) => {
      frames.delete(frameHandle);
    }),
    getDevicePixelRatio: () => 1,
  };

  return {
    scheduler,
    tick: (nextNow: number) => {
      now = nextNow;
      const frameHandle = handle;
      const callback = frames.get(frameHandle);

      if (!callback) throw new Error(`No frame scheduled for handle ${frameHandle}`);

      frames.delete(frameHandle);
      callback(nextNow);
    },
    latestHandle: () => handle,
    hasFrame: (frameHandle: number) => frames.has(frameHandle),
  };
}

function createTestDependencies() {
  return {
    createMetaballs: vi.fn(() => []),
    updateMetaballs: vi.fn(),
    sampleGrid: vi.fn((width: number, height: number, cellSize: number, values: Float32Array) => {
      values.fill(0);

      return {
        cols: Math.ceil(width / cellSize) + 1,
        rows: Math.ceil(height / cellSize) + 1,
      };
    }),
    extractContours: vi.fn((_values, _cols, _rows, _cellSize, _threshold, segments) => {
      segments.length = 0;

      return segments;
    }),
    renderers: {
      drawBackground: vi.fn(),
      drawDotGrid: vi.fn(),
      drawCloudFieldFill: vi.fn(),
      drawSegments: vi.fn(),
    },
  };
}
