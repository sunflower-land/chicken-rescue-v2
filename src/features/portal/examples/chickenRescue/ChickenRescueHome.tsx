import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal } from "components/ui/Modal";
import { Panel } from "components/ui/Panel";
import { Button } from "components/ui/Button";
import { Label } from "components/ui/Label";
import { SUNNYSIDE } from "assets/sunnyside";
import chookIcon from "assets/icons/chook.webp";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { NPC_WEARABLES } from "lib/npcs";
import lock from "assets/icons/lock.png";
import { attemptsFromMinigame } from "./lib/chickenRescueMachine";
import {
  chickenRescueHomeRootStyle,
  coopFeedProgressBarWidthPx,
  chookDisplayWidthPx,
} from "./lib/chickenRescueHomeLayout";
import {
  findNuggetJob,
  nuggetCookProgressPercent,
  useNowTicker,
} from "./lib/chickenRescueNugget";
import { useChickenRescueSession } from "./lib/ChickenRescueSessionContext";
import { CluckcoinShopModal } from "./components/CluckcoinShopModal";
import { goHome } from "./lib/chickenRescueExit";
import { ChickenRescueHomeHUD } from "./components/ChickenRescueHomeHUD";
import {
  ChickenRescueRules,
  MinigameAttempts,
} from "./components/ChickenRescueRules";
import { ChickenRescueCoopPanel } from "./components/ChickenRescueCoopPanel";

export const ChickenRescueHome: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useAppTranslation();
  const { minigame, dispatchAction, clearApiError } = useChickenRescueSession();
  const now = useNowTicker();

  const [playModalOpen, setPlayModalOpen] = useState(false);
  const [coopModalOpen, setCoopModalOpen] = useState(false);
  const [cluckcoinShopOpen, setCluckcoinShopOpen] = useState(false);

  const attemptsLeft = attemptsFromMinigame(minigame);
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

  const buyRun = () => {
    dispatchAction({ action: "BUY_RUNS" });
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
      <ChickenRescueHomeHUD />

      <CluckcoinShopModal
        show={cluckcoinShopOpen}
        onClose={() => setCluckcoinShopOpen(false)}
      />

      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-28 z-10 gap-3">
        <button
          type="button"
          className="pointer-events-auto rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-900/60 p-0.5"
          onClick={openCluckcoinShop}
          aria-label={t("minigame.cluckcoinMarketplaceTitle")}
        >
          <img
            src={SUNNYSIDE.icons.shop}
            alt=""
            className="w-12 h-12 sm:w-14 sm:h-14 pixelated drop-shadow-md opacity-95 hover:opacity-100 transition-opacity"
            style={{ imageRendering: "pixelated" }}
          />
        </button>
        <button
          type="button"
          className="pointer-events-auto flex flex-col items-center gap-2 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-900/60"
          onClick={() => setCoopModalOpen(true)}
          aria-label={t("minigame.coop")}
        >
          <div className="relative">
            {nuggetReady && (
              <img
                src={SUNNYSIDE.icons.expression_alerted}
                alt=""
                className="absolute -top-2 -right-2 w-9 h-9 md:w-10 md:h-10 pixelated z-10 drop-shadow-md animate-pulse"
                style={{ imageRendering: "pixelated" }}
              />
            )}
            <img
              src={chookIcon}
              alt=""
              className="max-w-none pixelated drop-shadow-lg opacity-90 hover:opacity-100 transition-opacity"
              style={{
                width: chookDisplayWidthPx(),
                height: "auto",
                imageRendering: "pixelated",
              }}
            />
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
      </div>

      <div className="absolute bottom-8 left-0 right-0 flex justify-center z-10 px-4">
        {attemptsLeft > 0 ? (
          <Button onClick={() => setPlayModalOpen(true)}>
            {t("minigame.playNow")}
          </Button>
        ) : (
          <Button onClick={() => setPlayModalOpen(true)}>
            {t("minigame.noAttemptsRemaining")}
          </Button>
        )}
      </div>

      {coopModalOpen && (
        <Modal show>
          <ChickenRescueCoopPanel onClose={() => setCoopModalOpen(false)} />
        </Modal>
      )}

      {playModalOpen && attemptsLeft > 0 && (
        <Modal show>
          <Panel bumpkinParts={NPC_WEARABLES.chicken}>
            <ChickenRescueRules
              attemptsLeft={attemptsLeft}
              onAcknowledged={startRun}
              onClose={() => setPlayModalOpen(false)}
            />
          </Panel>
        </Modal>
      )}

      {playModalOpen && attemptsLeft <= 0 && (
        <Modal show>
          <Panel>
            <div className="p-1">
              <div className="flex justify-between items-center mb-2">
                <Label icon={lock} type="danger">
                  {t("minigame.noAttemptsRemaining")}
                </Label>
              </div>
              <p className="text-sm mb-2">
                {t("minigame.youHaveRunOutOfAttempts")}
              </p>
              <p className="text-sm mb-2">
                {t("minigame.youHaveRunOutOfAttempts")}
              </p>
              <p className="text-sm mb-2">
                {cluckcoin >= 1
                  ? t("minigame.cluckcoinBalanceForUnlock", {
                      count: cluckcoin,
                    })
                  : t("minigame.getCluckcoinOnMarketplace")}
              </p>
              <MinigameAttempts attemptsLeft={attemptsLeft} />
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              <Button onClick={() => goHome(navigate)} className="mr-1">
                {t("exit")}
              </Button>
              <Button
                disabled={cluckcoin < 1}
                onClick={() => {
                  buyRun();
                }}
              >
                {t("minigame.spendCluckcoinForAttempt")}
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
