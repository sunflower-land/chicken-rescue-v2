import React from "react";
import { Panel } from "components/ui/Panel";
import { Button } from "components/ui/Button";
import { Label } from "components/ui/Label";
import { SUNNYSIDE } from "assets/sunnyside";
import { NPC_WEARABLES } from "lib/npcs";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { useMinigameSession } from "lib/portal";
import { findNuggetJob, useNowTicker } from "../lib/chickenRescueNugget";

const CHOOK_FEED_COST = 50;

type Props = {
  onClose?: () => void;
};

export const ChickenRescueCoopPanel: React.FC<Props> = ({ onClose }) => {
  const { t } = useAppTranslation();
  const { minigame, dispatchAction, apiError, clearApiError } =
    useMinigameSession();
  const now = useNowTicker();

  const chooks = minigame.balances.Chook ?? 0;
  const nuggets = minigame.balances.Nugget ?? 0;

  const nuggetJob = findNuggetJob(minigame.producing);

  const canFeed = chooks >= CHOOK_FEED_COST && !nuggetJob;
  const nuggetReady = nuggetJob !== null && now >= nuggetJob.completesAt;

  const secondsLeft =
    nuggetJob && !nuggetReady
      ? Math.max(0, Math.ceil((nuggetJob.completesAt - now) / 1000))
      : 0;

  const onFeed = () => {
    clearApiError();
    dispatchAction({ action: "FEED_CHOOK" });
  };

  const onCollect = () => {
    if (!nuggetJob) return;
    clearApiError();
    dispatchAction({
      action: "COLLECT_NUGGET",
      itemId: nuggetJob.id,
    });
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <Panel bumpkinParts={NPC_WEARABLES.grubnuk} className="relative">
        <div className="p-2">
          <Label type="default" className="mb-2" icon={SUNNYSIDE.npcs.goblinHead}>
            {t("minigame.coop")}
          </Label>
          <p className="text-sm mb-1">{t("minigame.feedGoblinPrompt")}</p>
          <p className="text-sm mb-3">
            {t("minigame.feedGoblinOffer", { chookCost: CHOOK_FEED_COST })}
          </p>

          <div className="text-xs mb-3 pt-2 border-t border-black/15 dark:border-white/15 space-y-1 text-neutral-800 dark:text-neutral-100/90">
            <p>{t("minigame.coopChooks", { count: chooks })}</p>
            <p>{t("minigame.coopNuggets", { count: nuggets })}</p>
          </div>

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
          {!nuggetJob && (
            <Button onClick={onFeed} disabled={!canFeed} className="w-full">
              {t("minigame.feedChook")}
            </Button>
          )}

          {nuggetJob && (
            <>
              <div className="rounded-sm bg-black/5 dark:bg-white/10 px-2 py-2 text-sm mb-0.5">
                {nuggetReady ? (
                  <p className="mb-2 text-center">
                    {t("minigame.nuggetReady")}
                  </p>
                ) : (
                  <p className="mb-2 text-center">
                    {t("minigame.nuggetCooking", { seconds: secondsLeft })}
                  </p>
                )}
              </div>
              <Button
                onClick={onCollect}
                disabled={!nuggetReady}
                className="w-full"
              >
                {t("minigame.collectNugget")}
              </Button>
            </>
          )}

          {onClose && (
            <Button className="w-full" onClick={onClose}>
              {t("close")}
            </Button>
          )}
        </div>
      </Panel>
    </div>
  );
};
