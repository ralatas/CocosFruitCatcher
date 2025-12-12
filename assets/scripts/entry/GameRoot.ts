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
  instantiate,
  AudioSource,
  AudioClip
} from "cc";
import { world } from "../core/ecs/world";
import { GameState, GameOverReason } from "../core/game/GameState";
import { DefaultGameConfig } from "../core/game/GameConfig";
import { FruitKind, Entity } from "../core/ecs/components";
import { BasketControlSystem } from "../core/ecs/systems/BasketControlSystem";
import { MovementSystem } from "../core/ecs/systems/MovementSystem";
import { TrajectorySystem } from "../core/ecs/systems/TrajectorySystem";
import { SpawnSystem } from "../core/ecs/systems/SpawnSystem";
import { CollisionSystem } from "../core/ecs/systems/CollisionSystem";
import { CleanupSystem } from "../core/ecs/systems/CleanupSystem";
import { TimerSystem } from "../core/ecs/systems/TimerSystem";
import { SoundSystem } from "../core/ecs/systems/SoundSystem";
import { GameOverUI } from "../ui/GameOverUI";

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

  @property(AudioClip)
  public backgroundMusic: AudioClip | null = null;

  @property(AudioClip)
  public catchSfx: AudioClip | null = null;

  @property(AudioClip)
  public hazardSfx: AudioClip | null = null;

  @property(GameOverUI)
  public gameOverUI: GameOverUI | null = null;

  private _gameState!: GameState;

  private _basketSystem!: BasketControlSystem;
  private _movementSystem!: MovementSystem;
  private _trajectorySystem!: TrajectorySystem;
  private _spawnSystem!: SpawnSystem;
  private _collisionSystem!: CollisionSystem;
  private _cleanupSystem!: CleanupSystem;
  private _timerSystem!: TimerSystem;
  private _bgmSource: AudioSource | null = null;
  private _bgmStarted = false;
  private _soundSystem!: SoundSystem;

  public onLoad(): void {
    world.clear();
    this._gameState = new GameState(DefaultGameConfig);

    if (this.scoreLabel) {
      this.scoreLabel.string = "Score: 0";
    }

    this.updateLivesLabel(this._gameState.lives);

    if (this.timerLabel) {
      this.timerLabel.string = `Time: ${this._gameState.timeLeft}`;
    }

    this._gameState.onScoreChanged = (score) => {
      if (this.scoreLabel) {
        this.scoreLabel.string = `Score: ${score}`;
      }
    };

    this._gameState.onLivesChanged = (lives) => {
      this.updateLivesLabel(lives);
    };

    this._gameState.onTimeChanged = (timeLeft) => {
      if (this.timerLabel) {
        this.timerLabel.string = `Time: ${Math.ceil(timeLeft)}`;
      }
    };

    this._gameState.onGameOver = (reason) => {
      this.showGameOverOverlay(reason);
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

    this._soundSystem = new SoundSystem(this, {
      catchClip: this.catchSfx,
      hazardClip: this.hazardSfx,
    });

    this._collisionSystem = new CollisionSystem(this._gameState, {
      onFruitCaught: () => this.playCatchSfx(),
      soundSystem: this._soundSystem,
    });
    this._cleanupSystem = new CleanupSystem();
    this._timerSystem = new TimerSystem(this._gameState);

    this.spawnBasket();
    this.registerInput();
    this.setupBackgroundMusic();
    this.gameOverUI?.init();
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

  public onDestroy(): void {
    if (this._bgmSource) {
      this._bgmSource.stop();
    }
  }

  private updateLivesLabel(lives: number): void {
    if (!this.livesLabel) {
      return;
    }

    this.livesLabel.string = `${this.formatLives(lives)}`;
  }

  private formatLives(lives: number): string {
    if (lives <= 0) {
      return "-";
    }

    return Array.from({ length: lives }, () => "♥").join(" ");
  }

  private setupBackgroundMusic(): void {
    if (!this.backgroundMusic) {
      return;
    }

    this._bgmSource = this.getComponent(AudioSource) ?? this.addComponent(AudioSource);

    if (!this._bgmSource) {
      return;
    }

    this._bgmSource.clip = this.backgroundMusic;
    this._bgmSource.loop = true;
  }

  private startBackgroundMusicIfNeeded(): void {
    if (this._bgmStarted || !this._bgmSource) {
      return;
    }

    this._bgmSource.play();
    this._bgmStarted = true;
  }

  private playCatchSfx(): void {
    this._soundSystem?.playCatch();
  }

  private showGameOverOverlay(reason: GameOverReason): void {
    this.gameOverUI?.show(reason, this._gameState.lives);
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
      this.startBackgroundMusicIfNeeded();
    }, this);

    this.canvas.on(Node.EventType.MOUSE_DOWN, () => {
      this.startBackgroundMusicIfNeeded();
    }, this);

    this.canvas.on(Node.EventType.TOUCH_MOVE, (event: EventTouch) => {
      const uiTransform = this.canvas!.getComponent(UITransform);

      if (!uiTransform) {
        return;
      }

      const location = event.getUILocation();
      const localPos = uiTransform.convertToNodeSpaceAR(new Vec3(location.x, location.y, 0));
      this._basketSystem.setTargetX(localPos.x);
      this.startBackgroundMusicIfNeeded();
    }, this);

    this.canvas.on(Node.EventType.TOUCH_START, () => {
      this.startBackgroundMusicIfNeeded();
    }, this);
  }
}
