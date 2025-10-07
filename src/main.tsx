// src/main.tsx
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerSW } from "virtual:pwa-register";

registerSW({
  immediate: true,
  onNeedRefresh() {
    // aqui você pode exibir um toast e chamar updateSW()
  },
  onOfflineReady() {
    // app pronto para offline
  },
});

createRoot(document.getElementById("root")!).render(<App />);
