import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { flushSync } from "react-dom";
import { getUrl } from "./url";
import type { MinigameSessionResponse } from "./types";
import { postPlayerEconomyAction } from "./api";
import type { BootstrapContext } from "./bootstrapMachine";
import {
  applyOptimisticPortalAction,
  cloneMinigameSnapshot,
  mergeMinigameEconomyFromApi,
  normalizeMinigameFromApi,
} from "./runtimeHelpers";

export type DispatchMinigameActionInput = {
  action: string;
  amounts?: Record<string, number>;
  itemId?: string;
};

/** Commit a minigame-owned economy snapshot and sync to the portal API (no processAction). */
export type CommitLocalPlayerEconomyInput = {
  nextPlayerEconomy: MinigameSessionResponse["playerEconomy"];
  action: string;
  amounts?: Record<string, number>;
  itemId?: string;
};

export type MinigameSessionValue = {
  farmId: number;
  jwt: string;
  farm: MinigameSessionResponse["farm"];
  playerEconomy: MinigameSessionResponse["playerEconomy"];
  actions: Record<string, unknown>;
  dispatchAction: (input: DispatchMinigameActionInput) => boolean;
  /**
   * Applies `nextPlayerEconomy` locally and POSTs the action. Does not read
   * session `actions` / processAction (use for minigames that own transitions).
   */
  commitLocalPlayerEconomySync: (
    input: CommitLocalPlayerEconomyInput,
  ) => boolean;
  /**
   * Applies actions in order on the updated state after each step. Stops at the
   * first failure and keeps prior successful steps (partial success). Returns
   * whether at least one action applied.
   */
  dispatchMinigameActionsSequential: (
    inputs: DispatchMinigameActionInput[],
  ) => boolean;
  apiError: string | null;
  clearApiError: () => void;
};

const MinigameSessionContext = createContext<MinigameSessionValue | null>(null);

export function useMinigameSession(): MinigameSessionValue {
  const v = useContext(MinigameSessionContext);
  if (!v) {
    throw new Error("useMinigameSession outside provider");
  }
  return v;
}

export function MinigameSessionProvider({
  bootstrap,
  children,
}: {
  bootstrap: BootstrapContext;
  children: React.ReactNode;
}) {
  const [playerEconomy, setPlayerEconomy] = useState(() =>
    normalizeMinigameFromApi(bootstrap.playerEconomy),
  );
  const [apiError, setApiError] = useState<string | null>(null);

  const runAfterLocalEconomyCommit = useCallback(
    (
      rollback: MinigameSessionResponse["playerEconomy"],
      nextEconomy: MinigameSessionResponse["playerEconomy"],
      input: {
        action: string;
        amounts?: Record<string, number>;
        itemId?: string;
      },
    ) => {
      flushSync(() => {
        setPlayerEconomy(nextEconomy);
      });
      console.log("[CR-run-debug] local economy committed", {
        action: input.action,
        LIVE_GAME: nextEconomy.balances.LIVE_GAME,
        ADVANCED_GAME: nextEconomy.balances.ADVANCED_GAME,
      });

      if (!getUrl()) {
        return;
      }

      void postPlayerEconomyAction({
        portalId: bootstrap.portalId,
        token: bootstrap.jwt as string,
        action: input.action,
        amounts: input.amounts,
        itemId: input.itemId,
      }      ).then(
        (res) => {
          setPlayerEconomy((prev) =>
            mergeMinigameEconomyFromApi(prev, res.playerEconomy),
          );
        },
        (err) => {
          const message = err instanceof Error ? err.message : String(err);
          console.error("[ChickenRescue] portal action API request failed", {
            action: input.action,
            amounts: input.amounts,
            itemId: input.itemId,
            message,
            error: err,
          });
          setPlayerEconomy(rollback);
          setApiError(message);
        },
      );
    },
    [bootstrap.jwt, bootstrap.portalId],
  );

  const commitLocalPlayerEconomySync = useCallback(
    (input: CommitLocalPlayerEconomyInput): boolean => {
      setApiError(null);
      const rollback = cloneMinigameSnapshot(playerEconomy);
      const nextEconomy = cloneMinigameSnapshot(input.nextPlayerEconomy);
      runAfterLocalEconomyCommit(rollback, nextEconomy, input);
      return true;
    },
    [playerEconomy, runAfterLocalEconomyCommit],
  );

  const dispatchAction = useCallback(
    (input: DispatchMinigameActionInput): boolean => {
      setApiError(null);
      const rollback = cloneMinigameSnapshot(playerEconomy);
      const next = applyOptimisticPortalAction(
        bootstrap.actions,
        playerEconomy,
        {
          actionId: input.action,
          amounts: input.amounts,
          itemId: input.itemId,
        },
      );
      if (!next.ok) {
        console.error(
          "[ChickenRescue] dispatchAction optimistic update failed",
          {
            action: input.action,
            error: next.error,
            amounts: input.amounts,
            itemId: input.itemId,
            configuredActions: Object.keys(bootstrap.actions ?? {}),
          },
        );
        return false;
      }
      runAfterLocalEconomyCommit(rollback, next.playerEconomy, input);
      return true;
    },
    [bootstrap.actions, playerEconomy, runAfterLocalEconomyCommit],
  );

  const dispatchMinigameActionsSequential = useCallback(
    (inputs: DispatchMinigameActionInput[]): boolean => {
      if (inputs.length === 0) {
        return true;
      }
      setApiError(null);
      const rollback = cloneMinigameSnapshot(playerEconomy);
      let current = playerEconomy;
      let applied = 0;
      for (const input of inputs) {
        const next = applyOptimisticPortalAction(bootstrap.actions, current, {
          actionId: input.action,
          amounts: input.amounts,
          itemId: input.itemId,
        });
        if (!next.ok) {
          if (applied === 0) {
            console.error(
              "[ChickenRescue] dispatchMinigameActionsSequential optimistic failed (first step)",
              {
                action: input.action,
                error: next.error,
                amounts: input.amounts,
                itemId: input.itemId,
                configuredActions: Object.keys(bootstrap.actions ?? {}),
              },
            );
          }
          break;
        }
        current = next.playerEconomy;
        applied += 1;
      }
      if (applied === 0) {
        return false;
      }
      flushSync(() => {
        setPlayerEconomy(current);
      });
      console.log("[CR-run-debug] dispatchMinigameActionsSequential committed", {
        applied,
        LIVE_GAME: current.balances.LIVE_GAME,
        ADVANCED_GAME: current.balances.ADVANCED_GAME,
      });

      if (!getUrl()) {
        return true;
      }

      void (async () => {
        let state = rollback;
        for (const input of inputs) {
          const step = applyOptimisticPortalAction(bootstrap.actions, state, {
            actionId: input.action,
            amounts: input.amounts,
            itemId: input.itemId,
          });
          if (!step.ok) {
            console.error(
              "[ChickenRescue] dispatchMinigameActionsSequential API replay optimistic failed",
              {
                action: input.action,
                error: step.error,
                amounts: input.amounts,
                itemId: input.itemId,
              },
            );
            break;
          }
          try {
            const res = await postPlayerEconomyAction({
              portalId: bootstrap.portalId,
              token: bootstrap.jwt as string,
              action: input.action,
              amounts: input.amounts,
              itemId: input.itemId,
            });
            state = mergeMinigameEconomyFromApi(state, res.playerEconomy);
          } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            console.error(
              "[ChickenRescue] dispatchMinigameActionsSequential API request failed",
              {
                action: input.action,
                amounts: input.amounts,
                itemId: input.itemId,
                message,
                error: err,
              },
            );
            setPlayerEconomy(state);
            setApiError(message);
            return;
          }
        }
        setPlayerEconomy(state);
      })();
      return true;
    },
    [bootstrap.actions, bootstrap.jwt, bootstrap.portalId, playerEconomy],
  );

  const clearApiError = useCallback(() => setApiError(null), []);

  const value = useMemo(
    (): MinigameSessionValue => ({
      farmId: bootstrap.id,
      jwt: bootstrap.jwt as string,
      farm: bootstrap.farm,
      playerEconomy,
      actions: bootstrap.actions,
      dispatchAction,
      commitLocalPlayerEconomySync,
      dispatchMinigameActionsSequential,
      apiError,
      clearApiError,
    }),
    [
      bootstrap.id,
      bootstrap.jwt,
      bootstrap.farm,
      bootstrap.actions,
      playerEconomy,
      dispatchAction,
      commitLocalPlayerEconomySync,
      dispatchMinigameActionsSequential,
      apiError,
      clearApiError,
    ],
  );

  return (
    <MinigameSessionContext.Provider value={value}>
      {children}
    </MinigameSessionContext.Provider>
  );
}
