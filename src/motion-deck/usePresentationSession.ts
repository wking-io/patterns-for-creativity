import { useCallback, useEffect, useRef, useState } from "react";
import type { DeckDirection } from "./navigation";
import {
  acceptPresentationState,
  createAudienceBlackoutUrl,
  createAudienceConnectionState,
  createAudienceDisplayUrl,
  createAudiencePresenceMessage,
  createPresentationStateCursor,
  createPresentationStateMessage,
  deliverPresentationMessage,
  getInitialAudienceBlackout,
  parsePresentationMessage,
  presentationChannelName,
  reduceAudienceConnection,
} from "./presentation-sync";
import type {
  AudienceConnectionEvent,
  DeckViewMode,
  PresentationMessage,
  PresentationStateMessage,
} from "./presentation-sync";

const heartbeatIntervalMs = 1_500;
const connectionTimeoutMs = 5_000;

type UsePresentationSessionOptions = {
  direction: DeckDirection;
  frameCount: number;
  frameIndex: number;
  onAudienceState: (message: PresentationStateMessage) => void;
  viewMode: DeckViewMode;
};

export function usePresentationSession({
  direction,
  frameCount,
  frameIndex,
  onAudienceState,
  viewMode,
}: UsePresentationSessionOptions) {
  const [audienceConnection, setAudienceConnection] = useState(
    createAudienceConnectionState,
  );
  const [isAudienceBlackout, setIsAudienceBlackout] = useState(() => (
    viewMode === "audience" && getInitialAudienceBlackout(window.location.search)
  ));
  const channelRef = useRef<BroadcastChannel | undefined>(undefined);
  const popupRef = useRef<Window | undefined>(undefined);
  const presenterSessionIdRef = useRef(createPeerId("presenter"));
  const audienceIdRef = useRef(createPeerId("audience"));
  const revisionRef = useRef(0);
  const latestStateRef = useRef(createPresentationStateMessage(
    presenterSessionIdRef.current,
    revisionRef.current,
    frameIndex,
    direction,
    false,
  ));
  const cursorRef = useRef(createPresentationStateCursor());

  const updateAudienceConnection = useCallback((event: AudienceConnectionEvent) => {
    setAudienceConnection((current) => reduceAudienceConnection(current, event));
  }, []);

  const sendMessage = useCallback((message: PresentationMessage) => {
    const senders: Array<(nextMessage: PresentationMessage) => void> = [];

    if (channelRef.current) {
      senders.push((nextMessage) => channelRef.current?.postMessage(nextMessage));
    }

    if (viewMode === "presenter" && popupRef.current && !popupRef.current.closed) {
      senders.push((nextMessage) => popupRef.current?.postMessage(nextMessage, "*"));
    }

    if (viewMode === "audience" && window.opener && !window.opener.closed) {
      senders.push((nextMessage) => window.opener.postMessage(nextMessage, "*"));
    }

    return deliverPresentationMessage(message, senders);
  }, [viewMode]);

  const handleIncomingMessage = useCallback((value: unknown) => {
    const message = parsePresentationMessage(value, frameCount);

    if (!message) {
      return;
    }

    if (viewMode === "presenter") {
      if (message.type === "audience-ready" || message.type === "audience-heartbeat") {
        updateAudienceConnection({
          type: message.type,
          audienceId: message.audienceId,
          at: Date.now(),
        });

        if (message.type === "audience-ready") {
          sendMessage(latestStateRef.current);
        }
      } else if (message.type === "audience-closing") {
        updateAudienceConnection({
          type: "audience-closing",
          audienceId: message.audienceId,
        });
      }

      return;
    }

    if (viewMode !== "audience" || message.type !== "presentation-state") {
      return;
    }

    const result = acceptPresentationState(cursorRef.current, message);
    cursorRef.current = result.cursor;

    if (result.accepted) {
      setIsAudienceBlackout(message.isAudienceBlackout);
      window.history.replaceState(
        null,
        "",
        createAudienceBlackoutUrl(window.location.href, message.isAudienceBlackout),
      );
      onAudienceState(message);
    }
  }, [frameCount, onAudienceState, sendMessage, updateAudienceConnection, viewMode]);

  useEffect(() => {
    if (viewMode === "deck") {
      return undefined;
    }

    const channel = typeof BroadcastChannel === "undefined"
      ? undefined
      : new BroadcastChannel(presentationChannelName);
    channelRef.current = channel;

    const handleChannelMessage = (event: MessageEvent<unknown>) => {
      handleIncomingMessage(event.data);
    };
    const handleWindowMessage = (event: MessageEvent<unknown>) => {
      handleIncomingMessage(event.data);
    };

    channel?.addEventListener("message", handleChannelMessage);
    window.addEventListener("message", handleWindowMessage);

    if (viewMode === "audience") {
      const readyMessage = createAudiencePresenceMessage(
        "audience-ready",
        audienceIdRef.current,
      );
      const sendHeartbeat = () => sendMessage(createAudiencePresenceMessage(
        "audience-heartbeat",
        audienceIdRef.current,
      ));
      const handlePageHide = () => sendMessage(createAudiencePresenceMessage(
        "audience-closing",
        audienceIdRef.current,
      ));

      sendMessage(readyMessage);
      const heartbeatTimer = window.setInterval(sendHeartbeat, heartbeatIntervalMs);
      window.addEventListener("pagehide", handlePageHide);

      return () => {
        window.clearInterval(heartbeatTimer);
        window.removeEventListener("pagehide", handlePageHide);
        channel?.removeEventListener("message", handleChannelMessage);
        window.removeEventListener("message", handleWindowMessage);
        channel?.close();
        channelRef.current = undefined;
      };
    }

    return () => {
      channel?.removeEventListener("message", handleChannelMessage);
      window.removeEventListener("message", handleWindowMessage);
      channel?.close();
      channelRef.current = undefined;
    };
  }, [handleIncomingMessage, sendMessage, viewMode]);

  useEffect(() => {
    if (viewMode !== "presenter") {
      return;
    }

    const previousState = latestStateRef.current;

    if (
      previousState.frameIndex !== frameIndex ||
      previousState.direction !== direction ||
      previousState.isAudienceBlackout !== isAudienceBlackout
    ) {
      revisionRef.current += 1;
    }

    const nextState = createPresentationStateMessage(
      presenterSessionIdRef.current,
      revisionRef.current,
      frameIndex,
      direction,
      isAudienceBlackout,
    );
    latestStateRef.current = nextState;
    sendMessage(nextState);
  }, [direction, frameIndex, isAudienceBlackout, sendMessage, viewMode]);

  useEffect(() => {
    if (viewMode !== "presenter") {
      return undefined;
    }

    const monitorTimer = window.setInterval(() => {
      if (popupRef.current?.closed) {
        popupRef.current = undefined;
        updateAudienceConnection({ type: "window-closed" });
        return;
      }

      setAudienceConnection((current) => {
        if (
          (current.status === "opening" || current.status === "connected") &&
          current.lastSeenAt !== undefined &&
          Date.now() - current.lastSeenAt > connectionTimeoutMs
        ) {
          return reduceAudienceConnection(current, { type: "connection-timeout" });
        }

        return current;
      });
    }, heartbeatIntervalMs);

    return () => window.clearInterval(monitorTimer);
  }, [updateAudienceConnection, viewMode]);

  const openAudienceDisplay = useCallback(() => {
    updateAudienceConnection({ type: "open-requested", at: Date.now() });

    const audienceUrl = createAudienceDisplayUrl(
      window.location.href,
      frameIndex,
      frameCount,
      isAudienceBlackout,
    );
    const popup = window.open(
      audienceUrl,
      "patterns-for-creativity-audience",
      "popup=yes,width=1280,height=720",
    );

    if (!popup) {
      popupRef.current = undefined;
      updateAudienceConnection({ type: "popup-blocked" });
      return;
    }

    popupRef.current = popup;
    popup.focus();
  }, [frameCount, frameIndex, isAudienceBlackout, updateAudienceConnection]);

  const toggleAudienceBlackout = useCallback(() => {
    if (viewMode !== "presenter") {
      return;
    }

    setIsAudienceBlackout((current) => (
      current || audienceConnection.status === "connected" ? !current : current
    ));
  }, [audienceConnection.status, viewMode]);

  return {
    audienceStatus: audienceConnection.status,
    isAudienceBlackout,
    openAudienceDisplay,
    toggleAudienceBlackout,
  };
}

function createPeerId(prefix: "presenter" | "audience") {
  const id = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

  return `${prefix}-${id}`;
}
