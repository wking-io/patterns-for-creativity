import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { DialRoot } from "dialkit";
import { MotionDeckApp } from "./motion-deck/MotionDeckApp";
import { prepareOfflineAssets } from "./offline-assets";
import "dialkit/styles.css";
import "./styles.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Missing root element");
}

await prepareOfflineAssets();

createRoot(root).render(
  <StrictMode>
    <MotionDeckApp />
    <DialRoot position="top-right" defaultOpen theme="light" />
  </StrictMode>,
);
