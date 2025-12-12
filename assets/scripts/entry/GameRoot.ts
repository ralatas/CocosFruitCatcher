import {
  _decorator,
  Component,
  Node,
  Prefab,
  Label,
  AudioClip
} from "cc";
import { world } from "../core/ecs/world";
import { GameState, GameOverReason } from "../core/game/GameState";
import { DefaultGameConfig } from "../core/game/GameConfig";
import { FruitKind } from "../core/ecs/components";
import { BasketControlSystem } from "../core/ecs/systems/BasketControlSystem";
import { MovementSystem } from "../core/ecs/systems/MovementSystem";
import { TrajectorySystem } from "../core/ecs/systems/TrajectorySystem";
import { SpawnSystem } from "../core/ecs/systems/SpawnSystem";
import { CollisionSystem } from "../core/ecs/systems/CollisionSystem";
import { CleanupSystem } from "../core/ecs/systems/CleanupSystem";
import { TimerSystem } from "../core/ecs/systems/TimerSystem";
import { BasketSpawner } from "../core/ecs/systems/BasketSpawner";
import { SoundSystem } from "../core/ecs/systems/SoundSystem";
import { ScoreSystem } from "../core/ecs/systems/ScoreSystem";
import { LivesSystem } from "../core/ecs/systems/LivesSystem";
import { InputSystem } from "../core/ecs/systems/InputSystem";
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
  private _soundSystem!: SoundSystem;
  private _scoreSystem!: ScoreSystem;
  private _inputSystem!: InputSystem;
  private _livesSystem!: LivesSystem;
  private _basketSpawner!: BasketSpawner;

  public onLoad(): void {
    world.clear();
    this._gameState = new GameState(DefaultGameConfig);

    this._scoreSystem = new ScoreSystem(this.scoreLabel);
    this._scoreSystem.init(this._gameState.score);
    this._livesSystem = new LivesSystem(this.livesLabel);
    this._livesSystem.init(this._gameState.lives);

    if (this.timerLabel) {
      this.timerLabel.string = `Time: ${this._gameState.timeLeft}`;
    }

    this._gameState.onScoreChanged = (score) => {
      this._scoreSystem.setScore(score);
    };

    this._gameState.onLivesChanged = (lives) => {
      this._livesSystem.setLives(lives);
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
    this._basketSpawner = new BasketSpawner(this.canvas, this.basketPrefab);

    this._soundSystem = new SoundSystem(this, {
      catchClip: this.catchSfx,
      hazardClip: this.hazardSfx,
      backgroundClip: this.backgroundMusic,
    });

    this._collisionSystem = new CollisionSystem(this._gameState, {
      onFruitCaught: () => this.playCatchSfx(),
      soundSystem: this._soundSystem,
    });
    this._cleanupSystem = new CleanupSystem();
    this._timerSystem = new TimerSystem(this._gameState);

    this._basketSpawner.spawn();
    this._inputSystem = new InputSystem({
      canvas: this.canvas,
      basketSystem: this._basketSystem,
      soundSystem: this._soundSystem,
    });
    this._inputSystem.register();
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
    this._soundSystem?.stopBackground();
  }

  private playCatchSfx(): void {
    this._soundSystem?.playCatch();
  }

  private showGameOverOverlay(reason: GameOverReason): void {
    this.gameOverUI?.show(reason, this._gameState.lives);
  }

}
