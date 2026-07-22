import magicVideoUrl from "./magic.webm";

type MagicSlideProps = {
  className?: string;
  isAnimated?: boolean;
  onReady?: () => void;
};

export function MagicSlide({
  className = "",
  isAnimated = true,
  onReady,
}: MagicSlideProps) {
  return (
    <div className={`magic-slide ${className}`.trim()}>
      <video
        aria-label="Magic animation"
        autoPlay={isAnimated}
        className="magic-slide__video"
        disablePictureInPicture
        muted
        onLoadedData={onReady}
        playsInline
        preload="auto"
        src={magicVideoUrl}
      />
    </div>
  );
}
