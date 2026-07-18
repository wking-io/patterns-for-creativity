import { motion } from "motion/react";
import creativeProcessSvg from "./creative-process.svg?raw";

export type CreativeProcessStage = "catalysts" | "ideas" | "reality" | "taste";

type CreativeProcessSlideProps = {
  className?: string;
  isAnimated?: boolean;
  stage?: CreativeProcessStage;
};

const stageOrder: CreativeProcessStage[] = ["catalysts", "ideas", "reality", "taste"];
const connectorStages = ["ideas", "reality", "taste"] as const;

const geometryElementStages: CreativeProcessStage[] = [
  "catalysts", // center circle for the first marker
  "taste", // fourth marker
  "catalysts", // first marker
  "reality", // third marker
  "ideas", // second marker
  "taste", // third connector
  "reality", // second connector
  "ideas", // first connector
  "catalysts", // first top dot
  "ideas", // second top dot
  "reality", // third top dot
  "taste", // fourth top dot
  "catalysts", // first riser
  "ideas", // second riser
  "reality", // third riser
  "taste", // fourth riser
  "catalysts", // first marker highlight
  "ideas", // second marker highlight
  "reality", // third marker highlight
  "taste", // fourth marker highlight
];

const connectorClipPaths = connectorStages.map((stage) => {
  const dimensions = {
    ideas: { width: 805.001, x: 210.699 },
    reality: { width: 805, x: 1022.7 },
    taste: { width: 785, x: 1827.7 },
  }[stage];

  return (
    `<clipPath id="creative-process-connector-clip-${stage}" clipPathUnits="userSpaceOnUse">` +
      `<rect class="creative-process-slide__connector-clip creative-process-slide__connector-clip--${stage}" ` +
        `x="${dimensions.x}" y="428" width="${dimensions.width}" height="28"/>` +
    "</clipPath>" +
    `<clipPath id="creative-process-tracer-clip-${stage}" clipPathUnits="userSpaceOnUse">` +
      `<rect class="creative-process-slide__tracer-clip creative-process-slide__tracer-clip--${stage}" ` +
        `x="${dimensions.x}" y="428" width="${dimensions.width}" height="28"/>` +
    "</clipPath>"
  );
}).join("");

function prepareCreativeProcessSvg(svg: string) {
  let elementIndex = 0;
  const preparedLines: string[] = [];

  for (const sourceLine of svg.trim().split("\n")) {
    if (sourceLine.startsWith("<svg ")) {
      preparedLines.push(sourceLine.replace(
        "<svg ",
        '<svg class="creative-process-slide__svg" ',
      ));
      preparedLines.push(`<defs>${connectorClipPaths}</defs>`);
      continue;
    }

    if (!/^<(circle|ellipse|line|path) /.test(sourceLine)) {
      preparedLines.push(sourceLine);
      continue;
    }

    const currentIndex = elementIndex;
    elementIndex += 1;

    // The SVG's remaining paths are outlined letterforms. Labels are live text below.
    if (currentIndex >= geometryElementStages.length) {
      continue;
    }

    const stage = geometryElementStages[currentIndex];
    let elementClass = `creative-process-slide__geometry creative-process-slide__geometry--${stage}`;
    let extraAttributes = "";

    if (currentIndex >= 5 && currentIndex <= 7) {
      elementClass += ` creative-process-slide__connector creative-process-slide__connector--${stage}`;
      extraAttributes = ` clip-path="url(#creative-process-connector-clip-${stage})"`;
      const connector = sourceLine.replace(
        /<(path) /,
        `<$1 class="${elementClass}"${extraAttributes} `,
      );
      preparedLines.push(connector);
      preparedLines.push(connector
        .replace(
          `creative-process-slide__connector creative-process-slide__connector--${stage}`,
          `creative-process-slide__tracer creative-process-slide__tracer--${stage}`,
        )
        .replace(
          `creative-process-connector-clip-${stage}`,
          `creative-process-tracer-clip-${stage}`,
        ));
      continue;
    }

    if (currentIndex <= 4) {
      elementClass += " creative-process-slide__marker";
    } else if (currentIndex >= 8 && currentIndex <= 11) {
      elementClass += " creative-process-slide__top-dot";
    } else if (currentIndex >= 12 && currentIndex <= 15) {
      elementClass += " creative-process-slide__riser";
    } else if (currentIndex >= 16) {
      elementClass += " creative-process-slide__marker-highlight";
    }

    preparedLines.push(sourceLine.replace(
      /^<(circle|ellipse|line|path) /,
      `<$1 class="${elementClass}" `,
    ));
  }

  return preparedLines.join("\n");
}

const preparedCreativeProcessSvg = prepareCreativeProcessSvg(creativeProcessSvg);

export function CreativeProcessSlide({
  className = "",
  isAnimated = false,
  stage = "catalysts",
}: CreativeProcessSlideProps) {
  const activeStageIndex = stageOrder.indexOf(stage);
  const visibleLabels = stageOrder.slice(0, activeStageIndex + 1);

  return (
    <div
      aria-label={`Creative process: ${visibleLabels.join(", ")}`}
      className={[
        "creative-process-slide",
        `creative-process-slide--${stage}`,
        isAnimated ? "creative-process-slide--animated" : "",
        className,
      ].join(" ").trim()}
      role="img"
    >
      <div aria-hidden="true" className="output-slide__panel-background" />
      <div aria-hidden="true" className="creative-process-slide__artwork">
        <div
          className="creative-process-slide__geometry-layer"
          dangerouslySetInnerHTML={{ __html: preparedCreativeProcessSvg }}
        />
        {visibleLabels.map((label) => (
          <motion.p
            className={`creative-process-slide__label creative-process-slide__label--${label}`}
            key={label}
            layout="position"
            layoutId={`creative-process-label-${label}`}
            transition={{ duration: 0.68, ease: [0.16, 1, 0.3, 1] }}
          >
            {label}
          </motion.p>
        ))}
      </div>
    </div>
  );
}
