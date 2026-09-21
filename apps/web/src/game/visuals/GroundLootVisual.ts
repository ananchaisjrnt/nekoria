import { Color3, MeshBuilder, Scene, StandardMaterial, TransformNode, Vector3 } from "@babylonjs/core";
import type { GroundItemSpawnedPayload } from "@nekoria/protocol";

export class GroundLootVisual {
  readonly root: TransformNode;
  private elapsed = 0;
  private readonly baseY: number;

  constructor(readonly item: GroundItemSpawnedPayload, scene: Scene, y: number) {
    this.root = new TransformNode(`loot-${item.groundItemId}`, scene);
    this.root.position = new Vector3(item.position.x, y + 0.35, item.position.z);
    this.baseY = this.root.position.y;
    const makeMaterial = (name: string, color: string, emissive = false) => {
      const material = new StandardMaterial(name, scene);
      material.diffuseColor = Color3.FromHexString(color);
      material.specularColor = new Color3(0.06, 0.06, 0.06);
      if (emissive) material.emissiveColor = Color3.FromHexString(color).scale(0.55);
      return material;
    };
    const pickable = (mesh: ReturnType<typeof MeshBuilder.CreateBox>) => {
      mesh.parent = this.root;
      mesh.metadata = { groundItemId: item.groundItemId };
      return mesh;
    };
    if (item.appearance === "GIFT_BAG") {
      const bag = pickable(MeshBuilder.CreateSphere(`bag-${item.groundItemId}`, { diameter: 0.55, segments: 8 }, scene));
      bag.scaling.y = 0.85; bag.material = makeMaterial(`bag-mat-${item.groundItemId}`, "#c89154");
      const tie = pickable(MeshBuilder.CreateCylinder(`bag-tie-${item.groundItemId}`, { height: 0.12, diameter: 0.22, tessellation: 8 }, scene));
      tie.position.y = 0.26; tie.material = makeMaterial(`bag-tie-mat-${item.groundItemId}`, "#f2d66e");
    } else if (item.appearance === "HP_POTION" || item.appearance === "SP_POTION") {
      const bottle = pickable(MeshBuilder.CreateCylinder(`potion-${item.groundItemId}`, { height: 0.58, diameterTop: 0.24, diameterBottom: 0.34, tessellation: 10 }, scene));
      bottle.material = makeMaterial(`potion-mat-${item.groundItemId}`, item.appearance === "HP_POTION" ? "#d84f4e" : "#4f86da", true);
      const cork = pickable(MeshBuilder.CreateCylinder(`potion-cork-${item.groundItemId}`, { height: 0.12, diameter: 0.14, tessellation: 8 }, scene));
      cork.position.y = 0.34; cork.material = makeMaterial(`cork-mat-${item.groundItemId}`, "#e6c477");
    } else if (item.appearance === "REFINE_MATERIAL") {
      const ore = pickable(MeshBuilder.CreatePolyhedron(`ore-${item.groundItemId}`, { type: 1, size: 0.46 }, scene));
      ore.material = makeMaterial(`ore-mat-${item.groundItemId}`, "#73b8d5", true);
    } else if (item.appearance === "SOUL") {
      const aura = pickable(MeshBuilder.CreateSphere(`soul-aura-${item.groundItemId}`, { diameter: 0.95, segments: 12 }, scene));
      aura.material = makeMaterial(`soul-aura-mat-${item.groundItemId}`, "#93ea87", true);
      (aura.material as StandardMaterial).alpha = 0.24;
      const slimeSoul = pickable(MeshBuilder.CreateSphere(`soul-slime-${item.groundItemId}`, { diameter: 0.5, segments: 10 }, scene));
      slimeSoul.scaling.y = 0.72; slimeSoul.material = makeMaterial(`soul-mat-${item.groundItemId}`, "#8bdd70", true);
    } else {
      const colors: Record<string, string> = { WEAPON_BOX: "#aa7654", BODY_BOX: "#b482b4", SHOES_BOX: "#7898c5", HEAD_BOX: "#cb9d57", OFF_HAND_BOX: "#708b9c", ACCESSORY_BOX: "#c88aa8" };
      const box = pickable(MeshBuilder.CreateBox(`box-${item.groundItemId}`, { width: 0.62, height: 0.46, depth: 0.52 }, scene));
      box.material = makeMaterial(`box-mat-${item.groundItemId}`, colors[item.appearance] ?? "#b78c61");
      const ribbon = pickable(MeshBuilder.CreateBox(`box-ribbon-${item.groundItemId}`, { width: 0.1, height: 0.48, depth: 0.54 }, scene));
      ribbon.material = makeMaterial(`box-ribbon-mat-${item.groundItemId}`, "#f1d46f");
    }
  }

  update(deltaSeconds: number): void {
    this.elapsed += deltaSeconds;
    this.root.position.y = this.baseY + Math.sin(this.elapsed * 2.2) * 0.06;
    this.root.rotation.y += deltaSeconds * 0.45;
  }

  dispose(): void { this.root.dispose(false, true); }
}
