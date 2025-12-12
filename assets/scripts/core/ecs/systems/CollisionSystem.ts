import { tween, Vec3, Node } from "cc";
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
        world.remove(entity);
        this.playFruitCatchAnimation(node, new Vec3(basketX, catchY, 0));
        continue;
      }

      if (hazard) {
        this._gameState.applyDamage(hazard.damage);
      }

      world.remove(entity);
      node.destroy();
    }
  }

  private playFruitCatchAnimation(node: Node, targetPosition: Vec3): void {
    const originalScale = node.getScale();
    const popScale = new Vec3(originalScale.x * 1.15, originalScale.y * 1.15, originalScale.z);
    const shrinkScale = new Vec3(originalScale.x * 0.1, originalScale.y * 0.1, originalScale.z);
    const finalPosition = targetPosition.clone();

    tween(node)
      .to(0.08, { scale: popScale })
      .to(0.18, { position: finalPosition, scale: shrinkScale })
      .call(() => node.destroy())
      .start();
  }
}
