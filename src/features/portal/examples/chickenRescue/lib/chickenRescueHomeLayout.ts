import type { CSSProperties } from "react";
import grassBackgroundUrl from "assets/brand/grass_background_2.png";

/**
 * CSS pixels per source pixel for Chicken Rescue home art (fat chicken + grass tile).
 * Tune this single value to resize both together.
 */
export const CHICKEN_RESCUE_HOME_ART_PIXEL_SCALE = 8;

/** `fat_chicken.gif` intrinsic size (px). */
export const FAT_CHICKEN_SRC_WIDTH = 17;
export const FAT_CHICKEN_SRC_HEIGHT = 21;

/** `grass_background_2.png` intrinsic size (px); texture is square. */
export const GRASS_TILE_SRC_PX = 64;

export function fatChickenDisplayWidthPx(
  scale: number = CHICKEN_RESCUE_HOME_ART_PIXEL_SCALE,
): number {
  return FAT_CHICKEN_SRC_WIDTH * scale;
}

/** Nugget cooking bar width as a multiple of the on-screen chicken width. */
export const COOP_FEED_PROGRESS_BAR_WIDTH_RATIO = 1.35;

export function coopFeedProgressBarWidthPx(
  scale: number = CHICKEN_RESCUE_HOME_ART_PIXEL_SCALE,
): number {
  return Math.round(
    fatChickenDisplayWidthPx(scale) * COOP_FEED_PROGRESS_BAR_WIDTH_RATIO,
  );
}

/** Repeating grass tile: each source pixel maps with the same scale as the chicken. */
export function grassTileSizePx(
  scale: number = CHICKEN_RESCUE_HOME_ART_PIXEL_SCALE,
): number {
  return GRASS_TILE_SRC_PX * scale;
}

export function chickenRescueHomeRootStyle(
  scale: number = CHICKEN_RESCUE_HOME_ART_PIXEL_SCALE,
): CSSProperties {
  const tile = grassTileSizePx(scale);
  return {
    backgroundImage: `url(${grassBackgroundUrl})`,
    backgroundRepeat: "repeat",
    backgroundPosition: "top left",
    backgroundSize: `${tile}px ${tile}px`,
    imageRendering: "pixelated",
  };
}
