import React from "react";
import { BrowserRouter } from "react-router-dom";

import { PortalProvider } from "lib/portal";
import { CHICKEN_RESCUE_CLIENT_ACTIONS } from "./lib/chickenRescueClientActions";
import { ChickenRescueRoutes } from "./ChickenRescueRoutes";

export const ChickenRescueApp: React.FC = () => {
  return (
    <BrowserRouter>
      <PortalProvider offlineActions={CHICKEN_RESCUE_CLIENT_ACTIONS}>
        <ChickenRescueRoutes />
      </PortalProvider>
    </BrowserRouter>
  );
};
