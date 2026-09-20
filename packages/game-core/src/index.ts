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
