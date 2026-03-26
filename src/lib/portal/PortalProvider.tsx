import React from "react";
import { useActor, useInterpret } from "@xstate/react";
import {
  createPortalBootstrapMachine,
  type BootstrapInterpreter,
  type PortalBootstrapConfig,
} from "./bootstrapMachine";
import { BootstrapShell } from "./BootstrapShell";
import { MinigameSessionProvider } from "./sessionProvider";

/** Legacy name: bootstrap service only (session load). */
export type PortalContextBootstrap = {
  bootstrapService: BootstrapInterpreter;
};

export const PortalBootstrapContext =
  React.createContext<PortalContextBootstrap>({} as PortalContextBootstrap);

export const PortalProvider: React.FC<
  PortalBootstrapConfig & { children: React.ReactNode }
> = ({ children, offlineActions, bootstrapAction, offlineMinigame }) => {
  const machine = React.useMemo(
    () =>
      createPortalBootstrapMachine({
        offlineActions,
        bootstrapAction,
        offlineMinigame,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const bootstrapService = useInterpret(
    machine,
  ) as unknown as BootstrapInterpreter;
  const [state] = useActor(bootstrapService);

  if (!state.matches("sessionReady")) {
    return (
      <PortalBootstrapContext.Provider value={{ bootstrapService }}>
        <BootstrapShell bootstrapService={bootstrapService} />
      </PortalBootstrapContext.Provider>
    );
  }

  return (
    <PortalBootstrapContext.Provider value={{ bootstrapService }}>
      <MinigameSessionProvider bootstrap={state.context}>
        {children}
      </MinigameSessionProvider>
    </PortalBootstrapContext.Provider>
  );
};
