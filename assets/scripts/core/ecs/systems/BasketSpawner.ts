import { instantiate, Node, Prefab, UITransform, Vec3 } from "cc";
import type { Entity } from "../components";
import { world } from "../world";

export class BasketSpawner {
  private readonly _canvas: Node;
  private readonly _basketPrefab: Prefab;
  private readonly _halfWidth: number;

  constructor(canvas: Node, basketPrefab: Prefab, halfWidth = 80) {
    this._canvas = canvas;
    this._basketPrefab = basketPrefab;
    this._halfWidth = halfWidth;
  }

  public spawn(): Entity | null {
    const inst = instantiate(this._basketPrefab);
    inst.setParent(this._canvas);

    const canvasTransform = this._canvas.getComponent(UITransform);
    const height = canvasTransform ? canvasTransform.height : 1280;
    const y = -height / 2 + 80;

    const position = new Vec3(0, y, 0);
    inst.setPosition(position);

    const entity: Entity = {
      node: inst,
      position,
      basket: {
        halfWidth: this._halfWidth
      }
    };

    world.add(entity);
    return entity;
  }
}
