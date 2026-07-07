import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { DialRoot } from "dialkit";
import { App } from "./app";
import { MotionDeckApp } from "./motion-deck/MotionDeckApp";
import { prepareOfflineAssets } from "./offline-assets";
import "dialkit/styles.css";
import "./styles.css";

const root = document.getElementById("root");
const normalizedPathname = window.location.pathname.replace(/\/$/, "") || "/";
const shouldRenderMotionDeck = window.__FORCE_MOTION_DECK === true || normalizedPathname === "/motion-deck";
const shouldRenderDialRoot = normalizedPathname !== "/cloud-contours" && !shouldRenderMotionDeck;

if (!root) {
  throw new Error("Missing root element");
}

await prepareOfflineAssets();

createRoot(root).render(
  <StrictMode>
    {shouldRenderMotionDeck ? <MotionDeckApp /> : <App />}
    {shouldRenderDialRoot ? <DialRoot position="top-right" defaultOpen theme="light" /> : null}
  </StrictMode>,
);

declare global {
  interface Window {
    __FORCE_MOTION_DECK?: boolean;
  }
}
