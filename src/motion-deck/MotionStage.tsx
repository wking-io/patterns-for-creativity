import { memo, useId, useState } from "react";
import { LayoutGroup, motion } from "motion/react";
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
import {
  ExposurePracticeCollectionSlide,
  ExposurePracticeDemoSlide,
  ExposurePracticeMaskSlide,
  ExposurePracticeMyMindSlide,
} from "../slides/19-exposure-practice";
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
import { ConclusionCanAiSlide } from "../slides/31-conclusion";
import { OutroMediaSlide } from "../slides/32-outro";
import askWhyVideoUrl from "../slides/17-friction-practice/ask-why.mp4";
import billieVideoUrl from "../slides/25-taste/billie.webm";
import howYouUrl from "../slides/01-think/how-you.svg";
import mustChangeUrl from "../slides/01-think/must-change.svg";
import thinkGraffitiUrl from "../slides/01-think/think-graffiti.svg";
import thinkUrl from "../slides/01-think/think.svg";
import cloudOverlayUrl from "../slides/06-creative-path/fog.webp";
import { SlideGridOverlay, SlideTextureOverlay, TitleSlideFooter } from "../slides/SlideFrame";
import type { MotionDeckFrame } from "./frames";
import type {
  ExposureMaskStep,
  PortalMaskRect,
  PresentationCollectionScrollState,
  PresentationInteractionState,
  PresentationPointerPosition,
  ScratchSegment,
} from "./presentation-sync";
import { areMotionStagePropsEqual, getMotionStageBehavior } from "./stage-mode";
import type { MotionStageMode } from "./stage-mode";

type MotionStageProps = {
  direction: number;
  frame: MotionDeckFrame;
  isGridVisible: boolean;
  interactionState?: PresentationInteractionState;
  mode?: MotionStageMode;
  onAdvance?: () => void;
  onInteractionState?: (state: PresentationInteractionState) => void;
  onPortalMaskRect?: (rect: PortalMaskRect) => void;
  onScratchSegments?: (segments: ScratchSegment[]) => void;
  scratchSegments?: readonly ScratchSegment[];
  portalMaskRect?: PortalMaskRect;
};

const shouldAutoAdvanceDesignVideo = true;

function MotionStageComponent({
  direction,
  frame,
  isGridVisible,
  interactionState,
  mode = "live",
  onAdvance,
  onInteractionState,
  onPortalMaskRect,
  onScratchSegments,
  scratchSegments = [],
  portalMaskRect,
}: MotionStageProps) {
  const behavior = getMotionStageBehavior(mode);
  const isInteractiveMode = mode === "live" || mode === "presenter";
  const layoutGroupId = `motion-stage-${useId().replaceAll(":", "")}`;
  const currentInteractionState = interactionState?.frameId === frame.id
    ? interactionState
    : undefined;
  const reportPointer = (pointer?: PresentationPointerPosition) => {
    onInteractionState?.({ frameId: frame.id, pointer });
  };
  const reportExposureMaskInteraction = (
    pointer: PresentationPointerPosition | undefined,
    exposureMaskStep: ExposureMaskStep,
  ) => {
    onInteractionState?.({
      frameId: frame.id,
      pointer,
      exposureMaskStep,
    });
  };
  const reportExposureCollectionScroll = (
    exposureCollectionScroll: PresentationCollectionScrollState,
  ) => {
    onInteractionState?.({
      frameId: frame.id,
      exposureCollectionScroll,
    });
  };
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
  const isExposurePracticeMaskFrame = contentFrameId === "exposure-practice-sky-remembers";
  const isExposurePracticeMyMindFrame = contentFrameId === "exposure-practice-mymind";
  const isExposurePracticeCollectionFrame = contentFrameId === "exposure-practice-image-placeholder";
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
  const isTastePatternFrame =
    contentFrameId === "taste-pattern-matching" || frame.tastePatternCopy != null;
  const isScratchRevealFrame = contentFrameId === "optimize-exploration-scratch";
  const isFirstIdeaFrame = contentFrameId === "optimize-first-idea";
  const isTasteBillieVideoFrame = contentFrameId === "taste-practice-image-placeholder";
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
  const isConclusionCanAiFrame = contentFrameId === "conclusion-can-ai-do-your-job";
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
    <LayoutGroup id={layoutGroupId}>
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
        {frame.isBlank ? null : isCoverFrame ? (
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
          <MagicCompositeSlide shouldPlay={behavior.autoplayMedia} />
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
            headline={frame.tastePatternCopy?.headline}
            iconVariant={frame.tastePatternCopy?.iconVariant}
            isAnimated={shouldAnimateContent}
            leftLabel={frame.tastePatternCopy?.leftLabel}
            rightLabel={frame.tastePatternCopy?.rightLabel}
          />
        ) : isScratchRevealFrame ? (
          <ScratchRevealSlide
            className="slide-content"
            isInteractive={isInteractiveMode && shouldAnimateContent}
            key={frame.id}
            onScratchSegments={onScratchSegments}
            onPointerChange={reportPointer}
            scratchSegments={scratchSegments}
            showCompletedWhenStatic={mode === "preview"}
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
          <CatalystSlide
            className="slide-content"
            isAnimated={shouldAnimateContent}
          />
        ) : isCatalystOutcomesFrame ? (
          <CatalystOutcomesSlide
            className="slide-content"
            isAnimated={shouldAnimateContent}
            onAdvance={onAdvance}
            step={frame.catalystOutcomesStep}
          />
        ) : isFeedbackFrame ? (
          <FeedbackSlide
            className="slide-content"
            isAnimated={shouldAnimateContent}
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
            muted={!behavior.audioEnabled}
            playsInline
            preload="auto"
            src={askWhyVideoUrl}
          />
        ) : isTasteBillieVideoFrame ? (
          <video
            aria-label="Billie Eilish and Finneas"
            autoPlay={behavior.autoplayMedia}
            className="taste-practice-billie-video"
            disablePictureInPicture
            muted={!behavior.audioEnabled}
            playsInline
            preload="auto"
            src={billieVideoUrl}
          />
        ) : isApertureFrame ? (
          <ApertureSlide
            className="slide-content"
            isAnimated={behavior.animateContent}
            variant={frame.apertureVariant}
          />
        ) : frame.exposurePracticeDemoVariant != null ? (
          <ExposurePracticeDemoSlide
            className="slide-content"
            isAudioEnabled={behavior.audioEnabled}
            isInteractive={isInteractiveMode}
            onPortalMaskRect={onPortalMaskRect}
            onPortalPointerChange={reportPointer}
            portalMaskRect={portalMaskRect}
            shouldPlay={behavior.autoplayMedia}
            variant={frame.exposurePracticeDemoVariant}
          />
        ) : isExposurePracticeMaskFrame ? (
          <ExposurePracticeMaskSlide
            className="slide-content"
            isAnimated={shouldAnimateContent}
            isAudioEnabled={behavior.audioEnabled}
            isInteractive={isInteractiveMode}
            maskStep={currentInteractionState?.exposureMaskStep}
            onInteractionChange={reportExposureMaskInteraction}
          />
        ) : isExposurePracticeMyMindFrame ? (
          <ExposurePracticeMyMindSlide
            className="slide-content"
            isAnimated={shouldAnimateContent}
          />
        ) : isExposurePracticeCollectionFrame ? (
          <ExposurePracticeCollectionSlide
            className="slide-content"
            isAnimated={behavior.autoplayMedia}
            loadImagesEagerly={mode === "audience"}
            onScrollStateChange={reportExposureCollectionScroll}
            scrollState={currentInteractionState?.exposureCollectionScroll}
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
          <SynthDemoSlide
            className="slide-content"
            isInteractive={isInteractiveMode}
          />
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
        ) : isConclusionCanAiFrame ? (
          <ConclusionCanAiSlide className="slide-content" />
        ) : frame.shortenLoopPairedMediaVariant != null ? (
          <ShortenLoopPairedMediaSlide
            className="slide-content"
            shouldPlay={behavior.autoplayMedia}
            variant={frame.shortenLoopPairedMediaVariant}
          />
        ) : frame.outroVariant != null ? (
          <OutroMediaSlide
            className="slide-content"
            variant={frame.outroVariant}
          />
        ) : (
          <MotionThinkContent isAnimated={shouldAnimateContent} />
        )}
      </motion.div>

      {isCoverFrame ? <TitleSlideFooter /> : null}
      <SlideTextureOverlay />
      <SlideGridOverlay enabled={isGridVisible} />
      {mode === "audience" && currentInteractionState?.pointer ? (
        <div className="presentation-pointer-layer">
          <PresentationPointer
            position={currentInteractionState.pointer}
            variant={isScratchRevealFrame && scratchSegments.length > 0
              ? "scratch"
              : "pointer"}
          />
        </div>
      ) : null}
      </section>
    </LayoutGroup>
  );
}

export const MotionStage = memo(MotionStageComponent, areMotionStagePropsEqual);

function MagicCompositeSlide({ shouldPlay }: { shouldPlay: boolean }) {
  const [isVideoReady, setIsVideoReady] = useState(false);

  return (
    <div className="magic-composite-slide slide-content">
      <NopeSlide
        className={`magic-composite-slide__background${isVideoReady ? " magic-composite-slide__background--ready" : ""}`}
      />
      <MagicSlide
        className="magic-composite-slide__video"
        isAnimated={shouldPlay}
        onReady={() => setIsVideoReady(true)}
      />
    </div>
  );
}

function PresentationPointer({
  position,
  variant,
}: {
  position: PresentationPointerPosition;
  variant: "pointer" | "scratch";
}) {
  if (variant === "scratch") {
    return (
      <svg
        aria-hidden="true"
        className="presentation-pointer presentation-pointer--scratch"
        style={{ left: `${position.x * 100}%`, top: `${position.y * 100}%` }}
        viewBox="0 0 18 18"
      >
        <path
          d="M7 1.25h4c2.2803 0 4 3.3315 4 7.75s-1.7197 7.75-4 7.75H7Z"
          fill="var(--color-light-s0)"
        />
        <ellipse
          cx="7"
          cy="9"
          fill="var(--color-light-s0)"
          rx="4"
          ry="7.75"
        />
        <path
          d="m11,1.25h-4c-.4141,0-.75.3359-.75.75s.3359.75.75.75h4c.5839,0,1.2014.6558,1.6769,1.75h-2.9323c-.4141,0-.75.3359-.75.75s.3359.75.75.75h3.4207c.1602.676.2704,1.4343.3134,2.25h-3.2286c-.4141,0-.75.3359-.75.75s.3359.75.75.75h3.2286c-.0429.8157-.1531,1.574-.3134,2.25h-3.4207c-.4141,0-.75.3359-.75.75s.3359.75.75.75h2.9323c-.4755,1.0942-1.093,1.75-1.6769,1.75h-4c-.4141,0-.75.3359-.75.75s.3359.75.75.75h4c2.2803,0,4-3.3315,4-7.75s-1.7197-7.75-4-7.75Z"
          fill="currentColor"
        />
        <path
          d="m7,1.25c-2.2803,0-4,3.3315-4,7.75s1.7197,7.75,4,7.75,4-3.3315,4-7.75S9.2803,1.25,7,1.25Zm.75,9.5c0,.4141-.3359.75-.75.75s-.75-.3359-.75-.75v-3.5c0-.4141.3359-.75.75-.75s.75.3359.75.75v3.5Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      className="presentation-pointer"
      style={{ left: `${position.x * 100}%`, top: `${position.y * 100}%` }}
      viewBox="0 0 32 32"
    >
      <g fill="none">
        <path
          d="M8.39323 10.9215C7.87346 9.35884 9.3589 7.8734 10.9216 8.39317H10.9225L21.9411 12.066L22.11 12.1295C23.8017 12.8514 23.688 15.3632 21.8571 15.8863L17.2126 17.2125L15.8864 21.857C15.3633 23.688 12.8515 23.8017 12.1296 22.11L12.0661 21.941L8.39323 10.9225V10.9215ZM10.6061 9.34141C9.82485 9.08157 9.08163 9.82478 9.34148 10.6061L13.0143 21.6246C13.3253 22.5572 14.6544 22.5279 14.9245 21.5826L16.404 16.4039L21.5827 14.9244C22.528 14.6543 22.5572 13.3253 21.6247 13.0143L10.6061 9.34141Z"
          fill="#fff"
          filter="url(#presentation-pointer-shadow)"
        />
        <path
          d="M9.34162 10.6062C9.08161 9.82482 9.82488 9.08154 10.6063 9.34156L21.6248 13.0144C22.5574 13.3254 22.5281 14.6545 21.5828 14.9246L16.4041 16.4041L14.9246 21.5828C14.6545 22.5281 13.3255 22.5573 13.0145 21.6248L9.34162 10.6062Z"
          fill="#040404"
        />
        <defs>
          <filter
            colorInterpolationFilters="sRGB"
            filterUnits="userSpaceOnUse"
            height="17.021"
            id="presentation-pointer-shadow"
            width="17.021"
            x="7.288"
            y="8.287"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              result="hardAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            />
            <feOffset dy="1" />
            <feGaussianBlur stdDeviation=".5" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
            />
            <feBlend
              in2="BackgroundImageFix"
              mode="normal"
              result="effect1_dropShadow_188_485"
            />
            <feBlend
              in="SourceGraphic"
              in2="effect1_dropShadow_188_485"
              mode="normal"
              result="shape"
            />
          </filter>
        </defs>
      </g>
    </svg>
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
