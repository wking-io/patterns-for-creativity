import rhythmBackgroundSvg from "./rhythm-bg.svg?raw";
import rhythmForegroundUrl from "./rhythm-fg.svg";
import rhythmOutlineUrl from "./rhythm-outline.svg";

type RhythmSlideProps = {
  className?: string;
};

export function RhythmSlide({ className = "" }: RhythmSlideProps) {
  return (
    <div
      aria-label="Rhythm"
      className={`rhythm-slide ${className}`.trim()}
      role="img"
    >
      <div
        aria-hidden="true"
        className="rhythm-slide__word rhythm-slide__word--background"
        dangerouslySetInnerHTML={{ __html: rhythmBackgroundSvg }}
      />
      <img
        alt=""
        aria-hidden="true"
        className="rhythm-slide__word rhythm-slide__word--foreground"
        draggable={false}
        src={rhythmForegroundUrl}
      />
      <img
        alt=""
        aria-hidden="true"
        className="rhythm-slide__word rhythm-slide__word--outline"
        draggable={false}
        src={rhythmOutlineUrl}
      />
    </div>
  );
}
