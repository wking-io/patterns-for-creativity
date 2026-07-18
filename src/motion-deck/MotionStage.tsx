import { motion } from "motion/react";
import type { Transition, Variants } from "motion/react";
import { TitleSlide } from "../slides/00-title";
import { OutputSlide } from "../slides/02-output";
import { ManufacturingSlide } from "../slides/03-manufacturing";
import { CreativitySlide } from "../slides/04-creativity";
import { DesignBombVideo, DesignSlide } from "../slides/05-design";
import {
  VisualCreativityCollageSlide,
  VisualCreativitySlide,
} from "../slides/05-visual-creativity";
import { CreativePathSlide } from "../slides/06-creative-path";
import { MagicSlide } from "../slides/07-magic";
import { NopeSlide } from "../slides/07-nope";
import { BloomSlide } from "../slides/08-blooms";
import { RhythmSlide } from "../slides/10-rhythm";
import { CreativeProcessSlide } from "../slides/11-creative-process";
import { NoticingSlide } from "../slides/12-noticing";
import { CatalystOutcomesSlide, CatalystSlide } from "../slides/13-catalyst";
import { FeedbackSlide } from "../slides/14-feedback";
import { FeedbackPracticeSlide } from "../slides/15-feedback-practice";
import { FrictionSlide } from "../slides/16-friction";
import { ApertureSlide } from "../slides/17-friction-practice";
import { ExposurePracticeMyMindSlide } from "../slides/19-exposure-practice";
import { CatalystCollisionSlide } from "../slides/20-catalyst-collision";
import { IdeasMediaSlide, IdeasSlide } from "../slides/20-ideas";
import {
  MasterMediumPrototypeSlide,
  MasterMediumSlide,
  MasterMediumSideshowSlide,
  MasterMediumTeachSlide,
  SynthDemoSlide,
} from "../slides/21-master-medium";
import {
  LanguageIndexSlide,
  LanguageTweetSlide,
} from "../slides/22-language-is-power";
import {
  RealityLossyCompressionSlide,
  RealityOutcomesSlide,
} from "../slides/23-reality";
import {
  BuildingSoftwareQuoteSlide,
  BuildingSoftwareLearningSlide,
  CalVideoSlide,
  MattTweetSlide,
} from "../slides/24-output-not-artifacts";
import { TastePatternSlide } from "../slides/25-taste";
import {
  FirstIdeaSlide,
  ScratchRevealSlide,
} from "../slides/26-optimize-for-exploration";
import { FinalPathSlide } from "../slides/28-final-path";
import {
  LessSacredConstraintsSlide,
  LessSacredEightPatternsSlide,
  LessSacredGangPromptSlide,
  LessSacredPaperSlide,
  LessSacredQuickVideoSlide,
  LessSacredSmithDictionSlide,
} from "../slides/27-less-sacred";
import {
  ShortenLoopFidelitySlide,
  ShortenLoopPrototypeSlide,
  ShortenTheLoopSlide,
} from "../slides/29-shorten-the-loop";
import {
  ShortenLoopBezierSlide,
  ShortenLoopPairedMediaSlide,
} from "../slides/30-shorten-loop-practice";
import askWhyVideoUrl from "../slides/17-friction-practice/ask-why.mp4";
import howYouUrl from "../slides/01-think/how-you.svg";
import mustChangeUrl from "../slides/01-think/must-change.svg";
import thinkGraffitiUrl from "../slides/01-think/think-graffiti.svg";
import thinkUrl from "../slides/01-think/think.svg";
import cloudOverlayUrl from "../slides/06-creative-path/fog.webp";
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
  const isConstrainedDarkFrame = frame.kind === "constrained-dark";
  const isConstrainedGradientFrame = frame.kind === "constrained-gradient";
  const isFullDarkFrame = frame.kind === "full-dark";
  const isFullGradientFrame = frame.kind === "full-gradient";
  const isFullFrame = isFullDarkFrame || isFullGradientFrame;
  const isPageFrame = frame.kind === "page";
  const isCollageFrame = frame.kind === "collage";
  const isOutputFrame = frame.outputVariant != null;
  const isManufacturingFrame = contentFrameId === "manufacturing";
  const isCreativityFrame = contentFrameId === "creativity";
  const isDesignFrame = contentFrameId === "design";
  const isVisualCreativityFrame = contentFrameId === "visual-creativity";
  const isVisualCreativityCollageFrame = contentFrameId === "visual-creativity-collage";
  const isCreativePathFrame = contentFrameId === "creative-path" || contentFrameId === "creative-path-fog";
  const isCreativePathFogFrame = contentFrameId === "creative-path-fog";
  const isCloudOverlayFrame = frame.id === "manufacturing-cloud-static";
  const isMagicFrame = contentFrameId === "magic";
  const isBloomFrame = contentFrameId === "bloom";
  const isRhythmFrame = contentFrameId === "rhythm";
  const isCreativeProcessFrame = contentFrameId === "creative-process";
  const isNoticingFrame = contentFrameId === "noticing";
  const isCatalystFrame = contentFrameId === "catalyst";
  const isCatalystOutcomesFrame = contentFrameId === "catalyst-outcomes";
  const isFeedbackFrame = contentFrameId === "feedback";
  const isFeedbackPracticeFrame = frame.feedbackPracticeVariant != null;
  const isFrictionFrame = contentFrameId === "friction";
  const isAskWhyFrame = contentFrameId === "friction-practice-ask-why";
  const isApertureFrame = contentFrameId === "friction-practice-aperture";
  const isExposurePracticeMyMindFrame = contentFrameId === "exposure-practice-mymind";
  const isCatalystCollisionFrame = contentFrameId === "catalyst-collision";
  const isIdeasFrame = contentFrameId === "ideas";
  const isMasterMediumFrame = contentFrameId === "master-medium";
  const isMasterMediumPrototypeFrame = contentFrameId === "master-medium-prototype";
  const isMasterMediumSideshowFrame = contentFrameId === "master-medium-sideshow";
  const isMasterMediumTeachFrame = contentFrameId === "master-medium-teach";
  const isSynthDemoFrame = contentFrameId === "synth-demo";
  const isLanguageIndexFrame = contentFrameId === "language-index-how";
  const isRealityLossyCompressionFrame = contentFrameId === "reality-lossy-compression";
  const isRealityOutcomesFrame = contentFrameId === "reality-outcomes";
  const isMattTweetFrame = contentFrameId === "output-not-artifacts-matt-tweet";
  const isCalVideoFrame = contentFrameId === "output-not-artifacts-cal";
  const isBuildingSoftwareLearningFrame = contentFrameId === "output-not-artifacts-building-is-learning";
  const isTastePatternFrame = contentFrameId === "taste-pattern-matching";
  const isScratchRevealFrame = contentFrameId === "optimize-exploration-scratch";
  const isFirstIdeaFrame = contentFrameId === "optimize-first-idea";
  const isFinalPathFrame = contentFrameId === "final-path";
  const isLessSacredEightPatternsFrame = contentFrameId === "less-sacred-eight-patterns";
  const isLessSacredConstraintsFrame = contentFrameId === "less-sacred-constraints";
  const isLessSacredQuickVideoFrame = contentFrameId === "less-sacred-quick-video";
  const isLessSacredSmithDictionFrame = contentFrameId === "less-sacred-smith-diction";
  const isLessSacredGangPromptFrame = contentFrameId === "less-sacred-gangprompt";
  const isLessSacredPaperFrame = contentFrameId === "less-sacred-paper";
  const isShortenTheLoopFrame = contentFrameId === "shorten-the-loop";
  const isShortenLoopFidelityFrame = contentFrameId === "shorten-loop-fidelity";
  const isShortenLoopPrototypeFrame = contentFrameId === "shorten-loop-prototype";
  const isShortenLoopBezierFrame = contentFrameId === "shorten-loop-bezier";
  const shouldAnimateContent = behavior.animateContent && !isStaticFrame && direction > 0;
  const isConstrainedGradientEntering = (
    isCreativityFrame ||
    isRhythmFrame ||
    isIdeasFrame ||
    isMasterMediumFrame ||
    isMasterMediumPrototypeFrame ||
    isMasterMediumSideshowFrame ||
    isMasterMediumTeachFrame ||
    isTastePatternFrame ||
    isScratchRevealFrame
  ) && shouldAnimateContent;

  return (
    <section
      className={[
        "motion-deck-stage",
        "slide-frame",
        "text-light-t0",
        isLightFrame
          ? "slide-frame--contained-light"
          : isConstrainedDarkFrame
            ? "slide-frame--constrained-dark"
          : isConstrainedGradientFrame
            ? "slide-frame--constrained-gradient"
            : isFullDarkFrame
              ? "slide-frame--full-dark"
              : isFullGradientFrame
                ? "slide-frame--full-gradient"
                : isPageFrame
                  ? "slide-frame--page"
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
                  : isPageFrame
                    ? "slide-panel--page"
                  : isConstrainedDarkFrame
                  ? "slide-panel--constrained-dark"
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
        ) : isVisualCreativityCollageFrame ? (
          <VisualCreativityCollageSlide className="slide-content" />
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
          <CreativeProcessSlide
            className="slide-content"
            isAnimated={shouldAnimateContent}
            key={frame.id}
            stage={frame.creativeProcessStage}
          />
        ) : isFinalPathFrame ? (
          <FinalPathSlide
            className="slide-content"
            isAnimated={shouldAnimateContent}
            key={frame.id}
            stage={frame.finalPathStage}
          />
        ) : isTastePatternFrame ? (
          <TastePatternSlide
            className="slide-content"
            isAnimated={shouldAnimateContent}
          />
        ) : isScratchRevealFrame ? (
          <ScratchRevealSlide
            className="slide-content"
            isAnimated={shouldAnimateContent}
            key={frame.id}
          />
        ) : isFirstIdeaFrame ? (
          <FirstIdeaSlide
            className="slide-content"
            isAnimated={shouldAnimateContent}
            key={frame.id}
            showStamp={frame.showFirstIdeaStamp}
          />
        ) : isNoticingFrame ? (
          <NoticingSlide className="slide-content" />
        ) : isCatalystFrame ? (
          <CatalystSlide className="slide-content" />
        ) : isCatalystOutcomesFrame ? (
          <CatalystOutcomesSlide
            className="slide-content"
            onAdvance={onAdvance}
            step={frame.catalystOutcomesStep}
          />
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
        ) : isFrictionFrame ? (
          <FrictionSlide
            className="slide-content"
            variant={frame.frictionVariant}
          />
        ) : isAskWhyFrame ? (
          <video
            aria-label="Ask why"
            autoPlay={behavior.autoplayMedia}
            className="friction-practice-ask-why-video"
            disablePictureInPicture
            playsInline
            preload="auto"
            src={askWhyVideoUrl}
          />
        ) : isApertureFrame ? (
          <ApertureSlide
            className="slide-content"
            isAnimated={behavior.animateContent}
            variant={frame.apertureVariant}
          />
        ) : isExposurePracticeMyMindFrame ? (
          <ExposurePracticeMyMindSlide
            className="slide-content"
            isAnimated={shouldAnimateContent}
          />
        ) : isCatalystCollisionFrame ? (
          <CatalystCollisionSlide
            className="slide-content"
            particleCounts={frame.catalystParticleCounts}
          />
        ) : frame.ideasMediaVariant != null ? (
          <IdeasMediaSlide
            className="slide-content"
            variant={frame.ideasMediaVariant}
          />
        ) : isIdeasFrame ? (
          <IdeasSlide
            className="slide-content"
            isAnimated={shouldAnimateContent}
          />
        ) : isMasterMediumFrame ? (
          <MasterMediumSlide
            className="slide-content"
            isAnimated={shouldAnimateContent}
          />
        ) : isMasterMediumTeachFrame ? (
          <MasterMediumTeachSlide className="slide-content" />
        ) : isMasterMediumPrototypeFrame ? (
          <MasterMediumPrototypeSlide className="slide-content" />
        ) : isMasterMediumSideshowFrame ? (
          <MasterMediumSideshowSlide className="slide-content" />
        ) : isSynthDemoFrame ? (
          <SynthDemoSlide className="slide-content" />
        ) : isLanguageIndexFrame ? (
          <LanguageIndexSlide className="slide-content" />
        ) : frame.languageTweetVariant != null ? (
          <LanguageTweetSlide
            className="slide-content"
            variant={frame.languageTweetVariant}
          />
        ) : isRealityOutcomesFrame ? (
          <RealityOutcomesSlide
            className="slide-content"
            onAdvance={onAdvance}
            step={frame.realityOutcomesStep}
          />
        ) : isRealityLossyCompressionFrame ? (
          <RealityLossyCompressionSlide
            className="slide-content"
            isAnimated={shouldAnimateContent}
          />
        ) : isMattTweetFrame ? (
          <MattTweetSlide className="slide-content" />
        ) : isCalVideoFrame ? (
          <CalVideoSlide
            className="slide-content"
            shouldPlay={behavior.autoplayMedia}
          />
        ) : frame.buildingSoftwareQuoteVariant != null ? (
          <BuildingSoftwareQuoteSlide
            className="slide-content"
            variant={frame.buildingSoftwareQuoteVariant}
          />
        ) : isBuildingSoftwareLearningFrame ? (
          <BuildingSoftwareLearningSlide className="slide-content" />
        ) : isLessSacredEightPatternsFrame ? (
          <LessSacredEightPatternsSlide className="slide-content" />
        ) : isLessSacredConstraintsFrame ? (
          <LessSacredConstraintsSlide className="slide-content" />
        ) : isLessSacredQuickVideoFrame ? (
          <LessSacredQuickVideoSlide
            className="slide-content"
            shouldPlay={behavior.autoplayMedia}
          />
        ) : isLessSacredSmithDictionFrame ? (
          <LessSacredSmithDictionSlide className="slide-content" />
        ) : isLessSacredGangPromptFrame ? (
          <LessSacredGangPromptSlide className="slide-content" />
        ) : isLessSacredPaperFrame ? (
          <LessSacredPaperSlide
            className="slide-content"
            isAnimated={shouldAnimateContent}
            shouldPlay={behavior.autoplayMedia}
            showVideo={frame.showLessSacredPaperVideo}
          />
        ) : isShortenLoopPrototypeFrame ? (
          <ShortenLoopPrototypeSlide
            className="slide-content"
            shouldPlay={behavior.autoplayMedia}
          />
        ) : isShortenTheLoopFrame ? (
          <ShortenTheLoopSlide
            className="slide-content"
            isAnimated={shouldAnimateContent}
          />
        ) : isShortenLoopFidelityFrame ? (
          <ShortenLoopFidelitySlide className="slide-content" />
        ) : isShortenLoopBezierFrame ? (
          <ShortenLoopBezierSlide
            className="slide-content"
            shouldPlay={behavior.autoplayMedia}
          />
        ) : frame.shortenLoopPairedMediaVariant != null ? (
          <ShortenLoopPairedMediaSlide
            className="slide-content"
            shouldPlay={behavior.autoplayMedia}
            variant={frame.shortenLoopPairedMediaVariant}
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
