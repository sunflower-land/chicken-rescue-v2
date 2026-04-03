import type { MinigameActionDefinition } from "lib/portal";

/**
 * Mirrors DB-backed `chicken-rescue-v2` actions for offline / no-API play.
 */
const SEVEN_HOURS_MS = 7 * 60 * 60 * 1000;
const EIGHT_HOURS_MS = 8 * 60 * 60 * 1000;

export const CHICKEN_RESCUE_CLIENT_ACTIONS: Record<
  string,
  MinigameActionDefinition
> = {
  START_WORMERY_DROP: {
    produce: {
      "4": {
        msToComplete: SEVEN_HOURS_MS,
        requires: "5",
      },
    },
  },
  COLLECT_WORMERY_WORMS: {
    collect: {
      "4": { amount: 3 },
    },
  },
  BUY_WORMERY_2: {
    burn: {
      "0": { amount: 15 },
    },
    mint: {
      "6": { amount: 1 },
    },
  },
  BUY_WORMERY_3: {
    burn: {
      "0": { amount: 100 },
    },
    mint: {
      "7": { amount: 1 },
    },
  },
  BUY_WORMERY_4: {
    burn: {
      "0": { amount: 500 },
    },
    mint: {
      "8": { amount: 1 },
    },
  },
  START_WORMERY_2_DROP: {
    produce: {
      "4": {
        msToComplete: EIGHT_HOURS_MS,
        limit: 999,
        requires: "6",
      },
    },
  },
  COLLECT_WORMERY_2_WORMS: {
    collect: {
      "4": { amount: 3 },
    },
  },
  START_WORMERY_3_DROP: {
    produce: {
      "4": {
        msToComplete: EIGHT_HOURS_MS,
        limit: 999,
        requires: "7",
      },
    },
  },
  COLLECT_WORMERY_3_WORMS: {
    collect: {
      "4": { amount: 3 },
    },
  },
  START_WORMERY_4_DROP: {
    produce: {
      "4": {
        msToComplete: EIGHT_HOURS_MS,
        limit: 999,
        requires: "8",
      },
    },
  },
  COLLECT_WORMERY_4_WORMS: {
    collect: {
      "4": { amount: 3 },
    },
  },
  START: {
    mint: {
      LIVE_GAME: { amount: 1 },
    },
    burn: {
      "4": { amount: 1 },
    },
  },
  LOSE: {
    burn: {
      LIVE_GAME: { amount: 1 },
    },
  },
  WIN: {
    mint: {
      "1": { min: 0, max: 100, dailyCap: 1000 },
    },
    burn: {
      LIVE_GAME: { amount: 1 },
    },
  },
  BUY_WORM_BALL: {
    burn: {
      "1": { amount: 50 },
    },
    mint: {
      "3": { amount: 1 },
    },
  },

  BUY_GOLDEN_NUGGET: {
    mint: {
      "0": { amount: 1 },
    },
    burn: {
      "2": { amount: 1 },
    },
  },

  BUY_WORM_PACK: {
    mint: {
      "4": { amount: 5 },
    },
    burn: {
      "0": { amount: 1 },
    },
  },
  START_ADVANCED_GAME: {
    mint: {
      ADVANCED_GAME: { amount: 1 },
    },
    burn: {
      "3": { amount: 1 },
    },
  },
  LOSE_ADVANCED_GAME: {
    burn: {
      ADVANCED_GAME: { amount: 1 },
    },
  },
  WIN_ADVANCED_GAME: {
    mint: {
      "1": { min: 0, max: 100, dailyCap: 1000 },
      "2": { min: 0, max: 3, dailyCap: 300 },
    },
    burn: {
      ADVANCED_GAME: { amount: 1 },
    },
  },
};
