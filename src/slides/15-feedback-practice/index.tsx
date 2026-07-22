import { motion } from "motion/react";
import type { Transition } from "motion/react";
import glassUrl from "./glass.webp";
import tweetUrl from "./tweet.webp";

export type FeedbackPracticeSlideVariant =
  | "intro"
  | "glass"
  | "practice-2"
  | "friction-ask-why"
  | "friction-aperture"
  | "friction-unspoken"
  | "exposure-beaten-path"
  | "exposure-notice"
  | "shorten-loop-tools"
  | "master-your-medium"
  | "language-is-power"
  | "optimize-for-exploration"
  | "artifacts-less-sacred"
  | "reality-output-artifacts"
  | "tweet";

type FeedbackPracticeSlideProps = {
  className?: string;
  isAnimated?: boolean;
  variant?: FeedbackPracticeSlideVariant;
};

const crosshairVerticalTransition: Transition = {
  delay: 0.08,
  duration: 0.46,
  ease: [0.16, 1, 0.3, 1],
};

const copyTransition: Transition = {
  delay: 0.1,
  duration: 0.42,
  ease: [0.16, 1, 0.3, 1],
};

const horizontalSegments = [
  { offset: 5.714, width: 45.714 },
  { offset: 62.857, width: 17.143 },
  { offset: 91.429, width: 8.571 },
] as const;

export function FeedbackPracticeSlide({
  className = "",
  isAnimated = true,
  variant = "intro",
}: FeedbackPracticeSlideProps) {
  if (variant === "glass") {
    return (
      <div
        className={`feedback-practice-slide feedback-practice-slide--glass ${className}`.trim()}
      >
        <img
          alt=""
          aria-hidden="true"
          className="feedback-practice-slide__glass"
          draggable={false}
          src={glassUrl}
        />
      </div>
    );
  }

  if (variant === "tweet") {
    return (
      <div
        className={`feedback-practice-slide feedback-practice-slide--tweet ${className}`.trim()}
      >
        <img
          alt="X post by dax about how to be good at your job"
          className="feedback-practice-slide__tweet"
          draggable={false}
          src={tweetUrl}
        />
      </div>
    );
  }

  const promptCopy = {
    intro: {
      counter: "01 / 02",
      headline: "Make feedback find you",
      topic: "Catalysts",
    },
    "practice-2": {
      counter: "02 / 02",
      headline: "Seek the source not the surface",
      topic: "Catalysts",
    },
    "friction-ask-why": {
      counter: "01 / 03",
      headline: "Pause...ask why",
      topic: "Friction",
    },
    "friction-aperture": {
      counter: "02 / 03",
      headline: "Change your aperture",
      topic: "Friction",
    },
    "friction-unspoken": {
      counter: "03 / 03",
      headline: "What people do not say",
      topic: "Friction",
    },
    "exposure-beaten-path": {
      counter: "01 / 02",
      headline: "Get off the beaten path",
      topic: "Exposure",
    },
    "exposure-notice": {
      counter: "02 / 02",
      headline: "Collect what you notice",
      topic: "Exposure",
    },
    "shorten-loop-tools": {
      counter: "01 / 01",
      headline: "Make your own tools",
      topic: "Shorten the loop",
    },
    "master-your-medium": {
      counter: "01 / 02",
      headline: "Master your medium",
      topic: "Ideas",
    },
    "language-is-power": {
      counter: "02 / 02",
      headline: "Language is power",
      topic: "Ideas",
    },
    "optimize-for-exploration": {
      counter: "01 / 02",
      headline: "Optimize for exploration",
      topic: "Taste",
    },
    "artifacts-less-sacred": {
      counter: "02 / 02",
      headline: "Makes artifacts less sacred",
      topic: "Taste",
    },
    "reality-output-artifacts": {
      counter: "01 / 01",
      headline: "The output is not the artifacts",
      topic: "Reality",
    },
  }[variant];
  const usesGradientGlitch =
    variant === "master-your-medium" ||
    variant === "language-is-power" ||
    variant === "optimize-for-exploration" ||
    variant === "artifacts-less-sacred";

  return (
    <div
      className={`feedback-practice-slide feedback-practice-slide--${variant} ${
        usesGradientGlitch ? "feedback-practice-slide--gradient-glitch" : ""
      } ${
        isAnimated ? "" : "feedback-practice-slide--static"
      } ${className}`.trim()}
    >
      <AnimatedCopy isAnimated={isAnimated} position="top-left">Creative Practice</AnimatedCopy>
      <AnimatedCopy isAnimated={isAnimated} position="top-right">{promptCopy.topic}</AnimatedCopy>
      <AnimatedCopy isAnimated={isAnimated} position="bottom-left">Method</AnimatedCopy>
      <AnimatedCopy isAnimated={isAnimated} position="bottom-right">{promptCopy.counter}</AnimatedCopy>

      <AnimatedCrosshair isAnimated={isAnimated} side="left" />
      <AnimatedCrosshair isAnimated={isAnimated} side="right" />

      <GlitchHeadline
        key={variant}
        shadow={usesGradientGlitch}
      >
        {promptCopy.headline}
      </GlitchHeadline>
    </div>
  );
}

function GlitchHeadline({
  children,
  shadow = false,
}: {
  children: string;
  shadow?: boolean;
}) {
  return (
    <>
      {shadow ? (
        <p
          aria-hidden="true"
          className="feedback-practice-slide__headline-shadow"
        >
          <span className="feedback-practice-slide__headline-shadow-copy">
            {children}
          </span>
        </p>
      ) : null}

      <div className="feedback-practice-slide__headline">
        <p className="feedback-practice-slide__headline-text feedback-practice-slide__headline-text--base">
          {children}
        </p>

        <span
          aria-hidden="true"
          className="feedback-practice-slide__headline-slice feedback-practice-slide__headline-slice--red"
        >
          <p className="feedback-practice-slide__headline-text">{children}</p>
        </span>

        <span
          aria-hidden="true"
          className="feedback-practice-slide__headline-slice feedback-practice-slide__headline-slice--cyan"
        >
          <p className="feedback-practice-slide__headline-text">{children}</p>
        </span>
      </div>
    </>
  );
}

type AnimatedCopyProps = {
  children: string;
  isAnimated: boolean;
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
};

function AnimatedCopy({ children, isAnimated, position }: AnimatedCopyProps) {
  const isTop = position.startsWith("top");

  return (
    <motion.span
      animate={{ opacity: 1, y: 0 }}
      className={`feedback-practice-slide__copy feedback-practice-slide__copy--${position}`}
      initial={isAnimated ? { opacity: 0, y: isTop ? "55%" : "-55%" } : false}
      transition={copyTransition}
    >
      {children}
    </motion.span>
  );
}

function AnimatedCrosshair({
  isAnimated,
  side,
}: {
  isAnimated: boolean;
  side: "left" | "right";
}) {
  return (
    <div
      aria-hidden="true"
      className={`feedback-practice-slide__crosshair feedback-practice-slide__crosshair--${side}`}
    >
      <motion.span
        animate={{ scaleY: 1 }}
        className="feedback-practice-slide__crosshair-vertical"
        initial={isAnimated ? { scaleY: 0 } : false}
        transition={crosshairVerticalTransition}
      />
      {horizontalSegments.map(({ offset, width }, index) => (
        <motion.span
          animate={{ scaleX: 1 }}
          className="feedback-practice-slide__crosshair-horizontal"
          initial={isAnimated ? { scaleX: 0 } : false}
          key={offset}
          style={
            side === "left"
              ? { left: `${offset}%`, width: `${width}%` }
              : { right: `${offset}%`, width: `${width}%` }
          }
          transition={{
            delay: 0.43 + index * 0.045,
            duration: 0.3,
            ease: [0.16, 1, 0.3, 1],
          }}
        />
      ))}
    </div>
  );
}
