import { motion } from "motion/react";
import { FeedbackPracticeSlide } from "../15-feedback-practice";
import myMindUrl from "./mymind.webp";

type ExposurePracticeMyMindSlideProps = {
  className?: string;
  isAnimated?: boolean;
};

const revealEase = [0.16, 1, 0.3, 1] as const;

export function ExposurePracticeMyMindSlide({
  className = "",
  isAnimated = true,
}: ExposurePracticeMyMindSlideProps) {
  return (
    <div className={`exposure-practice-mymind ${className}`.trim()}>
      <FeedbackPracticeSlide
        className="exposure-practice-mymind__base"
        isAnimated={false}
        variant="exposure-notice"
      />

      <motion.div
        animate={{ opacity: 1 }}
        aria-hidden="true"
        className="exposure-practice-mymind__veil"
        initial={isAnimated ? { opacity: 0 } : false}
        transition={{ duration: 0.18, ease: revealEase }}
      />

      <div className="exposure-practice-mymind__artwork-position">
        <motion.div
          animate={{ opacity: 1, scale: 1 }}
          className="exposure-practice-mymind__artwork"
          initial={isAnimated ? { opacity: 0, scale: 0.88 } : false}
          transition={{ delay: 0.06, duration: 0.21, ease: revealEase }}
        >
          <img
            alt="MyMind"
            className="exposure-practice-mymind__image"
            draggable={false}
            src={myMindUrl}
          />
        </motion.div>
      </div>
    </div>
  );
}
