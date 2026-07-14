import { motion } from "motion/react";
import type { Transition, Variants } from "motion/react";
import { TitleSlide } from "../slides/00-title";
import { OutputSlide } from "../slides/02-output";
import { ManufacturingSlide } from "../slides/03-manufacturing";
import { CreativitySlide } from "../slides/04-creativity";
import { DesignBombVideo, DesignSlide } from "../slides/05-design";
import { VisualCreativitySlide } from "../slides/05-visual-creativity";
import { CreativePathSlide } from "../slides/06-creative-path";
import { MagicSlide } from "../slides/07-magic";
import { NopeSlide } from "../slides/07-nope";
import { BloomSlide } from "../slides/08-blooms";
import { RhythmSlide } from "../slides/10-rhythm";
import { CreativeProcessSlide } from "../slides/11-creative-process";
import { NoticingSlide } from "../slides/12-noticing";
import { CatalystSlide } from "../slides/13-catalyst";
import { FeedbackSlide } from "../slides/14-feedback";
import { FeedbackPracticeSlide } from "../slides/15-feedback-practice";
import howYouUrl from "../slides/01-think/how-you.svg";
import mustChangeUrl from "../slides/01-think/must-change.svg";
import thinkGraffitiUrl from "../slides/01-think/think-graffiti.svg";
import thinkUrl from "../slides/01-think/think.svg";
import cloudOverlayUrl from "../slides/06-creative-path/fog.png";
import { SlideGridOverlay, SlideTextureOverlay, TitleSlideFooter } from "../slides/SlideFrame";
import type { MotionDeckFrame } from "./frames";
import { getMotionStageBehavior } from "./stage-mode";
import type { MotionStageMode } from "./stage-mode";

type MotionStageProps = {
  direction: number;
  frame: MotionDeckFrame;
  isGridVisible: boolean;
  mode?: MotionStageMode;
  onAdvance?: () => void;
};

const shouldAutoAdvanceDesignVideo = true;

export function MotionStage({
  direction,
  frame,
  isGridVisible,
  mode = "live",
  onAdvance,
}: MotionStageProps) {
  const behavior = getMotionStageBehavior(mode);
  const contentFrameId = frame.sourceId ?? frame.id;
  const isStaticFrame = frame.isStatic === true;
  const isCoverFrame = frame.kind === "cover";
  const isLightFrame = frame.kind === "contained-light";
  const isConstrainedGradientFrame = frame.kind === "constrained-gradient";
  const isFullDarkFrame = frame.kind === "full-dark";
  const isFullGradientFrame = frame.kind === "full-gradient";
  const isFullFrame = isFullDarkFrame || isFullGradientFrame;
  const isCollageFrame = frame.kind === "collage";
  const isOutputFrame = frame.outputVariant != null;
  const isManufacturingFrame = contentFrameId === "manufacturing";
  const isCreativityFrame = contentFrameId === "creativity";
  const isDesignFrame = contentFrameId === "design";
  const isVisualCreativityFrame = contentFrameId === "visual-creativity";
  const isCreativePathFrame = contentFrameId === "creative-path" || contentFrameId === "creative-path-fog";
  const isCreativePathFogFrame = contentFrameId === "creative-path-fog";
  const isCloudOverlayFrame = frame.id === "manufacturing-cloud-static";
  const isMagicFrame = contentFrameId === "magic";
  const isBloomFrame = contentFrameId === "bloom";
  const isRhythmFrame = contentFrameId === "rhythm";
  const isCreativeProcessFrame = contentFrameId === "creative-process";
  const isNoticingFrame = contentFrameId === "noticing";
  const isCatalystFrame = contentFrameId === "catalyst";
  const isFeedbackFrame = contentFrameId === "feedback";
  const isFeedbackPracticeFrame = contentFrameId === "feedback-practice";
  const shouldAnimateContent = behavior.animateContent && !isStaticFrame && direction > 0;
  const isConstrainedGradientEntering = (
    isCreativityFrame || isRhythmFrame
  ) && shouldAnimateContent;

  return (
    <section
      className={[
        "motion-deck-stage",
        "slide-frame",
        "text-light-t0",
        isLightFrame
          ? "slide-frame--contained-light"
          : isConstrainedGradientFrame
            ? "slide-frame--constrained-gradient"
            : isFullDarkFrame
              ? "slide-frame--full-dark"
              : isFullGradientFrame
                ? "slide-frame--full-gradient"
                : "bg-light-s0",
      ].join(" ")}
      data-frame-id={frame.id}
    >
      <motion.div
        className={[
          "slide-panel",
          isCoverFrame
            ? "slide-panel--cover"
            : isFullFrame
              ? "slide-panel--full"
              : isCollageFrame
                ? "slide-panel--collage"
                : isConstrainedGradientFrame
                  ? "slide-panel--constrained-gradient"
                  : isLightFrame
                    ? "slide-panel--contained-light"
                    : "slide-panel--contained",
          "motion-deck-panel",
          isConstrainedGradientEntering ? "motion-deck-panel--creativity-enter" : "",
          isDesignFrame ? "motion-deck-panel--design" : "",
          isLightFrame && shouldAnimateContent && !isBloomFrame
            ? "motion-deck-panel--output-enter"
            : "",
        ].join(" ")}
        key={isConstrainedGradientEntering ? "constrained-gradient-enter-panel" : "deck-panel"}
        layout={behavior.animateLayout && !isConstrainedGradientFrame && !isStaticFrame}
        transition={behavior.animateLayout ? frame.transition : { duration: 0 }}
      >
        {isCoverFrame ? (
          <TitleSlide className="slide-content" isAnimated={behavior.autoplayMedia} />
        ) : isOutputFrame ? (
          <OutputSlide
            animationMode={frame.id === "output" ? "intro" : "replay"}
            animationTrigger={frame.id}
            className="slide-content"
            isAnimated={shouldAnimateContent}
            variant={frame.outputVariant}
          />
        ) : isManufacturingFrame ? (
          <ManufacturingSlide
            className="slide-content"
            isAnimated={shouldAnimateContent}
          >
            {isCloudOverlayFrame ? (
              <img
                alt=""
                aria-hidden="true"
                className="creative-path-slide__fog"
                draggable={false}
                src={cloudOverlayUrl}
              />
            ) : null}
          </ManufacturingSlide>
        ) : isCreativityFrame ? (
          <CreativitySlide
            className="slide-content"
            isAnimated={isConstrainedGradientEntering}
          />
        ) : isDesignFrame ? (
          <>
            <DesignSlide className="slide-content" />
            {behavior.autoplayMedia ? (
              <DesignBombVideo
                onAnimationComplete={
                  behavior.autoAdvance && shouldAutoAdvanceDesignVideo ? onAdvance : undefined
                }
              />
            ) : null}
          </>
        ) : isVisualCreativityFrame ? (
          <VisualCreativitySlide
            className="slide-content"
            isAnimated={shouldAnimateContent}
          />
        ) : isCreativePathFrame ? (
          <CreativePathSlide
            className="slide-content"
            isAnimated={shouldAnimateContent}
            isFogVisible={isCreativePathFogFrame}
            pathVariant={frame.creativePathVariant}
          />
        ) : isMagicFrame ? (
          <div className="magic-composite-slide slide-content">
            <NopeSlide className="magic-composite-slide__background" />
            <MagicSlide
              className="magic-composite-slide__video"
              isAnimated={behavior.autoplayMedia}
            />
          </div>
        ) : isBloomFrame ? (
          <BloomSlide
            className="slide-content"
            isAnimated={shouldAnimateContent}
          />
        ) : isRhythmFrame ? (
          <RhythmSlide className="slide-content" />
        ) : isCreativeProcessFrame ? (
          <CreativeProcessSlide className="slide-content" />
        ) : isNoticingFrame ? (
          <NoticingSlide className="slide-content" />
        ) : isCatalystFrame ? (
          <CatalystSlide className="slide-content" />
        ) : isFeedbackFrame ? (
          <FeedbackSlide
            className="slide-content"
            variant={frame.feedbackVariant}
          />
        ) : isFeedbackPracticeFrame ? (
          <FeedbackPracticeSlide
            className="slide-content"
            variant={frame.feedbackPracticeVariant}
          />
        ) : (
          <MotionThinkContent isAnimated={shouldAnimateContent} />
        )}
      </motion.div>

      {isCoverFrame ? <TitleSlideFooter /> : null}
      <SlideTextureOverlay />
      <SlideGridOverlay enabled={isGridVisible} />
    </section>
  );
}

function MotionThinkContent({ isAnimated }: { isAnimated: boolean }) {
  return (
    <div className="slide-content">
      <motion.div
        animate="show"
        className="motion-deck-think-sequence"
        initial={isAnimated ? "hidden" : false}
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
    hidden: { opacity: 0, scale: 0.9 },
    show: {
      opacity: 1,
      scale: 1,
      transition: { ...itemTransition, duration: 0.3 },
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
