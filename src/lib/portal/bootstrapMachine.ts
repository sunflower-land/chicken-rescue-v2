import { assign, createMachine, Interpreter, State } from "xstate";
import jwt_decode from "jwt-decode";
import { CONFIG } from "lib/config";
import { getUrl, getJwt } from "./url";
import { getMinigameSession, postMinigameAction } from "./api";
import type { MinigameSessionResponse, BootstrapContext } from "./types";
import {
  emptySessionMinigame,
  normalizeMinigameFromApi,
} from "./runtimeHelpers";

function decodeToken(token: string): { farmId?: number } {
  const decoded = jwt_decode(token) as any;
  return { ...decoded, ...decoded.properties };
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
  minigame: MinigameSessionResponse["minigame"],
): Promise<MinigameSessionResponse["minigame"]> {
  try {
    const { minigame: next } = await postMinigameAction({
      portalId,
      token,
      action,
    });
    return normalizeMinigameFromApi(next);
  } catch {
    return minigame;
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
  offlineMinigame?: () => MinigameSessionResponse["minigame"];
};

export function createPortalBootstrapMachine({
  offlineActions,
  bootstrapAction,
  offlineMinigame,
}: PortalBootstrapConfig) {
  const initialMinigame = offlineMinigame?.() ?? emptySessionMinigame();
  return createMachine({
    id: "portalBootstrap",
    initial: "initialising",
    context: {
      id: 0,
      jwt: getJwt() ?? "",
      farm: { balance: "0" },
      minigame: initialMinigame,
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
              return {
                farm,
                minigame: offlineMinigame?.() ?? emptySessionMinigame(),
                actions: offlineActions,
                farmId: 0,
              };
            }

            const { farmId } = decodeToken(context.jwt as string);
            const portalId = CONFIG.PORTAL_APP;

            const session = await getMinigameSession({
              portalId,
              token: context.jwt as string,
            });

            let minigame = normalizeMinigameFromApi(session.minigame);
            if (bootstrapAction) {
              minigame = await tryBootstrapAction(
                portalId,
                context.jwt as string,
                bootstrapAction,
                minigame,
              );
            }

            return {
              farm: session.farm,
              minigame,
              actions: session.actions,
              farmId,
            };
          },
          onDone: {
            target: "sessionReady",
            actions: assign({
              farm: (_c, e: { data: any }) => e.data.farm,
              minigame: (_c, e: { data: any }) =>
                normalizeMinigameFromApi(e.data.minigame),
              actions: (_c, e: { data: any }) => e.data.actions,
              id: (_c, e: { data: any }) => e.data.farmId,
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
