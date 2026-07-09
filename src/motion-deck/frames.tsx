import type { Transition } from "motion/react";
import type { OutputSlideVariant } from "../slides/02-output";
import type { SlideKind } from "../slides/SlideFrame";

export type MotionDeckFrame = {
  id: string;
  kind: SlideKind;
  label: string;
  outputVariant?: OutputSlideVariant;
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
  {
    id: "output",
    kind: "contained-light",
    label: "Output",
    outputVariant: "engineer-code",
    transition: {
      duration: 0.54,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  {
    id: "output-design",
    kind: "contained-light",
    label: "Design",
    outputVariant: "designer-pixels",
    transition: {
      duration: 0.54,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  {
    id: "output-product",
    kind: "contained-light",
    label: "Product",
    outputVariant: "product-docs",
    transition: {
      duration: 0.54,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  {
    id: "manufacturing",
    kind: "contained-light",
    label: "Manufacturing",
    transition: {
      duration: 0.54,
      ease: [0.16, 1, 0.3, 1],
    },
  },
];
