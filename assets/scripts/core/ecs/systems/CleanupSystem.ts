import { world, queries } from "../world";

export class CleanupSystem {
  public update(): void {
    for (const entity of queries.falling) {
      const { position, destroyWhenBelowY, node } = entity;

      if (destroyWhenBelowY !== undefined && position.y < destroyWhenBelowY) {
        if (node.isValid) {
          node.destroy();
        }
        world.remove(entity);
      }
    }
  }
}
