import { useId, useLayoutEffect, useState } from "react";
import { motion } from "motion/react";
import aperture1Url from "./aperture-1.svg";
import aperture2Url from "./aperture-2.svg";
import aperture3Url from "./aperture-3.svg";
import aperture4Url from "./aperture-4.svg";

export type ApertureSlideVariant = "small" | "expanded" | "focus" | "network";

type ApertureSlideProps = {
  className?: string;
  isAnimated?: boolean;
  variant?: ApertureSlideVariant;
};

const VIEWBOX_WIDTH = 2421;
const VIEWBOX_HEIGHT = 1269;
const CENTER_X = 1209.667;
const CENTER_Y = 633.667;
const APERTURE_ONE_X = CENTER_X - 41.667;
const APERTURE_ONE_Y = CENTER_Y - 41.667;
const APERTURE_THREE_X = CENTER_X - 752;
const APERTURE_THREE_Y = CENTER_Y - 752;
const APERTURE_FOUR_X = CENTER_X - 956.667;
const APERTURE_FOUR_Y = CENTER_Y - 41.667;

const smallCornerPaths = [
  `M ${APERTURE_ONE_X + 29.167} ${APERTURE_ONE_Y + 4.167} H ${APERTURE_ONE_X + 4.167} V ${APERTURE_ONE_Y + 29.167}`,
  `M ${APERTURE_ONE_X + 54.167} ${APERTURE_ONE_Y + 4.167} H ${APERTURE_ONE_X + 79.167} V ${APERTURE_ONE_Y + 29.167}`,
  `M ${APERTURE_ONE_X + 79.167} ${APERTURE_ONE_Y + 54.167} V ${APERTURE_ONE_Y + 79.167} H ${APERTURE_ONE_X + 54.167}`,
  `M ${APERTURE_ONE_X + 29.167} ${APERTURE_ONE_Y + 79.167} H ${APERTURE_ONE_X + 4.167} V ${APERTURE_ONE_Y + 54.167}`,
] as const;

const expandedCornerPaths = [
  "M 149.168 4.167 H 4.167 V 149.167",
  "M 2271 4.167 H 2416 V 149.167",
  "M 2416 1119 V 1264 H 2271",
  "M 149.167 1264 H 4.167 V 1119",
] as const;

const settleDurations: Record<ApertureSlideVariant, number> = {
  small: 1250,
  expanded: 900,
  focus: 1000,
  network: 1450,
};

const easeOut = [0.16, 1, 0.3, 1] as const;

export function ApertureSlide({
  className = "",
  isAnimated = true,
  variant = "small",
}: ApertureSlideProps) {
  const id = useId().replace(/:/g, "");
  const gradientId = `aperture-gradient-${id}`;
  const smallGradientId = `aperture-small-gradient-${id}`;
  const leftIconClipId = `aperture-left-icon-${id}`;
  const centerIconClipId = `aperture-center-icon-${id}`;
  const rightIconClipId = `aperture-right-icon-${id}`;
  const leftLineClipId = `aperture-left-line-${id}`;
  const rightLineClipId = `aperture-right-line-${id}`;
  const [settledVariant, setSettledVariant] = useState<ApertureSlideVariant | null>(
    isAnimated ? null : variant,
  );
  const [isNetworkSpread, setIsNetworkSpread] = useState(
    variant === "network" && !isAnimated,
  );

  useLayoutEffect(() => {
    if (!isAnimated) {
      setIsNetworkSpread(variant === "network");
      setSettledVariant(variant);
      return;
    }

    setSettledVariant(null);
    setIsNetworkSpread(false);

    const networkTimer = variant === "network"
      ? window.setTimeout(() => setIsNetworkSpread(true), 520)
      : undefined;
    const settleTimer = window.setTimeout(
      () => setSettledVariant(variant),
      settleDurations[variant],
    );

    return () => {
      if (networkTimer != null) {
        window.clearTimeout(networkTimer);
      }
      window.clearTimeout(settleTimer);
    };
  }, [isAnimated, variant]);

  const isSmall = variant === "small";
  const isExpanded = variant === "expanded";
  const isFocus = variant === "focus";
  const isNetwork = variant === "network";
  const cornerPaths = isExpanded || isFocus ? expandedCornerPaths : smallCornerPaths;
  const cornerOpacity = isFocus || (isNetwork && isNetworkSpread) ? 0 : 1;
  const ringRadius = isFocus ? 752 : 12.5;
  const ringOpacity = isNetwork && isNetworkSpread ? 0 : 1;
  const showSettledAsset = settledVariant === variant;
  const activeGradientId = isSmall ? smallGradientId : gradientId;
  const focusGlyphScale = isFocus ? 1 : isNetwork && !isNetworkSpread ? 0.737 : 0.1;
  const focusGlyphOpacity = isFocus ? 1 : 0;

  return (
    <div className={`aperture-slide ${className}`.trim()}>
      <motion.svg
        aria-label="Change your aperture"
        className="aperture-slide__stage"
        initial={false}
        viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
      >
        <defs>
          <linearGradient
            gradientUnits="userSpaceOnUse"
            id={gradientId}
            x1="0"
            x2="2502.66"
            y1="0"
            y2="275.562"
          >
            <stop stopColor="#ff0000" />
            <stop offset="1" stopColor="#ffd5ab" />
          </linearGradient>
          <linearGradient
            gradientUnits="userSpaceOnUse"
            id={smallGradientId}
            x1={APERTURE_ONE_X}
            x2={APERTURE_ONE_X + 86.93}
            y1={APERTURE_ONE_Y}
            y2={APERTURE_ONE_Y + 5.016}
          >
            <stop stopColor="#ff0000" />
            <stop offset="1" stopColor="#ffd5ab" />
          </linearGradient>

          <clipPath id={leftIconClipId}>
            <rect height="84" width="84" x={APERTURE_FOUR_X} y={APERTURE_FOUR_Y} />
          </clipPath>
          <clipPath id={centerIconClipId}>
            <rect height="84" width="84" x={APERTURE_FOUR_X + 915} y={APERTURE_FOUR_Y} />
          </clipPath>
          <clipPath id={rightIconClipId}>
            <rect height="84" width="84" x={APERTURE_FOUR_X + 1831} y={APERTURE_FOUR_Y} />
          </clipPath>
          <clipPath id={leftLineClipId}>
            <motion.rect
              animate={isNetworkSpread
                ? { width: 768, x: APERTURE_FOUR_X + 115 }
                : { width: 0, x: APERTURE_FOUR_X + 883 }}
              height="84"
              initial={false}
              transition={{ delay: 0.08, duration: 0.62, ease: easeOut }}
              y={APERTURE_FOUR_Y}
            />
          </clipPath>
          <clipPath id={rightLineClipId}>
            <motion.rect
              animate={{ width: isNetworkSpread ? 768 : 0 }}
              height="84"
              initial={false}
              transition={{ delay: 0.08, duration: 0.62, ease: easeOut }}
              x={APERTURE_FOUR_X + 1031}
              y={APERTURE_FOUR_Y}
            />
          </clipPath>
        </defs>

        <motion.g
          animate={{ opacity: cornerOpacity, scale: isFocus ? 1.035 : 1 }}
          initial={false}
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
          transition={{ duration: isFocus ? 0.42 : 0.72, ease: easeOut }}
        >
          {cornerPaths.map((path, index) => (
            <motion.path
              animate={{ d: path, opacity: 1, pathLength: 1 }}
              d={path}
              fill="none"
              initial={isSmall && isAnimated ? { opacity: 0, pathLength: 0 } : false}
              key={index}
              stroke={`url(#${activeGradientId})`}
              strokeLinejoin="miter"
              strokeWidth="8.334"
              transition={isSmall
                ? {
                    delay: 0.28,
                    duration: 0.42,
                    ease: easeOut,
                  }
                : {
                    duration: isExpanded ? 0.78 : isNetwork ? 0.52 : 0.5,
                    ease: easeOut,
                  }}
            />
          ))}
        </motion.g>

        <motion.circle
          animate={{ opacity: ringOpacity, r: ringRadius }}
          cx={CENTER_X}
          cy={CENTER_Y}
          fill="none"
          initial={isSmall && isAnimated ? { opacity: 0, r: 4 } : false}
          stroke={`url(#${activeGradientId})`}
          strokeWidth="8.334"
          transition={isSmall
            ? { duration: 0.34, ease: easeOut }
            : isFocus
              ? { duration: 0.88, ease: easeOut }
              : isNetwork
                ? { duration: 0.52, ease: easeOut }
                : { duration: 0.42, ease: easeOut }}
        />

        <motion.g
          animate={{ opacity: focusGlyphOpacity, scale: focusGlyphScale }}
          initial={false}
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
          transition={{
            delay: isFocus ? 0.38 : 0,
            duration: isFocus ? 0.42 : isNetwork ? 0.52 : 0.24,
            ease: easeOut,
          }}
        >
          <path
            d={`M ${CENTER_X + 4} ${CENTER_Y + 57} H ${CENTER_X - 4} V ${CENTER_Y + 41} H ${CENTER_X - 41} V ${CENTER_Y + 4} H ${CENTER_X - 57} V ${CENTER_Y - 4} H ${CENTER_X - 41} V ${CENTER_Y - 41} H ${CENTER_X - 4} V ${CENTER_Y - 57} H ${CENTER_X + 4} V ${CENTER_Y - 41} H ${CENTER_X + 41} V ${CENTER_Y - 4} H ${CENTER_X + 57} V ${CENTER_Y + 4} H ${CENTER_X + 41} V ${CENTER_Y + 41} H ${CENTER_X + 4} V ${CENTER_Y + 57} Z M ${CENTER_X - 33} ${CENTER_Y + 33} H ${CENTER_X + 33} V ${CENTER_Y - 33} H ${CENTER_X - 33} V ${CENTER_Y + 33} Z M ${CENTER_X + 4} ${CENTER_Y - 4} H ${CENTER_X + 16} V ${CENTER_Y + 4} H ${CENTER_X + 4} V ${CENTER_Y + 16} H ${CENTER_X - 4} V ${CENTER_Y + 4} H ${CENTER_X - 16} V ${CENTER_Y - 4} H ${CENTER_X - 4} V ${CENTER_Y - 16} H ${CENTER_X + 4} V ${CENTER_Y - 4} Z`}
            fill={`url(#${gradientId})`}
            fillRule="evenodd"
          />
        </motion.g>

        {isNetwork ? (
          <motion.g animate={{ opacity: isNetworkSpread ? 1 : 0 }} initial={false}>
            <image clipPath={`url(#${leftLineClipId})`} height="84" href={aperture4Url} width="1915" x={APERTURE_FOUR_X} y={APERTURE_FOUR_Y} />
            <image clipPath={`url(#${rightLineClipId})`} height="84" href={aperture4Url} width="1915" x={APERTURE_FOUR_X} y={APERTURE_FOUR_Y} />

            <motion.g
              animate={{ x: isNetworkSpread ? 0 : 915 }}
              clipPath={`url(#${leftIconClipId})`}
              initial={false}
              transition={{ duration: 0.68, ease: easeOut }}
            >
              <image height="84" href={aperture4Url} width="1915" x={APERTURE_FOUR_X} y={APERTURE_FOUR_Y} />
            </motion.g>
            <image clipPath={`url(#${centerIconClipId})`} height="84" href={aperture4Url} width="1915" x={APERTURE_FOUR_X} y={APERTURE_FOUR_Y} />
            <motion.g
              animate={{ x: isNetworkSpread ? 0 : -916 }}
              clipPath={`url(#${rightIconClipId})`}
              initial={false}
              transition={{ duration: 0.68, ease: easeOut }}
            >
              <image height="84" href={aperture4Url} width="1915" x={APERTURE_FOUR_X} y={APERTURE_FOUR_Y} />
            </motion.g>
          </motion.g>
        ) : null}

        <motion.image animate={{ opacity: showSettledAsset && isSmall ? 1 : 0 }} height="84" href={aperture1Url} initial={false} transition={{ duration: 0.1 }} width="84" x={APERTURE_ONE_X} y={APERTURE_ONE_Y} />
        <motion.image animate={{ opacity: showSettledAsset && isExpanded ? 1 : 0 }} height="1269" href={aperture2Url} initial={false} transition={{ duration: 0.1 }} width="2421" x="0" y="0" />
        <motion.image animate={{ opacity: showSettledAsset && isFocus ? 1 : 0 }} height="1504" href={aperture3Url} initial={false} transition={{ duration: 0.1 }} width="1504" x={APERTURE_THREE_X} y={APERTURE_THREE_Y} />
        <motion.image animate={{ opacity: showSettledAsset && isNetwork ? 1 : 0 }} height="84" href={aperture4Url} initial={false} transition={{ duration: 0.1 }} width="1915" x={APERTURE_FOUR_X} y={APERTURE_FOUR_Y} />
      </motion.svg>
    </div>
  );
}
