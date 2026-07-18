import { useEffect, useState } from "react";
import { StatementAxisSlide } from "../StatementAxisSlide";
import lineLeftUrl from "../20-ideas/line-left.svg";
import lineRightUrl from "../20-ideas/line-right.svg";
import patternSvgMarkup from "./pattern.svg?raw";

type TastePatternSlideProps = {
  className?: string;
  isAnimated?: boolean;
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

export function TastePatternSlide({
  className = "",
  isAnimated = true,
}: TastePatternSlideProps) {
  return (
    <StatementAxisSlide
      className={[
        "ideas-slide",
        "taste-pattern-slide",
        isAnimated ? "ideas-slide--animated" : "ideas-slide--static",
        className,
      ].join(" ").trim()}
      headline="Pattern matching earned through pain"
      headlineShadow
      icon={<AnimatedPatternGrid isAnimated={isAnimated} />}
      leftLabel="Must Be"
      leftLineUrl={lineLeftUrl}
      rightLabel="Relentless"
      rightLineUrl={lineRightUrl}
    />
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
