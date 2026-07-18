import { useId } from "react";
import { motion } from "motion/react";
import fidelityBackgroundUrl from "./fidelity-bg.svg";
import fidelityOutlineUrl from "./fidelity-outline.svg";
import fidelityUrl from "./fidelity.svg";
import prototypeVideoUrl from "./prototype.webm";

type ShortenTheLoopSlideProps = {
  className?: string;
  isAnimated?: boolean;
};

const loopEase = [0.16, 1, 0.3, 1] as const;
const windEase = [0.45, 0, 0.55, 1] as const;

const loopSegments = [
  {
    arrow: "M 1200 0.027 L 1162.98 30.523 V 8.36 H 1146 V 0.027 Z",
    longPath: "M 4.167 4.167 H 1154",
    shortPath: "M 4.167 149.167 V 4.167",
  },
  {
    arrow: "M 2420.17 623.523 L 2389.48 586.523 H 2411.83 V 570 H 2420.17 Z",
    longPath: "M 2416 4.167 V 578",
    shortPath: "M 2271 4.167 H 2416",
  },
  {
    arrow: "M 1219.98 1268.16 L 1256.98 1237.5 V 1259.83 H 1274 V 1268.16 Z",
    longPath: "M 2416 1264 H 1266",
    shortPath: "M 2416 1119 V 1264",
  },
  {
    arrow: "M 0.009 644.022 L 30.477 680.999 H 8.343 V 698 H 0.009 Z",
    longPath: "M 4.167 1264 V 690",
    shortPath: "M 149.167 1264 H 4.167",
  },
] as const;

export function ShortenTheLoopSlide({
  className = "",
  isAnimated = true,
}: ShortenTheLoopSlideProps) {
  const gradientId = `shorten-the-loop-gradient-${useId().replace(/:/g, "")}`;

  return (
    <div className={`shorten-the-loop-slide ${className}`.trim()}>
      <div className="shorten-the-loop-slide__title-position">
        <motion.div
          animate={isAnimated
            ? {
                rotate: [0, -1.2, -6.5, -6.5, 1.3, 0],
                scale: [1, 1.004, 1.018, 1.018, 0.996, 1],
                x: [0, -2, -16, -16, 5, 0],
              }
            : { rotate: 0, scale: 1, x: 0 }}
          className="shorten-the-loop-slide__title-motion"
          initial={false}
          transition={isAnimated
            ? {
                duration: 1.3,
                ease: loopEase,
                times: [0, 0.16, 0.67, 0.72, 0.9, 1],
              }
            : { duration: 0 }}
        >
          <p className="shorten-the-loop-slide__title">Shorten the loop</p>
        </motion.div>
      </div>

      <svg
        aria-hidden="true"
        className="shorten-the-loop-slide__loop"
        viewBox="0 0 2421 1269"
      >
        <defs>
          <linearGradient
            gradientUnits="userSpaceOnUse"
            id={gradientId}
            x1="0"
            x2="2502.66"
            y1="0"
            y2="275.563"
          >
            <stop stopColor="#ff0000" />
            <stop offset="1" stopColor="#ffd5ab" />
          </linearGradient>
        </defs>

        {loopSegments.map((segment) => (
          <g key={segment.shortPath}>
            <motion.path
              animate={{ opacity: 1, pathLength: 1 }}
              d={segment.shortPath}
              fill="none"
              initial={isAnimated ? { opacity: 1, pathLength: 0 } : false}
              stroke={`url(#${gradientId})`}
              strokeLinejoin="miter"
              strokeWidth="8.334"
              transition={isAnimated
                ? { delay: 0.12, duration: 0.82, ease: windEase }
                : { duration: 0 }}
            />
            <motion.path
              animate={{ opacity: 1, pathLength: 1 }}
              d={segment.longPath}
              fill="none"
              initial={isAnimated ? { opacity: 1, pathLength: 0 } : false}
              stroke={`url(#${gradientId})`}
              strokeLinejoin="miter"
              strokeWidth="8.334"
              transition={isAnimated
                ? { delay: 0.94, duration: 0.28, ease: loopEase }
                : { duration: 0 }}
            />
            <motion.path
              animate={{ opacity: 1 }}
              d={segment.arrow}
              fill={`url(#${gradientId})`}
              initial={isAnimated ? { opacity: 0 } : false}
              transition={isAnimated
                ? { delay: 1.18, duration: 0.04 }
                : { duration: 0 }}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}

type ShortenLoopFidelitySlideProps = {
  className?: string;
};

export function ShortenLoopFidelitySlide({
  className = "",
}: ShortenLoopFidelitySlideProps) {
  return (
    <div
      aria-label="Fidelity"
      className={`shorten-loop-fidelity-slide ${className}`.trim()}
      role="img"
    >
      <img
        alt=""
        aria-hidden="true"
        className="shorten-loop-fidelity-slide__layer shorten-loop-fidelity-slide__layer--background"
        draggable={false}
        src={fidelityBackgroundUrl}
      />
      <img
        alt=""
        aria-hidden="true"
        className="shorten-loop-fidelity-slide__layer shorten-loop-fidelity-slide__layer--edge"
        draggable={false}
        src={fidelityUrl}
      />
      <img
        alt=""
        aria-hidden="true"
        className="shorten-loop-fidelity-slide__layer shorten-loop-fidelity-slide__layer--face"
        draggable={false}
        src={fidelityOutlineUrl}
      />
    </div>
  );
}

type ShortenLoopPrototypeSlideProps = {
  className?: string;
  shouldPlay?: boolean;
};

export function ShortenLoopPrototypeSlide({
  className = "",
  shouldPlay = true,
}: ShortenLoopPrototypeSlideProps) {
  return (
    <div className={`cal-video-slide ${className}`.trim()}>
      <video
        aria-label="Shorten the loop prototype demonstration"
        autoPlay={shouldPlay}
        className="cal-video-slide__video"
        disablePictureInPicture
        loop
        muted
        playsInline
        preload="auto"
        src={prototypeVideoUrl}
      />
    </div>
  );
}
