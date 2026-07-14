import Phaser from "phaser";
import { MapAssetInfo } from "./maps/config";

/**
 * Per-element cached data to avoid repeated DOM reads and unnecessary writes.
 */
interface ElCache {
  w: number;
  h: number;
  lastX: number;
  lastY: number;
  lastScrollY: number;
  lastAnimScale: string | null;
}

const elCacheMap = new WeakMap<HTMLElement, ElCache>();

export class DomLayer {
  private container!: HTMLElement;
  private bgEl!: HTMLElement;
  private scaleFactor = 1;
  private containerId: string;
  private showBg: boolean;
  private assets: Record<string, MapAssetInfo>;
  private bgImage: string;

  /** Last parallax scrollY value — skip DOM write if unchanged */
  private lastParallaxY: number | null = null;

  constructor(
    assets: Record<string, MapAssetInfo>,
    bgImage: string = "",
    containerId = "game-dom-layer",
    showBg = true,
  ) {
    this.assets = assets;
    this.bgImage = bgImage;
    this.containerId = containerId;
    this.showBg = showBg;
  }

  init() {
    this.bgEl = document.getElementById("game-bg") as HTMLElement;
    this.container = document.getElementById(this.containerId) as HTMLElement;
    if (this.bgEl && this.bgImage) {
      this.bgEl.style.background = `url('${this.bgImage}') repeat-y`;
      this.bgEl.style.backgroundSize = "100% auto";
    }
    if (!this.bgEl || !this.container) {
      const parent = document.getElementById("phaser-container");
      if (!parent) return;
      if (!this.bgEl && this.showBg) {
        this.bgEl = document.createElement("div");
        this.bgEl.id = "game-bg";
        this.bgEl.className =
          "absolute top-0 left-0 w-full h-full pointer-events-none z-0";
        this.bgEl.style.background = this.bgImage
          ? `url('${this.bgImage}') repeat-y`
          : "";
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
    // Reset parallax cache so first frame always writes
    this.lastParallaxY = null;
  }

  destroy() {
    if (this.containerId === "game-dom-layer") {
      // This is the persistent DOM layer owned/rendered by the React
      // <GameObjectsOverlay> component (reused across every scene and
      // play session). Removing it here would detach it from React's
      // fiber tree, so later scenes fall back to creating an
      // unmanaged duplicate that React can no longer keep in sync
      // (e.g. with the reactively-updated map background). Just clear
      // out the sprites/text this scene added instead.
      if (this.container) this.container.innerHTML = "";
    } else {
      // Ephemeral containers (e.g. the bonus round's own dom layer)
      // are created on the fly and should be fully cleaned up.
      this.container?.remove();
    }
    // #game-bg is also owned by <GameObjectsOverlay> and kept in sync
    // with the selected map there — never remove it. The next scene's
    // init() will overwrite its background image/position as needed.
  }

  parallax(scrollY: number) {
    if (!this.showBg || !this.bgEl) return;
    // Skip DOM write if the value hasn't changed
    if (this.lastParallaxY === scrollY) return;
    this.lastParallaxY = scrollY;
    this.bgEl.style.backgroundPosition = `50% ${-scrollY * 0.5}px`;
  }

  setScaleFactor(factor: number) {
    if (this.scaleFactor === factor) return;
    this.scaleFactor = factor;
    if (!this.container) return;
    const els = this.container.querySelectorAll<HTMLElement>(
      'img[data-scalable="1"], div[data-scalable="1"]',
    );
    els.forEach((el) => {
      const baseW = parseFloat(el.getAttribute("data-base-w") || "0");
      const baseH = parseFloat(el.getAttribute("data-base-h") || "0");
      if (!baseW || !baseH) return;
      const newW = baseW * this.scaleFactor;
      const newH = baseH * this.scaleFactor;
      el.style.width = newW + "px";
      el.style.height = newH + "px";
      // Update cache so next setPos uses fresh dimensions
      const cache = elCacheMap.get(el);
      if (cache) {
        cache.w = newW;
        cache.h = newH;
        // Invalidate position cache to force re-write on next setPos
        cache.lastScrollY = NaN;
      }
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
    const asset = this.assets[key];
    if (!asset) return null;
    const baseW = customW ?? asset.w;
    const baseH = customH ?? asset.h;
    const factor = scalable ? this.scaleFactor : 1;
    const elW = baseW * factor;
    const elH = baseH * factor;
    const isLottie = asset.path.endsWith('.lottie');
    const el = document.createElement(isLottie ? "dotlottie-player" : "img");
    el.className = "absolute pointer-events-none";
    el.setAttribute("src", asset.path);
    if (isLottie) {
      el.setAttribute("autoplay", "true");
      el.setAttribute("loop", "true");
      el.setAttribute("background", "transparent");
    }
    el.style.width = elW + "px";
    el.style.height = elH + "px";
    el.setAttribute("data-key", key);
    el.setAttribute("data-base-w", String(baseW));
    el.setAttribute("data-base-h", String(baseH));
    el.setAttribute("data-scalable", scalable ? "1" : "0");
    if (key.startsWith("env_grass_block_")) {
      el.style.objectFit = "cover";
      if (key.endsWith("_1")) el.style.objectPosition = "left";
      else if (key.endsWith("_2")) el.style.objectPosition = "center";
      else if (key.endsWith("_3")) el.style.objectPosition = "right";
    }
    // Seed cache immediately — no DOM read needed later
    elCacheMap.set(el, { w: elW, h: elH, lastX: NaN, lastY: NaN, lastScrollY: NaN, lastAnimScale: null });
    this.setPos(el, x, y, 0);
    this.container.appendChild(el);
    return el;
  }

  /**
   * Like addSprite, but injects real inline <svg> markup instead of
   * referencing an image file. Because the SVG lives directly in the
   * DOM (not inside an <img>), individual parts of it — eyes, body,
   * etc. — can be targeted with CSS classes and animated (see
   * .character-body / .char-eye in globals.css), which isn't possible
   * with a rasterized <img src="...">.
   */
  addCharacterSprite(
    key: string,
    svgMarkup: string,
    x: number,
    y: number,
    customW?: number,
    customH?: number,
    scalable: boolean = true,
  ): HTMLElement | null {
    const asset = this.assets[key];
    if (!asset) return null;
    const baseW = customW ?? asset.w;
    const baseH = customH ?? asset.h;
    const factor = scalable ? this.scaleFactor : 1;
    const elW = baseW * factor;
    const elH = baseH * factor;
    const el = document.createElement("div");
    el.className = "absolute pointer-events-none";
    el.innerHTML = svgMarkup;
    const svgEl = el.querySelector("svg");
    if (svgEl) {
      svgEl.setAttribute("width", "100%");
      svgEl.setAttribute("height", "100%");
      svgEl.classList.add("character-body");
    }
    el.style.width = elW + "px";
    el.style.height = elH + "px";
    el.setAttribute("data-key", key);
    el.setAttribute("data-base-w", String(baseW));
    el.setAttribute("data-base-h", String(baseH));
    el.setAttribute("data-scalable", scalable ? "1" : "0");
    // Seed cache immediately
    elCacheMap.set(el, { w: elW, h: elH, lastX: NaN, lastY: NaN, lastScrollY: NaN, lastAnimScale: null });
    this.setPos(el, x, y, 0);
    this.container.appendChild(el);
    return el;
  }

  /** Pause/resume the idle blink + shake animations on a character element
   * created via addCharacterSprite (e.g. while flickering invulnerability
   * or dying, where the extra motion would fight with other effects). */
  setCharacterAnimPaused(el: HTMLElement, paused: boolean) {
    const svgEl = el.querySelector(".character-body");
    if (!svgEl) return;
    svgEl.classList.toggle("char-anim-paused", paused);
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
    // Always update data attributes (used by setScaleFactor)
    el.setAttribute("data-x", String(x));
    el.setAttribute("data-y", String(y));
    el.setAttribute("data-scroll-y", String(scrollY));

    // Use cached dimensions — never read offsetWidth/offsetHeight (reflow)
    let cache = elCacheMap.get(el);
    if (!cache) {
      // First time: parse from style attribute (set synchronously at creation)
      const w = parseFloat(el.style.width) || 0;
      const h = parseFloat(el.style.height) || 0;
      cache = { w, h, lastX: NaN, lastY: NaN, lastScrollY: NaN, lastAnimScale: null };
      elCacheMap.set(el, cache);
    }

    const animScale = el.getAttribute("data-anim-scale");

    // Skip write if position hasn't changed (dirty check)
    if (cache.lastX === x && cache.lastY === y && cache.lastScrollY === scrollY && cache.lastAnimScale === animScale) return;
    cache.lastX = x;
    cache.lastY = y;
    cache.lastScrollY = scrollY;
    cache.lastAnimScale = animScale;

    const scaleStr = animScale ? ` scale(${animScale})` : "";
    el.style.transform = `translate(${x - cache.w / 2}px, ${y - cache.h / 2 - scrollY}px)${scaleStr}`;
  }

  setTextPos(el: HTMLElement, x: number, y: number, scrollY: number = 0) {
    el.style.transform = `translate(${x}px, ${y - scrollY}px)`;
  }

  setOpacity(el: HTMLElement, opacity: number) {
    el.style.opacity = String(opacity);
  }

  remove(el: HTMLElement) {
    elCacheMap.delete(el);
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
