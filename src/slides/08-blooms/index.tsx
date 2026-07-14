import bloomSvg from "./bloom.svg?raw";

type BloomSlideProps = {
  className?: string;
  isAnimated?: boolean;
};

const labelPathRanges = [
  [0, 8],
  [8, 18],
  [18, 23],
  [23, 30],
  [30, 38],
  [38, 39],
] as const;

const capPathStartIndex = 69;
const createLabelPathIndex = 38;

const connectorClipRects = [
  { height: 12, width: 353, x: 2037, y: 1244 },
  { height: 12, width: 480, x: 1910, y: 1088 },
  { height: 12, width: 605, x: 1785, y: 936 },
  { height: 12, width: 730, x: 1656, y: 781 },
  { height: 12, width: 865, x: 1521, y: 621 },
  { height: 12, width: 1041, x: 1345, y: 404 },
] as const;

function prepareBloomSvg(svg: string, animateCap: boolean) {
  let pathIndex = 0;
  let lineIndex = 0;
  const preparedLines: string[] = [];
  const clipPaths = connectorClipRects.map((rect, index) => (
    `<clipPath id="bloom-connector-clip-${index}" clipPathUnits="userSpaceOnUse">` +
      `<rect class="bloom-connector-reveal bloom-connector--${index}" ` +
      `x="${rect.x}" y="${rect.y}" width="${rect.width}" height="${rect.height}"/>` +
    "</clipPath>"
  )).join("");

  for (const sourceLine of svg.trim().split("\n")) {
    if (sourceLine.startsWith("<svg ")) {
      preparedLines.push(sourceLine.replace("<svg ", '<svg class="bloom-slide__svg" '));
      preparedLines.push(`<defs>${clipPaths}</defs>`);
      continue;
    }

    if (sourceLine.startsWith("<path ")) {
      const currentPathIndex = pathIndex;
      const labelIndex = labelPathRanges.findIndex(
        ([start, end]) => currentPathIndex >= start && currentPathIndex < end,
      );

      if (animateCap && currentPathIndex === createLabelPathIndex) {
        pathIndex += 1;
        continue;
      }

      if (labelIndex >= 0 && currentPathIndex === labelPathRanges[labelIndex][0]) {
        preparedLines.push(`<g class="bloom-label bloom-label--${labelIndex}">`);
      }

      if (currentPathIndex === capPathStartIndex) {
        preparedLines.push(
          animateCap
            ? '<g class="bloom-pyramid-cap bloom-pyramid-cap--final" transform="translate(0 -56)">'
            : '<g class="bloom-pyramid-cap">',
        );
      }

      preparedLines.push(sourceLine);

      if (labelIndex >= 0 && currentPathIndex === labelPathRanges[labelIndex][1] - 1) {
        preparedLines.push("</g>");
      }

      if (currentPathIndex === capPathStartIndex + 3) {
        preparedLines.push("</g>");
      }

      pathIndex += 1;
      continue;
    }

    if (sourceLine.startsWith("<line ")) {
      if (lineIndex < 6) {
        preparedLines.push(sourceLine.replace(
          "<line ",
          `<line class="bloom-connector" clip-path="url(#bloom-connector-clip-${lineIndex})" `,
        ));
      } else {
        const tickIndex = lineIndex - 6;
        preparedLines.push(sourceLine.replace(
          "<line ",
          `<line class="bloom-connector-tick bloom-connector-tick--${tickIndex}" `,
        ));
      }

      lineIndex += 1;
      continue;
    }

    preparedLines.push(sourceLine);
  }

  return preparedLines.join("\n");
}

const preparedBloomSvg = prepareBloomSvg(bloomSvg, false);
const animatedBloomSvg = prepareBloomSvg(bloomSvg, true);
const bloomPaths = bloomSvg
  .trim()
  .split("\n")
  .filter((line) => line.startsWith("<path "));
const createLabelPath = bloomPaths[createLabelPathIndex] ?? "";
const createLabelSvg = (
  '<svg viewBox="2440 375 350 76" fill="none" xmlns="http://www.w3.org/2000/svg">' +
  createLabelPath +
  "</svg>"
);
const capSvg = (
  '<svg viewBox="0 0 3640 1912" fill="none" xmlns="http://www.w3.org/2000/svg">' +
  bloomPaths.slice(capPathStartIndex, capPathStartIndex + 4).join("") +
  "</svg>"
);

export function BloomSlide({
  className = "",
  isAnimated = false,
}: BloomSlideProps) {
  return (
    <div
      aria-label="Bloom's taxonomy pyramid"
      className={[
        "bloom-slide",
        isAnimated ? "bloom-slide--enter" : "",
        className,
      ].join(" ").trim()}
      role="img"
    >
      <div
        aria-hidden="true"
        className="bloom-slide__image"
        dangerouslySetInnerHTML={{
          __html: isAnimated ? animatedBloomSvg : preparedBloomSvg,
        }}
      />
      {isAnimated ? (
        <>
          <div
            aria-hidden="true"
            className="bloom-pyramid-cap-overlay"
            dangerouslySetInnerHTML={{ __html: capSvg }}
          />
          <div
            aria-hidden="true"
            className="bloom-create-label"
            dangerouslySetInnerHTML={{ __html: createLabelSvg }}
          />
        </>
      ) : null}
    </div>
  );
}
