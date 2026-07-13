import Phaser from "phaser";

interface AssetInfo {
  path: string;
  w: number;
  h: number;
}

const ASSETS: Record<string, AssetInfo> = {
  player: { path: "/game-assets/characters/white_sheep.svg", w: 50, h: 50 },
  platform_hay: { path: "/game-assets/platforms/hay.svg", w: 80, h: 32 },
  platform_island: { path: "/game-assets/platforms/island.svg", w: 80, h: 32 },
  platform_log: { path: "/game-assets/platforms/log.svg", w: 80, h: 32 },
  platform_board: { path: "/game-assets/obstacles/board.svg", w: 80, h: 20 },
  obstacle_bee: { path: "/game-assets/enemies/bee.svg", w: 25, h: 25 },
  obstacle_thorns: {
    path: "/game-assets/obstacles/small_thorns.svg",
    w: 40,
    h: 16,
  },
  item_carrot: { path: "/game-assets/items/carrot.svg", w: 30, h: 30 },
  item_apple: { path: "/game-assets/items/apple.svg", w: 30, h: 30 },
  balloon: { path: "/game-assets/items/sun.svg", w: 50, h: 50 },
  ui_heart: { path: "/game-assets/items/heart.svg", w: 30, h: 30 },
  coin: { path: "/icons/coin.png", w: 32, h: 32 },
  barn: { path: "/game-assets/environment/barn.svg", w: 50, h: 48 },
  env_grass: { path: "/game-assets/environment/grass.svg", w: 29, h: 21 },
  env_flower: { path: "/game-assets/environment/flower.svg", w: 30, h: 56 },
  env_worm: { path: "/game-assets/environment/worm.svg", w: 37, h: 27 },
  env_grass_block_1: {
    path: "/game-assets/environment/grass_1.svg",
    w: 145,
    h: 145,
  },
  env_grass_block_2: {
    path: "/game-assets/environment/grass_2.svg",
    w: 145,
    h: 145,
  },
  env_grass_block_3: {
    path: "/game-assets/environment/grass_3.svg",
    w: 145,
    h: 145,
  },
};

export class DomLayer {
  private container!: HTMLElement;
  private bgEl!: HTMLElement;
  private scaleFactor = 1;
  private containerId: string;
  private showBg: boolean;

  constructor(containerId = "game-dom-layer", showBg = true) {
    this.containerId = containerId;
    this.showBg = showBg;
  }

  init() {
    this.bgEl = document.getElementById("game-bg") as HTMLElement;
    this.container = document.getElementById(this.containerId) as HTMLElement;
    // Fallback: create elements if React hasn't rendered them yet
    if (!this.bgEl || !this.container) {
      const parent = document.getElementById("phaser-container");
      if (!parent) return;
      if (!this.bgEl && this.showBg) {
        this.bgEl = document.createElement("div");
        this.bgEl.id = "game-bg";
        this.bgEl.className =
          "absolute top-0 left-0 w-full h-full pointer-events-none z-0";
        this.bgEl.style.background =
          "url('/game-assets/environment/background_tall.svg') repeat-y";
        this.bgEl.style.backgroundSize = "100% auto";
        parent.appendChild(this.bgEl);
      }
      if (!this.container) {
        this.container = document.createElement("div");
        this.container.id = this.containerId;
        this.container.className =
          "absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-[2]";
        parent.appendChild(this.container);
      }
    }
  }

  destroy() {
    this.container?.remove();
    if (this.showBg) this.bgEl?.remove();
  }

  parallax(scrollY: number) {
    if (this.showBg && this.bgEl) {
      this.bgEl.style.backgroundPosition = `50% ${-scrollY * 0.5}px`;
    }
  }

  /**
   * Updates the global responsive scale factor and instantly resizes every
   * currently-visible sprite (except ones explicitly marked non-scalable,
   * e.g. tiling ground blocks) so the change is reflected immediately —
   * no re-render or refresh required.
   */
  setScaleFactor(factor: number) {
    if (this.scaleFactor === factor) return;
    this.scaleFactor = factor;
    if (!this.container) return;
    const els = this.container.querySelectorAll<HTMLElement>(
      'img[data-scalable="1"]',
    );
    els.forEach((el) => {
      const baseW = parseFloat(el.getAttribute("data-base-w") || "0");
      const baseH = parseFloat(el.getAttribute("data-base-h") || "0");
      if (!baseW || !baseH) return;
      el.style.width = baseW * this.scaleFactor + "px";
      el.style.height = baseH * this.scaleFactor + "px";
      const x = parseFloat(el.getAttribute("data-x") || "0");
      const y = parseFloat(el.getAttribute("data-y") || "0");
      const sy = parseFloat(el.getAttribute("data-scroll-y") || "0");
      this.setPos(el, x, y, sy);
    });
  }

  getScaleFactor() {
    return this.scaleFactor;
  }

  addSprite(
    key: string,
    x: number,
    y: number,
    customW?: number,
    customH?: number,
    scalable: boolean = true,
  ): HTMLElement | null {
    const asset = ASSETS[key];
    if (!asset) return null;
    const baseW = customW ?? asset.w;
    const baseH = customH ?? asset.h;
    const factor = scalable ? this.scaleFactor : 1;
    const el = document.createElement("img");
    el.className = "absolute pointer-events-none";
    el.src = asset.path;
    el.style.width = baseW * factor + "px";
    el.style.height = baseH * factor + "px";
    el.setAttribute("data-key", key);
    el.setAttribute("data-base-w", String(baseW));
    el.setAttribute("data-base-h", String(baseH));
    el.setAttribute("data-scalable", scalable ? "1" : "0");
    this.setPos(el, x, y, 0);
    this.container.appendChild(el);
    return el;
  }

  addText(text: string, x: number, y: number): HTMLElement {
    const el = document.createElement("div");
    el.textContent = text;
    el.className = "absolute pointer-events-none whitespace-nowrap select-none";
    el.style.transform = `translate(${x}px, ${y}px)`;
    this.container.appendChild(el);
    return el;
  }

  setPos(el: HTMLElement, x: number, y: number, scrollY: number = 0) {
    el.setAttribute("data-x", String(x));
    el.setAttribute("data-y", String(y));
    el.setAttribute("data-scroll-y", String(scrollY));
    const w = parseFloat(el.style.width) || el.offsetWidth || 0;
    const h = parseFloat(el.style.height) || el.offsetHeight || 0;
    el.style.transform = `translate(${x - w / 2}px, ${y - h / 2 - scrollY}px)`;
  }

  setTextPos(el: HTMLElement, x: number, y: number, scrollY: number = 0) {
    el.style.transform = `translate(${x}px, ${y - scrollY}px)`;
  }

  setOpacity(el: HTMLElement, opacity: number) {
    el.style.opacity = String(opacity);
  }

  remove(el: HTMLElement) {
    el.remove();
  }

  flicker(el: HTMLElement, scene: Phaser.Scene, onDone: () => void) {
    let blinks = 10;
    const blink = () => {
      if (blinks <= 0) {
        this.setOpacity(el, 1);
        onDone();
        return;
      }
      this.setOpacity(el, blinks % 2 === 0 ? 0.2 : 1);
      blinks--;
      scene.time.delayedCall(100, blink);
    };
    blink();
  }

  floatUp(
    el: HTMLElement,
    startX: number,
    startY: number,
    getScrollY: () => number,
  ) {
    let floatY = startY;
    const step = () => {
      floatY -= 0.8;
      this.setTextPos(el, startX, floatY, getScrollY());
      const cur = parseFloat(el.style.opacity || "1");
      const next = cur - 0.008;
      if (next <= 0) {
        this.setOpacity(el, 0);
        this.remove(el);
      } else {
        this.setOpacity(el, next);
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  }
}
