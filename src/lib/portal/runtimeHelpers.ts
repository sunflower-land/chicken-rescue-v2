import type { MinigameSessionResponse } from "./types";
import {
  emptyMinigameState,
  processMinigameAction,
  type MinigameActionDefinition,
  type MinigameConfig,
  type MinigameRuntimeState,
  utcCalendarDay,
} from "./processAction";

export function cloneMinigameSnapshot(
  m: MinigameSessionResponse["minigame"],
): MinigameSessionResponse["minigame"] {
  const day = utcCalendarDay(Date.now());
  const dm = m.dailyMinted ?? { utcDay: day, minted: {} };
  return {
    balances: { ...m.balances },
    producing: Object.fromEntries(
      Object.entries(m.producing).map(([k, v]) => [k, { ...v }]),
    ),
    activity: m.activity,
    dailyActivity: { ...m.dailyActivity },
    dailyMinted: { utcDay: dm.utcDay, minted: { ...dm.minted } },
  };
}

export function minigameSessionToRuntime(
  m: MinigameSessionResponse["minigame"],
  nowMs: number,
): MinigameRuntimeState {
  const day = utcCalendarDay(nowMs);
  const dm = m.dailyMinted ?? { utcDay: day, minted: {} };
  return {
    balances: { ...m.balances },
    producing: Object.fromEntries(
      Object.entries(m.producing).map(([k, v]) => [k, { ...v }]),
    ),
    activity: m.activity,
    dailyActivity: { ...m.dailyActivity },
    dailyMinted: { utcDay: dm.utcDay, minted: { ...dm.minted } },
  };
}

export function runtimeToMinigameSession(
  r: MinigameRuntimeState,
): MinigameSessionResponse["minigame"] {
  return {
    balances: { ...r.balances },
    producing: Object.fromEntries(
      Object.entries(r.producing).map(([k, v]) => [k, { ...v }]),
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
  raw: MinigameSessionResponse["minigame"],
): MinigameSessionResponse["minigame"] {
  const day = utcCalendarDay(Date.now());
  const dm = raw.dailyMinted ?? { utcDay: day, minted: {} };
  return {
    balances: { ...raw.balances },
    producing: Object.fromEntries(
      Object.entries(raw.producing).map(([k, v]) => [k, { ...v }]),
    ),
    activity: raw.activity,
    dailyActivity: { ...raw.dailyActivity },
    dailyMinted: { utcDay: dm.utcDay, minted: { ...dm.minted } },
  };
}

export function applyOptimisticPortalAction(
  actions: Record<string, unknown>,
  minigame: MinigameSessionResponse["minigame"],
  input: {
    actionId: string;
    amounts?: Record<string, number>;
    itemId?: string;
    now?: number;
  },
):
  | { ok: true; minigame: MinigameSessionResponse["minigame"] }
  | { ok: false; error: string } {
  const now = input.now ?? Date.now();
  const config: MinigameConfig = {
    actions: actions as Record<string, MinigameActionDefinition>,
  };
  const runtime = minigameSessionToRuntime(minigame, now);
  const result = processMinigameAction(config, runtime, {
    actionId: input.actionId,
    amounts: input.amounts,
    itemId: input.itemId,
    now,
  });
  if (!result.ok) {
    return result;
  }
  return { ok: true, minigame: runtimeToMinigameSession(result.state) };
}

export function emptySessionMinigame(
  now = Date.now(),
): MinigameSessionResponse["minigame"] {
  return runtimeToMinigameSession(emptyMinigameState(now));
}
