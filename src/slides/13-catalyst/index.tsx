import { useId } from "react";
import { motion } from "motion/react";
import exposureTextUrl from "./exposure-text.svg";
import exposureUrl from "./exposure.svg";
import feedbackTextUrl from "./feedback-text.svg";
import feedbackUrl from "./feedback.svg";
import frictionTextUrl from "./friction-text.svg";
import frictionUrl from "./friction.svg";

type CatalystSlideProps = {
  className?: string;
  isAnimated?: boolean;
};

export type CatalystOutcomesStep = 0 | 1 | 2 | 3;

type CatalystOutcomesSlideProps = CatalystSlideProps & {
  onAdvance?: () => void;
  step?: CatalystOutcomesStep;
};

const catalysts = [
  {
    id: "feedback",
    iconUrl: feedbackUrl,
    label: "Feedback",
    labelUrl: feedbackTextUrl,
  },
  {
    id: "friction",
    iconUrl: frictionUrl,
    label: "Friction",
    labelUrl: frictionTextUrl,
  },
  {
    id: "exposure",
    iconUrl: exposureUrl,
    label: "Exposure",
    labelUrl: exposureTextUrl,
  },
] as const;

export function CatalystSlide({
  className = "",
  isAnimated = true,
}: CatalystSlideProps) {
  return (
    <div className={`catalyst-slide ${className}`.trim()}>
      {catalysts.map(({ id, iconUrl, label, labelUrl }, index) => (
        <motion.div
          animate={{ opacity: 1, x: 0 }}
          className={`catalyst-slide__item catalyst-slide__item--${id}`}
          initial={isAnimated ? { opacity: 0, x: 18 } : false}
          key={id}
          transition={{
            delay: index * 0.14,
            duration: 0.36,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <img
            alt=""
            aria-hidden="true"
            className="catalyst-slide__icon"
            draggable={false}
            src={iconUrl}
          />
          <img
            alt={label}
            className="catalyst-slide__label"
            draggable={false}
            src={labelUrl}
          />
        </motion.div>
      ))}
    </div>
  );
}

const catalystOutcomes = [
  {
    id: "feedback",
    iconUrl: feedbackUrl,
    outcome: "Evidence",
    source: "Feedback",
  },
  {
    id: "friction",
    iconUrl: frictionUrl,
    outcome: "Direction",
    source: "Friction",
  },
  {
    id: "exposure",
    iconUrl: exposureUrl,
    outcome: "Possibility",
    source: "Exposure",
  },
] as const;

export function CatalystOutcomesSlide({
  className = "",
  isAnimated = true,
  onAdvance,
  step = 0,
}: CatalystOutcomesSlideProps) {
  const id = useId().replace(/:/g, "");

  return (
    <div
      aria-label={onAdvance ? "Advance catalyst outcomes" : undefined}
      className={`catalyst-outcomes-slide ${className}`.trim()}
      data-catalyst-outcomes-step={step}
      onClick={onAdvance}
      role={onAdvance ? "button" : undefined}
      tabIndex={onAdvance ? 0 : undefined}
    >
      {catalystOutcomes.map(({ id: rowId, iconUrl, outcome, source }, index) => {
        const isRevealed = index < step;
        const isNewestReveal = isAnimated && isRevealed && index === step - 1;
        const gradientId = `catalyst-outcomes-gradient-${rowId}-${id}`;

        return (
          <div
            className={`catalyst-outcomes-slide__row catalyst-outcomes-slide__row--${rowId}`}
            key={rowId}
          >
            <img
              alt=""
              aria-hidden="true"
              className="catalyst-outcomes-slide__icon"
              draggable={false}
              src={iconUrl}
            />
            <span className="catalyst-outcomes-slide__source">{source}</span>
            <svg
              aria-hidden="true"
              className="catalyst-outcomes-slide__connector"
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
                className="catalyst-outcomes-slide__connector-line"
                initial={isNewestReveal ? { opacity: 0, x2: 0 } : false}
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
                className="catalyst-outcomes-slide__connector-tick"
                initial={isNewestReveal ? { opacity: 0, scaleY: 0 } : false}
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
              className="catalyst-outcomes-slide__outcome"
              initial={isNewestReveal ? {
                opacity: 0,
                x: -18,
                y: "-50%",
              } : false}
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
