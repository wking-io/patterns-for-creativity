import { motion } from "motion/react";
import type { Transition, Variants } from "motion/react";
import exposureTextUrl from "../13-catalyst/exposure-text.svg";
import feedbackTextUrl from "../13-catalyst/feedback-text.svg";
import bulletUrl from "./bullet.svg";
import complaintsTextUrl from "./complaints-text.svg";
import exposureInnerUrl from "./exposure-inner.svg";
import feedbackInnerUrl from "./feedback-inner.svg";
import frameUrl from "./frame.svg";
import logsBugsTextUrl from "./logs-bugs-text.svg";
import metricsTextUrl from "./metrics-text.svg";
import peopleInnerUrl from "./people-inner.svg";
import peopleTextUrl from "./people-text.svg";
import requestsTextUrl from "./requests-text.svg";
import systemsInnerUrl from "./systems-inner.svg";
import systemsTextUrl from "./systems-text.svg";

export type FeedbackSlideVariant = "initial" | "people" | "complete";

type FeedbackSlideProps = {
  className?: string;
  isAnimated?: boolean;
  variant?: FeedbackSlideVariant;
};

const headerTransition: Transition = {
  duration: 0.62,
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

export function FeedbackSlide({
  className = "",
  isAnimated = true,
  variant = "initial",
}: FeedbackSlideProps) {
  const isExpanded = variant !== "initial";
  const isLeftVisible = variant === "people" || variant === "complete";
  const isRightVisible = variant === "complete";
  const isEntryMorph = isAnimated && variant === "initial";

  return (
    <div
      className={`feedback-slide ${className}`.trim()}
      data-feedback-variant={variant}
    >
      <FeedbackHeader
        iconUrl={peopleInnerUrl}
        isEntryMorph={isEntryMorph}
        isExpanded={isExpanded}
        label="People"
        labelUrl={peopleTextUrl}
        originIconUrl={feedbackInnerUrl}
        originLabel="Feedback"
        originLabelUrl={feedbackTextUrl}
        side="people"
      />
      <FeedbackHeader
        iconUrl={systemsInnerUrl}
        isEntryMorph={isEntryMorph}
        isExpanded={isExpanded}
        label="Systems"
        labelUrl={systemsTextUrl}
        originIconUrl={exposureInnerUrl}
        originLabel="Exposure"
        originLabelUrl={exposureTextUrl}
        side="systems"
      />

      <FeedbackDetail
        delay={0.56}
        label="Complaints"
        labelUrl={complaintsTextUrl}
        row="first"
        side="people"
        visible={isLeftVisible}
      />
      <FeedbackDetail
        delay={0.7}
        label="Requests"
        labelUrl={requestsTextUrl}
        row="second"
        side="people"
        visible={isLeftVisible}
      />
      <FeedbackDetail
        delay={0.18}
        label="Metrics"
        labelUrl={metricsTextUrl}
        row="first"
        side="systems"
        visible={isRightVisible}
      />
      <FeedbackDetail
        delay={0.34}
        label="Logs & Bugs"
        labelUrl={logsBugsTextUrl}
        row="second"
        side="systems"
        visible={isRightVisible}
      />
    </div>
  );
}

type FeedbackHeaderProps = {
  iconUrl: string;
  isEntryMorph: boolean;
  isExpanded: boolean;
  label: string;
  labelUrl: string;
  originIconUrl: string;
  originLabel: string;
  originLabelUrl: string;
  side: "people" | "systems";
};

function FeedbackHeader({
  iconUrl,
  isEntryMorph,
  isExpanded,
  label,
  labelUrl,
  originIconUrl,
  originLabel,
  originLabelUrl,
  side,
}: FeedbackHeaderProps) {
  const initialLeft = side === "people" ? "32.68%" : "67.05%";
  const originLeft = side === "people" ? "20.35%" : "80%";
  const expandedIconLeft = side === "people" ? "11.9%" : "58%";
  const expandedLabelLeft = side === "people" ? "25.33%" : "74.48%";
  const inwardOffset = side === "people" ? 24 : -24;
  const outwardOffset = -inwardOffset;

  return (
    <div className={`feedback-slide__header feedback-slide__header--${side}`}>
      <motion.div
        animate={isExpanded ? "expanded" : "initial"}
        aria-hidden="true"
        className="feedback-slide__header-icon"
        initial={isEntryMorph ? {
          left: originLeft,
          top: "35.8%",
          width: "7.06%",
        } : false}
        transition={headerTransition}
        variants={{
          expanded: {
            left: expandedIconLeft,
            top: "26.17%",
            width: "7.12%",
          },
          initial: {
            left: initialLeft,
            top: "35.8%",
            width: "7.12%",
          },
        }}
      >
        <img
          alt=""
          aria-hidden="true"
          className="feedback-slide__header-frame"
          draggable={false}
          src={frameUrl}
        />
        <motion.img
          alt=""
          animate={{ opacity: 1, x: 0 }}
          aria-hidden="true"
          className="feedback-slide__header-symbol"
          draggable={false}
          initial={isEntryMorph ? { opacity: 0, x: inwardOffset } : false}
          src={iconUrl}
          transition={{ delay: 0.14, duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
        />
        {isEntryMorph ? (
          <motion.img
            alt=""
            animate={{ opacity: 0, x: outwardOffset }}
            aria-hidden="true"
            className="feedback-slide__header-symbol"
            draggable={false}
            initial={{ opacity: 1, x: 0 }}
            src={originIconUrl}
            transition={{ delay: 0.14, duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
          />
        ) : null}
      </motion.div>
      <motion.div
        animate={{ opacity: 1, x: 0 }}
        className="feedback-slide__header-label-drift"
        initial={isEntryMorph ? { opacity: 0, x: inwardOffset } : false}
        transition={{ delay: 0.14, duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.img
          alt={label}
          animate={isExpanded ? "expanded" : "initial"}
          className="feedback-slide__header-label"
          draggable={false}
          initial={isEntryMorph ? { left: originLeft, top: "58%" } : false}
          src={labelUrl}
          transition={headerTransition}
          variants={{
            expanded: {
              left: expandedLabelLeft,
              top: "28.8%",
            },
            initial: {
              left: initialLeft,
              top: "58%",
            },
          }}
        />
      </motion.div>
      {isEntryMorph ? (
        <motion.div
          animate={{ opacity: 0, x: outwardOffset }}
          className="feedback-slide__header-label-drift"
          initial={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.14, duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.img
            alt={originLabel}
            animate={{ left: initialLeft, top: "58%" }}
            className={`feedback-slide__header-label feedback-slide__header-label--origin feedback-slide__header-label--origin-${side}`}
            draggable={false}
            initial={{ left: originLeft, top: "58%" }}
            src={originLabelUrl}
            transition={headerTransition}
          />
        </motion.div>
      ) : null}
    </div>
  );
}

type FeedbackDetailProps = {
  delay: number;
  label: string;
  labelUrl: string;
  row: "first" | "second";
  side: "people" | "systems";
  visible: boolean;
};

function FeedbackDetail({
  delay,
  label,
  labelUrl,
  row,
  side,
  visible,
}: FeedbackDetailProps) {
  return (
    <motion.div
      animate={visible ? "visible" : "hidden"}
      aria-hidden={!visible}
      className={[
        "feedback-slide__detail",
        `feedback-slide__detail--${side}`,
        `feedback-slide__detail--${row}`,
      ].join(" ")}
      initial="hidden"
      key={`${side}-${row}-${visible ? "visible" : "hidden"}`}
      transition={{
        opacity: {
          delay: visible ? delay : 0,
          duration: 0.3,
          ease: [0.22, 1, 0.36, 1],
        },
        x: {
          delay: visible ? delay : 0,
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
      <img
        alt={label}
        className="feedback-slide__detail-label"
        draggable={false}
        src={labelUrl}
      />
    </motion.div>
  );
}
