import { motion } from "motion/react";
import finishUrl from "../03-manufacturing/finish.svg";
import startUrl from "../03-manufacturing/start.svg";
import altOneSvg from "../09-other-paths/alt-1.svg?raw";
import altTwoSvg from "../09-other-paths/alt-2.svg?raw";
import squiggleSvg from "./path.svg?raw";
import readyUrl from "./ready.svg";
import creativePathFogUrl from "./fog.png";

export type CreativePathVariant = "original" | "alt-1" | "alt-2";

type CreativePathSlideProps = {
  className?: string;
  isAnimated?: boolean;
  isFogVisible?: boolean;
  pathVariant?: CreativePathVariant;
};

const easeOut = [0.22, 1, 0.36, 1] as [number, number, number, number];
const artboardWidth = 3840;
const artboardHeight = 2112;
const startX = 700;
const readyX = 2740;
const finishX = 3140;
const lineEndX = 3122;
const timelineY = 1269;
const markerTopY = 1022;
const markerCircleY = 1016;
const markerShiftX = readyX - startX;
const settleDelay = 0.42;
const shortenDuration = 0.62;
const startEllipseDelay = settleDelay + shortenDuration + 0.14;
const startRiserDelay = startEllipseDelay + 0.24;
const traceDelay = startRiserDelay + 0.46;
const traceDuration = 2.15;
const readyDelay = traceDelay + traceDuration;
const immediate = { duration: 0 };
const pathVariants: Record<CreativePathVariant, { path: string; transform: string }> = {
  original: {
    path: getSvgPath(squiggleSvg),
    transform: "translate(724 157)",
  },
  "alt-1": {
    path: getSvgPath(altOneSvg),
    transform: "translate(724 479.821)",
  },
  "alt-2": {
    path: getSvgPath(altTwoSvg),
    transform: "translate(724 562.033)",
  },
};

function getSvgPath(svg: string) {
  return svg.match(/<path d="([^"]+)"/)?.[1] ?? "";
}

export function CreativePathSlide({
  className = "",
  isAnimated = false,
  isFogVisible = false,
  pathVariant = "original",
}: CreativePathSlideProps) {
  const animation = isAnimated;
  const activePath = pathVariants[pathVariant];

  return (
    <div className={`creative-path-slide ${className}`.trim()}>
      <div aria-hidden="true" className="output-slide__panel-background" />
      <svg
        aria-hidden="true"
        className="creative-path-slide__artboard"
        viewBox={`0 0 ${artboardWidth} ${artboardHeight}`}
        preserveAspectRatio="none"
      >
        <motion.line
          animate={{ x1: readyX }}
          initial={animation ? { x1: startX } : false}
          transition={animation ? { delay: settleDelay, duration: shortenDuration, ease: easeOut } : immediate}
          x1={readyX}
          x2={lineEndX}
          y1={timelineY}
          y2={timelineY}
          stroke="#372E2A"
          strokeWidth="4"
        />

        <motion.g
          animate={{ x: readyX }}
          initial={animation ? { x: startX } : false}
          transition={animation ? { delay: settleDelay, duration: shortenDuration, ease: easeOut } : immediate}
        >
          <ellipse cx="0" cy={timelineY} rx="35" ry="24" fill="#372E2A" />
          <line x1="0" y1={timelineY} x2="0" y2={markerTopY} stroke="#372E2A" strokeWidth="4" />
          <line x1="-4" y1={timelineY} x2="-4" y2={markerTopY + 3} stroke="#F3F1F1" strokeWidth="4" />
          <circle cx="0" cy={markerCircleY} r="7" fill="#372E2A" />
        </motion.g>

        <motion.image
          animate={animation ? { opacity: [1, 1, 0], x: markerShiftX } : { opacity: 0 }}
          height="192"
          href={startUrl}
          initial={animation ? { opacity: 1, x: 0 } : false}
          transition={animation ? { delay: settleDelay, duration: shortenDuration, ease: easeOut, times: [0, 0.7, 1] } : immediate}
          width="261.6"
          x="569.2"
          y="799"
        />

        <motion.image
          animate={{ opacity: 1, y: 0 }}
          height="192"
          href={readyUrl}
          initial={animation ? { opacity: 0, y: 24 } : false}
          transition={animation ? { delay: readyDelay, duration: 0.28, ease: easeOut } : immediate}
          width="268.8"
          x="2605.6"
          y="799"
        />

        <motion.ellipse
          animate={{ rx: 35, ry: 24 }}
          cy={timelineY}
          fill="#372E2A"
          initial={animation ? { rx: 0, ry: 0 } : false}
          transition={animation ? { delay: startEllipseDelay, duration: 0.24, ease: easeOut } : immediate}
          cx={startX}
          rx="35"
          ry="24"
        />
        <motion.line
          animate={{ y2: markerTopY }}
          initial={animation ? { y2: timelineY } : false}
          stroke="#372E2A"
          strokeWidth="4"
          transition={animation ? { delay: startRiserDelay, duration: 0.32, ease: easeOut } : immediate}
          x1={startX}
          x2={startX}
          y1={timelineY}
          y2={markerTopY}
        />
        <motion.line
          animate={{ y2: markerTopY + 3 }}
          initial={animation ? { y2: timelineY } : false}
          stroke="#F3F1F1"
          strokeWidth="4"
          transition={animation ? { delay: startRiserDelay + 0.03, duration: 0.3, ease: easeOut } : immediate}
          x1={startX - 4}
          x2={startX - 4}
          y1={timelineY}
          y2={markerTopY + 3}
        />
        <motion.circle
          animate={{ cy: markerCircleY, r: 7 }}
          fill="#372E2A"
          initial={animation ? { cy: timelineY, r: 0 } : false}
          transition={animation ? { delay: startRiserDelay, duration: 0.32, ease: easeOut } : immediate}
          cx={startX}
          cy={markerCircleY}
          r="7"
        />
        <motion.image
          animate={{ opacity: 1, y: 0 }}
          height="192"
          href={startUrl}
          initial={animation ? { opacity: 0, y: 28 } : false}
          transition={animation ? { delay: startRiserDelay + 0.15, duration: 0.3, ease: easeOut } : immediate}
          width="261.6"
          x="569.2"
          y="799"
        />

        <motion.path
          animate={{ pathLength: 1 }}
          d={activePath.path}
          fill="none"
          initial={animation ? { pathLength: 0 } : false}
          pathLength="1"
          stroke="#372E2A"
          strokeLinecap="round"
          strokeWidth="4"
          transform={activePath.transform}
          transition={animation ? { delay: traceDelay, duration: traceDuration, ease: [0.37, 0, 0.63, 1] } : immediate}
        />

        <ellipse cx={finishX} cy={timelineY} rx="35" ry="24" fill="#372E2A" />
        <line x1={finishX} y1={timelineY} x2={finishX} y2={markerTopY} stroke="#372E2A" strokeWidth="4" />
        <line x1={finishX - 4} y1={timelineY} x2={finishX - 4} y2={markerTopY + 3} stroke="#F3F1F1" strokeWidth="4" />
        <circle cx={finishX} cy={markerCircleY} r="7" fill="#372E2A" />
        <image href={finishUrl} height="192" width="276" x="3002" y="799" />
      </svg>
      {isFogVisible ? (
        <img
          alt=""
          aria-hidden="true"
          className="creative-path-slide__fog"
          draggable={false}
          src={creativePathFogUrl}
        />
      ) : null}
    </div>
  );
}
