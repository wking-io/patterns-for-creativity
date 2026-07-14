import nopeForegroundUrl from "./nope-fg.svg";
import nopeOverlayUrl from "./nope.svg";

type NopeSlideProps = {
  className?: string;
};

export function NopeSlide({ className = "" }: NopeSlideProps) {
  return (
    <div className={`nope-slide ${className}`.trim()}>
      <img
        alt=""
        aria-hidden="true"
        className="nope-slide__overlay"
        draggable={false}
        src={nopeOverlayUrl}
      />
      <img
        alt=""
        aria-hidden="true"
        className="nope-slide__foreground"
        draggable={false}
        src={nopeForegroundUrl}
      />
    </div>
  );
}
