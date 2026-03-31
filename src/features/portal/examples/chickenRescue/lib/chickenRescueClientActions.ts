import type { MinigameActionDefinition } from "lib/portal";

/**
 * Mirrors `sunflower-land-api` `domain/minigames/configs/chickenRescue.ts` for offline / no-API play.
 */
const SEVEN_HOURS_MS = 7 * 60 * 60 * 1000;
const EIGHT_HOURS_MS = 8 * 60 * 60 * 1000;

export const CHICKEN_RESCUE_CLIENT_ACTIONS: Record<
  string,
  MinigameActionDefinition
> = {
  START_WORMERY_DROP: {
    produce: {
      Worm: {
        msToComplete: SEVEN_HOURS_MS,
        requires: "Wormery",
      },
    },
  },
  COLLECT_WORMERY_WORMS: {
    collect: {
      Worm: { amount: 3 },
    },
  },
  BUY_WORMERY_2: {
    burn: {
      GoldenNugget: { amount: 15 },
    },
    mint: {
      Wormery_2: { amount: 1 },
    },
  },
  BUY_WORMERY_3: {
    burn: {
      GoldenNugget: { amount: 100 },
    },
    mint: {
      Wormery_3: { amount: 1 },
    },
  },
  BUY_WORMERY_4: {
    burn: {
      GoldenNugget: { amount: 500 },
    },
    mint: {
      Wormery_4: { amount: 1 },
    },
  },
  START_WORMERY_2_DROP: {
    produce: {
      Worm: {
        msToComplete: EIGHT_HOURS_MS,
        limit: 999,
        requires: "Wormery_2",
      },
    },
  },
  COLLECT_WORMERY_2_WORMS: {
    collect: {
      Worm: { amount: 3 },
    },
  },
  START_WORMERY_3_DROP: {
    produce: {
      Worm: {
        msToComplete: EIGHT_HOURS_MS,
        limit: 999,
        requires: "Wormery_3",
      },
    },
  },
  COLLECT_WORMERY_3_WORMS: {
    collect: {
      Worm: { amount: 3 },
    },
  },
  START_WORMERY_4_DROP: {
    produce: {
      Worm: {
        msToComplete: EIGHT_HOURS_MS,
        limit: 999,
        requires: "Wormery_4",
      },
    },
  },
  COLLECT_WORMERY_4_WORMS: {
    collect: {
      Worm: { amount: 3 },
    },
  },
  START: {
    mint: {
      LIVE_GAME: { amount: 1 },
    },
    burn: {
      Worm: { amount: 1 },
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
  BUY_WORM_BALL: {
    burn: {
      Chook: { amount: 50 },
    },
    mint: {
      ChickenFeet: { amount: 1 },
    },
  },

  BUY_GOLDEN_NUGGET: {
    mint: {
      GoldenNugget: { amount: 1 },
    },
    burn: {
      GoldenChook: { amount: 1 },
    },
  },

  BUY_WORM_PACK: {
    mint: {
      Worm: { amount: 5 },
    },
    burn: {
      GoldenNugget: { amount: 1 },
    },
  },
  START_ADVANCED_GAME: {
    mint: {
      ADVANCED_GAME: { amount: 1 },
    },
    burn: {
      ChickenFeet: { amount: 1 },
    },
  },
  LOSE_ADVANCED_GAME: {
    burn: {
      ADVANCED_GAME: { amount: 1 },
    },
  },
  WIN_ADVANCED_GAME: {
    mint: {
      Chook: { min: 0, max: 100, dailyCap: 1000 },
      GoldenChook: { min: 0, max: 3, dailyCap: 300 },
    },
    burn: {
      ADVANCED_GAME: { amount: 1 },
    },
  },
};
