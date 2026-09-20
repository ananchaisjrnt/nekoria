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
