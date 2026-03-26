import React, { useEffect, useState } from "react";
import { Modal } from "components/ui/Modal";
import { Panel } from "components/ui/Panel";
import { Button } from "components/ui/Button";
import { Label } from "components/ui/Label";
import { SUNNYSIDE } from "assets/sunnyside";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { useMinigameSession } from "lib/portal";
import { openCluckcoinMarketplace } from "../lib/chickenRescueCluckcoinMarketplace";
import {
  type ShopItemId,
  SHOP_ITEMS,
  getShopItem,
  shopItemCanAfford,
  SHOP_ITEM_I18N,
} from "../lib/chickenRescueShopCatalog";

type Props = {
  show: boolean;
  onClose: () => void;
};

type ShopScreen = { view: "list" } | { view: "detail"; itemId: ShopItemId };

export const CluckcoinShopModal: React.FC<Props> = ({ show, onClose }) => {
  const { t } = useAppTranslation();
  const { minigame, dispatchAction, apiError, clearApiError } =
    useMinigameSession();

  const [screen, setScreen] = useState<ShopScreen>({ view: "list" });

  useEffect(() => {
    if (show) {
      setScreen({ view: "list" });
    }
  }, [show]);

  const onContinueMarketplace = () => {
    onClose();
    openCluckcoinMarketplace();
  };

  const onConfirmPurchase = (itemId: ShopItemId) => {
    const item = getShopItem(itemId);
    clearApiError();
    dispatchAction({ action: item.action });
  };

  if (!show) {
    return null;
  }

  const detailItem =
    screen.view === "detail" ? getShopItem(screen.itemId) : null;
  const canAffordDetail =
    detailItem !== null && shopItemCanAfford(detailItem, minigame);

  return (
    <Modal show>
      <div className="flex flex-col gap-2 w-full max-w-sm mx-auto px-1">
        <Panel>
          {screen.view === "list" && (
            <>
              <div className="p-2">
                <Label type="default" className="mb-2" icon={SUNNYSIDE.icons.shop}>
                  {t("minigame.portalShopTitle")}
                </Label>
                <p className="text-xs mb-2 opacity-90">
                  {t("minigame.portalShopSubtitle")}
                </p>

                <ul className="flex flex-col gap-1.5">
                  {SHOP_ITEMS.map((item) => (
                    <li key={item.id}>
                      <ShopListRow
                        itemId={item.id}
                        iconSrc={item.iconSrc}
                        canAfford={shopItemCanAfford(item, minigame)}
                        onSelect={() =>
                          setScreen({ view: "detail", itemId: item.id })
                        }
                      />
                    </li>
                  ))}
                </ul>

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
              <div className="flex flex-col gap-1 px-2 pb-2">
                <Button className="w-full" onClick={onClose}>
                  {t("close")}
                </Button>
              </div>
            </>
          )}

          {screen.view === "detail" && detailItem && (
            <>
              <div className="p-2">
                <Button
                  className="text-xs py-1 px-2 mb-2"
                  onClick={() => setScreen({ view: "list" })}
                >
                  {t("minigame.shopBack")}
                </Button>

                <div className="flex flex-col items-center text-center mb-3">
                  <img
                    src={detailItem.iconSrc}
                    alt=""
                    className="w-16 h-16 object-contain mb-2 pixelated"
                    style={{ imageRendering: "pixelated" }}
                  />
                  <h3 className="text-sm font-medium">
                    {t(SHOP_ITEM_I18N[detailItem.id].name)}
                  </h3>
                </div>

                <p className="text-sm mb-3">
                  {t(SHOP_ITEM_I18N[detailItem.id].detail)}
                </p>

                <div className="rounded-sm bg-black/5 dark:bg-white/10 px-2 py-2 text-sm space-y-1.5 mb-3">
                  <div className="flex justify-between gap-2">
                    <span className="opacity-80">
                      {t("minigame.shopPriceLabel")}
                    </span>
                    <span className="font-medium text-right">
                      {t(SHOP_ITEM_I18N[detailItem.id].priceValue)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="opacity-80">
                      {t("minigame.shopReceiveLabel")}
                    </span>
                    <span className="font-medium text-right">
                      {t(SHOP_ITEM_I18N[detailItem.id].receiveValue)}
                    </span>
                  </div>
                </div>

                <p className="text-xs mb-2 border border-black/15 dark:border-white/20 rounded-sm px-2 py-1.5 bg-black/[0.03] dark:bg-white/[0.06]">
                  {t(SHOP_ITEM_I18N[detailItem.id].confirm)}
                </p>

                {!canAffordDetail && (
                  <p className="text-xs text-amber-900 dark:text-amber-200/90 mb-2">
                    {t("minigame.shopInsufficientNuggets")}
                  </p>
                )}

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
                  disabled={!canAffordDetail}
                  onClick={() => onConfirmPurchase(detailItem.id)}
                >
                  {t("minigame.shopConfirm")}
                </Button>
                <Button
                  className="w-full"
                  onClick={() => setScreen({ view: "list" })}
                >
                  {t("minigame.shopBack")}
                </Button>
              </div>
            </>
          )}
        </Panel>

        <Panel>
          <div className="p-2">
            <Label
              type="default"
              className="mb-1 text-xs"
              icon={SUNNYSIDE.icons.tradeIcon}
            >
              {t("minigame.marketplaceTeaserTitle")}
            </Label>
            <p className="text-xs mb-2 opacity-90">
              {t("minigame.marketplaceTeaserDescription")}
            </p>
            <Button className="w-full text-sm py-1" onClick={onContinueMarketplace}>
              {t("minigame.continueToMarketplace")}
            </Button>
          </div>
        </Panel>
      </div>
    </Modal>
  );
};

const ShopListRow: React.FC<{
  itemId: ShopItemId;
  iconSrc: string;
  canAfford: boolean;
  onSelect: () => void;
}> = ({ itemId, iconSrc, canAfford, onSelect }) => {
  const { t } = useAppTranslation();
  const keys = SHOP_ITEM_I18N[itemId];

  const copy = {
    name: t(keys.name),
    blurb: t(keys.listBlurb),
    price: t(keys.priceValue),
  };

  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full text-left rounded-sm border-2 border-black/20 dark:border-white/15 bg-black/[0.04] dark:bg-white/[0.06] hover:brightness-95 dark:hover:brightness-110 transition-[filter] px-2 py-2 flex gap-2 items-center"
    >
      <img
        src={iconSrc}
        alt=""
        className="w-11 h-11 shrink-0 object-contain pixelated"
        style={{ imageRendering: "pixelated" }}
      />
      <div className="min-w-0 flex-1">
        <div className="flex justify-between gap-2 items-start">
          <span className="text-sm font-medium leading-tight">{copy.name}</span>
          <span className="text-xs shrink-0 font-medium opacity-90">
            {copy.price}
          </span>
        </div>
        <p className="text-xs mt-0.5 opacity-85 leading-snug">{copy.blurb}</p>
        {!canAfford && (
          <p className="text-[10px] mt-1 text-amber-900 dark:text-amber-200/80">
            {t("minigame.shopInsufficientNuggets")}
          </p>
        )}
      </div>
      <span className="text-neutral-600 dark:text-neutral-300 text-lg shrink-0">
        ›
      </span>
    </button>
  );
};
