import Phaser from "phaser";
import { Storage, hydrateFromCloud } from "@/lib/storage";
import { soundManager } from "@/lib/soundManager";
import { useGameStore } from "@/lib/gameStore";
import { mapManager } from "./mapManager";
import {
  ytFirstFrameReady,
  ytGameReady,
  ytSendScore,
  ytRequestInterstitialAd,
  isInPlayablesEnv,
} from "@/lib/ytgame";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("Boot");
  }

  preload() {
    this.load.on("progress", (value: number) => {
      useGameStore.getState().setLoadProgress(Math.floor(value * 100));
    });

    // Signal to YouTube that we are painting frames.
    ytFirstFrameReady();

    const allMaps = mapManager.getAll();
    for (const [, config] of allMaps) {
      for (const asset of config.assets) {
        // Skip Lottie assets — they are handled by the DOM layer directly.
        if (asset.loadType === "lottie") continue;
        const key = config.textureKeys[asset.logicalKey] || config.ns + asset.logicalKey;
        if (asset.loadType === "image") {
          this.load.image(key, asset.path);
        } else if (asset.loadType === "svg") {
          if (asset.w && asset.h) {
            this.load.svg(key, asset.path, { width: asset.w, height: asset.h });
          } else {
            this.load.svg(key, asset.path);
          }
        }
      }
    }
  }

  create() {
    soundManager.init();

    // Hydrate localStorage from YouTube cloud save (async, non-blocking).
    hydrateFromCloud().then(() => {
      useGameStore.getState().setHighScore(Storage.getHighScore());
    });

    // Apply the YouTube audio setting if available; otherwise fall back to settings.
    if (isInPlayablesEnv() && window.ytgame) {
      const audioOn = window.ytgame.system.isAudioEnabled();
      if (!audioOn) soundManager.stopBgm();
    }

    soundManager.startBgm();
    useGameStore.getState().setHighScore(Storage.getHighScore());

    // Animate the loading bar to 100 % for a polished feel.
    const cur = useGameStore.getState().loadProgress;
    const proxy = { val: cur };
    this.tweens.add({
      targets: proxy,
      val: 100,
      duration: 400,
      ease: "Cubic.easeOut",
      onUpdate: () => {
        useGameStore.getState().setLoadProgress(Math.floor(proxy.val));
      },
      onComplete: () => {
        useGameStore.getState().setLoadProgress(100);
      },
    });

    this.time.delayedCall(400, () => {
      useGameStore.getState().setUiState("lobby");
      this.scene.start("Lobby");
    });
  }
}

export class LobbyScene extends Phaser.Scene {
  constructor() {
    super("Lobby");
  }

  create() {
    soundManager.restoreBgmVolume();
    useGameStore.getState().setUiState("lobby");

    // Game is now fully interactive — notify YouTube.
    ytGameReady();

    const handleStart = () => {
      const config = mapManager.getCurrentConfig();
      soundManager.switchBgm(config.music);
      this.scene.start(config.sceneKey);
    };

    window.addEventListener("GAME_START", handleStart);

    this.events.once("shutdown", () => {
      window.removeEventListener("GAME_START", handleStart);
    });
  }
}

export class PauseScene extends Phaser.Scene {
  constructor() {
    super("Pause");
  }

  create() {
    useGameStore.getState().setUiState("paused");
    soundManager.reduceBgmVolume();

    const handleResume = () => {
      useGameStore.getState().setUiState("playing");
      soundManager.restoreBgmVolume();
      this.scene.resume(mapManager.getCurrentConfig().sceneKey);
      this.scene.stop();
    };

    const handleHome = () => {
      soundManager.restoreBgmVolume();
      this.scene.stop(mapManager.getCurrentConfig().sceneKey);
      this.scene.start("Lobby");
      this.scene.stop();
    };

    window.addEventListener("GAME_RESUME", handleResume);
    window.addEventListener("GAME_HOME", handleHome);

    this.events.once("shutdown", () => {
      window.removeEventListener("GAME_RESUME", handleResume);
      window.removeEventListener("GAME_HOME", handleHome);
    });
  }
}

export class GameOverScene extends Phaser.Scene {
  private finalScore = 0;

  constructor() {
    super("GameOver");
  }

  init(data: { score: number }) {
    this.finalScore = data.score || 0;
  }

  create() {
    if (this.finalScore > Storage.getHighScore()) {
      Storage.setHighScore(this.finalScore);
      useGameStore.getState().setHighScore(this.finalScore);
    }

    // Send the score to YouTube leaderboard (non-blocking).
    ytSendScore(this.finalScore);

    // Show an interstitial ad at this natural breakpoint (non-blocking).
    // The UI is already shown; the ad appears as an overlay on top of it.
    ytRequestInterstitialAd();

    useGameStore.getState().setUiState("gameover");

    const handleRestart = () => {
      this.scene.start(mapManager.getCurrentConfig().sceneKey);
    };
    const handleHome = () => {
      this.scene.start("Lobby");
    };

    window.addEventListener("GAME_RESTART", handleRestart);
    window.addEventListener("GAME_HOME", handleHome);

    this.events.once("shutdown", () => {
      window.removeEventListener("GAME_RESTART", handleRestart);
      window.removeEventListener("GAME_HOME", handleHome);
    });
  }
}
