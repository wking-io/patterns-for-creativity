import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { DialRoot } from "dialkit";
import { App } from "./app";
import "dialkit/styles.css";
import "./styles.css";

const root = document.getElementById("root");
const shouldRenderDialRoot = window.location.pathname !== "/cloud-contours";

if (!root) {
  throw new Error("Missing root element");
}

createRoot(root).render(
  <StrictMode>
    <App />
    {shouldRenderDialRoot ? <DialRoot position="top-right" defaultOpen theme="light" /> : null}
  </StrictMode>,
);
