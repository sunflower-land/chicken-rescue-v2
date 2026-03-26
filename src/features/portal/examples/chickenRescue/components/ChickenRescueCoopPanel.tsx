import React from "react";
import { Panel } from "components/ui/Panel";
import { Button } from "components/ui/Button";
import { Label } from "components/ui/Label";
import { SUNNYSIDE } from "assets/sunnyside";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { useChickenRescueSession } from "../lib/ChickenRescueSessionContext";
import {
  findNuggetJob,
  useNowTicker,
} from "../lib/chickenRescueNugget";

const CHOOK_FEED_COST = 50;
const WEIGHT_TOKEN = "ChickenWeigth" as const;

type Props = {
  onClose?: () => void;
};

export const ChickenRescueCoopPanel: React.FC<Props> = ({ onClose }) => {
  const { t } = useAppTranslation();
  const { minigame, dispatchAction, apiError, clearApiError } =
    useChickenRescueSession();
  const now = useNowTicker();

  const chooks = minigame.balances.Chook ?? 0;
  const weight = minigame.balances[WEIGHT_TOKEN] ?? 0;
  const nuggets = minigame.balances.Nugget ?? 0;

  const nuggetJob = findNuggetJob(minigame.producing);

  const canFeed =
    chooks >= CHOOK_FEED_COST &&
    weight >= 1 &&
    !nuggetJob;
  const nuggetReady =
    nuggetJob !== null && now >= nuggetJob.completesAt;

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
      <Panel className="relative">
        <div className="p-2">
          <div className="flex items-center justify-between gap-2 mb-2">
            <Label type="default" icon={SUNNYSIDE.resource.chicken}>
              {t("minigame.coop")}
            </Label>
          </div>

          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-neutral-700 dark:text-neutral-200 mb-3">
            <span>
              {t("minigame.coopChooks", { count: chooks })}
            </span>
            <span>
              {t("minigame.coopNuggets", { count: nuggets })}
            </span>
            {weight > 0 && (
              <span>
                {t("minigame.coopWeight", { count: weight })}
              </span>
            )}
          </div>

          <p className="text-xs mb-2 opacity-90">
            {t("minigame.feedChookCosts")}
          </p>

          <div className="flex flex-col gap-2">
            <Button
              onClick={onFeed}
              disabled={!canFeed}
              className="w-full"
            >
              {t("minigame.feedChook")}
            </Button>

            {nuggetJob && (
              <div className="rounded-sm bg-black/5 dark:bg-white/10 px-2 py-2 text-sm">
                {nuggetReady ? (
                  <p className="mb-2 text-center">
                    {t("minigame.nuggetReady")}
                  </p>
                ) : (
                  <p className="mb-2 text-center">
                    {t("minigame.nuggetCooking", { seconds: secondsLeft })}
                  </p>
                )}
                <Button
                  onClick={onCollect}
                  disabled={!nuggetReady}
                  className="w-full"
                >
                  {t("minigame.collectNugget")}
                </Button>
              </div>
            )}
          </div>

          {apiError && (
            <div className="mt-2 flex flex-col gap-1">
              <p className="text-xs text-red-600 dark:text-red-400 break-words">
                {apiError}
              </p>
              <Button className="text-xs py-1" onClick={clearApiError}>
                {t("close")}
              </Button>
            </div>
          )}

          {onClose && (
            <Button className="w-full mt-2" onClick={onClose}>
              {t("close")}
            </Button>
          )}
        </div>
      </Panel>
    </div>
  );
};
