import { Color3, MeshBuilder, Scalar, Scene, StandardMaterial, TransformNode, Vector3 } from "@babylonjs/core";

const material = (scene: Scene, name: string, hex: string): StandardMaterial => {
  const existing = scene.getMaterialByName(name);
  if (existing instanceof StandardMaterial) return existing;
  const result = new StandardMaterial(name, scene);
  result.diffuseColor = Color3.FromHexString(hex);
  result.specularColor = new Color3(0.06, 0.06, 0.06);
  result.emissiveColor = result.diffuseColor.scale(0.06);
  return result;
};

export class AdventurerVisual {
  private readonly model: TransformNode;
  private readonly leftArm: TransformNode;
  private readonly rightArm: TransformNode;
  private readonly leftLeg: TransformNode;
  private readonly rightLeg: TransformNode;
  private readonly tail: TransformNode;
  private elapsed = 0;
  private movementBlend = 0;
  private attackRemaining = 0;
  private hitRemaining = 0;

  constructor(root: TransformNode, scene: Scene) {
    this.model = new TransformNode("adventurer-visual", scene);
    this.model.parent = root;

    const fur = material(scene, "adventurer-fur", "#d8a77b");
    const cream = material(scene, "adventurer-cream", "#f6e4c7");
    const tunic = material(scene, "adventurer-tunic", "#66855b");
    const leather = material(scene, "adventurer-leather", "#654431");
    const darkLeather = material(scene, "adventurer-dark-leather", "#3c302a");
    const scarf = material(scene, "adventurer-scarf", "#b84e3e");
    const metal = material(scene, "adventurer-metal", "#d8d2bd");
    const eye = material(scene, "adventurer-eye", "#302821");
    const gold = material(scene, "adventurer-gold", "#d5a84b");

    const torso = MeshBuilder.CreateCapsule("adventurer-torso", { height: 1.65, radius: 0.48, tessellation: 12 }, scene);
    torso.parent = this.model;
    torso.position.y = 2.18;
    torso.scaling = new Vector3(0.92, 1, 0.72);
    torso.material = tunic;

    const belt = MeshBuilder.CreateTorus("adventurer-belt", { diameter: 0.88, thickness: 0.1, tessellation: 18 }, scene);
    belt.parent = this.model;
    belt.position.y = 1.72;
    belt.rotation.x = Math.PI / 2;
    belt.material = leather;

    const buckle = MeshBuilder.CreateBox("adventurer-buckle", { width: 0.2, height: 0.18, depth: 0.1 }, scene);
    buckle.parent = this.model;
    buckle.position = new Vector3(0, 1.7, -0.48);
    buckle.material = gold;

    const head = MeshBuilder.CreateSphere("adventurer-head", { diameter: 1.18, segments: 16 }, scene);
    head.parent = this.model;
    head.position.y = 3.52;
    head.scaling = new Vector3(0.96, 1, 0.9);
    head.material = fur;

    const muzzle = MeshBuilder.CreateSphere("adventurer-muzzle", { diameter: 0.54, segments: 12 }, scene);
    muzzle.parent = this.model;
    muzzle.position = new Vector3(0, 3.38, -0.5);
    muzzle.scaling = new Vector3(1.05, 0.62, 0.52);
    muzzle.material = cream;

    for (const side of [-1, 1]) {
      const ear = MeshBuilder.CreateCylinder(`adventurer-ear-${side}`, { height: 0.78, diameterTop: 0, diameterBottom: 0.58, tessellation: 3 }, scene);
      ear.parent = this.model;
      ear.position = new Vector3(side * 0.38, 4.17, 0.02);
      ear.rotation.z = side * 0.12;
      ear.material = fur;

      const eyeMesh = MeshBuilder.CreateSphere(`adventurer-eye-${side}`, { diameter: 0.13, segments: 8 }, scene);
      eyeMesh.parent = this.model;
      eyeMesh.position = new Vector3(side * 0.23, 3.62, -0.53);
      eyeMesh.scaling = new Vector3(0.82, 1.15, 0.55);
      eyeMesh.material = eye;
    }

    const nose = MeshBuilder.CreateSphere("adventurer-nose", { diameter: 0.12, segments: 8 }, scene);
    nose.parent = this.model;
    nose.position = new Vector3(0, 3.46, -0.71);
    nose.material = darkLeather;

    const scarfRing = MeshBuilder.CreateTorus("adventurer-scarf", { diameter: 0.9, thickness: 0.15, tessellation: 20 }, scene);
    scarfRing.parent = this.model;
    scarfRing.position.y = 2.92;
    scarfRing.rotation.x = Math.PI / 2;
    scarfRing.material = scarf;

    const scarfTail = MeshBuilder.CreateBox("adventurer-scarf-tail", { width: 0.28, height: 0.82, depth: 0.08 }, scene);
    scarfTail.parent = this.model;
    scarfTail.position = new Vector3(0.35, 2.55, 0.34);
    scarfTail.rotation.z = -0.28;
    scarfTail.material = scarf;

    this.leftArm = this.createLimb(scene, this.model, "left-arm", new Vector3(-0.56, 2.66, 0), fur, leather, false);
    this.rightArm = this.createLimb(scene, this.model, "right-arm", new Vector3(0.56, 2.66, 0), fur, leather, false);
    this.leftLeg = this.createLimb(scene, this.model, "left-leg", new Vector3(-0.27, 1.55, 0), fur, darkLeather, true);
    this.rightLeg = this.createLimb(scene, this.model, "right-leg", new Vector3(0.27, 1.55, 0), fur, darkLeather, true);

    const backpack = MeshBuilder.CreateBox("adventurer-backpack", { width: 0.78, height: 0.95, depth: 0.38 }, scene);
    backpack.parent = this.model;
    backpack.position = new Vector3(0, 2.3, 0.5);
    backpack.rotation.x = -0.08;
    backpack.material = leather;

    const pouch = MeshBuilder.CreateSphere("adventurer-pouch", { diameter: 0.42, segments: 10 }, scene);
    pouch.parent = this.model;
    pouch.position = new Vector3(-0.48, 1.78, -0.05);
    pouch.scaling = new Vector3(0.72, 0.9, 0.45);
    pouch.material = leather;

    this.tail = new TransformNode("adventurer-tail-pivot", scene);
    this.tail.parent = this.model;
    this.tail.position = new Vector3(0.36, 1.92, 0.4);
    const tailMesh = MeshBuilder.CreateTorus("adventurer-tail", { diameter: 1.15, thickness: 0.16, tessellation: 24 }, scene);
    tailMesh.parent = this.tail;
    tailMesh.position = new Vector3(0.38, 0.15, 0.14);
    tailMesh.rotation = new Vector3(0.1, 1.2, -0.35);
    tailMesh.material = fur;

    const swordGrip = MeshBuilder.CreateCylinder("adventurer-sword-grip", { height: 0.56, diameter: 0.12, tessellation: 8 }, scene);
    swordGrip.parent = this.rightArm;
    swordGrip.position = new Vector3(0, -1.05, -0.04);
    swordGrip.rotation.z = 0.15;
    swordGrip.material = leather;
    const swordBlade = MeshBuilder.CreateBox("adventurer-sword-blade", { width: 0.18, height: 1.25, depth: 0.07 }, scene);
    swordBlade.parent = this.rightArm;
    swordBlade.position = new Vector3(0.08, -1.85, -0.04);
    swordBlade.rotation.z = 0.15;
    swordBlade.material = metal;
    const guard = MeshBuilder.CreateBox("adventurer-sword-guard", { width: 0.52, height: 0.1, depth: 0.12 }, scene);
    guard.parent = this.rightArm;
    guard.position = new Vector3(-0.02, -1.3, -0.04);
    guard.rotation.z = 0.15;
    guard.material = gold;
  }

  update(deltaSeconds: number, moving: boolean): void {
    this.elapsed += deltaSeconds;
    this.movementBlend = Scalar.Lerp(this.movementBlend, moving ? 1 : 0, Math.min(1, deltaSeconds * 8));
    this.attackRemaining = Math.max(0, this.attackRemaining - deltaSeconds);
    this.hitRemaining = Math.max(0, this.hitRemaining - deltaSeconds);

    const stride = Math.sin(this.elapsed * 10) * 0.72 * this.movementBlend;
    this.leftLeg.rotation.x = stride;
    this.rightLeg.rotation.x = -stride;
    this.leftArm.rotation.x = -stride * 0.55;
    this.rightArm.rotation.x = stride * 0.4;
    this.model.position.y = Math.abs(Math.sin(this.elapsed * 10)) * 0.08 * this.movementBlend + Math.sin(this.elapsed * 2.3) * 0.025;
    this.tail.rotation.z = Math.sin(this.elapsed * 2.1) * 0.18 + this.movementBlend * 0.16;

    if (this.attackRemaining > 0) {
      const progress = 1 - this.attackRemaining / 0.42;
      const swing = Math.sin(progress * Math.PI);
      this.rightArm.rotation.x = -1.25 * swing;
      this.rightArm.rotation.z = -0.85 * swing;
      this.model.rotation.y = -0.24 * swing;
    } else {
      this.rightArm.rotation.z = Scalar.Lerp(this.rightArm.rotation.z, 0, Math.min(1, deltaSeconds * 12));
      this.model.rotation.y = Scalar.Lerp(this.model.rotation.y, 0, Math.min(1, deltaSeconds * 12));
    }

    const hitLean = this.hitRemaining > 0 ? Math.sin((this.hitRemaining / 0.3) * Math.PI) * 0.18 : 0;
    this.model.rotation.x = hitLean;
  }

  triggerAttack(): void {
    this.attackRemaining = 0.42;
  }

  triggerHit(): void {
    this.hitRemaining = 0.3;
  }

  private createLimb(scene: Scene, parent: TransformNode, name: string, position: Vector3, fur: StandardMaterial, gear: StandardMaterial, leg: boolean): TransformNode {
    const pivot = new TransformNode(`adventurer-${name}-pivot`, scene);
    pivot.parent = parent;
    pivot.position = position;
    const limb = MeshBuilder.CreateCapsule(`adventurer-${name}`, { height: leg ? 1.28 : 1.18, radius: leg ? 0.17 : 0.15, tessellation: 10 }, scene);
    limb.parent = pivot;
    limb.position.y = leg ? -0.58 : -0.5;
    limb.material = fur;
    const gearMesh = MeshBuilder.CreateCapsule(`adventurer-${name}-gear`, { height: leg ? 0.58 : 0.46, radius: leg ? 0.21 : 0.18, tessellation: 10 }, scene);
    gearMesh.parent = pivot;
    gearMesh.position.y = leg ? -1.05 : -0.86;
    gearMesh.material = gear;
    return pivot;
  }
}
