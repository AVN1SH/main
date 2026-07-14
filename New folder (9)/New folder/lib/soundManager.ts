import { Howl, Howler } from "howler";

type SoundKey =
  | "jump"
  | "hayJump"
  | "woodJump"
  | "damage"
  | "die"
  | "collectedBalloon"
  | "woosh"
  | "collect"
  | "collect2"
  | "click"
  | "cancel"
  | "newHighScore"
  | "unlock";

const DEFAULT_SOUND_VOLUMES: Record<SoundKey, number> = {
  jump: 1,
  hayJump: 1,
  woodJump: 1,
  damage: 3,
  die: 3,
  collectedBalloon: 1,
  woosh: 1,
  collect: 1,
  collect2: 1,
  click: 1,
  cancel: 2,
  newHighScore: 2,
  unlock: 1,
};

const DEFAULT_BGM_URL = "./sounds/bgm.mp3";

class SoundManager {
  private bgm: Howl | null = null;
  private _bgmUrl = "";
  private sounds: Map<SoundKey, Howl> = new Map();
  private _musicVolume = 0.4;
  private _sfxVolume = 0.7;
  private soundVolumes: Map<SoundKey, number> = new Map();
  private _initialized = false;

  get musicVolume() {
    return this._musicVolume;
  }
  get sfxVolume() {
    return this._sfxVolume;
  }

  setMusicVolume(v: number) {
    this._musicVolume = Math.max(0, Math.min(1, v));
    if (this.bgm) this.bgm.volume(this._musicVolume);
  }

  setSfxVolume(v: number) {
    this._sfxVolume = Math.max(0, Math.min(1, v));
    this.sounds.forEach((s, key) => {
      s.volume(this._sfxVolume * (this.soundVolumes.get(key) ?? 1));
    });
  }

  setSoundVolume(key: SoundKey, v: number) {
    v = Math.max(0, Math.min(1, v));
    this.soundVolumes.set(key, v);
    const s = this.sounds.get(key);
    if (s) s.volume(this._sfxVolume * v);
  }

  getSoundVolume(key: SoundKey): number {
    return this.soundVolumes.get(key) ?? 1;
  }

  init() {
    if (this._initialized) return;
    this._initialized = true;

    // Record the URL of the default bgm we're about to create so that
    // switchBgm() can correctly recognize "same track already playing"
    // the very first time it's called (e.g. selecting map-1, whose
    // music is this same default file) instead of tearing it down and
    // restarting it from position 0.
    this._bgmUrl = DEFAULT_BGM_URL;
    this.bgm = new Howl({
      src: [DEFAULT_BGM_URL],
      loop: true,
      volume: 0,
    });

    const defs: [SoundKey, string][] = [
      ["jump", "./sounds/jump.ogg"],
      ["hayJump", "./sounds/hay-jump.ogg"],
      ["woodJump", "./sounds/wood-jump.ogg"],
      ["damage", "./sounds/damage.mp3"],
      ["die", "./sounds/died.wav"],
      ["collectedBalloon", "./sounds/collected-balloon.ogg"],
      ["woosh", "./sounds/woosh.wav"],
      ["collect", "./sounds/collectables.wav"],
      ["collect2", "./sounds/collectables2.wav"],
      ["click", "./sounds/click.wav"],
      ["cancel", "./sounds/cancel.wav"],
      ["newHighScore", "./sounds/new-highscore.wav"],
      ["unlock", "./sounds/unlock.mp3"],
    ];

    for (const [key, src] of defs) {
      const perSoundVol =
        this.soundVolumes.get(key) ?? DEFAULT_SOUND_VOLUMES[key];
      this.soundVolumes.set(key, perSoundVol);
      this.sounds.set(
        key,
        new Howl({
          src: [src],
          volume: this._sfxVolume * perSoundVol,
        }),
      );
    }
  }

  private musicEnabled(): boolean {
    try {
      const s = JSON.parse(
        localStorage.getItem("whirly_settings") || '{"music":true,"sfx":true}',
      );
      return s.music !== false;
    } catch {
      return true;
    }
  }

  private sfxEnabled(): boolean {
    try {
      const s = JSON.parse(
        localStorage.getItem("whirly_settings") || '{"music":true,"sfx":true}',
      );
      return s.sfx !== false;
    } catch {
      return true;
    }
  }

  startBgm(url?: string) {
    if (!this.musicEnabled()) return;
    this.resumeContext();
    if (url && url !== this._bgmUrl) {
      this.switchBgm(url);
      return;
    }
    if (!this.bgm) return;
    if (this.bgm.playing()) return;
    this.bgm.play();
    this.bgm.fade(0, this._musicVolume, 1000);
  }

  resumeContext() {
    if (Howler.ctx && Howler.ctx.state === "suspended") {
      Howler.ctx.resume();
    }
  }

  switchBgm(url: string, force = false) {
    if (!this.musicEnabled()) return;
    this.resumeContext();
    if (!force && url === this._bgmUrl && this.bgm) return;
    this._bgmUrl = url;

    const prevBgm = this.bgm;
    this.bgm = null;

    if (prevBgm) {
      prevBgm.fade(this._musicVolume, 0, 500);
      setTimeout(() => {
        prevBgm.stop();
        prevBgm.unload();
      }, 600);
    }

    this.bgm = new Howl({
      src: [url],
      loop: true,
      volume: 0,
    });

    if (this.bgm.state() === "loaded") {
      this.bgm.play();
      this.bgm.fade(0, this._musicVolume, 500);
    } else {
      this.bgm.once("load", () => {
        if (this.bgm) {
          this.bgm.play();
          this.bgm.fade(0, this._musicVolume, 500);
        }
      });
    }
  }

  stopBgm() {
    this.bgm?.stop();
  }

  pauseBgm() {
    this.bgm?.pause();
  }

  resumeBgm() {
    if (!this.bgm || !this.musicEnabled()) return;
    if (!this.bgm.playing()) {
      this.bgm.play();
    }
  }

  reduceBgmVolume() {
    this.bgm?.fade(this._musicVolume, this._musicVolume * 0.3, 500);
  }

  restoreBgmVolume() {
    if (!this.bgm || !this.musicEnabled()) return;
    this.bgm.fade(this._bgmCurrentVolume(), this._musicVolume, 500);
  }

  private _bgmCurrentVolume(): number {
    return this.bgm?.volume() ?? this._musicVolume;
  }

  private play(key: SoundKey) {
    if (!this.sfxEnabled()) return;
    const s = this.sounds.get(key);
    if (s) s.play();
  }

  playJump() {
    this.play("jump");
  }
  playHayJump() {
    this.play("hayJump");
  }
  playWoodJump() {
    this.play("woodJump");
  }
  playDamage() {
    this.play("damage");
  }
  playDie() {
    this.play("die");
  }
  playCollectedBalloon() {
    this.play("collectedBalloon");
  }
  playWoosh() {
    this.play("woosh");
  }
  playCollect() {
    this.play("collect");
  }
  playCollect2() {
    this.play("collect2");
  }
  playClick() {
    this.play("click");
  }
  playCancel() {
    this.play("cancel");
  }
  playNewHighScore() {
    this.play("newHighScore");
  }
  playUnlock() {
    this.play("unlock");
  }
}

export type { SoundKey };
export { DEFAULT_SOUND_VOLUMES };
export const soundManager = new SoundManager();
