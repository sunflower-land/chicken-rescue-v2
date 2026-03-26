import React from "react";
import { useActor, useInterpret } from "@xstate/react";
import {
  portalBootstrapMachine,
  type BootstrapInterpreter,
} from "./portalBootstrapMachine";
import { BootstrapShell } from "./BootstrapShell";
import { ChickenRescueSessionProvider } from "./ChickenRescueSessionContext";

/** Legacy name: bootstrap service only (session load). */
export type PortalContextBootstrap = {
  bootstrapService: BootstrapInterpreter;
};

export const PortalBootstrapContext = React.createContext<PortalContextBootstrap>(
  {} as PortalContextBootstrap,
);

export const PortalProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const bootstrapService = useInterpret(portalBootstrapMachine) as unknown as BootstrapInterpreter;
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
      <ChickenRescueSessionProvider bootstrap={state.context}>
        {children}
      </ChickenRescueSessionProvider>
    </PortalBootstrapContext.Provider>
  );
};
