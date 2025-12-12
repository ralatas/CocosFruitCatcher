import { Label } from "cc";

export class LivesSystem {
  private readonly _label: Label | null;

  constructor(label: Label | null) {
    this._label = label;
  }

  public init(initialLives: number): void {
    this.setLives(initialLives);
  }

  public setLives(lives: number): void {
    if (!this._label) {
      return;
    }

    this._label.string = this.formatLives(lives);
  }

  private formatLives(lives: number): string {
    if (lives <= 0) {
      return "-";
    }

    return Array.from({ length: lives }, () => "♥").join(" ");
  }
}
