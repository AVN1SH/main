"use client";
import { useEffect, useRef } from "react";
import Phaser from "phaser";
import { soundManager } from "@/lib/soundManager";
import { useGameStore } from "@/lib/gameStore";
import { ytOnPause, ytOnResume, ytOnAudioEnabledChange } from "@/lib/ytgame";
import {
  BootScene,
  LobbyScene,
  PauseScene,
  GameOverScene,
} from "@/game/scenes";
import { BonusScene } from "@/game/bonusScene";
import { MainGameScene_Map1 } from "@/game/maps/map-1";
import { MainGameScene_Map2 } from "@/game/maps/map-2";
import { MainGameScene_Map3 } from "@/game/maps/map-3";
import GameObjectsOverlay from "./GameObjectsOverlay";

export default function GameWrapper() {
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: "phaser-container",
      scale: {
        mode: Phaser.Scale.RESIZE,
        width: "100%",
        height: "100%",
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      pixelArt: false,
      antialias: true,
      antialiasGL: true,
      roundPixels: false,
      physics: {
        default: "arcade",
        arcade: { gravity: { y: 800, x: 0 }, debug: false },
      },
      transparent: true,
      scene: [
        BootScene,
        LobbyScene,
        MainGameScene_Map1,
        MainGameScene_Map2,
        MainGameScene_Map3,
        PauseScene,
        GameOverScene,
        BonusScene,
      ],
    };

    if (!gameRef.current) {
      gameRef.current = new Phaser.Game(config);
    }

    const container = document.getElementById("phaser-container");
    let rafId: number | null = null;

    const applyResize = () => {
      rafId = null;
      const game = gameRef.current;
      if (!game || !container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w > 0 && h > 0) {
        game.scale.resize(w, h);
        game.scale.refresh();
      }
    };

    const scheduleResize = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(applyResize);
    };

    let resizeObserver: ResizeObserver | null = null;
    if (container && typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(scheduleResize);
      resizeObserver.observe(container);
    }

    window.addEventListener("resize", scheduleResize);
    window.addEventListener("orientationchange", scheduleResize);
    window.visualViewport?.addEventListener("resize", scheduleResize);

    scheduleResize();

    // Pause game + music when tab is hidden; resume when visible again
    let wasAutopaused = false;
    const handleVisibilityChange = () => {
      const uiState = useGameStore.getState().uiState;
      if (document.hidden) {
        soundManager.pauseBgm();
        if (uiState === "playing") {
          wasAutopaused = true;
          window.dispatchEvent(new CustomEvent("GAME_PAUSE"));
        }
      } else {
        soundManager.resumeBgm();
        if (wasAutopaused) {
          wasAutopaused = false;
          window.dispatchEvent(new CustomEvent("GAME_RESUME"));
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // ── YouTube Playables SDK hooks ──────────────────────────────────────
    // YouTube may pause/resume the game externally (e.g. user navigates away).
    const cleanupYtPause = ytOnPause(() => {
      soundManager.pauseBgm();
      const uiState = useGameStore.getState().uiState;
      if (uiState === "playing") {
        wasAutopaused = true;
        window.dispatchEvent(new CustomEvent("GAME_PAUSE"));
      }
    });

    const cleanupYtResume = ytOnResume(() => {
      soundManager.resumeBgm();
      if (wasAutopaused) {
        wasAutopaused = false;
        window.dispatchEvent(new CustomEvent("GAME_RESUME"));
      }
    });

    // Respect YouTube's audio mute toggle in real-time.
    const cleanupYtAudio = ytOnAudioEnabledChange((enabled) => {
      if (enabled) {
        soundManager.resumeBgm();
      } else {
        soundManager.pauseBgm();
      }
    });

    return () => {
      window.removeEventListener("resize", scheduleResize);
      window.removeEventListener("orientationchange", scheduleResize);
      window.visualViewport?.removeEventListener("resize", scheduleResize);
      resizeObserver?.disconnect();
      if (rafId !== null) cancelAnimationFrame(rafId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      cleanupYtPause();
      cleanupYtResume();
      cleanupYtAudio();
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div id="phaser-container" className="w-full h-full">
      <GameObjectsOverlay />
    </div>
  );
}
