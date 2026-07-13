"use client";
import { useEffect, useRef } from "react";
import Phaser from "phaser";
import {
  BootScene,
  LobbyScene,
  MainGameScene,
  PauseScene,
  GameOverScene,
} from "@/game/scenes";
import { BonusScene } from "@/game/bonusScene";
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
      scene: [BootScene, LobbyScene, MainGameScene, PauseScene, GameOverScene, BonusScene],
    };

    // Only instantiate once
    if (!gameRef.current) {
      gameRef.current = new Phaser.Game(config);
    }

    // ── Real-time responsive resizing ───────────────────────────────────
    // Phaser's Scale.RESIZE mode listens for the browser's `resize` event,
    // but that alone isn't reliable enough for a fully responsive game:
    // it can miss container-only size changes (flex/layout shifts),
    // mobile address-bar show/hide, split-screen/foldable resizes, and
    // orientation changes on some devices — which is why things only
    // looked right after a hard refresh. Instead we actively watch the
    // actual pixel box of the game container with a ResizeObserver and
    // push the exact size into the game the instant it changes, with
    // window resize/orientationchange kept as extra safety nets.
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
    // Visual viewport changes catch mobile browser chrome (address bar)
    // showing/hiding, which doesn't always fire a plain `resize` event.
    window.visualViewport?.addEventListener("resize", scheduleResize);

    // Sync once immediately in case the container's true size settles a
    // frame after the game was created (common on first mobile paint).
    scheduleResize();

    return () => {
      window.removeEventListener("resize", scheduleResize);
      window.removeEventListener("orientationchange", scheduleResize);
      window.visualViewport?.removeEventListener("resize", scheduleResize);
      resizeObserver?.disconnect();
      if (rafId !== null) cancelAnimationFrame(rafId);
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
