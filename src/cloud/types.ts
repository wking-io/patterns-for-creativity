export type Vec2 = {
  x: number;
  y: number;
};

export type Segment = {
  a: Vec2;
  b: Vec2;
};

export type Metaball = {
  x: number;
  y: number;
  r: number;
  groupX: number;
  groupY: number;
  groupVx: number;
  groupVy: number;
  offsetX: number;
  offsetY: number;
  offsetVx: number;
  offsetVy: number;
  offsetBoundX: number;
  offsetBoundY: number;
  localAmplitudeX: number;
  localAmplitudeY: number;
  localFrequency: number;
  localPhase: number;
  shapeRotation: number;
  shapeScaleX: number;
  shapeScaleY: number;
  lobeDepth: number;
  lobePhase: number;
  speedMultiplier: number;
  cohesion: number;
  seed: number;
};

export type MetaballSettings = {
  count: number;
  cloudGroups: number;
  minRadius: number;
  maxRadius: number;
  spatialScale?: number;
  baseSpeed: number;
  windX: number;
  windY: number;
  groupSpread: number;
  horizontalStretch: number;
  verticalStretch: number;
  looseBallRatio: number;
  speedVariance: number;
  shapeChange: number;
};

export type GridSettings = {
  cellSize: number;
};

export type NoiseSettings = {
  warpScale: number;
  warpAmount: number;
  warpSpeed: number;
  warpSeedOffset: number;
  globalDriftX: number;
  globalDriftY: number;
};

export type StyleSettings = {
  backgroundGradient: readonly [string, string, string];
  cloudFillColor: string;
  strokeColor: string;
  lineWidth: number;
};

export type DotSettings = {
  color: string;
  opacity: number;
  spacing: number;
  radius: number;
};

export type CloudSettings = {
  seed: number;
  thresholds: readonly [number, number];
  metaballs: MetaballSettings;
  grid: GridSettings;
  noise: NoiseSettings;
  style: StyleSettings;
  dots: DotSettings;
};

export type Noise2D = (x: number, y: number) => number;
