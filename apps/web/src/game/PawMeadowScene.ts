import {
  Animation,
  ArcRotateCamera,
  Color3,
  Color4,
  DirectionalLight,
  Engine,
  HemisphericLight,
  MeshBuilder,
  PointerEventTypes,
  Scalar,
  Scene,
  ShadowGenerator,
  StandardMaterial,
  TransformNode,
  Vector3,
  VertexBuffer,
} from "@babylonjs/core";
import { GREEN_SLIME } from "@nekoria/game-core";
import type { TargetIntentPayload } from "@nekoria/protocol";
import type { CombatResultPayload } from "@nekoria/protocol";
import type { MovementInput } from "./input/MovementInput";
import { MonsterRoamingController } from "./monsters/MonsterRoamingController";
import { GameConnection } from "./network/GameConnection";
import { BasicAttackController } from "./player/BasicAttackController";
import { PlayerMovementController } from "./player/PlayerMovementController";
import type { TargetSummary } from "./targeting/TargetingTypes";
import { AdventurerVisual } from "./visuals/AdventurerVisual";
import { GreenSlimeVisual } from "./visuals/GreenSlimeVisual";

const palette = {
  grass: "#78b85c", darkGrass: "#4f8a45", path: "#d7b678", water: "#61b8d2",
  bark: "#7b4d2b", leaves: "#4e9b59", fur: "#d9b18b", cream: "#f4e6cb",
  leather: "#76503a", scarf: "#a94736", slime: "#8bdd70",
};

const MAP_HALF_WIDTH = 250;
const MAP_HALF_HEIGHT = 250;
const rockBarriers = [
  new Vector3(-22, 0, -8), new Vector3(-18, 0, -4), new Vector3(-14, 0, 0),
  new Vector3(20, 0, 16), new Vector3(24, 0, 18), new Vector3(28, 0, 20),
  new Vector3(48, 0, -24), new Vector3(52, 0, -20),
  new Vector3(-92, 0, 62), new Vector3(-87, 0, 66), new Vector3(-82, 0, 70),
  new Vector3(112, 0, 78), new Vector3(117, 0, 75), new Vector3(122, 0, 72),
];

interface MonsterEntity {
  readonly entityId: string;
  readonly root: TransformNode;
  summary: TargetSummary;
  readonly visual: GreenSlimeVisual;
}

interface CircularObstacle {
  readonly x: number;
  readonly z: number;
  readonly radius: number;
}

export class PawMeadowScene {
  private readonly engine: Engine;
  private readonly scene: Scene;
  private readonly camera: ArcRotateCamera;
  private readonly player: TransformNode;
  private readonly playerVisual: AdventurerVisual;
  private readonly movement: PlayerMovementController;
  private readonly monsters = new Map<string, MonsterEntity>();
  private readonly monsterRoaming: MonsterRoamingController[] = [];
  private readonly roamingByEntity = new Map<string, MonsterRoamingController>();
  private readonly obstacles: CircularObstacle[] = [];
  private readonly attack: BasicAttackController;
  private readonly connection: GameConnection;
  private activeTargetId: string | null = null;
  private targetSource: "manual" | "proximity" | null = null;
  private proximityCheckElapsed = 0;
  private pointerDown: { x: number; y: number } | null = null;
  private readonly targetRing: ReturnType<typeof MeshBuilder.CreateTorus>;
  private targetSequence = 0;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    input: MovementInput,
    private readonly onTargetChange: (target: TargetSummary | null) => void,
    private readonly onCombatResult: (result: CombatResultPayload) => void,
  ) {
    this.engine = new Engine(canvas, true, { antialias: true, adaptToDeviceRatio: true });
    this.scene = new Scene(this.engine);
    this.scene.clearColor = new Color4(0.62, 0.84, 0.96, 1);
    this.scene.fogMode = Scene.FOGMODE_LINEAR;
    this.scene.fogStart = 78;
    this.scene.fogEnd = 235;
    this.scene.fogColor = new Color3(0.67, 0.84, 0.9);
    this.scene.imageProcessingConfiguration.exposure = 1.08;
    this.scene.imageProcessingConfiguration.contrast = 1.06;
    this.camera = this.createCamera();
    const shadows = this.createLights();
    this.createMeadow();
    this.player = this.createAdventurer();
    this.playerVisual = new AdventurerVisual(this.player, this.scene);
    this.player.getChildMeshes().forEach((mesh) => shadows.addShadowCaster(mesh));
    this.movement = new PlayerMovementController(
      this.player,
      this.camera,
      input,
      (x, z) => this.terrainHeightAt(x, z),
      (x, z) => this.isPlayerWalkable(x, z),
    );
    this.createSlimes(shadows);
    this.targetRing = this.createTargetRing();
    this.connection = new GameConnection((result) => this.handleCombatResult(result));
    this.attack = new BasicAttackController(
      this.player,
      this.movement,
      (id) => {
        const root = this.monsters.get(id)?.root;
        return root?.isEnabled() ? root : null;
      },
      (id) => {
        this.playerVisual.triggerAttack();
        this.connection.attack(id);
      },
    );
    this.setupClickToMove();
    this.canvas.addEventListener("dblclick", this.handleDoubleClick);
    window.addEventListener("keydown", this.handleKeyDown);
  }

  start(): void {
    this.connection.connect();
    this.engine.runRenderLoop(() => {
      const deltaSeconds = Math.min(this.engine.getDeltaTime() / 1000, 0.05);
      this.monsterRoaming.forEach((controller) => controller.update(deltaSeconds));
      this.monsters.forEach((monster) => monster.visual.update(deltaSeconds));
      this.updateProximityTarget(deltaSeconds);
      this.attack.update(deltaSeconds);
      this.movement.update(deltaSeconds);
      this.playerVisual.update(deltaSeconds, this.movement.isMoving());
      this.scene.render();
    });
    window.addEventListener("resize", this.resize);
  }

  dispose(): void {
    window.removeEventListener("resize", this.resize);
    window.removeEventListener("keydown", this.handleKeyDown);
    this.canvas.removeEventListener("dblclick", this.handleDoubleClick);
    this.connection.dispose();
    this.engine.stopRenderLoop();
    this.scene.dispose();
    this.engine.dispose();
  }

  private readonly resize = (): void => this.engine.resize();
  private readonly handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key === "Escape") this.clearTarget();
  };

  clearTarget(): void {
    this.targetRing.setEnabled(false);
    this.targetRing.parent = null;
    this.activeTargetId = null;
    this.targetSource = null;
    this.attack.cancel();
    this.targetSequence += 1;
    const intent: TargetIntentPayload = { targetEntityId: null, sequence: this.targetSequence };
    void intent;
    this.onTargetChange(null);
  }

  requestAttack(): void { this.attack.request(this.activeTargetId); }

  private handleCombatResult(result: CombatResultPayload): void {
    const monster = this.monsters.get(result.targetEntityId);
    if (monster) {
      monster.summary = { ...monster.summary, currentHp: result.targetHp };
      if (result.outcome !== "MISS") monster.visual.triggerHit();
      const roaming = this.roamingByEntity.get(result.targetEntityId);
      if (result.targetDead) roaming?.die();
      else {
        roaming?.engage(this.player.position);
        monster.visual.triggerAttack();
        this.playerVisual.triggerHit();
      }
      if (result.targetDead) {
        if (this.activeTargetId === result.targetEntityId) this.clearTarget();
        this.playMonsterDeath(result.targetEntityId, monster.root);
      }
      else if (this.activeTargetId === result.targetEntityId) this.onTargetChange(monster.summary);
    }
    this.onCombatResult(result);
  }

  private playMonsterDeath(entityId: string, monster: TransformNode): void {
    this.scene.stopAnimation(monster);
    Animation.CreateAndStartAnimation(
      `${monster.name}-death`,
      monster,
      "scaling",
      30,
      18,
      monster.scaling.clone(),
      new Vector3(1.35, 0.05, 1.35),
      Animation.ANIMATIONLOOPMODE_CONSTANT,
      undefined,
      () => {
        const roaming = this.roamingByEntity.get(entityId);
        if (roaming) {
          const index = this.monsterRoaming.indexOf(roaming);
          if (index >= 0) this.monsterRoaming.splice(index, 1);
        }
        this.roamingByEntity.delete(entityId);
        this.monsters.delete(entityId);
        monster.dispose();
      },
      this.scene,
    );
  }

  private readonly handleDoubleClick = (): void => {
    const pick = this.scene.pick(this.scene.pointerX, this.scene.pointerY, (mesh) => typeof mesh.metadata?.targetEntityId === "string");
    const entityId = pick?.pickedMesh?.metadata?.targetEntityId;
    if (typeof entityId === "string") { this.selectTarget(entityId, "manual"); this.requestAttack(); }
  };

  private createCamera(): ArcRotateCamera {
    const camera = new ArcRotateCamera("mmorpg-camera", -Math.PI / 3.7, Math.PI / 3.15, 25, new Vector3(0, 2.2, 1), this.scene);
    camera.attachControl(this.canvas, true);
    camera.lowerBetaLimit = 0.7;
    camera.upperBetaLimit = 1.18;
    camera.lowerRadiusLimit = 14;
    camera.upperRadiusLimit = 58;
    camera.wheelPrecision = 28;
    camera.panningSensibility = 0;
    camera.inertia = 0.82;
    return camera;
  }

  private setupClickToMove(): void {
    this.scene.onPointerObservable.add((pointerInfo) => {
      const event = pointerInfo.event;
      if (pointerInfo.type === PointerEventTypes.POINTERDOWN) {
        this.pointerDown = { x: event.clientX, y: event.clientY };
        return;
      }
      if (pointerInfo.type !== PointerEventTypes.POINTERUP || !this.pointerDown) return;
      const travel = Math.hypot(event.clientX - this.pointerDown.x, event.clientY - this.pointerDown.y);
      this.pointerDown = null;
      if (travel > 10) return;
      const pick = this.scene.pick(this.scene.pointerX, this.scene.pointerY, (mesh) =>
        typeof mesh.metadata?.targetEntityId === "string" || mesh.name === "paw-meadow",
      );
      const targetEntityId = pick?.pickedMesh?.metadata?.targetEntityId;
      if (typeof targetEntityId === "string") {
        this.selectTarget(targetEntityId, "manual");
      } else if (pick?.hit && pick.pickedPoint) {
        this.clearTarget();
        this.movement.moveTo(pick.pickedPoint);
      }
    });
  }

  private selectTarget(entityId: string, source: "manual" | "proximity"): void {
    const target = this.monsters.get(entityId);
    if (!target || !target.root.isEnabled() || target.summary.currentHp <= 0) return;
    this.targetRing.parent = target.root;
    this.targetRing.position.set(0, 0.08, 0);
    this.targetRing.setEnabled(true);
    this.activeTargetId = entityId;
    this.targetSource = source;
    this.attack.cancel();
    this.targetSequence += 1;
    const intent: TargetIntentPayload = { targetEntityId: target.entityId, sequence: this.targetSequence };
    void intent;
    this.onTargetChange(target.summary);
  }

  private updateProximityTarget(deltaSeconds: number): void {
    if (!window.matchMedia("(pointer: coarse)").matches) return;
    this.proximityCheckElapsed += deltaSeconds;
    if (this.proximityCheckElapsed < 0.18) return;
    this.proximityCheckElapsed = 0;
    const active = this.activeTargetId ? this.monsters.get(this.activeTargetId) : null;
    if (active && this.targetSource === "proximity" && this.horizontalDistance(active.root.position, this.player.position) > 8) this.clearTarget();
    if (this.activeTargetId) return;
    let nearest: MonsterEntity | undefined;
    let nearestDistance = 5;
    for (const monster of this.monsters.values()) {
      if (!monster.root.isEnabled() || monster.summary.currentHp <= 0) continue;
      const distance = this.horizontalDistance(monster.root.position, this.player.position);
      if (distance < nearestDistance) { nearest = monster; nearestDistance = distance; }
    }
    if (nearest) this.selectTarget(nearest.entityId, "proximity");
  }

  private createTargetRing() {
    const ring = MeshBuilder.CreateTorus("target-ring", { diameter: 1.9, thickness: 0.085, tessellation: 40 }, this.scene);
    ring.rotation.x = Math.PI / 2;
    ring.isPickable = false;
    const material = this.mat("target-ring-mat", "#f6d56a");
    material.emissiveColor = Color3.FromHexString("#d8a73c");
    material.alpha = 0.92;
    ring.material = material;
    ring.setEnabled(false);
    return ring;
  }

  private createLights(): ShadowGenerator {
    const sky = new HemisphericLight("sky", new Vector3(0.2, 1, 0.1), this.scene);
    sky.intensity = 1.05;
    sky.groundColor = Color3.FromHexString("#5a7353");
    const sun = new DirectionalLight("sun", new Vector3(-0.55, -1, 0.45), this.scene);
    sun.position = new Vector3(15, 25, -18);
    sun.intensity = 1.4;
    const shadows = new ShadowGenerator(2048, sun);
    shadows.useBlurExponentialShadowMap = true;
    shadows.blurKernel = 24;
    shadows.setDarkness(0.22);
    return shadows;
  }

  private createMeadow(): void {
    const ground = MeshBuilder.CreateGround("paw-meadow", { width: MAP_HALF_WIDTH * 2, height: MAP_HALF_HEIGHT * 2, subdivisions: 160, updatable: true }, this.scene);
    const positions = ground.getVerticesData(VertexBuffer.PositionKind);
    if (positions) {
      for (let index = 0; index < positions.length; index += 3) {
        positions[index + 1] = this.terrainHeightAt(positions[index]!, positions[index + 2]!);
      }
      ground.updateVerticesData(VertexBuffer.PositionKind, positions);
      ground.refreshBoundingInfo();
      ground.createNormals(true);
    }
    ground.material = this.mat("grass", palette.grass);
    ground.receiveShadows = true;

    this.giantTree(new Vector3(145, 0, 168));
    rockBarriers.forEach((position, index) => this.rock(`ridge-rock-${index}`, position, 1.8 + (index % 3) * 0.35));

    [new Vector3(-45, 0, -34), new Vector3(-96, 0, 48), new Vector3(88, 0, -62), new Vector3(105, 0, 76), new Vector3(-72, 0, 108), new Vector3(4, 0, -88), new Vector3(-164, 0, -42), new Vector3(178, 0, 32), new Vector3(-205, 0, 154), new Vector3(194, 0, -168), new Vector3(-132, 0, -176), new Vector3(64, 0, 194)].forEach((p, i) => this.tree(`tree-${i}`, p));
    this.createBenchmarkDressing();

    for (let i = 0; i < 180; i += 1) {
      const x = ((i * 137) % 480) - 240;
      const z = ((i * 193) % 480) - 240;
      if (Math.abs(x + 4.5) < 5 || Math.abs(x - 13) < 3) continue;
      const flower = MeshBuilder.CreateSphere(`flower-${i}`, { diameter: 0.18, segments: 6 }, this.scene);
      flower.position = new Vector3(x, this.terrainHeightAt(x, z) + 0.16, z);
      flower.material = this.mat(`flower-mat-${i % 3}`, ["#f8e68b", "#f7b6cf", "#f7f2e1"][i % 3]!);
    }
  }

  private createBenchmarkDressing(): void {
    const pathMaterial = this.mat("benchmark-path", "#d9b979");
    for (let step = -11; step <= 11; step += 1) {
      const z = step * 3.7;
      const x = -5 + Math.sin(step * 0.38) * 5.4;
      const nextX = -5 + Math.sin((step + 1) * 0.38) * 5.4;
      const path = MeshBuilder.CreateDisc(`benchmark-path-${step}`, { radius: 3.15, tessellation: 14 }, this.scene);
      path.position = new Vector3(x, this.terrainHeightAt(x, z) + 0.055, z);
      path.rotation.x = Math.PI / 2;
      path.rotation.z = Math.atan2(nextX - x, 3.7);
      path.scaling.x = 1.25;
      path.material = pathMaterial;
      path.isPickable = false;
    }

    const waterMaterial = this.mat("benchmark-water", "#62bdd0", 0.86);
    waterMaterial.emissiveColor = Color3.FromHexString("#397d91").scale(0.18);
    for (let step = -9; step <= 9; step += 1) {
      const z = step * 3.9;
      const x = 24 + Math.sin(step * 0.5) * 2.2;
      const water = MeshBuilder.CreateDisc(`benchmark-stream-${step}`, { radius: 2.5, tessellation: 16 }, this.scene);
      water.position = new Vector3(x, this.terrainHeightAt(x, z) + 0.09, z);
      water.rotation.x = Math.PI / 2;
      water.scaling.x = 1.25;
      water.material = waterMaterial;
      water.isPickable = false;
    }

    for (let plank = -4; plank <= 4; plank += 1) {
      const x = 24 + plank * 0.72;
      const z = 8;
      const bridge = MeshBuilder.CreateBox(`bridge-plank-${plank}`, { width: 0.62, height: 0.18, depth: 3.7 }, this.scene);
      bridge.position = new Vector3(x, this.terrainHeightAt(24, z) + 0.42, z);
      bridge.material = this.mat("bridge-wood", "#8b5e37");
      bridge.isPickable = false;
    }

    const treeClusters = [new Vector3(-30, 0, -24), new Vector3(-35, 0, 18), new Vector3(34, 0, 30), new Vector3(38, 0, -28)];
    treeClusters.forEach((center, cluster) => {
      for (let index = 0; index < 3; index += 1) {
        this.tree(`benchmark-tree-${cluster}-${index}`, new Vector3(center.x + index * 3.4, 0, center.z + (index % 2) * 3.1));
      }
    });

    const bushes = [new Vector3(-16, 0, -19), new Vector3(-21, 0, 16), new Vector3(14, 0, 27), new Vector3(33, 0, -12), new Vector3(-31, 0, 4), new Vector3(10, 0, -31)];
    bushes.forEach((position, index) => this.bush(`benchmark-bush-${index}`, position));

    for (let index = 0; index < 72; index += 1) {
      const angle = index * 2.399;
      const radius = 9 + (index % 9) * 3.5;
      const x = Math.cos(angle) * radius - 2;
      const z = Math.sin(angle) * radius;
      if (Math.abs(x + 5) < 5 || Math.abs(x - 24) < 4) continue;
      const tuft = MeshBuilder.CreateCylinder(`grass-tuft-${index}`, { height: 0.5 + (index % 3) * 0.12, diameterTop: 0, diameterBottom: 0.24, tessellation: 3 }, this.scene);
      tuft.position = new Vector3(x, this.terrainHeightAt(x, z) + 0.25, z);
      tuft.rotation.y = angle;
      tuft.material = this.mat(`grass-tuft-material-${index % 2}`, index % 2 ? "#4e914a" : "#66a954");
      tuft.isPickable = false;
    }

    this.createFence(new Vector3(-25, 0, 30), 7, 2.8, 0.1);
    this.createFence(new Vector3(30, 0, -22), 6, 2.8, -0.35);
  }

  private bush(name: string, position: Vector3): void {
    const y = this.terrainHeightAt(position.x, position.z);
    for (let part = 0; part < 3; part += 1) {
      const leaf = MeshBuilder.CreateSphere(`${name}-${part}`, { diameter: 1.25, segments: 8 }, this.scene);
      leaf.position = new Vector3(position.x + (part - 1) * 0.48, y + 0.55 + (part % 2) * 0.18, position.z + (part % 2) * 0.25);
      leaf.scaling.y = 0.75;
      leaf.material = this.mat(`bush-material-${part % 2}`, part % 2 ? "#3f844b" : "#58a052");
      leaf.isPickable = false;
    }
    this.addObstacle(position.x, position.z, 1);
  }

  private createFence(start: Vector3, count: number, spacing: number, angle: number): void {
    const wood = this.mat("fence-wood", "#7c5534");
    const direction = new Vector3(Math.cos(angle), 0, Math.sin(angle));
    for (let index = 0; index < count; index += 1) {
      const x = start.x + direction.x * index * spacing;
      const z = start.z + direction.z * index * spacing;
      const y = this.terrainHeightAt(x, z);
      const post = MeshBuilder.CreateCylinder(`fence-post-${start.x}-${index}`, { height: 1.55, diameterTop: 0.22, diameterBottom: 0.3, tessellation: 6 }, this.scene);
      post.position = new Vector3(x, y + 0.78, z);
      post.material = wood;
      post.isPickable = false;
      this.addObstacle(x, z, 0.62);
      if (index === count - 1) continue;
      const rail = MeshBuilder.CreateBox(`fence-rail-${start.x}-${index}`, { width: spacing, height: 0.16, depth: 0.16 }, this.scene);
      rail.position = new Vector3(x + direction.x * spacing * 0.5, y + 0.88, z + direction.z * spacing * 0.5);
      rail.rotation.y = -angle;
      rail.material = wood;
      rail.isPickable = false;
      for (let sample = 1; sample <= 4; sample += 1) {
        const amount = sample / 5;
        this.addObstacle(x + direction.x * spacing * amount, z + direction.z * spacing * amount, 0.48);
      }
    }
  }

  private rock(name: string, position: Vector3, size: number): void {
    const rock = MeshBuilder.CreateSphere(name, { diameter: 2, segments: 8 }, this.scene);
    rock.position = new Vector3(position.x, this.terrainHeightAt(position.x, position.z) + size * 0.45, position.z);
    rock.scaling = new Vector3(size, size * 0.65, size * 0.85);
    rock.rotation.y = position.x * 0.17;
    rock.material = this.mat("ridge-rock-mat", "#71806d");
    rock.isPickable = false;
    this.addObstacle(position.x, position.z, Math.max(1.4, size * 0.82));
  }

  private tree(name: string, position: Vector3): void {
    position.y = this.terrainHeightAt(position.x, position.z);
    const trunk = MeshBuilder.CreateCylinder(`${name}-trunk`, { height: 3.4, diameterTop: 0.5, diameterBottom: 0.8 }, this.scene);
    trunk.position = position.add(new Vector3(0, 1.7, 0));
    trunk.material = this.mat("bark", palette.bark);
    for (let cluster = 0; cluster < 4; cluster += 1) {
      const angle = cluster * Math.PI * 0.5 + position.x * 0.03;
      const crown = MeshBuilder.CreateSphere(`${name}-crown-${cluster}`, { diameter: cluster === 0 ? 3.7 : 2.6, segments: 10 }, this.scene);
      crown.position = position.add(new Vector3(Math.cos(angle) * (cluster ? 1.15 : 0), 3.9 + (cluster % 2) * 0.65, Math.sin(angle) * (cluster ? 0.9 : 0)));
      crown.scaling = new Vector3(1.12, 0.82, 1);
      crown.material = this.mat(`leaves-${cluster % 2}`, cluster % 2 ? "#61a956" : palette.leaves);
      crown.isPickable = false;
    }
    trunk.isPickable = false;
    this.addObstacle(position.x, position.z, 1.15);
  }

  private giantTree(position: Vector3): void {
    position.y = this.terrainHeightAt(position.x, position.z);
    const trunk = MeshBuilder.CreateCylinder("giant-tree-trunk", { height: 22, diameterTop: 4.2, diameterBottom: 8.5, tessellation: 12 }, this.scene);
    trunk.position = position.add(new Vector3(0, 11, 0));
    trunk.material = this.mat("giant-bark", palette.bark);
    for (let cluster = 0; cluster < 7; cluster += 1) {
      const angle = cluster * 2.399;
      const crown = MeshBuilder.CreateSphere(`giant-tree-crown-${cluster}`, { diameter: cluster === 0 ? 24 : 17, segments: 14 }, this.scene);
      crown.position = position.add(new Vector3(Math.cos(angle) * (cluster ? 8 : 0), 23 + (cluster % 3) * 3.2, Math.sin(angle) * (cluster ? 6 : 0)));
      crown.scaling.y = 0.68;
      crown.material = this.mat(`giant-leaves-${cluster % 2}`, cluster % 2 ? "#62ad5d" : "#438e52");
      crown.isPickable = false;
    }
    trunk.isPickable = false;
    this.addObstacle(position.x, position.z, 4.8);
  }

  private createAdventurer(): TransformNode {
    const root = new TransformNode("adventurer", this.scene);
    root.position = new Vector3(-1.5, 0, -1);
    root.rotation.y = -0.35;
    return root;
  }

  private createSlimes(shadows: ShadowGenerator): void {
    [new Vector3(5, 0, -2), new Vector3(12, 0, 8), new Vector3(-42, 0, 34), new Vector3(-105, 0, -62), new Vector3(118, 0, -84)].forEach((position, index) => {
      const entityId = `monster-green-slime-${index + 1}`;
      position.y = this.terrainHeightAt(position.x, position.z);
      const root = new TransformNode(entityId, this.scene); root.position = position;
      const summary: TargetSummary = {
        entityId,
        displayName: GREEN_SLIME.displayName,
        level: GREEN_SLIME.level,
        currentHp: GREEN_SLIME.maxHp,
        maxHp: GREEN_SLIME.maxHp,
      };
      const visual = new GreenSlimeVisual(root, this.scene, index);
      root.getChildMeshes().forEach((mesh) => shadows.addShadowCaster(mesh));
      this.monsters.set(entityId, { entityId, root, summary, visual });
      const roaming = new MonsterRoamingController(root, {
        roamRadius: 3.4 + index * 0.45,
        moveSpeed: 0.85 + index * 0.12,
        idleMinSeconds: 1.5,
        idleMaxSeconds: 4,
        arrivalDistance: 0.16,
        isWalkable: (point) => this.isMonsterRoamWalkable(point),
        terrainHeightAt: (x, z) => this.terrainHeightAt(x, z),
      }, 1089 + index * 7919);
      this.monsterRoaming.push(roaming);
      this.roamingByEntity.set(entityId, roaming);
    });
  }

  private isMonsterRoamWalkable(point: Vector3): boolean {
    if (point.x < -246 || point.x > 246 || point.z < -246 || point.z > 246) return false;
    if (!this.isPlayerWalkable(point.x, point.z)) return false;
    const giantTree = new Vector3(145, 0, 168);
    if (Vector3.DistanceSquared(point, giantTree) < 20.25) return false;
    const trees = [new Vector3(-45, 0, -34), new Vector3(-96, 0, 48), new Vector3(88, 0, -62), new Vector3(105, 0, 76), new Vector3(-72, 0, 108), new Vector3(4, 0, -88), new Vector3(-164, 0, -42), new Vector3(178, 0, 32)];
    return !trees.some((tree) => Vector3.DistanceSquared(point, tree) < 4);
  }

  private isPlayerWalkable(x: number, z: number): boolean {
    if (x < -246 || x > 246 || z < -246 || z > 246) return false;
    return !this.obstacles.some((obstacle) => Math.hypot(x - obstacle.x, z - obstacle.z) < obstacle.radius);
  }

  private addObstacle(x: number, z: number, radius: number): void {
    this.obstacles.push({ x, z, radius });
  }

  private terrainHeightAt(x: number, z: number): number {
    const terrace = (centerX: number, centerZ: number, radiusX: number, radiusZ: number, height: number) => {
      const distance = Math.hypot((x - centerX) / radiusX, (z - centerZ) / radiusZ);
      const amount = Scalar.Clamp((1 - distance) * 8, 0, 1);
      return height * amount * amount * (3 - 2 * amount);
    };
    return terrace(-15, -2, 20, 18, 3.2)
      + terrace(-46, 38, 86, 72, 4.2)
      + terrace(-46, 38, 48, 38, 3.8)
      + terrace(104, -82, 92, 76, 5.2)
      + terrace(104, -82, 52, 42, 3.6)
      + terrace(128, 142, 86, 70, 6.5)
      + terrace(-158, -132, 78, 64, 4.8)
      + terrace(-176, 152, 64, 58, 7.5);
  }

  private horizontalDistance(a: Vector3, b: Vector3): number {
    return Math.hypot(a.x - b.x, a.z - b.z);
  }

  private mat(name: string, hex: string, alpha = 1): StandardMaterial {
    const found = this.scene.getMaterialByName(name);
    if (found instanceof StandardMaterial) return found;
    const material = new StandardMaterial(name, this.scene);
    material.diffuseColor = Color3.FromHexString(hex);
    material.specularColor = new Color3(0.08, 0.08, 0.08);
    material.alpha = alpha;
    return material;
  }
}
