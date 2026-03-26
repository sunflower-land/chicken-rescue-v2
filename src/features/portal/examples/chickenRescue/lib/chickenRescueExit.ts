import type { NavigateFunction } from "react-router-dom";
import { CONFIG } from "lib/config";

/**
 * Dismiss Chicken Rescue. Minigame progress is persisted only through the portal API;
 * the parent frame (if any) still needs this message to close the hosting modal.
 *
 * When running top-level inside the Chicken Rescue SPA, pass `navigate` so we stay in-app
 * on `/home` instead of forcing `VITE_PORTAL_GAME_URL` (e.g. testnet), which caused a
 * second unwanted full-page redirect after claim.
 */
export function goHome(navigate?: NavigateFunction) {
  if (window.self !== window.top) {
    window.parent.postMessage({ event: "closePortal" }, "*");
    return;
  }

  if (navigate) {
    navigate("/home", { replace: true });
    return;
  }

  window.location.href = CONFIG.PORTAL_GAME_URL;
}
