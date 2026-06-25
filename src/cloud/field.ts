import type { Metaball, MetaballSettings, Noise2D, NoiseSettings } from "./types";
import { metaballField } from "./metaballs";

type FieldOptions = {
  metaballs: readonly Metaball[];
  metaballSettings: MetaballSettings;
  noise: NoiseSettings;
  noise2D: Noise2D;
  time: number;
};

export function sampleCloudField(x: number, y: number, options: FieldOptions) {
  const { metaballs, metaballSettings, noise, noise2D, time } = options;
  const driftX = time * noise.globalDriftX;
  const driftY = time * noise.globalDriftY;
  const noiseX = x + driftX;
  const noiseY = y + driftY;
  let fieldX = x;
  let fieldY = y;
  const warpTime = time * noise.warpSpeed;
  const nx = noise2D(noiseX * noise.warpScale + noise.warpSeedOffset, noiseY * noise.warpScale + warpTime);
  const ny = noise2D(noiseX * noise.warpScale + 500 + noise.warpSeedOffset, noiseY * noise.warpScale + warpTime);

  fieldX += nx * noise.warpAmount;
  fieldY += ny * noise.warpAmount;

  return metaballField(fieldX, fieldY, metaballs, metaballSettings);
}

export function sampleGrid(width: number, height: number, cellSize: number, values: Float32Array, options: FieldOptions) {
  const cols = Math.ceil(width / cellSize) + 1;
  const rows = Math.ceil(height / cellSize) + 1;
  let index = 0;

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      values[index] = sampleCloudField(col * cellSize, row * cellSize, options);
      index += 1;
    }
  }

  return { cols, rows };
}
