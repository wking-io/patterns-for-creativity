import { useEffect, useState } from "react";
import { StatementAxisSlide } from "../StatementAxisSlide";
import lineLeftUrl from "../20-ideas/line-left.svg";
import lineRightUrl from "../20-ideas/line-right.svg";
import patternSvgMarkup from "./pattern.svg?raw";

type TastePatternSlideProps = {
  className?: string;
  headline?: string;
  iconVariant?: "pattern" | "polyhedron";
  isAnimated?: boolean;
  leftLabel?: string;
  rightLabel?: string;
};

type PolyhedronPoint = {
  x: number;
  y: number;
};

type PatternTileState = {
  isVisible: boolean;
  rotation: number;
  sourcePosition: number;
};

const columnCount = 9;
const rowCount = 3;
const tileSize = 24;
const centerGapPositions = new Set([12, 13, 14]);
const occupiedPositions = Array.from(
  { length: columnCount * rowCount },
  (_, position) => position,
).filter((position) => !centerGapPositions.has(position));
const patternPathData = patternSvgMarkup.match(/<path d="([^"]+)"/)?.[1] ?? "";
const polyhedronStartingPoints: readonly PolyhedronPoint[] = [
  { x: 28, y: 35 }, { x: 48, y: 8 }, { x: 86, y: 2 },
  { x: 125, y: 9 }, { x: 178, y: 18 }, { x: 192, y: 45 },
  { x: 159, y: 67 }, { x: 104, y: 69 }, { x: 55, y: 62 },
  { x: 66, y: 33 }, { x: 106, y: 24 }, { x: 151, y: 35 },
  { x: 111, y: 52 },
] as const;
const polyhedronMotionRadius = 18;
const polyhedronEdges = [
  [0, 9], [1, 9], [2, 9], [2, 10], [9, 10], [3, 10],
  [3, 11], [10, 11], [4, 11], [5, 11], [6, 11], [6, 12],
  [11, 12], [10, 12], [9, 12], [7, 12], [8, 12], [8, 9],
] as const;

function createRandomPolyhedronTarget(): PolyhedronPoint[] {
  return polyhedronStartingPoints.map((origin) => {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.sqrt(Math.random()) * polyhedronMotionRadius;

    return {
      x: Math.min(214, Math.max(2, origin.x + Math.cos(angle) * distance)),
      y: Math.min(70, Math.max(2, origin.y + Math.sin(angle) * distance)),
    };
  });
}

function createRandomMorphDuration() {
  return 1_500 + Math.random() * 1_000;
}

export function TastePatternSlide({
  className = "",
  headline = "Pattern matching earned through pain",
  iconVariant = "pattern",
  isAnimated = true,
  leftLabel = "Must Be",
  rightLabel = "Relentless",
}: TastePatternSlideProps) {
  return (
    <StatementAxisSlide
      className={[
        "ideas-slide",
        "taste-pattern-slide",
        isAnimated ? "ideas-slide--animated" : "ideas-slide--static",
        className,
      ].join(" ").trim()}
      headline={headline}
      headlineShadow
      icon={
        iconVariant === "polyhedron"
          ? <MorphingPolyhedron />
          : <AnimatedPatternGrid isAnimated={isAnimated} />
      }
      leftLabel={leftLabel}
      leftLineUrl={lineLeftUrl}
      rightLabel={rightLabel}
      rightLineUrl={lineRightUrl}
    />
  );
}

function MorphingPolyhedron() {
  const [points, setPoints] = useState<readonly PolyhedronPoint[]>(
    polyhedronStartingPoints,
  );

  useEffect(() => {
    let fromPoints: readonly PolyhedronPoint[] = polyhedronStartingPoints;
    let toPoints: readonly PolyhedronPoint[] = createRandomPolyhedronTarget();
    let segmentDuration = createRandomMorphDuration();
    let segmentStartedAt = window.performance.now();
    let animationFrame = 0;

    const morph = (time: number) => {
      if (time - segmentStartedAt >= segmentDuration) {
        fromPoints = toPoints;
        toPoints = createRandomPolyhedronTarget();
        segmentDuration = createRandomMorphDuration();
        segmentStartedAt = time;
      }

      const progress = Math.min(1, (time - segmentStartedAt) / segmentDuration);

      setPoints(fromPoints.map((point, index) => ({
        x: point.x + (toPoints[index].x - point.x) * progress,
        y: point.y + (toPoints[index].y - point.y) * progress,
      })));
      animationFrame = window.requestAnimationFrame(morph);
    };

    animationFrame = window.requestAnimationFrame(morph);

    return () => window.cancelAnimationFrame(animationFrame);
  }, []);

  const outerPoints = points
    .slice(0, 9)
    .map(({ x, y }) => `${x},${y}`)
    .join(" ");

  return (
    <svg
      aria-hidden="true"
      className="taste-pattern-polyhedron"
      fill="none"
      preserveAspectRatio="none"
      viewBox="0 0 216 72"
    >
      <polygon
        className="taste-pattern-polyhedron__edge"
        points={outerPoints}
      />
      {polyhedronEdges.map(([fromIndex, toIndex]) => (
        <line
          className="taste-pattern-polyhedron__edge"
          key={`${fromIndex}-${toIndex}`}
          x1={points[fromIndex].x}
          x2={points[toIndex].x}
          y1={points[fromIndex].y}
          y2={points[toIndex].y}
        />
      ))}
      {points.map(({ x, y }, index) => (
        <circle
          className="taste-pattern-polyhedron__point"
          cx={x}
          cy={y}
          key={index}
          r="1.1"
        />
      ))}
    </svg>
  );
}

function AnimatedPatternGrid({ isAnimated }: { isAnimated: boolean }) {
  const shouldAnimate =
    isAnimated &&
    !(typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [tiles, setTiles] = useState(() => createInitialTiles(shouldAnimate));

  useEffect(() => {
    if (!shouldAnimate) {
      setTiles(createInitialTiles(false));
      return undefined;
    }

    setTiles(createInitialTiles(true));
    const revealOrder = shuffle(occupiedPositions.map((_, index) => index));
    const revealStart = 180;
    const revealStep = 42;
    const revealTimers = revealOrder.map((tileIndex, revealIndex) => (
      window.setTimeout(() => {
        setTiles((currentTiles) => currentTiles.map((tile, index) => (
          index === tileIndex ? { ...tile, isVisible: true } : tile
        )));
      }, revealStart + revealIndex * revealStep)
    ));

    let rearrangeTimer: number | undefined;
    const rearrangeStartTimer = window.setTimeout(() => {
      setTiles((currentTiles) => rearrangeTiles(currentTiles));
      rearrangeTimer = window.setInterval(() => {
        setTiles((currentTiles) => rearrangeTiles(currentTiles));
      }, 520);
    }, revealStart + revealOrder.length * revealStep + 620);

    return () => {
      revealTimers.forEach((timer) => window.clearTimeout(timer));
      window.clearTimeout(rearrangeStartTimer);

      if (rearrangeTimer !== undefined) {
        window.clearInterval(rearrangeTimer);
      }
    };
  }, [shouldAnimate]);

  return (
    <div className="taste-pattern-grid">
      {tiles.map((tile, index) => {
        const destinationPosition = occupiedPositions[index];
        const destinationColumn = destinationPosition % columnCount;
        const destinationRow = Math.floor(destinationPosition / columnCount);
        const sourceColumn = tile.sourcePosition % columnCount;
        const sourceRow = Math.floor(tile.sourcePosition / columnCount);

        return (
          <svg
            aria-hidden="true"
            className="taste-pattern-grid__tile"
            key={destinationPosition}
            preserveAspectRatio="none"
            style={{
              gridColumn: destinationColumn + 1,
              gridRow: destinationRow + 1,
              opacity: tile.isVisible ? 1 : 0,
              transform: `rotate(${tile.rotation}deg)`,
            }}
            viewBox={`${sourceColumn * tileSize} ${sourceRow * tileSize} ${tileSize} ${tileSize}`}
          >
            <path d={patternPathData} fill="currentColor" />
          </svg>
        );
      })}
    </div>
  );
}

function createInitialTiles(isHidden: boolean): PatternTileState[] {
  return occupiedPositions.map((sourcePosition) => ({
    isVisible: !isHidden,
    rotation: 0,
    sourcePosition,
  }));
}

function rearrangeTiles(currentTiles: PatternTileState[]): PatternTileState[] {
  const selectionSize = 5 + Math.floor(Math.random() * 5);
  const selectedIndices = shuffle(currentTiles.map((_, index) => index)).slice(
    0,
    selectionSize,
  );
  const sourceTiles = selectedIndices.map((index) => currentTiles[index]);
  const sourceOffset = 1 + Math.floor(Math.random() * (sourceTiles.length - 1));
  const nextTiles = [...currentTiles];

  selectedIndices.forEach((destinationIndex, selectedIndex) => {
    const sourceTile = sourceTiles[(selectedIndex + sourceOffset) % sourceTiles.length];
    const quarterTurns = 1 + Math.floor(Math.random() * 3);

    nextTiles[destinationIndex] = {
      isVisible: true,
      rotation: (sourceTile.rotation + quarterTurns * 90) % 360,
      sourcePosition: sourceTile.sourcePosition,
    };
  });

  return nextTiles;
}

function shuffle<T>(values: T[]): T[] {
  const shuffledValues = [...values];

  for (let index = shuffledValues.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffledValues[index], shuffledValues[swapIndex]] = [
      shuffledValues[swapIndex],
      shuffledValues[index],
    ];
  }

  return shuffledValues;
}
