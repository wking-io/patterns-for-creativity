import creativeProcessSvg from "./creative-process.svg?raw";

type CreativeProcessSlideProps = {
  className?: string;
};

const hiddenElementIndexes = new Set([
  9, 10, 11, // label dots for Ideas, Reality, and Taste
  13, 14, 15, // vertical lines for Ideas, Reality, and Taste
  17, 18, 19, // secondary highlights for their ellipses
]);

function prepareCreativeProcessSvg(svg: string) {
  let elementIndex = 0;
  const preparedLines: string[] = [];

  for (const sourceLine of svg.trim().split("\n")) {
    if (sourceLine.startsWith("<svg ")) {
      preparedLines.push(sourceLine.replace(
        "<svg ",
        '<svg class="creative-process-slide__svg" ',
      ));
      continue;
    }

    if (!/^<(circle|ellipse|line|path) /.test(sourceLine)) {
      preparedLines.push(sourceLine);
      continue;
    }

    const currentIndex = elementIndex;
    elementIndex += 1;

    if (hiddenElementIndexes.has(currentIndex) || currentIndex >= 29) {
      continue;
    }

    if (currentIndex >= 5 && currentIndex <= 7) {
      preparedLines.push(sourceLine.replace(
        "<path ",
        '<path class="creative-process-slide__connector" ',
      ));
      continue;
    }

    if (currentIndex >= 20 && currentIndex <= 28) {
      preparedLines.push(sourceLine.replace(
        "<path ",
        '<path class="creative-process-slide__catalysts" ',
      ));
      continue;
    }

    preparedLines.push(sourceLine);
  }

  return preparedLines.join("\n");
}

const preparedCreativeProcessSvg = prepareCreativeProcessSvg(creativeProcessSvg);

export function CreativeProcessSlide({ className = "" }: CreativeProcessSlideProps) {
  return (
    <div
      aria-label="Creative process: catalysts"
      className={`creative-process-slide ${className}`.trim()}
      role="img"
    >
      <div aria-hidden="true" className="output-slide__panel-background" />
      <div
        aria-hidden="true"
        className="creative-process-slide__artwork"
        dangerouslySetInnerHTML={{ __html: preparedCreativeProcessSvg }}
      />
    </div>
  );
}
