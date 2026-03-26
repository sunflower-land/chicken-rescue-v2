import React from "react";
import { NPCPlaceable } from "features/island/bumpkin/components/NPC";
import { NPC_WEARABLES } from "lib/npcs";
import { chookDisplayWidthPx } from "../lib/chickenRescueHomeLayout";

/**
 * Farm-style NPC (animated WebP via {@link NPCPlaceable}), not the composited NFT image.
 */
export const ChickenRescueHungryGoblinNpc: React.FC = () => {
  const widthPx = Math.round(chookDisplayWidthPx() * 1.15);
  const slotW = Math.ceil(widthPx * 1.25);
  const slotH = Math.ceil(widthPx * 1.15);

  return (
    <div
      className="relative pointer-events-none mx-auto drop-shadow-lg"
      style={{ width: slotW, height: slotH }}
    >
      <NPCPlaceable
        parts={NPC_WEARABLES.grubnuk}
        width={widthPx}
        isManuallyPlaced
      />
    </div>
  );
};
