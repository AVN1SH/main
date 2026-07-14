import Phaser from "phaser";
import { useGameStore } from "@/lib/gameStore";
import { Storage } from "@/lib/storage";
import { soundManager } from "@/lib/soundManager";
import { DomLayer } from "@/game/dom";
import { mapManager } from "@/game/mapManager";
import { CHARACTER_SVGS } from "@/game/characters";

export class BonusScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private platforms!: Phaser.Physics.Arcade.Group;
  private coinGroup!: Phaser.Physics.Arcade.Group;
  private dom: DomLayer;
  private isEnded = false;
  private timeLeft = 10;
  private timerEvent!: Phaser.Time.TimerEvent;
  private highestY = 0;
  private responsiveScale = 1;
  private score = 0;
  private lastCommittedScore = 0;
  private bgSprite!: Phaser.GameObjects.TileSprite;
  private bgDark!: Phaser.GameObjects.Graphics;
  private stars: Phaser.GameObjects.Arc[] = [];
  private _starH = 0;

  private get config() {
    return mapManager.getCurrentConfig();
  }
  private get K() {
    return this.config.textureKeys;
  }
  private get tx() {
    return (key: string) => this.K[key] || key;
  }

  constructor() {
    super("BonusScene");
    this.dom = new DomLayer(
      mapManager.getCurrentConfig().domAssets,
      "",
      "bonus-dom-layer",
      false,
    );
  }

  init(data: { score: number }) {
    this.score = data?.score ?? useGameStore.getState().score;
    this.isEnded = false;
    this.timeLeft = 10;
    useGameStore.getState().setIsBonusStarted(false);
    this.timeLeft = 10;
    this.dom = new DomLayer(
      mapManager.getCurrentConfig().domAssets,
      "",
      "bonus-dom-layer",
      false,
    );
  }

  private computeResponsiveScale(width: number): number {
    return Math.round(Phaser.Math.Clamp(width / 820, 0.62, 1) * 100) / 100;
  }

  private attachDom(
    obj: Phaser.GameObjects.GameObject,
    key: string,
    customW?: number,
    customH?: number,
    characterSvg?: string,
  ) {
    const s = obj as any;
    const el = characterSvg
      ? this.dom.addCharacterSprite(key, characterSvg, s.x, s.y, customW, customH, true)
      : this.dom.addSprite(key, s.x, s.y, customW, customH, true);
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
    const platChildren = this.platforms.getChildren();
    for (let i = 0; i < platChildren.length; i++) updateEl(platChildren[i]);
    const coinChildren = this.coinGroup.getChildren();
    for (let i = 0; i < coinChildren.length; i++) updateEl(coinChildren[i]);
  }

  create() {
    const w = this.scale.width;
    const h = this.scale.height;
    this.responsiveScale = this.computeResponsiveScale(w);
    this._starH = h; // cache for update loop

    this.dom.init();
    this.dom.setScaleFactor(this.responsiveScale);

    this.bgSprite = this.add
      .tileSprite(w / 2, h / 2, w, h, this.tx("bg_tall"))
      .setScrollFactor(0)
      .setDepth(0);
    const texture = this.textures.get(this.tx("bg_tall")).getSourceImage();
    const scaleX = w / (texture.width || w);
    this.bgSprite.tileScaleX = scaleX;
    this.bgSprite.tileScaleY = scaleX;

    this.bgDark = this.add.graphics().setScrollFactor(0).setDepth(0);
    this.bgDark.fillStyle(0x000010, 0.6);
    this.bgDark.fillRect(0, 0, w, h);

    this.stars = [];
    for (let i = 0; i < 55; i++) {
      const baseYFrac = Math.random();
      const star = this.add
        .circle(
          Math.random() * w,
          baseYFrac * h,
          Math.random() * 1.5 + 0.5,
          0xffffff,
          Math.random() * 0.6 + 0.2,
        )
        .setScrollFactor(0)
        .setDepth(1);

      star.setData("baseYFrac", baseYFrac);
      this.stars.push(star as Phaser.GameObjects.Arc);
      this.tweens.add({
        targets: star,
        alpha: 0.1,
        duration: 700 + Math.random() * 1200,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }

    this.platforms = this.physics.add.group({
      immovable: true,
      allowGravity: false,
    });
    this.coinGroup = this.physics.add.group({
      immovable: true,
      allowGravity: false,
    });

    for (let i = 0; i < 14; i++) {
      this.spawnPlatform(
        w / 2 + (Math.random() - 0.5) * w * 0.75,
        h - 80 - i * 155,
      );
    }

    this.player = this.physics.add.sprite(w / 2, h - 60, this.tx("player"));
    this.player.setData("xFrac", 0.5);
    this.player.setScale(this.responsiveScale);
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(false);
    this.player.setVelocityY(-750);
    soundManager.playJump();
    this.player.setDepth(8);
    this.highestY = this.player.y;
    this.attachDom(this.player, "player", undefined, undefined, CHARACTER_SVGS[mapManager.getCurrentId()]);

    this.physics.add.collider(
      this.player,
      this.platforms,
      (p: any, plat: any) => {
        if (p.body && p.body.touching.down) {
          p.setVelocityY(-820);
          soundManager.playJump();
          this.tweens.add({
            targets: p,
            scaleX: this.responsiveScale * 1.35,
            scaleY: this.responsiveScale * 0.65,
            duration: 80,
            yoyo: true,
          });
          if (plat.body) (plat.body as any).allowGravity = true;
        }
      },
      (p: any) => p.body?.velocity?.y > 0,
      this,
    );

    this.physics.add.overlap(
      this.player,
      this.coinGroup,
      (p: any, c: any) => {
        const cx = c.x;
        const cy = c.y;
        c.destroy();
        const nc = useGameStore.getState().coins + 1;
        useGameStore.getState().setCoins(nc);
        Storage.setCoins(Storage.getCoins() + 1);
        this.score += 50;
        useGameStore.getState().setScore(this.score);
        soundManager.playCollect2();
        const sy = this.cameras.main.scrollY || 0;
        const txt = this.add
          .text(cx, cy - sy, "+1", {
            fontSize: "20px",
            color: "#fbbf24",
            fontFamily: "Fredoka, sans-serif",
            stroke: "#92400e",
            strokeThickness: 2,
          })
          .setScrollFactor(0)
          .setDepth(15)
          .setOrigin(0.5);
        this.tweens.add({
          targets: txt,
          y: txt.y - 45,
          alpha: 0,
          duration: 750,
          ease: "Cubic.easeOut",
          onComplete: () => txt.destroy(),
        });
      },
      undefined,
      this,
    );

    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      if (pointer.isDown && !this.isEnded && this.player?.active) {
        this.player.x += (pointer.x - pointer.prevPosition.x) * 1.3;
        this.player.setData("xFrac", this.player.x / this.scale.width);
      }
    });

    this.cameras.main.scrollY = this.highestY - h * 0.3;
    this.domRebuild();

    this.timerEvent = this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.timeLeft -= 1;
        useGameStore.getState().setBonusTimeLeft(this.timeLeft);
        if (this.timeLeft <= 0) this.endBonus();
      },
      loop: true,
      paused: true,
    });

    this.physics.pause();

    const domEl = document.getElementById("bonus-dom-layer");
    if (domEl) {
      domEl.style.opacity = "0";
      domEl.style.transition = "opacity 0.6s ease-in-out";
    }

    const unsub = useGameStore.subscribe((state, prevState) => {
      if (state.isBonusStarted && !prevState.isBonusStarted) {
        if (domEl) domEl.style.opacity = "1";
        this.physics.resume();
        this.timerEvent.paused = false;
      }
    });

    this.scale.on("resize", this.handleGameResize, this);

    this.events.once("shutdown", () => {
      unsub();
      this.scale.off("resize", this.handleGameResize, this);
      this.dom.destroy();
    });
  }

  private handleGameResize(
    gameSize: Phaser.Structs.Size,
    baseSize: Phaser.Structs.Size,
    displaySize: Phaser.Structs.Size,
    resolution: number,
  ) {
    if (this.isEnded) return;
    const w = gameSize.width;
    const h = gameSize.height;

    this.responsiveScale = this.computeResponsiveScale(w);
    this.dom.setScaleFactor(this.responsiveScale);

    if (this.bgSprite) {
      this.bgSprite.setPosition(w / 2, h / 2);
      this.bgSprite.setSize(w, h);
      const texture = this.textures.get(this.tx("bg_tall")).getSourceImage();
      const scaleX = w / (texture.width || w);
      this.bgSprite.tileScaleX = scaleX;
      this.bgSprite.tileScaleY = scaleX;
    }

    if (this.bgDark) {
      this.bgDark.clear();
      this.bgDark.fillStyle(0x000010, 0.6);
      this.bgDark.fillRect(0, 0, w, h);
    }

    if (this.player && this.player.active) {
      this.player.setScale(this.responsiveScale);
      const frac = this.player.getData("xFrac");
      if (typeof frac === "number") this.player.x = w * frac;
    }

    if (this.platforms) {
      this.platforms.getChildren().forEach((c: any) => {
        if (c.active) {
          c.setScale(this.responsiveScale);
          const frac = c.getData("xFrac");
          if (typeof frac === "number") c.x = w * frac;
        }
      });
    }
    if (this.coinGroup) {
      this.coinGroup.getChildren().forEach((c: any) => {
        if (c.active) {
          c.setScale(this.responsiveScale * 0.14);
          const frac = c.getData("xFrac");
          if (typeof frac === "number") c.x = w * frac;
        }
      });
    }

    this.domRebuild();
  }

  spawnPlatform(x: number, y: number) {
    const plat = this.platforms.create(
      x,
      y,
      this.tx("platform_hay"),
    ) as Phaser.Physics.Arcade.Sprite;
    plat.setData("xFrac", x / this.scale.width);
    plat.setScale(this.responsiveScale);
    plat.setDepth(4);
    if (plat.body) {
      (plat.body as any).checkCollision.down = false;
      (plat.body as any).checkCollision.left = false;
      (plat.body as any).checkCollision.right = false;
    }
    this.attachDom(plat, "platform_hay");

    const coinCount = Phaser.Math.Between(1, 2);
    for (let i = 0; i < coinCount; i++) {
      const offsetX = (i - (coinCount - 1) / 2) * 18 + (Math.random() - 0.5) * 8;
      const coinX = x + offsetX;
      const coin = this.coinGroup.create(
        coinX,
        y - Math.round(42 * this.responsiveScale),
        this.tx("coin"),
      ) as Phaser.Physics.Arcade.Sprite;
      coin.setData("xFrac", coinX / this.scale.width);
      coin.setScale(this.responsiveScale * 0.14);
      coin.setDepth(6);
      this.attachDom(coin, "coin", 32, 32);
      this.tweens.add({ 
        targets: coin,
        y: coin.y - 8,
        duration: 850 + Math.random() * 350,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }

    if (Math.random() < 0.8) {
      this.spawnFloatingCoins(y);
    }
  }

  private spawnFloatingCoins(nearY: number) {
    const w = this.scale.width;
    const count = Phaser.Math.Between(2, 4);
    for (let i = 0; i < count; i++) {
      const fx = Phaser.Math.Between(w * 0.1, w * 0.9);
      const fy = nearY + Phaser.Math.Between(30, 100);
      const coin = this.coinGroup.create(
        fx,
        fy,
        this.tx("coin"),
      ) as Phaser.Physics.Arcade.Sprite;
      coin.setData("xFrac", fx / this.scale.width);
      coin.setScale(this.responsiveScale * 0.14);
      coin.setDepth(6);
      this.attachDom(coin, "coin", 32, 32);
      this.tweens.add({
        targets: coin,
        y: coin.y - 12,
        duration: 1000 + Math.random() * 500,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }
  }

  endBonus() {
    if (this.isEnded) return;
    this.isEnded = true;
    // Commit any un-pushed score
    if (this.score !== this.lastCommittedScore) {
      useGameStore.getState().setScore(this.score);
    }
    if (this.timerEvent) this.timerEvent.remove(false);

    soundManager.playWoosh();
    this.physics.pause();

    useGameStore.getState().setUiState("resuming");

    const domEl = document.getElementById("bonus-dom-layer");
    if (domEl) {
      domEl.style.opacity = "0";
      domEl.style.transition = "opacity 0.5s ease-in-out";
    }

    this.time.delayedCall(500, () => {
      const mainGame = this.scene.get(
        mapManager.getCurrentConfig().sceneKey,
      ) as any;
      if (mainGame) mainGame.isBarnTriggered = false;
      this.scene.stop("BonusScene");
      this.scene.wake(mapManager.getCurrentConfig().sceneKey);
    });
  }

  update() {
    if (this.isEnded) return;
    if (!useGameStore.getState().isBonusStarted) return;

    const cam = this.cameras.main;
    const camScrollY = cam.scrollY;
    const w = this.scale.width;
    const h = this._starH || this.scale.height;

    if (this.bgSprite) {
      this.bgSprite.tilePositionY = (camScrollY * 0.5) / this.bgSprite.tileScaleY;
    }

    // Star parallax — use index-based loop, compute in place
    const stars = this.stars;
    for (let i = 0; i < stars.length; i++) {
      const star = stars[i];
      const baseYFrac = star.getData("baseYFrac") as number;
      const parallaxY = baseYFrac * h - camScrollY * 0.35;
      star.y = ((parallaxY % h) + h) % h;
    }

    const px = this.player.x;
    if (px < -24) {
      this.player.x = w + 24;
      this.player.setData("xFrac", this.player.x / w);
    } else if (px > w + 24) {
      this.player.x = -24;
      this.player.setData("xFrac", this.player.x / w);
    }

    if (this.player.y < this.highestY) {
      this.score += Math.floor(this.highestY - this.player.y);
      this.highestY = this.player.y;
      if (this.score - this.lastCommittedScore >= 10) {
        useGameStore.getState().setScore(this.score);
        this.lastCommittedScore = this.score;
      }
    }

    const targetScrollY = this.highestY - h * 0.3;
    if (camScrollY > targetScrollY) cam.scrollY = targetScrollY;

    this.dom.parallax(0);
    this.domRebuild();

    if (this.player.y > cam.scrollY + h + 120) {
      this.endBonus();
      return;
    }

    const cullThreshold = cam.scrollY + h + 300;
    const minY = cam.scrollY;
    let highestPlatY = minY + h;

    const platChildren = this.platforms.getChildren();
    for (let i = platChildren.length - 1; i >= 0; i--) {
      const c = platChildren[i] as any;
      if (c.y < highestPlatY) highestPlatY = c.y;
      if (c.y > cullThreshold) c.destroy();
    }
    const coinChildren = this.coinGroup.getChildren();
    for (let i = coinChildren.length - 1; i >= 0; i--) {
      const c = coinChildren[i] as any;
      if (c.y > cullThreshold) c.destroy();
    }

    if (highestPlatY > minY - 300) {
      this.spawnPlatform(
        Phaser.Math.Between(w * 0.12, w * 0.88),
        highestPlatY - Phaser.Math.Between(130, 165),
      );
    }
  }
}
