export type MonsterKind = "weak" | "normal" | "tough" | "elite";
export interface MonsterDefinition { readonly id: string; readonly displayName: string; readonly level: number; readonly kind: MonsterKind; }
export const GREEN_SLIME = { id: "green_slime", displayName: "Green Slime", level: 1, kind: "weak" } as const satisfies MonsterDefinition;

