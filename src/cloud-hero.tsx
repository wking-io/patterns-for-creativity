import { useEffect, useRef } from "react";

const vertexShaderSource = `#version 300 es
precision highp float;

out vec2 vUv;

void main() {
  vec2 position = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  vUv = position;
  gl_Position = vec4(position * 2.0 - 1.0, 0.0, 1.0);
}
`;

const fragmentShaderSource = `#version 300 es
precision highp float;

uniform float uTime;
uniform float uDayNight;
uniform vec2 uResolution;
uniform vec2 uPointer;
uniform vec2 uButtonCenter;
uniform float uButtonRadius;
uniform int uCloudPreset;
uniform sampler2D uBlueNoise;

in vec2 vUv;
out vec4 fragColor;

#define MAX_STEPS 24
#define LIGHT_STEPS 4
#define MARCH_SIZE 0.17

float hash(vec3 p) {
  p = fract(p * 0.3183099 + vec3(0.11, 0.17, 0.13));
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

float noise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);

  float n000 = hash(i + vec3(0.0, 0.0, 0.0));
  float n100 = hash(i + vec3(1.0, 0.0, 0.0));
  float n010 = hash(i + vec3(0.0, 1.0, 0.0));
  float n110 = hash(i + vec3(1.0, 1.0, 0.0));
  float n001 = hash(i + vec3(0.0, 0.0, 1.0));
  float n101 = hash(i + vec3(1.0, 0.0, 1.0));
  float n011 = hash(i + vec3(0.0, 1.0, 1.0));
  float n111 = hash(i + vec3(1.0, 1.0, 1.0));

  float nx00 = mix(n000, n100, f.x);
  float nx10 = mix(n010, n110, f.x);
  float nx01 = mix(n001, n101, f.x);
  float nx11 = mix(n011, n111, f.x);
  float nxy0 = mix(nx00, nx10, f.y);
  float nxy1 = mix(nx01, nx11, f.y);

  return mix(nxy0, nxy1, f.z);
}

float fbm(vec3 p) {
  float sum = 0.0;
  float amp = 0.55;
  float freq = 1.0;

  for (int i = 0; i < 4; i++) {
    sum += amp * noise(p * freq);
    freq *= 2.05;
    amp *= 0.52;
  }

  return sum;
}

float smootherstep(float edge0, float edge1, float value) {
  float x = clamp((value - edge0) / (edge1 - edge0), 0.0, 1.0);
  return x * x * x * (x * (x * 6.0 - 15.0) + 10.0);
}

float preset(int id) {
  return uCloudPreset == id ? 1.0 : 0.0;
}

float cloudDensity(vec3 p) {
  vec3 drift = vec3(uTime * 0.035, 0.0, -uTime * 0.018);
  float base = fbm(p * vec3(0.42, 0.58, 0.36) + drift * 0.72);
  float shape = fbm(p * vec3(0.62, 0.82, 0.5) + drift);
  float detail = fbm(p * vec3(1.35, 1.15, 0.95) + drift * 1.8);
  float highBand = smoothstep(-1.82, -0.48, p.y) * smoothstep(1.56, 0.2, p.y);
  float lowBand = smoothstep(-2.15, -1.08, p.y) * smoothstep(0.34, -0.82, p.y);
  float coreBand = smoothstep(-1.55, -0.76, p.y) * smoothstep(0.92, -0.08, p.y);
  float horizonFade = smoothstep(-0.82, 0.82, p.z);
  float sideGroups = smoothstep(0.12, 1.68, abs(p.x));
  float centerBridge = (1.0 - smoothstep(0.0, 1.18, abs(p.x))) * smoothstep(1.6, 4.9, p.z);
  float distantMass = smoothstep(2.0, 6.2, p.z) * smoothstep(2.7, 0.2, abs(p.x));
  float groupMask = clamp(sideGroups * 1.06 + centerBridge * 0.82 + distantMass * 0.42, 0.0, 1.32);
  float towers = preset(1);
  float shelf = preset(2);
  float walls = preset(3);
  float wispy = preset(4);
  float anvil = preset(5);
  float waves = preset(6);
  float overcast = preset(7);
  float openCenter = preset(8);
  float stratocumulus = preset(9);
  float horizonRows = preset(10);
  float parallelWisps = preset(11);
  float layeredShelf = preset(12);
  float flatAnvil = preset(13);
  float fullHighWisps = preset(14);
  float leftDriftWisps = preset(15);
  float rightDriftWisps = preset(16);
  float crownHighWisps = preset(17);
  float lowCrossingWisps = preset(18);
  float openCenterWisps = preset(19);
  float stormVeilWisps = preset(20);
  float towerMask = clamp(centerBridge * 1.22 + distantMass * 0.72 + sideGroups * 0.54, 0.0, 1.38);
  float shelfMask = clamp(lowBand * (0.64 + smoothstep(1.2, 5.6, p.z)) + sideGroups * 0.62, 0.0, 1.24);
  float wallMask = clamp(sideGroups * 1.32 + distantMass * 0.5 - centerBridge * 0.48, 0.0, 1.34);
  float wispyMask = clamp((sideGroups * 0.7 + centerBridge * 0.42 + distantMass * 0.36) * (0.7 + detail), 0.0, 1.08);
  float anvilMask = clamp(highBand * (0.84 + distantMass * 0.76) + centerBridge * 0.38, 0.0, 1.34);
  float waveMask = clamp((0.58 + 0.42 * sin(p.x * 2.35 + p.z * 0.75 + uTime * 0.18)) * (0.7 + lowBand + coreBand), 0.0, 1.22);
  float overcastMask = clamp(0.78 + highBand * 0.34 + lowBand * 0.36 + distantMass * 0.18, 0.0, 1.28);
  float openMask = clamp(sideGroups * 1.28 + distantMass * 0.58 - (1.0 - smoothstep(0.18, 1.48, abs(p.x))) * 0.72, 0.0, 1.32);
  float horizontalRipple = 0.62 + 0.38 * sin(p.y * 5.4 + p.z * 0.7 + uTime * 0.08);
  float longRowRipple = 0.56 + 0.44 * sin(p.y * 7.2 + p.x * 0.36 + p.z * 0.44);
  float highWispRipple = 0.54 + 0.46 * sin(p.y * 10.5 + p.x * 0.2 + p.z * 0.26 + uTime * 0.1);
  float stratocumulusMask = clamp((lowBand * 0.92 + coreBand * 0.62) * horizontalRipple + distantMass * 0.28, 0.0, 1.28);
  float horizonRowsMask = clamp((lowBand * 1.24 + smoothstep(2.2, 6.4, p.z) * 0.42) * longRowRipple, 0.0, 1.3);
  float parallelWispMask = clamp(highBand * highWispRipple * (0.72 + detail * 0.78), 0.0, 1.12);
  float layeredShelfMask = clamp((lowBand * 1.12 + coreBand * 0.72 + highBand * 0.38) * (0.7 + 0.3 * horizontalRipple), 0.0, 1.34);
  float flatAnvilMask = clamp(highBand * 1.24 + smoothstep(2.0, 6.0, p.z) * 0.28 + centerBridge * 0.2, 0.0, 1.36);
  float leftFocus = smoothstep(1.9, -1.2, p.x);
  float rightFocus = smoothstep(-1.9, 1.2, p.x);
  float centerOpening = smoothstep(0.52, 1.72, abs(p.x));
  float fullHighWispMask = clamp(max(highBand * 1.08, coreBand * 0.54) * (0.76 + detail * 0.88) + distantMass * 0.2, 0.0, 1.26);
  float leftDriftWispMask = clamp((highBand * 0.96 + coreBand * 0.38) * leftFocus * (0.78 + detail * 0.74), 0.0, 1.16);
  float rightDriftWispMask = clamp((highBand * 0.96 + coreBand * 0.38) * rightFocus * (0.78 + detail * 0.74), 0.0, 1.16);
  float crownHighWispMask = clamp(highBand * smoothstep(-0.14, 1.1, p.y) * (0.84 + detail * 0.72) + distantMass * 0.16, 0.0, 1.18);
  float lowCrossingWispMask = clamp(max(lowBand * 0.74, coreBand * 0.82) * (0.72 + 0.28 * horizontalRipple) + centerBridge * 0.24, 0.0, 1.2);
  float openCenterWispMask = clamp((sideGroups * 0.9 + distantMass * 0.26) * centerOpening * highBand * (0.86 + detail * 0.7), 0.0, 1.14);
  float stormVeilWispMask = clamp(max(highBand * 1.06, coreBand * 0.82) * (0.92 + detail * 0.82) + lowBand * 0.3, 0.0, 1.34);
  groupMask = mix(groupMask, towerMask, towers);
  groupMask = mix(groupMask, shelfMask, shelf);
  groupMask = mix(groupMask, wallMask, walls);
  groupMask = mix(groupMask, wispyMask, wispy);
  groupMask = mix(groupMask, anvilMask, anvil);
  groupMask = mix(groupMask, waveMask, waves);
  groupMask = mix(groupMask, overcastMask, overcast);
  groupMask = mix(groupMask, openMask, openCenter);
  groupMask = mix(groupMask, stratocumulusMask, stratocumulus);
  groupMask = mix(groupMask, horizonRowsMask, horizonRows);
  groupMask = mix(groupMask, parallelWispMask, parallelWisps);
  groupMask = mix(groupMask, layeredShelfMask, layeredShelf);
  groupMask = mix(groupMask, flatAnvilMask, flatAnvil);
  groupMask = mix(groupMask, fullHighWispMask, fullHighWisps);
  groupMask = mix(groupMask, leftDriftWispMask, leftDriftWisps);
  groupMask = mix(groupMask, rightDriftWispMask, rightDriftWisps);
  groupMask = mix(groupMask, crownHighWispMask, crownHighWisps);
  groupMask = mix(groupMask, lowCrossingWispMask, lowCrossingWisps);
  groupMask = mix(groupMask, openCenterWispMask, openCenterWisps);
  groupMask = mix(groupMask, stormVeilWispMask, stormVeilWisps);
  float billows = smoothstep(0.28, 0.86, base);
  float presetDetail = mix(0.3, 0.52, wispy);
  presetDetail = mix(presetDetail, 0.22, overcast);
  presetDetail = mix(presetDetail, 0.24, stratocumulus + horizonRows + layeredShelf + flatAnvil);
  presetDetail = mix(presetDetail, 0.46, parallelWisps);
  presetDetail = mix(presetDetail, 0.5, fullHighWisps + leftDriftWisps + rightDriftWisps + crownHighWisps + lowCrossingWisps + openCenterWisps);
  presetDetail = mix(presetDetail, 0.38, stormVeilWisps);
  float threshold = mix(0.46, 0.34, groupMask);
  threshold -= towers * 0.05 + shelf * 0.035 + anvil * 0.04 + overcast * 0.075;
  threshold -= stratocumulus * 0.036 + horizonRows * 0.052 + layeredShelf * 0.046 + flatAnvil * 0.034;
  threshold += wispy * 0.055 + openCenter * 0.02 + parallelWisps * 0.05;
  threshold += leftDriftWisps * 0.045 + rightDriftWisps * 0.045 + crownHighWisps * 0.036 + openCenterWisps * 0.052;
  threshold -= fullHighWisps * 0.02 + lowCrossingWisps * 0.014 + stormVeilWisps * 0.04;
  float field = base * 0.46 + shape * mix(0.78, 0.92, towers + anvil) + detail * presetDetail - threshold;
  float wisps = smoothstep(0.42, 0.74, fbm(p * vec3(0.34, 0.48, 0.3) + drift * 0.55));
  float band = max(max(highBand, lowBand * 0.82), coreBand * 1.06);
  band = mix(band, max(coreBand * 0.78, highBand * 1.42), towers);
  band = mix(band, lowBand * 1.32, shelf);
  band = mix(band, max(highBand * 1.16, coreBand * 0.72), anvil);
  band = mix(band, max(lowBand * 0.82, highBand * 0.6), waves);
  band = mix(band, max(max(highBand, lowBand), coreBand) * 1.18, overcast);
  band = mix(band, max(lowBand * 1.1, coreBand * 0.64), stratocumulus);
  band = mix(band, lowBand * 1.42, horizonRows);
  band = mix(band, highBand * 0.88, parallelWisps);
  band = mix(band, max(lowBand * 1.18, coreBand * 0.82), layeredShelf);
  band = mix(band, highBand * 1.32, flatAnvil);
  band = mix(band, max(highBand * 1.06, coreBand * 0.5), fullHighWisps);
  band = mix(band, max(highBand * 0.98, coreBand * 0.32), leftDriftWisps + rightDriftWisps);
  band = mix(band, highBand * 1.18, crownHighWisps);
  band = mix(band, max(coreBand * 0.92, lowBand * 0.62), lowCrossingWisps);
  band = mix(band, highBand * centerOpening, openCenterWisps);
  band = mix(band, max(highBand * 1.08, coreBand * 0.86), stormVeilWisps);
  float densityScale = 2.18 + towers * 0.42 + shelf * 0.24 + anvil * 0.28 - wispy * 0.62 + overcast * 0.34;
  densityScale += stratocumulus * 0.12 + horizonRows * 0.18 - parallelWisps * 0.5 + layeredShelf * 0.2 + flatAnvil * 0.12;
  densityScale += fullHighWisps * 0.18 - leftDriftWisps * 0.22 - rightDriftWisps * 0.22 - crownHighWisps * 0.28;
  densityScale += lowCrossingWisps * 0.06 - openCenterWisps * 0.34 + stormVeilWisps * 0.32;
  return max(field * band * horizonFade * mix(0.88, 1.26, wisps) * mix(0.82, 1.2, billows) * groupMask * densityScale, 0.0);
}

vec3 getRayDirection(vec2 uv) {
  vec2 p = uv * 2.0 - 1.0;
  p.x *= uResolution.x / uResolution.y;
  return normalize(vec3(p.x * 0.82, p.y * 0.5 - 0.08, 1.35));
}

float starLayer(vec2 uv, float scale, float threshold, float seed) {
  vec2 aspectUv = vec2(uv.x * uResolution.x / uResolution.y, uv.y);
  vec2 grid = aspectUv * scale;
  vec2 id = floor(grid);
  vec2 cell = fract(grid) - 0.5;
  float random = hash(vec3(id, seed));
  float size = mix(0.018, 0.06, hash(vec3(id, seed + 19.0)));
  float brightness = mix(0.35, 1.0, hash(vec3(id, seed + 41.0)));
  float point = smoothstep(size, 0.0, length(cell));

  return point * step(threshold, random) * brightness;
}

float henyeyGreenstein(float cosTheta, float g) {
  float g2 = g * g;
  return (1.0 - g2) / max(pow(1.0 + g2 - 2.0 * g * cosTheta, 1.5), 0.001);
}

float cloudTransmittance(vec3 p, vec3 lightDirection) {
  float opticalDepth = 0.0;

  for (int i = 0; i < LIGHT_STEPS; i++) {
    float stepDepth = 0.16 + float(i) * 0.2;
    vec3 samplePoint = p + lightDirection * stepDepth;
    opticalDepth += cloudDensity(samplePoint) * 0.28;
  }

  return exp(-opticalDepth * 2.2);
}

vec3 skyGradient(vec2 uv, vec3 rayDirection, vec3 lightDirection) {
  float day = smootherstep(0.0, 1.0, uDayNight);
  float height = clamp(uv.y, 0.0, 1.0);
  float morning = smootherstep(0.06, 0.62, day) * (1.0 - smootherstep(0.82, 1.0, day));

  vec3 nightBottom = vec3(0.035, 0.04, 0.115);
  vec3 nightTop = vec3(0.002, 0.005, 0.024);
  vec3 dayBottom = vec3(0.42, 0.74, 1.0);
  vec3 dayTop = vec3(0.08, 0.36, 0.82);
  vec3 sky = mix(mix(nightBottom, nightTop, height), mix(dayBottom, dayTop, height), day);
  vec3 sunriseBottom = vec3(0.96, 0.36, 0.18);
  vec3 sunriseMiddle = vec3(0.5, 0.22, 0.64);
  vec3 sunriseTop = vec3(0.08, 0.06, 0.28);
  vec3 sunriseSky = mix(sunriseBottom, sunriseMiddle, smoothstep(0.0, 0.58, height));
  sunriseSky = mix(sunriseSky, sunriseTop, smoothstep(0.5, 1.0, height));
  sky = mix(sky, sunriseSky, morning * 0.62);

  float cosLight = max(dot(rayDirection, lightDirection), 0.0);
  float orb = pow(cosLight, mix(380.0, 190.0, day));
  float forwardScatter = henyeyGreenstein(cosLight, mix(0.28, 0.68, day));
  float shaftShape = pow(cosLight, mix(8.0, 5.2, day));
  float shaftNoise = fbm(vec3(uv * vec2(3.2, 2.1), uTime * 0.08));
  float shaftBreakup = smoothstep(0.18, 0.84, shaftNoise);
  vec3 orbColor = mix(vec3(0.64, 0.72, 1.0), vec3(0.88, 1.0, 0.94), day);
  orbColor = mix(orbColor, vec3(1.0, 0.42, 0.12), morning * 0.9);
  vec3 shaftColor = mix(vec3(0.24, 0.32, 0.74), vec3(0.82, 1.0, 0.84), day);
  shaftColor = mix(shaftColor, vec3(1.0, 0.38, 0.76), morning * 0.74);

  sky += orbColor * orb * mix(0.95, 1.22, day);
  sky += shaftColor * shaftShape * shaftBreakup * forwardScatter * mix(0.018, 0.048, day);

  sky += vec3(1.0, 0.34, 0.12) * morning * pow(1.0 - height, 1.85) * 0.58;
  sky += vec3(0.36, 0.12, 0.74) * morning * smoothstep(0.28, 0.9, height) * 0.22;

  float starMask = smoothstep(0.22, 0.86, height) * (1.0 - smoothstep(0.02, 0.76, day));
  float stars = starLayer(uv, 145.0, 0.945, 13.0);
  stars += starLayer(uv + vec2(0.17, 0.08), 240.0, 0.972, 37.0) * 0.55;
  stars += starLayer(uv + vec2(0.41, 0.29), 92.0, 0.982, 71.0) * 1.5;
  vec3 starColor = mix(vec3(0.74, 0.82, 1.0), vec3(1.0, 0.92, 0.72), noise(vec3(uv * 34.0, 4.0)));
  sky += starColor * stars * starMask * 0.95;

  return sky;
}

vec4 raymarchClouds(vec3 rayOrigin, vec3 rayDirection, float offset, vec3 lightDirection) {
  float depth = 1.0 + offset * MARCH_SIZE;
  float alpha = 0.0;
  float accumulatedOpticalDepth = 0.0;
  vec3 color = vec3(0.0);
  float day = smootherstep(0.0, 1.0, uDayNight);
  float morning = smootherstep(0.06, 0.62, day) * (1.0 - smootherstep(0.82, 1.0, day));
  float viewLight = max(dot(rayDirection, lightDirection), 0.0);
  float phase = henyeyGreenstein(viewLight, mix(0.24, 0.58, day));

  for (int i = 0; i < MAX_STEPS; i++) {
    vec3 p = rayOrigin + rayDirection * depth;
    p.y += 0.36;
    p.x += sin(p.z * 0.16 + uTime * 0.05) * 0.32;
    p.x += sin(p.z * 0.72 + p.y * 1.4) * 0.18;

    float density = cloudDensity(p);

    if (density > 0.004) {
      float lightSample = cloudDensity(p + lightDirection * 0.38);
      float directional = clamp((density - lightSample) * 4.1 + 0.44, 0.0, 1.0);
      float transmittance = cloudTransmittance(p, lightDirection);
      float viewTransmittance = exp(-accumulatedOpticalDepth * mix(0.22, 0.36, day));
      float silver = pow(viewLight, mix(2.8, 4.2, day)) * transmittance;

      vec3 nightCloud = vec3(0.2, 0.23, 0.4);
      vec3 dayCloud = vec3(1.12, 1.08, 0.98);
      dayCloud = mix(dayCloud, vec3(1.1, 0.94, 1.02), morning * 0.28);
      vec3 shadow = mix(vec3(0.055, 0.06, 0.13), vec3(0.2, 0.42, 0.46), day);
      shadow = mix(shadow, vec3(0.24, 0.1, 0.38), morning * 0.62);
      vec3 warmLight = mix(vec3(0.48, 0.55, 0.95), vec3(1.0, 0.72, 0.34), day);
      warmLight = mix(warmLight, vec3(1.0, 0.34, 0.1), morning * 0.88);
      vec3 lit = mix(nightCloud, dayCloud, day) * (0.42 + directional * mix(0.82, 1.38, day));
      lit *= mix(0.34, 1.32, transmittance);
      lit = mix(shadow, lit, clamp(directional * transmittance + density * 0.6, 0.0, 1.0));
      lit = mix(lit, max(lit, vec3(0.94, 0.96, 0.94)), day * directional * transmittance * 0.24);
      lit += warmLight * phase * density * transmittance * mix(0.018, 0.034, day);
      lit += warmLight * silver * density * mix(0.18, 0.42, day);
      lit += warmLight * morning * silver * density * 0.22;
      lit += vec3(0.88, 0.24, 0.76) * morning * (1.0 - directional) * density * 0.08;

      float sampleAlpha = clamp(density * mix(0.22, 0.31, day), 0.0, 0.44);
      sampleAlpha *= viewTransmittance * (1.0 - alpha);
      color += lit * sampleAlpha;
      alpha += sampleAlpha;
      accumulatedOpticalDepth += density * MARCH_SIZE;
    }

    depth += MARCH_SIZE;
    if (alpha > 0.98 || depth > 7.7) {
      break;
    }
  }

  return vec4(color, alpha);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec3 rayOrigin = vec3(0.0, -0.18, -2.6);
  vec3 rayDirection = getRayDirection(uv);

  float day = smootherstep(0.0, 1.0, uDayNight);
  vec3 moonDirection = normalize(vec3(-0.58, 0.46, 0.68));
  vec3 sunDirection = normalize(vec3(0.48, 0.22 + day * 0.46, 0.74));
  vec3 lightDirection = normalize(mix(moonDirection, sunDirection, day));

  vec3 sky = skyGradient(uv, rayDirection, lightDirection);
  float blueNoise = texture(uBlueNoise, gl_FragCoord.xy / 64.0).r;
  float temporalOffset = fract(blueNoise + mod(uTime * 24.0, 32.0) / sqrt(0.5));
  vec4 clouds = raymarchClouds(rayOrigin, rayDirection, temporalOffset, lightDirection);

  vec3 color = mix(sky, clouds.rgb + sky * (1.0 - clouds.a), clouds.a);

  vec2 buttonUv = uButtonCenter / uResolution;
  float buttonGlow = 1.0 - smoothstep(0.0, uButtonRadius / min(uResolution.x, uResolution.y), distance(uv, buttonUv));
  color += mix(vec3(0.16, 0.2, 0.52), vec3(0.76, 1.0, 0.9), day) * buttonGlow * 0.18;

  vec2 pointerUv = uPointer / uResolution;
  float pointerGlow = 1.0 - smoothstep(0.0, 0.3, distance(uv, pointerUv));
  color += mix(vec3(0.1, 0.13, 0.34), vec3(0.3, 0.94, 1.0), day) * pointerGlow * 0.04;

  color = pow(color, vec3(0.9));
  fragColor = vec4(color, 1.0);
}
`;

type UniformLocations = {
  buttonCenter: WebGLUniformLocation | null;
  buttonRadius: WebGLUniformLocation | null;
  cloudPreset: WebGLUniformLocation | null;
  dayNight: WebGLUniformLocation | null;
  pointer: WebGLUniformLocation | null;
  resolution: WebGLUniformLocation | null;
  time: WebGLUniformLocation | null;
};

function compileShader(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);

  if (!shader) {
    throw new Error("Unable to create shader.");
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader) ?? "Unknown shader error.";
    gl.deleteShader(shader);
    throw new Error(message);
  }

  return shader;
}

function createProgram(gl: WebGL2RenderingContext) {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
  const program = gl.createProgram();

  if (!program) {
    throw new Error("Unable to create WebGL program.");
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const message = gl.getProgramInfoLog(program) ?? "Unknown program link error.";
    gl.deleteProgram(program);
    throw new Error(message);
  }

  return program;
}

function createNoiseTexture(gl: WebGL2RenderingContext) {
  const size = 64;
  const data = new Uint8Array(size * size * 4);

  for (let i = 0; i < data.length; i += 4) {
    const value = Math.floor(Math.random() * 256);
    data[i] = value;
    data[i + 1] = value;
    data[i + 2] = value;
    data[i + 3] = 255;
  }

  const texture = gl.createTexture();

  if (!texture) {
    throw new Error("Unable to create noise texture.");
  }

  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

  return texture;
}

function smoothstep(edge0: number, edge1: number, value: number) {
  const x = Math.min(Math.max((value - edge0) / (edge1 - edge0), 0), 1);
  return x * x * (3 - 2 * x);
}

type CloudHeroProps = {
  cloudPreset?: number;
  transitionSmoothness?: number;
};

export function CloudHero({ cloudPreset = 4, transitionSmoothness = 0.72 }: CloudHeroProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const heroRef = useRef<HTMLElement | null>(null);
  const pointerRef = useRef({ active: false, x: 0, y: 0 });
  const cloudPresetRef = useRef(cloudPreset);
  const transitionSmoothnessRef = useRef(transitionSmoothness);

  useEffect(() => {
    cloudPresetRef.current = cloudPreset;
  }, [cloudPreset]);

  useEffect(() => {
    transitionSmoothnessRef.current = Math.min(Math.max(transitionSmoothness, 0), 1);
  }, [transitionSmoothness]);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const gl = canvas.getContext("webgl2", {
      alpha: false,
      antialias: false,
      depth: false,
      powerPreference: "high-performance",
      stencil: false,
    });

    if (!gl) {
      canvas.dataset.webglState = "unsupported";
      return;
    }

    let animationFrame = 0;
    let width = 1;
    let height = 1;
    let dayNight = 0.45;
    let program: WebGLProgram;
    let vertexArray: WebGLVertexArrayObject | null;
    let noiseTexture: WebGLTexture;
    let uniforms: UniformLocations;
    let blueNoiseLocation: WebGLUniformLocation | null;

    try {
      program = createProgram(gl);
      vertexArray = gl.createVertexArray();
      noiseTexture = createNoiseTexture(gl);
      uniforms = {
        buttonCenter: gl.getUniformLocation(program, "uButtonCenter"),
        buttonRadius: gl.getUniformLocation(program, "uButtonRadius"),
        cloudPreset: gl.getUniformLocation(program, "uCloudPreset"),
        dayNight: gl.getUniformLocation(program, "uDayNight"),
        pointer: gl.getUniformLocation(program, "uPointer"),
        resolution: gl.getUniformLocation(program, "uResolution"),
        time: gl.getUniformLocation(program, "uTime"),
      };
      blueNoiseLocation = gl.getUniformLocation(program, "uBlueNoise");
    } catch (error) {
      canvas.dataset.webglState = "setup-error";
      console.error("Cloud hero WebGL setup failed", error);
      return;
    }

    const startedAt = performance.now();
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    gl.useProgram(program);
    gl.bindVertexArray(vertexArray);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, noiseTexture);
    gl.uniform1i(blueNoiseLocation, 0);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      const renderScale = 0.34;
      width = Math.max(1, Math.floor(rect.width * pixelRatio * renderScale));
      height = Math.max(1, Math.floor(rect.height * pixelRatio * renderScale));

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
    };

    let previousFrame = performance.now();

    const render = (now: number) => {
      resize();

      const deltaSeconds = Math.min((now - previousFrame) / 1000, 0.05);
      previousFrame = now;

      const canvasRect = canvas.getBoundingClientRect();
      const buttonRect = buttonRef.current?.getBoundingClientRect();
      const pointer = pointerRef.current;
      const scaleX = width / canvasRect.width;
      const scaleY = height / canvasRect.height;
      const fallbackCycle = 0.52 + Math.sin((now - startedAt) * 0.000055) * 0.18;

      let buttonCenterX = width * 0.5;
      let buttonCenterY = height * 0.5;
      let buttonRadius = Math.min(width, height) * 0.22;

      if (buttonRect) {
        buttonCenterX = (buttonRect.left + buttonRect.width / 2 - canvasRect.left) * scaleX;
        buttonCenterY = height - (buttonRect.top + buttonRect.height / 2 - canvasRect.top) * scaleY;
        buttonRadius = Math.max(buttonRect.width, buttonRect.height) * Math.max(scaleX, scaleY) * 3.2;
      }

      let targetDayNight = fallbackCycle;

      if (pointer.active && buttonRect) {
        const buttonCenterClientX = buttonRect.left + buttonRect.width / 2;
        const buttonCenterClientY = buttonRect.top + buttonRect.height / 2;
        const distance = Math.hypot(pointer.x - buttonCenterClientX, pointer.y - buttonCenterClientY);
        const influence = Math.max(buttonRect.width, buttonRect.height) * 4.8;
        targetDayNight = Math.pow(1 - smoothstep(0, influence, distance), 0.72);
      }

      const transitionSmoothness = transitionSmoothnessRef.current;
      const responseRate = 24 - transitionSmoothness * 19;
      const response = 1 - Math.exp(-deltaSeconds * responseRate);
      dayNight += (targetDayNight - dayNight) * response;
      heroRef.current?.style.setProperty("--hero-day", dayNight.toFixed(3));

      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(uniforms.time, mediaQuery.matches ? 0 : (now - startedAt) * 0.001);
      gl.uniform1f(uniforms.dayNight, dayNight);
      gl.uniform1f(uniforms.buttonRadius, buttonRadius);
      gl.uniform1i(uniforms.cloudPreset, cloudPresetRef.current);
      gl.uniform2f(uniforms.resolution, width, height);
      gl.uniform2f(uniforms.buttonCenter, buttonCenterX, buttonCenterY);
      gl.uniform2f(uniforms.pointer, pointer.x * scaleX, height - (pointer.y - canvasRect.top) * scaleY);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      animationFrame = window.requestAnimationFrame(render);
    };

    const handlePointerMove = (event: PointerEvent) => {
      pointerRef.current = {
        active: event.pointerType === "mouse" || event.pointerType === "pen",
        x: event.clientX,
        y: event.clientY,
      };
    };

    const handleMouseMove = (event: MouseEvent) => {
      pointerRef.current = {
        active: true,
        x: event.clientX,
        y: event.clientY,
      };
    };

    const clearPointer = () => {
      pointerRef.current.active = false;
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("blur", clearPointer);
    render(performance.now());

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("blur", clearPointer);
      window.cancelAnimationFrame(animationFrame);
      gl.deleteTexture(noiseTexture);
      gl.deleteVertexArray(vertexArray);
      gl.deleteProgram(program);
    };
  }, []);

  return (
    <section
      className="cloud-hero"
      ref={heroRef}
      onPointerLeave={() => {
        pointerRef.current.active = false;
      }}
      onMouseMove={(event) => {
        pointerRef.current = {
          active: true,
          x: event.clientX,
          y: event.clientY,
        };
      }}
      onPointerMove={(event) => {
        pointerRef.current = {
          active: event.pointerType === "mouse" || event.pointerType === "pen",
          x: event.clientX,
          y: event.clientY,
        };
      }}
    >
      <canvas aria-hidden="true" className="cloud-hero__canvas" ref={canvasRef} />
      <div className="cloud-hero__shade" />
      <div className="cloud-hero__content">
        <p className="eyebrow">Patterns for Creativity</p>
        <h1>Light gathers, scatters, and thins through the clouds.</h1>
        <p>
          A WebGL cloudscape turns proximity into atmosphere: night softens into sunrise, then
          opens into a clear blue day.
        </p>
        <button className="cloud-hero__button" ref={buttonRef} type="button">
          Shape the Light
        </button>
      </div>
    </section>
  );
}
