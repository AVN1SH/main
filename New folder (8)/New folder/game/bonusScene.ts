import Phaser from "phaser";
import { useGameStore } from "@/lib/gameStore";
import { Storage } from "@/lib/storage";
import { soundManager } from "@/lib/soundManager";
import { DomLayer } from "@/game/dom";

export class BonusScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private platforms!: Phaser.Physics.Arcade.Group;
  private coinGroup!: Phaser.Physics.Arcade.Group;
  private dom = new DomLayer("bonus-dom-layer", false); // own layer, no bg
  private isEnded = false;
  private timeLeft = 10;
  private timerEvent!: Phaser.Time.TimerEvent;
  private highestY = 0;
  private responsiveScale = 1;
  private score = 0;
  private bgSprite!: Phaser.GameObjects.TileSprite;
  private bgDark!: Phaser.GameObjects.Graphics;
  private stars: Phaser.GameObjects.Arc[] = [];

  constructor() {
    super("BonusScene");
  }

  init(data: { score: number }) {
    this.score = data?.score ?? useGameStore.getState().score;
    this.isEnded = false;
    this.timeLeft = 10;
    useGameStore.getState().setIsBonusStarted(false);
    this.timeLeft = 10;
  }

  private computeResponsiveScale(width: number): number {
    return Math.round(Phaser.Math.Clamp(width / 820, 0.62, 1) * 100) / 100;
  }

  private attachDom(
    obj: Phaser.GameObjects.GameObject,
    key: string,
    customW?: number,
    customH?: number,
  ) {
    const s = obj as any;
    const el = this.dom.addSprite(key, s.x, s.y, customW, customH, true);
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
    each(this.platforms.getChildren());
    each(this.coinGroup.getChildren());
  }

  create() {
    const w = this.scale.width;
    const h = this.scale.height;
    this.responsiveScale = this.computeResponsiveScale(w);

    this.dom.init();
    this.dom.setScaleFactor(this.responsiveScale);

    // ── Dark background (original theme background with darker overlay) ──
    // Create as a TileSprite so we can scroll it like in the main game
    this.bgSprite = this.add.tileSprite(w / 2, h / 2, w, h, "bg_tall").setScrollFactor(0).setDepth(0);
    const texture = this.textures.get("bg_tall").getSourceImage();
    const scaleX = w / (texture.width || w);
    this.bgSprite.tileScaleX = scaleX;
    this.bgSprite.tileScaleY = scaleX; // Keep aspect ratio consistent
    
    // Add a dark semi-transparent layer over the background
    this.bgDark = this.add.graphics().setScrollFactor(0).setDepth(0);
    this.bgDark.fillStyle(0x000010, 0.6); // 60% opacity dark overlay
    this.bgDark.fillRect(0, 0, w, h);

    // Twinkling stars
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

    // ── Physics groups ──
    this.platforms = this.physics.add.group({
      immovable: true,
      allowGravity: false,
    });
    this.coinGroup = this.physics.add.group({
      immovable: true,
      allowGravity: false,
    });

    // ── Spawn initial platforms ──
    for (let i = 0; i < 14; i++) {
      this.spawnPlatform(
        w / 2 + (Math.random() - 0.5) * w * 0.75,
        h - 80 - i * 155,
      );
    }

    // ── Player ──
    this.player = this.physics.add.sprite(w / 2, h - 60, "player");
    this.player.setData("xFrac", 0.5);
    this.player.setScale(this.responsiveScale);
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(false);
    this.player.setVelocityY(-750);
    soundManager.playJump();
    this.player.setDepth(8);
    this.highestY = this.player.y;
    this.attachDom(this.player, "player");

    // ── Colliders ──
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
          // Hay falls after being jumped on — fun mechanic
          if (plat.body) (plat.body as any).allowGravity = true;
        }
      },
      // process callback: only collide when falling downward onto the top
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
        // Session counter
        const nc = useGameStore.getState().coins + 10;
        useGameStore.getState().setCoins(nc);
        // Cumulative total in storage (lobby shows this)
        Storage.setCoins(Storage.getCoins() + 10);
        this.score += 150;
        useGameStore.getState().setScore(this.score);
        soundManager.playCollect2();
        // Canvas feedback text
        const sy = this.cameras.main.scrollY || 0;
        const txt = this.add
          .text(cx, cy - sy, "+10", {
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

    // ── Drag/swipe control ──
    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      if (pointer.isDown && !this.isEnded && this.player?.active) {
        this.player.x += (pointer.x - pointer.prevPosition.x) * 1.3;
        this.player.setData("xFrac", this.player.x / this.scale.width);
      }
    });

    this.cameras.main.scrollY = this.highestY - h * 0.3;
    this.domRebuild();

    // ── Countdown ──
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

    // ── Smooth DOM Fade-In ──
    // Hide platforms/character initially, fade them in when UI intro finishes
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
      const texture = this.textures.get("bg_tall").getSourceImage();
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
      "platform_hay",
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

    // Every platform in the bonus round gets a coin hovering above it
    const coinX = x + (Math.random() - 0.5) * 28;
    const coin = this.coinGroup.create(
      coinX,
      y - Math.round(42 * this.responsiveScale),
      "coin",
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

  endBonus() {
    if (this.isEnded) return;
    this.isEnded = true;
    if (this.timerEvent) this.timerEvent.remove(false);

    soundManager.playWoosh();
    this.physics.pause();

    // Trigger UI state to resuming, so GameUI's AnimatePresence starts exiting BonusUI and ResumingUI enters
    useGameStore.getState().setUiState("resuming");

    // Fade out DOM objects in BonusScene
    const domEl = document.getElementById("bonus-dom-layer");
    if (domEl) {
      domEl.style.opacity = "0";
      domEl.style.transition = "opacity 0.5s ease-in-out";
    }

    // Delay actual Phaser scene switch by 500ms to allow exit animations to complete
    this.time.delayedCall(500, () => {
      const mainGame = this.scene.get("MainGame") as any;
      if (mainGame) mainGame.isBarnTriggered = false;
      this.scene.stop("BonusScene");
      this.scene.wake("MainGame");
    });
  }

  update() {
    if (this.isEnded) return;

    if (!useGameStore.getState().isBonusStarted) return;

    const w = this.scale.width;
    const h = this.scale.height;

    if (this.bgSprite) {
      // Scroll background vertically at 0.5x speed (parallax effect)
      this.bgSprite.tilePositionY = (this.cameras.main.scrollY * 0.5) / this.bgSprite.tileScaleY;
    }
    
    // Parallax stars (slower than background to create depth)
    this.stars.forEach((star) => {
      const baseYFrac = star.getData("baseYFrac");
      // 0.15 parallax factor makes stars appear further away than the background (0.5)
      const parallaxY = (baseYFrac * h) - (this.cameras.main.scrollY * 0.35);
      star.y = ((parallaxY % h) + h) % h;
    });

    // Wrap edges
    if (this.player.x < -24) {
      this.player.x = w + 24;
      this.player.setData("xFrac", this.player.x / w);
    } else if (this.player.x > w + 24) {
      this.player.x = -24;
      this.player.setData("xFrac", this.player.x / w);
    }

    // Score from height gained
    if (this.player.y < this.highestY) {
      this.score += Math.floor(this.highestY - this.player.y);
      this.highestY = this.player.y;
      useGameStore.getState().setScore(this.score);
    }

    // Camera follow
    const targetScrollY = this.highestY - h * 0.3;
    if (this.cameras.main.scrollY > targetScrollY) {
      this.cameras.main.scrollY = targetScrollY;
    }

    this.dom.parallax(0);
    this.domRebuild();

    // Fall detection
    if (this.player.y > this.cameras.main.scrollY + h + 120) {
      this.endBonus();
      return;
    }

    // Spawn new platforms as player climbs
    const minY = this.cameras.main.scrollY;
    let highestPlatY = minY + h;

    this.platforms.getChildren().forEach((c: any) => {
      if (c.y < highestPlatY) highestPlatY = c.y;
      if (c.y > minY + h + 300) c.destroy();
    });
    this.coinGroup.getChildren().forEach((c: any) => {
      if (c.y > minY + h + 300) c.destroy();
    });

    if (highestPlatY > minY - 300) {
      this.spawnPlatform(
        Phaser.Math.Between(w * 0.12, w * 0.88),
        highestPlatY - Phaser.Math.Between(130, 165),
      );
    }
  }
}
