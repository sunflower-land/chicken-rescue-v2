import React, { useContext, useState } from "react";
import Spritesheet from "components/animation/SpriteAnimator";
import classNames from "classnames";
import {
  BumpkinBody,
  BumpkinHair,
  BumpkinBackground,
  BumpkinShoe,
  BumpkinTool,
  BumpkinAura,
  ITEM_IDS,
} from "features/game/types/bumpkin";
import { PIXEL_SCALE } from "features/game/lib/constants";
import { BumpkinParts } from "lib/utils/tokenUriBuilder";
import { ZoomContext } from "components/ZoomProvider";
import { SpringValue } from "@react-spring/web";
import { CONFIG } from "lib/config";
import {
  ANIMATION,
  getAnimatedWebpUrl,
  getAnimationUrl,
} from "features/world/lib/animations";
import silhouette from "assets/bumpkins/silhouette.png";

const FRAME_HEIGHT = 19;
const AURA_WIDTH = 160 / 8;
const AURA_STEPS = 8;

export type NPCParts = Omit<
  BumpkinParts,
  "background" | "hair" | "body" | "shoes" | "tool" | "aura"
> & {
  background: BumpkinBackground;
  hair: BumpkinHair;
  body: BumpkinBody;
  shoes: BumpkinShoe;
  tool: BumpkinTool;
  aura?: BumpkinAura;
};

export interface NPCProps {
  parts: Partial<NPCParts>;
  width?: number;
  isManuallyPlaced?: boolean;
}

export const NPCPlaceable: React.FC<NPCProps & { onClick?: () => void }> = ({
  parts,
  onClick,
  width = PIXEL_SCALE * 16,
  isManuallyPlaced = false,
}) => {
  const { scale } = useContext(ZoomContext);

  const idle = getAnimatedWebpUrl(parts as BumpkinParts, ["idle-small"]);
  const auraBack =
    parts.aura &&
    `${CONFIG.PROTECTED_IMAGE_URL}/aura/back/${ITEM_IDS[parts.aura]}.png`;
  const auraFront =
    parts.aura &&
    `${CONFIG.PROTECTED_IMAGE_URL}/aura/front/${ITEM_IDS[parts.aura]}.png`;

  const height = isManuallyPlaced ? width : width * 2;
  const frontAuraTop = width * 0.3 * (isManuallyPlaced ? -1 : 1);
  const backAuraTop = width * 0.125 * (isManuallyPlaced ? -1 : 1);

  return (
    <div
      className={classNames("absolute", {
        "cursor-pointer hover:img-highlight": !!onClick,
      })}
      onClick={() => !!onClick && onClick()}
      style={{
        width: `${width}px`,
        height: `${height}px`,
      }}
    >
      {auraBack && (
        <Spritesheet
          className="absolute w-full inset-0 pointer-events-none"
          style={{
            width: `${width * 1.25}px`,
            top: `${backAuraTop}px`,
            left: `${width * -0.125}px`,
            imageRendering: "pixelated",
          }}
          image={auraBack}
          widthFrame={AURA_WIDTH}
          heightFrame={FRAME_HEIGHT}
          zoomScale={scale}
          steps={AURA_STEPS}
          fps={14}
          autoplay={true}
          loop={true}
        />
      )}
      <div
        className="absolute w-full inset-0 pointer-events-none"
        style={{
          width: `${width * 1.25}px`,
          top: `${width * 0.31 * (isManuallyPlaced ? -1 : 1)}px`,
          left: `${width * -0.125}px`,
          imageRendering: "pixelated",
        }}
      >
        <img src={idle} style={{ width: `${width * 1.25}px` }} alt="" />
      </div>

      {auraFront && (
        <Spritesheet
          className="absolute w-full inset-0 pointer-events-none"
          style={{
            width: `${width * 1.25}px`,
            top: `${frontAuraTop}px`,
            left: `${width * -0.125}px`,
            imageRendering: "pixelated",
          }}
          image={auraFront}
          widthFrame={AURA_WIDTH}
          heightFrame={FRAME_HEIGHT}
          zoomScale={scale}
          steps={AURA_STEPS}
          fps={14}
          autoplay={true}
          loop={true}
        />
      )}
    </div>
  );
};

export const NPC = NPCPlaceable;

export const NPCIcon: React.FC<NPCProps> = ({
  parts,
  width = PIXEL_SCALE * 14,
}) => {
  const [loaded, setLoaded] = useState(false);
  const idle = getAnimatedWebpUrl(parts as BumpkinParts, ["idle-small"]);
  const auraBack =
    parts.aura &&
    `${CONFIG.PROTECTED_IMAGE_URL}/aura/back/${ITEM_IDS[parts.aura]}.png`;
  const auraFront =
    parts.aura &&
    `${CONFIG.PROTECTED_IMAGE_URL}/aura/front/${ITEM_IDS[parts.aura]}.png`;

  return (
    <div>
      {auraBack && (
        <Spritesheet
          className="absolute w-full inset-0 pointer-events-none"
          style={{
            width: `${width}px`,
            top: `${width * -0.21}px`,
            imageRendering: "pixelated",
          }}
          image={auraBack}
          widthFrame={AURA_WIDTH}
          heightFrame={FRAME_HEIGHT}
          zoomScale={new SpringValue(1)}
          steps={AURA_STEPS}
          fps={14}
          autoplay={true}
          loop={true}
        />
      )}
      <div
        className="w-full inset-0 pointer-events-none"
        style={{
          width: `${width}px`,
          imageRendering: "pixelated",
        }}
      >
        <div
          className="relative"
          style={{ width: `${width}px`, height: `${width}px` }}
        >
          <img
            id="idle"
            src={idle}
            style={{ width: `${width}px` }}
            alt=""
            onLoad={() => setLoaded(true)}
          />
          {!loaded && (
            <img
              id="silhouette"
              src={silhouette}
              alt=""
              className="w-3/5 absolute top-1.5 left-1.5"
            />
          )}
        </div>
      </div>
      {auraFront && (
        <Spritesheet
          className="absolute w-full inset-0 pointer-events-none"
          style={{
            width: `${width}px`,
            top: `${width * 0.14}px`,
            imageRendering: "pixelated",
          }}
          image={auraFront}
          widthFrame={AURA_WIDTH}
          heightFrame={FRAME_HEIGHT}
          zoomScale={new SpringValue(1)}
          steps={AURA_STEPS}
          fps={14}
          autoplay={true}
          loop={true}
        />
      )}
    </div>
  );
};

export const NPCFixed: React.FC<NPCProps & { width: number }> = ({
  parts,
  width,
}) => {
  const idle = getAnimationUrl(parts as BumpkinParts, ANIMATION.idle_small);
  const auraBack =
    parts.aura &&
    `${CONFIG.PROTECTED_IMAGE_URL}/aura/back/${ITEM_IDS[parts.aura]}.png`;
  const auraFront =
    parts.aura &&
    `${CONFIG.PROTECTED_IMAGE_URL}/aura/front/${ITEM_IDS[parts.aura]}.png`;

  return (
    <div
      className="relative overflow-hidden"
      style={{
        imageRendering: "pixelated",
        width: `${width}px`,
        height: `${width}px`,
      }}
    >
      {auraBack && (
        <img
          src={auraBack}
          alt=""
          className="block absolute"
          style={{
            transform: "scale(9)",
            top: `${PIXEL_SCALE * 6}px`,
            left: "400%",
          }}
        />
      )}
      <img
        src={idle}
        alt=""
        className="block absolute"
        style={{
          transform: "scale(9)",
          top: `${PIXEL_SCALE * 6}px`,
          left: "400%",
        }}
      />
      {auraFront && (
        <img
          src={auraFront}
          alt=""
          className="block absolute"
          style={{
            transform: "scale(9)",
            top: `${PIXEL_SCALE * 6}px`,
            left: "400%",
          }}
        />
      )}
    </div>
  );
};
