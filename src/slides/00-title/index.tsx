import { CloudCanvas } from "../../cloud/CloudCanvas";
import titleUrl from "./title.svg";

export function TitleSlide({
  className = "",
  isAnimated = true,
}: {
  className?: string;
  isAnimated?: boolean;
}) {
  const titleMaskStyle = {
    WebkitMaskImage: `url(${titleUrl})`,
    maskImage: `url(${titleUrl})`,
  };

  return (
    <div className={`${className}`.trim()}>
      {isAnimated ? (
        <>
          <CloudCanvas className="h-full w-full absolute inset-0 z-0" />
          <div
            aria-hidden="true"
            className="cloud-contour-title-layer bg-dark-s0 mix-blend-color-burn"
            style={titleMaskStyle}
          />
          <div
            aria-hidden="true"
            className="cloud-contour-title-layer bg-p1 mix-blend-color-burn"
            style={titleMaskStyle}
          />
        </>
      ) : (
        <img
          alt=""
          aria-hidden="true"
          className="title-slide-static-artwork"
          draggable={false}
          src={titleUrl}
        />
      )}
    </div>
  );
}
