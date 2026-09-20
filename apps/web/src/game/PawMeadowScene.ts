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
  Scene,
  ShadowGenerator,
  StandardMaterial,
  TransformNode,
  Vector3,
} from "@babylonjs/core";
import { GREEN_SLIME } from "@nekoria/game-core";
import type { TargetIntentPayload } from "@nekoria/protocol";
import type { MovementInput } from "./input/MovementInput";
import { MonsterRoamingController } from "./monsters/MonsterRoamingController";
import { PlayerMovementController } from "./player/PlayerMovementController";
import type { TargetSummary } from "./targeting/TargetingTypes";

const palette = {
  grass: "#78b85c", darkGrass: "#4f8a45", path: "#d7b678", water: "#61b8d2",
  bark: "#7b4d2b", leaves: "#4e9b59", fur: "#d9b18b", cream: "#f4e6cb",
  leather: "#76503a", scarf: "#a94736", slime: "#8bdd70",
};

interface MonsterEntity {
  readonly entityId: string;
  readonly root: TransformNode;
  readonly summary: TargetSummary;
}

export class PawMeadowScene {
  private readonly engine: Engine;
  private readonly scene: Scene;
  private readonly camera: ArcRotateCamera;
  private readonly player: TransformNode;
  private readonly movement: PlayerMovementController;
  private readonly monsters = new Map<string, MonsterEntity>();
  private readonly monsterRoaming: MonsterRoamingController[] = [];
  private pointerDown: { x: number; y: number } | null = null;
  private readonly targetRing: ReturnType<typeof MeshBuilder.CreateTorus>;
  private targetSequence = 0;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    input: MovementInput,
    private readonly onTargetChange: (target: TargetSummary | null) => void,
  ) {
    this.engine = new Engine(canvas, true, { antialias: true, adaptToDeviceRatio: true });
    this.scene = new Scene(this.engine);
    this.scene.clearColor = new Color4(0.62, 0.84, 0.96, 1);
    this.camera = this.createCamera();
    const shadows = this.createLights();
    this.createMeadow();
    this.player = this.createAdventurer(shadows);
    this.movement = new PlayerMovementController(this.player, this.camera, input);
    this.createSlimes(shadows);
    this.targetRing = this.createTargetRing();
    this.setupClickToMove();
    window.addEventListener("keydown", this.handleKeyDown);
  }

  start(): void {
    this.engine.runRenderLoop(() => {
      const deltaSeconds = Math.min(this.engine.getDeltaTime() / 1000, 0.05);
      this.movement.update(deltaSeconds);
      this.monsterRoaming.forEach((controller) => controller.update(deltaSeconds));
      this.scene.render();
    });
    window.addEventListener("resize", this.resize);
  }

  dispose(): void {
    window.removeEventListener("resize", this.resize);
    window.removeEventListener("keydown", this.handleKeyDown);
    this.engine.stopRenderLoop();
    this.scene.dispose();
    this.engine.dispose();
  }

  private readonly resize = (): void => this.engine.resize();
  private readonly handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key === "Escape") this.clearTarget();
  };

  clearTarget(): void {
    if (!this.targetRing.isEnabled()) return;
    this.targetRing.setEnabled(false);
    this.targetRing.parent = null;
    this.targetSequence += 1;
    const intent: TargetIntentPayload = { targetEntityId: null, sequence: this.targetSequence };
    void intent;
    this.onTargetChange(null);
  }

  private createCamera(): ArcRotateCamera {
    const camera = new ArcRotateCamera("mmorpg-camera", -Math.PI / 3.7, Math.PI / 3.15, 25, new Vector3(0, 2.2, 1), this.scene);
    camera.attachControl(this.canvas, true);
    camera.lowerBetaLimit = 0.7;
    camera.upperBetaLimit = 1.18;
    camera.lowerRadiusLimit = 14;
    camera.upperRadiusLimit = 36;
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
        this.selectTarget(targetEntityId);
      } else if (pick?.hit && pick.pickedPoint) {
        this.clearTarget();
        this.movement.moveTo(pick.pickedPoint);
      }
    });
  }

  private selectTarget(entityId: string): void {
    const target = this.monsters.get(entityId);
    if (!target) return;
    this.targetRing.parent = target.root;
    this.targetRing.position.set(0, 0.08, 0);
    this.targetRing.setEnabled(true);
    this.targetSequence += 1;
    const intent: TargetIntentPayload = { targetEntityId: target.entityId, sequence: this.targetSequence };
    void intent;
    this.onTargetChange(target.summary);
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
    const ground = MeshBuilder.CreateGround("paw-meadow", { width: 52, height: 44 }, this.scene);
    ground.material = this.mat("grass", palette.grass);
    ground.receiveShadows = true;

    const path = MeshBuilder.CreateGround("main-path", { width: 7, height: 44 }, this.scene);
    path.position = new Vector3(-4.5, 0.025, 0);
    path.rotation.y = -0.18;
    path.material = this.mat("path", palette.path);
    path.isPickable = false;

    const stream = MeshBuilder.CreateGround("stream", { width: 4.2, height: 48 }, this.scene);
    stream.position = new Vector3(13, 0.04, 0);
    stream.rotation.y = 0.12;
    stream.material = this.mat("water", palette.water, 0.8);
    stream.isPickable = false;

    this.hill(new Vector3(-18, 1.2, -12), new Vector3(14, 3.4, 11));
    this.hill(new Vector3(18, 1, 11), new Vector3(16, 2.8, 10));
    this.giantTree(new Vector3(4, 0, 15));

    [new Vector3(-17, 0, -8), new Vector3(-20, 0, 8), new Vector3(20, 0, -8), new Vector3(17, 0, 16), new Vector3(-13, 0, 17)].forEach((p, i) => this.tree(`tree-${i}`, p));

    for (let i = 0; i < 40; i += 1) {
      const x = ((i * 17) % 45) - 22;
      const z = ((i * 29) % 39) - 19;
      if (Math.abs(x + 4.5) < 5 || Math.abs(x - 13) < 3) continue;
      const flower = MeshBuilder.CreateSphere(`flower-${i}`, { diameter: 0.18, segments: 6 }, this.scene);
      flower.position = new Vector3(x, 0.16, z);
      flower.material = this.mat(`flower-mat-${i % 3}`, ["#f8e68b", "#f7b6cf", "#f7f2e1"][i % 3]!);
    }
  }

  private hill(position: Vector3, scale: Vector3): void {
    const hill = MeshBuilder.CreateSphere("rolling-hill", { diameter: 2, segments: 14 }, this.scene);
    hill.position = position;
    hill.scaling = scale;
    hill.material = this.mat("dark-grass", palette.darkGrass);
  }

  private tree(name: string, position: Vector3): void {
    const trunk = MeshBuilder.CreateCylinder(`${name}-trunk`, { height: 3.4, diameterTop: 0.5, diameterBottom: 0.8 }, this.scene);
    trunk.position = position.add(new Vector3(0, 1.7, 0));
    trunk.material = this.mat("bark", palette.bark);
    const crown = MeshBuilder.CreateSphere(`${name}-crown`, { diameter: 3.8, segments: 10 }, this.scene);
    crown.position = position.add(new Vector3(0, 4.1, 0));
    crown.scaling = new Vector3(1.15, 0.8, 1);
    crown.material = this.mat("leaves", palette.leaves);
  }

  private giantTree(position: Vector3): void {
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
    [new Vector3(5, 0, -2), new Vector3(9, 0, 6), new Vector3(-11, 0, 7)].forEach((position, index) => {
      const entityId = `monster-green-slime-${index + 1}`;
      const root = new TransformNode(entityId, this.scene); root.position = position;
      const summary: TargetSummary = {
        entityId,
        displayName: GREEN_SLIME.displayName,
        level: GREEN_SLIME.level,
        currentHp: GREEN_SLIME.maxHp,
        maxHp: GREEN_SLIME.maxHp,
      };
      this.monsters.set(entityId, { entityId, root, summary });
      this.monsterRoaming.push(new MonsterRoamingController(root, {
        roamRadius: 3.4 + index * 0.45,
        moveSpeed: 0.85 + index * 0.12,
        idleMinSeconds: 1.5,
        idleMaxSeconds: 4,
        arrivalDistance: 0.16,
        isWalkable: (point) => this.isMonsterRoamWalkable(point),
      }, 1089 + index * 7919));
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
    if (point.x < -22 || point.x > 22 || point.z < -18 || point.z > 18) return false;
    const giantTree = new Vector3(4, 0, 15);
    if (Vector3.DistanceSquared(point, giantTree) < 20.25) return false;
    const trees = [new Vector3(-17, 0, -8), new Vector3(-20, 0, 8), new Vector3(20, 0, -8), new Vector3(17, 0, 16), new Vector3(-13, 0, 17)];
    return !trees.some((tree) => Vector3.DistanceSquared(point, tree) < 4);
  }

  private idle(target: TransformNode, distance: number, speed: number): void {
    const animation = new Animation(`${target.name}-idle`, "position.y", 30, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE);
    animation.setKeys([{ frame: 0, value: target.position.y }, { frame: 30, value: target.position.y + distance }, { frame: 60, value: target.position.y }]);
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
