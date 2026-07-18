import type { ReactNode } from "react";

type StatementAxisSlideProps = {
  className?: string;
  headline: string;
  headlineShadow?: boolean;
  icon: ReactNode;
  leftLabel: string;
  leftLineUrl: string;
  rightLabel: string;
  rightLineUrl: string;
};

export function StatementAxisSlide({
  className = "",
  headline,
  headlineShadow = false,
  icon,
  leftLabel,
  leftLineUrl,
  rightLabel,
  rightLineUrl,
}: StatementAxisSlideProps) {
  return (
    <div
      aria-label={headline}
      className={`statement-axis-slide ${className}`.trim()}
      role="img"
    >
      {headlineShadow ? (
        <p
          aria-hidden="true"
          className="statement-axis-slide__headline statement-axis-slide__headline--shadow"
        >
          {headline}
        </p>
      ) : null}
      <p className="statement-axis-slide__headline">{headline}</p>

      <div aria-hidden="true" className="statement-axis-slide__axis">
        <p className="statement-axis-slide__axis-label statement-axis-slide__axis-label--left">
          {leftLabel}
        </p>
        <img
          alt=""
          className="statement-axis-slide__axis-line statement-axis-slide__axis-line--left"
          draggable={false}
          src={leftLineUrl}
        />
        <div className="statement-axis-slide__icon">{icon}</div>
        <img
          alt=""
          className="statement-axis-slide__axis-line statement-axis-slide__axis-line--right"
          draggable={false}
          src={rightLineUrl}
        />
        <p className="statement-axis-slide__axis-label statement-axis-slide__axis-label--right">
          {rightLabel}
        </p>
      </div>
    </div>
  );
}
