import type { Metaball, MetaballSettings } from "./types";
import { createSeededRandom, randomBetween } from "./random";
import { slideWidth } from "../slideMetrics";

export function createMetaballs(width: number, height: number, settings: MetaballSettings, seed: number) {
  const random = createSeededRandom(seed);
  const canvasScale = settings.spatialScale ?? getCanvasScale(width);
  const count = Math.max(1, Math.round(settings.count));
  const groupCount = Math.max(1, Math.min(count, Math.round(settings.cloudGroups)));
  const groups = Array.from({ length: groupCount }, (_, index) => {
    const angle = randomBetween(random, 0, Math.PI * 2);
    const speed = settings.baseSpeed * randomBetween(random, 0.45, 1.25);

    return {
      x: getGroupX(index, groupCount, width, random),
      y: getGroupY(index, groupCount, height, random),
      vx: Math.cos(angle) * speed + settings.windX * 0.35,
      vy: Math.sin(angle) * speed * 0.7 + settings.windY * 0.35,
      seed: seed * 19.7 + index * 67.1,
    };
  });

  return Array.from({ length: count }, (_, index): Metaball => {
    const group = groups[index % groups.length];
    const loose = random() < settings.looseBallRatio;
    const spread = settings.groupSpread * canvasScale * randomBetween(random, loose ? 0.45 : 0.1, loose ? 1.6 : 1);
    const clusterAngle = randomBetween(random, 0, Math.PI * 2);
    const localSpeed = settings.baseSpeed * settings.speedVariance * randomBetween(random, loose ? 0.28 : 0.04, loose ? 1.15 : 0.28);
    const offsetX = Math.cos(clusterAngle) * spread * settings.horizontalStretch;
    const offsetY = Math.sin(clusterAngle) * spread * settings.verticalStretch * 0.58;
    const offsetSpeedAngle = randomBetween(random, 0, Math.PI * 2);
    const offsetSpeed = localSpeed * randomBetween(random, loose ? 0.9 : 0.35, loose ? 1.8 : 0.9);
    const offsetBoundX = Math.max(Math.abs(offsetX), settings.groupSpread * canvasScale * settings.horizontalStretch * randomBetween(random, loose ? 0.38 : 0.18, loose ? 0.95 : 0.5));
    const offsetBoundY = Math.max(Math.abs(offsetY), settings.groupSpread * canvasScale * settings.verticalStretch * randomBetween(random, loose ? 0.24 : 0.12, loose ? 0.62 : 0.36));
    const localAmplitude = localSpeed * randomBetween(random, loose ? 1.6 : 0.7, loose ? 4.2 : 1.8);
    const localPhase = randomBetween(random, 0, Math.PI * 2);
    const shapeRotation = randomBetween(random, -0.22, 0.22);
    const lobeDepth = randomBetween(random, loose ? 0.12 : 0.07, loose ? 0.22 : 0.16);

    return {
      x: group.x + offsetX,
      y: group.y + offsetY,
      r: randomBetween(random, settings.minRadius, settings.maxRadius) * canvasScale,
      groupX: group.x,
      groupY: group.y,
      groupVx: group.vx,
      groupVy: group.vy,
      offsetX,
      offsetY,
      offsetVx: Math.cos(offsetSpeedAngle) * offsetSpeed,
      offsetVy: Math.sin(offsetSpeedAngle) * offsetSpeed * 0.7,
      offsetBoundX,
      offsetBoundY,
      localAmplitudeX: localAmplitude * settings.horizontalStretch * 0.18,
      localAmplitudeY: localAmplitude * settings.verticalStretch * 0.16,
      localFrequency: randomBetween(random, loose ? 0.06 : 0.025, loose ? 0.18 : 0.08),
      localPhase,
      shapeRotation,
      shapeScaleX: randomBetween(random, 0.72, 1.12),
      shapeScaleY: randomBetween(random, 0.82, 1.28),
      lobeDepth,
      lobePhase: randomBetween(random, 0, Math.PI * 2),
      speedMultiplier: randomBetween(random, loose ? 0.95 : 0.82, loose ? 1.55 : 1.08),
      cohesion: loose ? randomBetween(random, 0.2, 0.48) : randomBetween(random, 0.74, 1),
      seed: seed * 13.37 + index * 41.19 + random() * 1000,
    };
  });
}

function getCanvasScale(width: number) {
  return width / slideWidth;
}

function getGroupX(index: number, groupCount: number, width: number, random: () => number) {
  const edgeGroupCount = Math.max(2, Math.floor(groupCount * 0.36));

  if (index < edgeGroupCount) {
    return randomBetween(random, -width * 0.08, width * 1.08);
  }

  const interiorIndex = index - edgeGroupCount;
  const interiorCount = Math.max(1, groupCount - edgeGroupCount);
  const bandT = (interiorIndex + 0.5) / interiorCount;
  const goldenOffset = (index * 0.61803398875) % 1;
  const t = clamp01(bandT * 0.65 + goldenOffset * 0.35 + randomBetween(random, -0.07, 0.07));

  return width * (0.04 + t * 0.92);
}

function getGroupY(index: number, groupCount: number, height: number, random: () => number) {
  const edgeGroupCount = Math.max(2, Math.floor(groupCount * 0.36));
  const topGroupCount = Math.floor(edgeGroupCount / 2);

  if (index < topGroupCount) {
    return randomBetween(random, -height * 0.18, height * 0.16);
  }

  if (index < edgeGroupCount) {
    return randomBetween(random, height * 0.84, height * 1.18);
  }

  const interiorIndex = index - edgeGroupCount;
  const interiorCount = Math.max(1, groupCount - edgeGroupCount);
  const bandT = (interiorIndex + 0.5) / interiorCount;
  const t = clamp01(bandT + randomBetween(random, -0.045, 0.045));

  return height * (0.08 + t * 0.84);
}

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

export function updateMetaballs(metaballs: Metaball[], width: number, height: number, settings: MetaballSettings, dt: number, t: number) {
  for (const metaball of metaballs) {
    const morphX = Math.sin(metaball.seed) * settings.shapeChange * (1 - metaball.cohesion);
    const morphY = Math.cos(metaball.seed * 0.73) * settings.shapeChange;
    const localTime = t * metaball.localFrequency * metaball.speedMultiplier;
    const localX = Math.cos(localTime + metaball.localPhase) * metaball.localAmplitudeX * (1.1 - metaball.cohesion);
    const localY = Math.sin(localTime * 1.17 + metaball.localPhase) * metaball.localAmplitudeY * (1.1 - metaball.cohesion);

    const nextGroupX = reflectCoordinate(metaball.groupX + metaball.groupVx * dt, metaball.groupVx, width);
    const nextGroupY = reflectCoordinate(metaball.groupY + metaball.groupVy * dt, metaball.groupVy, height);
    metaball.groupX = nextGroupX.value;
    metaball.groupY = nextGroupY.value;
    metaball.groupVx = nextGroupX.velocity;
    metaball.groupVy = nextGroupY.velocity;

    const nextOffsetX = reflectOffset(metaball.offsetX + metaball.offsetVx * dt, metaball.offsetVx, metaball.offsetBoundX);
    const nextOffsetY = reflectOffset(metaball.offsetY + metaball.offsetVy * dt, metaball.offsetVy, metaball.offsetBoundY);
    metaball.offsetX = nextOffsetX.value;
    metaball.offsetY = nextOffsetY.value;
    metaball.offsetVx = nextOffsetX.velocity;
    metaball.offsetVy = nextOffsetY.velocity;

    metaball.x = mirrorCoordinate(metaball.groupX + metaball.offsetX + morphX + localX, width);
    metaball.y = mirrorCoordinate(metaball.groupY + metaball.offsetY + morphY + localY, height);
  }
}

function reflectCoordinate(value: number, velocity: number, max: number) {
  if (max <= 0) return { value, velocity };

  let nextValue = value;
  let nextVelocity = velocity;

  while (nextValue < 0 || nextValue > max) {
    if (nextValue < 0) {
      nextValue = -nextValue;
      nextVelocity = Math.abs(nextVelocity);
    } else {
      nextValue = max * 2 - nextValue;
      nextVelocity = -Math.abs(nextVelocity);
    }
  }

  return { value: nextValue, velocity: nextVelocity };
}

function reflectOffset(value: number, velocity: number, bound: number) {
  if (bound <= 0) return { value: 0, velocity };

  let nextValue = value;
  let nextVelocity = velocity;

  while (nextValue < -bound || nextValue > bound) {
    if (nextValue < -bound) {
      nextValue = -bound * 2 - nextValue;
      nextVelocity = Math.abs(nextVelocity);
    } else {
      nextValue = bound * 2 - nextValue;
      nextVelocity = -Math.abs(nextVelocity);
    }
  }

  return { value: nextValue, velocity: nextVelocity };
}

function mirrorCoordinate(value: number, max: number) {
  return reflectCoordinate(value, 0, max).value;
}

export function metaballField(x: number, y: number, metaballs: readonly Metaball[], settings: MetaballSettings) {
  let value = 0;
  const canvasScale = settings.spatialScale ?? 1;
  const epsilon = 120 * canvasScale * canvasScale;
  const horizontalStretch = Math.max(0.1, settings.horizontalStretch);
  const verticalStretch = Math.max(0.1, settings.verticalStretch);

  for (const metaball of metaballs) {
    const rawX = x - metaball.x;
    const rawY = y - metaball.y;
    const cos = Math.cos(metaball.shapeRotation);
    const sin = Math.sin(metaball.shapeRotation);
    const rotatedX = rawX * cos + rawY * sin;
    const rotatedY = rawY * cos - rawX * sin;
    const dx = rotatedX / (horizontalStretch * metaball.shapeScaleX);
    const dy = rotatedY / (verticalStretch * metaball.shapeScaleY);
    const angle = Math.atan2(dy, dx);
    const lobe =
      1 +
      Math.sin(angle * 3 + metaball.lobePhase) * metaball.lobeDepth +
      Math.cos(angle * 5 + metaball.lobePhase * 0.73) * metaball.lobeDepth * 0.55;

    value += (metaball.r * metaball.r * Math.max(0.65, lobe)) / (dx * dx + dy * dy + epsilon);
  }

  return value;
}
