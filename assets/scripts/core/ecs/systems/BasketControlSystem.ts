import { Vec3, math } from "cc";
import { queries } from "../world";

export class BasketControlSystem {
  private readonly _temp = new Vec3();
  private _targetX = 0;

  public setTargetX(x: number): void {
    this._targetX = x;
  }

  public update(dt: number): void {
    for (const entity of queries.basket) {
      const { position, node } = entity;
      const current = this._temp.set(position);
      const lerpFactor = math.clamp01(dt * 10);
      const nextX = math.lerp(current.x, this._targetX, lerpFactor);

      position.x = nextX;
      node.setPosition(position);
    }
  }
}
