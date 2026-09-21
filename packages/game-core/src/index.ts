export type MonsterKind = "weak" | "normal" | "tough" | "elite";
export interface MonsterDefinition {
  readonly id: string;
  readonly displayName: string;
  readonly level: number;
  readonly kind: MonsterKind;
  readonly maxHp: number;
}

export const GREEN_SLIME = {
  id: "green_slime",
  displayName: "Green Slime",
  level: 1,
  kind: "weak",
  maxHp: 66,
} as const satisfies MonsterDefinition;

export const expForNextLevel = (level: number): number => 60 + (level - 1) * 40;
export const statusPointsForLevel = (newLevel: number): number => newLevel === 50 ? 8 : 3 + Math.floor(newLevel / 10);

export type ItemKind = "junk" | "consumable" | "equipment" | "material" | "soul";
export type EquipmentSlot = "weapon" | "body" | "shoes" | "head" | "offHand" | "accessory";

export interface ItemDefinition {
  readonly id: string;
  readonly publicLabel: string;
  readonly kind: ItemKind;
  readonly weight: number;
  readonly stackable: boolean;
  readonly equipmentSlot?: EquipmentSlot;
}

export const ITEM_DEFINITIONS = {
  slime_jelly: { id: "slime_jelly", publicLabel: "Slime Jelly", kind: "junk", weight: 1, stackable: true },
  small_hp_potion: { id: "small_hp_potion", publicLabel: "Small HP Potion", kind: "consumable", weight: 3, stackable: true },
  small_sp_potion: { id: "small_sp_potion", publicLabel: "Small SP Potion", kind: "consumable", weight: 3, stackable: true },
  beginner_sword: { id: "beginner_sword", publicLabel: "Iron Sword", kind: "equipment", weight: 18, stackable: false, equipmentSlot: "weapon" },
  beginner_tunic: { id: "beginner_tunic", publicLabel: "Meadow Tunic", kind: "equipment", weight: 14, stackable: false, equipmentSlot: "body" },
  weapon_ore_i: { id: "weapon_ore_i", publicLabel: "Weapon Ore I", kind: "material", weight: 6, stackable: true },
  green_slime_soul: { id: "green_slime_soul", publicLabel: "Green Slime Soul", kind: "soul", weight: 1, stackable: false },
} as const satisfies Record<string, ItemDefinition>;

export const maxWeightForStrength = (strength: number): number => 100 + strength * 10;
