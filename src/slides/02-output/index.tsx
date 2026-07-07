import { useEffect, useState } from "react";
import { motion } from "motion/react";
import codeUrl from "./code.svg";
import engineerUrl from "./engineer.svg";

type OutputSlideProps = {
  className?: string;
  isAnimated?: boolean;
};

const arrowTopPoints = "2 144.06 2 28.12 422.5 28.12 422.5 2 556 86.5 422 171.34 422.5 144.06 2 144.06";
const morphPointKeyframes = [
  {
    at: 0,
    values: parsePointValues("2 228 2 2 556 2 556 2 556 143.16 556 228 556 228 2 228"),
  },
  {
    at: 0.34,
    values: parsePointValues("2 228 2 2 422.5 2 422.5 2 556 143.16 422 228 422.5 228 2 228"),
  },
  {
    at: 0.62,
    values: parsePointValues("2 228 2 2 422.5 2 422.5 2 556 143.16 422 228 422.5 228 2 228"),
  },
  {
    at: 1,
    values: parsePointValues("2 200.72 2 84.78 422.5 84.78 422.5 58.66 556 143.16 422 228 422.5 200.72 2 200.72"),
  },
];
const arrowTopLift = -56.66;
const morphDurationMs = 980;
const liftDurationMs = 480;

const liftTransition = {
  delay: morphDurationMs / 1000,
  duration: 0.48,
  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
};

export function OutputSlide({ className = "", isAnimated = false }: OutputSlideProps) {
  const progress = useOutputArrowProgress(isAnimated);
  const panelBackgroundOpacity = isAnimated
    ? easeOutCubic(clamp((progress - morphDurationMs) / liftDurationMs))
    : 0;

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
        initial={isAnimated ? { opacity: 0, y: 42 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={isAnimated ? liftTransition : { duration: 0 }}
        src={engineerUrl}
      />
      <AnimatedArrow isAnimated={isAnimated} progress={progress} />
      <motion.img
        alt=""
        aria-hidden="true"
        className="output-slide__text output-slide__text--code"
        draggable={false}
        initial={isAnimated ? { opacity: 0, y: 42 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={isAnimated ? liftTransition : { duration: 0 }}
        src={codeUrl}
      />
    </div>
  );
}

function AnimatedArrow({ isAnimated, progress }: { isAnimated: boolean; progress: number }) {
  const morphProgress = clamp(progress / morphDurationMs);
  const morphScaleProgress = easeOutQuart(morphProgress);
  const liftProgress = easeOutCubic(clamp((progress - morphDurationMs) / liftDurationMs));
  const depthProgress = clamp((progress - morphDurationMs) / 180);
  const textColorProgress = easeOutQuart(morphProgress);
  const arrowStyle = {
    height: `${mix(100, 26, morphScaleProgress)}%`,
    left: `${mix(0, 33, morphScaleProgress)}%`,
    top: `${mix(0, 37, morphScaleProgress)}%`,
    width: `${mix(100, 34, morphScaleProgress)}%`,
  };
  const topPoints = isAnimated
    ? formatPointValues(interpolatePointKeyframes(morphPointKeyframes, morphProgress))
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
        opacity={isAnimated ? clamp((progress - morphDurationMs) / 220) : 1}
      />
    </svg>
  );
}

function useOutputArrowProgress(isAnimated: boolean) {
  const [progress, setProgress] = useState(() => isAnimated ? 0 : morphDurationMs + liftDurationMs);

  useEffect(() => {
    if (!isAnimated) {
      setProgress(morphDurationMs + liftDurationMs);
      return undefined;
    }

    let frame = 0;
    const start = performance.now();
    const totalDuration = morphDurationMs + liftDurationMs;

    const tick = (now: number) => {
      const nextProgress = Math.min(now - start, totalDuration);
      setProgress(nextProgress);

      if (nextProgress < totalDuration) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [isAnimated]);

  return progress;
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
