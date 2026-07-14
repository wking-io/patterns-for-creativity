export type MotionStageMode = "live" | "preview";

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

  return {
    animateContent: true,
    animateLayout: true,
    autoAdvance: true,
    autoplayMedia: true,
  };
}
