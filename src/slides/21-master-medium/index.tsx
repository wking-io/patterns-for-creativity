import { useReducedMotion } from "motion/react";
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
      icon={<AnimatedWorld isAnimated={isAnimated} />}
      leftLabel="Mastery of"
      leftLineUrl={lineLeftUrl}
      rightLabel="your Medium"
      rightLineUrl={lineRightUrl}
    />
  );
}

type AnimatedWorldProps = {
  isAnimated: boolean;
};

const meridianDurationSeconds = 4;
const meridianCount = 5;

const topMeridianFrames = [
  "M1 30.5C13 16 37 4 66.05 1",
  "M34 32.5C41 17 52 6 66.05 1",
  "M66.05 34C66.05 20 66.05 7 66.05 1",
  "M99 32.5C92 17 80 6 66.05 1",
  "M132 30.5C120 16 96 4 66.05 1",
];

const bottomMeridianFrames = [
  "M1 83.5C13 98 37 110 66.05 113",
  "M34 81.5C41 97 52 108 66.05 113",
  "M66.05 80C66.05 94 66.05 107 66.05 113",
  "M99 81.5C92 97 80 108 66.05 113",
  "M132 83.5C120 98 96 110 66.05 113",
];

const staticTopMeridians = [
  "M17 31.5C28 16 44 5 66.05 1",
  "M42 33C48 18 56 7 66.05 1",
  topMeridianFrames[2],
  "M90 33C84 18 76 7 66.05 1",
  "M116 31.5C105 16 88 5 66.05 1",
];

const staticBottomMeridians = [
  "M17 82.5C28 98 44 109 66.05 113",
  "M42 81C48 96 56 107 66.05 113",
  bottomMeridianFrames[2],
  "M90 81C84 96 76 107 66.05 113",
  "M116 82.5C105 98 88 109 66.05 113",
];

function AnimatedWorld({ isAnimated }: AnimatedWorldProps) {
  const prefersReducedMotion = useReducedMotion();
  const clipPrefix = useId().replaceAll(":", "");
  const topClipId = `${clipPrefix}-world-top`;
  const bottomClipId = `${clipPrefix}-world-bottom`;
  const shouldAnimate = isAnimated && !prefersReducedMotion;

  return (
    <svg
      aria-hidden="true"
      className="master-medium-world"
      fill="none"
      viewBox="0 0 133 114"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <clipPath id={topClipId}>
          <path d={worldPathParts.topOutline} />
        </clipPath>
        <clipPath id={bottomClipId}>
          <path d={worldPathParts.bottomOutline} />
        </clipPath>
      </defs>

      <g clipPath={`url(#${topClipId})`}>
        <RevolvingMeridians
          animationFrames={topMeridianFrames}
          isAnimated={shouldAnimate}
          staticPaths={staticTopMeridians}
        />
      </g>
      <path
        className="master-medium-world__hemisphere"
        d={worldPathParts.topOutline}
      />

      <path
        className="master-medium-world__center"
        d={worldPathParts.center}
      />

      <g clipPath={`url(#${bottomClipId})`}>
        <RevolvingMeridians
          animationFrames={bottomMeridianFrames}
          isAnimated={shouldAnimate}
          staticPaths={staticBottomMeridians}
        />
      </g>
      <path
        className="master-medium-world__hemisphere"
        d={worldPathParts.bottomOutline}
      />
    </svg>
  );
}

type RevolvingMeridiansProps = {
  animationFrames: readonly string[];
  isAnimated: boolean;
  staticPaths: readonly string[];
};

function RevolvingMeridians({
  animationFrames,
  isAnimated,
  staticPaths,
}: RevolvingMeridiansProps) {
  const animationValues = animationFrames.join(";");
  return staticPaths.slice(0, meridianCount).map((pathData, index) => {
    const begin = `${-(index * meridianDurationSeconds) / meridianCount}s`;

    return (
      <path
        className="master-medium-world__meridian"
        d={pathData}
        fill="none"
        key={`${pathData}-${index}`}
        stroke="currentColor"
      >
        {isAnimated ? (
          <>
            <animate
              attributeName="d"
              begin={begin}
              calcMode="linear"
              dur={`${meridianDurationSeconds}s`}
              keyTimes="0;0.25;0.5;0.75;1"
              repeatCount="indefinite"
              values={animationValues}
            />
            <animate
              attributeName="opacity"
              begin={begin}
              calcMode="linear"
              dur={`${meridianDurationSeconds}s`}
              keyTimes="0;0.12;0.5;0.88;1"
              repeatCount="indefinite"
              values="0;1;1;1;0"
            />
          </>
        ) : null}
      </path>
    );
  });
}

function splitWorldPath(pathData: string) {
  const middleMarker = "M68.0488 39.9414";
  const topMarker = "M66.0498 0C";
  const middleIndex = pathData.indexOf(middleMarker);
  const topIndex = pathData.indexOf(topMarker);

  if (middleIndex < 0 || topIndex < 0 || topIndex <= middleIndex) {
    return {
      bottomOutline: "",
      center: pathData,
      topOutline: "",
    };
  }

  return {
    bottomOutline: getHemisphereOutline(pathData.slice(0, middleIndex)),
    center: pathData.slice(middleIndex, topIndex),
    topOutline: getHemisphereOutline(pathData.slice(topIndex)),
  };
}

function getHemisphereOutline(pathData: string) {
  const outlineEnd = pathData.indexOf("Z") + 1;

  return outlineEnd > 0 ? pathData.slice(0, outlineEnd) : pathData;
}
