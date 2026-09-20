import { Color3, MeshBuilder, Scalar, Scene, StandardMaterial, TransformNode, Vector3 } from "@babylonjs/core";

export class GreenSlimeVisual {
  private readonly visualRoot: TransformNode;
  private readonly body: TransformNode;
  private readonly material: StandardMaterial;
  private elapsed = 0;
  private hitRemaining = 0;
  private attackRemaining = 0;
  private previousPosition: Vector3;
  private movementBlend = 0;

  constructor(readonly root: TransformNode, scene: Scene, index: number) {
    this.visualRoot = new TransformNode(`green-slime-visual-${index}`, scene);
    this.visualRoot.parent = root;
    this.body = new TransformNode(`green-slime-body-root-${index}`, scene);
    this.body.parent = this.visualRoot;
    this.previousPosition = root.position.clone();

    this.material = new StandardMaterial(`green-slime-material-${index}`, scene);
    this.material.diffuseColor = Color3.FromHexString("#79d76b");
    this.material.emissiveColor = Color3.FromHexString("#214c2b").scale(0.18);
    this.material.specularColor = new Color3(0.18, 0.24, 0.16);
    this.material.alpha = 0.94;

    const body = MeshBuilder.CreateSphere(`slime-body-${index}`, { diameter: 1.55, segments: 18 }, scene);
    body.parent = this.body;
    body.position.y = 0.72;
    body.scaling = new Vector3(1.08, 0.86, 1);
    body.material = this.material;
    body.metadata = { targetEntityId: root.name };

    for (const side of [-1, 1]) {
      const cheek = MeshBuilder.CreateSphere(`slime-cheek-${index}-${side}`, { diameter: 0.62, segments: 12 }, scene);
      cheek.parent = this.body;
      cheek.position = new Vector3(side * 0.46, 0.5, 0.06);
      cheek.scaling = new Vector3(1, 0.52, 0.82);
      cheek.material = this.material;
      cheek.metadata = { targetEntityId: root.name };

      const eyeMaterial = new StandardMaterial(`slime-eye-material-${index}-${side}`, scene);
      eyeMaterial.diffuseColor = Color3.FromHexString("#23352b");
      eyeMaterial.emissiveColor = eyeMaterial.diffuseColor.scale(0.08);
      const eye = MeshBuilder.CreateSphere(`slime-eye-${index}-${side}`, { diameter: 0.16, segments: 8 }, scene);
      eye.parent = this.body;
      eye.position = new Vector3(side * 0.26, 0.84, -0.7);
      eye.scaling = new Vector3(0.78, 1.15, 0.55);
      eye.material = eyeMaterial;
      eye.metadata = { targetEntityId: root.name };
    }

    const mouthMaterial = new StandardMaterial(`slime-mouth-material-${index}`, scene);
    mouthMaterial.diffuseColor = Color3.FromHexString("#48634d");
    const mouth = MeshBuilder.CreateBox(`slime-mouth-${index}`, { width: 0.24, height: 0.035, depth: 0.035 }, scene);
    mouth.parent = this.body;
    mouth.position = new Vector3(0, 0.61, -0.77);
    mouth.rotation.z = -0.08;
    mouth.material = mouthMaterial;
    mouth.metadata = { targetEntityId: root.name };

    const sproutStem = MeshBuilder.CreateCylinder(`slime-sprout-${index}`, { height: 0.38, diameter: 0.08, tessellation: 8 }, scene);
    sproutStem.parent = this.body;
    sproutStem.position = new Vector3(0.06, 1.48, 0);
    sproutStem.rotation.z = -0.28;
    sproutStem.material = this.material;
    const leaf = MeshBuilder.CreateSphere(`slime-leaf-${index}`, { diameter: 0.34, segments: 8 }, scene);
    leaf.parent = this.body;
    leaf.position = new Vector3(0.2, 1.64, 0);
    leaf.scaling = new Vector3(1.4, 0.35, 0.72);
    leaf.rotation.z = -0.35;
    leaf.material = this.material;
  }

  update(deltaSeconds: number): void {
    this.elapsed += deltaSeconds;
    const moved = Math.hypot(this.root.position.x - this.previousPosition.x, this.root.position.z - this.previousPosition.z) > 0.001;
    this.previousPosition.copyFrom(this.root.position);
    this.movementBlend = Scalar.Lerp(this.movementBlend, moved ? 1 : 0, Math.min(1, deltaSeconds * 8));
    this.hitRemaining = Math.max(0, this.hitRemaining - deltaSeconds);
    this.attackRemaining = Math.max(0, this.attackRemaining - deltaSeconds);

    const hop = Math.abs(Math.sin(this.elapsed * 6.4)) * 0.13 * this.movementBlend;
    this.visualRoot.position.y = hop;
    const idleSquash = Math.sin(this.elapsed * 2.6) * 0.035;
    this.body.scaling = new Vector3(1 - idleSquash, 1 + idleSquash, 1 - idleSquash);

    if (this.hitRemaining > 0) {
      const flash = Math.sin(this.hitRemaining * 42) > 0;
      this.material.emissiveColor = flash ? Color3.FromHexString("#f5d6ad").scale(0.7) : Color3.FromHexString("#214c2b").scale(0.18);
      this.body.position.x = Math.sin(this.hitRemaining * 55) * 0.08;
    } else {
      this.material.emissiveColor = Color3.FromHexString("#214c2b").scale(0.18);
      this.body.position.x = 0;
    }

    if (this.attackRemaining > 0) {
      const progress = 1 - this.attackRemaining / 0.4;
      this.body.position.z = -Math.sin(progress * Math.PI) * 0.34;
      this.body.scaling.z += Math.sin(progress * Math.PI) * 0.18;
    } else {
      this.body.position.z = 0;
    }
  }

  triggerHit(): void {
    this.hitRemaining = 0.28;
  }

  triggerAttack(): void {
    this.attackRemaining = 0.4;
  }
}
