import calVideoUrl from "./cal.webm";
import leftQuoteUrl from "./left-quote.svg";
import mattTweetUrl from "./matt-tweet.webp";
import rightQuoteUrl from "./right-quote.svg";
import thorstenProfileUrl from "./thorsten-pfp.webp";

type BuildingSoftwareLearningSlideProps = {
  className?: string;
};

export function BuildingSoftwareLearningSlide({
  className = "",
}: BuildingSoftwareLearningSlideProps) {
  return (
    <div className={`building-software-learning-slide ${className}`.trim()}>
      <div className="building-software-learning-slide__headline">
        <div className="building-software-learning-slide__title building-software-learning-slide__title--shadow">
          <span>Building Software</span>
          <span>Is Learning</span>
        </div>
        <div className="building-software-learning-slide__title building-software-learning-slide__title--front">
          <span>Building Software</span>
          <span>Is Learning</span>
        </div>
      </div>

      <div className="building-software-learning-slide__byline">
        <img
          alt=""
          aria-hidden="true"
          className="building-software-learning-slide__portrait"
          draggable={false}
          src={thorstenProfileUrl}
        />
        <span>Thorsten Ball</span>
      </div>
    </div>
  );
}

export type BuildingSoftwareQuoteVariant = "quote-1" | "quote-2";

const buildingSoftwareQuotes: Record<BuildingSoftwareQuoteVariant, string[]> = {
  "quote-1": [
    "there is no way...absolutely zero chance",
    "you can build something new and avoid",
    "bumping into “that’s not what I meant”",
  ],
  "quote-2": [
    "embrace that we need to play around with",
    "ideas as fast as possible, in a way that lets",
    "us learn what it is we are building.",
  ],
};

export function BuildingSoftwareQuoteSlide({
  className = "",
  variant,
}: {
  className?: string;
  variant: BuildingSoftwareQuoteVariant;
}) {
  return (
    <figure
      className={`building-software-quote-slide building-software-quote-slide--${variant} ${className}`.trim()}
    >
      <img
        alt=""
        aria-hidden="true"
        className="building-software-quote-slide__mark building-software-quote-slide__mark--left"
        draggable={false}
        src={leftQuoteUrl}
      />
      <blockquote className="building-software-quote-slide__copy">
        {buildingSoftwareQuotes[variant].map((line) => (
          <span key={line}>{line}</span>
        ))}
      </blockquote>
      <img
        alt=""
        aria-hidden="true"
        className="building-software-quote-slide__mark building-software-quote-slide__mark--right"
        draggable={false}
        src={rightQuoteUrl}
      />
    </figure>
  );
}

export function MattTweetSlide({ className = "" }: { className?: string }) {
  return (
    <div className={`output-not-artifacts-tweet-slide ${className}`.trim()}>
      <img
        alt="Matt Wensing describing a four-step good idea generator"
        className="output-not-artifacts-tweet-slide__image"
        draggable={false}
        src={mattTweetUrl}
      />
    </div>
  );
}

type CalVideoSlideProps = {
  className?: string;
  shouldPlay?: boolean;
};

export function CalVideoSlide({
  className = "",
  shouldPlay = true,
}: CalVideoSlideProps) {
  return (
    <div className={`cal-video-slide ${className}`.trim()}>
      <video
        aria-label="Cal product demonstration"
        autoPlay={shouldPlay}
        className="cal-video-slide__video"
        disablePictureInPicture
        loop
        muted
        playsInline
        preload="auto"
        src={calVideoUrl}
      />
    </div>
  );
}
