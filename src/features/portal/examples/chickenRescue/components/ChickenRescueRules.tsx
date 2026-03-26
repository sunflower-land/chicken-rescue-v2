import React from "react";

import { SUNNYSIDE } from "assets/sunnyside";
import { Button } from "components/ui/Button";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { Label } from "components/ui/Label";

export const MinigameAttempts: React.FC<{ attemptsLeft: number }> = ({
  attemptsLeft,
}) => {
  const { t } = useAppTranslation();

  if (attemptsLeft > 0) {
    return (
      <Label type="vibrant">{`${attemptsLeft}  ${t(
        "minigame.attemptsRemaining",
      )}`}</Label>
    );
  }

  return <Label type="danger">{t("minigame.noAttemptsRemaining")}</Label>;
};

interface Props {
  onAcknowledged: () => void;
  onClose: () => void;
  attemptsLeft: number;
}

export const ChickenRescueRules: React.FC<Props> = ({
  onAcknowledged,
  onClose,
  attemptsLeft,
}) => {
  const { t } = useAppTranslation();

  return (
    <>
      <div>
        <div className="w-full relative flex justify-between p-1 items-center mb-2">
          <Label type="default" icon={SUNNYSIDE.npcs.goblinHead}>
            {t("minigame.chickenRescue")}
          </Label>
          <MinigameAttempts attemptsLeft={attemptsLeft} />
        </div>
        <p className="text-sm px-1 mb-2">{t("minigame.chickenRescueHelp")}</p>
      </div>
      <div className="flex space-x-1">
        <Button
          className="mt-1 whitespace-nowrap capitalize"
          onClick={() => {
            onClose();
          }}
        >
          {t("exit")}
        </Button>
        <Button
          className="mt-1 whitespace-nowrap capitalize"
          onClick={() => {
            onAcknowledged();
          }}
          disabled={attemptsLeft <= 0}
        >
          {t("start")}
        </Button>
      </div>
    </>
  );
};
