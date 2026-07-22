import type { Transition } from "motion/react";
import type { OutputSlideVariant } from "../slides/02-output";
import type { CreativePathVariant } from "../slides/06-creative-path";
import type { CreativeProcessStage } from "../slides/11-creative-process";
import type { FeedbackSlideVariant } from "../slides/14-feedback";
import type { FeedbackPracticeSlideVariant } from "../slides/15-feedback-practice";
import type { FrictionSlideVariant } from "../slides/16-friction";
import type { ApertureSlideVariant } from "../slides/17-friction-practice";
import type { ExposurePracticeDemoVariant } from "../slides/19-exposure-practice";
import type { CatalystOutcomesStep } from "../slides/13-catalyst";
import type { IdeasMediaVariant } from "../slides/20-ideas";
import type { CatalystParticleCounts } from "../slides/20-catalyst-collision";
import type { LanguageTweetVariant } from "../slides/22-language-is-power";
import type { RealityOutcomesStep } from "../slides/23-reality";
import type { BuildingSoftwareQuoteVariant } from "../slides/24-output-not-artifacts";
import type { FinalPathStage } from "../slides/28-final-path";
import type { ShortenLoopPairedMediaVariant } from "../slides/30-shorten-loop-practice";
import type { OutroMediaVariant } from "../slides/32-outro";
import type { SlideKind } from "../slides/SlideFrame";

export type MotionDeckFrame = {
  id: string;
  kind: SlideKind;
  label: string;
  sourceId?: string;
  isBlank?: boolean;
  isStatic?: boolean;
  apertureVariant?: ApertureSlideVariant;
  catalystOutcomesStep?: CatalystOutcomesStep;
  catalystParticleCounts?: CatalystParticleCounts;
  creativePathVariant?: CreativePathVariant;
  creativeProcessStage?: CreativeProcessStage;
  feedbackPracticeVariant?: FeedbackPracticeSlideVariant;
  feedbackVariant?: FeedbackSlideVariant;
  exposurePracticeDemoVariant?: ExposurePracticeDemoVariant;
  finalPathStage?: FinalPathStage;
  frictionVariant?: FrictionSlideVariant;
  ideasMediaVariant?: IdeasMediaVariant;
  languageTweetVariant?: LanguageTweetVariant;
  outroVariant?: OutroMediaVariant;
  buildingSoftwareQuoteVariant?: BuildingSoftwareQuoteVariant;
  showLessSacredPaperVideo?: boolean;
  showFirstIdeaStamp?: boolean;
  tastePatternCopy?: {
    headline: string;
    iconVariant?: "pattern" | "polyhedron";
    leftLabel: string;
    rightLabel: string;
  };
  shortenLoopPairedMediaVariant?: ShortenLoopPairedMediaVariant;
  outputVariant?: OutputSlideVariant;
  realityOutcomesStep?: RealityOutcomesStep;
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
  {
    id: "catalyst-outcomes-feedback",
    sourceId: "catalyst-outcomes",
    kind: "constrained-dark",
    label: "Catalysts — Feedback to Evidence",
    catalystOutcomesStep: 1,
    transition: { duration: 0 },
  },
  {
    id: "friction",
    kind: "contained-dark",
    label: "Common Friction",
    frictionVariant: "common",
    transition: { duration: 0 },
  },
  {
    id: "friction-complex",
    sourceId: "friction",
    kind: "contained-dark",
    label: "Complex Friction",
    frictionVariant: "complex",
    transition: { duration: 0 },
  },
  {
    id: "friction-practice-prompt",
    kind: "constrained-dark",
    label: "Friction Practice — Pause, Ask Why",
    feedbackPracticeVariant: "friction-ask-why",
    transition: { duration: 0 },
  },
  {
    id: "friction-practice-ask-why",
    kind: "constrained-dark",
    label: "Friction Practice — Ask Why",
    transition: { duration: 0 },
  },
  {
    id: "friction-practice-aperture-prompt",
    kind: "constrained-dark",
    label: "Friction Practice — Change Your Aperture",
    feedbackPracticeVariant: "friction-aperture",
    transition: { duration: 0 },
  },
  {
    id: "friction-practice-aperture",
    kind: "constrained-dark",
    label: "Friction Practice — Aperture",
    apertureVariant: "small",
    transition: { duration: 0 },
  },
  {
    id: "friction-practice-aperture-expanded",
    sourceId: "friction-practice-aperture",
    kind: "constrained-dark",
    label: "Friction Practice — Aperture Expanded",
    apertureVariant: "expanded",
    transition: { duration: 0 },
  },
  {
    id: "friction-practice-aperture-focus",
    sourceId: "friction-practice-aperture",
    kind: "constrained-dark",
    label: "Friction Practice — Aperture Focus",
    apertureVariant: "focus",
    transition: { duration: 0 },
  },
  {
    id: "friction-practice-aperture-network",
    sourceId: "friction-practice-aperture",
    kind: "constrained-dark",
    label: "Friction Practice — Aperture Network",
    apertureVariant: "network",
    transition: { duration: 0 },
  },
  {
    id: "friction-practice-unspoken",
    kind: "constrained-dark",
    label: "Friction Practice — What People Do Not Say",
    feedbackPracticeVariant: "friction-unspoken",
    transition: { duration: 0 },
  },
  {
    id: "catalyst-outcomes-friction",
    sourceId: "catalyst-outcomes",
    kind: "constrained-dark",
    label: "Catalysts — Friction to Direction",
    catalystOutcomesStep: 2,
    transition: { duration: 0 },
  },
  {
    id: "catalyst-outcomes-exposure",
    sourceId: "catalyst-outcomes",
    kind: "constrained-dark",
    label: "Catalysts — Exposure to Possibility",
    catalystOutcomesStep: 3,
    transition: { duration: 0 },
  },
  {
    id: "exposure-practice-sky-remembers",
    kind: "full-dark",
    label: "Exposure Practice — The Sky Remembers",
    transition: { duration: 0 },
  },
  {
    id: "exposure-practice-map-overflow",
    kind: "contained-light",
    label: "Exposure Practice — Map Overflow",
    exposurePracticeDemoVariant: "map-overflow",
    transition: { duration: 0 },
  },
  {
    id: "exposure-practice-soundfall",
    kind: "constrained-dark",
    label: "Exposure Practice — Soundfall",
    exposurePracticeDemoVariant: "soundfall",
    transition: { duration: 0 },
  },
  {
    id: "exposure-practice-portal",
    kind: "constrained-dark",
    label: "Exposure Practice — Portal",
    exposurePracticeDemoVariant: "portal",
    transition: { duration: 0 },
  },
  {
    id: "exposure-practice-sky-remembers-reprise",
    sourceId: "exposure-practice-sky-remembers",
    kind: "full-dark",
    label: "Exposure Practice — The Sky Remembers (Reprise)",
    transition: { duration: 0 },
  },
  {
    id: "exposure-practice-beaten-path",
    kind: "constrained-dark",
    label: "Exposure Practice — Get Off the Beaten Path",
    feedbackPracticeVariant: "exposure-beaten-path",
    transition: { duration: 0 },
  },
  {
    id: "exposure-practice-notice",
    kind: "constrained-dark",
    label: "Exposure Practice — Collect What You Notice",
    feedbackPracticeVariant: "exposure-notice",
    transition: { duration: 0 },
  },
  {
    id: "exposure-practice-mymind",
    kind: "constrained-dark",
    label: "Exposure Practice — MyMind",
    transition: { duration: 0 },
  },
  {
    id: "exposure-practice-image-placeholder",
    kind: "constrained-dark",
    label: "Exposure Practice — Collection",
    transition: { duration: 0 },
  },
  {
    id: "catalyst-collision",
    kind: "constrained-dark",
    label: "Catalysts — Combine",
    catalystParticleCounts: { exposure: 2, feedback: 2, friction: 2 },
    transition: { duration: 0 },
  },
  {
    id: "catalyst-collision-friction",
    sourceId: "catalyst-collision",
    kind: "constrained-dark",
    label: "Catalysts — Friction",
    catalystParticleCounts: { exposure: 2, feedback: 2, friction: 40 },
    transition: { duration: 0 },
  },
  {
    id: "catalyst-collision-feedback",
    sourceId: "catalyst-collision",
    kind: "constrained-dark",
    label: "Catalysts — Friction and Feedback",
    catalystParticleCounts: { exposure: 2, feedback: 40, friction: 40 },
    transition: { duration: 0 },
  },
  {
    id: "catalyst-collision-exposure",
    sourceId: "catalyst-collision",
    kind: "constrained-dark",
    label: "Catalysts — Friction, Feedback, and Exposure",
    catalystParticleCounts: { exposure: 40, feedback: 40, friction: 40 },
    transition: { duration: 0 },
  },
  {
    id: "creative-process-ideas",
    sourceId: "creative-process",
    kind: "contained-light",
    label: "Creative Process — Ideas",
    creativeProcessStage: "ideas",
    transition: { duration: 0 },
  },
  {
    id: "ideas",
    kind: "constrained-gradient",
    label: "Ideas",
    transition: {
      duration: 0.54,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  {
    id: "ideas-media-dropbox",
    kind: "full-dark",
    label: "Ideas — Dropbox",
    ideasMediaVariant: "dropbox",
    transition: { duration: 0 },
  },
  {
    id: "ideas-media-banksy",
    kind: "full-dark",
    label: "Ideas — Banksy",
    ideasMediaVariant: "banksy",
    transition: { duration: 0 },
  },
  {
    id: "ideas-media-office",
    kind: "full-dark",
    label: "Ideas — The Office",
    ideasMediaVariant: "office",
    transition: { duration: 0 },
  },
  {
    id: "master-medium",
    kind: "constrained-gradient",
    label: "Ideas — Mastery of Your Medium",
    transition: {
      duration: 0.54,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  {
    id: "ideas-practice-master-medium",
    kind: "constrained-gradient",
    label: "Ideas Practice — Master Your Medium",
    feedbackPracticeVariant: "master-your-medium",
    transition: { duration: 0 },
  },
  {
    id: "master-medium-teach",
    kind: "constrained-gradient",
    label: "Master Your Medium — Teach",
    transition: {
      duration: 0.54,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  {
    id: "synth-demo",
    kind: "constrained-dark",
    label: "Synth Demo",
    transition: { duration: 0 },
  },
  {
    id: "master-medium-sideshow",
    kind: "constrained-gradient",
    label: "Master Your Medium — Sideshow",
    transition: {
      duration: 0.54,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  {
    id: "ideas-practice-language-power",
    kind: "constrained-gradient",
    label: "Ideas Practice — Language Is Power",
    feedbackPracticeVariant: "language-is-power",
    transition: { duration: 0 },
  },
  {
    id: "language-tweet-animation-vocabulary",
    kind: "constrained-dark",
    label: "Language Is Power — Animation Vocabulary",
    languageTweetVariant: "animation-vocabulary",
    transition: { duration: 0 },
  },
  {
    id: "language-index-how",
    kind: "page",
    label: "Language Is Power — Index How",
    transition: { duration: 0 },
  },
  {
    id: "language-tweet-domain-expertise",
    kind: "constrained-dark",
    label: "Language Is Power — Domain Expertise",
    languageTweetVariant: "domain-expertise",
    transition: { duration: 0 },
  },
  {
    id: "creative-process-reality",
    sourceId: "creative-process",
    kind: "contained-light",
    label: "Creative Process — Reality",
    creativeProcessStage: "reality",
    transition: { duration: 0 },
  },
  {
    id: "reality-lossy-compression",
    kind: "contained-dark",
    label: "Reality — Lossy Compression",
    transition: { duration: 0 },
  },
  {
    id: "reality-outcomes",
    kind: "constrained-dark",
    label: "Reality Outcomes",
    realityOutcomesStep: 0,
    transition: { duration: 0 },
  },
  {
    id: "reality-outcomes-abstraction",
    sourceId: "reality-outcomes",
    kind: "constrained-dark",
    label: "Reality Outcomes — Abstraction",
    realityOutcomesStep: 1,
    transition: { duration: 0 },
  },
  {
    id: "reality-outcomes-prototype",
    sourceId: "reality-outcomes",
    kind: "constrained-dark",
    label: "Reality Outcomes — Prototype",
    realityOutcomesStep: 2,
    transition: { duration: 0 },
  },
  {
    id: "reality-outcomes-joke",
    sourceId: "reality-outcomes",
    kind: "constrained-dark",
    label: "Reality Outcomes — Joke",
    realityOutcomesStep: 3,
    transition: { duration: 0 },
  },
  {
    id: "reality-practice-output-artifacts",
    kind: "constrained-dark",
    label: "Reality Practice — The Output Is Not the Artifacts",
    feedbackPracticeVariant: "reality-output-artifacts",
    transition: { duration: 0 },
  },
  {
    id: "output-not-artifacts-cal",
    kind: "full-dark",
    label: "Output, Not Artifacts — Cal",
    transition: { duration: 0 },
  },
  {
    id: "output-not-artifacts-building-is-learning",
    kind: "constrained-dark",
    label: "Output, Not Artifacts — Building Software Is Learning",
    transition: { duration: 0 },
  },
  {
    id: "output-not-artifacts-building-is-learning-quote-1",
    kind: "constrained-dark",
    label: "Output, Not Artifacts — Building Software Is Learning Quote 1",
    buildingSoftwareQuoteVariant: "quote-1",
    transition: { duration: 0 },
  },
  {
    id: "output-not-artifacts-building-is-learning-quote-2",
    kind: "constrained-dark",
    label: "Output, Not Artifacts — Building Software Is Learning Quote 2",
    buildingSoftwareQuoteVariant: "quote-2",
    transition: { duration: 0 },
  },
  {
    id: "output-not-artifacts-matt-tweet",
    kind: "constrained-dark",
    label: "Output, Not Artifacts — Matt Wensing",
    transition: { duration: 0 },
  },
  {
    id: "creative-process-taste-static",
    sourceId: "creative-process",
    kind: "contained-light",
    label: "Creative Process — Before Taste",
    creativeProcessStage: "reality",
    isStatic: true,
    transition: { duration: 0 },
  },
  {
    id: "creative-process-taste",
    sourceId: "creative-process",
    kind: "contained-light",
    label: "Creative Process — Taste",
    creativeProcessStage: "taste",
    transition: { duration: 0 },
  },
  {
    id: "taste-pattern-matching",
    kind: "constrained-gradient",
    label: "Taste — Pattern Matching Earned Through Pain",
    transition: {
      duration: 0.54,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  {
    id: "optimize-exploration-scratch",
    kind: "constrained-gradient",
    label: "Optimize for Exploration — Scratch Reveal",
    transition: { duration: 0 },
  },
  {
    id: "taste-practice-optimize-exploration",
    kind: "constrained-gradient",
    label: "Taste Practice — Optimize for Exploration",
    feedbackPracticeVariant: "optimize-for-exploration",
    transition: { duration: 0 },
  },
  {
    id: "optimize-first-idea",
    kind: "constrained-gradient",
    label: "Optimize for Exploration — First Idea",
    transition: { duration: 0 },
  },
  {
    id: "optimize-first-idea-stamped",
    sourceId: "optimize-first-idea",
    kind: "constrained-gradient",
    label: "Optimize for Exploration — First Idea Sucks",
    showFirstIdeaStamp: true,
    transition: { duration: 0 },
  },
  {
    id: "taste-practice-image-placeholder",
    kind: "full-dark",
    label: "Taste Practice — Billie Eilish and Finneas",
    transition: { duration: 0 },
  },
  {
    id: "taste-practice-artifacts-less-sacred",
    kind: "constrained-gradient",
    label: "Taste Practice — Makes Artifacts Less Sacred",
    feedbackPracticeVariant: "artifacts-less-sacred",
    transition: { duration: 0 },
  },
  {
    id: "less-sacred-eight-patterns",
    kind: "constrained-gradient",
    label: "Less Sacred — Eight Patterns",
    transition: { duration: 0 },
  },
  {
    id: "less-sacred-paper",
    kind: "constrained-gradient",
    label: "Less Sacred — Paper",
    transition: { duration: 0 },
  },
  {
    id: "less-sacred-paper-video",
    sourceId: "less-sacred-paper",
    kind: "constrained-gradient",
    label: "Less Sacred — Paper Demonstration",
    showLessSacredPaperVideo: true,
    transition: { duration: 0 },
  },
  {
    id: "master-medium-prototype",
    kind: "constrained-gradient",
    label: "Master Your Medium — Prototype",
    transition: {
      duration: 0.54,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  {
    id: "less-sacred-constraints",
    kind: "constrained-gradient",
    label: "Less Sacred — Constraints",
    transition: { duration: 0 },
  },
  {
    id: "less-sacred-quick-video",
    kind: "constrained-dark",
    label: "Less Sacred — Quick",
    transition: { duration: 0 },
  },
  {
    id: "less-sacred-smith-diction",
    kind: "constrained-dark",
    label: "Less Sacred — Smith Diction",
    transition: { duration: 0 },
  },
  {
    id: "less-sacred-gangprompt",
    kind: "constrained-dark",
    label: "Less Sacred — Gangprompting",
    transition: { duration: 0 },
  },
  {
    id: "creative-process-taste-reprise",
    sourceId: "creative-process",
    kind: "contained-light",
    label: "Creative Process — Taste Reprise",
    creativeProcessStage: "taste",
    isStatic: true,
    transition: { duration: 0 },
  },
  {
    id: "final-path",
    kind: "contained-light",
    label: "Final Path — Stages",
    finalPathStage: "layout",
    transition: { duration: 0 },
  },
  {
    id: "final-path-catalysts",
    sourceId: "final-path",
    kind: "contained-light",
    label: "Final Path — Catalysts",
    finalPathStage: "catalysts",
    transition: { duration: 0 },
  },
  {
    id: "final-path-ideas",
    sourceId: "final-path",
    kind: "contained-light",
    label: "Final Path — Ideas",
    finalPathStage: "ideas",
    transition: { duration: 0 },
  },
  {
    id: "final-path-reality",
    sourceId: "final-path",
    kind: "contained-light",
    label: "Final Path — Reality",
    finalPathStage: "reality",
    transition: { duration: 0 },
  },
  {
    id: "final-path-taste",
    sourceId: "final-path",
    kind: "contained-light",
    label: "Final Path — Taste",
    finalPathStage: "taste",
    transition: { duration: 0 },
  },
  {
    id: "shorten-the-loop",
    kind: "constrained-dark",
    label: "Shorten the Loop",
    transition: { duration: 0 },
  },
  {
    id: "shorten-loop-fidelity",
    kind: "constrained-gradient",
    label: "Shorten the Loop — Fidelity",
    transition: { duration: 0 },
  },
  {
    id: "visual-creativity-collage",
    kind: "full-dark",
    label: "Visual Creativity — Collage",
    transition: { duration: 0 },
  },
  {
    id: "shorten-loop-prototype",
    kind: "full-dark",
    label: "Shorten the Loop — Prototype",
    transition: { duration: 0 },
  },
  {
    id: "shorten-loop-tools",
    kind: "constrained-dark",
    label: "Shorten the Loop — Make Your Own Tools",
    feedbackPracticeVariant: "shorten-loop-tools",
    transition: { duration: 0 },
  },
  {
    id: "shorten-loop-bezier",
    kind: "full-dark",
    label: "Shorten the Loop — Bezier Tool",
    transition: { duration: 0 },
  },
  {
    id: "shorten-loop-ridd",
    kind: "constrained-dark",
    label: "Shorten the Loop — Ridd",
    shortenLoopPairedMediaVariant: "ridd",
    transition: { duration: 0 },
  },
  {
    id: "shorten-loop-lochie",
    kind: "constrained-dark",
    label: "Shorten the Loop — Lochie",
    shortenLoopPairedMediaVariant: "lochie",
    transition: { duration: 0 },
  },
  {
    id: "conclusion-can-ai-do-your-job",
    kind: "constrained-dark",
    label: "Conclusion — Can AI Do Your Job?",
    transition: { duration: 0 },
  },
  {
    id: "manufacturing-final",
    sourceId: "manufacturing",
    kind: "contained-light",
    label: "Manufacturing — Final",
    isStatic: true,
    transition: { duration: 0 },
  },
  {
    id: "creative-path-final",
    sourceId: "creative-path",
    kind: "contained-light",
    label: "Creative Path — Final",
    isStatic: true,
    transition: { duration: 0 },
  },
  {
    id: "conclusion-worth-building",
    kind: "constrained-gradient",
    label: "Conclusion — Who Decides What Is Worth Building?",
    tastePatternCopy: {
      headline: "Who decides What is Worth Building?",
      iconVariant: "polyhedron",
      leftLabel: "Find what",
      rightLabel: "is Possible",
    },
    transition: {
      duration: 0.54,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  {
    id: "outro-snowflake",
    kind: "constrained-dark",
    label: "Outro — Snowflake",
    outroVariant: "snowflake",
    transition: { duration: 0 },
  },
  {
    id: "outro-profile",
    kind: "constrained-dark",
    label: "Outro — Profile",
    outroVariant: "profile",
    transition: { duration: 0 },
  },
  {
    id: "outro-riff-and-refine",
    kind: "contained-dark",
    label: "Outro — Riff and Refine",
    outroVariant: "riff-and-refine",
    transition: { duration: 0 },
  },
  {
    id: "outro-no-one-asked-us",
    kind: "contained-dark",
    label: "Outro — No One Asked Us",
    outroVariant: "no-one-asked-us",
    transition: { duration: 0 },
  },
  {
    id: "outro-thank-you",
    kind: "constrained-dark",
    label: "Outro — Thank You",
    outroVariant: "thank-you",
    transition: { duration: 0 },
  },
];
