import { instantiate, Prefab, UITransform, Vec3, math, Node } from "cc";
import { world } from "../world";
import type { Entity } from "../components";
import { FruitKind, TrajectoryKind } from "../components";
import type { GameState } from "../../game/GameState";

interface SpawnConfig {
  fruitPrefabs: Record<FruitKind, Prefab>;
  hazardPrefab: Prefab;
  canvasNode: Node;
}

export class SpawnSystem {
  private readonly _gameState: GameState;
  private readonly _config: SpawnConfig;

  private _timer = 0;
  private _interval = 0.8;

  constructor(gameState: GameState, config: SpawnConfig) {
    this._gameState = gameState;
    this._config = config;
  }

  public update(dt: number): void {
    if (this._gameState.isGameOver) {
      return;
    }

    this._timer += dt;

    if (this._timer >= this._interval) {
      this._timer = 0;
      this.spawnRandomDrop();
    }
  }

  private spawnRandomDrop(): void {
    const canvasTransform = this._config.canvasNode.getComponent(UITransform);

    if (!canvasTransform) {
      return;
    }

    const width = canvasTransform.width;
    const height = canvasTransform.height;

    const x = math.randomRange(-width / 2 + 50, width / 2 - 50);
    const y = height / 2 + 80;

    const isHazard = Math.random() < 0.15;

    if (isHazard) {
      this.spawnHazard(x, y);
    } else {
      this.spawnFruit(x, y);
    }
  }

  private spawnFruit(x: number, y: number): void {
    const kind = this.pickRandomFruitKind();
    const prefab = this._config.fruitPrefabs[kind];

    if (!prefab) {
      return;
    }

    const node = instantiate(prefab);
    node.setParent(this._config.canvasNode);

    const position = new Vec3(x, y, 0);
    node.setPosition(position);

    const canvasTransform = this._config.canvasNode.getComponent(UITransform);
    const canvasHeight = canvasTransform ? canvasTransform.height : 1280;

    const entity: Entity = {
      node,
      position,
      velocity: new Vec3(0, -300, 0),
      fruit: {
        kind,
        score: this.scoreFor(kind)
      },
      trajectory: this.randomTrajectory(),
      lifetime: { value: 0 },
      destroyWhenBelowY: -canvasHeight / 2 
    };

    world.add(entity);
  }

  private spawnHazard(x: number, y: number): void {
    const node = instantiate(this._config.hazardPrefab);
    node.setParent(this._config.canvasNode);

    const position = new Vec3(x, y, 0);
    node.setPosition(position);

    const canvasTransform = this._config.canvasNode.getComponent(UITransform);
    const canvasHeight = canvasTransform ? canvasTransform.height : 1280;

    const entity: Entity = {
      node,
      position,
      velocity: new Vec3(0, -280, 0),
      hazard: {
        damage: this._gameState.config.hazardDamage
      },
      trajectory: { kind: TrajectoryKind.Linear },
      lifetime: { value: 0 },
      destroyWhenBelowY: -canvasHeight / 2 
    };

    world.add(entity);
  }

  private pickRandomFruitKind(): FruitKind {
    const values: FruitKind[] = [FruitKind.Apple, FruitKind.Banana, FruitKind.Orange];
    const index = Math.floor(Math.random() * values.length);
    return values[index];
  }

  private scoreFor(kind: FruitKind): number {
    switch (kind) {
      case FruitKind.Apple:
        return 10;
      case FruitKind.Banana:
        return 15;
      case FruitKind.Orange:
        return 20;
      default:
        return 5;
    }
  }

  private randomTrajectory() {
    const r = Math.random();

    if (r < 0.4) {
      return { kind: TrajectoryKind.Linear };
    }

    if (r < 0.8) {
      return { kind: TrajectoryKind.Zigzag, amplitude: 120, frequency: 3 };
    }

    return { kind: TrajectoryKind.Accelerated, acceleration: -700 };
  }
}
