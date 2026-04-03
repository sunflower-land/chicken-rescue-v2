import type { MinigameSessionResponse } from "./types";
import {
  emptyPlayerEconomyState,
  processPlayerEconomyAction,
  type MinigameActionDefinition,
  type MinigameConfig,
  type MinigameRuntimeState,
  utcCalendarDay,
} from "./processAction";

export function cloneMinigameSnapshot(
  m: MinigameSessionResponse["playerEconomy"],
): MinigameSessionResponse["playerEconomy"] {
  const day = utcCalendarDay(Date.now());
  const dm = m.dailyMinted ?? { utcDay: day, minted: {} };
  return {
    balances: { ...m.balances },
    generating: Object.fromEntries(
      Object.entries(m.generating).map(([k, v]) => [k, { ...v }]),
    ),
    activity: m.activity,
    dailyActivity: { ...m.dailyActivity },
    dailyMinted: { utcDay: dm.utcDay, minted: { ...dm.minted } },
  };
}

export function minigameSessionToRuntime(
  m: MinigameSessionResponse["playerEconomy"],
  nowMs: number,
): MinigameRuntimeState {
  const day = utcCalendarDay(nowMs);
  const dm = m.dailyMinted ?? { utcDay: day, minted: {} };
  return {
    balances: { ...m.balances },
    generating: Object.fromEntries(
      Object.entries(m.generating).map(([k, v]) => [k, { ...v }]),
    ),
    activity: m.activity,
    dailyActivity: { ...m.dailyActivity },
    dailyMinted: { utcDay: dm.utcDay, minted: { ...dm.minted } },
  };
}

export function runtimeToMinigameSession(
  r: MinigameRuntimeState,
): MinigameSessionResponse["playerEconomy"] {
  return {
    balances: { ...r.balances },
    generating: Object.fromEntries(
      Object.entries(r.generating).map(([k, v]) => [k, { ...v }]),
    ),
    activity: r.activity,
    dailyActivity: { ...r.dailyActivity },
    dailyMinted: {
      utcDay: r.dailyMinted.utcDay,
      minted: { ...r.dailyMinted.minted },
    },
  };
}

export function normalizeMinigameFromApi(
  raw: MinigameSessionResponse["playerEconomy"],
): MinigameSessionResponse["playerEconomy"] {
  const day = utcCalendarDay(Date.now());
  const dm = raw.dailyMinted ?? { utcDay: day, minted: {} };
  return {
    balances: { ...raw.balances },
    generating: Object.fromEntries(
      Object.entries(raw.generating).map(([k, v]) => [k, { ...v }]),
    ),
    activity: raw.activity,
    dailyActivity: { ...raw.dailyActivity },
    dailyMinted: { utcDay: dm.utcDay, minted: { ...dm.minted } },
  };
}

export function applyOptimisticPortalAction(
  actions: Record<string, unknown>,
  minigame: MinigameSessionResponse["playerEconomy"],
  input: {
    actionId: string;
    amounts?: Record<string, number>;
    itemId?: string;
    now?: number;
  },
):
  | { ok: true; playerEconomy: MinigameSessionResponse["playerEconomy"] }
  | { ok: false; error: string } {
  const now = input.now ?? Date.now();
  const config: MinigameConfig = {
    actions: actions as Record<string, MinigameActionDefinition>,
  };
  const runtime = minigameSessionToRuntime(minigame, now);
  const result = processPlayerEconomyAction(config, runtime, {
    actionId: input.actionId,
    amounts: input.amounts,
    itemId: input.itemId,
    now,
  });
  if (!result.ok) {
    return result;
  }
  return { ok: true, playerEconomy: runtimeToMinigameSession(result.state) };
}

export function emptySessionMinigame(
  now = Date.now(),
): MinigameSessionResponse["playerEconomy"] {
  return runtimeToMinigameSession(emptyPlayerEconomyState(now));
}
