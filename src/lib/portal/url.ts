import { CONFIG } from "lib/config";

const PORTAL_JWT_STORAGE_KEY = "sunflower_land_portal_jwt";

export const getUrl = () => {
  const network = new URLSearchParams(window.location.search).get("network");

  if (network && network === "mainnet") {
    return "https://api.sunflower-land.com";
  }

  if (network) {
    return "https://api-dev.sunflower-land.com";
  }

  return CONFIG.API_URL;
};

/**
 * Portal JWT: read from `?jwt=` when present (and persist to sessionStorage),
 * otherwise reuse the last token from this tab so refresh and client-side
 * navigation without the query string stay authorised.
 */
export const getJwt = (): string | null => {
  const params = new URLSearchParams(window.location.search);

  if (params.has("jwt")) {
    const fromUrl = params.get("jwt") ?? "";
    try {
      if (fromUrl) {
        sessionStorage.setItem(PORTAL_JWT_STORAGE_KEY, fromUrl);
      } else {
        sessionStorage.removeItem(PORTAL_JWT_STORAGE_KEY);
      }
    } catch {
      // private mode / quota
    }
    return fromUrl || null;
  }

  try {
    const stored = sessionStorage.getItem(PORTAL_JWT_STORAGE_KEY);
    return stored && stored.length > 0 ? stored : null;
  } catch {
    return null;
  }
};

/** Clears the tab-scoped portal JWT (e.g. after explicit logout or `?jwt=`). */
export const clearPersistedPortalJwt = () => {
  try {
    sessionStorage.removeItem(PORTAL_JWT_STORAGE_KEY);
  } catch {
    // ignore
  }
};
