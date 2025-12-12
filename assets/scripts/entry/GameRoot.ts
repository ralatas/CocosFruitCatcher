import {
  _decorator,
  Component,
  Node,
  Prefab,
  Label,
  UITransform,
  EventMouse,
  EventTouch,
  Vec3,
  instantiate
} from "cc";
import { world } from "../core/ecs/world";
import { GameState } from "../core/game/GameState";
import { DefaultGameConfig } from "../core/game/GameConfig";
import { FruitKind, Entity } from "../core/ecs/components";
import { BasketControlSystem } from "../core/ecs/systems/BasketControlSystem";
import { MovementSystem } from "../core/ecs/systems/MovementSystem";
import { TrajectorySystem } from "../core/ecs/systems/TrajectorySystem";
import { SpawnSystem } from "../core/ecs/systems/SpawnSystem";
import { CollisionSystem } from "../core/ecs/systems/CollisionSystem";
import { CleanupSystem } from "../core/ecs/systems/CleanupSystem";
import { TimerSystem } from "../core/ecs/systems/TimerSystem";

const { ccclass, property } = _decorator;

@ccclass("GameRoot")
export class GameRoot extends Component {
  @property(Node)
  public canvas: Node | null = null;

  @property(Prefab)
  public basketPrefab: Prefab | null = null;

  @property(Prefab)
  public applePrefab: Prefab | null = null;

  @property(Prefab)
  public bananaPrefab: Prefab | null = null;

  @property(Prefab)
  public orangePrefab: Prefab | null = null;

  @property(Prefab)
  public hazardPrefab: Prefab | null = null;

  @property(Label)
  public scoreLabel: Label | null = null;

  @property(Label)
  public timerLabel: Label | null = null;

  @property(Label)
  public livesLabel: Label | null = null;

  private _gameState!: GameState;

  private _basketSystem!: BasketControlSystem;
  private _movementSystem!: MovementSystem;
  private _trajectorySystem!: TrajectorySystem;
  private _spawnSystem!: SpawnSystem;
  private _collisionSystem!: CollisionSystem;
  private _cleanupSystem!: CleanupSystem;
  private _timerSystem!: TimerSystem;

  public onLoad(): void {
    this._gameState = new GameState(DefaultGameConfig);

    if (this.scoreLabel) {
      this.scoreLabel.string = "Score: 0";
    }

    if (this.livesLabel) {
      this.livesLabel.string = `Lives: ${this._gameState.lives}`;
    }

    if (this.timerLabel) {
      this.timerLabel.string = `Time: ${this._gameState.timeLeft}`;
    }

    this._gameState.onScoreChanged = (score) => {
      if (this.scoreLabel) {
        this.scoreLabel.string = `Score: ${score}`;
      }
    };

    this._gameState.onLivesChanged = (lives) => {
      if (this.livesLabel) {
        this.livesLabel.string = `Lives: ${lives}`;
      }
    };

    this._gameState.onTimeChanged = (timeLeft) => {
      if (this.timerLabel) {
        this.timerLabel.string = `Time: ${Math.ceil(timeLeft)}`;
      }
    };

    this._gameState.onGameOver = () => {
      // TODO: показать UI Game Over
    };

    this._basketSystem = new BasketControlSystem();
    this._movementSystem = new MovementSystem();
    this._trajectorySystem = new TrajectorySystem();

    if (!this.canvas || !this.hazardPrefab || !this.applePrefab || !this.basketPrefab) {
      console.error("[GameRoot] Canvas, basketPrefab, applePrefab или hazardPrefab не заданы");
      return;
    }

    this._spawnSystem = new SpawnSystem(this._gameState, {
      fruitPrefabs: {
        [FruitKind.Apple]: this.applePrefab,
        [FruitKind.Banana]: this.bananaPrefab ?? this.applePrefab,
        [FruitKind.Orange]: this.orangePrefab ?? this.applePrefab
      },
      hazardPrefab: this.hazardPrefab,
      canvasNode: this.canvas
    });

    this._collisionSystem = new CollisionSystem(this._gameState);
    this._cleanupSystem = new CleanupSystem();
    this._timerSystem = new TimerSystem(this._gameState);

    this.spawnBasket();
    this.registerInput();
  }

  public update(dt: number): void {
    if (this._gameState.isGameOver) {
      return;
    }

    this._spawnSystem.update(dt);
    this._timerSystem.update(dt);
    this._trajectorySystem.update(dt);
    this._movementSystem.update(dt);
    this._collisionSystem.update();
    this._cleanupSystem.update();
    this._basketSystem.update(dt);
  }

  private spawnBasket(): void {
    if (!this.canvas || !this.basketPrefab) {
      return;
    }

    const inst = instantiate(this.basketPrefab);
    inst.setParent(this.canvas);

    const canvasTransform = this.canvas.getComponent(UITransform);
    const height = canvasTransform ? canvasTransform.height : 1280;
    const y = -height / 2 + 80;

    const position = new Vec3(0, y, 0);
    inst.setPosition(position);

    const entity: Entity = {
      node: inst,
      position,
      basket: {
        halfWidth: 80
      }
    };

    world.add(entity);
  }

  private registerInput(): void {
    if (!this.canvas) {
      return;
    }

    this.canvas.on(Node.EventType.MOUSE_MOVE, (event: EventMouse) => {
      const uiTransform = this.canvas!.getComponent(UITransform);

      if (!uiTransform) {
        return;
      }

      const location = event.getUILocation();
      const localPos = uiTransform.convertToNodeSpaceAR(new Vec3(location.x, location.y, 0));
      this._basketSystem.setTargetX(localPos.x);
    }, this);

    this.canvas.on(Node.EventType.TOUCH_MOVE, (event: EventTouch) => {
      const uiTransform = this.canvas!.getComponent(UITransform);

      if (!uiTransform) {
        return;
      }

      const location = event.getUILocation();
      const localPos = uiTransform.convertToNodeSpaceAR(new Vec3(location.x, location.y, 0));
      this._basketSystem.setTargetX(localPos.x);
    }, this);
  }
}
