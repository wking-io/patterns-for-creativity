import { createFrameHash } from "./navigation.js";
import type { DeckDirection } from "./navigation.js";

export const presentationChannelName = "patterns-for-creativity-presentation";
export const presentationMessageVersion = 1;

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
};

export type AudiencePresenceMessage = {
  type: "audience-ready" | "audience-heartbeat" | "audience-closing";
  version: typeof presentationMessageVersion;
  audienceId: string;
};

export type PresentationMessage = PresentationStateMessage | AudiencePresenceMessage;

export type PresentationStateCursor = {
  sessionId?: string;
  revision: number;
  retiredSessionIds: readonly string[];
};

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
) {
  const url = new URL(currentHref);
  url.searchParams.set("view", "audience");
  url.hash = createFrameHash(frameIndex, frameCount);

  return url.toString();
}

export function createPresentationStateMessage(
  sessionId: string,
  revision: number,
  frameIndex: number,
  direction: DeckDirection,
): PresentationStateMessage {
  return {
    type: "presentation-state",
    version: presentationMessageVersion,
    sessionId,
    revision,
    direction,
    frameIndex,
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
    value.type !== "presentation-state" ||
    !isNonEmptyString(value.sessionId) ||
    !isNonNegativeInteger(value.revision) ||
    (value.direction !== -1 && value.direction !== 1) ||
    !isNonNegativeInteger(value.frameIndex) ||
    value.frameIndex >= frameCount
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
  };
}

export function createPresentationStateCursor(): PresentationStateCursor {
  return {
    revision: -1,
    retiredSessionIds: [],
  };
}

export function acceptPresentationState(
  cursor: PresentationStateCursor,
  message: PresentationStateMessage,
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}
