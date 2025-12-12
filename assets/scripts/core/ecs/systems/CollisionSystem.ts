import { tween, Vec3, Node, Label, UIOpacity, Color } from "cc";
import { world, queries } from "../world";
import type { GameState } from "../../game/GameState";
import type { SoundSystem } from "./SoundSystem";

export class CollisionSystem {
  private readonly _gameState: GameState;
  private readonly _onFruitCaught?: () => void;
  private readonly _soundSystem?: SoundSystem;

  constructor(
    gameState: GameState,
    options?: { onFruitCaught?: () => void; soundSystem?: SoundSystem }
  ) {
    this._gameState = gameState;
    this._onFruitCaught = options?.onFruitCaught;
    this._soundSystem = options?.soundSystem;
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
        this._onFruitCaught?.();
        this._soundSystem?.playCatch();
        this.spawnScorePopup(fruit.score, node.parent, new Vec3(position.x, catchY + 20, 0));
        this.playFruitCatchAnimation(node, new Vec3(basketX, catchY, 0));
        continue;
      }

      if (hazard) {
        this._gameState.applyDamage(hazard.damage);
        this._soundSystem?.playHazard();
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

  private spawnScorePopup(score: number, parent: Node | null, position: Vec3): void {
    if (!parent) {
      return;
    }

    const popup = new Node("ScorePopup");
    popup.layer = parent.layer;
    const label = popup.addComponent(Label);
    label.string = `+${score}`;
    label.color = Color.RED;
    label.fontSize = 32;
    label.lineHeight = 36;

    const opacity = popup.addComponent(UIOpacity);
    opacity.opacity = 255;

    popup.setPosition(position);
    parent.addChild(popup);

    const targetPos = position.clone().add(new Vec3(0, 80, 0));

    tween(popup)
      .parallel(
        tween().to(0.5, { position: targetPos }),
        tween(opacity).to(0.5, { opacity: 0 })
      )
      .call(() => popup.destroy())
      .start();
  }
}
