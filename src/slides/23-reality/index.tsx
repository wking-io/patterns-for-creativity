import { motion } from "motion/react";
import { useId } from "react";

export { RealityLossyCompressionSlide } from "./LossyCompressionSlide";

export type RealityOutcomesStep = 0 | 1 | 2 | 3;

type RealityOutcomesSlideProps = {
  className?: string;
  onAdvance?: () => void;
  step?: RealityOutcomesStep;
};

const realityOutcomes = [
  {
    id: "abstraction",
    outcome: "It feels clunky",
    source: "Make the abstraction",
  },
  {
    id: "prototype",
    outcome: "It missed five edge cases",
    source: "Build the prototype",
  },
  {
    id: "joke",
    outcome: "No one laughs",
    source: "Tell the joke",
  },
] as const;

export function RealityOutcomesSlide({
  className = "",
  onAdvance,
  step = 0,
}: RealityOutcomesSlideProps) {
  const id = useId().replace(/:/g, "");

  return (
    <div
      aria-label={onAdvance ? "Advance reality outcomes" : undefined}
      className={`reality-outcomes-slide ${className}`.trim()}
      data-reality-outcomes-step={step}
      onClick={onAdvance}
      role={onAdvance ? "button" : undefined}
      tabIndex={onAdvance ? 0 : undefined}
    >
      {realityOutcomes.map(({ id: rowId, outcome, source }, index) => {
        const isRevealed = index < step;
        const gradientId = `reality-outcomes-gradient-${rowId}-${id}`;

        return (
          <div
            className={`reality-outcomes-slide__row reality-outcomes-slide__row--${rowId}`}
            key={rowId}
          >
            <span className="reality-outcomes-slide__source">{source}</span>
            <svg
              aria-hidden="true"
              className="reality-outcomes-slide__connector"
              preserveAspectRatio="none"
              viewBox="0 0 100 60"
            >
              <defs>
                <linearGradient
                  gradientUnits="userSpaceOnUse"
                  id={gradientId}
                  x1="0"
                  x2="100"
                  y1="30"
                  y2="30"
                >
                  <stop offset="0" stopColor="#ff0000" />
                  <stop offset="1" stopColor="#ffd5ab" />
                </linearGradient>
              </defs>
              <motion.line
                animate={{ opacity: isRevealed ? 1 : 0, x2: isRevealed ? 100 : 0 }}
                className="reality-outcomes-slide__connector-line"
                initial={false}
                stroke={`url(#${gradientId})`}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                vectorEffect="non-scaling-stroke"
                x1="0"
                x2="100"
                y1="30"
                y2="30"
              />
              <motion.line
                animate={{ opacity: isRevealed ? 1 : 0, scaleY: isRevealed ? 1 : 0 }}
                className="reality-outcomes-slide__connector-tick"
                initial={false}
                stroke={`url(#${gradientId})`}
                transition={{
                  delay: isRevealed ? 0.42 : 0,
                  duration: 0.18,
                  ease: [0.16, 1, 0.3, 1],
                }}
                vectorEffect="non-scaling-stroke"
                x1="100"
                x2="100"
                y1="0"
                y2="60"
              />
            </svg>
            <motion.span
              animate={{
                opacity: isRevealed ? 1 : 0,
                x: isRevealed ? 0 : -12,
                y: "-50%",
              }}
              aria-hidden={!isRevealed}
              className="reality-outcomes-slide__outcome"
              initial={false}
              transition={{
                delay: isRevealed ? 0.44 : 0,
                duration: 0.28,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {outcome}
            </motion.span>
          </div>
        );
      })}
    </div>
  );
}
