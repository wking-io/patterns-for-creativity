import { motion } from "motion/react";
import type { Transition, Variants } from "motion/react";
import feedbackTextUrl from "../13-catalyst/feedback-text.svg";
import frictionTextUrl from "../13-catalyst/friction-text.svg";
import bulletUrl from "./bullet.svg";
import exposureInnerUrl from "./exposure-inner.svg";
import feedbackInnerUrl from "./feedback-inner.svg";
import frameUrl from "./frame.svg";
import workFeedbackInnerUrl from "./work-feedback-inner.svg";
import workFrictionInnerUrl from "./work-friction-inner.svg";

export type FeedbackSlideVariant = "initial" | "people" | "complete";

type FeedbackSlideProps = {
  className?: string;
  isAnimated?: boolean;
  variant?: FeedbackSlideVariant;
};

type FeedbackColumnSide = "feedback" | "friction";
type FeedbackDetailLayout = FeedbackColumnSide | "single";

const headerTransition: Transition = {
  duration: 0.62,
  ease: [0.16, 1, 0.3, 1],
};

const labelRevealTransition: Transition = {
  duration: 0.42,
  ease: [0.16, 1, 0.3, 1],
};

const detailVariants: Variants = {
  hidden: {
    opacity: 0,
    x: -18,
  },
  visible: {
    opacity: 1,
    x: 0,
  },
};

const feedbackDetails = [
  "Complaints",
  "Requests",
  "Metrics",
  "Logs & Bugs",
] as const;

const frictionDetails = [
  "Product",
  "Cognitive",
  "Trust",
  "Incentive",
] as const;

const fromWorkDetails = [
  "Feature requests",
  "Bugs & Errors in your system",
  "Product misuse because misaligned incentives",
] as const;

export function FeedbackSlide({
  className = "",
  isAnimated = true,
  variant = "initial",
}: FeedbackSlideProps) {
  const isExpanded = variant !== "initial";
  const isEntryTransition = isAnimated && variant === "initial";

  if (variant === "people") {
    return (
      <div
        className={`feedback-slide ${className}`.trim()}
        data-feedback-variant={variant}
      >
        <FeedbackDetails
          delay={0.1}
          isAnimated={isAnimated}
          items={fromWorkDetails}
          side="single"
          visible
        />
      </div>
    );
  }

  return (
    <div
      className={`feedback-slide ${className}`.trim()}
      data-feedback-variant={variant}
    >
      <FeedbackHeader
        iconInnerUrl={workFeedbackInnerUrl}
        isEntryTransition={isEntryTransition}
        isExpanded={isExpanded}
        label="Feedback"
        labelUrl={feedbackTextUrl}
        layoutKey="work"
        originIconInnerUrl={feedbackInnerUrl}
        side="feedback"
      />
      <FeedbackHeader
        iconInnerUrl={workFrictionInnerUrl}
        isEntryTransition={isEntryTransition}
        isExpanded={isExpanded}
        label="Friction"
        labelUrl={frictionTextUrl}
        layoutKey="world"
        originIconInnerUrl={exposureInnerUrl}
        side="friction"
      />

      <FeedbackDetails
        delay={0.56}
        isAnimated={isAnimated}
        items={feedbackDetails}
        side="feedback"
        visible={isExpanded}
      />
      <FeedbackDetails
        delay={0.1}
        isAnimated={isAnimated}
        items={frictionDetails}
        side="friction"
        visible={variant === "complete"}
      />
    </div>
  );
}

type FeedbackHeaderProps = {
  iconInnerUrl: string;
  isEntryTransition: boolean;
  isExpanded: boolean;
  label: string;
  labelUrl: string;
  layoutKey: "work" | "world";
  originIconInnerUrl: string;
  side: FeedbackColumnSide;
};

function FeedbackHeader({
  iconInnerUrl,
  isEntryTransition,
  isExpanded,
  label,
  labelUrl,
  layoutKey,
  originIconInnerUrl,
  side,
}: FeedbackHeaderProps) {
  const initialLeft = side === "feedback" ? "32.68%" : "67.05%";
  const expandedIconLeft =
    side === "feedback"
      ? "calc(10.75% + var(--feedback-detail-bullet-center-offset))"
      : "calc(56.72% + var(--feedback-detail-bullet-center-offset))";
  const expandedLabelLeft = side === "feedback" ? "30%" : "73%";

  return (
    <div className={`feedback-slide__header feedback-slide__header--${side}`}>
      <motion.div
        animate={isExpanded ? "expanded" : "initial"}
        className="feedback-slide__header-icon"
        initial={false}
        layoutId={`from-${layoutKey}-catalyst-icon`}
        style={{ x: "-50%" }}
        transition={{
          ...headerTransition,
          layout: headerTransition,
        }}
        variants={{
          expanded: {
            left: expandedIconLeft,
            top: "16.2%",
          },
          initial: {
            left: initialLeft,
            top: "35.8%",
          },
        }}
      >
        <img
          alt=""
          aria-hidden="true"
          className="feedback-slide__header-icon-frame"
          draggable={false}
          src={frameUrl}
        />
        {isEntryTransition ? (
          <motion.img
            alt=""
            animate={{ opacity: 0 }}
            aria-hidden="true"
            className="feedback-slide__header-icon-inner"
            draggable={false}
            initial={{ opacity: 1 }}
            src={originIconInnerUrl}
            transition={{
              delay: 0.18,
              duration: 0.24,
              ease: [0.16, 1, 0.3, 1],
            }}
          />
        ) : null}
        <motion.img
          alt=""
          animate={{ opacity: 1 }}
          aria-hidden="true"
          className="feedback-slide__header-icon-inner"
          draggable={false}
          initial={isEntryTransition ? { opacity: 0 } : false}
          src={iconInnerUrl}
          transition={{
            delay: isEntryTransition ? 0.18 : 0,
            duration: isEntryTransition ? 0.24 : 0,
            ease: [0.16, 1, 0.3, 1],
          }}
        />
      </motion.div>
      <motion.div
        animate={isExpanded ? "expanded" : "initial"}
        className={[
          "feedback-slide__header-label",
          `feedback-slide__header-label--${side}`,
        ].join(" ")}
        initial={false}
        layout="position"
        layoutId={`from-${layoutKey}-catalyst-label`}
        style={{ x: "-50%" }}
        transition={{
          ...headerTransition,
          layout: headerTransition,
        }}
        variants={{
          expanded: {
            left: expandedLabelLeft,
            top: "18.83%",
          },
          initial: {
            left: initialLeft,
            top: "58%",
          },
        }}
      >
        <motion.img
          alt={label}
          animate={{ opacity: 1, x: 0 }}
          className="feedback-slide__header-label-image"
          draggable={false}
          initial={isEntryTransition ? { opacity: 0, x: 24 } : false}
          src={labelUrl}
          transition={
            isEntryTransition ? labelRevealTransition : { duration: 0 }
          }
        />
      </motion.div>
    </div>
  );
}

type FeedbackDetailsProps = {
  delay: number;
  isAnimated: boolean;
  items: readonly string[];
  side: FeedbackDetailLayout;
  visible: boolean;
};

function FeedbackDetails({
  delay,
  isAnimated,
  items,
  side,
  visible,
}: FeedbackDetailsProps) {
  return (
    <ul
      aria-hidden={!visible}
      className={`feedback-slide__details feedback-slide__details--${side}`}
    >
      {items.map((label, index) => (
        <motion.li
          animate={visible ? "visible" : "hidden"}
          className="feedback-slide__detail"
          initial={isAnimated && visible ? "hidden" : false}
          key={`${side}-${label}-${visible ? "visible" : "hidden"}`}
          transition={{
            opacity: {
              delay: visible ? delay + index * 0.12 : 0,
              duration: 0.3,
              ease: [0.22, 1, 0.36, 1],
            },
            x: {
              delay: visible ? delay + index * 0.12 : 0,
              duration: 0.34,
              ease: [0.22, 1, 0.36, 1],
            },
          }}
          variants={detailVariants}
        >
          <img
            alt=""
            aria-hidden="true"
            className="feedback-slide__detail-bullet"
            draggable={false}
            src={bulletUrl}
          />
          <span className="feedback-slide__detail-label">{label}</span>
        </motion.li>
      ))}
    </ul>
  );
}
