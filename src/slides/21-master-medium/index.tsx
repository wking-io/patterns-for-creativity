import { useId } from "react";
import { StatementAxisSlide } from "../StatementAxisSlide";
import lineLeftUrl from "../20-ideas/line-left.svg";
import lineRightUrl from "../20-ideas/line-right.svg";
import worldSvgMarkup from "../20-ideas/world.svg?raw";

export { MasterMediumTeachSlide } from "./TeachSlide";
export { MasterMediumPrototypeSlide } from "./PrototypeSlide";
export { MasterMediumSideshowSlide } from "./SideshowSlide";
export { SynthDemoSlide } from "./SynthDemoSlide";

type MasterMediumSlideProps = {
  className?: string;
  isAnimated?: boolean;
};

const headline = "Creativity is capped by your ability to express it";

const worldPathData = worldSvgMarkup.match(/<path d="([^"]+)"/)?.[1] ?? "";
const worldPathParts = splitWorldPath(worldPathData);

export function MasterMediumSlide({
  className = "",
  isAnimated = true,
}: MasterMediumSlideProps) {
  return (
    <StatementAxisSlide
      className={[
        "ideas-slide",
        isAnimated ? "ideas-slide--animated" : "ideas-slide--static",
        "master-medium-slide",
        isAnimated ? "master-medium-slide--animated" : "master-medium-slide--static",
        className,
      ].join(" ").trim()}
      headline={headline}
      headlineShadow
      icon={<AnimatedWorld />}
      leftLabel="Mastery of"
      leftLineUrl={lineLeftUrl}
      rightLabel="your Medium"
      rightLineUrl={lineRightUrl}
    />
  );
}

function AnimatedWorld() {
  const maskPrefix = useId().replaceAll(":", "");
  const topMaskId = `${maskPrefix}-world-top`;
  const bottomMaskId = `${maskPrefix}-world-bottom`;

  return (
    <svg
      aria-hidden="true"
      className="master-medium-world"
      fill="none"
      viewBox="0 0 133 114"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <mask
          height="114"
          id={topMaskId}
          maskUnits="userSpaceOnUse"
          width="133"
          x="0"
          y="0"
        >
          <rect fill="black" height="114" width="133" />
          <path d={worldPathParts.topOutline} fill="white" />
          <g className="master-medium-world__meridians master-medium-world__meridians--top">
            <path d={worldPathParts.topMeridians} fill="black" />
          </g>
        </mask>

        <mask
          height="114"
          id={bottomMaskId}
          maskUnits="userSpaceOnUse"
          width="133"
          x="0"
          y="0"
        >
          <rect fill="black" height="114" width="133" />
          <path d={worldPathParts.bottomOutline} fill="white" />
          <g className="master-medium-world__meridians master-medium-world__meridians--bottom">
            <path d={worldPathParts.bottomMeridians} fill="black" />
          </g>
        </mask>
      </defs>

      <rect
        fill="currentColor"
        height="114"
        mask={`url(#${topMaskId})`}
        width="133"
      />

      <path d={worldPathParts.center} fill="currentColor" />

      <rect
        fill="currentColor"
        height="114"
        mask={`url(#${bottomMaskId})`}
        width="133"
      />
    </svg>
  );
}

function splitWorldPath(pathData: string) {
  const middleMarker = "M68.0488 39.9414";
  const topMarker = "M66.0498 0C";
  const middleIndex = pathData.indexOf(middleMarker);
  const topIndex = pathData.indexOf(topMarker);

  if (middleIndex < 0 || topIndex < 0 || topIndex <= middleIndex) {
    return {
      bottomMeridians: "",
      bottomOutline: "",
      center: pathData,
      topMeridians: "",
      topOutline: "",
    };
  }

  const bottom = splitHemisphere(pathData.slice(0, middleIndex));
  const top = splitHemisphere(pathData.slice(topIndex));

  return {
    bottomMeridians: bottom.meridians,
    bottomOutline: bottom.outline,
    center: pathData.slice(middleIndex, topIndex),
    topMeridians: top.meridians,
    topOutline: top.outline,
  };
}

function splitHemisphere(pathData: string) {
  const outlineEnd = pathData.indexOf("Z") + 1;

  if (outlineEnd <= 0) {
    return { meridians: "", outline: pathData };
  }

  return {
    meridians: pathData.slice(outlineEnd),
    outline: pathData.slice(0, outlineEnd),
  };
}
