import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { motion } from "motion/react";
import type {
  ExposureMaskStep,
  PortalMaskRect,
  PresentationCollectionScrollState,
  PresentationPointerPosition,
} from "../../motion-deck/presentation-sync";
import borderUrl from "./border.svg";
import buttonUrl from "./button.svg";
import dateUrl from "./date.svg";
import mapOverflowUrl from "./map-overflow-correct.gif";
import maskBackgroundVideoUrl from "./mask-bg.webm";
import myMindUrl from "./mymind.webp";
import portalDemoUrl from "./portal-demo.html?url";
import releaseUrl from "./release.svg";
import soundfallVideoUrl from "./soundfall.webm";
import { exposureCollectionImages } from "./collection";
import {
  getMasonryColumnScrollDurations,
  partitionBalancedMasonryColumns,
} from "./collection-layout";
import {
  acquireSkyRemembersScore,
  releaseSkyRemembersScore,
} from "./sky-remembers-score";
import type { SkyRemembersIntensity } from "./sky-remembers-score";

export type ExposurePracticeDemoVariant =
  | "map-overflow"
  | "portal"
  | "soundfall";

type ExposurePracticeDemoSlideProps = {
  className?: string;
  isAudioEnabled?: boolean;
  isInteractive?: boolean;
  onPortalMaskRect?: (rect: PortalMaskRect) => void;
  onPortalPointerChange?: (pointer?: PresentationPointerPosition) => void;
  portalMaskRect?: PortalMaskRect;
  shouldPlay?: boolean;
  variant: ExposurePracticeDemoVariant;
};

const portalFrameMessageVersion = 1;

export function ExposurePracticeDemoSlide({
  className = "",
  isAudioEnabled = true,
  isInteractive = true,
  onPortalMaskRect,
  onPortalPointerChange,
  portalMaskRect,
  shouldPlay = true,
  variant,
}: ExposurePracticeDemoSlideProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const postPortalMaskRect = useCallback((rect: PortalMaskRect) => {
    iframeRef.current?.contentWindow?.postMessage({
      type: "portal-mask-state",
      version: portalFrameMessageVersion,
      rect,
    }, "*");
  }, []);

  useEffect(() => {
    if (variant !== "portal") {
      return undefined;
    }

    const handleMessage = (event: MessageEvent<unknown>) => {
      if (event.source !== iframeRef.current?.contentWindow) {
        return;
      }

      const message = parsePortalFrameMessage(event.data);

      if (!message) {
        return;
      }

      if (message.type === "portal-pointer-change") {
        if (isInteractive) {
          onPortalPointerChange?.(message.pointer);
        }
        return;
      }

      if (message.type === "portal-mask-ready" && portalMaskRect) {
        postPortalMaskRect(portalMaskRect);
        return;
      }

      if (isInteractive) {
        onPortalMaskRect?.(message.rect);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [
    isInteractive,
    onPortalMaskRect,
    onPortalPointerChange,
    portalMaskRect,
    postPortalMaskRect,
    variant,
  ]);

  useEffect(() => {
    if (variant === "portal" && portalMaskRect) {
      postPortalMaskRect(portalMaskRect);
    }
  }, [portalMaskRect, postPortalMaskRect, variant]);

  if (variant === "map-overflow") {
    return (
      <div className={`exposure-practice-demo exposure-practice-demo--map ${className}`.trim()}>
        <img
          alt="An animated map expanding beyond its original boundaries"
          className="exposure-practice-demo__map"
          draggable={false}
          src={mapOverflowUrl}
        />
      </div>
    );
  }

  if (variant === "soundfall") {
    return (
      <div className={`exposure-practice-demo exposure-practice-demo--soundfall ${className}`.trim()}>
        <video
          aria-label="Soundfall demonstration"
          autoPlay={shouldPlay}
          className="exposure-practice-demo__video"
          disablePictureInPicture
          muted={!isAudioEnabled}
          playsInline
          preload="auto"
          src={soundfallVideoUrl}
        />
      </div>
    );
  }

  return (
    <div
      className={`exposure-practice-demo exposure-practice-demo--${variant} ${className}`.trim()}
      data-interactive={variant === "portal" ? isInteractive : undefined}
    >
      <iframe
        className="exposure-practice-demo__frame"
        key={variant}
        onLoad={() => {
          if (variant === "portal" && portalMaskRect) {
            postPortalMaskRect(portalMaskRect);
          }
        }}
        referrerPolicy="strict-origin-when-cross-origin"
        ref={iframeRef}
        sandbox={variant === "portal" ? "allow-scripts" : undefined}
        src={portalDemoUrl}
        title="Interactive portal demo"
      />
    </div>
  );
}

type PortalMaskFrameMessage = {
  type: "portal-mask-change" | "portal-mask-ready";
  version: typeof portalFrameMessageVersion;
  rect: PortalMaskRect;
};

type PortalPointerFrameMessage = {
  type: "portal-pointer-change";
  version: typeof portalFrameMessageVersion;
  pointer?: PresentationPointerPosition;
};

type PortalFrameMessage = PortalMaskFrameMessage | PortalPointerFrameMessage;

function parsePortalFrameMessage(value: unknown): PortalFrameMessage | undefined {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return undefined;
  }

  const message = value as Record<string, unknown>;

  if (message.version !== portalFrameMessageVersion) {
    return undefined;
  }

  if (
    message.type === "portal-pointer-change" &&
    (message.pointer === undefined || isNormalizedPoint(message.pointer))
  ) {
    return message as PortalPointerFrameMessage;
  }

  if (
    (message.type === "portal-mask-change" || message.type === "portal-mask-ready") &&
    isPortalMaskRect(message.rect)
  ) {
    return message as PortalMaskFrameMessage;
  }

  return undefined;
}

function isNormalizedPoint(value: unknown): value is PresentationPointerPosition {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const point = value as Record<string, unknown>;
  return [point.x, point.y].every((coordinate) => (
    typeof coordinate === "number" &&
    Number.isFinite(coordinate) &&
    coordinate >= 0 &&
    coordinate <= 1
  ));
}

function isPortalMaskRect(value: unknown): value is PortalMaskRect {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const rect = value as Record<string, unknown>;
  const coordinates = [rect.x, rect.y, rect.width, rect.height];

  return coordinates.every((coordinate) => (
    typeof coordinate === "number" &&
    Number.isFinite(coordinate) &&
    coordinate >= 0 &&
    coordinate <= 1
  )) &&
    typeof rect.x === "number" &&
    typeof rect.y === "number" &&
    typeof rect.width === "number" &&
    typeof rect.height === "number" &&
    rect.width > 0 &&
    rect.height > 0 &&
    rect.x + rect.width <= 1 &&
    rect.y + rect.height <= 1;
}

type ExposurePracticeMyMindSlideProps = {
  className?: string;
  isAnimated?: boolean;
  loadImagesEagerly?: boolean;
  scrollState?: PresentationCollectionScrollState;
};

type ExposurePracticeCollectionSlideProps = {
  className?: string;
  isAnimated?: boolean;
  loadImagesEagerly?: boolean;
  onScrollStateChange?: (state: PresentationCollectionScrollState) => void;
  scrollState?: PresentationCollectionScrollState;
};

const revealEase = [0.16, 1, 0.3, 1] as const;

type ExposureAnimatedMaskStep = 0 | ExposureMaskStep;

type ExposureThresholdRect = {
  height: number;
  width: number;
  x: number;
  y: number;
};

type ExposureThresholds = {
  inner: ExposureThresholdRect;
  outer: ExposureThresholdRect;
};

const exposureMaskDesignWidth = 3840;
const exposureMaskDesignHeight = 2112;
const exposureThresholds: ExposureThresholds = {
  inner: {
    x: 927,
    y: 1170,
    width: 1986,
    height: 801,
  },
  outer: {
    x: 452.5,
    y: 562,
    width: 2935,
    height: 1550,
  },
};

const exposureMaskPaths: Record<ExposureAnimatedMaskStep, string> = {
  0: "M1775 1520 L1775 1520 C1775 1520 1775 1520 1920 1520 C2065 1520 2065 1520 2065 1520 L2065 1520 L1775 1520 Z",
  1: "M1775 1520 L1775 1130 C1775 1049.92 1839.92 985 1920 985 C2000.08 985 2065 1049.92 2065 1130 L2065 1520 L1775 1520 Z",
  2: "M1775 2112 L1775 0 C1775 0 1775 0 1775 0 C2065 0 2065 0 2065 0 L2065 2112 L1775 2112 Z",
  3: "M1775 2112 L1026 0 C1026 0 1026 0 1026 0 C2814 0 2814 0 2814 0 L2065 2112 L1775 2112 Z",
  4: "M0 2112 L0 0 C0 0 0 0 0 0 C3840 0 3840 0 3840 0 L3840 2112 L0 2112 Z",
};

const exposureMaskIntroTransition = {
  duration: 0.58,
  ease: revealEase,
};

const exposureMaskProximityTransition = {
  duration: 0.2,
  ease: revealEase,
};

type ExposurePracticeMaskSlideProps = {
  className?: string;
  isAnimated?: boolean;
  isAudioEnabled?: boolean;
  isInteractive?: boolean;
  maskStep?: ExposureMaskStep;
  onInteractionChange?: (
    pointer: PresentationPointerPosition | undefined,
    maskStep: ExposureMaskStep,
  ) => void;
};

export function ExposurePracticeMaskSlide({
  className = "",
  isAnimated = true,
  isAudioEnabled = true,
  isInteractive = true,
  maskStep,
  onInteractionChange,
}: ExposurePracticeMaskSlideProps) {
  const clipId = `exposure-mask-${useId().replaceAll(":", "")}`;
  const slideRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const lastPointerRef = useRef<PresentationPointerPosition | undefined>(undefined);
  const scoreRef = useRef<ReturnType<typeof acquireSkyRemembersScore> | null>(null);
  const [isIntroComplete, setIsIntroComplete] = useState(!isAnimated);
  const [localMaskStep, setLocalMaskStep] = useState<ExposureMaskStep>(1);
  const activeMaskStep = maskStep ?? localMaskStep;

  useEffect(() => {
    if (!isAudioEnabled) {
      return undefined;
    }

    const score = acquireSkyRemembersScore();
    scoreRef.current = score;
    score.setIntensity(activeMaskStep as SkyRemembersIntensity);

    return () => {
      scoreRef.current = null;
      releaseSkyRemembersScore();
    };
  }, [isAudioEnabled]);

  useEffect(() => {
    scoreRef.current?.setIntensity(activeMaskStep as SkyRemembersIntensity);
  }, [activeMaskStep]);

  const updateInteraction = (
    pointer: PresentationPointerPosition | undefined,
    nextMaskStep: ExposureMaskStep,
  ) => {
    setLocalMaskStep((currentStep) => (
      currentStep === nextMaskStep ? currentStep : nextMaskStep
    ));
    scoreRef.current?.setIntensity(nextMaskStep as SkyRemembersIntensity);
    onInteractionChange?.(pointer, nextMaskStep);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isInteractive || !slideRef.current) {
      return;
    }

    const slideRect = slideRef.current.getBoundingClientRect();
    const pointerX = (event.clientX - slideRect.left) * exposureMaskDesignWidth / slideRect.width;
    const pointerY = (event.clientY - slideRect.top) * exposureMaskDesignHeight / slideRect.height;
    const pointer = {
      x: Math.min(1, Math.max(0, pointerX / exposureMaskDesignWidth)),
      y: Math.min(1, Math.max(0, pointerY / exposureMaskDesignHeight)),
    };
    lastPointerRef.current = pointer;

    if (!isIntroComplete || !buttonRef.current) {
      onInteractionChange?.(pointer, activeMaskStep);
      return;
    }

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const isInsideButton = (
      event.clientX >= buttonRect.left &&
      event.clientX <= buttonRect.right &&
      event.clientY >= buttonRect.top &&
      event.clientY <= buttonRect.bottom
    );
    const nextStep: ExposureMaskStep = isInsideButton
      ? 4
      : isPointInsideExposureThreshold(pointerX, pointerY, exposureThresholds.inner)
        ? 3
        : isPointInsideExposureThreshold(pointerX, pointerY, exposureThresholds.outer)
          ? 2
          : 1;

    updateInteraction(pointer, nextStep);
  };

  return (
    <div
      className={`exposure-practice-mask ${className}`.trim()}
      data-audio-intensity={isAudioEnabled ? activeMaskStep : undefined}
      onPointerDown={isAudioEnabled
        ? () => scoreRef.current?.setIntensity(activeMaskStep as SkyRemembersIntensity)
        : undefined}
      onPointerLeave={isInteractive ? () => {
        lastPointerRef.current = undefined;
        updateInteraction(undefined, 1);
      } : undefined}
      onPointerMove={isInteractive ? handlePointerMove : undefined}
      ref={slideRef}
    >
      <img
        alt=""
        aria-hidden="true"
        className="exposure-practice-mask__border"
        draggable={false}
        src={borderUrl}
      />

      <svg
        aria-hidden="true"
        className="exposure-practice-mask__artwork"
        preserveAspectRatio="none"
        viewBox="0 0 3840 2112"
      >
        <defs>
          <clipPath id={clipId}>
            <motion.path
              animate={{ d: exposureMaskPaths[activeMaskStep] }}
              initial={isAnimated ? { d: exposureMaskPaths[0] } : false}
              onAnimationComplete={() => setIsIntroComplete(true)}
              transition={
                isIntroComplete
                  ? exposureMaskProximityTransition
                  : exposureMaskIntroTransition
              }
            />
          </clipPath>
        </defs>
        <foreignObject
          clipPath={`url(#${clipId})`}
          height="2422"
          width="4301"
          x="-230.5"
          y="5"
        >
          <video
            aria-hidden="true"
            autoPlay
            className="exposure-practice-mask__video"
            disablePictureInPicture
            loop
            muted
            playsInline
            preload="auto"
            src={maskBackgroundVideoUrl}
          />
        </foreignObject>
      </svg>

      <motion.div
        animate={{ y: 0 }}
        aria-hidden="true"
        className="exposure-practice-mask__title exposure-practice-mask__title--shadow-overlay"
        initial={isAnimated ? { y: "61%" } : false}
        transition={exposureMaskIntroTransition}
      >
        The Sky Remembers
      </motion.div>

      <motion.div
        animate={{ y: 0 }}
        aria-hidden="true"
        className="exposure-practice-mask__title exposure-practice-mask__title--shadow-soft-light"
        initial={isAnimated ? { y: "61%" } : false}
        transition={exposureMaskIntroTransition}
      >
        The Sky Remembers
      </motion.div>

      <motion.h1
        animate={{ y: 0 }}
        className="exposure-practice-mask__title exposure-practice-mask__title--foreground"
        initial={isAnimated ? { y: "61%" } : false}
        transition={exposureMaskIntroTransition}
      >
        The Sky Remembers
      </motion.h1>

      <motion.button
        animate={{ y: 0 }}
        aria-label="Preorder The Sky Remembers"
        className="exposure-practice-mask__button"
        initial={isAnimated ? { y: "-184%" } : false}
        onBlur={isInteractive ? () => updateInteraction(undefined, 1) : undefined}
        onFocus={isInteractive
          ? () => updateInteraction(lastPointerRef.current, 4)
          : undefined}
        ref={buttonRef}
        tabIndex={isInteractive ? 0 : -1}
        transition={exposureMaskIntroTransition}
        type="button"
      >
        <img
          alt=""
          aria-hidden="true"
          className="exposure-practice-mask__button-artwork"
          draggable={false}
          src={buttonUrl}
        />
      </motion.button>

      <img
        alt="Release date"
        className="exposure-practice-mask__release"
        draggable={false}
        src={releaseUrl}
      />
      <img
        alt="January 23, 2027"
        className="exposure-practice-mask__date"
        draggable={false}
        src={dateUrl}
      />
    </div>
  );
}

function isPointInsideExposureThreshold(
  x: number,
  y: number,
  rect: ExposureThresholdRect,
) {
  return (
    x >= rect.x &&
    x <= rect.x + rect.width &&
    y >= rect.y &&
    y <= rect.y + rect.height
  );
}

export function ExposurePracticeMyMindSlide({
  className = "",
  isAnimated = true,
  loadImagesEagerly = false,
  scrollState,
}: ExposurePracticeMyMindSlideProps) {
  return (
    <div className={`exposure-practice-mymind ${className}`.trim()}>
      <ExposurePracticeCollectionSlide
        className="exposure-practice-mymind__base"
        isAnimated={isAnimated}
        loadImagesEagerly={loadImagesEagerly}
        scrollState={scrollState}
      />

      <motion.div
        animate={{ opacity: 1 }}
        aria-hidden="true"
        className="exposure-practice-mymind__veil"
        initial={isAnimated ? { opacity: 0 } : false}
        transition={{ duration: 0.18, ease: revealEase }}
      />

      <div className="exposure-practice-mymind__artwork-position">
        <motion.div
          animate={{ opacity: 1, scale: 1 }}
          className="exposure-practice-mymind__artwork"
          initial={isAnimated ? { opacity: 0, scale: 0.88 } : false}
          transition={{ delay: 0.06, duration: 0.21, ease: revealEase }}
        >
          <img
            alt="MyMind"
            className="exposure-practice-mymind__image"
            draggable={false}
            src={myMindUrl}
          />
        </motion.div>
      </div>
    </div>
  );
}

const collectionPreviewImageCount = 12;
const collectionColumnCount = 4;
const collectionTrackCopies = [0, 1] as const;
const collectionScrollDurationMs = 180_000;
const collectionScrollSpeed = 4;

export function ExposurePracticeCollectionSlide({
  className = "",
  isAnimated = true,
  loadImagesEagerly = false,
  onScrollStateChange,
  scrollState,
}: ExposurePracticeCollectionSlideProps) {
  const initialScrollStateRef = useRef<PresentationCollectionScrollState>({
    startedAt: Date.now(),
    speed: collectionScrollSpeed,
  });
  const effectiveScrollState = scrollState ?? initialScrollStateRef.current;
  const images = isAnimated
    ? exposureCollectionImages
    : exposureCollectionImages.slice(0, collectionPreviewImageCount);
  const copies = isAnimated ? collectionTrackCopies : collectionTrackCopies.slice(0, 1);
  const elapsedMs = Math.max(0, Date.now() - effectiveScrollState.startedAt);
  const columns = partitionBalancedMasonryColumns(images, collectionColumnCount);
  const columnScrollDurations = getMasonryColumnScrollDurations(
    columns,
    collectionScrollDurationMs / effectiveScrollState.speed,
  );
  const collectionStyle = {
    "--exposure-collection-scroll-delay": `${-elapsedMs}ms`,
  } as CSSProperties;

  useEffect(() => {
    if (!isAnimated || scrollState) {
      return;
    }

    onScrollStateChange?.(initialScrollStateRef.current);
  }, [isAnimated, onScrollStateChange, scrollState]);

  return (
    <div
      aria-label="A scrolling collection of visual inspiration"
      className={`exposure-practice-collection${isAnimated ? " exposure-practice-collection--animated" : ""} ${className}`.trim()}
      data-scroll-speed={effectiveScrollState.speed}
      role="img"
      style={collectionStyle}
    >
      <div aria-hidden="true" className="exposure-practice-collection__viewport">
        {columns.map((column, columnIndex) => (
          <div
            className="exposure-practice-collection__column"
            key={column[0]?.src ?? columnIndex}
          >
            <div
              className="exposure-practice-collection__column-track"
              style={{
                "--exposure-collection-scroll-duration":
                  `${columnScrollDurations[columnIndex]}ms`,
              } as CSSProperties}
            >
              {copies.map((copyIndex) => (
                <div
                  className="exposure-practice-collection__column-sequence"
                  key={copyIndex}
                >
                  {column.map((image) => (
                    <div
                      className="exposure-practice-collection__item"
                      key={`${copyIndex}-${image.src}`}
                    >
                      <img
                        alt=""
                        className="exposure-practice-collection__image"
                        decoding="async"
                        draggable={false}
                        height={image.height}
                        loading={loadImagesEagerly ? "eager" : "lazy"}
                        src={image.src}
                        width={image.width}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
