import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { LoadPage } from "./screens/LoadPage";

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <LoadPage />
  </StrictMode>,
);
