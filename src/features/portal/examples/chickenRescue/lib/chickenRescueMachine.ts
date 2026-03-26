import type { MinigameSessionResponse } from "lib/portal";
import { emptyMinigameState } from "lib/portal/processAction";
import { runtimeToMinigameSession } from "lib/portal/runtimeHelpers";

/** Must match sunflower-land-api `CHICKEN_RESCUE_BOOTSTRAP_COIN_JOB_ID`. */
export const CHICKEN_RESCUE_BOOTSTRAP_COIN_JOB_ID =
  "bootstrap-goblin-coin-0" as const;

export function coinsFromMinigame(
  minigame: MinigameSessionResponse["minigame"],
): number {
  return minigame.balances.Coin ?? 0;
}

export function goblinChickensFromMinigame(
  minigame: MinigameSessionResponse["minigame"],
): number {
  return minigame.balances.GoblinChicken ?? 0;
}

/** Initial session for offline Chicken Rescue (mirrors server bootstrap). */
export function createChickenRescueOfflineMinigame(
  now = Date.now(),
): MinigameSessionResponse["minigame"] {
  const base = emptyMinigameState(now);
  base.balances.GoblinChicken = 1;
  base.producing[CHICKEN_RESCUE_BOOTSTRAP_COIN_JOB_ID] = {
    outputToken: "Coin",
    startedAt: now - 1,
    completesAt: now,
  };
  return runtimeToMinigameSession(base);
}

/** Chooks minted on WIN; matches server ranged mint max (100). */
export function chooksForScore(score: number): number {
  return Math.min(100, Math.max(0, Math.floor(score)));
}

export function hasLiveGame(
  minigame: MinigameSessionResponse["minigame"],
): boolean {
  return (minigame.balances.LIVE_GAME ?? 0) > 0;
}

/** Run length on /game after START (seconds). */
export const GAME_SECONDS = 60;
