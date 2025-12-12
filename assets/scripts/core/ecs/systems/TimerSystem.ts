import type { GameState } from "../../game/GameState";

export class TimerSystem {
  private readonly _gameState: GameState;

  constructor(gameState: GameState) {
    this._gameState = gameState;
  }

  public update(dt: number): void {
    this._gameState.tickTime(dt);
  }
}
