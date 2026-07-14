import magicVideoUrl from "./magic.webm";

type MagicSlideProps = {
  className?: string;
  isAnimated?: boolean;
};

export function MagicSlide({ className = "", isAnimated = true }: MagicSlideProps) {
  return (
    <div className={`magic-slide ${className}`.trim()}>
      <video
        aria-label="Magic animation"
        autoPlay={isAnimated}
        className="magic-slide__video"
        disablePictureInPicture
        muted
        playsInline
        preload="auto"
        src={magicVideoUrl}
      />
    </div>
  );
}
