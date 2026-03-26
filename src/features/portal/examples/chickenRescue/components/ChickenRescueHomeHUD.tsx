import React, { useState } from "react";
import { Modal } from "components/ui/Modal";
import { Panel } from "components/ui/Panel";
import { Button } from "components/ui/Button";
import { Label } from "components/ui/Label";
import { SUNNYSIDE } from "assets/sunnyside";
import { ITEM_DETAILS } from "features/game/types/images";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { useChickenRescueSession } from "../lib/ChickenRescueSessionContext";
import { openCluckcoinMarketplace } from "../lib/chickenRescueCluckcoinMarketplace";

export const ChickenRescueHomeHUD: React.FC = () => {
  const { t } = useAppTranslation();
  const { minigame, dispatchAction, apiError, clearApiError } =
    useChickenRescueSession();
  const [marketplaceModalOpen, setMarketplaceModalOpen] = useState(false);

  const chooks = minigame.balances.Chook ?? 0;
  const cluckcoin = minigame.balances.Cluckcoin ?? 0;
  const nuggets = minigame.balances.Nugget ?? 0;

  const canSwapNugget = nuggets >= 1;

  const onOpenModal = () => {
    clearApiError();
    setMarketplaceModalOpen(true);
  };

  const onSwapNugget = () => {
    clearApiError();
    dispatchAction({ action: "BUY_CLUCKCOIN" });
  };

  const onContinueMarketplace = () => {
    setMarketplaceModalOpen(false);
    openCluckcoinMarketplace();
  };

  return (
    <>
      <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2">
        <div className="flex flex-col gap-2 rounded-md bg-black/40 px-3 py-2 text-white text-stroke min-w-[10rem]">
          <div className="flex items-center gap-2">
            <img
              src={SUNNYSIDE.resource.chicken}
              alt=""
              className="w-7 h-7 pixelated shrink-0"
              style={{ imageRendering: "pixelated" }}
            />
            <span className="text-base font-medium tabular-nums">{chooks}</span>
            <span className="text-xs opacity-90">Chooks</span>
          </div>

          <div className="flex items-center gap-1">
            <img
              src={SUNNYSIDE.icons.money_icon}
              alt=""
              className="w-7 h-7 pixelated shrink-0"
              style={{ imageRendering: "pixelated" }}
            />
            <span className="text-base font-medium tabular-nums">{cluckcoin}</span>
            <span className="text-xs opacity-90 shrink-0">Cluckcoin</span>
            <button
              type="button"
              className="ml-auto p-1 rounded hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200/80"
              aria-label={t("minigame.cluckcoinMarketplaceTitle")}
              onClick={onOpenModal}
            >
              <img
                src={SUNNYSIDE.icons.plus}
                alt=""
                className="w-5 h-5 pixelated"
                style={{ imageRendering: "pixelated" }}
              />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <img
              src={ITEM_DETAILS.Nugget.image}
              alt=""
              className="w-7 h-7 pixelated shrink-0"
              style={{ imageRendering: "pixelated" }}
            />
            <span className="text-base font-medium tabular-nums">{nuggets}</span>
            <span className="text-xs opacity-90">Nuggets</span>
          </div>
        </div>
      </div>

      {marketplaceModalOpen && (
        <Modal show>
          <Panel>
            <div className="p-2">
              <Label type="default" className="mb-2" icon={SUNNYSIDE.icons.money_icon}>
                {t("minigame.cluckcoinMarketplaceTitle")}
              </Label>
              <p className="text-sm mb-2">
                {t("minigame.cluckcoinLimitedSwap")}
              </p>
              <p className="text-sm mb-3">
                {t("minigame.cluckcoinMarketplaceDescription")}
              </p>
              {apiError && (
                <div className="mb-2 rounded-sm bg-red-500/10 px-2 py-1.5">
                  <p className="text-xs text-red-600 dark:text-red-400 break-words">
                    {apiError}
                  </p>
                  <Button
                    className="w-full text-xs py-1 mt-1"
                    onClick={clearApiError}
                  >
                    {t("close")}
                  </Button>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1 px-2 pb-2">
              <Button
                className="w-full"
                disabled={!canSwapNugget}
                onClick={onSwapNugget}
              >
                {t("minigame.swapNuggetForCluckcoin")}
              </Button>
              <Button className="w-full" onClick={onContinueMarketplace}>
                {t("minigame.continueToMarketplace")}
              </Button>
              <Button className="w-full" onClick={() => setMarketplaceModalOpen(false)}>
                {t("close")}
              </Button>
            </div>
          </Panel>
        </Modal>
      )}
    </>
  );
};
