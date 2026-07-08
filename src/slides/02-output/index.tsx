import { useEffect, useState } from "react";
import { motion } from "motion/react";
import codeUrl from "./code.svg";
import engineerUrl from "./engineer.svg";

type OutputSlideProps = {
  className?: string;
  isAnimated?: boolean;
};

const arrowTopPoints = "2 144.06 2 28.12 422.5 28.12 422.5 2 556 86.5 422 171.34 422.5 144.06 2 144.06";
const panelShapePoints = parsePointValues("2 228 2 2 556 2 556 2 556 143.16 556 228 556 228 2 228");
const stepOneShapePoints = parsePointValues("2 228 2 58.66 422.5 58.66 422.5 58.66 556 143.16 422 228 422 228 2 228");
const finalLoweredArrowPoints = parsePointValues("2 200.72 2 84.78 422.5 84.78 422.5 58.66 556 143.16 422 228 422.5 200.72 2 200.72");
const arrowTopLift = -56.66;
const step1MoveMs = 500;
const pauseAfterStep1Ms = 100;
const step2MoveMs = 280;
const pauseBeforeLiftMs = 100;
const liftDurationMs = 480;
const depthFadeMs = 180;
const outlineFadeMs = 220;
const outputAnimationTiming = getOutputAnimationTiming();

type OutputAnimationTiming = {
  liftDurationMs: number;
  depthFadeMs: number;
  outlineFadeMs: number;
  morphDurationMs: number;
  liftStartMs: number;
  totalDurationMs: number;
  step1At: number;
  step1HoldAt: number;
  step2At: number;
};

export function OutputSlide({ className = "", isAnimated = false }: OutputSlideProps) {
  const timing = outputAnimationTiming;
  const progress = useOutputArrowProgress(isAnimated, timing.totalDurationMs);
  const panelBackgroundOpacity = isAnimated
    ? easeOutCubic(clamp((progress - timing.liftStartMs) / timing.liftDurationMs))
    : 0;
  const liftTransition = {
    delay: timing.liftStartMs / 1000,
    duration: timing.liftDurationMs / 1000,
    ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
  };

  return (
    <div className={`output-slide ${isAnimated ? "output-slide--animated" : ""} ${className}`.trim()}>
      <div
        aria-hidden="true"
        className="output-slide__panel-background"
        style={{ opacity: panelBackgroundOpacity }}
      />
      <motion.img
        alt=""
        aria-hidden="true"
        className="output-slide__text output-slide__text--engineer"
        draggable={false}
        initial={isAnimated ? { opacity: 0, y: "calc(-50% + 42px)" } : false}
        animate={{ opacity: 1, y: "-50%" }}
        transition={isAnimated ? liftTransition : { duration: 0 }}
        src={engineerUrl}
      />
      <AnimatedArrow isAnimated={isAnimated} progress={progress} timing={timing} />
      <motion.img
        alt=""
        aria-hidden="true"
        className="output-slide__text output-slide__text--code"
        draggable={false}
        initial={isAnimated ? { opacity: 0, y: "calc(-50% + 42px)" } : false}
        animate={{ opacity: 1, y: "-50%" }}
        transition={isAnimated ? liftTransition : { duration: 0 }}
        src={codeUrl}
      />
    </div>
  );
}

function AnimatedArrow({
  isAnimated,
  progress,
  timing,
}: {
  isAnimated: boolean;
  progress: number;
  timing: OutputAnimationTiming;
}) {
  const morphProgress = clamp(progress / timing.morphDurationMs);
  const pointKeyframes = getMorphPointKeyframes(timing);
  const scalarKeyframes = getMorphScalarKeyframes(timing);
  const heldMorphProgress = interpolateScalarKeyframes(scalarKeyframes, morphProgress);
  const morphScaleProgress = easeOutQuart(heldMorphProgress);
  const liftProgress = easeOutCubic(clamp((progress - timing.liftStartMs) / timing.liftDurationMs));
  const depthProgress = clamp((progress - timing.liftStartMs) / timing.depthFadeMs);
  const textColorProgress = easeOutQuart(heldMorphProgress);
  const arrowStyle = {
    height: `${mix(100, 13, morphScaleProgress)}%`,
    left: `${mix(0, 41.5, morphScaleProgress)}%`,
    top: `${mix(0, 45, morphScaleProgress)}%`,
    width: `${mix(100, 17, morphScaleProgress)}%`,
  };
  const topPoints = isAnimated
    ? formatPointValues(interpolatePointKeyframes(pointKeyframes, morphProgress))
    : arrowTopPoints;
  const topFill = isAnimated
    ? mixColor([29, 24, 22], [255, 255, 255], textColorProgress)
    : "#ffffff";
  const topTransform = isAnimated ? `translate(0 ${arrowTopLift * liftProgress})` : undefined;
  const outlinePoints = isAnimated
    ? formatPointValues([
      2, mix(200.72, 144.06, liftProgress),
      2, 200.72,
      422.5, 200.72,
      422, 228,
      556, 143.16,
      556, mix(143.16, 86.5, liftProgress),
    ])
    : "2 144.06 2 200.72 422.5 200.72 422 228 556 143.16 556 86.5";

  return (
    <svg
      aria-hidden="true"
      className="output-slide__arrow"
      style={arrowStyle}
      viewBox="0 0 558 230"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="output-arrow-gradient" x1="2" y1="94.75" x2="556" y2="94.75" gradientTransform="translate(0 252) scale(1 -1)" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#f3f1f1" />
          <stop offset=".76" stopColor="#b8b8b8" />
          <stop offset=".77" stopColor="#f3f1f1" />
        </linearGradient>
      </defs>
      <path
        className="cls-3 output-slide__arrow-depth"
        d="M556,86.5v56.66l-134,84.84.5-27.28H2v-56.66h420.5l-.5,27.28,134-84.84h0Z"
        opacity={isAnimated ? depthProgress : 1}
      />
      <g
        transform={topTransform}
      >
        <polygon
          className="cls-2"
          fill={topFill}
          points={topPoints}
        />
      </g>
      <polyline
        className="cls-1 output-slide__arrow-line"
        points={outlinePoints}
        opacity={isAnimated ? clamp((progress - timing.liftStartMs) / timing.outlineFadeMs) : 1}
      />
    </svg>
  );
}

function useOutputArrowProgress(isAnimated: boolean, totalDurationMs: number) {
  const [progress, setProgress] = useState(() => isAnimated ? 0 : totalDurationMs);

  useEffect(() => {
    if (!isAnimated) {
      setProgress(totalDurationMs);
      return undefined;
    }

    let frame = 0;
    const start = performance.now();
    setProgress(0);

    const tick = (now: number) => {
      const nextProgress = Math.min(now - start, totalDurationMs);
      setProgress(nextProgress);

      if (nextProgress < totalDurationMs) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [isAnimated, totalDurationMs]);

  return progress;
}

function getOutputAnimationTiming(): OutputAnimationTiming {
  const morphDurationMs = Math.max(1, step1MoveMs + pauseAfterStep1Ms + step2MoveMs);
  const liftStartMs = morphDurationMs + pauseBeforeLiftMs;

  return {
    liftDurationMs,
    depthFadeMs,
    outlineFadeMs,
    morphDurationMs,
    liftStartMs,
    totalDurationMs: liftStartMs + liftDurationMs,
    step1At: step1MoveMs / morphDurationMs,
    step1HoldAt: (step1MoveMs + pauseAfterStep1Ms) / morphDurationMs,
    step2At: (step1MoveMs + pauseAfterStep1Ms + step2MoveMs) / morphDurationMs,
  };
}

function getMorphPointKeyframes(timing: OutputAnimationTiming) {
  return [
    { at: 0, values: panelShapePoints },
    { at: timing.step1At, values: stepOneShapePoints },
    { at: timing.step1HoldAt, values: stepOneShapePoints },
    { at: timing.step2At, values: finalLoweredArrowPoints },
    { at: 1, values: finalLoweredArrowPoints },
  ];
}

function getMorphScalarKeyframes(timing: OutputAnimationTiming) {
  return [
    { at: 0, value: 0 },
    { at: timing.step1At, value: 1 },
    { at: timing.step1HoldAt, value: 1 },
    { at: timing.step2At, value: 1 },
    { at: 1, value: 1 },
  ];
}

function parsePointValues(points: string) {
  return points.split(/\s+/).map((value) => Number.parseFloat(value));
}

function interpolatePointKeyframes(
  keyframes: Array<{ at: number; values: number[] }>,
  progress: number,
) {
  const first = keyframes[0];
  const last = keyframes[keyframes.length - 1];

  if (!first || !last) {
    return [];
  }

  if (progress <= first.at) {
    return first.values;
  }

  if (progress >= last.at) {
    return last.values;
  }

  const nextIndex = keyframes.findIndex((keyframe) => keyframe.at >= progress);
  const next = keyframes[nextIndex] ?? last;
  const previous = keyframes[nextIndex - 1] ?? first;
  const localProgress = easeInOutCubic(clamp((progress - previous.at) / (next.at - previous.at)));

  return interpolateValues(previous.values, next.values, localProgress);
}

function interpolateScalarKeyframes(
  keyframes: Array<{ at: number; value: number }>,
  progress: number,
) {
  const first = keyframes[0];
  const last = keyframes[keyframes.length - 1];

  if (!first || !last) {
    return progress;
  }

  if (progress <= first.at) {
    return first.value;
  }

  if (progress >= last.at) {
    return last.value;
  }

  const nextIndex = keyframes.findIndex((keyframe) => keyframe.at >= progress);
  const next = keyframes[nextIndex] ?? last;
  const previous = keyframes[nextIndex - 1] ?? first;
  const localProgress = easeInOutCubic(clamp((progress - previous.at) / (next.at - previous.at)));

  return mix(previous.value, next.value, localProgress);
}

function interpolateValues(from: number[], to: number[], progress: number) {
  return from.map((value, index) => mix(value, to[index] ?? value, progress));
}

function formatPointValues(values: number[]) {
  return values.map((value) => Number.isInteger(value) ? `${value}` : value.toFixed(2)).join(" ");
}

function mix(from: number, to: number, progress: number) {
  return from + (to - from) * progress;
}

function mixColor(from: [number, number, number], to: [number, number, number], progress: number) {
  const [r, g, b] = from.map((value, index) => Math.round(mix(value, to[index] ?? value, progress)));
  return `rgb(${r}, ${g}, ${b})`;
}

function clamp(value: number) {
  return Math.min(1, Math.max(0, value));
}

function easeOutQuart(value: number) {
  return 1 - (1 - value) ** 4;
}

function easeOutCubic(value: number) {
  return 1 - (1 - value) ** 3;
}

function easeInOutCubic(value: number) {
  return value < 0.5 ? 4 * value ** 3 : 1 - ((-2 * value + 2) ** 3) / 2;
}
