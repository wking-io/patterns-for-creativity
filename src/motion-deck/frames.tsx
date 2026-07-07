import type { ComponentType } from "react";
import type { Transition } from "motion/react";
import { TitleSlide } from "../slides/00-title";
import { ThinkSlide } from "../slides/01-think";
import type { SlideKind } from "../slides/SlideFrame";

export type MotionDeckFrame = {
  content: ComponentType<{ className?: string }>;
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
    content: TitleSlide,
    id: "cover",
    kind: "cover",
    label: "Cover",
    transition: spring,
  },
  {
    content: ThinkSlide,
    id: "think",
    kind: "contained-dark",
    label: "Think",
    transition: spring,
  },
];
