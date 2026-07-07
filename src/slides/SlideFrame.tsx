import type { ReactNode } from "react";
import filterTextureUrl from "../../filter.png";

export type SlideKind = "cover" | "contained-dark" | "contained-light" | "contained-gradient" | "collage";

type SlideFrameProps = {
  children: ReactNode;
  isGridVisible?: boolean;
  kind: SlideKind;
};

export function SlideFrame({ children, isGridVisible = false, kind }: SlideFrameProps) {
  if (kind === "cover" || kind === "collage") {
    return (
      <section className="slide-frame bg-light-s0 text-light-t0">
        <div className="slide-panel slide-panel--cover">
          {children}
        </div>
        <TitleSlideFooter />
        <SlideTextureOverlay />
        <SlideGridOverlay enabled={isGridVisible} />
      </section>
    );
  }

  if (kind === "contained-dark" || kind === "contained-light") {
    const isContainedLight = kind === "contained-light";

    return (
      <section className={`slide-frame ${isContainedLight ? "slide-frame--contained-light" : "bg-light-s0"}`}>
        <div className={`slide-panel ${isContainedLight ? "slide-panel--contained-light" : "slide-panel--contained"}`}>
          {children}
        </div>
        <SlideTextureOverlay />
        <SlideGridOverlay enabled={isGridVisible} />
      </section>
    );
  }

  return (
    <section className="slide-frame">
      {children}
    </section>
  );
}

export function TitleSlideFooter() {
  return (
    <div aria-hidden="true" className="title-slide-footer">
      <span>CAN DO YOUR JOB</span>
      <span>LARACON 2026</span>
    </div>
  );
}

function SlideGridOverlay({ enabled }: { enabled: boolean }) {
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
      <img alt="" aria-hidden="true" className="slide-texture-overlay slide-texture-overlay--color-burn" src={filterTextureUrl} />
      <img alt="" aria-hidden="true" className="slide-texture-overlay slide-texture-overlay--soft-light" src={filterTextureUrl} />
    </>
  );
}
