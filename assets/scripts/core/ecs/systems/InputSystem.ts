import { EventMouse, EventTouch, Node, UITransform, Vec3 } from "cc";
import { BasketControlSystem } from "./BasketControlSystem";
import { SoundSystem } from "./SoundSystem";

interface InputSystemOptions {
  canvas: Node | null;
  basketSystem: BasketControlSystem;
  soundSystem: SoundSystem;
}

export class InputSystem {
  private readonly _canvas: Node | null;
  private readonly _basketSystem: BasketControlSystem;
  private readonly _soundSystem: SoundSystem;

  constructor(options: InputSystemOptions) {
    this._canvas = options.canvas;
    this._basketSystem = options.basketSystem;
    this._soundSystem = options.soundSystem;
  }

  public register(): void {
    if (!this._canvas) {
      return;
    }

    this._canvas.on(Node.EventType.MOUSE_MOVE, this.onMouseMove, this);
    this._canvas.on(Node.EventType.MOUSE_DOWN, this.onMouseDown, this);
    this._canvas.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    this._canvas.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
  }

  public unregister(): void {
    if (!this._canvas) {
      return;
    }

    this._canvas.off(Node.EventType.MOUSE_MOVE, this.onMouseMove, this);
    this._canvas.off(Node.EventType.MOUSE_DOWN, this.onMouseDown, this);
    this._canvas.off(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    this._canvas.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
  }

  private onMouseMove(event: EventMouse): void {
    this.handlePointerMove(event.getUILocation());
  }

  private onMouseDown(): void {
    this._soundSystem.startBackgroundIfNeeded();
  }

  private onTouchMove(event: EventTouch): void {
    this.handlePointerMove(event.getUILocation());
  }

  private onTouchStart(): void {
    this._soundSystem.startBackgroundIfNeeded();
  }

  private handlePointerMove(uiLocation: { x: number; y: number }): void {
    if (!this._canvas) {
      return;
    }

    const uiTransform = this._canvas.getComponent(UITransform);
    if (!uiTransform) {
      return;
    }

    const localPos = uiTransform.convertToNodeSpaceAR(new Vec3(uiLocation.x, uiLocation.y, 0));
    this._basketSystem.setTargetX(localPos.x);
    this._soundSystem.startBackgroundIfNeeded();
  }
}
