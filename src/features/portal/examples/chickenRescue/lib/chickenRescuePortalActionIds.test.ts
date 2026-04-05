jest.mock("lib/config", () => ({
  CONFIG: {
    PORTAL_CR_ACTION_START_BASIC: undefined,
    PORTAL_CR_ACTION_GAME_OVER_BASIC: undefined,
    PORTAL_CR_ACTION_START_ADVANCED: undefined,
    PORTAL_CR_ACTION_GAME_OVER_ADVANCED: undefined,
  },
}));

import type { MinigameActionDefinition } from "lib/portal/processAction";
import { resolveChickenRescuePortalActionIds } from "./chickenRescuePortalActionIds";

/** Minimal defs matching Chicken Rescue portal rules (for resolver tests only). */
const CR_PORTAL_ACTION_FIXTURES: Record<string, MinigameActionDefinition> = {
  START_GAME: {
    mint: { LIVE_GAME: { amount: 1 } },
    burn: { "4": { amount: 1 } },
  },
  GAMEOVER: {
    mint: { "1": { min: 0, max: 100, dailyCap: 1000 } },
    burn: { LIVE_GAME: { amount: 1 } },
  },
  START_ADVANCED_GAME: {
    mint: { ADVANCED_GAME: { amount: 1 } },
    burn: { "3": { amount: 1 } },
  },
  ADVANCED_GAMEOVER: {
    mint: {
      "1": { min: 0, max: 100, dailyCap: 1000 },
      "2": { min: 0, max: 3, dailyCap: 300 },
    },
    burn: { ADVANCED_GAME: { amount: 1 } },
  },
};

describe("resolveChickenRescuePortalActionIds", () => {
  it("keeps semantic keys when actions match Chicken Rescue shapes", () => {
    const ids = resolveChickenRescuePortalActionIds(
      CR_PORTAL_ACTION_FIXTURES as Record<string, unknown>,
    );
    expect(ids).toEqual({
      startBasic: "START_GAME",
      gameOverBasic: "GAMEOVER",
      startAdvanced: "START_ADVANCED_GAME",
      gameOverAdvanced: "ADVANCED_GAMEOVER",
    });
  });

  it("resolves numeric editor keys by rule shape", () => {
    const { START_GAME, GAMEOVER, START_ADVANCED_GAME, ADVANCED_GAMEOVER, ...rest } =
      CR_PORTAL_ACTION_FIXTURES;
    const remapped: Record<string, unknown> = { ...rest };
    remapped["101"] = START_GAME;
    remapped["102"] = GAMEOVER;
    remapped["201"] = START_ADVANCED_GAME;
    remapped["202"] = ADVANCED_GAMEOVER;

    const ids = resolveChickenRescuePortalActionIds(remapped);
    expect(ids).toEqual({
      startBasic: "101",
      gameOverBasic: "102",
      startAdvanced: "201",
      gameOverAdvanced: "202",
    });
  });
});
