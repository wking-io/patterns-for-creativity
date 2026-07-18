import cognitiveUrl from "./cognitive.svg";
import complexityUrl from "./complexity.svg";
import emotionalUrl from "./emotional.svg";
import incentiveUrl from "./incentive.svg";
import languageUrl from "./language.svg";
import misdirectionUrl from "./misdirection.svg";
import repetitionUrl from "./repitition.svg";
import trustUrl from "./trust.svg";
import valueUrl from "./value.svg";

export type FrictionSlideVariant = "common" | "complex";

type FrictionSlideProps = {
  className?: string;
  variant?: FrictionSlideVariant;
};

const commonFriction = [
  { id: "complexity", iconUrl: complexityUrl, label: "Complexity" },
  { id: "repetition", iconUrl: repetitionUrl, label: "Repetition" },
  { id: "misdirection", iconUrl: misdirectionUrl, label: "Misdirection" },
] as const;

const complexFriction = [
  { column: "left", iconUrl: cognitiveUrl, id: "cognitive", label: "Cognitive", row: "top" },
  { column: "right", iconUrl: emotionalUrl, id: "emotional", label: "Emotional", row: "top" },
  { column: "left", iconUrl: incentiveUrl, id: "incentive", label: "Incentive", row: "middle" },
  { column: "right", iconUrl: valueUrl, id: "value", label: "Value", row: "middle" },
  { column: "left", iconUrl: trustUrl, id: "trust", label: "Trust", row: "bottom" },
  { column: "right", iconUrl: languageUrl, id: "language", label: "Language", row: "bottom" },
] as const;

export function FrictionSlide({
  className = "",
  variant = "common",
}: FrictionSlideProps) {
  const items = variant === "complex" ? complexFriction : commonFriction;

  return (
    <div
      className={`friction-slide friction-slide--${variant} ${className}`.trim()}
    >
      {items.map((item) => (
        <div
          className={[
            "friction-slide__item",
            `friction-slide__item--${item.id}`,
            "column" in item ? `friction-slide__item--column-${item.column}` : "",
            "row" in item ? `friction-slide__item--row-${item.row}` : "",
          ].join(" ")}
          key={item.id}
        >
          <img
            alt=""
            aria-hidden="true"
            className="friction-slide__icon"
            draggable={false}
            src={item.iconUrl}
          />
          <p className="friction-slide__label">{item.label}</p>
        </div>
      ))}
    </div>
  );
}
