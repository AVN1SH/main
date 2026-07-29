/* lobby.js — Manages the Game Lobby UI, Settings Popup, and Start Flow */

import {
  playSound,
  setMusicMuted,
  setSFXMuted,
  isSFXMuted,
  playBGM,
  stopInGameBGM,
} from "./audio.js";
import { getItem, setItem } from "./storage.js";
import { initStore, addCash } from "./store.js";
import { initWeaponSelect, showWeaponSelect, availableWeaponCount } from "./weapon-select.js";
import { requestRewardedAd } from "./rewarded-ad.js";
import { setAudioMuted } from "./audio.js";
import {
  initLanguage,
  getCurrentLanguage,
  setLanguage,
  getAvailableLanguages,
  getLanguageName,
  t,
} from "./language.js";

/* ────────────────────────────────────────────────────────
   SETTINGS STATE — persisted to localStorage
   ──────────────────────────────────────────────────────── */
const SETTINGS_KEY = "streetShooterSettings";
const PROFILE_KEY = "streetShooterProfile";

const DEFAULT_SETTINGS = {
  sensitivity: 50, // 0–100, default 50
  musicEnabled: true,
  sfxEnabled: true,
  controlMode: "classic", // "classic" = scope + fire buttons | "joystick" = hold-fire-to-scope
};

const DEFAULT_PROFILE = {
  name: "",
};

let _settings = { ...DEFAULT_SETTINGS };
let _profile = { ...DEFAULT_PROFILE };

async function loadProfile() {
  try {
    const raw = await getItem(PROFILE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      _profile = { ...DEFAULT_PROFILE, ...parsed };
    }
  } catch (e) {
    console.warn("[Profile] Failed to load:", e);
  }
}

async function saveProfile() {
  try {
    await setItem(PROFILE_KEY, JSON.stringify(_profile));
  } catch (e) {
    console.warn("[Profile] Failed to save:", e);
  }
}

function getPlayerName() {
  return (_profile.name || "").trim() || "PLAYER123";
}

function updateProfileNameUI() {
  const nameEl = document.getElementById("profile-name-text");
  if (nameEl) {
    nameEl.textContent = getPlayerName();
  }
}

/* ────────────────────────────────────────────────────────
   UPDATE UI LABELS FOR LANGUAGE
   ──────────────────────────────────────────────────────── */
function updateLobbyUILabels() {
  // Update button texts
  const startBtnText = document.getElementById("start-btn-text");
  if (startBtnText) startBtnText.textContent = t("START");

  const closeBtnText = document.getElementById("close-btn-text");
  if (closeBtnText) closeBtnText.textContent = t("CLOSE");

  // Update settings labels
  document.getElementById("settings-title-text").textContent = t("SETTINGS");
  document.getElementById("label-sensitivity").textContent = t("SENSITIVITY");
  document.getElementById("label-music").textContent = t("MUSIC");
  document.getElementById("label-sfx").textContent = t("SFX");
  document.getElementById("label-language").textContent = t("LANGUAGE");
  const labelControls = document.getElementById("label-controls");
  if (labelControls) labelControls.textContent = t("CONTROLS");
  const nameClassic = document.getElementById("ctrl-mode-name-classic");
  if (nameClassic) nameClassic.textContent = t("CTRL_CLASSIC");
  const nameJoystick = document.getElementById("ctrl-mode-name-joystick");
  if (nameJoystick) nameJoystick.textContent = t("CTRL_HOLD_FIRE");

  // Update toggle button labels (ON/OFF)
  const musicToggle = document.getElementById("music-toggle");
  if (musicToggle) {
    const musicOn = musicToggle.getAttribute("data-on") === "true";
    musicToggle.querySelector(".toggle-label").textContent = musicOn ? t("ON") : t("OFF");
  }
  const sfxToggle = document.getElementById("sfx-toggle");
  if (sfxToggle) {
    const sfxOn = sfxToggle.getAttribute("data-on") === "true";
    sfxToggle.querySelector(".toggle-label").textContent = sfxOn ? t("ON") : t("OFF");
  }

  // Update lobby labels
  const welcomeBack = document.getElementById("welcome-back-text");
  if (welcomeBack) welcomeBack.textContent = t("WELCOME_BACK");
  const highscoreLabel = document.getElementById("label-highscore");
  if (highscoreLabel) highscoreLabel.textContent = t("HIGHSCORE");
  const maxKillsLabel = document.getElementById("label-max-kills");
  if (maxKillsLabel) maxKillsLabel.textContent = t("MAX_KILLS");

  // Update player name popup labels
  const enterNameLabel = document.getElementById("label-enter-name");
  if (enterNameLabel) enterNameLabel.textContent = t("ENTER_NAME");
  const playerNameTitle = document.getElementById("player-name-title-text");
  if (playerNameTitle) playerNameTitle.textContent = t("PLAYER_NAME_TITLE");
  const playerNameInput = document.getElementById("player-name-input");
  if (playerNameInput) playerNameInput.placeholder = t("TYPE_NAME");
  const playerSaveText = document.getElementById("player-name-save-text");
  if (playerSaveText) playerSaveText.textContent = t("SAVE");
  const playerCloseText = document.getElementById("player-name-close-text");
  if (playerCloseText) playerCloseText.textContent = t("CLOSE");
  const profileEditBtn = document.getElementById("profile-edit-btn");
  if (profileEditBtn) profileEditBtn.setAttribute("aria-label", t("EDIT_NAME"));

  // Update ribbon text
  const ribbonText = document.getElementById("ribbon-text");
  if (ribbonText) ribbonText.textContent = t("SURVIVE_STREETS");
}

async function loadSettings() {
  try {
    const raw = await getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      _settings = { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch (e) {
    console.warn("[Settings] Failed to load:", e);
  }
}

async function saveSettings() {
  try {
    await setItem(SETTINGS_KEY, JSON.stringify(_settings));
  } catch (e) {
    console.warn("[Settings] Failed to save:", e);
  }
}

function _initPlayerNamePopup() {
  const screen = document.getElementById("player-name-screen");
  const input = document.getElementById("player-name-input");
  const saveBtn = document.getElementById("player-name-save-btn");
  const closeBtn = document.getElementById("player-name-close-btn");

  if (!screen || !input || !saveBtn || !closeBtn) return;

  input.value = (_profile.name || "").trim();

  input.addEventListener("input", () => {
    if (input.value.length > 10) {
      input.value = input.value.slice(0, 10);
    }
  });

  saveBtn.addEventListener("click", () => {
    playSound("button-click", "buttonClick");
    const enteredName = input.value.trim();
    if (!enteredName) {
      input.focus();
      return;
    }
    _profile.name = enteredName;
    saveProfile();
    updateProfileNameUI();
    hidePlayerNamePopup();
  });

  closeBtn.addEventListener("click", () => {
    playSound("button-click", "buttonClick");
    hidePlayerNamePopup();
  });
}

/**
 * Get the current sensitivity multiplier (0.1 – 2.0).
 * At 50% sensitivity → multiplier = 1.0 (default).
 */
export function getSensitivityMultiplier() {
  // Map 0–100 → 0.1–2.0 with 1.0 at 50
  return 0.1 + (_settings.sensitivity / 100) * 1.9;
}

/**
 * Returns the active mobile control mode:
 * "classic" — separate Scope button + Fire button (default)
 * "joystick" — hold Fire to scope in, release to fire; cross button cancels
 */
export function getControlMode() {
  return _settings.controlMode || "classic";
}

/* ────────────────────────────────────────────────────────
   LOBBY INIT
   ──────────────────────────────────────────────────────── */
export async function initLobby(onStartGame) {
  const container = document.getElementById("lobby-container");
  const startBtn = document.getElementById("lobby-start-btn");
  const settingBtn = document.getElementById("lobby-setting-btn");

  if (!container || !startBtn) {
    console.error("[Lobby] UI elements not found in DOM");
    return;
  }

  // Initialize language system first
  await initLanguage();

  // Load persisted settings and profile data (cloud or local)
  await loadSettings();
  await loadProfile();
  updateProfileNameUI();

  // Apply settings to audio system immediately
  setMusicMuted(!_settings.musicEnabled);
  setSFXMuted(!_settings.sfxEnabled);

  // Update UI labels with current language
  updateLobbyUILabels();

  // Hook up start button
  startBtn.addEventListener("click", () => {
    playSound("button-click", "buttonClick");
    if (availableWeaponCount() > 2) {
      showWeaponSelect();
    } else {
      hideLobby();
      if (onStartGame) onStartGame();
    }
  });

  // Settings button — show settings popup
  settingBtn.addEventListener("click", () => {
    playSound("button-click", "buttonClick");
    showSettingsPopup();
  });

  // Initialize settings popup controls
  _initSettingsPopup();
  _initPlayerNamePopup();

  // Initialize store
  await initStore();
  _initAddCash();

  // Initialize weapon select popup
  initWeaponSelect(() => {
    hideLobby();
    if (onStartGame) onStartGame();
  });

  const profileEditBtn = document.getElementById("profile-edit-btn");
  if (profileEditBtn) {
    profileEditBtn.addEventListener("click", () => {
      playSound("button-click", "buttonClick");
      showPlayerNamePopup();
    });
  }

  if (!(_profile.name || "").trim()) {
    showPlayerNamePopup();
  }

  // Listen for language changes and update UI
  window.addEventListener("languageChanged", () => {
    updateLobbyUILabels();
  });

  // Initialize stats from persistence if available
  await updateLobbyStats();
}

/* ────────────────────────────────────────────────────────
   SETTINGS POPUP
   ──────────────────────────────────────────────────────── */
function _initSettingsPopup() {
  const screen = document.getElementById("settings-screen");
  const closeBtn = document.getElementById("settings-close-btn");
  const sensitivityTrack = document.getElementById("sensitivity-track");
  const sensitivityFill = document.getElementById("sensitivity-fill");
  const sensitivityThumb = document.getElementById("sensitivity-thumb");
  const sensitivityValue = document.getElementById("sensitivity-value");
  const musicToggle = document.getElementById("music-toggle");
  const sfxToggle = document.getElementById("sfx-toggle");
  const languageSelect = document.getElementById("language-select");

  if (!screen) return;

  // ── Close button ──
  closeBtn.addEventListener("click", () => {
    playSound("button-click", "buttonClick");
    hideSettingsPopup();
  });

  // ── Language dropdown ──
  if (languageSelect) {
    // Populate language dropdown
    const availableLangs = getAvailableLanguages();
    languageSelect.innerHTML = "";
    availableLangs.forEach((lang) => {
      const option = document.createElement("option");
      option.value = lang;
      option.textContent = getLanguageName(lang);
      languageSelect.appendChild(option);
    });

    // Set current language
    languageSelect.value = getCurrentLanguage();

    // Language change handler
    languageSelect.addEventListener("change", async (e) => {
      playSound("button-click", "buttonClick");
      const selectedLang = e.target.value;
      await setLanguage(selectedLang);
      // Dispatch custom event so other modules can listen and update UI
      window.dispatchEvent(new CustomEvent("languageChanged", { detail: { language: selectedLang } }));
    });
  }

  // ── Sensitivity slider (draggable) ──
  let _dragging = false;

  function _updateSliderUI(pct) {
    pct = Math.max(0, Math.min(100, pct));
    sensitivityFill.style.width = pct + "%";
    sensitivityThumb.style.left = pct + "%";
    sensitivityValue.textContent = Math.round(pct) + "%";
    _settings.sensitivity = Math.round(pct);
    saveSettings();
  }

  function _getPctFromEvent(e) {
    const rect = sensitivityTrack.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    return ((clientX - rect.left) / rect.width) * 100;
  }

  // Set initial UI from loaded settings
  _updateSliderUI(_settings.sensitivity);

  // Mouse events
  sensitivityThumb.addEventListener("mousedown", (e) => {
    e.preventDefault();
    e.stopPropagation();
    _dragging = true;
  });
  sensitivityTrack.addEventListener("mousedown", (e) => {
    e.preventDefault();
    e.stopPropagation();
    _dragging = true;
    _updateSliderUI(_getPctFromEvent(e));
  });
  window.addEventListener("mousemove", (e) => {
    if (!_dragging) return;
    _updateSliderUI(_getPctFromEvent(e));
  });
  window.addEventListener("mouseup", () => {
    _dragging = false;
  });

  // Touch events
  sensitivityThumb.addEventListener(
    "touchstart",
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      _dragging = true;
    },
    { passive: false },
  );
  sensitivityTrack.addEventListener(
    "touchstart",
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      _dragging = true;
      _updateSliderUI(_getPctFromEvent(e));
    },
    { passive: false },
  );
  window.addEventListener(
    "touchmove",
    (e) => {
      if (!_dragging) return;
      _updateSliderUI(_getPctFromEvent(e));
    },
    { passive: false },
  );
  window.addEventListener("touchend", () => {
    _dragging = false;
  });

  // ── Music toggle ──
  musicToggle.addEventListener("click", () => {
    playSound("button-click", "buttonClick");
    const isOn = musicToggle.getAttribute("data-on") === "true";
    const newState = !isOn;
    musicToggle.setAttribute("data-on", String(newState));
    musicToggle.querySelector(".toggle-label").textContent = newState
      ? t("ON")
      : t("OFF");
    _settings.musicEnabled = newState;
    setMusicMuted(!newState);
    saveSettings();
  });

  // ── SFX toggle ──
  sfxToggle.addEventListener("click", () => {
    // Play click before toggling so the sound still plays
    playSound("button-click", "buttonClick");
    const isOn = sfxToggle.getAttribute("data-on") === "true";
    const newState = !isOn;
    sfxToggle.setAttribute("data-on", String(newState));
    sfxToggle.querySelector(".toggle-label").textContent = newState
      ? t("ON")
      : t("OFF");
    _settings.sfxEnabled = newState;
    setSFXMuted(!newState);
    saveSettings();
  });

  // Set initial toggle states from loaded settings
  musicToggle.setAttribute("data-on", String(_settings.musicEnabled));
  musicToggle.querySelector(".toggle-label").textContent =
    _settings.musicEnabled ? t("ON") : t("OFF");
  sfxToggle.setAttribute("data-on", String(_settings.sfxEnabled));
  sfxToggle.querySelector(".toggle-label").textContent = _settings.sfxEnabled
    ? t("ON")
    : t("OFF");

  // ── Control Mode radio buttons ──
  const radioClassic  = document.getElementById("ctrl-radio-classic");
  const radioJoystick = document.getElementById("ctrl-radio-joystick");
  const optClassic  = radioClassic ? radioClassic.closest(".ctrl-mode-option") : null;
  const optJoystick = radioJoystick ? radioJoystick.closest(".ctrl-mode-option") : null;

  function _applyControlMode(mode) {
    _settings.controlMode = mode;
    if (radioClassic) radioClassic.checked = (mode === "classic");
    if (radioJoystick) radioJoystick.checked = (mode === "joystick");
    saveSettings();
    // Dispatch event so mobile-controls.js can re-wire itself live
    window.dispatchEvent(new CustomEvent("controlModeChanged", { detail: { mode } }));
  }

  if (radioClassic && radioJoystick) {
    // Restore saved state
    const savedMode = _settings.controlMode || "classic";
    radioClassic.checked = (savedMode === "classic");
    radioJoystick.checked = (savedMode === "joystick");

    radioClassic.addEventListener("change", () => {
      if (radioClassic.checked) _applyControlMode("classic");
    });
    radioJoystick.addEventListener("change", () => {
      if (radioJoystick.checked) _applyControlMode("joystick");
    });

    // Ensure pointerdown / click on label elements triggers option change on touch devices
    if (optClassic) {
      optClassic.addEventListener("pointerdown", (e) => {
        e.stopPropagation();
        _applyControlMode("classic");
      });
      optClassic.addEventListener("click", (e) => {
        e.stopPropagation();
        _applyControlMode("classic");
      });
    }

    if (optJoystick) {
      optJoystick.addEventListener("pointerdown", (e) => {
        e.stopPropagation();
        _applyControlMode("joystick");
      });
      optJoystick.addEventListener("click", (e) => {
        e.stopPropagation();
        _applyControlMode("joystick");
      });
    }
  }
}

export function showSettingsPopup() {
  const screen = document.getElementById("settings-screen");
  if (!screen) return;

  // Re-sync UI state to current settings (especially when opened in-game)
  const radioClassic  = document.getElementById("ctrl-radio-classic");
  const radioJoystick = document.getElementById("ctrl-radio-joystick");
  if (radioClassic && radioJoystick) {
    const savedMode = _settings.controlMode || "classic";
    radioClassic.checked = (savedMode === "classic");
    radioJoystick.checked = (savedMode === "joystick");
  }

  // Reset animations for rows
  const rows = screen.querySelectorAll(".settings-row");
  rows.forEach((row) => {
    row.style.animation = "none";
    void row.offsetHeight;
    row.style.animation = "";
  });

  // Reset title animation
  const titleText = screen.querySelector(".settings-title-text");
  if (titleText) {
    titleText.style.animation = "none";
    void titleText.offsetHeight;
    titleText.style.animation = "";
  }

  // Reset close button animation
  const closeBtn = document.getElementById("settings-close-btn");
  if (closeBtn) {
    closeBtn.style.animation = "none";
    void closeBtn.offsetHeight;
    closeBtn.style.animation = "";
  }

  // Fade in
  screen.style.opacity = "0";
  screen.style.display = "flex";
  screen.style.transition = "opacity 0.5s ease-in";
  void screen.offsetHeight;
  screen.style.opacity = "1";
}

export function hideSettingsPopup() {
  const screen = document.getElementById("settings-screen");
  if (!screen) return;

  screen.style.transition = "opacity 0.3s ease-out";
  screen.style.opacity = "0";
  setTimeout(() => {
    screen.style.display = "none";
  }, 350);
}
export function showPlayerNamePopup() {
  const screen = document.getElementById("player-name-screen");
  const input = document.getElementById("player-name-input");
  if (!screen) return;

  const rows = screen.querySelectorAll(".settings-row");
  rows.forEach((row) => {
    row.style.animation = "none";
    void row.offsetHeight;
    row.style.animation = "";
  });

  const titleText = screen.querySelector(".settings-title-text");
  if (titleText) {
    titleText.style.animation = "none";
    void titleText.offsetHeight;
    titleText.style.animation = "";
  }

  const buttons = screen.querySelectorAll(".settings-close-btn");
  buttons.forEach((btn) => {
    btn.style.animation = "none";
    void btn.offsetHeight;
    btn.style.animation = "";
  });

  if (input) {
    input.value = (_profile.name || "").trim();
    setTimeout(() => input.focus(), 120);
  }

  screen.style.opacity = "0";
  screen.style.display = "flex";
  screen.style.transition = "opacity 0.5s ease-in";
  void screen.offsetHeight;
  screen.style.opacity = "1";
}

export function hidePlayerNamePopup() {
  const screen = document.getElementById("player-name-screen");
  if (!screen) return;

  screen.style.transition = "opacity 0.3s ease-out";
  screen.style.opacity = "0";
  setTimeout(() => {
    screen.style.display = "none";
  }, 350);
}
function _initAddCash() {
  const btn = document.getElementById("btn-add-cash");
  if (btn) {
    btn.addEventListener("click", async () => {
      playSound("button-click", "buttonClick");
      setAudioMuted(true);
      const earned = await requestRewardedAd();
      setAudioMuted(false);
      if (earned) {
        await addCash(500);
        await setItem("lastAdRewardTime", Date.now().toString());
        btn.style.display = "none";
      }
    });
  }
}

/* ────────────────────────────────────────────────────────
   LOBBY SHOW / HIDE
   ──────────────────────────────────────────────────────── */
import { flushCashAnimations } from "./cash-animation.mjs";

export function showLobby() {
  const container = document.getElementById("lobby-container");
  if (container) {
    stopInGameBGM();
    playBGM();
    // Make sure the lobby is visible and interactable
    container.style.display = "flex";
    container.style.opacity = "1";
    container.classList.remove("hidden");
    // Ensure the lobby sits above any canvas (z-index: 1000 in CSS)
    container.style.zIndex = "1000";
    updateLobbyStats();
    flushCashAnimations();
  }
}

export function hideLobby() {
  const container = document.getElementById("lobby-container");
  if (container) {
    container.classList.add("hidden");
    // Hide from DOM after transition
    setTimeout(() => {
      container.style.display = "none";
    }, 500);
  }
}

async function updateLobbyStats() {
  try {
    const maxKills = (await getItem("maxKills")) || "0";
    const highScore = (await getItem("highScore")) || "0";

    const killsEl = document.getElementById("lobby-max-kills");
    const scoreEl = document.getElementById("lobby-high-score");

    if (killsEl) killsEl.textContent = maxKills;
    if (scoreEl)
      scoreEl.textContent = parseInt(highScore || "0").toLocaleString();

    // Check Ad Reward Cooldown (12 hours)
    const btn = document.getElementById("btn-add-cash");
    if (btn) {
      const lastTime = await getItem("lastAdRewardTime");
      if (lastTime) {
        const elapsed = Date.now() - parseInt(lastTime, 10);
        const twelveHours = 12 * 60 * 60 * 1000;
        if (elapsed < twelveHours) {
          btn.style.display = "none";
        } else {
          btn.style.display = "";
        }
      } else {
        btn.style.display = "";
      }
    }
  } catch (e) {
    console.warn("[Lobby] updateLobbyStats failed:", e);
  }
}
