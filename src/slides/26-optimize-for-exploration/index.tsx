import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import sucksUrl from "./sucks.webp";

type ScratchPoint = {
  isStart: boolean;
  x: number;
  y: number;
};

type ScratchRevealSlideProps = {
  className?: string;
  isAnimated?: boolean;
};

const scratchRowCount = 7;
const scratchPointsPerRow = 140;
const scratchAnimationDelay = 360;
const scratchAnimationDuration = 4200;

function createScratchPoints(width: number, height: number): ScratchPoint[] {
  const points: ScratchPoint[] = [];

  for (let row = 0; row < scratchRowCount; row += 1) {
    const rowProgress = row / (scratchRowCount - 1);
    const rowY = height * (0.12 + rowProgress * 0.76);
    const isReversed = row % 2 === 1;

    for (let index = 0; index < scratchPointsPerRow; index += 1) {
      const progress = index / (scratchPointsPerRow - 1);
      const travelProgress = isReversed ? 1 - progress : progress;
      const primaryWave = Math.sin(progress * Math.PI * 3 + row * 0.82);
      const secondaryWave = Math.sin(progress * Math.PI * 11 + row * 1.71);

      points.push({
        isStart: index === 0,
        x: width * (0.055 + travelProgress * 0.89),
        y: rowY + primaryWave * height * 0.024 + secondaryWave * height * 0.008,
      });
    }
  }

  return points;
}

function drawScratchSegments(
  context: CanvasRenderingContext2D,
  points: ScratchPoint[],
  startIndex: number,
  endIndex: number,
  height: number,
) {
  context.globalCompositeOperation = "destination-out";
  context.lineCap = "round";
  context.lineJoin = "round";
  context.lineWidth = height * 0.145;
  context.strokeStyle = "#000000";

  for (let index = Math.max(1, startIndex); index <= endIndex; index += 1) {
    const currentPoint = points[index];
    const previousPoint = points[index - 1];

    if (currentPoint.isStart) {
      continue;
    }

    context.beginPath();
    context.moveTo(previousPoint.x, previousPoint.y);
    context.lineTo(currentPoint.x, currentPoint.y);
    context.stroke();
  }
}

export function ScratchRevealSlide({
  className = "",
  isAnimated = true,
}: ScratchRevealSlideProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return undefined;
    }

    let animationFrame = 0;

    const render = () => {
      window.cancelAnimationFrame(animationFrame);

      const bounds = canvas.getBoundingClientRect();

      if (bounds.width < 1 || bounds.height < 1) {
        return;
      }

      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      const context = canvas.getContext("2d");

      if (!context) {
        return;
      }

      canvas.width = Math.round(bounds.width * pixelRatio);
      canvas.height = Math.round(bounds.height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.globalCompositeOperation = "source-over";
      context.fillStyle = getComputedStyle(canvas)
        .getPropertyValue("--color-light-s0")
        .trim() || "#f3f1f1";
      context.fillRect(0, 0, bounds.width, bounds.height);

      const points = createScratchPoints(bounds.width, bounds.height);
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (!isAnimated || prefersReducedMotion) {
        drawScratchSegments(context, points, 0, points.length - 1, bounds.height);
        return;
      }

      let lastPointIndex = 0;
      const startTime = performance.now() + scratchAnimationDelay;

      const animate = (time: number) => {
        const linearProgress = Math.min(
          1,
          Math.max(0, (time - startTime) / scratchAnimationDuration),
        );
        const easedProgress = linearProgress * linearProgress * (3 - 2 * linearProgress);
        const nextPointIndex = Math.floor(easedProgress * (points.length - 1));

        drawScratchSegments(
          context,
          points,
          lastPointIndex,
          nextPointIndex,
          bounds.height,
        );
        lastPointIndex = nextPointIndex;

        if (linearProgress < 1) {
          animationFrame = window.requestAnimationFrame(animate);
        }
      };

      animationFrame = window.requestAnimationFrame(animate);
    };

    const resizeObserver = new ResizeObserver(render);
    resizeObserver.observe(canvas);
    render();

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
    };
  }, [isAnimated]);

  return (
    <div
      aria-label="A scratch-off field revealing a hidden shape"
      className={`scratch-reveal-slide ${className}`.trim()}
      role="img"
    >
      <div className="scratch-reveal-slide__field">
        <svg
          aria-hidden="true"
          className="scratch-reveal-slide__shape"
          viewBox="0 0 1000 500"
        >
          <path d="M500 18 578 143 724 70 704 218 884 248 711 298 748 462 582 364 500 486 425 353 260 446 298 288 116 250 297 211 260 58 424 142Z" />
        </svg>
        <canvas
          aria-hidden="true"
          className="scratch-reveal-slide__canvas"
          ref={canvasRef}
        />
      </div>
    </div>
  );
}

type FirstIdeaSlideProps = {
  className?: string;
  isAnimated?: boolean;
  showStamp?: boolean;
};

export function FirstIdeaSlide({
  className = "",
  isAnimated = true,
  showStamp = false,
}: FirstIdeaSlideProps) {
  return (
    <div className={`first-idea-slide ${className}`.trim()}>
      <div className="first-idea-slide__headline" role="heading" aria-level={1}>
        <span
          aria-hidden="true"
          className="first-idea-slide__headline-shadow"
          style={{ mixBlendMode: "luminosity" }}
        >
          1st idea
        </span>
        <span className="first-idea-slide__headline-copy">1st idea</span>
      </div>

      {showStamp ? (
        <motion.img
          alt="Sucks"
          animate={{ opacity: 1, scale: 1 }}
          className="first-idea-slide__stamp"
          draggable={false}
          initial={isAnimated ? { opacity: 1, scale: 1.2 } : false}
          src={sucksUrl}
          transition={isAnimated
            ? {
                duration: 0.18,
                ease: [0.22, 1, 0.36, 1],
              }
            : { duration: 0 }}
        />
      ) : null}
    </div>
  );
}
