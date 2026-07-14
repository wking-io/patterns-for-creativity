import creativityBackgroundUrl from "./creativity-bg.svg";
import creativityForegroundUrl from "./creativity-fg.svg";

type CreativitySlideProps = {
  className?: string;
  isAnimated?: boolean;
};

export function CreativitySlide({
  className = "",
  isAnimated = false,
}: CreativitySlideProps) {
  return (
    <div
      className={[
        "creativity-slide",
        isAnimated ? "creativity-slide--enter" : "",
        className,
      ].join(" ").trim()}
    >
      <img
        alt=""
        aria-hidden="true"
        className="creativity-slide__asset creativity-slide__asset--background"
        draggable={false}
        src={creativityBackgroundUrl}
      />
      <img
        alt=""
        aria-hidden="true"
        className="creativity-slide__asset creativity-slide__asset--foreground"
        draggable={false}
        src={creativityForegroundUrl}
      />
    </div>
  );
}
