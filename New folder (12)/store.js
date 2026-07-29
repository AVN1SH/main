import * as THREE from "three";
import { loadGLB, resolvePath } from "./loader.js";
import { playSound } from "./audio.js";
import { getItem, setItem } from "./storage.js";
import {
  initCashAnimation,
  playCashAnimation,
  flushCashAnimations,
} from "./cash-animation.mjs";
import { t } from "./language.js";

const INVENTORY_KEY = "streetShooterInventory";
// Power-up purchases are intentionally NOT part of the permanent inventory:
// they're a one-run consumable. Buying one spends cash and applies its
// effect the next time a game is started; returning to the lobby after
// that game (win or lose) resets the purchase so it can be bought again.
const POWERUPS_KEY = "streetShooterPendingPowerups";

const STORE_ITEMS = [
  { id: "rifle", name: "AK47", price: 0, category: "gun" },
  { id: "sniper", name: "SNIPER", price: 0, category: "gun" },
  { id: "mac10", name: "MAC10", price: 4000, category: "gun" },
  { id: "shotgun", name: "SHOTGUN", price: 5000, category: "gun" },
  {
    id: "rocketlauncher",
    name: "ROCKET LAUNCHER",
    price: 12000,
    category: "gun",
  },
  {
    id: "grenade",
    name: "GRENADE",
    price: 2500,
    category: "powerup",
    maxPurchase: 5,
  },
  {
    id: "ammo",
    name: "AMMO PACK",
    price: 1000,
    category: "powerup",
    maxPurchase: 2,
  },
];

let _inventory = {};
let _powerups = {}; // pending, per-run power-up purchases — reset on return to lobby
let _cash = 100;
let _selectedItemId = null; // currently selected item in preview
let _currentCategory = "guns"; // active tab category

// ── 3D viewer state ──
let _3dRenderer = null;
let _3dScene = null;
let _3dCamera = null;
let _3dAnimId = null;
let _3dModel = null;
let _3dRotX = 0.1;
let _3dRotY = 0;
let _3dDragging = false;
let _3dLastX = 0;
let _3dLastY = 0;
let _3dCanvas = null;

// ─────────────────────────────────────────────
// Persistence helpers
// ─────────────────────────────────────────────
async function loadInventory() {
  try {
    const raw = await getItem(INVENTORY_KEY);
    if (raw) _inventory = JSON.parse(raw);
    else _inventory = {};
  } catch (e) {
    _inventory = {};
  }
  // Default guns (AK47 and Sniper) are always owned by default
  _inventory["rifle"] = true;
  _inventory["ak47"] = true;
  _inventory["sniper"] = true;
}

async function saveInventory() {
  try {
    await setItem(INVENTORY_KEY, JSON.stringify(_inventory));
  } catch (e) {
    console.warn("[Store] Failed to save inventory:", e);
  }
}

async function loadPowerups() {
  try {
    const raw = await getItem(POWERUPS_KEY);
    _powerups = raw ? JSON.parse(raw) : {};
  } catch (e) {
    _powerups = {};
  }
}

async function savePowerups() {
  try {
    await setItem(POWERUPS_KEY, JSON.stringify(_powerups));
  } catch (e) {
    console.warn("[Store] Failed to save pending powerups:", e);
  }
}

async function loadCash() {
  try {
    const raw = await getItem("streetShooterCash");
    if (raw !== null && raw !== undefined) _cash = parseInt(raw) || 0;
    else _cash = 100;
  } catch (e) {
    _cash = 100;
  }
}

async function saveCash() {
  try {
    await setItem("streetShooterCash", String(_cash));
  } catch (e) {
    console.warn("[Store] Failed to save cash:", e);
  }
}

// ─────────────────────────────────────────────
// Public getters
// ─────────────────────────────────────────────
export function getCash() {
  return _cash;
}

export function getOwnedItems() {
  return { ..._inventory };
}

export function ownsItem(itemId) {
  return !!_inventory[itemId];
}

/** Power-ups purchased for the upcoming run (grenade/ammo). Values are
 *  purchase COUNTS (0..item.maxPurchase), not booleans — e.g. buying the
 *  grenade 3 times gives { grenade: 3 }. Read this once when the game
 *  actually starts to grant their effect. */
export function getPendingPowerups() {
  return { ..._powerups };
}

export function getPendingPowerupCount(itemId) {
  return _powerups[itemId] || 0;
}

/** Clear all pending power-up purchases — call when returning to the lobby
 *  after a game ends (win or lose) so they must be bought again next run. */
export async function resetPowerups() {
  _powerups = {};
  await savePowerups();
  updateBuyButtonStates();
}

// ─────────────────────────────────────────────
// Cash UI
// ─────────────────────────────────────────────
function updateCashUI() {
  const el = document.getElementById("currency-cash");
  if (el) el.textContent = Number(_cash).toLocaleString();
}

// ─────────────────────────────────────────────
// Buy button states (legacy hidden items + preview btn)
// ─────────────────────────────────────────────
function updateBuyButtonStates() {
  // Update legacy hidden .store-item buttons (for internal state tracking)
  document.querySelectorAll(".store-item").forEach((el) => {
    const itemId = el.dataset.item;
    const item = STORE_ITEMS.find((i) => i.id === itemId);
    const btn = el.querySelector(".store-buy-btn");
    const countEl = el.querySelector(".store-item-count");
    if (!btn || !item) return;

    const buyText = btn.querySelector(".store-buy-text");

    if (item.category === "gun") {
      const owned = !!_inventory[itemId];
      btn.classList.toggle("owned", owned);
      btn.classList.remove("max-limit");
      if (buyText)
        buyText.textContent = owned ? t("STORE_OWNED") : t("STORE_BUY");
      if (countEl) countEl.textContent = "";
      return;
    }

    const max = item.maxPurchase || 1;
    const count = _powerups[itemId] || 0;
    const atMax = count >= max;

    btn.classList.remove("owned");
    btn.classList.toggle("max-limit", atMax);
    if (buyText)
      buyText.textContent = atMax ? t("STORE_MAX_LIMIT") : t("STORE_BUY");
    if (countEl) countEl.textContent = max > 1 ? `${count} / ${max}` : "";
  });

  // Also refresh the preview buy button if an item is selected
  if (_selectedItemId) refreshPreviewBuyBtn(_selectedItemId);

  // Refresh list item count badges
  refreshListItemBadges();
}

// Update count badges on list items for powerups
function refreshListItemBadges() {
  document.querySelectorAll(".store-list-item").forEach((el) => {
    const itemId = el.dataset.item;
    const item = STORE_ITEMS.find((i) => i.id === itemId);
    if (!item || item.category !== "powerup") return;
    const countEl = el.querySelector(".store-item-count");
    if (!countEl) return;
    const max = item.maxPurchase || 1;
    const count = _powerups[itemId] || 0;
    countEl.textContent = max > 1 ? ` (${count}/${max})` : "";
  });
}

// ─────────────────────────────────────────────
// Preview panel — update for selected item
// ─────────────────────────────────────────────
function refreshPreviewBuyBtn(itemId) {
  const btn = document.getElementById("store-preview-buy-btn");
  const buyText = document.getElementById("store-preview-buy-text");
  if (!btn) return;

  const item = STORE_ITEMS.find((i) => i.id === itemId);
  if (!item) {
    btn.disabled = true;
    if (buyText) buyText.textContent = t("STORE_BUY");
    btn.classList.remove("owned", "max-limit");
    return;
  }

  btn.disabled = false;
  btn.classList.remove("owned", "max-limit");

  if (item.category === "gun") {
    const owned = !!_inventory[itemId];
    if (owned) {
      btn.disabled = true;
      btn.classList.add("owned");
      if (buyText) buyText.textContent = t("STORE_OWNED");
    } else {
      if (buyText) buyText.textContent = t("STORE_BUY");
    }
    return;
  }

  // Powerup
  const max = item.maxPurchase || 1;
  const count = _powerups[itemId] || 0;
  const atMax = count >= max;
  if (atMax) {
    btn.classList.add("max-limit");
    if (buyText) buyText.textContent = t("STORE_MAX_LIMIT");
  } else {
    if (buyText) buyText.textContent = t("STORE_BUY");
  }
}

// ─────────────────────────────────────────────
// 3D Viewer
// ─────────────────────────────────────────────
function init3DViewer() {
  _3dCanvas = document.getElementById("store-3d-canvas");
  if (!_3dCanvas) return;

  _3dScene = new THREE.Scene();

  _3dCamera = new THREE.PerspectiveCamera(45, 1, 0.01, 100);
  _3dCamera.position.set(0, 0.05, 1.15);

  _3dRenderer = new THREE.WebGLRenderer({
    canvas: _3dCanvas,
    antialias: true,
    alpha: true,
  });
  _3dRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  _3dRenderer.outputEncoding = THREE.sRGBEncoding;
  _3dRenderer.setClearColor(0x000000, 0);

  // Lighting
  const ambient = new THREE.AmbientLight(0xffffff, 0.7);
  _3dScene.add(ambient);

  const dirA = new THREE.DirectionalLight(0xfff4cc, 1.4);
  dirA.position.set(2, 3, 2);
  _3dScene.add(dirA);

  const dirB = new THREE.DirectionalLight(0xaaccff, 0.5);
  dirB.position.set(-2, 0, -2);
  _3dScene.add(dirB);

  const fill = new THREE.DirectionalLight(0xffffff, 0.3);
  fill.position.set(0, -1, 1);
  _3dScene.add(fill);

  // Drag-to-rotate
  _3dCanvas.addEventListener("mousedown", on3DPointerDown);
  _3dCanvas.addEventListener("touchstart", on3DTouchStart, { passive: true });
  window.addEventListener("mousemove", on3DMouseMove);
  window.addEventListener("mouseup", on3DPointerUp);
  window.addEventListener("touchmove", on3DTouchMove, { passive: true });
  window.addEventListener("touchend", on3DPointerUp);

  // Resize on window resize (debounced)
  let _resizeTimer = null;
  window.addEventListener("resize", () => {
    clearTimeout(_resizeTimer);
    _resizeTimer = setTimeout(() => resize3DRenderer(), 80);
  });

  resize3DRenderer();
  start3DLoop();
}

let _3dLastW = 0;
let _3dLastH = 0;

function resize3DRenderer() {
  if (!_3dRenderer || !_3dCanvas) return;
  const wrap = _3dCanvas.parentElement;
  if (!wrap) return;
  const rect = wrap.getBoundingClientRect();
  const w = Math.round(rect.width);
  const h = Math.round(rect.height);
  if (w <= 0 || h <= 0) return;
  if (w === _3dLastW && h === _3dLastH) return; // no change — skip
  _3dLastW = w;
  _3dLastH = h;
  _3dRenderer.setSize(w, h, false);
  if (_3dCamera) {
    _3dCamera.aspect = w / h;
    _3dCamera.updateProjectionMatrix();
  }
}

function start3DLoop() {
  if (_3dAnimId !== null) return;
  function loop() {
    _3dAnimId = requestAnimationFrame(loop);
    if (!_3dDragging && _3dModel) _3dRotY += 0.008;
    if (_3dModel) {
      _3dModel.rotation.y = _3dRotY;
      _3dModel.rotation.x = _3dRotX;
    }
    if (_3dRenderer && _3dScene && _3dCamera) {
      resize3DRenderer(); // keep camera aspect in sync with the live container size
      _3dRenderer.render(_3dScene, _3dCamera);
    }
  }
  loop();
}

function stop3DLoop() {
  if (_3dAnimId !== null) {
    cancelAnimationFrame(_3dAnimId);
    _3dAnimId = null;
  }
}

async function load3DModel(logicalPath) {
  if (!_3dScene) return;

  // Remove old model
  if (_3dModel) {
    _3dScene.remove(_3dModel);
    _3dModel = null;
  }

  const hint = document.getElementById("store-3d-hint");
  if (hint) hint.style.opacity = "0.5";

  try {
    // Resolve logical path → physical path (e.g. /assets/guns/player_mac10.glb → ./assets/meterials/mac10.glb)
    const physicalPath = resolvePath(logicalPath);
    const gltf = await loadGLB(physicalPath);
    if (!gltf || !gltf.scene) throw new Error("No scene");

    // Clone so we don't share state with game's cached scene
    const model = gltf.scene.clone(true);

    // Centre + normalise scale
    const box = new THREE.Box3().setFromObject(model);
    const centre = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 0.58 / (maxDim || 1);
    model.scale.setScalar(scale);
    model.position.sub(centre.multiplyScalar(scale));

    _3dRotY = Math.PI / 4;
    _3dRotX = 0.1;
    model.rotation.y = _3dRotY;
    model.rotation.x = _3dRotX;

    _3dScene.add(model);
    _3dModel = model;

    if (hint) hint.style.opacity = "1";
  } catch (err) {
    console.warn("[Store 3D] Failed to load model:", logicalPath, err);
    loadProceduralPlaceholder();
    if (hint) hint.style.opacity = "1";
  }
}

function loadProceduralPlaceholder() {
  if (!_3dScene) return;
  if (_3dModel) {
    _3dScene.remove(_3dModel);
    _3dModel = null;
  }

  const group = new THREE.Group();
  const barrel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.05, 0.7, 8),
    new THREE.MeshStandardMaterial({
      color: 0x444444,
      metalness: 0.7,
      roughness: 0.3,
    }),
  );
  barrel.rotation.z = Math.PI / 2;
  barrel.position.x = -0.15;
  group.add(barrel);

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.35, 0.14, 0.1),
    new THREE.MeshStandardMaterial({ color: 0x2a2a2a, metalness: 0.5 }),
  );
  body.position.x = 0.05;
  group.add(body);

  const grip = new THREE.Mesh(
    new THREE.BoxGeometry(0.06, 0.14, 0.08),
    new THREE.MeshStandardMaterial({ color: 0x3a2f25 }),
  );
  grip.position.set(0.15, -0.1, 0);
  group.add(grip);

  _3dScene.add(group);
  _3dModel = group;
}

// Drag handlers
function on3DPointerDown(e) {
  _3dDragging = true;
  _3dLastX = e.clientX;
  _3dLastY = e.clientY;
}
function on3DTouchStart(e) {
  if (e.touches.length !== 1) return;
  _3dDragging = true;
  _3dLastX = e.touches[0].clientX;
  _3dLastY = e.touches[0].clientY;
}
function on3DMouseMove(e) {
  if (!_3dDragging) return;
  _3dRotY += (e.clientX - _3dLastX) * 0.012;
  _3dRotX += (e.clientY - _3dLastY) * 0.008;
  _3dRotX = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, _3dRotX));
  _3dLastX = e.clientX;
  _3dLastY = e.clientY;
}
function on3DTouchMove(e) {
  if (!_3dDragging || e.touches.length !== 1) return;
  _3dRotY += (e.touches[0].clientX - _3dLastX) * 0.012;
  _3dRotX += (e.touches[0].clientY - _3dLastY) * 0.008;
  _3dRotX = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, _3dRotX));
  _3dLastX = e.touches[0].clientX;
  _3dLastY = e.touches[0].clientY;
}
function on3DPointerUp() {
  _3dDragging = false;
}

// ─────────────────────────────────────────────
// Category tab switching
// ─────────────────────────────────────────────
function switchCategory(category) {
  _currentCategory = category;
  _selectedItemId = null;

  // Update tab active state
  document.querySelectorAll(".store-tab").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.category === category);
  });

  // Show/hide list items & auto-select first item in section
  let firstItem = null;
  document.querySelectorAll(".store-list-item").forEach((el) => {
    el.classList.remove("selected");
    const isCurrentCategory = el.dataset.category === category;
    el.style.display = isCurrentCategory ? "" : "none";
    if (isCurrentCategory && !firstItem) {
      firstItem = el;
    }
  });

  if (firstItem) {
    selectItem(firstItem);
  } else {
    clearPreview();
  }
  updateBuyButtonStates();
}

function clearPreview() {
  const nameEl = document.getElementById("store-preview-name");
  const subEl = document.getElementById("store-preview-subtitle");
  const priceEl = document.getElementById("store-preview-price-val");
  const btn = document.getElementById("store-preview-buy-btn");

  if (nameEl) nameEl.textContent = t("STORE_SELECT_AN_ITEM") || "SELECT AN ITEM";
  if (subEl) subEl.textContent = t("STORE_CHOOSE_LIST") || "Choose from the list";
  if (priceEl) priceEl.textContent = "—";
  if (btn) {
    btn.disabled = true;
    btn.classList.remove("owned", "max-limit");
  }

  // Remove 3D model
  if (_3dScene && _3dModel) {
    _3dScene.remove(_3dModel);
    _3dModel = null;
  }
}

// ─────────────────────────────────────────────
// Select item for preview
// ─────────────────────────────────────────────
function selectItem(el) {
  const itemId = el.dataset.item;
  const glbPath = el.dataset.glb;
  const price = el.dataset.price;
  const name = el.dataset.name;

  _selectedItemId = itemId;

  // Highlight selected
  document
    .querySelectorAll(".store-list-item")
    .forEach((li) => li.classList.remove("selected"));
  el.classList.add("selected");

  // Update preview labels
  const nameEl = document.getElementById("store-preview-name");
  const subEl = document.getElementById("store-preview-subtitle");
  const priceEl = document.getElementById("store-preview-price-val");

  const nameKeyMap = {
    rifle: "STORE_AK47",
    ak47: "STORE_AK47",
    sniper: "STORE_SNIPER",
    mac10: "STORE_MAC10",
    shotgun: "STORE_SHOTGUN",
    rocketlauncher: "STORE_ROCKET_LAUNCHER",
    grenade: "STORE_GRENADE",
    ammo: "STORE_AMMO_PACK",
  };

  if (nameEl) {
    const key = nameKeyMap[itemId];
    nameEl.textContent = (key ? t(key) : null) || name || itemId.toUpperCase();
  }

  // Subtitle: category info
  const item = STORE_ITEMS.find((i) => i.id === itemId);
  if (subEl && item) {
    if (item.category === "powerup" && item.maxPurchase) {
      const count = _powerups[itemId] || 0;
      const purchasedStr = t("STORE_PURCHASED") || "purchased";
      subEl.textContent = `${count} / ${item.maxPurchase} ${purchasedStr}`;
    } else {
      subEl.textContent =
        item.category === "gun"
          ? (t("STORE_PRIMARY_WEAPON") || "Primary Weapon")
          : (t("STORE_POWERUP_SUB") || "Power-Up");
    }
  }

  if (priceEl) priceEl.textContent = Number(price).toLocaleString();

  // Load 3D model
  if (glbPath) load3DModel(glbPath);

  // Refresh buy button
  refreshPreviewBuyBtn(itemId);
}

// ─────────────────────────────────────────────
// Purchase
// ─────────────────────────────────────────────
function showPreviewMessage(text, isError) {
  const sub = document.getElementById("store-preview-subtitle");
  if (!sub) return;
  const prev = sub.textContent;
  sub.textContent = text;
  sub.style.color = isError ? "#ff5555" : "#55ff99";
  setTimeout(() => {
    sub.textContent = prev;
    sub.style.color = "";
  }, 1800);
}

async function purchaseSelected() {
  if (!_selectedItemId) return;
  playSound("button-click", "buttonClick");

  const itemId = _selectedItemId;
  const item = STORE_ITEMS.find((i) => i.id === itemId);
  if (!item) return;

  if (item.category === "gun") {
    if (_inventory[itemId]) return;
    if (_cash < item.price) {
      showPreviewMessage(t("STORE_NOT_ENOUGH_CASH"), true);
      return;
    }
    _cash -= item.price;
    _inventory[itemId] = true;
    await saveInventory();
    await saveCash();
    playSound("purchase", "purchase");
    playCashAnimation(-item.price);
    updateBuyButtonStates();
    return;
  }

  // Powerup
  const max = item.maxPurchase || 1;
  const count = _powerups[itemId] || 0;
  if (count >= max) {
    showPreviewMessage(t("STORE_PURCHASE_AGAIN"), true);
    return;
  }
  if (_cash < item.price) {
    showPreviewMessage(t("STORE_NOT_ENOUGH_CASH"), true);
    return;
  }

  _cash -= item.price;
  _powerups[itemId] = count + 1;
  await savePowerups();
  await saveCash();
  playSound("purchase", "purchase");
  playCashAnimation(-item.price);
  updateBuyButtonStates();

  // Update subtitle count
  const sub = document.getElementById("store-preview-subtitle");
  if (sub && item.maxPurchase) {
    const newCount = _powerups[itemId] || 0;
    sub.textContent = `${newCount} / ${item.maxPurchase} purchased`;
  }
}

// ─────────────────────────────────────────────
// Localisation
// ─────────────────────────────────────────────
function updateStoreUILabels() {
  const titleEl = document.getElementById("store-title-text");
  if (titleEl) titleEl.textContent = t("STORE_TITLE") || "STORE";
  const closeText = document.getElementById("store-close-text");
  if (closeText) closeText.textContent = t("STORE_CLOSE") || "CLOSE";

  // Tab labels
  const gunsLabel = document.getElementById("store-tab-guns-label");
  if (gunsLabel) gunsLabel.textContent = t("STORE_GUNS") || "GUNS";
  const powerupsLabel = document.getElementById("store-tab-powerups-label");
  if (powerupsLabel)
    powerupsLabel.textContent = t("STORE_POWERUPS") || "POWER-UPS";

  // 3D hint text
  const hintEl = document.querySelector("#store-3d-hint span");
  if (hintEl) hintEl.textContent = t("STORE_DRAG_ROTATE") || "Drag to rotate";

  // List item names
  const nameMap = {
    rifle: "STORE_AK47",
    ak47: "STORE_AK47",
    sniper: "STORE_SNIPER",
    mac10: "STORE_MAC10",
    shotgun: "STORE_SHOTGUN",
    rocketlauncher: "STORE_ROCKET_LAUNCHER",
    grenade: "STORE_GRENADE",
    ammo: "STORE_AMMO_PACK",
  };
  document.querySelectorAll(".store-list-item").forEach((el) => {
    const key = nameMap[el.dataset.item];
    const nameEl = el.querySelector(".store-list-item-name");
    if (key && nameEl) nameEl.textContent = t(key) || nameEl.textContent;
  });

  // Preview select prompt / active item update
  if (!_selectedItemId) {
    clearPreview();
  } else {
    const selEl = document.querySelector(
      `.store-list-item[data-item="${_selectedItemId}"]`
    );
    if (selEl) selectItem(selEl);
  }
  updateBuyButtonStates();
}

// ─────────────────────────────────────────────
// Init
// ─────────────────────────────────────────────
export async function initStore() {
  initCashAnimation();
  await loadInventory();
  await loadPowerups();
  await loadCash();
  updateCashUI();
  updateStoreUILabels();

  window.addEventListener("languageChanged", updateStoreUILabels);

  // Buttons
  const storeBtn = document.getElementById("lobby-store-btn");
  if (storeBtn) {
    storeBtn.addEventListener("click", () => {
      playSound("button-click", "buttonClick");
      showStore();
    });
  }

  const closeBtn = document.getElementById("store-close-btn");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      playSound("button-click", "buttonClick");
      hideStore();
    });
  }

  // Drag-to-scroll helper for touch and mouse
  function makeScrollable(container) {
    if (!container) return () => false;
    let isDown = false;
    let startX = 0;
    let startY = 0;
    let scrollLeft = 0;
    let scrollTop = 0;
    let hasMoved = false;

    container.addEventListener("pointerdown", (e) => {
      if (e.button && e.button !== 0) return;
      isDown = true;
      hasMoved = false;
      startX = e.clientX;
      startY = e.clientY;
      scrollLeft = container.scrollLeft;
      scrollTop = container.scrollTop;
    });

    window.addEventListener("pointermove", (e) => {
      if (!isDown) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      if (!hasMoved && Math.hypot(dx, dy) > 5) {
        hasMoved = true;
      }

      if (hasMoved) {
        container.scrollLeft = scrollLeft - dx;
        container.scrollTop = scrollTop - dy;
      }
    });

    const endDrag = () => {
      isDown = false;
    };
    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", endDrag);

    return () => hasMoved;
  }

  const isTabsMoved = makeScrollable(document.getElementById("store-tabs-list"));
  const isItemsMoved = makeScrollable(document.getElementById("store-items-list"));

  // Category tabs
  document.querySelectorAll(".store-tab").forEach((tab) => {
    let lastTime = 0;
    const triggerTab = () => {
      if (isTabsMoved()) return;
      const now = Date.now();
      if (now - lastTime < 250) return;
      lastTime = now;
      playSound("button-click", "buttonClick");
      switchCategory(tab.dataset.category);
    };
    tab.addEventListener("pointerup", triggerTab);
    tab.addEventListener("click", triggerTab);
  });

  // List items
  document.querySelectorAll(".store-list-item").forEach((el) => {
    let lastTime = 0;
    const triggerSelect = () => {
      if (isItemsMoved()) return;
      const now = Date.now();
      if (now - lastTime < 250) return;
      lastTime = now;
      selectItem(el);
    };
    el.addEventListener("pointerup", triggerSelect);
    el.addEventListener("click", triggerSelect);
  });

  // Preview buy button
  const previewBuyBtn = document.getElementById("store-preview-buy-btn");
  if (previewBuyBtn) {
    previewBuyBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      purchaseSelected();
    });
  }

  // Init 3D viewer
  init3DViewer();

  updateBuyButtonStates();
}

export function showStore() {
  const screen = document.getElementById("store-screen");
  if (!screen) return;

  updateStoreUILabels();

  // Default to guns tab on open
  switchCategory("guns");

  screen.style.opacity = "0";
  screen.style.display = "flex";
  screen.style.flexDirection = "column";
  screen.style.pointerEvents = "auto";
  screen.style.transition = "opacity 0.4s ease-in";

  // Two rAFs: first lets the browser do layout (flex columns get real sizes),
  // second lets the renderer read those sizes before the first paint.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      resize3DRenderer();
      screen.style.opacity = "1";
    });
  });

  // Restart 3D loop
  start3DLoop();
}

export function hideStore() {
  const screen = document.getElementById("store-screen");
  if (!screen) return;

  screen.style.transition = "opacity 0.3s ease-out";
  screen.style.opacity = "0";
  setTimeout(() => {
    screen.style.display = "none";
    stop3DLoop();
    flushCashAnimations();
  }, 350);
}

export async function addCash(amount) {
  const previousCash = _cash;
  _cash += amount;
  await saveCash();
  const delta = _cash - previousCash;
  if (delta !== 0) {
    playCashAnimation(delta);
  } else {
    updateCashUI();
  }
}
