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
}

export class PawMeadowScene {
  private readonly engine: Engine;
  private readonly scene: Scene;
  private readonly camera: ArcRotateCamera;
  private readonly player: TransformNode;
  private readonly movement: PlayerMovementController;
  private readonly monsters = new Map<string, MonsterEntity>();
  private readonly monsterRoaming: MonsterRoamingController[] = [];
  private readonly roamingByEntity = new Map<string, MonsterRoamingController>();
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
    this.camera = this.createCamera();
    const shadows = this.createLights();
    this.createMeadow();
    this.player = this.createAdventurer(shadows);
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
      (id) => this.connection.attack(id),
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
      this.updateProximityTarget(deltaSeconds);
      this.attack.update(deltaSeconds);
      this.movement.update(deltaSeconds);
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
      const roaming = this.roamingByEntity.get(result.targetEntityId);
      if (result.targetDead) roaming?.die();
      else roaming?.engage(this.player.position);
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
    if (active && this.targetSource === "proximity" && Vector3.Distance(active.root.position, this.player.position) > 8) this.clearTarget();
    if (this.activeTargetId) return;
    let nearest: MonsterEntity | undefined;
    let nearestDistance = 5;
    for (const monster of this.monsters.values()) {
      if (!monster.root.isEnabled() || monster.summary.currentHp <= 0) continue;
      const distance = Vector3.Distance(monster.root.position, this.player.position);
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

    const path = MeshBuilder.CreateGround("main-path", { width: 10, height: 490 }, this.scene);
    path.position = new Vector3(-4.5, 0.025, 0);
    path.rotation.y = -0.18;
    path.material = this.mat("path", palette.path);
    path.isPickable = false;

    const stream = MeshBuilder.CreateGround("stream", { width: 6, height: 490 }, this.scene);
    stream.position = new Vector3(13, 0.12, 0);
    stream.rotation.y = 0.12;
    stream.material = this.mat("water", palette.water, 0.8);
    stream.isPickable = false;

    this.giantTree(new Vector3(145, 0, 168));
    rockBarriers.forEach((position, index) => this.rock(`ridge-rock-${index}`, position, 1.8 + (index % 3) * 0.35));

    [new Vector3(-45, 0, -34), new Vector3(-96, 0, 48), new Vector3(88, 0, -62), new Vector3(105, 0, 76), new Vector3(-72, 0, 108), new Vector3(4, 0, -88), new Vector3(-164, 0, -42), new Vector3(178, 0, 32), new Vector3(-205, 0, 154), new Vector3(194, 0, -168), new Vector3(-132, 0, -176), new Vector3(64, 0, 194)].forEach((p, i) => this.tree(`tree-${i}`, p));

    for (let i = 0; i < 420; i += 1) {
      const x = ((i * 137) % 480) - 240;
      const z = ((i * 193) % 480) - 240;
      if (Math.abs(x + 4.5) < 5 || Math.abs(x - 13) < 3) continue;
      const flower = MeshBuilder.CreateSphere(`flower-${i}`, { diameter: 0.18, segments: 6 }, this.scene);
      flower.position = new Vector3(x, this.terrainHeightAt(x, z) + 0.16, z);
      flower.material = this.mat(`flower-mat-${i % 3}`, ["#f8e68b", "#f7b6cf", "#f7f2e1"][i % 3]!);
    }
  }

  private hill(position: Vector3, scale: Vector3): void {
    const hill = MeshBuilder.CreateSphere("rolling-hill", { diameter: 2, segments: 14 }, this.scene);
    hill.position = position;
    hill.scaling = scale;
    hill.material = this.mat("dark-grass", palette.darkGrass);
  }

  private rock(name: string, position: Vector3, size: number): void {
    const rock = MeshBuilder.CreateSphere(name, { diameter: 2, segments: 8 }, this.scene);
    rock.position = new Vector3(position.x, this.terrainHeightAt(position.x, position.z) + size * 0.45, position.z);
    rock.scaling = new Vector3(size, size * 0.65, size * 0.85);
    rock.rotation.y = position.x * 0.17;
    rock.material = this.mat("ridge-rock-mat", "#71806d");
    rock.isPickable = false;
  }

  private tree(name: string, position: Vector3): void {
    position.y = this.terrainHeightAt(position.x, position.z);
    const trunk = MeshBuilder.CreateCylinder(`${name}-trunk`, { height: 3.4, diameterTop: 0.5, diameterBottom: 0.8 }, this.scene);
    trunk.position = position.add(new Vector3(0, 1.7, 0));
    trunk.material = this.mat("bark", palette.bark);
    const crown = MeshBuilder.CreateSphere(`${name}-crown`, { diameter: 3.8, segments: 10 }, this.scene);
    crown.position = position.add(new Vector3(0, 4.1, 0));
    crown.scaling = new Vector3(1.15, 0.8, 1);
    crown.material = this.mat("leaves", palette.leaves);
  }

  private giantTree(position: Vector3): void {
    position.y = this.terrainHeightAt(position.x, position.z);
    const trunk = MeshBuilder.CreateCylinder("giant-tree-trunk", { height: 9, diameterTop: 2.1, diameterBottom: 4 }, this.scene);
    trunk.position = position.add(new Vector3(0, 4.5, 0));
    trunk.material = this.mat("giant-bark", palette.bark);
    const crown = MeshBuilder.CreateSphere("giant-tree-crown", { diameter: 12, segments: 18 }, this.scene);
    crown.position = position.add(new Vector3(0, 10.2, 0));
    crown.scaling = new Vector3(1.35, 0.7, 1.1);
    crown.material = this.mat("giant-leaves", "#4b9d58");
  }

  private createAdventurer(shadows: ShadowGenerator): TransformNode {
    const root = new TransformNode("adventurer", this.scene);
    root.position = new Vector3(-1.5, 0, -1);
    root.rotation.y = -0.35;

    const body = MeshBuilder.CreateCapsule("adventurer-body", { height: 2.15, radius: 0.58 }, this.scene);
    body.parent = root; body.position.y = 1.65; body.material = this.mat("leather", palette.leather);
    const head = MeshBuilder.CreateSphere("adventurer-head", { diameter: 1.42, segments: 18 }, this.scene);
    head.parent = root; head.position.y = 3.12; head.material = this.mat("fur", palette.fur);
    const muzzle = MeshBuilder.CreateSphere("muzzle", { diameter: 0.62, segments: 12 }, this.scene);
    muzzle.parent = root; muzzle.position = new Vector3(0, 3, -0.6); muzzle.scaling = new Vector3(1.1, 0.65, 0.55); muzzle.material = this.mat("cream", palette.cream);
    this.ear(root, -0.42); this.ear(root, 0.42);
    const scarf = MeshBuilder.CreateTorus("scarf", { diameter: 1.18, thickness: 0.18, tessellation: 24 }, this.scene);
    scarf.parent = root; scarf.position.y = 2.55; scarf.rotation.x = Math.PI / 2; scarf.material = this.mat("scarf-mat", palette.scarf);
    const tail = MeshBuilder.CreateTorus("tail", { diameter: 1.3, thickness: 0.19, tessellation: 24 }, this.scene);
    tail.parent = root; tail.position = new Vector3(0.55, 1.35, 0.42); tail.scaling.y = 1.25; tail.rotation = new Vector3(0.2, 1.15, -0.4); tail.material = this.mat("tail-mat", palette.fur);
    root.getChildMeshes().forEach((mesh) => shadows.addShadowCaster(mesh));
    this.idle(root, 0.035, 2.2);
    return root;
  }

  private ear(root: TransformNode, x: number): void {
    const ear = MeshBuilder.CreateCylinder(`ear-${x}`, { height: 0.8, diameterTop: 0, diameterBottom: 0.62, tessellation: 3 }, this.scene);
    ear.parent = root; ear.position = new Vector3(x, 3.8, 0); ear.rotation.z = x < 0 ? -0.13 : 0.13; ear.material = this.mat("ear-mat", palette.fur);
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
      this.monsters.set(entityId, { entityId, root, summary });
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
      const slime = MeshBuilder.CreateSphere(`slime-body-${index}`, { diameter: 1.35, segments: 18 }, this.scene);
      slime.parent = root; slime.position.y = 0.65; slime.scaling = new Vector3(1, 0.82, 1); slime.material = this.mat("slime", palette.slime, 0.9); shadows.addShadowCaster(slime);
      slime.metadata = { targetEntityId: entityId };
      for (const x of [-0.24, 0.24]) {
        const eye = MeshBuilder.CreateSphere(`slime-eye-${index}-${x}`, { diameter: 0.12, segments: 8 }, this.scene);
        eye.parent = root; eye.position = new Vector3(x, 0.77, -0.61); eye.material = this.mat("slime-eye", "#26352d"); eye.metadata = { targetEntityId: entityId };
      }
      this.idle(root, 0.09, 1.3 + index * 0.12);
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
    return !rockBarriers.some((rock) => Math.hypot(x - rock.x, z - rock.z) < 2.35);
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

  private idle(target: TransformNode, distance: number, speed: number): void {
    const animation = new Animation(`${target.name}-idle`, "scaling.y", 30, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE);
    animation.setKeys([{ frame: 0, value: 1 }, { frame: 30, value: 1 + distance }, { frame: 60, value: 1 }]);
    target.animations = [animation];
    this.scene.beginAnimation(target, 0, 60, true, speed);
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
