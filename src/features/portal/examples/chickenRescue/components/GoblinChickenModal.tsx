import React, { useMemo } from "react";
import { Panel } from "components/ui/Panel";
import { Button } from "components/ui/Button";
import { Label } from "components/ui/Label";
import { SUNNYSIDE } from "assets/sunnyside";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { useMinigameSession } from "lib/portal";
import {
  coinProducingJobs,
  formatTimeLeftMs,
  goblinCoinCookProgressPercent,
} from "../lib/chickenRescueGoblinCoin";
import {
  goblinChickensFromMinigame,
} from "../lib/chickenRescueMachine";

type Props = {
  onClose: () => void;
  now: number;
};

export const GoblinChickenModal: React.FC<Props> = ({ onClose, now }) => {
  const { t } = useAppTranslation();
  const { minigame, dispatchAction, apiError, clearApiError } =
    useMinigameSession();

  const goblins = goblinChickensFromMinigame(minigame);
  const jobs = useMemo(
    () => coinProducingJobs(minigame.producing),
    [minigame.producing],
  );

  const readyJobs = jobs.filter((j) => now >= j.completesAt);
  const cookingJobs = jobs.filter((j) => now < j.completesAt);

  const canStartAnother = jobs.length < goblins;

  const startNextDrop = () => {
    clearApiError();
    dispatchAction({ action: "START_GOBLIN_COIN_DROP" });
  };

  const collectJob = (itemId: string) => {
    clearApiError();
    dispatchAction({ action: "COLLECT_GOBLIN_COINS", itemId });
  };

  const buyGoblin = () => {
    clearApiError();
    dispatchAction({ action: "BUY_GOBLIN_CHICKEN" });
  };

  const cluckcoin = minigame.balances.Cluckcoin ?? 0;

  return (
    <Panel>
      <div className="p-2 max-w-sm mx-auto">
        <div className="flex justify-between items-start gap-2 mb-2">
          <Label type="default" icon={SUNNYSIDE.animals.hungryChicken}>
            {t("minigame.goblinChickenTitle")}
          </Label>
          <Button className="text-xs py-1 px-2 shrink-0" onClick={onClose}>
            {t("close")}
          </Button>
        </div>

        <p className="text-xs mb-2 opacity-95">
          {t("minigame.goblinChickenBody", { count: goblins })}
        </p>

        <p className="text-xs mb-2">
          {t("minigame.goblinChickensOwned", { count: goblins })}
        </p>

        {readyJobs.length > 0 && (
          <div className="flex flex-col gap-1.5 mb-2">
            {readyJobs.map((j) => (
              <Button
                key={j.id}
                className="w-full"
                onClick={() => collectJob(j.id)}
              >
                {t("minigame.collectGoblinCoins")}
              </Button>
            ))}
          </div>
        )}

        {cookingJobs.map((j) => {
          const left = j.completesAt - now;
          const pct = goblinCoinCookProgressPercent(j, now);
          return (
            <div key={j.id} className="mb-2">
              <p className="text-xs mb-1">
                {t("minigame.coinDropCooking", {
                  time: formatTimeLeftMs(left),
                })}
              </p>
              <div
                className="h-2 rounded-full bg-black/30 overflow-hidden border border-[#3e2731]/60"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(pct)}
              >
                <div
                  className="h-full rounded-full bg-amber-500/90 transition-[width] duration-300 ease-linear"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}

        <div className="flex flex-col gap-1.5 mt-2">
          <Button
            className="w-full"
            disabled={!canStartAnother}
            onClick={startNextDrop}
          >
            {t("minigame.startNextCoinDrop")}
          </Button>
          <Button
            className="w-full"
            disabled={cluckcoin < 5}
            onClick={buyGoblin}
          >
            {t("minigame.buyGoblinChicken")}
          </Button>
        </div>

        {apiError && (
          <div className="mt-2 rounded-sm bg-red-500/10 px-2 py-1.5">
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
    </Panel>
  );
};
