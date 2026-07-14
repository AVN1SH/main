/**
 * YouTube Playables SDK wrapper.
 *
 * All functions gracefully no-op when the SDK is not loaded (i.e. outside of
 * the YouTube Playables environment), so the game works identically in dev and
 * in production without any extra guards at the call sites.
 */

declare global {
  interface Window {
    ytgame?: {
      IN_PLAYABLES_ENV: boolean;
      SDK_VERSION: string;
      ads: {
        requestInterstitialAd(): Promise<void>;
        requestRewardedAd(rewardId: string): Promise<boolean>;
      };
      engagement: {
        sendScore(score: { value: number }): Promise<void>;
      };
      game: {
        firstFrameReady(): void;
        gameReady(): void;
        saveData(data: string): Promise<void>;
        loadData(): Promise<string>;
      };
      health: {
        logError(): void;
        logWarning(): void;
      };
      system: {
        getLanguage(): Promise<string>;
        isAudioEnabled(): boolean;
        onAudioEnabledChange(cb: (enabled: boolean) => void): () => void;
        onPause(cb: () => void): () => void;
        onResume(cb: () => void): () => void;
      };
    };
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** True only when running inside the real YouTube Playables shell. */
export const isInPlayablesEnv = (): boolean =>
  typeof window !== "undefined" &&
  typeof window.ytgame !== "undefined" &&
  window.ytgame.IN_PLAYABLES_ENV === true;

// ─── Game lifecycle ───────────────────────────────────────────────────────────

/** Must be called as soon as the very first frame is painted. */
export function ytFirstFrameReady() {
  try {
    window.ytgame?.game.firstFrameReady();
  } catch (e) {
    window.ytgame?.health.logError();
  }
}

/** Must be called when the game is fully interactive (lobby/lobby-ready). */
export function ytGameReady() {
  try {
    window.ytgame?.game.gameReady();
  } catch (e) {
    window.ytgame?.health.logError();
  }
}

// ─── Score ────────────────────────────────────────────────────────────────────

/** Send the player's final score to YouTube. */
export async function ytSendScore(score: number) {
  if (!isInPlayablesEnv()) return;
  try {
    await window.ytgame!.engagement.sendScore({ value: Math.floor(score) });
  } catch {
    // Non-critical — swallow
  }
}

// ─── Ads ─────────────────────────────────────────────────────────────────────

/** Show an interstitial ad. Resolves even if the ad fails. */
export async function ytRequestInterstitialAd(): Promise<void> {
  if (!isInPlayablesEnv()) return;
  try {
    await window.ytgame!.ads.requestInterstitialAd();
  } catch {
    // Swallow — ads are optional
  }
}

/**
 * Show a rewarded ad and return `true` if the user earned the reward.
 * Always returns `false` outside of Playables env.
 */
export async function ytRequestRewardedAd(rewardId: string): Promise<boolean> {
  if (!isInPlayablesEnv()) return false;
  try {
    return await window.ytgame!.ads.requestRewardedAd(rewardId);
  } catch {
    return false;
  }
}

// ─── Cloud save ───────────────────────────────────────────────────────────────

/**
 * Save a data string. Uses YouTube cloud save when in Playables env,
 * otherwise falls back to localStorage.
 */
export async function ytSaveData(key: string, value: string) {
  if (isInPlayablesEnv()) {
    try {
      // We bundle all game data as one JSON object stored under a single slot.
      const existing = await ytLoadAllData();
      existing[key] = value;
      await window.ytgame!.game.saveData(JSON.stringify(existing));
    } catch {
      // Fall back silently
      if (typeof window !== "undefined") localStorage.setItem(key, value);
    }
  } else {
    if (typeof window !== "undefined") localStorage.setItem(key, value);
  }
}

/**
 * Load a data string. Uses YouTube cloud save when in Playables env,
 * otherwise falls back to localStorage.
 */
export async function ytLoadData(key: string): Promise<string | null> {
  if (isInPlayablesEnv()) {
    try {
      const all = await ytLoadAllData();
      return all[key] ?? null;
    } catch {
      return typeof window !== "undefined" ? localStorage.getItem(key) : null;
    }
  }
  return typeof window !== "undefined" ? localStorage.getItem(key) : null;
}

/** Internal: load the full cloud-save JSON blob. */
async function ytLoadAllData(): Promise<Record<string, string>> {
  try {
    const raw = await window.ytgame!.game.loadData();
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

// ─── System ───────────────────────────────────────────────────────────────────

/**
 * Returns true if audio should be enabled.
 * In Playables env this defers to the YouTube audio setting.
 * Outside it always returns true.
 */
export function ytIsAudioEnabled(): boolean {
  if (isInPlayablesEnv()) {
    return window.ytgame!.system.isAudioEnabled();
  }
  return true;
}

/**
 * Register a callback for when the YouTube audio setting changes.
 * Returns a cleanup function (call it in useEffect cleanup).
 */
export function ytOnAudioEnabledChange(
  cb: (enabled: boolean) => void,
): () => void {
  if (isInPlayablesEnv()) {
    return window.ytgame!.system.onAudioEnabledChange(cb);
  }
  return () => {};
}

/**
 * Register a callback for when YouTube pauses the game.
 * Returns a cleanup function.
 */
export function ytOnPause(cb: () => void): () => void {
  if (isInPlayablesEnv()) {
    return window.ytgame!.system.onPause(cb);
  }
  return () => {};
}

/**
 * Register a callback for when YouTube resumes the game.
 * Returns a cleanup function.
 */
export function ytOnResume(cb: () => void): () => void {
  if (isInPlayablesEnv()) {
    return window.ytgame!.system.onResume(cb);
  }
  return () => {};
}

/**
 * Get the user's language from YouTube. Falls back to browser language.
 */
export async function ytGetLanguage(): Promise<string> {
  if (isInPlayablesEnv()) {
    try {
      return await window.ytgame!.system.getLanguage();
    } catch {
      // fall through
    }
  }
  return typeof navigator !== "undefined" ? navigator.language : "en";
}
