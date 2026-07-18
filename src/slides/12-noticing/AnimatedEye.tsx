import { useEffect, useState } from "react";

type GazePoint = {
  x: number;
  y: number;
};

const longGazePoints: GazePoint[] = [
  { x: -6, y: -3 },
  { x: 0, y: -4 },
  { x: 6, y: -2 },
  { x: -6, y: 2 },
  { x: 5, y: 3 },
  { x: 0, y: 4 },
];

const quickGazeOffsets: GazePoint[] = [
  { x: -1.5, y: -0.5 },
  { x: -1, y: 1 },
  { x: -0.5, y: -1.5 },
  { x: 0.5, y: 1.5 },
  { x: 1, y: -1 },
  { x: 1.5, y: 0.5 },
];

const longPauseThreshold = 500;

const eyeShapePath =
  "M60.4844 8.0332C70.4722 8.36652 79.3045 11.1737 86.9229 15.168L91.2539 7.66797L94.7178 9.66797L90.4111 17.125C102.456 24.3401 111.109 34.2913 116.094 41.0625L116.967 42.249L116.094 43.4346C111.06 50.2723 102.284 60.3509 90.0537 67.582L94.7178 75.6602L91.2539 77.6602L86.5537 69.5205C79.0795 73.3815 70.45 76.091 60.7188 76.4541V85.3281H56.7188V76.4697C46.8739 76.1802 38.1467 73.4883 30.5938 69.6152L25.9492 77.6602L22.4854 75.6602L27.0889 67.6855C14.7669 60.4474 5.9307 50.3051 0.873047 43.4346L0 42.249L0.873047 41.0625C5.8817 34.2586 14.5948 24.2438 26.7305 17.0205L22.4854 9.66797L25.9492 7.66797L30.2246 15.0732C37.8023 11.129 46.5746 8.36358 56.4844 8.0332V0H60.4844V8.0332Z";

function distanceBetween(first: GazePoint, second: GazePoint) {
  return Math.hypot(second.x - first.x, second.y - first.y);
}

function randomItem<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

function pickLongGaze(current: GazePoint) {
  const distantPoints = longGazePoints.filter(
    (point) => distanceBetween(current, point) >= 4.5,
  );

  return randomItem(distantPoints.length > 0 ? distantPoints : longGazePoints);
}

function pickQuickGaze(current: GazePoint) {
  const nearbyPoints = quickGazeOffsets
    .map((offset) => ({
      x: Math.max(-6, Math.min(6, current.x + offset.x)),
      y: Math.max(-4, Math.min(4, current.y + offset.y)),
    }))
    .filter((point) => distanceBetween(current, point) >= 0.9);

  return randomItem(nearbyPoints);
}

type AnimatedEyeProps = {
  initialDelayMs?: number;
};

export function AnimatedEye({ initialDelayMs = 550 }: AnimatedEyeProps) {
  const [gaze, setGaze] = useState<GazePoint>({ x: 0, y: 0 });

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (reducedMotion.matches) {
      return;
    }

    const timers = new Set<number>();
    let currentGaze: GazePoint = { x: 0, y: 0 };
    let lastMoveAt = window.performance.now();

    const schedule = (callback: () => void, delay: number) => {
      const timer = window.setTimeout(() => {
        timers.delete(timer);
        callback();
      }, delay);

      timers.add(timer);
    };

    const moveGaze = () => {
      const now = window.performance.now();
      const hasBeenStill = now - lastMoveAt >= longPauseThreshold;
      const nextGaze = hasBeenStill
        ? pickLongGaze(currentGaze)
        : pickQuickGaze(currentGaze);

      currentGaze = nextGaze;
      lastMoveAt = now;
      setGaze(nextGaze);
    };

    const startGlance = () => {
      const moveCount = Math.random() < 0.45 ? 2 : 1;
      let elapsed = 0;

      for (let move = 0; move < moveCount; move += 1) {
        if (move > 0) {
          elapsed += 120 + Math.random() * 140;
        }

        schedule(moveGaze, elapsed);
      }

      schedule(startGlance, elapsed + 650 + Math.random() * 1_200);
    };

    schedule(startGlance, initialDelayMs + Math.random() * 650);

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [initialDelayMs]);

  return (
    <svg
      className="animated-eye"
      fill="none"
      viewBox="0 0 117 86"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#noticing-eye-opening-clip)">
        <path d={eyeShapePath} fill="#F3F1F1" />
        <g
          className="animated-eye__gaze"
          style={{ transform: `translate(${gaze.x}px, ${gaze.y}px)` }}
        >
        <path
          d="M80.4844 42C80.4844 54.1503 70.6347 64 58.4844 64C46.3341 64 36.4844 54.1503 36.4844 42C36.4844 29.8497 46.3341 20 58.4844 20C70.6347 20 80.4844 29.8497 80.4844 42Z"
          fill="url(#noticing-eye-gradient)"
        />
        <path
          d="M72.4844 42C72.4844 49.732 66.2164 56 58.4844 56C50.7524 56 44.4844 49.732 44.4844 42C44.4844 34.268 50.7524 28 58.4844 28C66.2164 28 72.4844 34.268 72.4844 42Z"
          fill="#1D1816"
        />
        <path
          d="M79.4844 32C79.4844 36.9706 75.4549 41 70.4844 41C65.5138 41 61.4844 36.9706 61.4844 32C61.4844 27.0294 65.5138 23 70.4844 23C75.4549 23 79.4844 27.0294 79.4844 32Z"
          fill="#F3F1F1"
        />
        </g>
      </g>
      <defs>
        <clipPath
          clipPathUnits="userSpaceOnUse"
          id="noticing-eye-opening-clip"
        >
          <path
            className="animated-eye__opening-clip"
            d={eyeShapePath}
            fill="#fff"
          />
        </clipPath>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="noticing-eye-gradient"
          x1="36.4844"
          x2="82.383"
          y1="20"
          y2="22.6482"
        >
          <stop stopColor="#FF0000" />
          <stop offset="1" stopColor="#FFD5AB" />
        </linearGradient>
      </defs>
    </svg>
  );
}
