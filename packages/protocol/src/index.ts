export type ClientIntentType = "MOVE" | "TARGET" | "ATTACK" | "USE_SKILL" | "USE_ITEM" | "PICKUP_ITEM";
export interface ClientIntent<TPayload = unknown> { readonly type: ClientIntentType; readonly requestId: string; readonly payload: TPayload; }

