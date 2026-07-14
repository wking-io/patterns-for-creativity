import designBackgroundUrl from "./design-bg.svg";
import designBorderUrl from "./design-border.svg";
import designForegroundUrl from "./design-fg.svg";
import bombVideoUrl from "./bomb.webm";

type DesignSlideProps = {
  className?: string;
};

type DesignBombVideoProps = {
  onAnimationComplete?: () => void;
};

export function DesignSlide({ className = "" }: DesignSlideProps) {
  return (
    <div className={`design-slide ${className}`.trim()}>
      <img
        alt=""
        aria-hidden="true"
        className="design-slide__asset design-slide__asset--background"
        draggable={false}
        src={designBackgroundUrl}
      />
      <img
        alt=""
        aria-hidden="true"
        className="design-slide__asset design-slide__asset--border"
        draggable={false}
        src={designBorderUrl}
      />
      <img
        alt=""
        aria-hidden="true"
        className="design-slide__asset design-slide__asset--foreground"
        draggable={false}
        src={designForegroundUrl}
      />
    </div>
  );
}

export function DesignBombVideo({ onAnimationComplete }: DesignBombVideoProps) {
  return (
    <div className="design-slide__video-canvas">
      <video
        aria-label="Animated bomb bouncing and exploding"
        autoPlay
        className="design-slide__video"
        disablePictureInPicture
        muted
        onEnded={onAnimationComplete}
        playsInline
        preload="auto"
        src={bombVideoUrl}
      />
    </div>
  );
}
