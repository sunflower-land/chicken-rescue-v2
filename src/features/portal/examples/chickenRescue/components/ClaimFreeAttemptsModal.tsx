import React from "react";
import { Modal } from "components/ui/Modal";
import { Panel } from "components/ui/Panel";
import { Button } from "components/ui/Button";
import { Label } from "components/ui/Label";
import { SUNNYSIDE } from "assets/sunnyside";
import { useAppTranslation } from "lib/i18n/useAppTranslations";

type Props = {
  show: boolean;
  freeAttemptsCount: number;
  apiError: string | null;
  onClaim: () => void;
  onDismiss: () => void;
  onClearError: () => void;
};

export const ClaimFreeAttemptsModal: React.FC<Props> = ({
  show,
  freeAttemptsCount,
  apiError,
  onClaim,
  onDismiss,
  onClearError,
}) => {
  const { t } = useAppTranslation();

  if (!show) {
    return null;
  }

  return (
    <Modal show>
      <Panel>
        <div className="p-2">
          <div className="flex items-center gap-2 mb-2">
            <Label type="vibrant" icon={SUNNYSIDE.npcs.goblinHead}>
              {t("minigame.claimFreeAttemptsTitle")}
            </Label>
          </div>
          <p className="text-sm mb-3">
            {t("minigame.claimFreeAttemptsBody", {
              count: freeAttemptsCount,
            })}
          </p>
          {apiError && (
            <div className="mb-2 rounded-sm bg-red-500/10 px-2 py-1.5">
              <p className="text-xs text-red-600 dark:text-red-400 break-words">
                {apiError}
              </p>
              <Button
                className="w-full text-xs py-1 mt-1"
                onClick={onClearError}
              >
                {t("close")}
              </Button>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1 px-2 pb-2">
          <Button className="w-full" onClick={onClaim}>
            {t("minigame.claimFreeAttemptsButton", {
              count: freeAttemptsCount,
            })}
          </Button>
          <Button className="w-full" onClick={onDismiss}>
            {t("minigame.claimFreeAttemptsLater")}
          </Button>
        </div>
      </Panel>
    </Modal>
  );
};
