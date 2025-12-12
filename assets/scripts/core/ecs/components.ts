import { Node, Vec3 } from "cc";

export enum FruitKind {
  Apple = "apple",
  Banana = "banana",
  Orange = "orange",
}

export enum TrajectoryKind {
  Linear = "linear",
  Zigzag = "zigzag",
  Accelerated = "accelerated",
}

export interface Position {
  position: Vec3;
}

export interface Velocity {
  velocity: Vec3;
}

export interface ViewNode {
  node: Node;
}

export interface Fruit {
  fruit: {
    kind: FruitKind;
    score: number;
  };
}

export interface Hazard {
  hazard: {
    damage: number;
  };
}

export interface Basket {
  basket: {
    halfWidth: number;
  };
}

export interface Trajectory {
  trajectory: {
    kind: TrajectoryKind;
    amplitude?: number;
    frequency?: number;
    acceleration?: number;
  };
}

export interface Lifetime {
  lifetime: {
    value: number;
  };
}

export interface DestroyWhenBelow {
  destroyWhenBelowY: number;
}

export type Entity =
  & ViewNode
  & Position
  & Partial<Velocity>
  & Partial<Fruit>
  & Partial<Hazard>
  & Partial<Basket>
  & Partial<Trajectory>
  & Partial<Lifetime>
  & Partial<DestroyWhenBelow>;
