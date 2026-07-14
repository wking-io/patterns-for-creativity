import { motion } from "motion/react";
import type { Transition } from "motion/react";
import glassUrl from "./glass.png";
import practiceOneUrl from "./practice-1.svg";
import practiceTwoUrl from "./practice-2.svg";
import tweetUrl from "./tweet.png";

export type FeedbackPracticeSlideVariant =
  | "intro"
  | "glass"
  | "practice-2"
  | "tweet";

type FeedbackPracticeSlideProps = {
  className?: string;
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

  const isSecondPractice = variant === "practice-2";
  const headlineAlt = isSecondPractice
    ? "Seek the source not the surface"
    : "Make feedback find you";
  const headlineUrl = isSecondPractice ? practiceTwoUrl : practiceOneUrl;

  return (
    <div
      className={`feedback-practice-slide ${isSecondPractice ? "feedback-practice-slide--practice-2" : ""} ${className}`.trim()}
    >
      <AnimatedCopy position="top-left">Creative Practice</AnimatedCopy>
      <AnimatedCopy position="top-right">Catalysts</AnimatedCopy>
      <AnimatedCopy position="bottom-left">Method</AnimatedCopy>
      <AnimatedCopy position="bottom-right">
        {isSecondPractice ? "02 / 02" : "01 / 02"}
      </AnimatedCopy>

      <AnimatedCrosshair side="left" />
      <AnimatedCrosshair side="right" />

      <GlitchHeadline alt={headlineAlt} artworkUrl={headlineUrl} />
    </div>
  );
}

function GlitchHeadline({ alt, artworkUrl }: { alt: string; artworkUrl: string }) {
  return (
    <div className="feedback-practice-slide__headline">
      <img
        alt={alt}
        className="feedback-practice-slide__headline-artwork feedback-practice-slide__headline-artwork--base"
        draggable={false}
        src={artworkUrl}
      />

      <span
        aria-hidden="true"
        className="feedback-practice-slide__headline-slice feedback-practice-slide__headline-slice--red"
      >
        <img
          alt=""
          className="feedback-practice-slide__headline-artwork"
          draggable={false}
          src={artworkUrl}
        />
      </span>

      <span
        aria-hidden="true"
        className="feedback-practice-slide__headline-slice feedback-practice-slide__headline-slice--cyan"
      >
        <img
          alt=""
          className="feedback-practice-slide__headline-artwork"
          draggable={false}
          src={artworkUrl}
        />
      </span>
    </div>
  );
}

type AnimatedCopyProps = {
  children: string;
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
};

function AnimatedCopy({ children, position }: AnimatedCopyProps) {
  const isTop = position.startsWith("top");

  return (
    <motion.span
      animate={{ opacity: 1, y: 0 }}
      className={`feedback-practice-slide__copy feedback-practice-slide__copy--${position}`}
      initial={{ opacity: 0, y: isTop ? "55%" : "-55%" }}
      transition={copyTransition}
    >
      {children}
    </motion.span>
  );
}

function AnimatedCrosshair({ side }: { side: "left" | "right" }) {
  return (
    <div
      aria-hidden="true"
      className={`feedback-practice-slide__crosshair feedback-practice-slide__crosshair--${side}`}
    >
      <motion.span
        animate={{ scaleY: 1 }}
        className="feedback-practice-slide__crosshair-vertical"
        initial={{ scaleY: 0 }}
        transition={crosshairVerticalTransition}
      />
      {horizontalSegments.map(({ offset, width }, index) => (
        <motion.span
          animate={{ scaleX: 1 }}
          className="feedback-practice-slide__crosshair-horizontal"
          initial={{ scaleX: 0 }}
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
