import type { Entity } from "./components";

class Query<T extends object> implements Iterable<T> {
  constructor(
    private readonly _world: SimpleWorld<T>,
    private readonly _keys: (keyof T)[]
  ) {}

  public *[Symbol.iterator](): Iterator<T> {
    outer: for (const entity of this._world.entities) {
      for (const key of this._keys) {
        if (!(key in entity)) {
          continue outer;
        }
      }
      yield entity;
    }
  }
}

class SimpleWorld<T extends object> {
  public readonly entities: T[] = [];

  public add(entity: T): void {
    this.entities.push(entity);
  }

  public remove(entity: T): void {
    const index = this.entities.indexOf(entity);
    if (index !== -1) {
      this.entities.splice(index, 1);
    }
  }

  public clear(): void {
    this.entities.length = 0;
  }

  public with(...keys: (keyof T)[]): Query<T> {
    return new Query<T>(this, keys);
  }
}

export const world = new SimpleWorld<Entity>();

export const queries = {
  fruits: world.with("position", "node"),
  falling: world.with("position", "velocity", "node"),
  withTrajectory: world.with("trajectory", "position", "velocity", "lifetime"),
  basket: world.with("basket", "position", "node"),
};
