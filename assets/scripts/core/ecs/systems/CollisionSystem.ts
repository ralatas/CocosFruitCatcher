import { world, queries } from "../world";
import type { GameState } from "../../game/GameState";

export class CollisionSystem {
  private readonly _gameState: GameState;

  constructor(gameState: GameState) {
    this._gameState = gameState;
  }

  public update(): void {
    const baskets = Array.from(queries.basket);
    if (baskets.length === 0) {
      return;
    }

    const basket = baskets[0];
    const basketX = basket.position.x;
    const basketY = basket.position.y;
    const halfWidth = basket.basket!.halfWidth;
    const catchY = basketY + 40;

    for (const entity of queries.falling) {
      const { position, node, fruit, hazard } = entity as any;

      if (!node.isValid) {
        continue;
      }

      const isAtBasketHeight = position.y <= catchY;
      const isInsideX = position.x >= basketX - halfWidth && position.x <= basketX + halfWidth;

      if (!isAtBasketHeight || !isInsideX) {
        continue;
      }

      if (fruit) {
        this._gameState.addScore(fruit.score);
      }

      if (hazard) {
        this._gameState.applyDamage(hazard.damage);
      }

      node.destroy();
      world.remove(entity);
    }
  }
}
