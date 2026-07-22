import { createFrameHash } from "./navigation.js";
import type { DeckDirection } from "./navigation.js";

export const presentationChannelName = "patterns-for-creativity-presentation";
export const presentationMessageVersion = 1;
export const audienceBlackoutSearchParameter = "blackout";

export type DeckViewMode = "deck" | "presenter" | "audience";
export type AudienceConnectionStatus =
  | "opening"
  | "connected"
  | "disconnected"
  | "closed"
  | "popup-blocked";

export type PresentationStateMessage = {
  type: "presentation-state";
  version: typeof presentationMessageVersion;
  sessionId: string;
  revision: number;
  direction: DeckDirection;
  frameIndex: number;
  isAudienceBlackout: boolean;
};

export type ScratchSegment = {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
};

export type PresentationScratchMessage = {
  type: "presentation-scratch";
  version: typeof presentationMessageVersion;
  sessionId: string;
  revision: number;
  mode: "append" | "replace";
  segments: ScratchSegment[];
};

export type PortalMaskRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type PresentationPortalMaskMessage = {
  type: "presentation-portal-mask";
  version: typeof presentationMessageVersion;
  sessionId: string;
  revision: number;
  rect: PortalMaskRect;
};

export type PresentationPointerPosition = {
  x: number;
  y: number;
};

export type ExposureMaskStep = 1 | 2 | 3 | 4;

export type PresentationCollectionScrollState = {
  startedAt: number;
  speed: number;
};

export type PresentationInteractionState = {
  frameId: string;
  pointer?: PresentationPointerPosition;
  exposureCollectionScroll?: PresentationCollectionScrollState;
  exposureMaskStep?: ExposureMaskStep;
  exposureScoreId?: string;
};

export type PresentationInteractionMessage = {
  type: "presentation-interaction";
  version: typeof presentationMessageVersion;
  sessionId: string;
  revision: number;
  state: PresentationInteractionState;
};

export type AudiencePresenceMessage = {
  type: "audience-ready" | "audience-heartbeat" | "audience-closing";
  version: typeof presentationMessageVersion;
  audienceId: string;
};

export type PresentationMessage =
  | PresentationStateMessage
  | PresentationScratchMessage
  | PresentationPortalMaskMessage
  | PresentationInteractionMessage
  | AudiencePresenceMessage;

export type PresentationStateCursor = {
  sessionId?: string;
  revision: number;
  retiredSessionIds: readonly string[];
};

export type PresentationScratchCursor = PresentationStateCursor;
export type PresentationPortalMaskCursor = PresentationStateCursor;
export type PresentationInteractionCursor = PresentationStateCursor;

export type AudienceConnectionState = {
  status: AudienceConnectionStatus;
  audienceId?: string;
  lastSeenAt?: number;
};

export type AudienceConnectionEvent =
  | { type: "open-requested"; at: number }
  | { type: "popup-blocked" }
  | { type: "audience-ready"; audienceId: string; at: number }
  | { type: "audience-heartbeat"; audienceId: string; at: number }
  | { type: "audience-closing"; audienceId: string }
  | { type: "connection-timeout" }
  | { type: "window-closed" };

export function getDeckViewMode(search: string): DeckViewMode {
  const view = new URLSearchParams(search).get("view");

  if (view === "presenter" || view === "audience") {
    return view;
  }

  return "deck";
}

export function createAudienceDisplayUrl(
  currentHref: string,
  frameIndex: number,
  frameCount: number,
  isAudienceBlackout = false,
) {
  const url = new URL(currentHref);
  url.searchParams.set("view", "audience");
  updateAudienceBlackoutSearchParameter(url, isAudienceBlackout);
  url.hash = createFrameHash(frameIndex, frameCount);

  return url.toString();
}

export function createAudienceBlackoutUrl(
  currentHref: string,
  isAudienceBlackout: boolean,
) {
  const url = new URL(currentHref);
  updateAudienceBlackoutSearchParameter(url, isAudienceBlackout);
  return url.toString();
}

export function getInitialAudienceBlackout(search: string) {
  return new URLSearchParams(search).get(audienceBlackoutSearchParameter) === "1";
}

export function createPresentationStateMessage(
  sessionId: string,
  revision: number,
  frameIndex: number,
  direction: DeckDirection,
  isAudienceBlackout = false,
): PresentationStateMessage {
  return {
    type: "presentation-state",
    version: presentationMessageVersion,
    sessionId,
    revision,
    direction,
    frameIndex,
    isAudienceBlackout,
  };
}

export function createPresentationScratchMessage(
  sessionId: string,
  revision: number,
  mode: PresentationScratchMessage["mode"],
  segments: readonly ScratchSegment[],
): PresentationScratchMessage {
  return {
    type: "presentation-scratch",
    version: presentationMessageVersion,
    sessionId,
    revision,
    mode,
    segments: [...segments],
  };
}

export function createPresentationScratchSnapshot(
  sessionId: string,
  revision: number,
  segments: readonly ScratchSegment[],
): PresentationScratchMessage {
  return createPresentationScratchMessage(
    sessionId,
    revision,
    "replace",
    segments,
  );
}

export function createPresentationPortalMaskMessage(
  sessionId: string,
  revision: number,
  rect: PortalMaskRect,
): PresentationPortalMaskMessage {
  return {
    type: "presentation-portal-mask",
    version: presentationMessageVersion,
    sessionId,
    revision,
    rect,
  };
}

export function createPresentationInteractionMessage(
  sessionId: string,
  revision: number,
  state: PresentationInteractionState,
): PresentationInteractionMessage {
  return {
    type: "presentation-interaction",
    version: presentationMessageVersion,
    sessionId,
    revision,
    state,
  };
}

export function createAudiencePresenceMessage(
  type: AudiencePresenceMessage["type"],
  audienceId: string,
): AudiencePresenceMessage {
  return {
    type,
    version: presentationMessageVersion,
    audienceId,
  };
}

export function parsePresentationMessage(
  value: unknown,
  frameCount: number,
): PresentationMessage | undefined {
  if (!isRecord(value) || value.version !== presentationMessageVersion) {
    return undefined;
  }

  if (
    (value.type === "audience-ready" ||
      value.type === "audience-heartbeat" ||
      value.type === "audience-closing") &&
    isNonEmptyString(value.audienceId)
  ) {
    return {
      type: value.type,
      version: presentationMessageVersion,
      audienceId: value.audienceId,
    };
  }

  if (
    value.type === "presentation-scratch" &&
    isNonEmptyString(value.sessionId) &&
    isNonNegativeInteger(value.revision) &&
    (value.mode === "append" || value.mode === "replace") &&
    Array.isArray(value.segments) &&
    value.segments.every(isScratchSegment)
  ) {
    return {
      type: "presentation-scratch",
      version: presentationMessageVersion,
      sessionId: value.sessionId,
      revision: value.revision,
      mode: value.mode,
      segments: value.segments,
    };
  }

  if (
    value.type === "presentation-portal-mask" &&
    isNonEmptyString(value.sessionId) &&
    isNonNegativeInteger(value.revision) &&
    isPortalMaskRect(value.rect)
  ) {
    return {
      type: "presentation-portal-mask",
      version: presentationMessageVersion,
      sessionId: value.sessionId,
      revision: value.revision,
      rect: value.rect,
    };
  }

  if (
    value.type === "presentation-interaction" &&
    isNonEmptyString(value.sessionId) &&
    isNonNegativeInteger(value.revision) &&
    isPresentationInteractionState(value.state)
  ) {
    return {
      type: "presentation-interaction",
      version: presentationMessageVersion,
      sessionId: value.sessionId,
      revision: value.revision,
      state: value.state,
    };
  }

  if (
    value.type !== "presentation-state" ||
    !isNonEmptyString(value.sessionId) ||
    !isNonNegativeInteger(value.revision) ||
    (value.direction !== -1 && value.direction !== 1) ||
    !isNonNegativeInteger(value.frameIndex) ||
    value.frameIndex >= frameCount ||
    typeof value.isAudienceBlackout !== "boolean"
  ) {
    return undefined;
  }

  return {
    type: "presentation-state",
    version: presentationMessageVersion,
    sessionId: value.sessionId,
    revision: value.revision,
    direction: value.direction,
    frameIndex: value.frameIndex,
    isAudienceBlackout: value.isAudienceBlackout,
  };
}

export function createPresentationStateCursor(): PresentationStateCursor {
  return {
    revision: -1,
    retiredSessionIds: [],
  };
}

export function createPresentationScratchCursor(): PresentationScratchCursor {
  return createPresentationStateCursor();
}

export function createPresentationPortalMaskCursor(): PresentationPortalMaskCursor {
  return createPresentationStateCursor();
}

export function createPresentationInteractionCursor(): PresentationInteractionCursor {
  return createPresentationStateCursor();
}

export function acceptPresentationState(
  cursor: PresentationStateCursor,
  message: PresentationStateMessage,
): { accepted: boolean; cursor: PresentationStateCursor } {
  return acceptRevisionedMessage(cursor, message);
}

function acceptRevisionedMessage(
  cursor: PresentationStateCursor,
  message: Pick<PresentationStateMessage, "sessionId" | "revision">,
): { accepted: boolean; cursor: PresentationStateCursor } {
  if (cursor.retiredSessionIds.includes(message.sessionId)) {
    return { accepted: false, cursor };
  }

  if (cursor.sessionId === message.sessionId) {
    if (message.revision <= cursor.revision) {
      return { accepted: false, cursor };
    }

    return {
      accepted: true,
      cursor: {
        ...cursor,
        revision: message.revision,
      },
    };
  }

  return {
    accepted: true,
    cursor: {
      sessionId: message.sessionId,
      revision: message.revision,
      retiredSessionIds: cursor.sessionId
        ? [...cursor.retiredSessionIds, cursor.sessionId]
        : cursor.retiredSessionIds,
    },
  };
}

export function acceptPresentationScratchState(
  cursor: PresentationScratchCursor,
  message: PresentationScratchMessage,
): { accepted: boolean; cursor: PresentationScratchCursor } {
  return acceptRevisionedMessage(cursor, message);
}

export function acceptPresentationPortalMaskState(
  cursor: PresentationPortalMaskCursor,
  message: PresentationPortalMaskMessage,
): { accepted: boolean; cursor: PresentationPortalMaskCursor } {
  return acceptRevisionedMessage(cursor, message);
}

export function acceptPresentationInteractionState(
  cursor: PresentationInteractionCursor,
  message: PresentationInteractionMessage,
): { accepted: boolean; cursor: PresentationInteractionCursor } {
  return acceptRevisionedMessage(cursor, message);
}

export function createAudienceConnectionState(): AudienceConnectionState {
  return { status: "closed" };
}

export function reduceAudienceConnection(
  state: AudienceConnectionState,
  event: AudienceConnectionEvent,
): AudienceConnectionState {
  switch (event.type) {
    case "open-requested":
      return {
        status: "opening",
        lastSeenAt: event.at,
      };
    case "popup-blocked":
      return { status: "popup-blocked" };
    case "audience-ready":
      return {
        status: "connected",
        audienceId: event.audienceId,
        lastSeenAt: event.at,
      };
    case "audience-heartbeat":
      return state.audienceId && state.audienceId !== event.audienceId
        ? state
        : {
            status: "connected",
            audienceId: event.audienceId,
            lastSeenAt: event.at,
          };
    case "audience-closing":
      return state.audienceId === event.audienceId
        ? { status: "closed" }
        : state;
    case "connection-timeout":
      return state.status === "opening" || state.status === "connected"
        ? { ...state, status: "disconnected" }
        : state;
    case "window-closed":
      return { status: "closed" };
  }
}

export function deliverPresentationMessage(
  message: PresentationMessage,
  senders: readonly ((message: PresentationMessage) => void)[],
) {
  let deliveryCount = 0;

  for (const send of senders) {
    try {
      send(message);
      deliveryCount += 1;
    } catch {
      // A closing window can disappear between checking it and posting to it.
    }
  }

  return deliveryCount;
}

function updateAudienceBlackoutSearchParameter(url: URL, isAudienceBlackout: boolean) {
  if (isAudienceBlackout) {
    url.searchParams.set(audienceBlackoutSearchParameter, "1");
  } else {
    url.searchParams.delete(audienceBlackoutSearchParameter);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

function isScratchSegment(value: unknown): value is ScratchSegment {
  if (!isRecord(value)) {
    return false;
  }

  return [value.fromX, value.fromY, value.toX, value.toY].every((coordinate) => (
    typeof coordinate === "number" &&
    Number.isFinite(coordinate) &&
    coordinate >= 0 &&
    coordinate <= 1
  ));
}

function isPortalMaskRect(value: unknown): value is PortalMaskRect {
  if (!isRecord(value)) {
    return false;
  }

  const coordinates = [value.x, value.y, value.width, value.height];

  if (!coordinates.every((coordinate) => (
    typeof coordinate === "number" &&
    Number.isFinite(coordinate) &&
    coordinate >= 0 &&
    coordinate <= 1
  ))) {
    return false;
  }

  return typeof value.x === "number" &&
    typeof value.y === "number" &&
    typeof value.width === "number" &&
    typeof value.height === "number" &&
    value.width > 0 &&
    value.height > 0 &&
    value.x + value.width <= 1 &&
    value.y + value.height <= 1;
}

function isPresentationInteractionState(
  value: unknown,
): value is PresentationInteractionState {
  if (!isRecord(value) || !isNonEmptyString(value.frameId)) {
    return false;
  }

  if (value.pointer !== undefined && !isNormalizedPoint(value.pointer)) {
    return false;
  }

  if (value.exposureScoreId !== undefined && !isNonEmptyString(value.exposureScoreId)) {
    return false;
  }

  if (
    value.exposureCollectionScroll !== undefined &&
    !isPresentationCollectionScrollState(value.exposureCollectionScroll)
  ) {
    return false;
  }

  return value.exposureMaskStep === undefined ||
    value.exposureMaskStep === 1 ||
    value.exposureMaskStep === 2 ||
    value.exposureMaskStep === 3 ||
    value.exposureMaskStep === 4;
}

function isPresentationCollectionScrollState(
  value: unknown,
): value is PresentationCollectionScrollState {
  return isRecord(value) &&
    typeof value.startedAt === "number" &&
    Number.isFinite(value.startedAt) &&
    value.startedAt >= 0 &&
    typeof value.speed === "number" &&
    Number.isFinite(value.speed) &&
    value.speed >= 0.25 &&
    value.speed <= 4;
}

function isNormalizedPoint(value: unknown): value is PresentationPointerPosition {
  return isRecord(value) && [value.x, value.y].every((coordinate) => (
    typeof coordinate === "number" &&
    Number.isFinite(coordinate) &&
    coordinate >= 0 &&
    coordinate <= 1
  ));
}
