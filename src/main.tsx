import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import { XiaomanLuckinApp } from "./xiaomanLuckin";

const rootElement = document.getElementById("root")! as HTMLElement & {
  _luckinRoot?: ReturnType<typeof createRoot>;
};
const root = rootElement._luckinRoot ?? createRoot(rootElement);
rootElement._luckinRoot = root;

root.render(
  <StrictMode>
    <XiaomanLuckinApp />
  </StrictMode>
);
