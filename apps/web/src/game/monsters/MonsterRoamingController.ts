import { Scalar, TransformNode, Vector3 } from "@babylonjs/core";

export interface MonsterRoamingConfig {
  readonly roamRadius: number;
  readonly moveSpeed: number;
  readonly idleMinSeconds: number;
  readonly idleMaxSeconds: number;
  readonly arrivalDistance: number;
  readonly isWalkable: (point: Vector3) => boolean;
}

type RoamState = "idle" | "moving";

/** Local visual roaming only. Multiplayer movement will be server-authoritative. */
export class MonsterRoamingController {
  private readonly spawnOrigin: Vector3;
  private readonly random: () => number;
  private state: RoamState = "idle";
  private idleRemaining: number;
  private destination: Vector3 | null = null;

  constructor(private readonly root: TransformNode, private readonly config: MonsterRoamingConfig, seed: number) {
    this.spawnOrigin = root.position.clone();
    this.random = this.createRandom(seed);
    this.idleRemaining = this.nextIdleDuration();
  }

  update(deltaSeconds: number): void {
    if (this.state === "idle") {
      this.idleRemaining -= deltaSeconds;
      this.setSquash(1, 1, deltaSeconds);
      if (this.idleRemaining <= 0) this.beginMove();
      return;
    }
    if (!this.destination) return this.beginIdle();

    const toDestination = this.destination.subtract(this.root.position);
    toDestination.y = 0;
    const distance = toDestination.length();
    if (distance <= this.config.arrivalDistance) {
      this.root.position.x = this.destination.x;
      this.root.position.z = this.destination.z;
      return this.beginIdle();
    }

    const direction = toDestination.scale(1 / distance);
    this.root.position.addInPlace(direction.scale(Math.min(this.config.moveSpeed * deltaSeconds, distance)));
    const targetAngle = Math.atan2(-direction.x, -direction.z);
    this.root.rotation.y = this.lerpAngle(this.root.rotation.y, targetAngle, Math.min(1, 7 * deltaSeconds));
    this.setSquash(1.06, 0.92, deltaSeconds);
  }

  private beginMove(): void {
    this.destination = this.findDestination();
    this.state = "moving";
  }

  private beginIdle(): void {
    this.state = "idle";
    this.destination = null;
    this.idleRemaining = this.nextIdleDuration();
  }

  private findDestination(): Vector3 {
    for (let attempt = 0; attempt < 12; attempt += 1) {
      const angle = this.random() * Math.PI * 2;
      const distance = Math.sqrt(this.random()) * this.config.roamRadius;
      const point = this.spawnOrigin.add(new Vector3(Math.cos(angle) * distance, 0, Math.sin(angle) * distance));
      if (this.config.isWalkable(point)) return point;
    }
    return this.spawnOrigin.clone();
  }

  private nextIdleDuration(): number {
    return this.config.idleMinSeconds + this.random() * (this.config.idleMaxSeconds - this.config.idleMinSeconds);
  }

  private setSquash(horizontal: number, vertical: number, deltaSeconds: number): void {
    const amount = Math.min(1, 6 * deltaSeconds);
    this.root.scaling.x = Scalar.Lerp(this.root.scaling.x, horizontal, amount);
    this.root.scaling.z = Scalar.Lerp(this.root.scaling.z, horizontal, amount);
    this.root.scaling.y = Scalar.Lerp(this.root.scaling.y, vertical, amount);
  }

  private lerpAngle(current: number, target: number, amount: number): number {
    const difference = Math.atan2(Math.sin(target - current), Math.cos(target - current));
    return current + difference * amount;
  }

  private createRandom(seed: number): () => number {
    let value = seed >>> 0;
    return () => {
      value = (value * 1664525 + 1013904223) >>> 0;
      return value / 0x100000000;
    };
  }
}
