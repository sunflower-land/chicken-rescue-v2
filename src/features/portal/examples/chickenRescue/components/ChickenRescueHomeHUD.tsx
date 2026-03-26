import React from "react";
import Decimal from "decimal.js-light";
import { Box } from "components/ui/Box";
import chookIcon from "assets/icons/chook.webp";
import chickenNuggetIcon from "assets/icons/chicken_nugget.webp";
import cluckCoinIcon from "assets/icons/cluck_coin.webp";
import { useChickenRescueSession } from "../lib/ChickenRescueSessionContext";

export const ChickenRescueHomeHUD: React.FC = () => {
  const { minigame } = useChickenRescueSession();

  const chooks = minigame.balances.Chook ?? 0;
  const cluckcoin = minigame.balances.Cluckcoin ?? 0;
  const nuggets = minigame.balances.Nugget ?? 0;

  return (
    <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-1">
      <Box
        image={chookIcon}
        count={new Decimal(chooks)}
        showCountIfZero
        className="flex-shrink-0"
      />
      <Box
        image={cluckCoinIcon}
        count={new Decimal(cluckcoin)}
        showCountIfZero
        className="flex-shrink-0"
      />
      <Box
        image={chickenNuggetIcon}
        count={new Decimal(nuggets)}
        showCountIfZero
        className="flex-shrink-0"
      />
    </div>
  );
};
