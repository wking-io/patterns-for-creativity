import bezierVideoUrl from "./bezier.mp4";
import lochieVideoUrl from "./lochie.mp4";
import lochieTweetUrl from "./lochie.webp";
import riddVideoUrl from "./ridd.mp4";
import riddTweetUrl from "./ridd.webp";

export type ShortenLoopPairedMediaVariant = "ridd" | "lochie";

const pairedMedia = {
  ridd: {
    alt: "Ridd describing a workflow for editing an HTML prototype and sending changes back to Claude",
    label: "Ridd workflow demonstration",
    tweet: riddTweetUrl,
    video: riddVideoUrl,
  },
  lochie: {
    alt: "Lochie describing a workflow for finding performance issues and sending them back to Claude",
    label: "Lochie performance workflow demonstration",
    tweet: lochieTweetUrl,
    video: lochieVideoUrl,
  },
} as const;

type ShortenLoopBezierSlideProps = {
  className?: string;
  shouldPlay?: boolean;
};

export function ShortenLoopBezierSlide({
  className = "",
  shouldPlay = true,
}: ShortenLoopBezierSlideProps) {
  return (
    <div className={`cal-video-slide ${className}`.trim()}>
      <video
        aria-label="Bezier curve tool demonstration"
        autoPlay={shouldPlay}
        className="cal-video-slide__video"
        disablePictureInPicture
        loop
        muted
        playsInline
        preload="auto"
        src={bezierVideoUrl}
      />
    </div>
  );
}

type ShortenLoopPairedMediaSlideProps = {
  className?: string;
  shouldPlay?: boolean;
  variant: ShortenLoopPairedMediaVariant;
};

export function ShortenLoopPairedMediaSlide({
  className = "",
  shouldPlay = true,
  variant,
}: ShortenLoopPairedMediaSlideProps) {
  const media = pairedMedia[variant];

  return (
    <div
      className={`shorten-loop-paired-media-slide shorten-loop-paired-media-slide--${variant} ${className}`.trim()}
    >
      <div className="shorten-loop-paired-media-slide__zone shorten-loop-paired-media-slide__zone--tweet">
        <img
          alt={media.alt}
          className="shorten-loop-paired-media-slide__tweet"
          draggable={false}
          src={media.tweet}
        />
      </div>
      <div className="shorten-loop-paired-media-slide__zone shorten-loop-paired-media-slide__zone--video">
        <video
          aria-label={media.label}
          autoPlay={shouldPlay}
          className="shorten-loop-paired-media-slide__video"
          disablePictureInPicture
          loop
          muted
          playsInline
          preload="auto"
          src={media.video}
        />
      </div>
    </div>
  );
}
