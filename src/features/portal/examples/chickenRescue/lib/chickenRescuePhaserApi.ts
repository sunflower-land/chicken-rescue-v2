import type { MutableRefObject } from "react";

/** Live handlers Phaser reads via ref (updated each React render). */
export type ChickenRescuePhaserHandlers = {
  getScore: () => number;
  onChickenRescued: (points: number) => void;
  onGameOver: () => void;
};

export type ChickenRescuePhaserApiRef = MutableRefObject<ChickenRescuePhaserHandlers>;

export const defaultPhaserHandlers = (): ChickenRescuePhaserHandlers => ({
  getScore: () => 0,
  onChickenRescued: () => {},
  onGameOver: () => {},
});
