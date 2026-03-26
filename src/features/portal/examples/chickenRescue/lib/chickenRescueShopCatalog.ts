import type { MinigameSessionResponse } from "lib/portal";
import type { TranslationKeys } from "lib/i18n/dictionaries/types";
import cluckCoinIcon from "assets/icons/cluck_coin.webp";

export type ShopItemId = "cluckcoin_swap";

/**
 * Extend this list and {@link shopItemCanAfford} when adding shop listings.
 */
export type ShopItemDefinition = {
  id: ShopItemId;
  /** Minigame action dispatched on confirm. */
  action: string;
  iconSrc: string;
};

export const SHOP_ITEMS: ShopItemDefinition[] = [
  {
    id: "cluckcoin_swap",
    action: "BUY_CLUCKCOIN",
    iconSrc: cluckCoinIcon,
  },
];

const ITEM_BY_ID: Record<ShopItemId, ShopItemDefinition> = Object.fromEntries(
  SHOP_ITEMS.map((item) => [item.id, item]),
) as Record<ShopItemId, ShopItemDefinition>;

export function getShopItem(id: ShopItemId): ShopItemDefinition {
  return ITEM_BY_ID[id];
}

export function shopItemCanAfford(
  item: ShopItemDefinition,
  minigame: MinigameSessionResponse["minigame"],
): boolean {
  switch (item.id) {
    case "cluckcoin_swap":
      return (minigame.balances.Nugget ?? 0) >= 1;
    default:
      return false;
  }
}

type ShopItemCopyKeys = {
  name: TranslationKeys;
  listBlurb: TranslationKeys;
  detail: TranslationKeys;
  priceValue: TranslationKeys;
  receiveValue: TranslationKeys;
  confirm: TranslationKeys;
};

/** Translation keys per item — add an entry when you add a {@link SHOP_ITEMS} row. */
export const SHOP_ITEM_I18N: Record<ShopItemId, ShopItemCopyKeys> = {
  cluckcoin_swap: {
    name: "minigame.shopCluckcoinName",
    listBlurb: "minigame.shopCluckcoinListBlurb",
    detail: "minigame.shopCluckcoinDetail",
    priceValue: "minigame.shopCluckcoinPriceValue",
    receiveValue: "minigame.shopCluckcoinReceiveValue",
    confirm: "minigame.shopCluckcoinConfirm",
  },
};
