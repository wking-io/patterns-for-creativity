import { createFrameHash } from "./navigation.js";
import type { DeckDirection } from "./navigation.js";

export const presentationChannelName = "patterns-for-creativity-presentation";
export const presentationMessageVersion = 1;

export type DeckViewMode = "deck" | "presenter" | "audience";

export type PresentationFrameMessage = {
  type: "presentation-frame";
  version: typeof presentationMessageVersion;
  direction: DeckDirection;
  frameIndex: number;
};

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

export function createPresentationFrameMessage(
  frameIndex: number,
  direction: DeckDirection,
): PresentationFrameMessage {
  return {
    type: "presentation-frame",
    version: presentationMessageVersion,
    direction,
    frameIndex,
  };
}

export function parsePresentationFrameMessage(
  value: unknown,
  frameCount: number,
): PresentationFrameMessage | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  if (
    value.type !== "presentation-frame" ||
    value.version !== presentationMessageVersion ||
    (value.direction !== -1 && value.direction !== 1) ||
    !Number.isInteger(value.frameIndex) ||
    typeof value.frameIndex !== "number" ||
    value.frameIndex < 0 ||
    value.frameIndex >= frameCount
  ) {
    return undefined;
  }

  return {
    type: "presentation-frame",
    version: presentationMessageVersion,
    direction: value.direction,
    frameIndex: value.frameIndex,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
