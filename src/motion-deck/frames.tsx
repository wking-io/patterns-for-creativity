import type { Transition } from "motion/react";
import type { SlideKind } from "../slides/SlideFrame";

export type MotionDeckFrame = {
  id: string;
  kind: SlideKind;
  label: string;
  transition?: Transition;
};

const spring: Transition = {
  type: "spring",
  stiffness: 130,
  damping: 20,
  mass: 0.9,
};

export const motionDeckFrames: MotionDeckFrame[] = [
  {
    id: "cover",
    kind: "cover",
    label: "Cover",
    transition: spring,
  },
  {
    id: "think",
    kind: "contained-dark",
    label: "Think",
    transition: spring,
  },
];
