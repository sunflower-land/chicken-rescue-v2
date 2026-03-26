import { CONFIG } from "lib/config";

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

export const getJwt = () =>
  new URLSearchParams(window.location.search).get("jwt");
