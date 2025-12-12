import { AudioClip, AudioSource, Component } from "cc";

interface SoundOptions {
  catchClip?: AudioClip | null;
  hazardClip?: AudioClip | null;
  backgroundClip?: AudioClip | null;
}

export class SoundSystem {
  private readonly _owner: Component;
  private _sfxSource: AudioSource | null = null;
  private readonly _options: SoundOptions;
  private _bgmSource: AudioSource | null = null;
  private _bgmStarted = false;

  constructor(owner: Component, options: SoundOptions = {}) {
    this._owner = owner;
    this._options = options;
    this.configureBackground(options.backgroundClip ?? null);
  }

  public update(): void {
    // Reserved for future pooling or queued sounds
  }

  public playCatch(): void {
    if (!this._options.catchClip) {
      return;
    }

    this.ensureSource();
    this._sfxSource?.playOneShot(this._options.catchClip);
  }

  public playHazard(): void {
    if (!this._options.hazardClip) {
      return;
    }

    this.ensureSource();
    this._sfxSource?.playOneShot(this._options.hazardClip);
  }

  private ensureSource(): void {
    if (this._sfxSource && this._sfxSource.isValid) {
      return;
    }

    this._sfxSource = this._owner.getComponent(AudioSource) ?? this._owner.addComponent(AudioSource);
  }

  public configureBackground(clip: AudioClip | null): void {
    this._bgmStarted = false;

    if (!clip) {
      this._bgmSource = null;
      return;
    }

    this._bgmSource = this._bgmSource && this._bgmSource.isValid
      ? this._bgmSource
      : this._owner.getComponent(AudioSource) ?? this._owner.addComponent(AudioSource);

    if (!this._bgmSource) {
      return;
    }

    this._bgmSource.clip = clip;
    this._bgmSource.loop = true;
  }

  public startBackgroundIfNeeded(): void {
    if (this._bgmStarted || !this._bgmSource) {
      return;
    }

    this._bgmSource.play();
    this._bgmStarted = true;
  }

  public stopBackground(): void {
    if (this._bgmSource) {
      this._bgmSource.stop();
    }

    this._bgmStarted = false;
  }
}
