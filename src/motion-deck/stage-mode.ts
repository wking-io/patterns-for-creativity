export type MotionStageMode = "live" | "audience" | "preview";

export type MotionStageBehavior = {
  animateContent: boolean;
  animateLayout: boolean;
  autoAdvance: boolean;
  autoplayMedia: boolean;
};

export function getMotionStageBehavior(mode: MotionStageMode): MotionStageBehavior {
  if (mode === "preview") {
    return {
      animateContent: false,
      animateLayout: false,
      autoAdvance: false,
      autoplayMedia: false,
    };
  }

  if (mode === "audience") {
    return {
      animateContent: true,
      animateLayout: true,
      autoAdvance: false,
      autoplayMedia: true,
    };
  }

  return {
    animateContent: true,
    animateLayout: true,
    autoAdvance: true,
    autoplayMedia: true,
  };
}
