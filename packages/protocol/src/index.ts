export type ClientIntentType = "MOVE" | "TARGET" | "ATTACK" | "USE_SKILL" | "USE_ITEM" | "PICKUP_ITEM";
export interface ClientIntent<TPayload = unknown> { readonly type: ClientIntentType; readonly requestId: string; readonly payload: TPayload; }

export interface MoveIntentPayload {
  readonly destination: { readonly x: number; readonly z: number };
  readonly sequence: number;
}

export interface TargetIntentPayload {
  readonly targetEntityId: string | null;
  readonly sequence: number;
}

export interface AttackIntentPayload {
  readonly targetEntityId: string;
  readonly sequence: number;
}

export interface CombatResultPayload {
  readonly targetEntityId: string;
  readonly outcome: "HIT" | "MISS" | "CRIT";
  readonly damage: number;
  readonly targetHp: number;
  readonly targetMaxHp: number;
  readonly targetDead: boolean;
  readonly playerHp: number;
  readonly exp: number;
  readonly expToNextLevel: number;
  readonly level: number;
  readonly statusPoints: number;
}

export type GroundLootAppearance =
  | "GIFT_BAG" | "WEAPON_BOX" | "BODY_BOX" | "SHOES_BOX" | "HEAD_BOX"
  | "OFF_HAND_BOX" | "ACCESSORY_BOX" | "HP_POTION" | "SP_POTION" | "REFINE_MATERIAL" | "SOUL";

export interface WorldPositionPayload { readonly x: number; readonly z: number; }

export interface PositionSyncIntentPayload {
  readonly position: WorldPositionPayload;
  readonly sequence: number;
}

export interface PickupItemIntentPayload {
  readonly groundItemId: string;
  readonly sequence: number;
}

export interface GroundItemSpawnedPayload {
  readonly groundItemId: string;
  readonly appearance: GroundLootAppearance;
  readonly publicLabel: string;
  readonly position: WorldPositionPayload;
  readonly rarity: "common" | "uncommon" | "rare";
  readonly expiresAt: number;
}

export interface GroundItemRemovedPayload {
  readonly groundItemId: string;
  readonly reason: "PICKED_UP" | "EXPIRED";
}

export interface InventoryEntryPayload {
  readonly inventoryId: string;
  readonly publicLabel: string;
  readonly appearance: GroundLootAppearance;
  readonly quantity: number;
  readonly unitWeight: number;
  readonly identified: boolean;
}

export interface InventorySnapshotPayload {
  readonly entries: readonly InventoryEntryPayload[];
  readonly currentWeight: number;
  readonly maxWeight: number;
}

export interface PickupResultPayload {
  readonly groundItemId: string;
  readonly success: boolean;
  readonly reason?: "NOT_FOUND" | "TOO_FAR" | "OVERWEIGHT" | "NOT_ELIGIBLE";
  readonly inventory?: InventorySnapshotPayload;
}
