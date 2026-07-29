import colorBurnTextureUrl from "../../filter-randomized-color-burn.webp";
import softLightTextureUrl from "../../filter-randomized-soft-light.webp";

export type SlideKind =
  | "cover"
  | "contained-dark"
  | "contained-light"
  | "contained-gradient"
  | "constrained-dark"
  | "constrained-gradient"
  | "full-dark"
  | "full-gradient"
  | "page"
  | "collage";

export function TitleSlideFooter() {
  return (
    <div aria-hidden="true" className="title-slide-footer">
      <span>CAN DO YOUR JOB</span>
      <span>LARACON 2026</span>
    </div>
  );
}

export function SlideGridOverlay({ enabled }: { enabled: boolean }) {
  if (!enabled) {
    return null;
  }

  return (
    <div aria-hidden="true" className="slide-grid-overlay">
      <div className="slide-grid-overlay__columns">
        {Array.from({ length: 6 }, (_, index) => (
          <span key={index} />
        ))}
      </div>
      <div className="slide-grid-overlay__rows">
        {Array.from({ length: 6 }, (_, index) => (
          <span key={index} />
        ))}
      </div>
    </div>
  );
}

export function SlideTextureOverlay() {
  return (
    <>
      <img alt="" aria-hidden="true" className="slide-texture-overlay slide-texture-overlay--color-burn" src={colorBurnTextureUrl} />
      <img alt="" aria-hidden="true" className="slide-texture-overlay slide-texture-overlay--soft-light" src={softLightTextureUrl} />
    </>
  );
}
