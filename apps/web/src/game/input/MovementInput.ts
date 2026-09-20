export interface MovementVector {
  x: number;
  forward: number;
}

export class MovementInput {
  private joystick: MovementVector = { x: 0, forward: 0 };

  setJoystick(x: number, forward: number): void {
    const length = Math.hypot(x, forward);
    const scale = length > 1 ? 1 / length : 1;
    this.joystick = { x: x * scale, forward: forward * scale };
  }

  releaseJoystick(): void {
    this.joystick = { x: 0, forward: 0 };
  }

  getJoystick(): Readonly<MovementVector> {
    return this.joystick;
  }
}
