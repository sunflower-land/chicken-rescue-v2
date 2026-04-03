import { assign, createMachine, Interpreter, State } from "xstate";
import jwt_decode from "jwt-decode";
import { CONFIG } from "lib/config";
import { getUrl, getJwt } from "./url";
import { getPlayerEconomySession, postPlayerEconomyAction } from "./api";
import type { MinigameSessionResponse, BootstrapContext } from "./types";
import {
  emptySessionMinigame,
  normalizeMinigameFromApi,
} from "./runtimeHelpers";

/**
 * Portal login JWT includes top-level `farmId` and `portalId` (see API `portals/login`).
 * Some tokens nest fields under `properties`; merge for compatibility.
 */
function decodePortalToken(token: string): {
  farmId?: number;
  portalId?: string;
} {
  try {
    const decoded = jwt_decode(token) as Record<string, unknown> & {
      properties?: Record<string, unknown>;
    };
    const merged = {
      ...decoded,
      ...(typeof decoded.properties === "object" && decoded.properties !== null
        ? decoded.properties
        : {}),
    } as Record<string, unknown>;
    const farmRaw = merged.farmId;
    const farmId =
      typeof farmRaw === "number"
        ? farmRaw
        : typeof farmRaw === "string"
          ? Number(farmRaw)
          : undefined;
    const p = merged.portalId;
    const portalId =
      typeof p === "string" && p.trim().length > 0 ? p.trim() : undefined;
    return {
      farmId: Number.isFinite(farmId) ? farmId : undefined,
      portalId,
    };
  } catch {
    return {};
  }
}

export type { BootstrapContext };

export type BootstrapEvent = { type: "RETRY" };

export type BootstrapState = {
  value: "initialising" | "unauthorised" | "loading" | "error" | "sessionReady";
  context: BootstrapContext;
};

export type BootstrapInterpreter = Interpreter<
  BootstrapContext,
  any,
  BootstrapEvent,
  BootstrapState
>;

export type BootstrapMachineState = State<
  BootstrapContext,
  BootstrapEvent,
  BootstrapState
>;

async function tryBootstrapAction(
  portalId: string,
  token: string,
  action: string,
  economy: MinigameSessionResponse["playerEconomy"],
): Promise<MinigameSessionResponse["playerEconomy"]> {
  try {
    const { playerEconomy: next } = await postPlayerEconomyAction({
      portalId,
      token,
      action,
    });
    return normalizeMinigameFromApi(next);
  } catch {
    return economy;
  }
}

export type PortalBootstrapConfig = {
  /** Action definitions used when no API URL is configured (local/offline mode). */
  offlineActions: Record<string, unknown>;
  /**
   * Optional action to fire immediately after loading the session (e.g. to
   * claim daily free attempts). Skipped when running offline.
   */
  bootstrapAction?: string;
  /**
   * When set, used instead of {@link emptySessionMinigame} when there is no API URL
   * (local/offline mode).
   */
  offlineMinigame?: () => MinigameSessionResponse["playerEconomy"];
};

export function createPortalBootstrapMachine({
  offlineActions,
  bootstrapAction,
  offlineMinigame,
}: PortalBootstrapConfig) {
  const initialPlayerEconomy = offlineMinigame?.() ?? emptySessionMinigame();
  return createMachine({
    id: "portalBootstrap",
    initial: "initialising",
    context: {
      id: 0,
      jwt: getJwt() ?? "",
      portalId: (CONFIG.PORTAL_APP ?? "").trim(),
      farm: { balance: "0" },
      playerEconomy: initialPlayerEconomy,
      actions: {},
    },
    states: {
      initialising: {
        always: [
          {
            target: "unauthorised",
            // Only block when we would call the API but have no portal token.
            cond: (context) => !!getUrl() && !context.jwt,
          },
          { target: "loading" },
        ],
      },

      loading: {
        invoke: {
          src: async (context) => {
            if (!getUrl()) {
              const farm = { balance: "0" };
              const portalId = (CONFIG.PORTAL_APP ?? "").trim();
              return {
                farm,
                playerEconomy: offlineMinigame?.() ?? emptySessionMinigame(),
                actions: offlineActions,
                farmId: 0,
                portalId,
              };
            }

            const { farmId, portalId: fromJwt } = decodePortalToken(
              context.jwt as string,
            );
            const portalId =
              fromJwt ?? (CONFIG.PORTAL_APP ?? "").trim();
            if (!portalId) {
              throw new Error(
                "Portal JWT is missing portalId; re-open the minigame from the game or set VITE_PORTAL_APP.",
              );
            }

            const session = await getPlayerEconomySession({
              portalId,
              token: context.jwt as string,
            });

            let playerEconomy = normalizeMinigameFromApi(session.playerEconomy);
            if (bootstrapAction) {
              playerEconomy = await tryBootstrapAction(
                portalId,
                context.jwt as string,
                bootstrapAction,
                playerEconomy,
              );
            }

            return {
              farm: session.farm,
              playerEconomy,
              actions: session.actions,
              farmId,
              portalId,
            };
          },
          onDone: {
            target: "sessionReady",
            actions: assign({
              farm: (_c, e: { data: any }) => e.data.farm,
              playerEconomy: (_c, e: { data: any }) =>
                normalizeMinigameFromApi(e.data.playerEconomy),
              actions: (_c, e: { data: any }) => e.data.actions,
              id: (_c, e: { data: any }) => e.data.farmId,
              portalId: (_c, e: { data: { portalId: string } }) =>
                e.data.portalId,
            }) as any,
          },
          onError: {
            target: "error",
          },
        },
      },

      sessionReady: {},

      error: {
        on: {
          RETRY: { target: "initialising" },
        },
      },

      unauthorised: {},
    },
  });
}
