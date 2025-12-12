import {
  _decorator,
  Component,
  Node,
  Label,
  director
} from "cc";
import type { GameOverReason } from "../core/game/GameState";

const { ccclass, property } = _decorator;

@ccclass("GameOverUI")
export class GameOverUI extends Component {
  @property(Node)
  public overlayNode: Node | null = null;

  @property(Label)
  public titleLabel: Label | null = null;

  @property(Label)
  public hintLabel: Label | null = null;

  @property
  public restartSceneName = "";

  private _resolvedSceneName = "";

  public init(): void {
    if (!this.overlayNode) {
      return;
    }

    this._resolvedSceneName = this.restartSceneName || director.getScene()?.name || "";

    this.overlayNode.active = false;
    this.overlayNode.off(Node.EventType.TOUCH_END);
    this.overlayNode.off(Node.EventType.MOUSE_UP);
    this.overlayNode.on(Node.EventType.TOUCH_END, () => this.restartScene(), this);
    this.overlayNode.on(Node.EventType.MOUSE_UP, () => this.restartScene(), this);
  }

  public show(reason: GameOverReason, lives: number): void {
    if (!this.overlayNode) {
      return;
    }

    if (this.titleLabel) {
      this.titleLabel.string = this.getGameOverMessage(reason, lives);
    }

    if (this.hintLabel) {
      this.hintLabel.string = "Tap или клик для рестарта";
    }

    this.overlayNode.active = true;
  }

  private getGameOverMessage(reason: GameOverReason, lives: number): string {
    const isWin = reason === "time_up" && lives > 0;
    return isWin ? "Победа!" : "Поражение";
  }

  private restartScene(): void {
    const sceneName = this._resolvedSceneName || director.getScene()?.name;

    if (!sceneName) {
      console.error("[GameOverUI] Не удалось определить имя сцены для рестарта. Укажите restartSceneName.");
      return;
    }

    director.loadScene(sceneName);
  }
}
