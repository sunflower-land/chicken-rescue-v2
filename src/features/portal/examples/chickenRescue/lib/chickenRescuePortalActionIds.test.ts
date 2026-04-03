import { CHICKEN_RESCUE_CLIENT_ACTIONS } from "./chickenRescueClientActions";
import { resolveChickenRescuePortalActionIds } from "./chickenRescuePortalActionIds";

describe("resolveChickenRescuePortalActionIds", () => {
  it("keeps semantic keys when actions match Chicken Rescue shapes", () => {
    const ids = resolveChickenRescuePortalActionIds(
      CHICKEN_RESCUE_CLIENT_ACTIONS as Record<string, unknown>,
    );
    expect(ids).toEqual({
      startBasic: "START",
      loseBasic: "LOSE",
      winBasic: "WIN",
      startAdvanced: "START_ADVANCED_GAME",
      loseAdvanced: "LOSE_ADVANCED_GAME",
      winAdvanced: "WIN_ADVANCED_GAME",
    });
  });

  it("resolves numeric editor keys by rule shape", () => {
    const { START, LOSE, WIN, START_ADVANCED_GAME, LOSE_ADVANCED_GAME, WIN_ADVANCED_GAME, ...rest } =
      CHICKEN_RESCUE_CLIENT_ACTIONS;
    const remapped: Record<string, unknown> = { ...rest };
    remapped["101"] = START;
    remapped["102"] = LOSE;
    remapped["103"] = WIN;
    remapped["201"] = START_ADVANCED_GAME;
    remapped["202"] = LOSE_ADVANCED_GAME;
    remapped["203"] = WIN_ADVANCED_GAME;

    const ids = resolveChickenRescuePortalActionIds(remapped);
    expect(ids).toEqual({
      startBasic: "101",
      loseBasic: "102",
      winBasic: "103",
      startAdvanced: "201",
      loseAdvanced: "202",
      winAdvanced: "203",
    });
  });
});
