import { useEffect, useState } from "react";
import { motion } from "motion/react";
import finishUrl from "./finish.svg";
import startUrl from "./start.svg";

type ManufacturingSlideProps = {
  className?: string;
  isAnimated?: boolean;
};

const easeOut = [0.22, 1, 0.36, 1] as [number, number, number, number];
const lineStartX = 36;
const lineEndX = 2457;
const lineCenterX = (lineStartX + lineEndX) / 2;
const lineStartHalfWidth = 210;
const arrowFlattenDuration = 0.28;
const arrowCollapseDelay = arrowFlattenDuration;
const arrowCollapseDuration = 0.42;
const lineExtendDelay = arrowCollapseDelay + arrowCollapseDuration;
const lineExtendDuration = 0.44;
const endpointsDelay = lineExtendDelay + lineExtendDuration;
const endpointGrowDuration = 0.24;
const riserDelay = endpointsDelay + 0.22;
const lightRiserDelay = riserDelay + 0.04;
const labelsDelay = riserDelay + 0.32;
const arrowCollapseY = 179.76;
const arrowDepthPoints = parsePointValues("556 86.5 556 143.16 422 228 422.5 200.72 2 200.72 2 144.06 422.5 144.06 422 171.34");
const arrowTopPoints = parsePointValues("2 144.06 2 28.12 422.5 28.12 422.5 2 556 86.5 422 171.34 422.5 144.06 2 144.06");
const arrowLinePoints = parsePointValues("2 144.06 2 200.72 422.5 200.72 422 228 556 143.16 556 86.5");
const flattenedArrowDepthPoints = parsePointValues("556 143.16 556 143.16 422 228 422.5 200.72 2 200.72 2 200.72 422.5 200.72 422 228");
const flattenedArrowTopPoints = parsePointValues("2 200.72 2 84.78 422.5 84.78 422.5 58.66 556 143.16 422 228 422.5 200.72 2 200.72");
const flattenedArrowLinePoints = parsePointValues("2 200.72 2 200.72 422.5 200.72 422 228 556 143.16 556 143.16");
const collapsedArrowTopPoints = collapsePointValuesToY(flattenedArrowTopPoints, arrowCollapseY);

export function ManufacturingSlide({
  className = "",
  isAnimated = false,
}: ManufacturingSlideProps) {
  const immediate = { duration: 0 };
  const arrowFlattenProgress = useDelayedProgress(
    isAnimated,
    0,
    arrowFlattenDuration * 1000,
  );
  const arrowCollapseProgress = useDelayedProgress(
    isAnimated,
    arrowCollapseDelay * 1000,
    arrowCollapseDuration * 1000,
  );
  const [isTimelineVisible, setIsTimelineVisible] = useState(() => !isAnimated);
  const easedArrowFlattenProgress = easeOutCubic(arrowFlattenProgress);
  const easedArrowCollapseProgress = easeOutCubic(arrowCollapseProgress);
  const flattenedTopPoints = interpolateValues(
    arrowTopPoints,
    flattenedArrowTopPoints,
    easedArrowFlattenProgress,
  );
  const topPoints = formatPointValues(interpolateValues(
    flattenedTopPoints,
    collapsedArrowTopPoints,
    easedArrowCollapseProgress,
  ));
  const depthPoints = formatPointValues(interpolateValues(
    arrowDepthPoints,
    flattenedArrowDepthPoints,
    easedArrowFlattenProgress,
  ));
  const extrusionLinePoints = formatPointValues(interpolateValues(
    arrowLinePoints,
    flattenedArrowLinePoints,
    easedArrowFlattenProgress,
  ));
  const shouldRenderExtrusion = arrowFlattenProgress < 1;

  useEffect(() => {
    if (!isAnimated) {
      setIsTimelineVisible(true);
      return undefined;
    }

    setIsTimelineVisible(false);
    const timeout = window.setTimeout(() => {
      setIsTimelineVisible(true);
    }, lineExtendDelay * 1000);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [isAnimated]);

  return (
    <div className={`manufacturing-slide ${className}`.trim()}>
      <div
        aria-hidden="true"
        className="output-slide__panel-background"
        style={{ opacity: 1 }}
      />
      {!isTimelineVisible ? (
        <motion.svg
          aria-hidden="true"
          className="manufacturing-slide__arrow-ghost"
          viewBox="0 0 558 230"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="manufacturing-arrow-gradient" x1="2" y1="94.75" x2="556" y2="94.75" gradientTransform="translate(0 252) scale(1 -1)" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#f3f1f1" />
              <stop offset=".76" stopColor="#b8b8b8" />
              <stop offset=".77" stopColor="#f3f1f1" />
            </linearGradient>
          </defs>
          {shouldRenderExtrusion ? (
            <polygon
              fill="url(#manufacturing-arrow-gradient)"
              points={depthPoints}
            />
          ) : null}
          <motion.polygon
            animate={{ fillOpacity: 0 }}
            fill="#ffffff"
            initial={isAnimated ? { fillOpacity: 1 } : { fillOpacity: 0 }}
            points={topPoints}
            stroke="#372e2a"
            strokeLinejoin="round"
            strokeWidth="4"
            transition={immediate}
          />
          {shouldRenderExtrusion ? (
            <polyline
              fill="none"
              points={extrusionLinePoints}
              stroke="#372e2a"
              strokeLinejoin="round"
              strokeWidth="4"
            />
          ) : null}
        </motion.svg>
      ) : null}
      <svg
        aria-hidden="true"
        className="manufacturing-slide__timeline"
        style={{ opacity: isTimelineVisible ? 1 : 0 }}
        viewBox="0 0 2510 420"
        preserveAspectRatio="xMidYMid meet"
      >
        <motion.line
          x1={isAnimated ? lineCenterX - lineStartHalfWidth : lineStartX}
          y1="260"
          x2={isAnimated ? lineCenterX + lineStartHalfWidth : lineEndX}
          y2="260"
          animate={{ x1: lineStartX, x2: lineEndX }}
          transition={isAnimated ? { delay: lineExtendDelay, duration: lineExtendDuration, ease: easeOut } : immediate}
          stroke="#372E2A"
          strokeWidth="4"
        />
        <motion.ellipse
          cx={isAnimated ? lineStartX : 35}
          cy={isAnimated ? 260 : 258}
          rx={isAnimated ? 0 : 35}
          ry={isAnimated ? 0 : 24}
          animate={{ cx: 35, cy: 258, rx: 35, ry: 24 }}
          transition={isAnimated ? { delay: endpointsDelay, duration: endpointGrowDuration, ease: easeOut } : immediate}
          fill="#372E2A"
        />
        <motion.ellipse
          cx={isAnimated ? lineEndX : 2475}
          cy="260"
          rx={isAnimated ? 0 : 35}
          ry={isAnimated ? 0 : 24}
          animate={{ cx: 2475, rx: 35, ry: 24 }}
          transition={isAnimated ? { delay: endpointsDelay, duration: endpointGrowDuration, ease: easeOut } : immediate}
          fill="#372E2A"
        />
        <motion.line
          x1="35"
          y1="258"
          x2="35"
          y2={isAnimated ? 258 : 11}
          animate={{ y2: 11 }}
          transition={isAnimated ? { delay: riserDelay, duration: 0.34, ease: easeOut } : immediate}
          stroke="#372E2A"
          strokeWidth="4"
        />
        <motion.line
          x1="2475"
          y1="260"
          x2="2475"
          y2={isAnimated ? 260 : 13}
          animate={{ y2: 13 }}
          transition={isAnimated ? { delay: riserDelay, duration: 0.34, ease: easeOut } : immediate}
          stroke="#372E2A"
          strokeWidth="4"
        />
        <motion.line
          x1="31"
          y1="258"
          x2="31"
          y2={isAnimated ? 258 : 14}
          animate={{ y2: 14 }}
          transition={isAnimated ? { delay: lightRiserDelay, duration: 0.32, ease: easeOut } : immediate}
          stroke="#F3F1F1"
          strokeWidth="4"
        />
        <motion.line
          x1="2471"
          y1="260"
          x2="2471"
          y2={isAnimated ? 260 : 16}
          animate={{ y2: 16 }}
          transition={isAnimated ? { delay: lightRiserDelay, duration: 0.32, ease: easeOut } : immediate}
          stroke="#F3F1F1"
          strokeWidth="4"
        />
        <motion.circle
          cx="35"
          cy={isAnimated ? 258 : 7}
          r={isAnimated ? 0 : 7}
          animate={{ cy: 7, r: 7 }}
          transition={isAnimated ? { delay: riserDelay, duration: 0.34, ease: easeOut } : immediate}
          fill="#372E2A"
        />
        <motion.circle
          cx="2475"
          cy={isAnimated ? 260 : 9}
          r={isAnimated ? 0 : 7}
          animate={{ cy: 9, r: 7 }}
          transition={isAnimated ? { delay: riserDelay, duration: 0.34, ease: easeOut } : immediate}
          fill="#372E2A"
        />
        <motion.image
          href={startUrl}
          x="-95.8"
          y="-210"
          width="261.6"
          height="192"
          initial={isAnimated ? { opacity: 0, y: 28 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={isAnimated ? { delay: labelsDelay, duration: 0.3, ease: easeOut } : immediate}
        />
        <motion.image
          href={finishUrl}
          x="2337"
          y="-210"
          width="276"
          height="192"
          initial={isAnimated ? { opacity: 0, y: 28 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={isAnimated ? { delay: labelsDelay, duration: 0.3, ease: easeOut } : immediate}
        />
      </svg>
    </div >
  );
}

function useDelayedProgress(isAnimated: boolean, delayMs: number, durationMs: number) {
  const [progress, setProgress] = useState(() => isAnimated ? 0 : 1);

  useEffect(() => {
    if (!isAnimated) {
      setProgress(1);
      return undefined;
    }

    let frame = 0;
    const start = performance.now();
    const totalDurationMs = delayMs + durationMs;
    setProgress(0);

    const tick = (now: number) => {
      const elapsed = Math.min(now - start, totalDurationMs);
      const nextProgress = clamp((elapsed - delayMs) / durationMs);
      setProgress(nextProgress);

      if (elapsed < totalDurationMs) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [delayMs, durationMs, isAnimated]);

  return progress;
}

function parsePointValues(points: string) {
  return points.split(/\s+/).map((value) => Number.parseFloat(value));
}

function collapsePointValuesToY(values: number[], y: number) {
  return values.map((value, index) => index % 2 === 0 ? value : y);
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

function clamp(value: number) {
  return Math.min(1, Math.max(0, value));
}

function easeOutCubic(value: number) {
  return 1 - (1 - value) ** 3;
}
