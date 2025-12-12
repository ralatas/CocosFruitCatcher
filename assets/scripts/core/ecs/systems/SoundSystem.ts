import { AudioClip, AudioSource, Component } from "cc";

interface SoundOptions {
  catchClip?: AudioClip | null;
  hazardClip?: AudioClip | null;
}

export class SoundSystem {
  private readonly _owner: Component;
  private _sfxSource: AudioSource | null = null;
  private readonly _options: SoundOptions;

  constructor(owner: Component, options: SoundOptions = {}) {
    this._owner = owner;
    this._options = options;
  }

  public update(): void {
    // no-op for now; reserved for future pooling or queued sounds
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
}
