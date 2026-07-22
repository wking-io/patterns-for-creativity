import crosshairUrl from "../15-feedback-practice/crosshair.svg";

type ConclusionCanAiSlideProps = {
  className?: string;
};

const crosshairPositions = [
  "top-left",
  "top-right",
  "bottom-left",
  "bottom-right",
] as const;

export function ConclusionCanAiSlide({
  className = "",
}: ConclusionCanAiSlideProps) {
  return (
    <div className={`conclusion-can-ai-slide ${className}`.trim()}>
      <h1 className="conclusion-can-ai-slide__headline">
        Can AI do your job?
      </h1>

      {crosshairPositions.map((position) => (
        <img
          alt=""
          aria-hidden="true"
          className={`conclusion-can-ai-slide__crosshair conclusion-can-ai-slide__crosshair--${position}`}
          draggable={false}
          key={position}
          src={crosshairUrl}
        />
      ))}
    </div>
  );
}
