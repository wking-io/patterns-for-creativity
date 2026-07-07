import { AnimatePresence, motion } from "motion/react";
import { SlideFrame } from "../slides/SlideFrame";
import type { MotionDeckFrame } from "./frames";

type MotionStageProps = {
  direction: number;
  frame: MotionDeckFrame;
};

export function MotionStage({ direction, frame }: MotionStageProps) {
  const Content = frame.content;

  return (
    <section
      className="motion-deck-stage"
      data-frame-id={frame.id}
    >
      <AnimatePresence custom={direction} initial={false} mode="wait">
        <motion.div
          animate={{ opacity: 1, x: 0 }}
          className="motion-deck-slide"
          exit={{
            opacity: 0,
            x: direction >= 0 ? -34 : 34,
            transition: { duration: 0.2, ease: "easeOut" },
          }}
          initial={{
            opacity: 0,
            x: direction >= 0 ? 34 : -34,
          }}
          key={frame.id}
          transition={frame.transition}
        >
          <SlideFrame kind={frame.kind}>
            <Content className="slide-content" />
          </SlideFrame>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
