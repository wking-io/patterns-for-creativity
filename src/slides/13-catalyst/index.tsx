import { useId } from "react";
import { motion } from "motion/react";
import exposureUrl from "./exposure.svg";
import feedbackUrl from "./feedback.svg";
import frictionUrl from "./friction.svg";
import exposureInnerUrl from "../14-feedback/exposure-inner.svg";
import feedbackInnerUrl from "../14-feedback/feedback-inner.svg";
import frameUrl from "../14-feedback/frame.svg";

type CatalystSlideProps = {
  className?: string;
  isAnimated?: boolean;
  variant?: CatalystSlideVariant;
};

export type CatalystSlideVariant = "default" | "world-reveal";

export type CatalystOutcomesStep = 0 | 1 | 2 | 3;

type CatalystOutcomesSlideProps = CatalystSlideProps & {
  onAdvance?: () => void;
  step?: CatalystOutcomesStep;
};

const catalysts = [
  {
    id: "feedback",
    iconInnerUrl: feedbackInnerUrl,
    label: "From The Work",
    layoutKey: "work",
  },
  {
    id: "exposure",
    iconInnerUrl: exposureInnerUrl,
    label: "From The World",
    layoutKey: "world",
  },
] as const;

export function CatalystSlide({
  className = "",
  isAnimated = true,
  variant = "default",
}: CatalystSlideProps) {
  const isWorldReveal = variant === "world-reveal";
  const strikeDelay = 0.18;
  const rowTransitionDelay = 0.36;

  return (
    <div
      className={`catalyst-slide catalyst-slide--${variant} ${className}`.trim()}
    >
      <div className="catalyst-slide__list">
        {catalysts.map(({ id, iconInnerUrl, label, layoutKey }, index) => {
          const isWorkRow = id === "feedback";
          const animate = isWorldReveal
            ? isWorkRow
              ? {
                  opacity: 0,
                  x: 0,
                  y: "calc(var(--motion-deck-height) * -0.035)",
                }
              : {
                  opacity: 1,
                  x: 0,
                  y: "calc(var(--motion-deck-height) * -0.115)",
                }
            : { opacity: 1, x: 0, y: 0 };
          const initial =
            isAnimated && isWorldReveal
              ? { opacity: 1, x: 0, y: 0 }
              : isAnimated
                ? { opacity: 0, x: 18, y: 0 }
                : false;
          const transition = isWorldReveal
            ? {
                delay: isAnimated ? rowTransitionDelay : 0,
                duration: isAnimated ? (isWorkRow ? 0.38 : 0.54) : 0,
                ease: [0.16, 1, 0.3, 1] as const,
              }
            : {
                delay: index * 0.14,
                duration: 0.36,
                ease: [0.16, 1, 0.3, 1] as const,
              };

          return (
            <motion.div
              animate={animate}
              className={`catalyst-slide__item catalyst-slide__item--${id}`}
              initial={initial}
              key={id}
              transition={{
                ...transition,
              }}
            >
              <motion.div
                className="catalyst-slide__icon"
                layoutId={`from-${layoutKey}-catalyst-icon`}
                transition={{
                  layout: {
                    duration: 0.62,
                    ease: [0.16, 1, 0.3, 1],
                  },
                }}
              >
                <img
                  alt=""
                  aria-hidden="true"
                  className="catalyst-slide__icon-frame"
                  draggable={false}
                  src={frameUrl}
                />
                <img
                  alt=""
                  aria-hidden="true"
                  className="catalyst-slide__icon-inner"
                  draggable={false}
                  src={iconInnerUrl}
                />
              </motion.div>
              <motion.span
                className="catalyst-slide__label"
                layout="position"
                layoutId={`from-${layoutKey}-catalyst-label`}
                transition={{
                  layout: {
                    duration: 0.62,
                    ease: [0.16, 1, 0.3, 1],
                  },
                }}
              >
                {label}
                {isWorldReveal && isWorkRow ? (
                  <motion.span
                    animate={{ scaleX: 1 }}
                    aria-hidden="true"
                    className="catalyst-slide__label-strike"
                    initial={isAnimated ? { scaleX: 0 } : false}
                    transition={{
                      delay: isAnimated ? strikeDelay : 0,
                      ...(isAnimated
                        ? {
                            type: "spring",
                            stiffness: 540,
                            damping: 24,
                            mass: 0.42,
                          }
                        : { duration: 0 }),
                    }}
                  />
                ) : null}
              </motion.span>
            </motion.div>
          );
        })}
      </div>
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
