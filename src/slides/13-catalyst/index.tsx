import exposureTextUrl from "./exposure-text.svg";
import exposureUrl from "./exposure.svg";
import feedbackTextUrl from "./feedback-text.svg";
import feedbackUrl from "./feedback.svg";
import frictionTextUrl from "./friction-text.svg";
import frictionUrl from "./friction.svg";

type CatalystSlideProps = {
  className?: string;
};

const catalysts = [
  {
    id: "feedback",
    iconUrl: feedbackUrl,
    label: "Feedback",
    labelUrl: feedbackTextUrl,
  },
  {
    id: "friction",
    iconUrl: frictionUrl,
    label: "Friction",
    labelUrl: frictionTextUrl,
  },
  {
    id: "exposure",
    iconUrl: exposureUrl,
    label: "Exposure",
    labelUrl: exposureTextUrl,
  },
] as const;

export function CatalystSlide({ className = "" }: CatalystSlideProps) {
  return (
    <div className={`catalyst-slide ${className}`.trim()}>
      {catalysts.map(({ id, iconUrl, label, labelUrl }) => (
        <div
          className={`catalyst-slide__item catalyst-slide__item--${id}`}
          key={id}
        >
          <img
            alt=""
            aria-hidden="true"
            className="catalyst-slide__icon"
            draggable={false}
            src={iconUrl}
          />
          <img
            alt={label}
            className="catalyst-slide__label"
            draggable={false}
            src={labelUrl}
          />
        </div>
      ))}
    </div>
  );
}
