import type { CSSProperties } from "react";
import { StatementAxisSlide } from "../StatementAxisSlide";
import lineLeftUrl from "./line-left.svg";
import lineRightUrl from "./line-right.svg";
import lossyCompressionUrl from "./lossy-compression.svg";

type RealityLossyCompressionSlideProps = {
  className?: string;
  isAnimated?: boolean;
};

type LossyPixelStyle = CSSProperties & {
  "--lossy-reveal-delay": string;
};

const lossyCompressionRowPatterns = [
  [
    0, 5, 7, 9, 11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 23, 24,
    25, 26, 27, 28, 29, 30, 31, 32, 33, 35, 36, 37, 38, 39, 40, 42,
    44, 46, 48,
  ],
  [
    8, 10, 12, 14, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28,
    29, 30, 31, 32, 33, 34, 35, 37, 39, 41, 43,
  ],
  [
    3, 5, 7, 9, 11, 12, 13, 14, 15, 16, 18, 19, 20, 21, 22, 23, 24,
    25, 26, 27, 28, 29, 30, 32, 33, 34, 35, 36, 37, 38, 39, 40, 42,
    44, 46, 51,
  ],
  [
    8, 10, 12, 14, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28,
    29, 30, 31, 32, 33, 34, 35, 37, 39, 41, 43,
  ],
] as const;

const lossyPixels = Array.from({ length: 19 }, (_, y) => {
  return lossyCompressionRowPatterns[
    y % lossyCompressionRowPatterns.length
  ].map((x) => {
    const outerColumnDepth = Math.min(x, 51 - x);

    return {
      delay:
        0.46 + outerColumnDepth * 0.01 + seededUnit(y * 52 + x) * 0.008,
      x,
      y,
    };
  });
}).flat();

export function RealityLossyCompressionSlide({
  className = "",
  isAnimated = true,
}: RealityLossyCompressionSlideProps) {
  return (
    <StatementAxisSlide
      className={[
        "reality-lossy-compression-slide",
        isAnimated
          ? "reality-lossy-compression-slide--animated"
          : "reality-lossy-compression-slide--static",
        className,
      ].join(" ").trim()}
      headline="Your brain has lossy compression"
      icon={<AnimatedLossyCompression />}
      leftLabel="Rainbows"
      leftLineUrl={lineLeftUrl}
      rightLabel="Dopamine"
      rightLineUrl={lineRightUrl}
    />
  );
}

function AnimatedLossyCompression() {
  return (
    <div aria-hidden="true" className="lossy-compression-mark">
      <svg
        className="lossy-compression-mark__pixels"
        fill="none"
        viewBox="0 0 208 76"
        xmlns="http://www.w3.org/2000/svg"
      >
        {lossyPixels.map(({ delay, x, y }) => (
          <rect
            className="lossy-compression-mark__pixel"
            fill="currentColor"
            height="4"
            key={`${x}-${y}`}
            style={
              {
                "--lossy-reveal-delay": `${delay.toFixed(3)}s`,
              } as LossyPixelStyle
            }
            width="4"
            x={x * 4}
            y={y * 4}
          />
        ))}
      </svg>
      <img
        alt=""
        className="lossy-compression-mark__source"
        draggable={false}
        src={lossyCompressionUrl}
      />
    </div>
  );
}

function seededUnit(index: number) {
  let value = Math.imul(index + 1, 0x9e3779b1);
  value ^= value >>> 16;
  value = Math.imul(value, 0x85ebca6b);
  value ^= value >>> 13;
  return (value >>> 0) / 0xffffffff;
}
