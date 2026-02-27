import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { StrictMode } from "react";
import ThemeInitializer from "./components/ThemeInitializer"; // we'll create this next

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeInitializer>
      <App />
    </ThemeInitializer>
  </StrictMode>
);