import { Label } from "cc";

export class ScoreSystem {
  private readonly _label: Label | null;

  constructor(label: Label | null) {
    this._label = label;
  }

  public init(initialScore: number): void {
    this.setScore(initialScore);
  }

  public setScore(score: number): void {
    if (!this._label) {
      return;
    }

    this._label.string = this.formatScore(score);
  }

  private formatScore(score: number): string {
    return `Score: ${score}`;
  }
}
