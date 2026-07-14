/**
 * Unified storage layer.
 *
 * All reads/writes go through localStorage so they are always synchronous and
 * immediately available. When the game is running inside the YouTube Playables
 * environment, every write is additionally persisted to the YouTube cloud save
 * via the ytgame SDK so progress survives across devices.
 *
 * The cloud-save sync is fire-and-forget — the game never waits for it.
 */
import { isInPlayablesEnv } from "./ytgame";

// ─── Internal key constants ───────────────────────────────────────────────────
const K = {
  highScore:    "whirly_highscore",
  coins:        "whirly_coins",
  settings:     "whirly_settings",
  tutorial:     "whirly_tutorial",
  unlockedMaps: "whirly_unlocked_maps",
};

// ─── Cloud-save sync helper ───────────────────────────────────────────────────

/** Persist the entire local save snapshot to YouTube cloud save (async, fire-and-forget). */
function syncToCloud() {
  if (typeof window === "undefined" || !isInPlayablesEnv()) return;
  try {
    const snapshot = {
      [K.highScore]:    localStorage.getItem(K.highScore)    ?? "0",
      [K.coins]:        localStorage.getItem(K.coins)        ?? "0",
      [K.settings]:     localStorage.getItem(K.settings)     ?? "",
      [K.tutorial]:     localStorage.getItem(K.tutorial)     ?? "",
      [K.unlockedMaps]: localStorage.getItem(K.unlockedMaps) ?? "",
    };
    window.ytgame!.game.saveData(JSON.stringify(snapshot)).catch(() => {});
  } catch {
    // Non-critical — swallow
  }
}

/**
 * On boot inside Playables env, pull the cloud save and hydrate localStorage.
 * Call this once at startup (before BootScene runs).
 */
export async function hydrateFromCloud(): Promise<void> {
  if (typeof window === "undefined" || !isInPlayablesEnv()) return;
  try {
    const raw = await window.ytgame!.game.loadData();
    if (!raw) return;
    const snapshot: Record<string, string> = JSON.parse(raw);
    for (const [key, value] of Object.entries(snapshot)) {
      if (value) localStorage.setItem(key, value);
    }
  } catch {
    // Cloud load failed — fall back to whatever is in localStorage already
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const Storage = {
  getHighScore: (): number =>
    parseInt(typeof window !== "undefined" ? localStorage.getItem(K.highScore) ?? "0" : "0"),

  setHighScore: (score: number): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem(K.highScore, score.toString());
    syncToCloud();
  },

  getCoins: (): number =>
    parseInt(typeof window !== "undefined" ? localStorage.getItem(K.coins) ?? "0" : "0"),

  setCoins: (coins: number): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem(K.coins, coins.toString());
    syncToCloud();
  },

  getSettings: (): { music: boolean; sfx: boolean } => {
    const fallback = { music: true, sfx: true };
    if (typeof window === "undefined") return fallback;
    try {
      return JSON.parse(localStorage.getItem(K.settings) ?? JSON.stringify(fallback));
    } catch {
      return fallback;
    }
  },

  setSettings: (settings: { music: boolean; sfx: boolean }): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem(K.settings, JSON.stringify(settings));
    syncToCloud();
  },

  getTutorialDone: (): boolean =>
    typeof window !== "undefined" && localStorage.getItem(K.tutorial) === "true",

  setTutorialDone: (): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem(K.tutorial, "true");
    syncToCloud();
  },

  getUnlockedMaps: (): string[] => {
    if (typeof window === "undefined") return ["map-1"];
    const saved = localStorage.getItem(K.unlockedMaps);
    return saved ? JSON.parse(saved) : ["map-1"];
  },

  unlockMap: (mapId: string): void => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem(K.unlockedMaps);
    const maps: string[] = saved ? JSON.parse(saved) : ["map-1"];
    if (!maps.includes(mapId)) {
      maps.push(mapId);
      localStorage.setItem(K.unlockedMaps, JSON.stringify(maps));
      syncToCloud();
    }
  },
};
