import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Modal } from "components/ui/Modal";
import { Panel } from "components/ui/Panel";
import { Button } from "components/ui/Button";
import { Label } from "components/ui/Label";
import { SUNNYSIDE } from "assets/sunnyside";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { NPC_WEARABLES } from "lib/npcs";
import lock from "assets/icons/lock.png";
import { coinsFromMinigame } from "./lib/chickenRescueMachine";
import {
  chickenRescueHomeRootStyle,
  coopFeedProgressBarWidthPx,
} from "./lib/chickenRescueHomeLayout";
import {
  findNuggetJob,
  nuggetCookProgressPercent,
  useNowTicker,
} from "./lib/chickenRescueNugget";
import { useMinigameSession, closePortal } from "lib/portal";
import { CluckcoinShopModal } from "./components/CluckcoinShopModal";
import { ChickenRescueHomeHUD } from "./components/ChickenRescueHomeHUD";
import {
  ChickenRescueRules,
  MinigameCoins,
} from "./components/ChickenRescueRules";
import { ChickenRescueCoopPanel } from "./components/ChickenRescueCoopPanel";
import { ChickenRescueHungryGoblinNpc } from "./components/ChickenRescueHungryGoblinNpc";
import { GoblinChickenModal } from "./components/GoblinChickenModal";

export const ChickenRescueHome: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useAppTranslation();
  const { minigame, dispatchAction, clearApiError, apiError } =
    useMinigameSession();
  const now = useNowTicker();

  const [playModalOpen, setPlayModalOpen] = useState(false);
  const [coopModalOpen, setCoopModalOpen] = useState(false);
  const [cluckcoinShopOpen, setCluckcoinShopOpen] = useState(false);
  const [goblinChickenModalOpen, setGoblinChickenModalOpen] = useState(false);

  const coinsLeft = coinsFromMinigame(minigame);
  const cluckcoin = minigame.balances.Cluckcoin ?? 0;

  const nuggetJob = useMemo(
    () => findNuggetJob(minigame.producing),
    [minigame.producing],
  );
  const nuggetReady = nuggetJob !== null && now >= nuggetJob.completesAt;
  const nuggetCooking = nuggetJob !== null && !nuggetReady;
  const cookProgressPct =
    nuggetJob && nuggetCooking ? nuggetCookProgressPercent(nuggetJob, now) : 0;

  const startRun = () => {
    const ok = dispatchAction({ action: "START" });
    if (ok) {
      setPlayModalOpen(false);
      navigate("/game");
    }
  };

  const buyCoin = () => {
    dispatchAction({ action: "BUY_COIN" });
  };

  const openCluckcoinShop = () => {
    clearApiError();
    setCluckcoinShopOpen(true);
  };

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden [image-rendering:pixelated]"
      style={chickenRescueHomeRootStyle()}
    >
      <ChickenRescueHomeHUD onOpenShop={openCluckcoinShop} />

      <CluckcoinShopModal
        show={cluckcoinShopOpen}
        onClose={() => setCluckcoinShopOpen(false)}
      />

      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-28 z-10 gap-2">
        <button
          type="button"
          className="pointer-events-auto flex flex-col items-center gap-2 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-900/60"
          onClick={() => setCoopModalOpen(true)}
          aria-label={t("minigame.coop")}
        >
          <div className="relative opacity-95 hover:opacity-100 transition-opacity">
            {nuggetReady && (
              <img
                src={SUNNYSIDE.icons.expression_alerted}
                alt=""
                className="absolute -top-2 -right-2 w-9 h-9 md:w-10 md:h-10 pixelated z-10 drop-shadow-md animate-pulse"
                style={{ imageRendering: "pixelated" }}
              />
            )}
            <ChickenRescueHungryGoblinNpc />
          </div>
          {nuggetCooking && (
            <div
              className="h-2.5 rounded-full bg-black/30 overflow-hidden border-2 border-[#3e2731]/80 shadow-inner"
              style={{ width: coopFeedProgressBarWidthPx() }}
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(cookProgressPct)}
            >
              <div
                className="h-full rounded-full bg-[#63c74d] transition-[width] duration-300 ease-linear"
                style={{ width: `${cookProgressPct}%` }}
              />
            </div>
          )}
        </button>

        <button
          type="button"
          className="pointer-events-auto mt-2 rounded-xl border-2 border-[#3e2731]/70 bg-[#e4a672]/30 p-2 shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-900/60"
          onClick={() => setGoblinChickenModalOpen(true)}
          aria-label={t("minigame.goblinChickenTitle")}
        >
          <img
            src={SUNNYSIDE.animals.hungryChicken}
            alt=""
            className="w-16 h-16 sm:w-20 sm:h-20 pixelated mx-auto"
            style={{ imageRendering: "pixelated" }}
          />
          <span className="text-[10px] sm:text-xs mt-1 block text-center font-medium text-[#3e2731]">
            {t("minigame.goblinChickenTitle")}
          </span>
        </button>
      </div>

      <div className="absolute bottom-8 left-0 right-0 flex justify-center z-10 px-4">
        {coinsLeft > 0 ? (
          <Button onClick={() => setPlayModalOpen(true)}>
            {t("minigame.playNow")}
          </Button>
        ) : (
          <Button onClick={() => setPlayModalOpen(true)}>
            {t("minigame.noCoinsRemaining")}
          </Button>
        )}
      </div>

      {coopModalOpen && (
        <Modal show>
          <ChickenRescueCoopPanel onClose={() => setCoopModalOpen(false)} />
        </Modal>
      )}

      {goblinChickenModalOpen && (
        <Modal show>
          <GoblinChickenModal
            onClose={() => setGoblinChickenModalOpen(false)}
            now={now}
          />
        </Modal>
      )}

      {playModalOpen && coinsLeft > 0 && (
        <Modal show>
          <Panel bumpkinParts={NPC_WEARABLES.grubnuk}>
            <ChickenRescueRules
              coinsLeft={coinsLeft}
              onAcknowledged={startRun}
              onClose={() => setPlayModalOpen(false)}
            />
          </Panel>
        </Modal>
      )}

      {playModalOpen && coinsLeft <= 0 && (
        <Modal show>
          <Panel>
            <div className="p-1">
              <div className="flex justify-between items-center mb-2">
                <Label icon={lock} type="danger">
                  {t("minigame.noCoinsRemaining")}
                </Label>
              </div>
              <p className="text-sm mb-2">
                {t("minigame.youHaveRunOutOfCoins")}
              </p>
              <p className="text-sm mb-2">
                {cluckcoin >= 1
                  ? t("minigame.cluckcoinBalanceForUnlock", {
                      count: cluckcoin,
                    })
                  : t("minigame.getCluckcoinOnMarketplace")}
              </p>
              <MinigameCoins coinsLeft={coinsLeft} />
              {apiError && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-2 break-words">
                  {apiError}
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              <Button onClick={() => closePortal(navigate)} className="mr-1">
                {t("exit")}
              </Button>
              <Button
                disabled={cluckcoin < 1}
                onClick={() => {
                  clearApiError();
                  buyCoin();
                }}
              >
                {t("minigame.spendCluckcoinForCoin")}
              </Button>
              <Button className="ml-1" onClick={() => setPlayModalOpen(false)}>
                {t("close")}
              </Button>
            </div>
          </Panel>
        </Modal>
      )}
    </div>
  );
};
