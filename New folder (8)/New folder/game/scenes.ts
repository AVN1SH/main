import Phaser from "phaser";
import { t } from "@/lib/translation";
import { Storage } from "@/lib/storage";
import { soundManager } from "@/lib/soundManager";
import { useGameStore } from "@/lib/gameStore";
import { DomLayer } from "./dom";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("Boot");
  }

  preload() {
    this.load.on("progress", (value: number) => {
      useGameStore.getState().setLoadProgress(Math.floor(value * 100));
    });

    this.load.svg("player", "/game-assets/characters/white_sheep.svg", {
      width: 50,
      height: 50,
    });
    this.load.svg("platform_hay", "/game-assets/platforms/hay.svg", {
      width: 80,
      height: 32,
    });
    this.load.svg("platform_island", "/game-assets/platforms/island.svg", {
      width: 80,
      height: 32,
    });
    this.load.svg("platform_log", "/game-assets/platforms/log.svg", {
      width: 80,
      height: 32,
    });

    this.load.svg("obstacle_bee", "/game-assets/enemies/bee.svg", {
      width: 25,
      height: 25,
    });
    this.load.svg(
      "obstacle_thorns",
      "/game-assets/obstacles/small_thorns.svg",
      { width: 40, height: 16 },
    );
    this.load.svg("platform_board", "/game-assets/obstacles/board.svg", {
      width: 80,
      height: 20,
    });

    this.load.svg("ui_heart", "/game-assets/items/heart.svg", {
      width: 30,
      height: 30,
    });
    this.load.svg("item_carrot", "/game-assets/items/carrot.svg", {
      width: 30,
      height: 30,
    });
    this.load.svg("item_apple", "/game-assets/items/apple.svg", {
      width: 30,
      height: 30,
    });

    // Let's use sun.svg as a balloon alternative
    this.load.svg("balloon", "/game-assets/items/sun.svg", {
      width: 50,
      height: 50,
    });

    this.load.image("coin", "/icons/coin.png");
    this.load.svg("barn", "/game-assets/environment/barn.svg", {
      width: 50,
      height: 48,
    });

    // Background
    this.load.svg("bg_tall", "/game-assets/environment/background_tall.svg");

    // Environmental decorations and ground tiles
    this.load.svg("env_grass", "/game-assets/environment/grass.svg", {
      width: 29,
      height: 21,
    });
    this.load.svg("env_flower", "/game-assets/environment/flower.svg", {
      width: 30,
      height: 56,
    });
    this.load.svg("env_worm", "/game-assets/environment/worm.svg", {
      width: 37,
      height: 27,
    });
    this.load.svg("env_grass_block_1", "/game-assets/environment/grass_1.svg", {
      width: 145,
      height: 145,
    });
    this.load.svg("env_grass_block_2", "/game-assets/environment/grass_2.svg", {
      width: 145,
      height: 145,
    });
    this.load.svg("env_grass_block_3", "/game-assets/environment/grass_3.svg", {
      width: 145,
      height: 145,
    });
  }

  create() {
    soundManager.init();
    soundManager.startBgm();
    useGameStore.getState().setHighScore(Storage.getHighScore());

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

    const handleStart = () => {
      this.scene.start("MainGame");
    };

    window.addEventListener("GAME_START", handleStart);

    this.events.once("shutdown", () => {
      window.removeEventListener("GAME_START", handleStart);
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PLATFORM DIFFICULTY CONFIGURATION
// Edit the tiers below to customise difficulty progression.
//
// Each tier activates at `scoreThreshold` and stays active until the next tier.
//
// Platform weights (out of 100 total) determine appearance chance.
// Setting a weight to 0 disables that platform type entirely for that tier.
//
// Bee chance: probability (0-1) that a safe platform in this tier spawns a bee.
// Thorns are only spawned on platform_board platforms (weight drives frequency).
//
// multiPlatformChance: probability that 2 platforms spawn at the same height.
//   Starts high (easier, more options) and decreases over time.
// ─────────────────────────────────────────────────────────────────────────────
const PLATFORM_CONFIG = [
  // ── TIER 0: Opening (score 0–499) ──────────────────────────────────────
  {
    scoreThreshold: 0,
    platformWeights: {
      platform_island: 50, // Most common — safe, wide
      platform_log: 40, // Common — safe
      platform_hay: 0, // Not yet introduced
      platform_board: 0, // Not yet introduced (has thorns)
    },
    beeChance: 0, // No bees yet
    multiPlatformChance: 0.85, // Very likely to get two platforms
    movingPlatformChance: 0, // No moving platforms yet
  },
  // ── TIER 1: Early game (score 500–1499) ────────────────────────────────
  {
    scoreThreshold: 500,
    platformWeights: {
      platform_island: 40,
      platform_log: 40,
      platform_hay: 20, // Hay introduced — falls after jump
      platform_board: 0,
    },
    beeChance: 0,
    multiPlatformChance: 0.75,
    movingPlatformChance: 0.05,
  },
  // ── TIER 2: Mid game (score 1500–2999) ─────────────────────────────────
  {
    scoreThreshold: 1500,
    platformWeights: {
      platform_island: 30,
      platform_log: 30,
      platform_hay: 30, // Hay more frequent
      platform_board: 10, // Board+thorns introduced (low chance)
    },
    beeChance: 0.1, // Bees introduced (10% on safe platforms)
    multiPlatformChance: 0.65,
    movingPlatformChance: 0.1,
  },
  // ── TIER 3: Mid-hard (score 3000–4999) ─────────────────────────────────
  {
    scoreThreshold: 3000,
    platformWeights: {
      platform_island: 20,
      platform_log: 25,
      platform_hay: 35,
      platform_board: 20,
    },
    beeChance: 0.2,
    multiPlatformChance: 0.55,
    movingPlatformChance: 0.2,
  },
  // ── TIER 4: Hard (score 5000–7999) ─────────────────────────────────────
  {
    scoreThreshold: 5000,
    platformWeights: {
      platform_island: 15,
      platform_log: 20,
      platform_hay: 40,
      platform_board: 25,
    },
    beeChance: 0.3,
    multiPlatformChance: 0.45,
    movingPlatformChance: 0.3,
  },
  // ── TIER 5: Very Hard (score 8000+) ────────────────────────────────────
  {
    scoreThreshold: 8000,
    platformWeights: {
      platform_island: 10,
      platform_log: 15,
      platform_hay: 40,
      platform_board: 35,
    },
    beeChance: 0.4,
    multiPlatformChance: 0.35,
    movingPlatformChance: 0.4,
  },
] as const;

type PlatformType =
  | "platform_island"
  | "platform_log"
  | "platform_hay"
  | "platform_board";

/** Returns the active difficulty tier for the given score. */
function getDifficultyConfig(score: number) {
  // Annotate as the union of all tier types so any tier can be assigned to cfg.
  // Without this, TypeScript infers cfg as the literal type of PLATFORM_CONFIG[0]
  // and rejects later tiers whose scoreThreshold values differ (e.g. 500, 1500 …).
  let cfg: (typeof PLATFORM_CONFIG)[number] = PLATFORM_CONFIG[0];
  for (const tier of PLATFORM_CONFIG) {
    if (score >= tier.scoreThreshold) cfg = tier;
    else break;
  }
  return cfg;
}

/** Picks a platform type from weighted probabilities. Returns a safe type if weights are all zero. */
function pickPlatformType(
  weights: Readonly<Record<PlatformType, number>>,
): PlatformType {
  const total = Object.values(weights).reduce((s, v) => s + v, 0);
  if (total <= 0) return "platform_island";
  let roll = Math.random() * total;
  for (const [type, weight] of Object.entries(weights) as [
    PlatformType,
    number,
  ][]) {
    roll -= weight;
    if (roll <= 0) return type;
  }
  return "platform_island";
}

export class MainGameScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private clouds!: Phaser.Physics.Arcade.Group;
  private hurdles!: Phaser.Physics.Arcade.Group;
  private stars!: Phaser.Physics.Arcade.Group;
  private balloons!: Phaser.Physics.Arcade.Group;
  private hearts!: Phaser.Physics.Arcade.Group;
  private coins!: Phaser.Physics.Arcade.Group;
  private isBarnTriggered = false;
  private score = 0;
  private highestY = 0;
  private isGameOver = false;
  private hasBalloon = false;
  private attachedBalloon: Phaser.GameObjects.Image | null = null;
  private lives = 3;
  private isInvulnerable = false;

  private dom = new DomLayer();
  private decorImages: Phaser.GameObjects.Image[] = [];

  // ── Responsive scaling ──────────────────────────────────────────────
  // Shrinks the character/platforms/items on narrow screens so the full
  // play field stays visible instead of platforms running off the edges,
  // and keeps everything in sync live as the viewport changes.
  private responsiveScale = 1;
  private lastWidth = 0;
  private readonly decorConfig = [
    { key: "env_flower", xFrac: 0.15, offset: 28 },
    { key: "env_grass", xFrac: 0.35, offset: 10.5 },
    { key: "env_worm", xFrac: 0.5, offset: 13.5 },
    { key: "env_flower", xFrac: 0.65, offset: 28 },
    { key: "env_grass", xFrac: 0.85, offset: 10.5 },
  ] as const;

  constructor() {
    super("MainGame");
  }

  private computeResponsiveScale(width: number): number {
    // Full size on wide/desktop screens, progressively smaller on narrow
    // mobile viewports so more of the level width remains visible.
    const scale = Phaser.Math.Clamp(width / 820, 0.62, 1);
    return Math.round(scale * 100) / 100;
  }

  private attachDom(
    obj: Phaser.GameObjects.GameObject,
    key: string,
    customW?: number,
    customH?: number,
    scalable: boolean = true,
  ) {
    const s = obj as any;
    const el = this.dom.addSprite(key, s.x, s.y, customW, customH, scalable);
    if (!el) return;
    obj.setData("__dom", el);
    if ("setVisible" in obj) (obj as any).setVisible(false);
    obj.on("destroy", () => this.dom.remove(el));
  }

  private domRebuild() {
    const sy = this.cameras.main.scrollY || 0;
    const each = (items: any[]) =>
      items.forEach((o: any) => {
        const el = o.getData?.("__dom") as HTMLElement | undefined;
        if (el) this.dom.setPos(el, o.x, o.y, sy);
      });
    each([this.player]);
    if (this.attachedBalloon) each([this.attachedBalloon]);
    each(this.clouds.getChildren());
    each(this.hurdles.getChildren());
    each(this.stars.getChildren());
    each(this.balloons.getChildren());
    each(this.hearts.getChildren());
    each(this.coins.getChildren());
    each(this.decorImages);
  }

  create() {
    this.isGameOver = false;
    this.isBarnTriggered = false;
    this.hasBalloon = false;
    this.attachedBalloon = null;
    this.score = 0;
    this.lives = 3;
    this.isInvulnerable = false;

    // Initialize state inside Zustand store
    useGameStore.getState().setScore(0);
    // Reset session coins to 0 — lobby shows total from Storage, in-game shows session
    useGameStore.getState().setCoins(0);
    useGameStore.getState().setLives(3);
    useGameStore.getState().setUiState("playing");

    this.dom.init();

    // Smoothly fade in the game elements (DOM layer)
    const domLayer = document.getElementById("game-dom-layer");
    if (domLayer) {
      domLayer.style.opacity = "0";
      domLayer.style.transition = "opacity 0.6s ease-out";
      // Force reflow
      void domLayer.offsetWidth;
      domLayer.style.opacity = "1";
      
      // Cleanup transition to prevent unwanted fading later
      setTimeout(() => {
        if (domLayer) domLayer.style.transition = "";
      }, 600);
    }

    const w = this.scale.width;
    const h = this.scale.height;

    this.responsiveScale = this.computeResponsiveScale(w);
    this.dom.setScaleFactor(this.responsiveScale);
    this.lastWidth = w;

    this.clouds = this.physics.add.group({
      immovable: true,
      allowGravity: false,
    });
    this.hurdles = this.physics.add.group({
      immovable: true,
      allowGravity: false,
    });
    this.stars = this.physics.add.group({
      immovable: true,
      allowGravity: false,
    });
    this.balloons = this.physics.add.group({
      immovable: true,
      allowGravity: false,
    });
    this.hearts = this.physics.add.group({
      immovable: true,
      allowGravity: false,
    });
    this.coins = this.physics.add.group({
      immovable: true,
      allowGravity: false,
    });

    // Spawn vertical platform clouds starting above the grass ground layer (grass top is at h - 145)
    for (let i = 0; i < 12; i++) {
      this.spawnCloud(
        w / 2 + (Math.random() - 0.5) * w * 0.8,
        h - 220 - i * 130,
      );
    }

    // Add modular tileable grass ground blocks at the bottom spanning the screen
    this.buildGroundTiles(w, h);

    // Add cute environmental decorations (flowers, worms, grass tufts) standing on the grass line (h - 145)
    this.decorImages = [];
    this.decorConfig.forEach((dec) => {
      const decY = h - 145 - dec.offset;
      const img = this.add.image(w * dec.xFrac, decY, dec.key);
      img.setDepth(0);
      this.attachDom(img, dec.key, undefined, undefined, false);
      this.decorImages.push(img);
    });

    // Position player perfectly on top of the grass (grass top is h - 145, player is 50x50, so player center at h - 170)
    this.player = this.physics.add.sprite(w / 2, h - 175, "player");
    this.player.setScale(this.responsiveScale);
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(false);
    this.player.setVelocityY(-700); // Initial jump so it starts jumping immediately
    this.attachDom(this.player, "player");

    // Fix camera exactly to 0 at the start of the game so the background doesn't shift
    // The camera will only start tracking once the player jumps into the top 30% of the screen
    this.highestY = h * 0.3;

    this.physics.add.collider(
      this.player,
      this.clouds,
      this.hitCloud as any,
      () => !this.hasBalloon,
      this,
    );

    // Thorns are solid for bouncing
    this.physics.add.collider(
      this.player,
      this.hurdles,
      this.hitHurdle as any,
      (p: any, h: any) => {
        return h.getData("type") === "obstacle_thorns" && !this.hasBalloon;
      },
      this,
    );

    // Bees are non-solid hazards (overlap)
    this.physics.add.overlap(
      this.player,
      this.hurdles,
      (p: any, h: any) => {
        if (this.hasBalloon) return;
        if (h.getData("type") === "obstacle_bee") {
          this.hitHurdle(p as any, h as any);
        }
      },
      undefined,
      this,
    );

    this.physics.add.overlap(
      this.player,
      this.stars,
      this.collectStar as any,
      undefined,
      this,
    );
    this.physics.add.overlap(
      this.player,
      this.balloons,
      this.collectBalloon as any,
      undefined,
      this,
    );
    this.physics.add.overlap(
      this.player,
      this.hearts,
      this.collectHeart as any,
      undefined,
      this,
    );
    this.physics.add.overlap(
      this.player,
      this.coins,
      this.collectCoin as any,
      undefined,
      this,
    );
    this.clouds.getChildren().forEach((c: any) => {
      c.body.checkCollision.down = false;
      c.body.checkCollision.left = false;
      c.body.checkCollision.right = false;
    });

    this.hurdles.getChildren().forEach((h: any) => {
      h.body.checkCollision.down = false;
      h.body.checkCollision.left = false;
      h.body.checkCollision.right = false;
    });

    // Setup Pause Event Handler from HTML Overlay
    const handlePause = () => {
      if (this.isGameOver) return;
      this.scene.pause();
      this.scene.launch("Pause");
    };
    window.addEventListener("GAME_PAUSE", handlePause);

    // Live-resize handling: whenever the actual game canvas size changes
    // (window resize, orientation change, mobile browser chrome show/hide,
    // etc.) rebuild the ground row, reposition decorations, clamp the
    // player back on-screen, and rescale everything — all in real time,
    // no refresh needed.
    this.scale.on("resize", this.handleGameResize, this);

    // Pointer Drag (Blocks if tutorial is active)
    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      if (
        pointer.isDown &&
        !useGameStore.getState().showTutorial &&
        !this.isGameOver
      ) {
        this.player.x += (pointer.x - pointer.prevPosition.x) * 1.2;
      }
    });

    this.cameras.main.scrollY = this.highestY - h * 0.3;
    this.dom.parallax(this.cameras.main.scrollY);
    this.domRebuild();

    if (!Storage.getTutorialDone()) {
      useGameStore.getState().setShowTutorial(true);
    }

    // When BonusScene ends and wakes us, restore the DOM layer visibility
    this.events.on("wake", () => {
      const domLayer = document.getElementById("game-dom-layer");
      const gameBg = document.getElementById("game-bg");
      if (domLayer) domLayer.style.visibility = "";
      if (gameBg) gameBg.style.visibility = "";
      // Remove the bonus scene's own dom layer if it wasn't cleaned up
      document.getElementById("bonus-dom-layer")?.remove();
      this.isBarnTriggered = false;

      // Pause physics and trigger resuming UI countdown
      this.physics.pause();
      useGameStore.getState().setUiState("resuming");
    });

    const unsub = useGameStore.subscribe((state, prevState) => {
      if (state.uiState === "playing" && prevState.uiState === "resuming") {
        this.physics.resume();
      }
    });

    this.events.once("shutdown", () => {
      window.removeEventListener("GAME_PAUSE", handlePause);
      this.scale.off("resize", this.handleGameResize, this);
      unsub();
      this.dom.destroy();
    });
  }

  /** Builds/rebuilds the tiling grass ground row so it always spans the full current width with no gaps. */
  private buildGroundTiles(w: number, h: number) {
    const blockSize = 145;
    const numBlocks = Math.ceil(w / blockSize) + 2; // +2 buffer so a mid-resize shrink never exposes an edge gap
    const startX = (w - (numBlocks - 1) * blockSize) / 2;

    for (let i = 0; i < numBlocks; i++) {
      const tileX = startX + i * blockSize;
      const tileY = h - blockSize / 2;
      const tileKey = `env_grass_block_${(i % 3) + 1}`;
      const gBlock = this.clouds.create(tileX, tileY, tileKey);
      gBlock.setDepth(-1);
      gBlock.setScale(1);
      gBlock.setData("type", tileKey);
      // Setup static body sizes for the flat grass surface (top 29px of 145px is grass)
      gBlock.body.setSize(145, 29);
      gBlock.body.setOffset(0, 0);
      if (gBlock.body.updateFromGameObject) {
        gBlock.body.updateFromGameObject();
      }
      gBlock.body.checkCollision.down = false;
      gBlock.body.checkCollision.left = false;
      gBlock.body.checkCollision.right = false;
      // Ground tiles are never responsive-scaled — they must keep their
      // native 145px size so the row always tiles seamlessly.
      this.attachDom(gBlock, tileKey, undefined, undefined, false);
    }
  }

  /** Destroys the current ground row and rebuilds it to match a new width/height. */
  private rebuildGroundTiles(w: number, h: number) {
    const stale: any[] = [];
    this.clouds.getChildren().forEach((c: any) => {
      const type = c.getData("type");
      if (typeof type === "string" && type.startsWith("env_grass_block"))
        stale.push(c);
    });
    stale.forEach((c) => c.destroy());
    this.buildGroundTiles(w, h);
  }

  /** Repositions the environmental decorations to match a new width/height. */
  private repositionDecor(w: number, h: number) {
    this.decorImages.forEach((img, i) => {
      const dec = this.decorConfig[i];
      if (!dec) return;
      img.x = w * dec.xFrac;
      img.y = h - 145 - dec.offset;
    });
  }

  /**
   * Sizes the thorns hazard's invisible physics body to span the full
   * platform_board width (80px, unscaled) regardless of the thorns sprite's
   * own narrower 40px art asset, so landing anywhere across the board always
   * registers as a hit. Call again after any responsiveScale change, since
   * body.updateFromGameObject() resets the body back to the native sprite
   * frame size.
   */
  private widenThornsBody(h: any) {
    if (!h.body) return;
    h.body.setSize(80 * this.responsiveScale, 16 * this.responsiveScale, true);
  }

  /** Rescales every live, scalable game object to the current responsive scale. */
  private rescaleLiveObjects() {
    const scale = this.responsiveScale;
    const rescale = (o: any) => {
      if (!o || !o.active) return;
      o.setScale(scale);
      if (o.body && typeof o.body.updateFromGameObject === "function") {
        o.body.updateFromGameObject();
      }
    };

    rescale(this.player);
    if (this.attachedBalloon) this.attachedBalloon.setScale(scale * 0.5);

    this.clouds.getChildren().forEach((c: any) => {
      const type = c.getData("type");
      if (typeof type === "string" && type.startsWith("platform_")) rescale(c);
    });
    this.hurdles.getChildren().forEach((h: any) => {
      rescale(h);
      if (h.getData("type") === "obstacle_thorns") this.widenThornsBody(h);
    });
    this.stars.getChildren().forEach((s: any) => rescale(s));
    this.balloons.getChildren().forEach((b: any) => rescale(b));
    this.hearts.getChildren().forEach((h: any) => rescale(h));
    this.coins.getChildren().forEach((c: any) => rescale(c));

    // A platform's own top-edge moves as it's rescaled (it scales from its
    // center), but any hazard/item glued to it was placed using a vertical
    // gap baked in at whatever scale it spawned at. Without this, shrinking
    // the platform opens up a growing gap, and growing it pushes the
    // platform's top edge up into the hazard, causing an overlap. Re-anchor
    // every hazard/item to its parent platform's *current* position using
    // its stored base (unscaled) offset so the gap always stays correct.
    this.reanchorHazardsToPlatforms();
  }

  /** Re-syncs every hazard/item's vertical position (and restarts its bob tween) relative to its parent platform's current position and the current responsive scale. */
  private reanchorHazardsToPlatforms() {
    const scale = this.responsiveScale;
    const reanchor = (o: any) => {
      if (!o || !o.active) return;
      const parent = o.getData("parentPlatform");
      const baseOffsetY = o.getData("baseOffsetY");
      if (!parent || !parent.active || typeof baseOffsetY !== "number") return;

      const newY = parent.y - Math.round(baseOffsetY * scale);

      const existingYTween = o.getData("yTween");
      if (existingYTween) {
        existingYTween.remove();
        o.setData("yTween", null);
      }

      o.y = newY;
      if (o.body && typeof o.body.updateFromGameObject === "function") {
        o.body.updateFromGameObject();
      }

      const bobAmount = o.getData("bobAmount");
      if (typeof bobAmount === "number") {
        const duration = o.getData("bobDuration") || 1000;
        const tw = this.tweens.add({
          targets: o,
          y: newY - bobAmount,
          duration,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut",
        });
        o.setData("yTween", tw);
      }
    };

    this.hurdles.getChildren().forEach((h: any) => reanchor(h));
    this.stars.getChildren().forEach((s: any) => reanchor(s));
    this.balloons.getChildren().forEach((b: any) => reanchor(b));
    this.coins.getChildren().forEach((c: any) => reanchor(c));
  }

  /**
   * Re-anchors every dynamically-placed object (player, platforms, hazards,
   * items) to keep its *relative* horizontal position on screen when the
   * width changes — this is what was missing before: the ground rebuilt
   * itself, but floating platforms and the character stayed at their old
   * absolute pixel x, so they visually "stuck" in place while shrinking/
   * expanding the window instead of sliding along with everything else.
   * Any active side-to-side movement tween is safely restarted from the
   * new anchor so it doesn't snap back to a stale, off-screen target.
   */
  private repositionDynamicObjects(newW: number) {
    const remapX = (o: any, isBee: boolean = false) => {
      if (!o || !o.active) return;
      const frac = o.getData("xFrac");
      if (typeof frac !== "number") return;

      const anchorX = frac * newW;
      const moveOffsetX = o.getData("moveOffsetX") || 0;
      const existingTween = o.getData("xTween");
      if (existingTween) {
        existingTween.remove();
        o.setData("xTween", null);
      }

      if (isBee) {
        o.x = anchorX - 20;
        const tw = this.tweens.add({
          targets: o,
          x: anchorX + 20 + moveOffsetX,
          duration: 1000,
          yoyo: true,
          repeat: -1,
        });
        o.setData("xTween", tw);
      } else {
        o.x = anchorX;
        if (moveOffsetX !== 0) {
          const tw = this.tweens.add({
            targets: o,
            x: anchorX + moveOffsetX,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut",
          });
          o.setData("xTween", tw);
        }
      }
    };

    // Player keeps its relative horizontal position instead of staying
    // put at an old absolute pixel coordinate.
    if (this.player && this.lastWidth > 0) {
      const frac = this.player.x / this.lastWidth;
      this.player.x = Phaser.Math.Clamp(frac * newW, 24, newW - 24);
    }
    if (this.attachedBalloon) this.attachedBalloon.x = this.player.x;

    this.clouds.getChildren().forEach((c: any) => {
      const type = c.getData("type");
      if (typeof type === "string" && type.startsWith("platform_")) remapX(c);
    });
    this.hurdles.getChildren().forEach((h: any) => {
      remapX(h, h.getData("type") === "obstacle_bee");
    });
    this.stars.getChildren().forEach((s: any) => remapX(s));
    this.balloons.getChildren().forEach((b: any) => remapX(b));
    this.hearts.getChildren().forEach((h: any) => remapX(h));
    this.coins.getChildren().forEach((c: any) => remapX(c));
  }

  /** Called by Phaser's ScaleManager every time the canvas size actually changes. */
  private handleGameResize(gameSize: Phaser.Structs.Size) {
    if (!this.player) return; // scene not fully created yet

    const w = gameSize.width;
    const h = gameSize.height;
    if (!w || !h) return;

    const newScale = this.computeResponsiveScale(w);
    if (Math.abs(newScale - this.responsiveScale) > 0.001) {
      this.responsiveScale = newScale;
      this.dom.setScaleFactor(newScale);
      this.rescaleLiveObjects();
    }

    if (Math.abs(w - this.lastWidth) > 0.5) {
      this.repositionDynamicObjects(w);
    }
    this.lastWidth = w;

    this.rebuildGroundTiles(w, h);
    this.repositionDecor(w, h);

    // Snap the camera target immediately so there's no visible jump/gap.
    const targetScrollY = this.highestY - h * 0.3;
    if (this.cameras.main.scrollY > targetScrollY) {
      this.cameras.main.scrollY = targetScrollY;
    }
    this.dom.parallax(this.cameras.main.scrollY);
    this.domRebuild();
  }

  /**
   * Spawns a single platform at (x, y).
   *
   * @param forceSafe  When true the platform will never be platform_board
   *                   and will not have a bee — guarantees a jumpable surface.
   */
  spawnCloud(x: number, y: number, forceSafe: boolean = false) {
    const cfg = getDifficultyConfig(this.score);

    // ── Choose platform type ───────────────────────────────────────────
    let type: PlatformType;
    if (forceSafe) {
      // Safe platform: exclude board (thorns). Use the same weights but zero out board.
      const safeWeights = {
        ...cfg.platformWeights,
        platform_board: 0,
      } as Record<PlatformType, number>;
      type = pickPlatformType(safeWeights);
    } else {
      type = pickPlatformType(
        cfg.platformWeights as unknown as Record<PlatformType, number>,
      );
    }

    const isThornsPlatform = type === "platform_board";

    // ── Create the platform sprite ─────────────────────────────────────
    const c = this.clouds.create(x, y, type);
    c.setData("type", type);
    c.setScale(this.responsiveScale);
    c.setDepth(1);
    c.body.checkCollision.down = false;
    c.body.checkCollision.left = false;
    c.body.checkCollision.right = false;
    if (isThornsPlatform) {
      // The board itself must never register its own "landed on top" hit —
      // that was firing hitCloud() (auto bounce, no damage) at the same time
      // the thorns hurdle above it fired hitHurdle() (damage + bounce),
      // causing the double auto-jump. The thorns hurdle (widened below to
      // span the board's full width) is now the ONLY thing the player can
      // ever land on for a board, so it's the only collider that reacts.
      c.body.checkCollision.none = true;
    }
    this.attachDom(c, type);

    // ── Optional horizontal movement ───────────────────────────────────
    let moveOffsetX = 0;
    if (Math.random() < cfg.movingPlatformChance) {
      moveOffsetX = Math.random() < 0.5 ? 50 : -50;
    }
    // Remember this platform's relative horizontal position (as a fraction
    // of the world width at spawn time) and its oscillation amount so a
    // later resize can re-anchor it and safely restart its tween.
    c.setData("xFrac", x / this.scale.width);
    c.setData("moveOffsetX", moveOffsetX);
    if (moveOffsetX !== 0) {
      const cTween = this.tweens.add({
        targets: c,
        x: c.x + moveOffsetX,
        duration: 2000,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
      c.setData("xTween", cTween);
    }

    // ── Hazard / item spawning ─────────────────────────────────────────
    let hasBarn = false;

    // ── Barn bonus portal — 1% chance, only on safe island platforms, score > 1000 ──
    // Exactly like thorns-on-board: barn is a hurdle-group sprite attached above the platform.
    if (
      forceSafe &&
      type === "platform_island" &&
      this.score > 1000 &&
      !this.isBarnTriggered &&
      Math.random() < 1.01
    ) {
      hasBarn = true;
      // barn texture is 50x48; center it above the island top surface
      // island top ≈ y - 20px (island is ~40px tall), barn half-height = 24px
      const barnOffsetY = 44; // base px above platform center
      const barn = this.hurdles.create(
        x,
        y - Math.round(barnOffsetY * this.responsiveScale),
        "barn",
      ) as Phaser.Physics.Arcade.Sprite;
      barn.setScale(this.responsiveScale);
      barn.setDepth(4);
      barn.setData("type", "barn");
      // block only from above so player can't clip through sides
      barn.body.checkCollision.down = false;
      barn.body.checkCollision.left = false;
      barn.body.checkCollision.right = false;
      this.attachDom(barn, "barn", 50, 48);
      barn.setData("xFrac", x / this.scale.width);
      barn.setData("moveOffsetX", moveOffsetX);
      barn.setData("parentPlatform", c);
      barn.setData("baseOffsetY", barnOffsetY);
      // Mark the parent island so hitCloud knows to call enterBarn
      c.setData("hasBarn", true);
      c.setData("childBarn", barn);
      // Keep barn glued to moving platform
      if (moveOffsetX !== 0) {
        const barnTween = this.tweens.add({
          targets: barn,
          x: barn.x + moveOffsetX,
          duration: 2000,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut",
        });
        barn.setData("xTween", barnTween);
      }
      // Gentle bob to make it look inviting
      this.tweens.add({
        targets: barn,
        y: barn.y - 5,
        duration: 900,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }

    if (hasBarn) {
      // Do not spawn any other hazards or items on a platform with a barn
    } else if (isThornsPlatform) {
      // Board with thorns on top
      // Thorns centre at y - 16 (board top ≈ y - 10, thorns half-height 8 px)
      const h = this.hurdles.create(
        x,
        y - Math.round(16 * this.responsiveScale),
        "obstacle_thorns",
      );
      h.setScale(this.responsiveScale);
      h.setDepth(2);
      h.setData("type", "obstacle_thorns");
      h.body.checkCollision.down = false;
      h.body.checkCollision.left = false;
      h.body.checkCollision.right = false;
      // The visible thorns sprite is only 40px wide (narrower than the 80px
      // board), so landing on the left/right thirds of the board used to
      // miss the thorns hitbox entirely and register as a "safe" landing on
      // the board's own body instead. Widen the invisible physics body only
      // (the DOM sprite still renders at its normal 40px size) to the full
      // board width so any landing across the whole board always hits it.
      this.widenThornsBody(h);
      this.attachDom(h, "obstacle_thorns");
      h.setData("xFrac", x / this.scale.width);
      h.setData("moveOffsetX", moveOffsetX);
      // Keep this hazard glued to its platform's surface: store the parent
      // and the unscaled vertical gap so a later resize (which changes
      // this.responsiveScale) can recompute the gap proportionally instead
      // of leaving it baked in at the scale it was spawned at.
      h.setData("parentPlatform", c);
      h.setData("baseOffsetY", 16);
      if (moveOffsetX !== 0) {
        const hTween = this.tweens.add({
          targets: h,
          x: h.x + moveOffsetX,
          duration: 2000,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut",
        });
        h.setData("xTween", hTween);
      }
    } else if (!forceSafe && Math.random() < cfg.beeChance) {
      // Bee on a non-board, non-forced-safe platform
      const startX = x - 20;
      const h = this.hurdles.create(
        startX,
        y - Math.round(30 * this.responsiveScale),
        "obstacle_bee",
      );
      h.setScale(this.responsiveScale);
      h.setDepth(2);
      h.setData("type", "obstacle_bee");
      h.setData("parentPlatform", c);
      c.setData("childHurdle", h);
      h.body.checkCollision.down = false;
      h.body.checkCollision.left = false;
      h.body.checkCollision.right = false;
      this.attachDom(h, "obstacle_bee");
      h.setData("xFrac", x / this.scale.width);
      h.setData("moveOffsetX", moveOffsetX);
      h.setData("baseOffsetY", 30);
      const beeTween = this.tweens.add({
        targets: h,
        x: x + 20 + moveOffsetX,
        duration: 1000,
        yoyo: true,
        repeat: -1,
      });
      h.setData("xTween", beeTween);
    } else if (Math.random() < 0.3) {
      // Collectible item
      const iType = Math.random() < 0.5 ? "item_carrot" : "item_apple";
      const s = this.stars.create(
        x,
        y - Math.round(40 * this.responsiveScale),
        iType,
      );
      s.setScale(this.responsiveScale);
      s.setDepth(2);
      this.attachDom(s, iType);
      const sBobTween = this.tweens.add({
        targets: s,
        y: s.y - 10,
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
      s.setData("yTween", sBobTween);
      s.setData("bobAmount", 10);
      s.setData("bobDuration", 1000);
      s.setData("parentPlatform", c);
      s.setData("baseOffsetY", 40);
      s.setData("xFrac", x / this.scale.width);
      s.setData("moveOffsetX", moveOffsetX);
      if (moveOffsetX !== 0) {
        const sTween = this.tweens.add({
          targets: s,
          x: s.x + moveOffsetX,
          duration: 2000,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut",
        });
        s.setData("xTween", sTween);
      }
    } else if (Math.random() < 0.1) {
      // Balloon power-up (sun) — kept rare so it feels special
      const b = this.balloons.create(
        x,
        y - Math.round(50 * this.responsiveScale),
        "balloon",
      );
      b.setScale(this.responsiveScale);
      b.setDepth(2);
      this.attachDom(b, "balloon");
      const bBobTween = this.tweens.add({
        targets: b,
        y: b.y - 15,
        duration: 1500,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
      b.setData("yTween", bBobTween);
      b.setData("bobAmount", 15);
      b.setData("bobDuration", 1500);
      b.setData("parentPlatform", c);
      b.setData("baseOffsetY", 50);
      b.setData("xFrac", x / this.scale.width);
      b.setData("moveOffsetX", moveOffsetX);
      if (moveOffsetX !== 0) {
        const bTween = this.tweens.add({
          targets: b,
          x: b.x + moveOffsetX,
          duration: 2000,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut",
        });
        b.setData("xTween", bTween);
      }
    }
  }

  hitCloud(
    player: Phaser.Physics.Arcade.Sprite,
    cloud: Phaser.Physics.Arcade.Sprite,
  ) {
    if (this.hasBalloon) return;
    if (player.body && player.body.touching.down) {
      player.setVelocityY(-700);
      soundManager.playJump();

      // Barn island platform — trigger bonus on landing
      if (
        cloud.getData("type") === "platform_island" &&
        cloud.getData("hasBarn")
      ) {
        cloud.setData("hasBarn", false);
        const childBarn = cloud.getData("childBarn");
        if (childBarn) {
          childBarn.destroy();
        }
        this.enterBarn();
        return;
      }

      if (cloud.getData("type") === "platform_hay") {
        soundManager.playHayJump();
      } else if (cloud.getData("type") === "platform_board") {
        soundManager.playWoodJump();
      }

      // Squish animation — relative to the current responsive scale so the
      // effect looks consistent whether the player sprite is shrunk for
      // mobile or shown at full size on desktop.
      this.tweens.add({
        targets: player,
        scaleX: this.responsiveScale * 1.3,
        scaleY: this.responsiveScale * 0.7,
        duration: 100,
        yoyo: true,
      });

      // "the bush will fall down"
      if (cloud.getData("type") === "platform_hay") {
        if (cloud.body) {
          (cloud.body as any).allowGravity = true;
        }

        // Link bee/hurdle fall
        const hurdle = cloud.getData("childHurdle");
        if (hurdle && hurdle.active && hurdle.body) {
          this.tweens.killTweensOf(hurdle);
          (hurdle.body as any).allowGravity = true;
        }
      }
    }
  }

  hitHurdle(
    player: Phaser.Physics.Arcade.Sprite,
    hurdle: Phaser.Physics.Arcade.Sprite,
  ) {
    if (this.isGameOver) return;

    const type = hurdle.getData("type");

    if (type === "obstacle_thorns" || type === "obstacle_bee") {
      // While ascending, ignore bees (flying hazards you shouldn't touch while jumping past)
      if (
        type === "obstacle_bee" &&
        player.body &&
        player.body.velocity.y < 0
      ) {
        return;
      }

      // Thorns only ever matter when you actually land on top of them.
      // Grazing them from below or the side while jumping past/through
      // should behave exactly like every other platform in this game: no
      // reaction at all. (Previously this forced an extra bounce here,
      // which is what caused the "automatic jump" when a board just
      // happened to be in the way while ascending.)
      if (
        type === "obstacle_thorns" &&
        player.body &&
        !player.body.touching.down
      ) {
        return;
      }

      if (this.isInvulnerable) {
        // If it was a landing on thorns, still bounce
        if (
          type === "obstacle_thorns" &&
          player.body &&
          player.body.touching.down
        ) {
          player.setVelocityY(-700);
          soundManager.playJump();
          soundManager.playWoodJump();
        }
        return;
      }

      this.lives -= 1;
      useGameStore.getState().setLives(this.lives);
      soundManager.playDamage();

      if (this.lives <= 0) {
        this.die();
        return;
      }

      // Invulnerable state
      this.isInvulnerable = true;

      // Flicker effect on DOM player element
      const pEl = player.getData("__dom") as HTMLElement | undefined;
      if (pEl)
        this.dom.flicker(pEl, this, () => {
          this.isInvulnerable = false;
        });

      // Bounce off for thorns
      if (
        type === "obstacle_thorns" &&
        player.body &&
        player.body.touching.down
      ) {
        player.setVelocityY(-700);
        soundManager.playJump();
        soundManager.playWoodJump();
      } else if (type === "obstacle_bee") {
        player.setVelocityY(-700);
        soundManager.playJump();
      }
    } else {
      this.die();
    }
  }

  collectStar(
    player: Phaser.Physics.Arcade.Sprite,
    star: Phaser.Physics.Arcade.Sprite,
  ) {
    star.destroy();
    this.score += 500;
    useGameStore.getState().setScore(this.score);
    soundManager.playCollect();

    // Floating score text as HTML element
    const sy = this.cameras.main?.scrollY ?? 0;
    const txtEl = this.dom.addText("+500", star.x - 30, star.y - 12 - sy);
    txtEl.style.font = 'bold 20px Fredoka, "Fredoka", sans-serif';
    txtEl.style.color = "#fde047";
    txtEl.style.webkitTextStroke = "2px #0369a1";
    this.dom.floatUp(
      txtEl,
      star.x - 30,
      star.y - 12,
      () => this.cameras.main?.scrollY ?? 0,
    );
  }

  collectBalloon(
    player: Phaser.Physics.Arcade.Sprite,
    balloon: Phaser.Physics.Arcade.Sprite,
  ) {
    balloon.destroy();
    if (this.hasBalloon) return;

    this.hasBalloon = true;
    soundManager.playCollectedBalloon();

    this.attachedBalloon = this.add.image(
      player.x,
      player.y - Math.round(40 * this.responsiveScale),
      "balloon",
    );
    this.attachedBalloon.setScale(this.responsiveScale * 0.45);
    this.attachedBalloon.setDepth(3);
    this.attachDom(this.attachedBalloon, "balloon", 25, 25);
    this.tweens.add({
      targets: this.attachedBalloon,
      angle: 360,
      duration: 3000,
      repeat: -1,
    });

    if (player.body) {
      (player.body as any).allowGravity = false;
    }

    // Pop after 3 seconds
    this.time.delayedCall(3000, () => {
      this.hasBalloon = false;
      if (this.attachedBalloon) {
        this.attachedBalloon.destroy();
        this.attachedBalloon = null;
      }
      if (this.player && this.player.body) {
        (this.player.body as any).allowGravity = true;
        this.player.setVelocityY(0);
      }
      soundManager.playCollect();
    });
  }

  collectHeart(
    player: Phaser.Physics.Arcade.Sprite,
    heart: Phaser.Physics.Arcade.Sprite,
  ) {
    const hx = heart.x;
    const hy = heart.y;
    heart.destroy();

    if (this.lives >= 3) return; // already full — no-op (shouldn't happen, spawn gate prevents it)

    this.lives = Math.min(3, this.lives + 1);
    useGameStore.getState().setLives(this.lives);
    soundManager.playCollect2();

    // Floating "+♥" text feedback
    const sy = this.cameras.main?.scrollY ?? 0;
    const txtEl = this.dom.addText("+♥", hx - 14, hy - 12 - sy);
    txtEl.style.font = 'bold 22px Fredoka, "Fredoka", sans-serif';
    txtEl.style.color = "#f43f5e";
    txtEl.style.webkitTextStroke = "2px #881337";
    this.dom.floatUp(
      txtEl,
      hx - 14,
      hy - 12,
      () => this.cameras.main?.scrollY ?? 0,
    );
  }

  collectCoin(
    player: Phaser.Physics.Arcade.Sprite,
    coin: Phaser.Physics.Arcade.Sprite,
  ) {
    const cx = coin.x;
    const cy = coin.y;
    coin.destroy();

    // Session counter (shown in HUD, GameOver)
    const sessionCoins = useGameStore.getState().coins + 1;
    useGameStore.getState().setCoins(sessionCoins);
    // Cumulative total in storage (shown in Lobby)
    Storage.setCoins(Storage.getCoins() + 1);

    soundManager.playCollect();

    const sy = this.cameras.main?.scrollY ?? 0;
    const txtEl = this.dom.addText("+1", cx - 10, cy - 12 - sy);
    txtEl.style.font = 'bold 20px Fredoka, "Fredoka", sans-serif';
    txtEl.style.color = "#fbbf24";
    txtEl.style.webkitTextStroke = "2px #b45309";
    this.dom.floatUp(
      txtEl,
      cx - 10,
      cy - 12,
      () => this.cameras.main?.scrollY ?? 0,
    );
  }

  enterBarn() {
    if (this.isBarnTriggered || this.isGameOver) return;
    this.isBarnTriggered = true;
    soundManager.playCollect();
    soundManager.playWoosh();
    useGameStore.getState().setScore(this.score);
    useGameStore.getState().setBonusTimeLeft(10);
    useGameStore.getState().setUiState("bonus");

    // Hide the HTML DOM layer so the BonusScene canvas is visible underneath
    const domLayer = document.getElementById("game-dom-layer");
    const gameBg = document.getElementById("game-bg");
    if (domLayer) domLayer.style.visibility = "hidden";
    if (gameBg) gameBg.style.visibility = "hidden";

    this.scene.sleep();
    this.scene.launch("BonusScene", { score: this.score });
  }

  die() {
    this.isGameOver = true;
    soundManager.playDie();
    soundManager.reduceBgmVolume();
    this.physics.pause();
    const pEl = this.player.getData("__dom") as HTMLElement | undefined;
    if (pEl)
      pEl.style.filter =
        "brightness(0.4) sepia(1) hue-rotate(-50deg) saturate(10)";

    this.time.delayedCall(800, () => {
      this.scene.start("GameOver", { score: this.score });
    });
  }

  update() {
    if (this.isGameOver || useGameStore.getState().showTutorial) return;

    if (this.hasBalloon && this.attachedBalloon && this.player.body) {
      this.player.setVelocityY(-700);
      this.attachedBalloon.x = this.player.x;
      this.attachedBalloon.y =
        this.player.y - Math.round(30 * this.responsiveScale);
    }

    const w = this.scale.width;

    if (this.player.x < -24) this.player.x = w + 24;
    else if (this.player.x > w + 24) this.player.x = -24;

    if (this.player.y < this.highestY) {
      const diff = this.highestY - this.player.y;
      this.score += Math.floor(diff);
      this.highestY = this.player.y;
      useGameStore.getState().setScore(this.score);
    }

    const targetScrollY = this.highestY - this.scale.height * 0.3;
    if (this.cameras.main.scrollY > targetScrollY) {
      this.cameras.main.scrollY = targetScrollY;
    }

    this.dom.parallax(this.cameras.main.scrollY);
    this.domRebuild();

    if (this.player.y > this.cameras.main.scrollY + this.scale.height + 100) {
      this.die();
    }

    const minY = this.cameras.main.scrollY;
    // Initialize with a value guaranteed to be lower (higher Y) than any cloud we care about
    let highestCloudY = minY + this.scale.height;

    this.clouds.getChildren().forEach((c: any) => {
      if (c.y < highestCloudY) highestCloudY = c.y;
      if (c.y > minY + this.scale.height + 250) {
        c.destroy();
      }
    });

    this.hurdles.getChildren().forEach((h: any) => {
      if (h.y > minY + this.scale.height + 250) {
        h.destroy();
      }
    });

    this.stars.getChildren().forEach((s: any) => {
      if (s.y > minY + this.scale.height + 150) {
        s.destroy();
      }
    });

    this.balloons.getChildren().forEach((b: any) => {
      if (b.y > minY + this.scale.height + 150) {
        b.destroy();
      }
    });

    this.hearts.getChildren().forEach((h: any) => {
      if (h.y > minY + this.scale.height + 150) {
        h.destroy();
      }
    });

    this.coins.getChildren().forEach((c: any) => {
      if (c.y > minY + this.scale.height + 150) {
        c.destroy();
      }
    });

    if (highestCloudY > minY - 300) {
      const spawnY = highestCloudY - Phaser.Math.Between(130, 170);
      const cfg = getDifficultyConfig(this.score);

      // Decide how many platforms to spawn at this height level.
      // At least one platform is ALWAYS forced-safe to guarantee a valid jump path.
      // Track the X of the guaranteed-safe platform so the barn can sit on it
      const spawnMultiple = Math.random() < cfg.multiPlatformChance;

      if (spawnMultiple) {
        // Two platforms: one guaranteed safe, one from the normal weighted pool.
        const x1 = Phaser.Math.Between(w * 0.12, w * 0.42);
        const x2 = Phaser.Math.Between(w * 0.58, w * 0.88);
        const yJitter = Math.round(
          Phaser.Math.Between(0, 35) * this.responsiveScale,
        );

        if (Math.random() < 0.5) {
          this.spawnCloud(x1, spawnY, true); // safe
          this.spawnCloud(x2, spawnY + yJitter, false);
        } else {
          this.spawnCloud(x1, spawnY + yJitter, false);
          this.spawnCloud(x2, spawnY, true); // safe
        }
      } else {
        // Single platform — always safe.
        this.spawnCloud(Phaser.Math.Between(w * 0.2, w * 0.8), spawnY, true);
      }

      // ── Floating heart — rarer than sun (1%), spawns mid-air between platforms ──
      // Only appears if player has less than max lives, to keep it meaningful.
      if (this.lives < 3 && Math.random() < 0.05) {
        const heartX = Phaser.Math.Between(w * 0.15, w * 0.85);
        // Position between the new platform row and the one below it (mid-air gap)
        const heartY =
          spawnY +
          Math.round(Phaser.Math.Between(55, 100) * this.responsiveScale);
        const heart = this.hearts.create(heartX, heartY, "ui_heart");
        heart.setScale(this.responsiveScale);
        heart.setData("xFrac", heartX / w);
        heart.setDepth(3);
        this.attachDom(heart, "ui_heart");
        // Gentle bob animation so it reads as collectible
        this.tweens.add({
          targets: heart,
          y: heart.y - 14,
          duration: 900,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut",
        });
      }

      // ── Floating coin — 10% chance, spawns mid-air ──
      if (Math.random() < 0.1) {
        const coinX = Phaser.Math.Between(w * 0.15, w * 0.85);
        const coinY =
          spawnY +
          Math.round(Phaser.Math.Between(40, 85) * this.responsiveScale);
        const coin = this.coins.create(coinX, coinY, "coin");
        coin.setScale(this.responsiveScale * 0.15); // Adjust for the larger image (256px)
        coin.setData("xFrac", coinX / w);
        coin.setDepth(3);
        this.attachDom(coin, "coin", 32, 32);

        // Bob animation
        this.tweens.add({
          targets: coin,
          y: coin.y - 10,
          duration: 1000,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut",
        });
      }
    }
  }
}

export class PauseScene extends Phaser.Scene {
  constructor() {
    super("Pause");
  }

  create() {
    useGameStore.getState().setUiState("paused");

    const handleResume = () => {
      useGameStore.getState().setUiState("playing");
      this.scene.resume("MainGame");
      this.scene.stop();
    };

    const handleHome = () => {
      this.scene.stop("MainGame");
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

    useGameStore.getState().setUiState("gameover");

    const handleRestart = () => {
      this.scene.start("MainGame");
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
