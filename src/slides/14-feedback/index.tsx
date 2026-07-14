import { motion } from "motion/react";
import type { Transition, Variants } from "motion/react";
import bulletUrl from "./bullet.svg";
import complaintsTextUrl from "./complaints-text.svg";
import logsBugsTextUrl from "./logs-bugs-text.svg";
import metricsTextUrl from "./metrics-text.svg";
import peopleTextUrl from "./people-text.svg";
import peopleUrl from "./people.svg";
import requestsTextUrl from "./requests-text.svg";
import systemsTextUrl from "./systems-text.svg";
import systemsUrl from "./systems.svg";

export type FeedbackSlideVariant = "initial" | "people" | "complete";

type FeedbackSlideProps = {
  className?: string;
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
  variant = "initial",
}: FeedbackSlideProps) {
  const isExpanded = variant !== "initial";
  const isLeftVisible = variant === "people" || variant === "complete";
  const isRightVisible = variant === "complete";

  return (
    <div
      className={`feedback-slide ${className}`.trim()}
      data-feedback-variant={variant}
    >
      <FeedbackHeader
        iconUrl={peopleUrl}
        isExpanded={isExpanded}
        label="People"
        labelUrl={peopleTextUrl}
        side="people"
      />
      <FeedbackHeader
        iconUrl={systemsUrl}
        isExpanded={isExpanded}
        label="Systems"
        labelUrl={systemsTextUrl}
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
        delay={0.08}
        label="Metrics"
        labelUrl={metricsTextUrl}
        row="first"
        side="systems"
        visible={isRightVisible}
      />
      <FeedbackDetail
        delay={0.22}
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
  isExpanded: boolean;
  label: string;
  labelUrl: string;
  side: "people" | "systems";
};

function FeedbackHeader({
  iconUrl,
  isExpanded,
  label,
  labelUrl,
  side,
}: FeedbackHeaderProps) {
  return (
    <div className={`feedback-slide__header feedback-slide__header--${side}`}>
      <motion.img
        alt=""
        animate={isExpanded ? "expanded" : "initial"}
        aria-hidden="true"
        className="feedback-slide__header-icon"
        draggable={false}
        initial={false}
        src={iconUrl}
        transition={headerTransition}
        variants={{
          expanded: {
            left: side === "people" ? "11.9%" : "58%",
            top: "26.17%",
          },
          initial: {
            left: side === "people" ? "32.68%" : "67.05%",
            top: "35.8%",
          },
        }}
      />
      <motion.img
        alt={label}
        animate={isExpanded ? "expanded" : "initial"}
        className="feedback-slide__header-label"
        draggable={false}
        initial={false}
        src={labelUrl}
        transition={headerTransition}
        variants={{
          expanded: {
            left: side === "people" ? "25.33%" : "74.48%",
            top: "28.8%",
          },
          initial: {
            left: side === "people" ? "32.68%" : "67.05%",
            top: "58%",
          },
        }}
      />
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
      initial={false}
      transition={{
        delay: visible ? delay : 0,
        duration: 0.34,
        ease: [0.22, 1, 0.36, 1],
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
