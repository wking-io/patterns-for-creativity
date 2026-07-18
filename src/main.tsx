import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MotionDeckApp } from "./motion-deck/MotionDeckApp";
import { SlideOrganizer } from "./motion-deck/SlideOrganizer";
import { prepareOfflineAssets } from "./offline-assets";
import "./styles.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Missing root element");
}

const isSlideOrganizer = (
  window.location.pathname.replace(/\/$/, "").endsWith("/organize") ||
  new URLSearchParams(window.location.search).get("view") === "organize"
);

if (!isSlideOrganizer) {
  await prepareOfflineAssets();
}

createRoot(root).render(
  <StrictMode>
    {isSlideOrganizer ? (
      <SlideOrganizer />
    ) : (
      <MotionDeckApp />
    )}
  </StrictMode>,
);
