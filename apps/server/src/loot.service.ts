import { Injectable } from "@nestjs/common";
import { ITEM_DEFINITIONS, maxWeightForStrength, type ItemDefinition } from "@nekoria/game-core";
import type { GroundItemRemovedPayload, GroundItemSpawnedPayload, GroundLootAppearance, InventorySnapshotPayload, PickupResultPayload, WorldPositionPayload } from "@nekoria/protocol";

interface ItemInstance {
  readonly instanceId: string;
  readonly definitionId: keyof typeof ITEM_DEFINITIONS;
  readonly identified: boolean;
  readonly randomOptions: readonly { readonly stat: string; readonly value: number }[];
  readonly boundState: "none";
}

interface GroundItem {
  readonly groundItemId: string;
  readonly item: ItemInstance;
  readonly position: WorldPositionPayload;
  readonly owner: object;
  readonly protectedUntil: number;
  readonly expiresAt: number;
}

interface InventoryItem { readonly item: ItemInstance; quantity: number; }
interface LootPlayerState { position: WorldPositionPayload; readonly inventory: InventoryItem[]; }

const PICKUP_RANGE = 2.35;
const PROTECTION_MS = 15_000;
const LIFETIME_MS = 55_000;
const MAX_INVENTORY_ENTRIES = 24;

const appearanceFor = (definition: ItemDefinition): GroundLootAppearance => {
  if (definition.id === "slime_jelly") return "GIFT_BAG";
  if (definition.id === "small_hp_potion") return "HP_POTION";
  if (definition.id === "small_sp_potion") return "SP_POTION";
  if (definition.kind === "material") return "REFINE_MATERIAL";
  if (definition.kind === "soul") return "SOUL";
  switch (definition.equipmentSlot) {
    case "weapon": return "WEAPON_BOX";
    case "body": return "BODY_BOX";
    case "shoes": return "SHOES_BOX";
    case "head": return "HEAD_BOX";
    case "offHand": return "OFF_HAND_BOX";
    case "accessory": return "ACCESSORY_BOX";
    default: return "GIFT_BAG";
  }
};

const publicLabelFor = (definition: ItemDefinition, item: ItemInstance): string => {
  if (!item.identified && definition.kind === "equipment") {
    const names: Record<string, string> = { weapon: "Unidentified Weapon", body: "Unidentified Body Armor", shoes: "Unidentified Shoes", head: "Unidentified Head Equipment", offHand: "Unidentified Off-hand", accessory: "Unidentified Accessory" };
    return names[definition.equipmentSlot ?? ""] ?? "Unidentified Equipment";
  }
  return definition.publicLabel;
};

@Injectable()
export class LootService {
  private readonly players = new Map<object, LootPlayerState>();
  private readonly groundItems = new Map<string, GroundItem>();
  private nextId = 1;

  setPosition(client: object, position: WorldPositionPayload): GroundItemRemovedPayload[] {
    const player = this.player(client);
    player.position = { x: position.x, z: position.z };
    return this.expire();
  }

  createMonsterDrops(client: object, deathPosition: WorldPositionPayload): GroundItemSpawnedPayload[] {
    this.player(client);
    const rolls: (keyof typeof ITEM_DEFINITIONS)[] = [];
    if (Math.random() < 0.7) rolls.push("slime_jelly");
    if (Math.random() < 0.13) rolls.push("small_hp_potion");
    if (Math.random() < 0.08) rolls.push("small_sp_potion");
    if (Math.random() < 0.05) rolls.push("beginner_sword");
    if (Math.random() < 0.05) rolls.push("beginner_tunic");
    if (Math.random() < 0.06) rolls.push("weapon_ore_i");
    if (Math.random() < 0.02) rolls.push("green_slime_soul");
    if (!rolls.length) rolls.push("slime_jelly");
    return rolls.map((definitionId, index) => this.spawn(client, definitionId, deathPosition, index));
  }

  pickup(client: object, groundItemId: string): PickupResultPayload {
    this.expire();
    const ground = this.groundItems.get(groundItemId);
    if (!ground) return { groundItemId, success: false, reason: "NOT_FOUND" };
    const now = Date.now();
    if (ground.owner !== client && now < ground.protectedUntil) return { groundItemId, success: false, reason: "NOT_ELIGIBLE" };
    const player = this.player(client);
    if (Math.hypot(player.position.x - ground.position.x, player.position.z - ground.position.z) > PICKUP_RANGE) return { groundItemId, success: false, reason: "TOO_FAR" };
    const definition = ITEM_DEFINITIONS[ground.item.definitionId];
    const snapshot = this.snapshot(client);
    if (snapshot.currentWeight + definition.weight > snapshot.maxWeight) return { groundItemId, success: false, reason: "OVERWEIGHT" };
    const existing = definition.stackable ? player.inventory.find((entry) => entry.item.definitionId === ground.item.definitionId) : undefined;
    if (!existing && player.inventory.length >= MAX_INVENTORY_ENTRIES) return { groundItemId, success: false, reason: "OVERWEIGHT" };
    if (existing) existing.quantity += 1;
    else player.inventory.push({ item: ground.item, quantity: 1 });
    this.groundItems.delete(groundItemId);
    return { groundItemId, success: true, inventory: this.snapshot(client) };
  }

  snapshot(client: object): InventorySnapshotPayload {
    const player = this.player(client);
    const maxWeight = maxWeightForStrength(1);
    const entries = player.inventory.map((entry) => {
      const definition = ITEM_DEFINITIONS[entry.item.definitionId];
      return { inventoryId: entry.item.instanceId, publicLabel: publicLabelFor(definition, entry.item), appearance: appearanceFor(definition), quantity: entry.quantity, unitWeight: definition.weight, identified: entry.item.identified };
    });
    const currentWeight = player.inventory.reduce((total, entry) => total + ITEM_DEFINITIONS[entry.item.definitionId].weight * entry.quantity, 0);
    return { entries, currentWeight, maxWeight };
  }

  disconnect(client: object): void { this.players.delete(client); }

  private spawn(client: object, definitionId: keyof typeof ITEM_DEFINITIONS, origin: WorldPositionPayload, index: number): GroundItemSpawnedPayload {
    const definition = ITEM_DEFINITIONS[definitionId];
    const item: ItemInstance = {
      instanceId: `item-${this.nextId++}`,
      definitionId,
      identified: definition.kind !== "equipment",
      randomOptions: definition.kind === "equipment" ? [{ stat: "STR", value: 1 }] : [],
      boundState: "none",
    };
    const angle = (this.nextId * 2.399 + index) % (Math.PI * 2);
    const distance = 0.8 + (this.nextId % 4) * 0.22;
    const groundItemId = `ground-${this.nextId++}`;
    const expiresAt = Date.now() + LIFETIME_MS;
    const ground: GroundItem = { groundItemId, item, position: { x: origin.x + Math.cos(angle) * distance, z: origin.z + Math.sin(angle) * distance }, owner: client, protectedUntil: Date.now() + PROTECTION_MS, expiresAt };
    this.groundItems.set(groundItemId, ground);
    return { groundItemId, appearance: appearanceFor(definition), publicLabel: publicLabelFor(definition, item), position: ground.position, rarity: definition.kind === "soul" ? "rare" : definition.kind === "equipment" ? "uncommon" : "common", expiresAt };
  }

  private player(client: object): LootPlayerState {
    const existing = this.players.get(client);
    if (existing) return existing;
    const created: LootPlayerState = { position: { x: -1.5, z: -1 }, inventory: [] };
    this.players.set(client, created);
    return created;
  }

  private expire(): GroundItemRemovedPayload[] {
    const now = Date.now();
    const removed: GroundItemRemovedPayload[] = [];
    for (const [id, ground] of this.groundItems) {
      if (ground.expiresAt > now) continue;
      this.groundItems.delete(id);
      removed.push({ groundItemId: id, reason: "EXPIRED" });
    }
    return removed;
  }
}
