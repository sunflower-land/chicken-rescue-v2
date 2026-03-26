import React from "react";
import { BrowserRouter } from "react-router-dom";

import { WalletProvider } from "features/wallet/WalletProvider";

import { PortalProvider } from "./lib/PortalProvider";
import { ChickenRescueRoutes } from "./ChickenRescueRoutes";

export const ChickenRescueApp: React.FC = () => {
  return (
    <WalletProvider>
      <BrowserRouter>
        <PortalProvider>
          <ChickenRescueRoutes />
        </PortalProvider>
      </BrowserRouter>
    </WalletProvider>
  );
};
