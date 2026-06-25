import { CloudCanvas } from "./cloud/CloudCanvas";
import titleUrl from "../title.svg";

export function CloudContourArtwork({ className = "" }: { className?: string }) {
  const titleMaskStyle = {
    WebkitMaskImage: `url(${titleUrl})`,
    maskImage: `url(${titleUrl})`,
  };

  return (
    <div className={`cloud-contour-stage ${className}`.trim()}>
      <CloudCanvas />
      <div
        aria-hidden="true"
        className="cloud-contour-title-layer cloud-contour-title-layer--burn"
        style={titleMaskStyle}
      />
      <div
        aria-hidden="true"
        className="cloud-contour-title-layer cloud-contour-title-layer--color"
        style={titleMaskStyle}
      />
      <div aria-hidden="true" className="cloud-contour-bottom-copy">
        <span>CAN DO YOUR JOB</span>
        <span>LARACON 2026</span>
      </div>
    </div>
  );
}

export function CloudContourPage() {
  return (
    <main className="cloud-contour-page">
      <CloudContourArtwork />
    </main>
  );
}
