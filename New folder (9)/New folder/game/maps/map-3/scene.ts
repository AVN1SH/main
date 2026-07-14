import Phaser from "phaser";
import { Storage } from "@/lib/storage";
import { soundManager } from "@/lib/soundManager";
import { useGameStore } from "@/lib/gameStore";
import { DomLayer } from "@/game/dom";
import { DEMON_CHARACTER_SVG } from "@/game/characters/demon";
import { MAP_3_CONFIG } from "./config";
import type { PlatformType, TierConfig } from "../config";

const PLATFORM_CONFIG: TierConfig[] = [
  {
    scoreThreshold: 0,
    platformWeights: { platform_island: 50, platform_log: 40, platform_hay: 0, platform_board: 0 },
    beeChance: 0, multiPlatformChance: 0.85, movingPlatformChance: 0,
  },
  {
    scoreThreshold: 500,
    platformWeights: { platform_island: 40, platform_log: 40, platform_hay: 20, platform_board: 0 },
    beeChance: 0, multiPlatformChance: 0.75, movingPlatformChance: 0.05,
  },
  {
    scoreThreshold: 1500,
    platformWeights: { platform_island: 30, platform_log: 30, platform_hay: 30, platform_board: 10 },
    beeChance: 0.1, multiPlatformChance: 0.65, movingPlatformChance: 0.1,
  },
  {
    scoreThreshold: 3000,
    platformWeights: { platform_island: 20, platform_log: 25, platform_hay: 35, platform_board: 20 },
    beeChance: 0.2, multiPlatformChance: 0.55, movingPlatformChance: 0.2,
  },
  {
    scoreThreshold: 5000,
    platformWeights: { platform_island: 15, platform_log: 20, platform_hay: 40, platform_board: 25 },
    beeChance: 0.3, multiPlatformChance: 0.45, movingPlatformChance: 0.3,
  },
  {
    scoreThreshold: 8000,
    platformWeights: { platform_island: 10, platform_log: 15, platform_hay: 40, platform_board: 35 },
    beeChance: 0.4, multiPlatformChance: 0.35, movingPlatformChance: 0.4,
  },
];

function getDifficultyConfig(score: number): TierConfig {
  let cfg: TierConfig = PLATFORM_CONFIG[0];
  for (const tier of PLATFORM_CONFIG) {
    if (score >= tier.scoreThreshold) cfg = tier;
    else break;
  }
  return cfg;
}

function pickPlatformType(weights: Readonly<Record<PlatformType, number>>): PlatformType {
  const total = Object.values(weights).reduce((s, v) => s + v, 0);
  if (total <= 0) return "platform_island";
  let roll = Math.random() * total;
  for (const [type, weight] of Object.entries(weights) as [PlatformType, number][]) {
    roll -= weight;
    if (roll <= 0) return type;
  }
  return "platform_island";
}

const K = MAP_3_CONFIG.textureKeys;
const tx = (key: string) => K[key] || key;

export class MainGameScene_Map3 extends Phaser.Scene {
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
  
  private balloonTimers: Phaser.Time.TimerEvent[] = [];
  private balloonProxy: any = { scale: 0.2, opacity: 0 };
  private balloonBoostY: number = 0;
  private hasUsedAdLifeline = false;
  private _pendingCoinDelta = 0;
  private lastCommittedScore = 0;

  private dom = new DomLayer(MAP_3_CONFIG.domAssets, MAP_3_CONFIG.backgroundTall);
  private decorImages: Phaser.GameObjects.Image[] = [];
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
    super(MAP_3_CONFIG.sceneKey);
  }

  private computeResponsiveScale(width: number): number {
    const scale = Phaser.Math.Clamp(width / 820, 0.62, 1);
    return Math.round(scale * 100) / 100;
  }

  private attachDom(obj: Phaser.GameObjects.GameObject, key: string, customW?: number, customH?: number, scalable: boolean = true, characterSvg?: string) {
    const s = obj as any;
    const el = characterSvg
      ? this.dom.addCharacterSprite(key, characterSvg, s.x, s.y, customW, customH, scalable)
      : this.dom.addSprite(key, s.x, s.y, customW, customH, scalable);
    if (!el) return;
    obj.setData("__dom", el);
    if ("setVisible" in obj) (obj as any).setVisible(false);
    obj.on("destroy", () => this.dom.remove(el));
  }

  private domRebuild() {
    const sy = this.cameras.main.scrollY || 0;
    const setPos = this.dom.setPos.bind(this.dom);
    const updateEl = (o: any) => {
      const el = o.getData?.("__dom") as HTMLElement | undefined;
      if (el) setPos(el, o.x, o.y, sy);
    };
    updateEl(this.player);
    if (this.attachedBalloon) updateEl(this.attachedBalloon);
    const platC = this.clouds.getChildren();
    for (let i = 0; i < platC.length; i++) updateEl(platC[i]);
    const hurdC = this.hurdles.getChildren();
    for (let i = 0; i < hurdC.length; i++) updateEl(hurdC[i]);
    const starC = this.stars.getChildren();
    for (let i = 0; i < starC.length; i++) updateEl(starC[i]);
    const ballC = this.balloons.getChildren();
    for (let i = 0; i < ballC.length; i++) updateEl(ballC[i]);
    const heartC = this.hearts.getChildren();
    for (let i = 0; i < heartC.length; i++) updateEl(heartC[i]);
    const coinC = this.coins.getChildren();
    for (let i = 0; i < coinC.length; i++) updateEl(coinC[i]);
    for (let i = 0; i < this.decorImages.length; i++) updateEl(this.decorImages[i]);
  }

  create() {
    this.isGameOver = false;
    this.isBarnTriggered = false;
    this.hasBalloon = false;
    this.attachedBalloon = null;
    this.balloonTimers.forEach(t => t.destroy());
    this.balloonTimers = [];
    this.balloonBoostY = 0;
    this.hasUsedAdLifeline = false;
    this.score = 0;
    this.lastCommittedScore = 0;
    this.lives = 3;
    this.isInvulnerable = false;
    this._pendingCoinDelta = 0;

    useGameStore.getState().setScore(0);
    useGameStore.getState().setCoins(0);
    useGameStore.getState().setLives(3);
    useGameStore.getState().setUiState("playing");

    this.dom.init();

    const domLayer = document.getElementById("game-dom-layer");
    if (domLayer) {
      domLayer.style.opacity = "0";
      domLayer.style.transition = "opacity 0.6s ease-out";
      void domLayer.offsetWidth;
      domLayer.style.opacity = "1";
      setTimeout(() => { if (domLayer) domLayer.style.transition = ""; }, 600);
    }

    const w = this.scale.width;
    const h = this.scale.height;
    this.responsiveScale = this.computeResponsiveScale(w);
    this.dom.setScaleFactor(this.responsiveScale);
    this.lastWidth = w;

    this.clouds = this.physics.add.group({ immovable: true, allowGravity: false });
    this.hurdles = this.physics.add.group({ immovable: true, allowGravity: false });
    this.stars = this.physics.add.group({ immovable: true, allowGravity: false });
    this.balloons = this.physics.add.group({ immovable: true, allowGravity: false });
    this.hearts = this.physics.add.group({ immovable: true, allowGravity: false });
    this.coins = this.physics.add.group({ immovable: true, allowGravity: false });

    for (let i = 0; i < 12; i++) {
      this.spawnCloud(w / 2 + (Math.random() - 0.5) * w * 0.8, h - 220 - i * 130);
    }

    this.buildGroundTiles(w, h);

    this.decorImages = [];
    this.decorConfig.forEach((dec) => {
      const decY = h - 145 - dec.offset;
      const img = this.add.image(w * dec.xFrac, decY, tx(dec.key));
      img.setDepth(0);
      this.attachDom(img, dec.key, undefined, undefined, false);
      this.decorImages.push(img);
    });

    this.player = this.physics.add.sprite(w / 2, h - 175, tx("player"));
    this.player.setScale(this.responsiveScale);
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(false);
    this.player.setVelocityY(-700);
    this.attachDom(this.player, "player", undefined, undefined, true, DEMON_CHARACTER_SVG);
    const pEl = this.player.getData("__dom") as HTMLElement | undefined;
    if (pEl) pEl.style.zIndex = "10";
    this.highestY = h * 0.3;

    this.physics.add.collider(this.player, this.clouds, this.hitCloud as any, () => !this.hasBalloon, this);
    this.physics.add.collider(this.player, this.hurdles, this.hitHurdle as any, (p: any, h: any) => h.getData("type") === tx("obstacle_thorns") && !this.hasBalloon, this);
    this.physics.add.overlap(this.player, this.hurdles, (p: any, h: any) => {
      if (this.hasBalloon) return;
      if (h.getData("type") === tx("obstacle_bee")) this.hitHurdle(p, h);
    }, undefined, this);
    this.physics.add.overlap(this.player, this.stars, this.collectStar as any, undefined, this);
    this.physics.add.overlap(this.player, this.balloons, this.collectBalloon as any, undefined, this);
    this.physics.add.overlap(this.player, this.hearts, this.collectHeart as any, undefined, this);
    this.physics.add.overlap(this.player, this.coins, this.collectCoin as any, undefined, this);

    this.clouds.getChildren().forEach((c: any) => {
      c.body.checkCollision.down = c.body.checkCollision.left = c.body.checkCollision.right = false;
    });
    this.hurdles.getChildren().forEach((h: any) => {
      h.body.checkCollision.down = h.body.checkCollision.left = h.body.checkCollision.right = false;
    });

    const handlePause = () => {
      if (this.isGameOver) return;
      this.scene.pause();
      this.scene.launch("Pause");
    };
    window.addEventListener("GAME_PAUSE", handlePause);

    this.scale.on("resize", this.handleGameResize, this);

    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      if (pointer.isDown && !useGameStore.getState().showTutorial && !this.isGameOver) {
        this.player.x += (pointer.x - pointer.prevPosition.x) * 1.2;
      }
    });

    this.cameras.main.scrollY = this.highestY - h * 0.3;
    this.dom.parallax(this.cameras.main.scrollY);
    this.domRebuild();

    if (!Storage.getTutorialDone()) {
      useGameStore.getState().setShowTutorial(true);
      this.physics.pause();
    }

    this.events.on("wake", () => {
      const domLayer = document.getElementById("game-dom-layer");
      const gameBg = document.getElementById("game-bg");
      if (domLayer) domLayer.style.visibility = "";
      if (gameBg) gameBg.style.visibility = "";
      document.getElementById("bonus-dom-layer")?.remove();
      this.isBarnTriggered = false;
      this.physics.pause();
      useGameStore.getState().setUiState("resuming");
    });

    const unsub = useGameStore.subscribe((state, prevState) => {
      if (state.uiState === "playing" && prevState.uiState === "resuming") {
        this.physics.resume();
      }
      if (!state.showTutorial && prevState.showTutorial) {
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

  private buildGroundTiles(w: number, h: number) {
    const blockSize = 145;
    const numBlocks = Math.ceil(w / blockSize) + 2;
    const startX = (w - (numBlocks - 1) * blockSize) / 2;
    for (let i = 0; i < numBlocks; i++) {
      const tileX = startX + i * blockSize;
      const tileY = h - blockSize / 2;
      const tileKey = `env_grass_block_${(i % 3) + 1}`;
      const gBlock = this.clouds.create(tileX, tileY, tx(tileKey));
      gBlock.setDepth(-1); gBlock.setScale(1);
      gBlock.setData("type", tileKey);
      gBlock.body.setSize(145, 29); gBlock.body.setOffset(0, 0);
      if (gBlock.body.updateFromGameObject) gBlock.body.updateFromGameObject();
      gBlock.body.checkCollision.down = gBlock.body.checkCollision.left = gBlock.body.checkCollision.right = false;
      this.attachDom(gBlock, tileKey, undefined, undefined, false);
    }
  }

  private rebuildGroundTiles(w: number, h: number) {
    const stale: any[] = [];
    this.clouds.getChildren().forEach((c: any) => {
      const type = c.getData("type");
      if (typeof type === "string" && type.startsWith("env_grass_block")) stale.push(c);
    });
    stale.forEach((c) => c.destroy());
    this.buildGroundTiles(w, h);
  }

  private repositionDecor(w: number, h: number) {
    this.decorImages.forEach((img, i) => {
      const dec = this.decorConfig[i];
      if (!dec) return;
      img.x = w * dec.xFrac;
      img.y = h - 145 - dec.offset;
    });
  }

  private widenThornsBody(h: any) {
    if (!h.body) return;
    h.body.setSize(80 * this.responsiveScale, 16 * this.responsiveScale, true);
  }

  private rescaleLiveObjects() {
    const scale = this.responsiveScale;
    const rescale = (o: any) => {
      if (!o || !o.active) return;
      o.setScale(scale);
      if (o.body && typeof o.body.updateFromGameObject === "function") o.body.updateFromGameObject();
    };
    rescale(this.player);
    if (this.attachedBalloon) this.attachedBalloon.setScale(scale * 0.5);
    this.clouds.getChildren().forEach((c: any) => {
      const type = c.getData("type");
      if (typeof type === "string" && type.startsWith("platform_")) rescale(c);
    });
    this.hurdles.getChildren().forEach((h: any) => {
      rescale(h);
      if (h.getData("type") === tx("obstacle_thorns")) this.widenThornsBody(h);
    });
    this.stars.getChildren().forEach((s: any) => rescale(s));
    this.balloons.getChildren().forEach((b: any) => rescale(b));
    this.hearts.getChildren().forEach((h: any) => rescale(h));
    this.coins.getChildren().forEach((c: any) => rescale(c));
    this.reanchorHazardsToPlatforms();
  }

  private reanchorHazardsToPlatforms() {
    const scale = this.responsiveScale;
    const reanchor = (o: any) => {
      if (!o || !o.active) return;
      const parent = o.getData("parentPlatform");
      const baseOffsetY = o.getData("baseOffsetY");
      if (!parent || !parent.active || typeof baseOffsetY !== "number") return;
      const newY = parent.y - Math.round(baseOffsetY * scale);
      const existingYTween = o.getData("yTween");
      if (existingYTween) { existingYTween.remove(); o.setData("yTween", null); }
      o.y = newY;
      if (o.body && typeof o.body.updateFromGameObject === "function") o.body.updateFromGameObject();
      const bobAmount = o.getData("bobAmount");
      if (typeof bobAmount === "number") {
        const duration = o.getData("bobDuration") || 1000;
        o.setData("yTween", this.tweens.add({
          targets: o, y: newY - bobAmount, duration, yoyo: true, repeat: -1, ease: "Sine.easeInOut",
        }));
      }
    };
    this.hurdles.getChildren().forEach((h: any) => reanchor(h));
    this.stars.getChildren().forEach((s: any) => reanchor(s));
    this.balloons.getChildren().forEach((b: any) => reanchor(b));
    this.coins.getChildren().forEach((c: any) => reanchor(c));
  }

  private repositionDynamicObjects(newW: number) {
    const remapX = (o: any, isBee: boolean = false) => {
      if (!o || !o.active) return;
      const frac = o.getData("xFrac");
      if (typeof frac !== "number") return;
      const anchorX = frac * newW;
      const moveOffsetX = o.getData("moveOffsetX") || 0;
      const existingTween = o.getData("xTween");
      if (existingTween) { existingTween.remove(); o.setData("xTween", null); }
      if (isBee) {
        o.x = anchorX - 20;
        o.setData("xTween", this.tweens.add({ targets: o, x: anchorX + 20 + moveOffsetX, duration: 1000, yoyo: true, repeat: -1 }));
      } else {
        o.x = anchorX;
        if (moveOffsetX !== 0) {
          o.setData("xTween", this.tweens.add({ targets: o, x: anchorX + moveOffsetX, duration: 2000, yoyo: true, repeat: -1, ease: "Sine.easeInOut" }));
        }
      }
    };
    if (this.player && this.lastWidth > 0) {
      const frac = this.player.x / this.lastWidth;
      this.player.x = Phaser.Math.Clamp(frac * newW, 24, newW - 24);
    }
    if (this.attachedBalloon) this.attachedBalloon.x = this.player.x;
    this.clouds.getChildren().forEach((c: any) => {
      const type = c.getData("type");
      if (typeof type === "string" && type.startsWith("platform_")) remapX(c);
    });
    this.hurdles.getChildren().forEach((h: any) => remapX(h, h.getData("type") === tx("obstacle_bee")));
    this.stars.getChildren().forEach((s: any) => remapX(s));
    this.balloons.getChildren().forEach((b: any) => remapX(b));
    this.hearts.getChildren().forEach((h: any) => remapX(h));
    this.coins.getChildren().forEach((c: any) => remapX(c));
  }

  private handleGameResize(gameSize: Phaser.Structs.Size) {
    if (!this.player) return;
    const w = gameSize.width;
    const h = gameSize.height;
    if (!w || !h) return;
    const newScale = this.computeResponsiveScale(w);
    if (Math.abs(newScale - this.responsiveScale) > 0.001) {
      this.responsiveScale = newScale;
      this.dom.setScaleFactor(newScale);
      this.rescaleLiveObjects();
    }
    if (Math.abs(w - this.lastWidth) > 0.5) this.repositionDynamicObjects(w);
    this.lastWidth = w;
    this.rebuildGroundTiles(w, h);
    this.repositionDecor(w, h);
    const targetScrollY = this.highestY - h * 0.3;
    if (this.cameras.main.scrollY > targetScrollY) this.cameras.main.scrollY = targetScrollY;
    this.dom.parallax(this.cameras.main.scrollY);
    this.domRebuild();
  }

  spawnCloud(x: number, y: number, forceSafe: boolean = false) {
    const cfg = getDifficultyConfig(this.score);
    let type: PlatformType;
    if (forceSafe) {
      const safeWeights = { ...cfg.platformWeights, platform_board: 0 } as Record<PlatformType, number>;
      type = pickPlatformType(safeWeights);
    } else {
      type = pickPlatformType(cfg.platformWeights as unknown as Record<PlatformType, number>);
    }
    const isThornsPlatform = type === "platform_board";
    const c = this.clouds.create(x, y, tx(type));
    c.setData("type", type);
    c.setScale(this.responsiveScale); c.setDepth(1);
    c.body.checkCollision.down = c.body.checkCollision.left = c.body.checkCollision.right = false;
    if (isThornsPlatform) c.body.checkCollision.none = true;
    this.attachDom(c, type);

    let moveOffsetX = 0;
    if (Math.random() < cfg.movingPlatformChance) moveOffsetX = Math.random() < 0.5 ? 50 : -50;
    c.setData("xFrac", x / this.scale.width);
    c.setData("moveOffsetX", moveOffsetX);
    if (moveOffsetX !== 0) {
      c.setData("xTween", this.tweens.add({ targets: c, x: c.x + moveOffsetX, duration: 2000, yoyo: true, repeat: -1, ease: "Sine.easeInOut" }));
    }

    let hasBarn = false;
    if (forceSafe && type === "platform_island" && this.score > 1000 && !this.isBarnTriggered && Math.random() < 0.01) {
      hasBarn = true;
      const barnOffsetY = 44;
      const barn = this.hurdles.create(x, y - Math.round(barnOffsetY * this.responsiveScale), tx("barn")) as Phaser.Physics.Arcade.Sprite;
      barn.setScale(this.responsiveScale); barn.setDepth(4);
      barn.setData("type", tx("barn"));
      barn.body!.checkCollision.down = barn.body!.checkCollision.left = barn.body!.checkCollision.right = false;
      this.attachDom(barn, "barn", 50, 48);
      barn.setData("xFrac", x / this.scale.width); barn.setData("moveOffsetX", moveOffsetX);
      barn.setData("parentPlatform", c); barn.setData("baseOffsetY", barnOffsetY);
      c.setData("hasBarn", true); c.setData("childBarn", barn);
      if (moveOffsetX !== 0) {
        barn.setData("xTween", this.tweens.add({ targets: barn, x: barn.x + moveOffsetX, duration: 2000, yoyo: true, repeat: -1, ease: "Sine.easeInOut" }));
      }
      this.tweens.add({ targets: barn, y: barn.y - 5, duration: 900, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
    }

    if (hasBarn) {
    } else if (isThornsPlatform) {
      const h = this.hurdles.create(x, y - Math.round(16 * this.responsiveScale), tx("obstacle_thorns"));
      h.setScale(this.responsiveScale); h.setDepth(2);
      h.setData("type", tx("obstacle_thorns"));
      h.body.checkCollision.down = h.body.checkCollision.left = h.body.checkCollision.right = false;
      this.widenThornsBody(h);
      this.attachDom(h, "obstacle_thorns");
      h.setData("xFrac", x / this.scale.width); h.setData("moveOffsetX", moveOffsetX);
      h.setData("parentPlatform", c); h.setData("baseOffsetY", 16);
      if (moveOffsetX !== 0) {
        h.setData("xTween", this.tweens.add({ targets: h, x: h.x + moveOffsetX, duration: 2000, yoyo: true, repeat: -1, ease: "Sine.easeInOut" }));
      }
    } else if (!forceSafe && Math.random() < cfg.beeChance) {
      const startX = x - 20;
      const h = this.hurdles.create(startX, y - Math.round(30 * this.responsiveScale), tx("obstacle_bee"));
      h.setScale(this.responsiveScale); h.setDepth(2);
      h.setData("type", tx("obstacle_bee"));
      h.setData("parentPlatform", c); c.setData("childHurdle", h);
      h.body.checkCollision.down = h.body.checkCollision.left = h.body.checkCollision.right = false;
      this.attachDom(h, "obstacle_bee");
      h.setData("xFrac", x / this.scale.width); h.setData("moveOffsetX", moveOffsetX);
      h.setData("baseOffsetY", 30);
      h.setData("xTween", this.tweens.add({ targets: h, x: x + 20 + moveOffsetX, duration: 1000, yoyo: true, repeat: -1 }));
    } else if (Math.random() < 0.3) {
      const iType = Math.random() < 0.5 ? "item_carrot" : "item_apple";
      const s = this.stars.create(x, y - Math.round(40 * this.responsiveScale), tx(iType));
      s.setScale(this.responsiveScale); s.setDepth(2);
      this.attachDom(s, iType);
      s.setData("yTween", this.tweens.add({ targets: s, y: s.y - 10, duration: 1000, yoyo: true, repeat: -1, ease: "Sine.easeInOut" }));
      s.setData("bobAmount", 10); s.setData("bobDuration", 1000);
      s.setData("parentPlatform", c); s.setData("baseOffsetY", 40);
      s.setData("xFrac", x / this.scale.width); s.setData("moveOffsetX", moveOffsetX);
      if (moveOffsetX !== 0) {
        s.setData("xTween", this.tweens.add({ targets: s, x: s.x + moveOffsetX, duration: 2000, yoyo: true, repeat: -1, ease: "Sine.easeInOut" }));
      }
    } else if (this.score >= 3000 && Math.random() < 0.1) {
      const b = this.balloons.create(x, y - Math.round(50 * this.responsiveScale), tx("balloon"));
      b.setScale(this.responsiveScale); b.setDepth(2);
      this.attachDom(b, "balloon");
      b.setData("yTween", this.tweens.add({ targets: b, y: b.y - 15, duration: 1500, yoyo: true, repeat: -1, ease: "Sine.easeInOut" }));
      b.setData("bobAmount", 15); b.setData("bobDuration", 1500);
      b.setData("parentPlatform", c); b.setData("baseOffsetY", 50);
      b.setData("xFrac", x / this.scale.width); b.setData("moveOffsetX", moveOffsetX);
      if (moveOffsetX !== 0) {
        b.setData("xTween", this.tweens.add({ targets: b, x: b.x + moveOffsetX, duration: 2000, yoyo: true, repeat: -1, ease: "Sine.easeInOut" }));
      }
    }
  }

  hitCloud(player: Phaser.Physics.Arcade.Sprite, cloud: Phaser.Physics.Arcade.Sprite) {
    if (this.hasBalloon) return;
    if (player.body && player.body.touching.down) {
      player.setVelocityY(-700);
      soundManager.playJump();
      if (cloud.getData("type") === "platform_island" && cloud.getData("hasBarn")) {
        cloud.setData("hasBarn", false);
        const childBarn = cloud.getData("childBarn");
        if (childBarn) childBarn.destroy();
        this.enterBarn();
        return;
      }
      if (cloud.getData("type") === "platform_hay") soundManager.playHayJump();
      else if (cloud.getData("type") === "platform_board") soundManager.playWoodJump();
      this.tweens.add({ targets: player, scaleX: this.responsiveScale * 0.8, scaleY: this.responsiveScale * 1.25, duration: 150, yoyo: true });
      if (cloud.getData("type") === "platform_hay") {
        if (cloud.body) (cloud.body as any).allowGravity = true;
        const hurdle = cloud.getData("childHurdle");
        if (hurdle && hurdle.active && hurdle.body) {
          this.tweens.killTweensOf(hurdle);
          (hurdle.body as any).allowGravity = true;
        }
      }
    }
  }

  hitHurdle(player: Phaser.Physics.Arcade.Sprite, hurdle: Phaser.Physics.Arcade.Sprite) {
    if (this.isGameOver) return;
    const type = hurdle.getData("type");
    if (type === tx("obstacle_thorns") || type === tx("obstacle_bee")) {
      if (type === tx("obstacle_bee") && player.body && player.body.velocity.y < 0) return;
      if (type === tx("obstacle_thorns") && player.body && !player.body.touching.down) return;
      if (this.isInvulnerable) {
        if (type === tx("obstacle_thorns") && player.body && player.body.touching.down) {
          player.setVelocityY(-700); soundManager.playJump(); soundManager.playWoodJump();
        }
        return;
      }
      this.lives -= 1;
      useGameStore.getState().setLives(this.lives);
      soundManager.playDamage();
      if (this.lives <= 0) { this.die(); return; }
      this.isInvulnerable = true;
      const pEl = player.getData("__dom") as HTMLElement | undefined;
      if (pEl) this.dom.flicker(pEl, this, () => { this.isInvulnerable = false; });
      if (type === tx("obstacle_thorns") && player.body && player.body.touching.down) {
        player.setVelocityY(-700); soundManager.playJump(); soundManager.playWoodJump();
      } else if (type === tx("obstacle_bee")) {
        player.setVelocityY(-700); soundManager.playJump();
      }
    } else {
      this.die();
    }
  }

  collectStar(player: Phaser.Physics.Arcade.Sprite, star: Phaser.Physics.Arcade.Sprite) {
    star.destroy();
    this.score += 500;
    useGameStore.getState().setScore(this.score);
    soundManager.playCollect();
    const sy = this.cameras.main?.scrollY ?? 0;
    const txtEl = this.dom.addText("+500", star.x - 30, star.y - 12 - sy);
    txtEl.style.font = 'bold 20px Fredoka, "Fredoka", sans-serif';
    txtEl.style.color = "#fde047";
    txtEl.style.webkitTextStroke = "2px #0369a1";
    this.dom.floatUp(txtEl, star.x - 30, star.y - 12, () => this.cameras.main?.scrollY ?? 0);
  }

  private setupBalloonTimers(bEl: HTMLElement) {
    const t1 = this.time.delayedCall(1600, () => {
      if (!this.hasBalloon || !this.attachedBalloon) return;
      this.tweens.add({
        targets: this.balloonProxy,
        opacity: 0.3,
        duration: 125,
        yoyo: true,
        repeat: -1,
        onUpdate: () => { bEl.style.opacity = String(this.balloonProxy.opacity); }
      });
    });

    const t2 = this.time.delayedCall(2600, () => {
      if (!this.hasBalloon || !this.attachedBalloon) return;
      this.tweens.killTweensOf(this.balloonProxy);
      this.tweens.add({
        targets: this.balloonProxy,
        scale: 0.2,
        opacity: 0,
        duration: 400,
        ease: "Sine.easeOut",
        onUpdate: () => {
          bEl.setAttribute("data-anim-scale", String(this.balloonProxy.scale));
          bEl.style.opacity = String(this.balloonProxy.opacity);
        }
      });
    });

    const t3 = this.time.delayedCall(3000, () => {
      this.hasBalloon = false;
      if (this.attachedBalloon) { this.attachedBalloon.destroy(); this.attachedBalloon = null; }
      if (this.player && this.player.body) { (this.player.body as any).allowGravity = true; this.player.setVelocityY(0); }
      soundManager.playCollect();
    });

    this.balloonTimers.push(t1, t2, t3);
  }

  collectBalloon(player: Phaser.Physics.Arcade.Sprite, balloon: Phaser.Physics.Arcade.Sprite) {
    balloon.destroy();
    
    this.balloonTimers.forEach(t => t.destroy());
    this.balloonTimers = [];
    
    if (this.hasBalloon && this.attachedBalloon) {
      soundManager.playCollectedBalloon();
      this.balloonBoostY = -500;
      const bEl = this.attachedBalloon.getData("__dom") as HTMLElement | undefined;
      if (bEl) {
        this.tweens.killTweensOf(this.balloonProxy);
        this.balloonProxy.scale = 1;
        this.balloonProxy.opacity = 1;
        bEl.setAttribute("data-anim-scale", "1");
        bEl.style.opacity = "1";
        
        this.tweens.add({
          targets: this.balloonProxy,
          scale: 1.3,
          duration: 150,
          yoyo: true,
          onUpdate: () => { bEl.setAttribute("data-anim-scale", String(this.balloonProxy.scale)); }
        });
        this.setupBalloonTimers(bEl);
      }
      return;
    }

    this.hasBalloon = true;
    soundManager.playCollectedBalloon();
    this.balloonBoostY = 0;
    this.attachedBalloon = this.add.image(player.x, player.y - Math.round(30 * this.responsiveScale), tx("balloon"));
    this.attachedBalloon.setScale(this.responsiveScale * 0.45);
    this.attachedBalloon.setDepth(3);
    this.attachDom(this.attachedBalloon, "balloon", 100, 100);
    
    const bEl = this.attachedBalloon.getData("__dom") as HTMLElement | undefined;
    if (bEl) {
      bEl.setAttribute("data-anim-scale", "0.2");
      bEl.style.opacity = "0";

      this.balloonProxy = { scale: 0.2, opacity: 0 };
      this.tweens.add({
        targets: this.balloonProxy,
        scale: 1,
        opacity: 1,
        duration: 400,
        ease: "Back.easeOut",
        onUpdate: () => {
          bEl.setAttribute("data-anim-scale", String(this.balloonProxy.scale));
          bEl.style.opacity = String(this.balloonProxy.opacity);
        },
        onComplete: () => {
          this.setupBalloonTimers(bEl);
        }
      });
    }

    if (player.body) (player.body as any).allowGravity = false;
  }

  collectHeart(player: Phaser.Physics.Arcade.Sprite, heart: Phaser.Physics.Arcade.Sprite) {
    const hx = heart.x; const hy = heart.y;
    heart.destroy();
    if (this.lives >= 3) return;
    this.lives = Math.min(3, this.lives + 1);
    useGameStore.getState().setLives(this.lives);
    soundManager.playCollect2();
    const sy = this.cameras.main?.scrollY ?? 0;
    const txtEl = this.dom.addText("+♥", hx - 14, hy - 12 - sy);
    txtEl.style.font = 'bold 22px Fredoka, "Fredoka", sans-serif';
    txtEl.style.color = "#f43f5e";
    txtEl.style.webkitTextStroke = "2px #881337";
    this.dom.floatUp(txtEl, hx - 14, hy - 12, () => this.cameras.main?.scrollY ?? 0);
  }

  collectCoin(player: Phaser.Physics.Arcade.Sprite, coin: Phaser.Physics.Arcade.Sprite) {
    const cx = coin.x; const cy = coin.y;
    coin.destroy();
    const sessionCoins = useGameStore.getState().coins + 1;
    useGameStore.getState().setCoins(sessionCoins);
    this._pendingCoinDelta++;
    if (this._pendingCoinDelta >= 3) {
      Storage.setCoins(Storage.getCoins() + this._pendingCoinDelta);
      this._pendingCoinDelta = 0;
    }
    soundManager.playCollect2();
    const sy = this.cameras.main?.scrollY ?? 0;
    const txtEl = this.dom.addText("+1", cx - 10, cy - 12 - sy);
    txtEl.style.font = 'bold 20px Fredoka, "Fredoka", sans-serif';
    txtEl.style.color = "#fbbf24";
    txtEl.style.webkitTextStroke = "2px #b45309";
    this.dom.floatUp(txtEl, cx - 10, cy - 12, () => this.cameras.main?.scrollY ?? 0);
  }

  enterBarn() {
    if (this.isBarnTriggered || this.isGameOver) return;
    this.isBarnTriggered = true;
    soundManager.playCollect();
    soundManager.playWoosh();
    useGameStore.getState().setScore(this.score);
    this.lastCommittedScore = this.score;
    if (this._pendingCoinDelta > 0) {
      Storage.setCoins(Storage.getCoins() + this._pendingCoinDelta);
      this._pendingCoinDelta = 0;
    }
    useGameStore.getState().setBonusTimeLeft(10);
    useGameStore.getState().setUiState("bonus");
    const domLayer = document.getElementById("game-dom-layer");
    const gameBg = document.getElementById("game-bg");
    if (domLayer) domLayer.style.visibility = "hidden";
    if (gameBg) gameBg.style.visibility = "hidden";
    this.scene.sleep();
    this.scene.launch("BonusScene", { score: this.score });
  }

  die() {
    this.isGameOver = true;
    if (this._pendingCoinDelta > 0) {
      Storage.setCoins(Storage.getCoins() + this._pendingCoinDelta);
      this._pendingCoinDelta = 0;
    }
    soundManager.playDie();
    soundManager.reduceBgmVolume();
    this.physics.pause();
    const pEl = this.player.getData("__dom") as HTMLElement | undefined;
    if (pEl) pEl.style.filter = "brightness(0.4) sepia(1) hue-rotate(-50deg) saturate(10)";

    if (!this.hasUsedAdLifeline) {
      this.hasUsedAdLifeline = true;
      useGameStore.getState().setShowAdLifeline(true);
      const onRevive = () => {
        window.removeEventListener("AD_LIFELINE_REVIVE", onRevive);
        window.removeEventListener("AD_LIFELINE_DECLINE", onDecline);
        this.isGameOver = false;
        this.lives = 1;
        useGameStore.getState().setLives(1);
        if (pEl) pEl.style.filter = "";
        const safeY = this.highestY + this.scale.height * 0.6;
        this.player.setPosition(this.scale.width / 2, safeY);
        this.player.setVelocityY(-700);
        if (this.player.body) (this.player.body as any).allowGravity = true;
        this.physics.resume();
        soundManager.restoreBgmVolume();
      };
      const onDecline = () => {
        window.removeEventListener("AD_LIFELINE_REVIVE", onRevive);
        window.removeEventListener("AD_LIFELINE_DECLINE", onDecline);
        this.time.delayedCall(400, () => { this.scene.start("GameOver", { score: this.score }); });
      };
      window.addEventListener("AD_LIFELINE_REVIVE", onRevive);
      window.addEventListener("AD_LIFELINE_DECLINE", onDecline);
    } else {
      this.time.delayedCall(800, () => { this.scene.start("GameOver", { score: this.score }); });
    }
  }

  update() {
    if (this.isGameOver || useGameStore.getState().showTutorial) return;
    
    const pEl = this.player.getData("__dom") as HTMLElement | undefined;
    if (pEl && this.player.body) {
      if (this.player.body.velocity.y < -150) pEl.classList.add("char-jumping");
      else pEl.classList.remove("char-jumping");
    }

    if (this.hasBalloon && this.attachedBalloon && this.player.body) {
      if (this.balloonBoostY < 0) this.balloonBoostY *= 0.9;
      if (this.balloonBoostY > -1) this.balloonBoostY = 0;
      this.player.setVelocityY(-700 + this.balloonBoostY);
      this.attachedBalloon.x = this.player.x;
      this.attachedBalloon.y = this.player.y - Math.round(30 * this.responsiveScale);
    }
    const w = this.scale.width;
    const h = this.scale.height;
    const cam = this.cameras.main;
    const camScrollY = cam.scrollY;

    if (this.player.x < -24) this.player.x = w + 24;
    else if (this.player.x > w + 24) this.player.x = -24;
    if (this.player.y < this.highestY) {
      const diff = this.highestY - this.player.y;
      this.score += Math.floor(diff);
      this.highestY = this.player.y;
      if (this.score - this.lastCommittedScore >= 10) {
        useGameStore.getState().setScore(this.score);
        this.lastCommittedScore = this.score;
      }
    }
    const targetScrollY = this.highestY - h * 0.3;
    if (camScrollY > targetScrollY) cam.scrollY = targetScrollY;
    this.dom.parallax(cam.scrollY);
    this.domRebuild();
    if (this.player.y > cam.scrollY + h + 100) { this.die(); return; }
    const cullThresholdFar = cam.scrollY + h + 250;
    const cullThresholdNear = cam.scrollY + h + 150;
    const minY = cam.scrollY;
    let highestCloudY = minY + h;
    const cloudChildren = this.clouds.getChildren();
    for (let i = cloudChildren.length - 1; i >= 0; i--) {
      const c = cloudChildren[i] as any;
      if (c.y < highestCloudY) highestCloudY = c.y;
      if (c.y > cullThresholdFar) c.destroy();
    }
    const hurdleChildren = this.hurdles.getChildren();
    for (let i = hurdleChildren.length - 1; i >= 0; i--) {
      const h2 = hurdleChildren[i] as any;
      if (h2.y > cullThresholdFar) h2.destroy();
    }
    const nearGroups = [this.stars, this.balloons, this.hearts, this.coins];
    for (const grp of nearGroups) {
      const ch = grp.getChildren();
      for (let i = ch.length - 1; i >= 0; i--) {
        const o = ch[i] as any;
        if (o.y > cullThresholdNear) o.destroy();
      }
    }
    if (highestCloudY > minY - 300) {
      const spawnY = highestCloudY - Phaser.Math.Between(130, 170);
      const cfg = getDifficultyConfig(this.score);
      const spawnMultiple = Math.random() < cfg.multiPlatformChance;
      if (spawnMultiple) {
        const x1 = Phaser.Math.Between(w * 0.12, w * 0.42);
        const x2 = Phaser.Math.Between(w * 0.58, w * 0.88);
        const yJitter = Math.round(Phaser.Math.Between(0, 35) * this.responsiveScale);
        if (Math.random() < 0.5) { this.spawnCloud(x1, spawnY, true); this.spawnCloud(x2, spawnY + yJitter, false); }
        else { this.spawnCloud(x1, spawnY + yJitter, false); this.spawnCloud(x2, spawnY, true); }
      } else {
        this.spawnCloud(Phaser.Math.Between(w * 0.2, w * 0.8), spawnY, true);
      }
      if (this.lives < 3 && Math.random() < 0.05) {
        const heartX = Phaser.Math.Between(w * 0.15, w * 0.85);
        const heartY = spawnY + Math.round(Phaser.Math.Between(55, 100) * this.responsiveScale);
        const heart = this.hearts.create(heartX, heartY, tx("ui_heart"));
        heart.setScale(this.responsiveScale); heart.setData("xFrac", heartX / w); heart.setDepth(3);
        this.attachDom(heart, "ui_heart");
        this.tweens.add({ targets: heart, y: heart.y - 14, duration: 900, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
      }
      if (Math.random() < 0.1) {
        const coinX = Phaser.Math.Between(w * 0.15, w * 0.85);
        const coinY = spawnY + Math.round(Phaser.Math.Between(40, 85) * this.responsiveScale);
        const coin = this.coins.create(coinX, coinY, tx("coin"));
        coin.setScale(this.responsiveScale * 0.15); coin.setData("xFrac", coinX / w); coin.setDepth(3);
        this.attachDom(coin, "coin", 32, 32);
        this.tweens.add({ targets: coin, y: coin.y - 10, duration: 1000, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
      }
    }
  }
}
