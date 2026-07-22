import {
  useEffect,
  useRef,
  type PointerEvent as ReactPointerEvent,
  type TouchEvent as ReactTouchEvent,
} from "react";
import { motion } from "motion/react";
import type {
  PresentationPointerPosition,
  ScratchSegment,
} from "../../motion-deck/presentation-sync";
import sucksUrl from "./sucks.webp";

type ScratchPoint = {
  isStart: boolean;
  x: number;
  y: number;
};

type ScratchRevealSlideProps = {
  className?: string;
  isInteractive?: boolean;
  onPointerChange?: (pointer?: PresentationPointerPosition) => void;
  onScratchSegments?: (segments: ScratchSegment[]) => void;
  scratchSegments?: readonly ScratchSegment[];
  showCompletedWhenStatic?: boolean;
};

const scratchRowCount = 7;
const scratchPointsPerRow = 140;

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
  for (let index = Math.max(1, startIndex); index <= endIndex; index += 1) {
    const currentPoint = points[index];
    const previousPoint = points[index - 1];

    if (currentPoint.isStart) {
      continue;
    }

    drawCoinEdgeStroke(context, previousPoint, currentPoint, height);
  }
}

function drawCoinEdgeStroke(
  context: CanvasRenderingContext2D,
  from: Pick<ScratchPoint, "x" | "y">,
  to: Pick<ScratchPoint, "x" | "y">,
  height: number,
) {
  const deltaX = to.x - from.x;
  const deltaY = to.y - from.y;
  const distance = Math.hypot(deltaX, deltaY);

  if (distance < 0.5) {
    return;
  }

  const edgeLength = height * 0.1;
  const edgeThickness = Math.max(1.5, height * 0.011);
  const stampSpacing = Math.max(1, edgeThickness * 0.7);
  const stampCount = Math.max(1, Math.ceil(distance / stampSpacing));
  const edgeAngle = Math.atan2(deltaY, deltaX) + Math.PI / 2;

  context.globalCompositeOperation = "destination-out";
  context.lineCap = "round";
  context.lineJoin = "round";
  context.lineWidth = edgeThickness;
  context.strokeStyle = "#000000";

  for (let index = 1; index <= stampCount; index += 1) {
    const progress = index / stampCount;
    const x = from.x + deltaX * progress;
    const y = from.y + deltaY * progress;

    context.save();
    context.translate(x, y);
    context.rotate(edgeAngle);
    context.beginPath();
    context.moveTo(-edgeLength / 2, 0);
    context.quadraticCurveTo(0, -edgeThickness * 0.45, edgeLength / 2, 0);
    context.stroke();
    context.restore();
  }
}

function getScratchPoint(
  canvas: HTMLCanvasElement,
  clientX: number,
  clientY: number,
) {
  const bounds = canvas.getBoundingClientRect();

  return {
    x: clientX - bounds.left,
    y: clientY - bounds.top,
  };
}

function eraseScratchStroke(
  canvas: HTMLCanvasElement,
  from: Pick<ScratchPoint, "x" | "y">,
  to: Pick<ScratchPoint, "x" | "y">,
) {
  const context = canvas.getContext("2d");
  const bounds = canvas.getBoundingClientRect();

  if (!context || bounds.height < 1) {
    return;
  }

  drawCoinEdgeStroke(context, from, to, bounds.height);
}

function drawNormalizedScratchSegments(
  context: CanvasRenderingContext2D,
  segments: readonly ScratchSegment[],
  width: number,
  height: number,
) {
  for (const segment of segments) {
    drawCoinEdgeStroke(
      context,
      { x: segment.fromX * width, y: segment.fromY * height },
      { x: segment.toX * width, y: segment.toY * height },
      height,
    );
  }
}

function normalizeScratchSegment(
  from: Pick<ScratchPoint, "x" | "y">,
  to: Pick<ScratchPoint, "x" | "y">,
  width: number,
  height: number,
): ScratchSegment {
  return {
    fromX: Math.min(1, Math.max(0, from.x / width)),
    fromY: Math.min(1, Math.max(0, from.y / height)),
    toX: Math.min(1, Math.max(0, to.x / width)),
    toY: Math.min(1, Math.max(0, to.y / height)),
  };
}

export function ScratchRevealSlide({
  className = "",
  isInteractive = true,
  onPointerChange,
  onScratchSegments,
  scratchSegments = [],
  showCompletedWhenStatic = false,
}: ScratchRevealSlideProps) {
  const slideRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activePointerRef = useRef<number | undefined>(undefined);
  const lastScratchPointRef = useRef<Pick<ScratchPoint, "x" | "y"> | undefined>(undefined);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return undefined;
    }

    const render = () => {
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

      if (scratchSegments.length > 0) {
        drawNormalizedScratchSegments(
          context,
          scratchSegments,
          bounds.width,
          bounds.height,
        );
      } else if (showCompletedWhenStatic) {
        const points = createScratchPoints(bounds.width, bounds.height);
        drawScratchSegments(context, points, 0, points.length - 1, bounds.height);
      }
    };

    const resizeObserver = new ResizeObserver(render);
    resizeObserver.observe(canvas);
    render();

    return () => {
      resizeObserver.disconnect();
    };
  }, [scratchSegments, showCompletedWhenStatic]);

  const handlePointerDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!isInteractive) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    activePointerRef.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
    onPointerChange?.(getNormalizedPointerPosition(
      slideRef.current ?? event.currentTarget,
      event.clientX,
      event.clientY,
    ));

    const point = getScratchPoint(event.currentTarget, event.clientX, event.clientY);
    lastScratchPointRef.current = point;
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!isInteractive) {
      return;
    }

    onPointerChange?.(getNormalizedPointerPosition(
      slideRef.current ?? event.currentTarget,
      event.clientX,
      event.clientY,
    ));

    if (activePointerRef.current !== event.pointerId) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const reportedCoalescedEvents = event.nativeEvent.getCoalescedEvents?.();
    const coalescedEvents = reportedCoalescedEvents && reportedCoalescedEvents.length > 0
      ? reportedCoalescedEvents
      : [event.nativeEvent];
    const bounds = event.currentTarget.getBoundingClientRect();
    const emittedSegments: ScratchSegment[] = [];
    let previousPoint = lastScratchPointRef.current;

    for (const coalescedEvent of coalescedEvents) {
      const nextPoint = getScratchPoint(
        event.currentTarget,
        coalescedEvent.clientX,
        coalescedEvent.clientY,
      );

      const segmentStart = previousPoint ?? nextPoint;
      eraseScratchStroke(event.currentTarget, segmentStart, nextPoint);

      if (previousPoint && bounds.width > 0 && bounds.height > 0) {
        emittedSegments.push(normalizeScratchSegment(
          previousPoint,
          nextPoint,
          bounds.width,
          bounds.height,
        ));
      }

      previousPoint = nextPoint;
    }

    lastScratchPointRef.current = previousPoint;

    if (emittedSegments.length > 0) {
      onScratchSegments?.(emittedSegments);
    }
  };

  const finishScratching = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (activePointerRef.current !== event.pointerId) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    activePointerRef.current = undefined;
    lastScratchPointRef.current = undefined;
  };

  const stopTouchNavigation = (event: ReactTouchEvent<HTMLCanvasElement>) => {
    if (isInteractive) {
      event.stopPropagation();
    }
  };

  return (
    <div
      aria-label={isInteractive
        ? "Scratch the white field to reveal the words Help me"
        : "A scratched-off field revealing the words Help me"}
      className={`scratch-reveal-slide ${className}`.trim()}
      ref={slideRef}
      role="img"
    >
      <div className="scratch-reveal-slide__field">
        <svg
          aria-hidden="true"
          className="scratch-reveal-slide__shape"
          preserveAspectRatio="none"
          viewBox="0 0 1000 500"
        >
          <text
            lengthAdjust="spacingAndGlyphs"
            textAnchor="middle"
            textLength="470"
            x="500"
            y="365"
          >
            HELP ME!
          </text>
        </svg>
        <canvas
          aria-hidden="true"
          className={[
            "scratch-reveal-slide__canvas",
            isInteractive ? "scratch-reveal-slide__canvas--interactive" : "",
            scratchSegments.length > 0 ? "scratch-reveal-slide__canvas--scratching" : "",
          ].join(" ")}
          onPointerCancel={finishScratching}
          onPointerDown={handlePointerDown}
          onPointerLeave={() => onPointerChange?.(undefined)}
          onPointerMove={handlePointerMove}
          onPointerUp={finishScratching}
          onTouchCancel={stopTouchNavigation}
          onTouchEnd={stopTouchNavigation}
          onTouchMove={stopTouchNavigation}
          onTouchStart={stopTouchNavigation}
          ref={canvasRef}
        />
      </div>
    </div>
  );
}

function getNormalizedPointerPosition(
  element: HTMLElement,
  clientX: number,
  clientY: number,
): PresentationPointerPosition {
  const bounds = element.getBoundingClientRect();

  return {
    x: Math.min(1, Math.max(0, (clientX - bounds.left) / bounds.width)),
    y: Math.min(1, Math.max(0, (clientY - bounds.top) / bounds.height)),
  };
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
