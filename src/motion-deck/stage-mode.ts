export type MotionStageMode = "live" | "presenter" | "audience" | "preview";

export type MotionStageBehavior = {
  animateContent: boolean;
  animateLayout: boolean;
  audioEnabled: boolean;
  autoAdvance: boolean;
  autoplayMedia: boolean;
};

type ComparableMotionStageProps = {
  direction: number;
  frame: unknown;
  isGridVisible: boolean;
  interactionState?: unknown;
  mode?: MotionStageMode;
  onAdvance?: unknown;
  onInteractionState?: unknown;
  onPortalMaskRect?: unknown;
  onScratchSegments?: unknown;
  scratchSegments?: readonly unknown[];
  portalMaskRect?: unknown;
};

export function areMotionStagePropsEqual(
  previous: ComparableMotionStageProps,
  next: ComparableMotionStageProps,
) {
  return (
    previous.direction === next.direction &&
    previous.frame === next.frame &&
    previous.isGridVisible === next.isGridVisible &&
    previous.interactionState === next.interactionState &&
    previous.mode === next.mode &&
    previous.onAdvance === next.onAdvance &&
    previous.onInteractionState === next.onInteractionState &&
    previous.onPortalMaskRect === next.onPortalMaskRect &&
    previous.onScratchSegments === next.onScratchSegments &&
    previous.scratchSegments === next.scratchSegments &&
    previous.portalMaskRect === next.portalMaskRect
  );
}

export function getMotionStageBehavior(mode: MotionStageMode): MotionStageBehavior {
  if (mode === "preview") {
    return {
      animateContent: false,
      animateLayout: false,
      audioEnabled: false,
      autoAdvance: false,
      autoplayMedia: false,
    };
  }

  if (mode === "audience") {
    return {
      animateContent: true,
      animateLayout: true,
      audioEnabled: true,
      autoAdvance: false,
      autoplayMedia: true,
    };
  }

  if (mode === "presenter") {
    return {
      animateContent: true,
      animateLayout: true,
      audioEnabled: false,
      autoAdvance: true,
      autoplayMedia: true,
    };
  }

  return {
    animateContent: true,
    animateLayout: true,
    audioEnabled: true,
    autoAdvance: true,
    autoplayMedia: true,
  };
}
