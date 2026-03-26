import React from "react";
import Decimal from "decimal.js-light";
import { Box } from "components/ui/Box";
import { SUNNYSIDE } from "assets/sunnyside";
import chookIcon from "assets/icons/chook.webp";
import chickenNuggetIcon from "assets/icons/chicken_nugget.webp";
import cluckCoinIcon from "assets/icons/cluck_coin.webp";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { useMinigameSession } from "lib/portal";

type Props = {
  onOpenShop: () => void;
};

export const ChickenRescueHomeHUD: React.FC<Props> = ({ onOpenShop }) => {
  const { t } = useAppTranslation();
  const { minigame } = useMinigameSession();

  const chooks = minigame.balances.Chook ?? 0;
  const cluckcoin = minigame.balances.Cluckcoin ?? 0;
  const nuggets = minigame.balances.Nugget ?? 0;

  return (
    <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-start gap-3 pointer-events-none">
      <button
        type="button"
        className="pointer-events-auto rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-900/60 p-0.5 flex-shrink-0"
        onClick={onOpenShop}
        aria-label={t("minigame.cluckcoinMarketplaceTitle")}
      >
        <img
          src={SUNNYSIDE.icons.shop}
          alt=""
          className="w-12 h-12 sm:w-14 sm:h-14 pixelated drop-shadow-md opacity-95 hover:opacity-100 transition-opacity"
          style={{ imageRendering: "pixelated" }}
        />
      </button>

      <div className="flex flex-col items-end gap-1 flex-shrink-0 pointer-events-auto">
        <Box
          image={chickenNuggetIcon}
          count={new Decimal(nuggets)}
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
          image={chookIcon}
          count={new Decimal(chooks)}
          showCountIfZero
          className="flex-shrink-0"
        />
      </div>
    </div>
  );
};
