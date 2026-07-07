import { motion } from "motion/react";
import type { Transition, Variants } from "motion/react";
import { TitleSlide } from "../slides/00-title";
import { OutputSlide } from "../slides/02-output";
import howYouUrl from "../slides/01-think/how-you.svg";
import mustChangeUrl from "../slides/01-think/must-change.svg";
import thinkGraffitiUrl from "../slides/01-think/think-graffiti.svg";
import thinkUrl from "../slides/01-think/think.svg";
import { SlideTextureOverlay, TitleSlideFooter } from "../slides/SlideFrame";
import type { MotionDeckFrame } from "./frames";

type MotionStageProps = {
  direction: number;
  frame: MotionDeckFrame;
};

export function MotionStage({ direction, frame }: MotionStageProps) {
  const isCoverFrame = frame.kind === "cover";
  const isOutputFrame = frame.kind === "contained-light";

  return (
    <section
      className={[
        "motion-deck-stage",
        "slide-frame",
        "text-light-t0",
        isOutputFrame ? "slide-frame--contained-light" : "bg-light-s0",
      ].join(" ")}
      data-frame-id={frame.id}
    >
      <motion.div
        className={[
          "slide-panel",
          isCoverFrame
            ? "slide-panel--cover"
            : isOutputFrame
              ? "slide-panel--contained-light"
              : "slide-panel--contained",
          "motion-deck-panel",
          isOutputFrame && direction > 0 ? "motion-deck-panel--output-enter" : "",
        ].join(" ")}
        layout
        transition={frame.transition}
      >
        {isCoverFrame ? (
          <TitleSlide className="slide-content" />
        ) : isOutputFrame ? (
          <OutputSlide className="slide-content" isAnimated={direction > 0} />
        ) : (
          <MotionThinkContent />
        )}
      </motion.div>

      {isCoverFrame ? <TitleSlideFooter /> : null}
      <SlideTextureOverlay />
    </section>
  );
}

function MotionThinkContent() {
  return (
    <div className="slide-content">
      <motion.div
        animate="show"
        className="motion-deck-think-sequence"
        initial="hidden"
        key="think-sequence"
      >
        <motion.img
          alt=""
          aria-hidden="true"
          className="absolute -top-1 -left-1 h-[20%]"
          draggable={false}
          src={howYouUrl}
          variants={thinkItemVariants.how}
        />
        <motion.img
          alt=""
          aria-hidden="true"
          className="absolute bottom-1/2 right-1/2 translate-x-1/2 translate-y-[48%] w-[70%]"
          draggable={false}
          src={thinkGraffitiUrl}
          variants={thinkItemVariants.center}
        />
        <motion.img
          alt=""
          aria-hidden="true"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[68%]"
          draggable={false}
          src={thinkUrl}
          variants={thinkItemVariants.center}
        />
        <motion.img
          alt=""
          aria-hidden="true"
          className="absolute -bottom-1 -right-1 h-[20%]"
          draggable={false}
          src={mustChangeUrl}
          variants={thinkItemVariants.must}
        />
      </motion.div>
    </div>
  );
}

const itemTransition: Transition = {
  duration: 0.34,
  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
};

const thinkItemVariants: Record<"how" | "center" | "must", Variants> = {
  how: {
    hidden: { opacity: 0, y: "-24%" },
    show: {
      opacity: 1,
      y: 0,
      transition: { ...itemTransition },
    },
  },
  center: {
    hidden: { opacity: 0, scale: 0.8 },
    show: {
      opacity: 1,
      scale: 1,
      transition: { ...itemTransition, delay: 0.2, duration: 0.3 },
    },
  },
  must: {
    hidden: { opacity: 0, y: "24%" },
    show: {
      opacity: 1,
      y: 0,
      transition: { ...itemTransition, delay: 0.15 },
    },
  },
};
