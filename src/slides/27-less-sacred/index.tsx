import { motion } from "motion/react";
import eight1Markup from "./8-1.svg?raw";
import eight2Markup from "./8-2.svg?raw";
import eight3Markup from "./8-3.svg?raw";
import eight4Markup from "./8-4.svg?raw";
import eight5Markup from "./8-5.svg?raw";
import eight6Markup from "./8-6.svg?raw";
import eight7Markup from "./8-7.svg?raw";
import eight8Markup from "./8-8.svg?raw";
import artificialConstraintsMarkup from "./artificial-contraints.svg?raw";
import forcedConnectionsMarkup from "./forced-connections.svg?raw";
import gangPromptUrl from "./gangprompt.webp";
import paperVideoUrl from "./paper.mp4";
import paperUrl from "./paper.svg";
import quickVideoUrl from "./quick.mp4";
import smithDictionUrl from "./smith-diction.webp";

type LessSacredPaperSlideProps = {
  className?: string;
  isAnimated?: boolean;
  shouldPlay?: boolean;
  showVideo?: boolean;
};

const paperRevealEase = [0.16, 1, 0.3, 1] as const;

export function LessSacredPaperSlide({
  className = "",
  isAnimated = true,
  shouldPlay = true,
  showVideo = false,
}: LessSacredPaperSlideProps) {
  return (
    <div className={`less-sacred-paper-slide ${className}`.trim()}>
      <img
        alt="Paper"
        className="less-sacred-paper-slide__mark"
        draggable={false}
        src={paperUrl}
      />

      {showVideo ? (
        <div className="less-sacred-paper-slide__video-position">
          <motion.div
            animate={{ opacity: 1, scale: 1 }}
            className="less-sacred-paper-slide__video-frame"
            initial={isAnimated ? { opacity: 0, scale: 0.88 } : false}
            transition={{
              delay: 0.06,
              duration: 0.21,
              ease: paperRevealEase,
            }}
          >
            <video
              aria-label="Paper design exploration demonstration"
              autoPlay={shouldPlay}
              className="less-sacred-paper-slide__video"
              disablePictureInPicture
              loop
              muted
              playsInline
              preload="auto"
              src={paperVideoUrl}
            />
          </motion.div>
        </div>
      ) : null}
    </div>
  );
}

type LessSacredEightPatternsSlideProps = {
  className?: string;
};

const darkBackground = /<rect[^>]*fill="#1D1816"[^>]*\/>/;
const patternMarkups = [
  eight1Markup,
  eight2Markup,
  eight3Markup,
  eight4Markup,
  eight5Markup,
  eight6Markup,
  eight7Markup,
  eight8Markup,
].map((markup) => markup.replace(darkBackground, ""));

export function LessSacredEightPatternsSlide({
  className = "",
}: LessSacredEightPatternsSlideProps) {
  return (
    <div
      aria-label="Eight visual constraint patterns"
      className={`less-sacred-eight-patterns-slide ${className}`.trim()}
      role="img"
    >
      <div aria-hidden="true" className="less-sacred-eight-patterns-slide__grid">
        {patternMarkups.map((markup, index) => (
          <div className="less-sacred-eight-patterns-slide__tile" key={index}>
            <span className="less-sacred-eight-patterns-slide__tile-background" />
            <span
              className="less-sacred-eight-patterns-slide__pattern"
              dangerouslySetInnerHTML={{ __html: markup }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

type LessSacredConstraintsSlideProps = {
  className?: string;
};

const constraintPatterns = [
  {
    iconMarkup: artificialConstraintsMarkup,
    label: "Artificial Constraints",
  },
  {
    iconMarkup: forcedConnectionsMarkup,
    label: "Forced Connections",
  },
] as const;

export function LessSacredConstraintsSlide({
  className = "",
}: LessSacredConstraintsSlideProps) {
  return (
    <div
      aria-label="Artificial Constraints and Forced Connections"
      className={`less-sacred-constraints-slide ${className}`.trim()}
    >
      <div className="less-sacred-constraints-slide__list">
        {constraintPatterns.map(({ iconMarkup, label }) => (
          <div className="less-sacred-constraints-slide__item" key={label}>
            <span
              aria-hidden="true"
              className="less-sacred-constraints-slide__icon"
              dangerouslySetInnerHTML={{ __html: iconMarkup }}
            />
            <p className="less-sacred-constraints-slide__label">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

type LessSacredQuickVideoSlideProps = {
  className?: string;
  shouldPlay?: boolean;
};

export function LessSacredQuickVideoSlide({
  className = "",
  shouldPlay = true,
}: LessSacredQuickVideoSlideProps) {
  return (
    <div className={`less-sacred-quick-video-slide ${className}`.trim()}>
      <video
        aria-label="Quick creative constraint demonstration"
        autoPlay={shouldPlay}
        className="less-sacred-quick-video-slide__video"
        disablePictureInPicture
        loop
        muted
        playsInline
        preload="auto"
        src={quickVideoUrl}
      />
    </div>
  );
}

type LessSacredSmithDictionSlideProps = {
  className?: string;
};

export function LessSacredSmithDictionSlide({
  className = "",
}: LessSacredSmithDictionSlideProps) {
  return (
    <div
      className={`less-sacred-smith-diction-slide ${className}`.trim()}
    >
      <img
        alt="A presentation showing a large digital design canvas"
        className="less-sacred-smith-diction-slide__image"
        draggable={false}
        src={smithDictionUrl}
      />
    </div>
  );
}

export function LessSacredGangPromptSlide({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      className={`language-tweet-slide less-sacred-gangprompt-slide ${className}`.trim()}
    >
      <img
        alt="Dax describing collaborative gangprompting with AI"
        className="gangprompting-tweet-slide__image"
        draggable={false}
        src={gangPromptUrl}
      />
    </div>
  );
}
