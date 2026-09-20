import { TransformNode, Vector3 } from "@babylonjs/core";
import { PlayerMovementController } from "./PlayerMovementController";

export class BasicAttackController {
  private targetId: string | null = null;
  private state: "idle" | "approaching" | "striking" = "idle";
  private strikeElapsed = 0;

  constructor(private readonly player: TransformNode, private readonly movement: PlayerMovementController, private readonly getTarget: (id: string) => TransformNode | null, private readonly onStrike: (id: string) => void) {}

  request(targetId: string | null): void {
    if (!targetId) return;
    this.targetId = targetId;
    this.state = "approaching";
  }

  cancel(): void {
    this.targetId = null;
    this.state = "idle";
    this.strikeElapsed = 0;
  }

  update(deltaSeconds: number): void {
    if (this.state === "idle") return;
    if (this.movement.hasDirectionalInput()) return this.cancel();
    const target = this.targetId ? this.getTarget(this.targetId) : null;
    if (!target) return this.cancel();
    const offset = target.position.subtract(this.player.position); offset.y = 0;
    const distance = offset.length();
    if (this.state === "approaching") {
      if (distance > 1.9) {
        const stopPoint = target.position.subtract(offset.normalize().scale(1.75));
        this.movement.approachTo(stopPoint);
        return;
      }
      this.movement.stop();
      this.player.rotation.y = Math.atan2(-offset.x, -offset.z);
      this.state = "striking";
      this.strikeElapsed = 0;
      if (this.targetId) this.onStrike(this.targetId);
    }
    this.strikeElapsed += deltaSeconds;
    if (this.strikeElapsed >= 1) { this.state = "approaching"; this.strikeElapsed = 0; }
  }
}
