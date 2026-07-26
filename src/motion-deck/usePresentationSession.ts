import { useCallback, useEffect, useRef, useState } from "react";
import type { DeckDirection } from "./navigation";
import {
  acceptPresentationInteractionState,
  acceptPresentationPortalMaskState,
  acceptPresentationState,
  acceptPresentationTileRevealState,
  createAudienceBlackoutUrl,
  createAudienceConnectionState,
  createAudienceDisplayUrl,
  createAudiencePresenceMessage,
  createPresentationInteractionCursor,
  createPresentationInteractionMessage,
  createPresentationPortalMaskCursor,
  createPresentationPortalMaskMessage,
  createPresentationStateCursor,
  createPresentationStateMessage,
  createPresentationTileRevealCursor,
  createPresentationTileRevealMessage,
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
  PresentationInteractionMessage,
  PresentationInteractionState,
  PresentationPortalMaskMessage,
  PresentationStateMessage,
  PresentationTileRevealMessage,
  PortalMaskRect,
  TileRevealState,
} from "./presentation-sync";

const heartbeatIntervalMs = 1_500;
const connectionTimeoutMs = 5_000;

type UsePresentationSessionOptions = {
  direction: DeckDirection;
  frameCount: number;
  frameIndex: number;
  onAudienceState: (message: PresentationStateMessage) => void;
  onAudienceInteractionState: (message: PresentationInteractionMessage) => void;
  onAudiencePortalMaskState: (message: PresentationPortalMaskMessage) => void;
  onTileRevealState: (message: PresentationTileRevealMessage) => void;
  portalMaskRect?: PortalMaskRect;
  interactionState?: PresentationInteractionState;
  tileRevealFrameId?: string;
  tileRevealState?: TileRevealState;
  viewMode: DeckViewMode;
};

export function usePresentationSession({
  direction,
  frameCount,
  frameIndex,
  onAudienceState,
  onAudienceInteractionState,
  onAudiencePortalMaskState,
  onTileRevealState,
  portalMaskRect,
  interactionState,
  tileRevealFrameId,
  tileRevealState,
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
  const tileRevealRevisionRef = useRef(0);
  const portalMaskRevisionRef = useRef(0);
  const interactionRevisionRef = useRef(0);
  const tileRevealSnapshotRef = useRef<{
    frameId: string;
    state: TileRevealState;
  } | undefined>(undefined);
  const portalMaskRectRef = useRef<PortalMaskRect | undefined>(portalMaskRect);
  const interactionStateRef = useRef<PresentationInteractionState | undefined>(
    interactionState,
  );
  const latestStateRef = useRef(createPresentationStateMessage(
    presenterSessionIdRef.current,
    revisionRef.current,
    frameIndex,
    direction,
    false,
  ));
  const cursorRef = useRef(createPresentationStateCursor());
  const tileRevealCursorsRef = useRef<
    Record<string, ReturnType<typeof createPresentationTileRevealCursor>>
  >({});
  const portalMaskCursorRef = useRef(createPresentationPortalMaskCursor());
  const interactionCursorRef = useRef(createPresentationInteractionCursor());
  tileRevealSnapshotRef.current = tileRevealFrameId && tileRevealState
    ? { frameId: tileRevealFrameId, state: tileRevealState }
    : undefined;

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
          const tileRevealSnapshot = tileRevealSnapshotRef.current;
          if (tileRevealSnapshot) {
            sendMessage(createPresentationTileRevealMessage(
              presenterSessionIdRef.current,
              tileRevealRevisionRef.current,
              tileRevealSnapshot.frameId,
              tileRevealSnapshot.state,
            ));
          }
          if (portalMaskRectRef.current) {
            sendMessage(createPresentationPortalMaskMessage(
              presenterSessionIdRef.current,
              portalMaskRevisionRef.current,
              portalMaskRectRef.current,
            ));
          }
          if (interactionStateRef.current) {
            sendMessage(createPresentationInteractionMessage(
              presenterSessionIdRef.current,
              interactionRevisionRef.current,
              interactionStateRef.current,
            ));
          }
        }
      } else if (message.type === "audience-closing") {
        updateAudienceConnection({
          type: "audience-closing",
          audienceId: message.audienceId,
        });
      }

      return;
    }

    if (viewMode !== "audience") {
      return;
    }

    if (message.type === "presentation-tile-reveal") {
      const cursor = tileRevealCursorsRef.current[message.frameId]
        ?? createPresentationTileRevealCursor();
      const result = acceptPresentationTileRevealState(
        cursor,
        message,
      );
      tileRevealCursorsRef.current[message.frameId] = result.cursor;

      if (result.accepted) {
        onTileRevealState(message);
      }

      return;
    }

    if (message.type === "presentation-portal-mask") {
      const result = acceptPresentationPortalMaskState(
        portalMaskCursorRef.current,
        message,
      );
      portalMaskCursorRef.current = result.cursor;

      if (result.accepted) {
        onAudiencePortalMaskState(message);
      }

      return;
    }

    if (message.type === "presentation-interaction") {
      const result = acceptPresentationInteractionState(
        interactionCursorRef.current,
        message,
      );
      interactionCursorRef.current = result.cursor;

      if (result.accepted) {
        onAudienceInteractionState(message);
      }

      return;
    }

    if (message.type !== "presentation-state") {
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
  }, [
    frameCount,
    onAudienceInteractionState,
    onAudiencePortalMaskState,
    onAudienceState,
    onTileRevealState,
    sendMessage,
    updateAudienceConnection,
    viewMode,
  ]);

  useEffect(() => {
    portalMaskRectRef.current = portalMaskRect;
  }, [portalMaskRect]);

  useEffect(() => {
    interactionStateRef.current = interactionState;
  }, [interactionState]);

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
    if (
      viewMode !== "presenter" ||
      !tileRevealFrameId ||
      !tileRevealState
    ) {
      return;
    }

    tileRevealRevisionRef.current += 1;
    sendMessage(createPresentationTileRevealMessage(
      presenterSessionIdRef.current,
      tileRevealRevisionRef.current,
      tileRevealFrameId,
      tileRevealState,
    ));
  }, [
    sendMessage,
    tileRevealFrameId,
    tileRevealState,
    viewMode,
  ]);

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

  const broadcastPortalMaskRect = useCallback((rect: PortalMaskRect) => {
    if (viewMode !== "presenter") {
      return;
    }

    portalMaskRevisionRef.current += 1;
    portalMaskRectRef.current = rect;
    sendMessage(createPresentationPortalMaskMessage(
      presenterSessionIdRef.current,
      portalMaskRevisionRef.current,
      rect,
    ));
  }, [sendMessage, viewMode]);

  const broadcastInteractionState = useCallback((state: PresentationInteractionState) => {
    if (viewMode !== "presenter") {
      return;
    }

    interactionRevisionRef.current += 1;
    interactionStateRef.current = state;
    sendMessage(createPresentationInteractionMessage(
      presenterSessionIdRef.current,
      interactionRevisionRef.current,
      state,
    ));
  }, [sendMessage, viewMode]);

  return {
    audienceStatus: audienceConnection.status,
    broadcastInteractionState,
    broadcastPortalMaskRect,
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
