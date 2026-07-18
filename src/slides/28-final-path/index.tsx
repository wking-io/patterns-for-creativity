import { motion } from "motion/react";
import finalPathSvg from "./final-path.svg?raw";

export type FinalPathStage = "layout" | "catalysts" | "ideas" | "reality" | "taste";

type FinalPathSlideProps = {
  className?: string;
  isAnimated?: boolean;
  stage?: FinalPathStage;
};

type PathStage = Exclude<FinalPathStage, "layout">;

const labels: PathStage[] = ["catalysts", "ideas", "reality", "taste"];
const dividerXs = [888.5, 1777, 2665.5];

const nodeStages: PathStage[] = [
  "catalysts",
  "ideas",
  "reality",
  "ideas",
  "ideas",
  "reality",
  "taste",
  "ideas",
  "ideas",
  "reality",
  "taste",
  "ideas",
  "reality",
  "reality",
  "ideas",
  "ideas",
  "catalysts",
];

const pathStages: PathStage[] = [
  "ideas",
  "reality",
  "taste",
  "taste",
  "taste",
  "taste",
  "reality",
  "reality",
  "reality",
  "reality",
  "reality",
  "ideas",
  "ideas",
  "ideas",
  "ideas",
  "ideas",
  "ideas",
  "ideas",
  "ideas",
];

function prepareFinalPathSvg(svg: string) {
  let openingTag = "";
  let closingTag = "</svg>";
  let nodeIndex = 0;
  let pathIndex = 0;
  const nodes: string[] = [];
  const paths: string[] = [];

  for (const sourceLine of svg.trim().split("\n")) {
    if (sourceLine.startsWith("<svg ")) {
      openingTag = sourceLine.replace(
        "<svg ",
        '<svg aria-hidden="true" class="final-path-slide__diagram-svg" ',
      );
      continue;
    }

    if (sourceLine === "</svg>") {
      closingTag = sourceLine;
      continue;
    }

    if (sourceLine.startsWith("<rect ")) {
      const stage = nodeStages[nodeIndex];
      nodeIndex += 1;
      nodes.push(
        `<g class="final-path-slide__node final-path-slide__node--${stage}">${sourceLine}</g>`,
      );
      continue;
    }

    if (sourceLine.startsWith("<path ")) {
      const stage = pathStages[pathIndex];
      pathIndex += 1;
      paths.push(sourceLine.replace(
        "<path ",
        `<path class="final-path-slide__path final-path-slide__path--${stage}" pathLength="1" `,
      ));
    }
  }

  return [openingTag, ...paths, ...nodes, closingTag].join("\n");
}

const preparedFinalPathSvg = prepareFinalPathSvg(finalPathSvg);
const labelTransition = { duration: 0.68, ease: [0.16, 1, 0.3, 1] } as const;
const dividerTransition = { duration: 0.62, ease: [0.37, 0, 0.63, 1] } as const;

export function FinalPathSlide({
  className = "",
  isAnimated = true,
  stage = "layout",
}: FinalPathSlideProps) {
  const shouldAnimateLayout = isAnimated && stage === "layout";

  return (
    <div
      aria-label={`Final path: ${stage === "layout" ? "four stages" : `through ${stage}`}`}
      className={[
        "final-path-slide",
        `final-path-slide--${stage}`,
        isAnimated ? "final-path-slide--animated" : "",
        className,
      ].join(" ").trim()}
      role="img"
    >
      <div aria-hidden="true" className="output-slide__panel-background" />

      <svg
        aria-hidden="true"
        className="final-path-slide__dividers"
        preserveAspectRatio="none"
        viewBox="0 0 3554 1912"
      >
        <defs>
          {dividerXs.map((x, index) => (
            <clipPath id={`final-path-divider-clip-${index}`} key={x}>
              <motion.rect
                animate={{ height: 956, y: 0 }}
                initial={shouldAnimateLayout ? { height: 0, y: 956 } : false}
                transition={dividerTransition}
                width={8}
                x={x - 4}
              />
              <motion.rect
                animate={{ height: 956 }}
                initial={shouldAnimateLayout ? { height: 0 } : false}
                transition={dividerTransition}
                width={8}
                x={x - 4}
                y={956}
              />
            </clipPath>
          ))}
        </defs>

        {dividerXs.map((x, index) => (
          <line
            className="final-path-slide__divider"
            clipPath={`url(#final-path-divider-clip-${index})`}
            key={x}
            x1={x}
            x2={x}
            y1={0}
            y2={1912}
          />
        ))}
      </svg>

      {labels.map((label) => (
        <motion.p
          className={`final-path-slide__label final-path-slide__label--${label}`}
          key={label}
          layout="position"
          layoutId={`creative-process-label-${label}`}
          transition={labelTransition}
        >
          {label}
        </motion.p>
      ))}

      {stage === "layout" ? null : (
        <div
          className="final-path-slide__diagram"
          dangerouslySetInnerHTML={{ __html: preparedFinalPathSvg }}
        />
      )}
    </div>
  );
}
