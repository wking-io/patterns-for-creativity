import { CloudCanvas } from "../../cloud/CloudCanvas";
import titleUrl from "./title.svg";

export function TitleSlide({ className = "" }: { className?: string }) {
  const titleMaskStyle = {
    WebkitMaskImage: `url(${titleUrl})`,
    maskImage: `url(${titleUrl})`,
  };

  return (
    <div className={`${className}`.trim()}>
      <CloudCanvas className="h-full w-full absolute inset-0 z-0" />
      <div
        aria-hidden="true"
        className="cloud-contour-title-layer bg-dark-s0 mix-blend-color-burn"
        style={titleMaskStyle}
      />
      <div
        aria-hidden="true"
        className="cloud-contour-title-layer bg-p0 mix-blend-color"
        style={titleMaskStyle}
      />
    </div>
  );
}
