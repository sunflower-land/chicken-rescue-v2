import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Modal } from "components/ui/Modal";
import { Panel } from "components/ui/Panel";
import { Button } from "components/ui/Button";
import { Label } from "components/ui/Label";
import { Box } from "components/ui/Box";
import chookIcon from "assets/icons/chook.webp";
import goldenChookIcon from "assets/sfts/golden_chook.png";
import { NPC_WEARABLES } from "lib/npcs";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import {
  chooksForScore,
  GAME_SECONDS,
  hasLiveGame,
} from "./lib/chickenRescueMachine";
import { useMinigameSession } from "lib/portal";
import { useChickenRescueActionIds } from "./lib/useChickenRescueActionIds";
import { GameRunProvider } from "./lib/GameRunContext";
import { defaultPhaserHandlers } from "./lib/chickenRescuePhaserApi";
import type { ChickenRescuePhaserApiRef } from "./lib/chickenRescuePhaserApi";
import { ChickenRescueGame } from "./ChickenRescueGame";
import type { ChickenRescueRunType } from "./lib/GameRunContext";
import { ChickenRescueHUD } from "./components/ChickenRescueHUD";

export const ChickenRescueGamePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useAppTranslation();
  const { playerEconomy, farm, farmId, dispatchAction } = useMinigameSession();
  const actionIds = useChickenRescueActionIds();

  const scoreRef = useRef(0);
  const goldenRef = useRef(0);
  const [score, setScore] = useState(0);
  const [goldenCount, setGoldenCount] = useState(0);
  const [endAt] = useState(() => Date.now() + GAME_SECONDS * 1000);
  const [runEnd, setRunEnd] = useState<"playing" | "results">("playing");
  const resultsShown = useRef(false);
  const phaserApiRef = useRef(
    defaultPhaserHandlers(),
  ) as ChickenRescuePhaserApiRef;

  const runType: ChickenRescueRunType =
    searchParams.get("run") === "advanced" ||
    ((playerEconomy.balances.ADVANCED_GAME ?? 0) > 0 &&
      searchParams.get("run") !== "basic")
      ? "advanced"
      : "basic";

  useEffect(() => {
    if (!hasLiveGame(playerEconomy)) {
      navigate("/home", { replace: true });
    }
  }, [playerEconomy, navigate]);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  const openResultsModal = useCallback(() => {
    if (resultsShown.current) {
      return;
    }
    resultsShown.current = true;
    setRunEnd("results");
  }, []);

  useLayoutEffect(() => {
    phaserApiRef.current.getScore = () => scoreRef.current;
    phaserApiRef.current.onChickenRescued = (p, meta) => {
      setScore((s) => s + p);
      if (meta?.golden) {
        setGoldenCount((prev) => {
          const next = Math.min(3, prev + 1);
          goldenRef.current = next;
          return next;
        });
      }
    };
    phaserApiRef.current.onGameOver = openResultsModal;
  }, [openResultsModal]);

  const onClaim = useCallback(() => {
    const final = scoreRef.current;
    const finalGolden = goldenRef.current;
    const isAdvanced = runType === "advanced";
    const chooks = chooksForScore(final);
    const won = chooks > 0 || (isAdvanced && finalGolden > 0);
    const ok = won
      ? dispatchAction({
          action: isAdvanced ? actionIds.winAdvanced : actionIds.winBasic,
          amounts: isAdvanced
            ? { "1": chooks, "2": finalGolden }
            : { "1": chooks },
        })
      : dispatchAction({
          action: isAdvanced ? actionIds.loseAdvanced : actionIds.loseBasic,
        });
    if (ok) {
      // Stay inside the iframe on /home so the minigame API can finish and the
      // player can start another run. Closing the parent iframe races the save.
      navigate("/home", { replace: true });
    }
  }, [
    actionIds.loseAdvanced,
    actionIds.loseBasic,
    actionIds.winAdvanced,
    actionIds.winBasic,
    dispatchAction,
    navigate,
    runType,
  ]);

  const chooksEarned = chooksForScore(score);

  const gameRunValue = useMemo(
    () => ({
      score,
      goldenCount,
      setScore,
      endAt,
      runType,
    }),
    [score, goldenCount, endAt, runType],
  );

  return (
    <GameRunProvider value={gameRunValue}>
      <div className="relative min-h-screen w-full bg-black">
        <ChickenRescueGame
          bumpkin={farm?.bumpkin}
          farmId={farmId}
          phaserApiRef={phaserApiRef}
          runType={runType}
        />
        {runEnd === "playing" && <ChickenRescueHUD />}

        {runEnd === "results" && (
          <Modal show>
            <Panel bumpkinParts={NPC_WEARABLES["pumpkin' pete"]}>
              <div className="p-1">
                <Label type="default" className="mb-2">
                  {t("minigame.chickenRescue.gameOver")}
                </Label>
                <p className="text-sm mb-2 text-[#3e2731]">
                  {chooksEarned > 0
                    ? t("minigame.chickenRescue.resultsFoundChooks")
                    : t("minigame.chickenRescue.resultsNoChooks")}
                </p>
                <div className="flex flex-col gap-2 mb-1">
                  <div className="flex flex-row items-center gap-2">
                    <Box image={chookIcon} hideCount />
                    <span className="text-xs text-[#3e2731]">
                      {t("minigame.chickenRescue.foundChooksLine", {
                        count: chooksEarned,
                      })}
                    </span>
                  </div>
                  {runType === "advanced" && (
                    <div className="flex flex-row items-center gap-2">
                      <Box image={goldenChookIcon} hideCount />
                      <span className="text-xs text-[#3e2731]">
                        {t("minigame.chickenRescue.foundGoldenChooksLine", {
                          count: goldenCount,
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <Button className="mt-1 w-full" onClick={onClaim}>
                {t("continue")}
              </Button>
            </Panel>
          </Modal>
        )}
      </div>
    </GameRunProvider>
  );
};
