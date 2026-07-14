import type { Transition } from "motion/react";
import type { OutputSlideVariant } from "../slides/02-output";
import type { CreativePathVariant } from "../slides/06-creative-path";
import type { FeedbackSlideVariant } from "../slides/14-feedback";
import type { FeedbackPracticeSlideVariant } from "../slides/15-feedback-practice";
import type { SlideKind } from "../slides/SlideFrame";

export type MotionDeckFrame = {
  id: string;
  kind: SlideKind;
  label: string;
  sourceId?: string;
  isStatic?: boolean;
  creativePathVariant?: CreativePathVariant;
  feedbackPracticeVariant?: FeedbackPracticeSlideVariant;
  feedbackVariant?: FeedbackSlideVariant;
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
  {
    id: "creativity",
    kind: "constrained-gradient",
    label: "Creativity",
    transition: {
      duration: 0.54,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  {
    id: "design",
    kind: "contained-dark",
    label: "Design",
    transition: {
      duration: 0.54,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  {
    id: "visual-creativity",
    kind: "collage",
    label: "Visual Creativity",
    transition: {
      duration: 0.54,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  {
    id: "creative-path",
    kind: "contained-light",
    label: "Creative Path",
    transition: {
      duration: 0.54,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  {
    id: "creative-path-fog",
    kind: "contained-light",
    label: "Creative Path + Fog",
    transition: {
      duration: 0.54,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  {
    id: "manufacturing-static",
    sourceId: "manufacturing",
    kind: "contained-light",
    label: "Manufacturing (Static)",
    isStatic: true,
    transition: { duration: 0 },
  },
  {
    id: "manufacturing-cloud-static",
    sourceId: "manufacturing",
    kind: "contained-light",
    label: "Manufacturing + Cloud (Static)",
    isStatic: true,
    transition: { duration: 0 },
  },
  {
    id: "magic",
    kind: "full-gradient",
    label: "Magic",
    transition: { duration: 0 },
  },
  {
    id: "bloom",
    kind: "contained-light",
    label: "Bloom",
    transition: {
      duration: 0.54,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  {
    id: "other-paths",
    sourceId: "creative-path",
    kind: "contained-light",
    label: "Other Paths",
    creativePathVariant: "original",
    isStatic: true,
    transition: { duration: 0 },
  },
  {
    id: "other-paths-alt-1",
    sourceId: "creative-path",
    kind: "contained-light",
    label: "Other Paths — Alternative 1",
    creativePathVariant: "alt-1",
    isStatic: true,
    transition: { duration: 0 },
  },
  {
    id: "other-paths-alt-2",
    sourceId: "creative-path",
    kind: "contained-light",
    label: "Other Paths — Alternative 2",
    creativePathVariant: "alt-2",
    isStatic: true,
    transition: { duration: 0 },
  },
  {
    id: "rhythm",
    kind: "constrained-gradient",
    label: "Rhythm",
    transition: {
      duration: 0.54,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  {
    id: "creative-process",
    kind: "contained-light",
    label: "Creative Process",
    transition: {
      duration: 0.54,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  {
    id: "noticing",
    kind: "contained-dark",
    label: "Noticing",
    transition: {
      duration: 0.54,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  {
    id: "catalyst",
    kind: "contained-dark",
    label: "Catalyst",
    transition: {
      duration: 0.54,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  {
    id: "feedback",
    kind: "contained-dark",
    label: "Feedback",
    feedbackVariant: "initial",
    transition: { duration: 0 },
  },
  {
    id: "feedback-people",
    sourceId: "feedback",
    kind: "contained-dark",
    label: "Feedback — People",
    feedbackVariant: "people",
    transition: { duration: 0 },
  },
  {
    id: "feedback-complete",
    sourceId: "feedback",
    kind: "contained-dark",
    label: "Feedback — People and Systems",
    feedbackVariant: "complete",
    transition: { duration: 0 },
  },
  {
    id: "feedback-practice",
    kind: "contained-dark",
    label: "Feedback Practice",
    feedbackPracticeVariant: "intro",
    transition: { duration: 0 },
  },
  {
    id: "feedback-practice-glass",
    sourceId: "feedback-practice",
    kind: "contained-dark",
    label: "Feedback Practice — Glass",
    feedbackPracticeVariant: "glass",
    transition: { duration: 0 },
  },
  {
    id: "feedback-practice-source",
    sourceId: "feedback-practice",
    kind: "contained-dark",
    label: "Feedback Practice — Source",
    feedbackPracticeVariant: "practice-2",
    transition: { duration: 0 },
  },
  {
    id: "feedback-practice-tweet",
    sourceId: "feedback-practice",
    kind: "contained-dark",
    label: "Feedback Practice — X Post",
    feedbackPracticeVariant: "tweet",
    transition: { duration: 0 },
  },
];
