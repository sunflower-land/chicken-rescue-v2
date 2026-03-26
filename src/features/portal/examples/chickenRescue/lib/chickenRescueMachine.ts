import {
  applyOptimisticPortalAction,
  type MinigameActionDefinition,
  type MinigameSessionResponse,
} from "lib/portal";

export const CLAIM_FREE_ATTEMPTS_ACTION = "CLAIM_FREE_ATTEMPTS" as const;

export function attemptsFromMinigame(
  minigame: MinigameSessionResponse["minigame"],
): number {
  return minigame.balances.Attempt ?? 0;
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

/** True if {@link CLAIM_FREE_ATTEMPTS_ACTION} would succeed (not yet claimed for the UTC day, per rules). */
export function canClaimFreeAttempts(
  minigame: MinigameSessionResponse["minigame"],
  actions: Record<string, unknown>,
): boolean {
  return applyOptimisticPortalAction(actions, minigame, {
    actionId: CLAIM_FREE_ATTEMPTS_ACTION,
  }).ok;
}

/** Minted Attempt count from the daily free-claim action (for copy); defaults to 3 if missing. */
export function dailyFreeAttemptsMintAmount(
  actions: Record<string, unknown>,
): number {
  const def = actions[CLAIM_FREE_ATTEMPTS_ACTION] as
    | MinigameActionDefinition
    | undefined;
  const rule = def?.mint?.Attempt;
  if (rule && "amount" in rule) {
    return rule.amount;
  }
  return 3;
}

/** Run length on /game after START (seconds). */
export const GAME_SECONDS = 60;
