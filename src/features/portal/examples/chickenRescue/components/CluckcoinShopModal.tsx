import React from "react";
import { Modal } from "components/ui/Modal";
import { Panel } from "components/ui/Panel";
import { Button } from "components/ui/Button";
import { Label } from "components/ui/Label";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { useChickenRescueSession } from "../lib/ChickenRescueSessionContext";
import { openCluckcoinMarketplace } from "../lib/chickenRescueCluckcoinMarketplace";
import cluckCoinIcon from "assets/icons/cluck_coin.webp";

type Props = {
  show: boolean;
  onClose: () => void;
};

export const CluckcoinShopModal: React.FC<Props> = ({ show, onClose }) => {
  const { t } = useAppTranslation();
  const { minigame, dispatchAction, apiError, clearApiError } =
    useChickenRescueSession();

  const nuggets = minigame.balances.Nugget ?? 0;
  const canSwapNugget = nuggets >= 1;

  const onSwapNugget = () => {
    clearApiError();
    dispatchAction({ action: "BUY_CLUCKCOIN" });
  };

  const onContinueMarketplace = () => {
    onClose();
    openCluckcoinMarketplace();
  };

  if (!show) {
    return null;
  }

  return (
    <Modal show>
      <Panel>
        <div className="p-2">
          <Label type="default" className="mb-2" icon={cluckCoinIcon}>
            {t("minigame.cluckcoinMarketplaceTitle")}
          </Label>
          <p className="text-sm mb-2">{t("minigame.cluckcoinLimitedSwap")}</p>
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
          <Button className="w-full" onClick={onClose}>
            {t("close")}
          </Button>
        </div>
      </Panel>
    </Modal>
  );
};
