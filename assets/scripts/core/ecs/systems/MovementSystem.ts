import { queries } from "../world";

export class MovementSystem {
  public update(dt: number): void {
    for (const entity of queries.falling) {
      const { position, velocity, node } = entity;
      if (!velocity) {
        continue;
      }

      position.x += velocity.x * dt;
      position.y += velocity.y * dt;

      node.setPosition(position);
    }
  }
}
