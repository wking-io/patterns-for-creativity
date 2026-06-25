import type { CloudSettings } from "./types";

export const cloudThresholds = [1, 2.02] as const;

export const edgeBandsCloudSettings: CloudSettings = {
  seed: 4000,
  thresholds: cloudThresholds,
  metaballs: {
    count: 36,
    cloudGroups: 34,
    minRadius: 17,
    maxRadius: 59,
    baseSpeed: 16,
    windX: 12,
    windY: 2,
    groupSpread: 86,
    horizontalStretch: 2.6,
    verticalStretch: 1.18,
    looseBallRatio: 0.7,
    speedVariance: 0.67,
    shapeChange: 12,
  },
  grid: {
    cellSize: 12,
  },
  noise: {
    warpScale: 0.0005,
    warpAmount: 70,
    warpSpeed: 0.044,
    warpSeedOffset: 1246,
    globalDriftX: 3,
    globalDriftY: 2,
  },
  style: {
    backgroundGradient: ["#ff6453", "#ffc09b", "#ffe1b5"],
    cloudFillColor: "#eff3ee",
    strokeColor: "#1D1D16",
    lineWidth: 0.5,
  },
  dots: {
    color: "#1D1D16",
    opacity: 1,
    spacing: 8,
    radius: 0.5,
  },
};
