import type { GameConfig } from "./GameConfig";

export type GameOverReason = "time_up" | "out_of_lives";

export class GameState {
  public readonly config: GameConfig;

  public score = 0;
  public lives: number;
  public timeLeft: number;
  public isGameOver = false;

  public onScoreChanged?: (score: number) => void;
  public onLivesChanged?: (lives: number) => void;
  public onTimeChanged?: (timeLeft: number) => void;
  public onGameOver?: (reason: GameOverReason) => void;

  constructor(config: GameConfig) {
    this.config = config;
    this.lives = config.initialLives;
    this.timeLeft = config.gameDurationSeconds;
  }

  public addScore(value: number): void {
    this.score += value;

    if (this.onScoreChanged) {
      this.onScoreChanged(this.score);
    }
  }

  public applyDamage(value: number): void {
    this.lives = Math.max(0, this.lives - value);

    if (this.onLivesChanged) {
      this.onLivesChanged(this.lives);
    }

    if (this.lives <= 0) {
      this.setGameOver("out_of_lives");
    }
  }

  public tickTime(deltaSeconds: number): void {
    if (this.isGameOver) {
      return;
    }

    this.timeLeft = Math.max(0, this.timeLeft - deltaSeconds);

    if (this.onTimeChanged) {
      this.onTimeChanged(this.timeLeft);
    }

    if (this.timeLeft <= 0) {
      this.setGameOver("time_up");
    }
  }

  private setGameOver(reason: GameOverReason): void {
    if (this.isGameOver) {
      return;
    }

    this.isGameOver = true;

    if (this.onGameOver) {
      this.onGameOver(reason);
    }
  }
}
