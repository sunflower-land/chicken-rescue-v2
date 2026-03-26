import type { MinigameActionDefinition } from "lib/portal";

/**
 * Mirrors sunflower-land-api `CHICKEN_RESCUE_CONFIG.actions` for offline / no-API play.
 * Keep in sync when server rules change.
 */
export const CHICKEN_RESCUE_CLIENT_ACTIONS: Record<
  string,
  MinigameActionDefinition
> = {
  CLAIM_FREE_ATTEMPTS: {
    mint: {
      Attempt: { amount: 3, dailyCap: 3 },
    },
  },
  START: {
    mint: {
      LIVE_GAME: { amount: 1 },
    },
    burn: {
      Attempt: { amount: 1 },
    },
  },
  LOSE: {
    burn: {
      LIVE_GAME: { amount: 1 },
    },
  },
  WIN: {
    mint: {
      Chook: { min: 0, max: 100, dailyCap: 1000 },
    },
    burn: {
      LIVE_GAME: { amount: 1 },
    },
  },
  FEED_CHOOK: {
    produce: {
      Nugget: { msToComplete: 5000, limit: 1 },
    },
    burn: {
      Chook: { amount: 50 },
    },
  },
  COLLECT_NUGGET: {
    collect: {
      Nugget: { amount: 1 },
    },
  },
  BUY_CLUCKCOIN: {
    mint: {
      Cluckcoin: { amount: 1 },
    },
    burn: {
      Nugget: { amount: 1 },
    },
  },
  BUY_RUNS: {
    mint: {
      Attempt: { amount: 1, dailyCap: 1 },
    },
    burn: {
      Cluckcoin: { amount: 1 },
    },
  },
};
