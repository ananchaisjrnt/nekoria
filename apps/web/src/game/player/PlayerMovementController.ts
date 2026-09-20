import { ArcRotateCamera, Scalar, TransformNode, Vector3 } from "@babylonjs/core";
import type { MoveIntentPayload } from "@nekoria/protocol";
import type { MovementInput } from "../input/MovementInput";

const MAX_SPEED = 5.2;
const ACCELERATION = 18;
const DECELERATION = 22;
const ARRIVAL_DISTANCE = 0.12;
const JOYSTICK_DEAD_ZONE = 0.08;

export class PlayerMovementController {
  private destination: Vector3 | null = null;
  private velocity = Vector3.Zero();
  private moveSequence = 0;

  constructor(
    private readonly player: TransformNode,
    private readonly camera: ArcRotateCamera,
    private readonly input: MovementInput,
    private readonly terrainHeightAt: (x: number, z: number) => number,
    private readonly isWalkable: (x: number, z: number) => boolean,
    private readonly onMoveIntent: (intent: MoveIntentPayload) => void = () => undefined,
  ) {
    this.player.position.y = this.terrainHeightAt(this.player.position.x, this.player.position.z);
  }

  moveTo(point: Vector3): void {
    this.setDestination(point, true);
  }

  approachTo(point: Vector3): void {
    this.setDestination(point, false);
  }

  stop(): void {
    this.destination = null;
    this.velocity.setAll(0);
  }

  hasDirectionalInput(): boolean {
    const joystick = this.input.getJoystick();
    return Math.hypot(joystick.x, joystick.forward) > JOYSTICK_DEAD_ZONE;
  }

  private setDestination(point: Vector3, emitIntent: boolean): void {
    this.destination = new Vector3(
      Scalar.Clamp(point.x, -246, 246),
      this.terrainHeightAt(point.x, point.z),
      Scalar.Clamp(point.z, -246, 246),
    );
    if (emitIntent) {
      this.moveSequence += 1;
      this.onMoveIntent({ destination: { x: this.destination.x, z: this.destination.z }, sequence: this.moveSequence });
    }
  }

  update(deltaSeconds: number): void {
    const joystick = this.input.getJoystick();
    const joystickStrength = Math.hypot(joystick.x, joystick.forward);
    let desiredDirection = Vector3.Zero();
    let desiredSpeed = 0;

    if (joystickStrength > JOYSTICK_DEAD_ZONE) {
      this.destination = null;
      const cameraForward = this.camera.target.subtract(this.camera.position);
      cameraForward.y = 0;
      cameraForward.normalize();
      const cameraRight = new Vector3(cameraForward.z, 0, -cameraForward.x);
      desiredDirection = cameraRight.scale(joystick.x).add(cameraForward.scale(joystick.forward));
      desiredDirection.normalize();
      desiredSpeed = MAX_SPEED * Math.min(joystickStrength, 1);
    } else if (this.destination) {
      const toDestination = this.destination.subtract(this.player.position);
      toDestination.y = 0;
      const remaining = toDestination.length();
      if (remaining <= ARRIVAL_DISTANCE) {
        this.destination = null;
      } else {
        desiredDirection = toDestination.normalize();
        desiredSpeed = MAX_SPEED * Math.min(1, remaining / 1.1);
      }
    }

    const desiredVelocity = desiredDirection.scale(desiredSpeed);
    const rate = desiredSpeed > 0 ? ACCELERATION : DECELERATION;
    this.velocity = Vector3.Lerp(this.velocity, desiredVelocity, Math.min(1, rate * deltaSeconds));

    if (this.velocity.lengthSquared() < 0.0025) this.velocity.setAll(0);
    const previous = this.player.position.clone();
    const next = this.player.position.add(this.velocity.scale(deltaSeconds));
    next.x = Scalar.Clamp(next.x, -246, 246);
    next.z = Scalar.Clamp(next.z, -246, 246);
    if (this.isWalkable(next.x, next.z)) {
      this.player.position.copyFrom(next);
    } else {
      const slideX = new Vector3(next.x, previous.y, previous.z);
      const slideZ = new Vector3(previous.x, previous.y, next.z);
      if (this.isWalkable(slideX.x, slideX.z)) this.player.position.copyFrom(slideX);
      else if (this.isWalkable(slideZ.x, slideZ.z)) this.player.position.copyFrom(slideZ);
      else this.velocity.setAll(0);
    }
    const terrainY = this.terrainHeightAt(this.player.position.x, this.player.position.z);
    this.player.position.y = Scalar.Lerp(this.player.position.y, terrainY, Math.min(1, 10 * deltaSeconds));

    if (this.velocity.lengthSquared() > 0.04) {
      const targetAngle = Math.atan2(-this.velocity.x, -this.velocity.z);
      this.player.rotation.y = this.lerpAngle(this.player.rotation.y, targetAngle, Math.min(1, 12 * deltaSeconds));
    }

    const cameraTarget = this.player.position.add(new Vector3(0, 2.2, 0));
    this.camera.target = Vector3.Lerp(this.camera.target, cameraTarget, Math.min(1, 8 * deltaSeconds));
  }

  private lerpAngle(current: number, target: number, amount: number): number {
    const difference = Math.atan2(Math.sin(target - current), Math.cos(target - current));
    return current + difference * amount;
  }
}
