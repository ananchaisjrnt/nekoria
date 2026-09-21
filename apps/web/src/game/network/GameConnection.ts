import type { AttackIntentPayload, CombatResultPayload, GroundItemRemovedPayload, GroundItemSpawnedPayload, InventorySnapshotPayload, PositionSyncIntentPayload, PickupItemIntentPayload, PickupResultPayload } from "@nekoria/protocol";

export interface GameConnectionHandlers {
  readonly onCombatResult: (result: CombatResultPayload) => void;
  readonly onGroundItemSpawned: (item: GroundItemSpawnedPayload) => void;
  readonly onGroundItemRemoved: (item: GroundItemRemovedPayload) => void;
  readonly onInventorySnapshot: (snapshot: InventorySnapshotPayload) => void;
  readonly onPickupResult: (result: PickupResultPayload) => void;
}

export class GameConnection {
  private socket: WebSocket | null = null;
  private sequence = 0;
  private reconnectTimer: number | null = null;
  private disposed = false;

  constructor(private readonly handlers: GameConnectionHandlers) {}

  connect(): void {
    this.disposed = false;
    const configured = import.meta.env.VITE_GAME_SERVER_URL as string | undefined;
    const raw = configured ?? (import.meta.env.PROD ? "nekoria-server" : "ws://localhost:3001");
    const publicHost = import.meta.env.PROD && !raw.includes("://") && !raw.includes(".")
      ? `${raw}.onrender.com`
      : raw;
    const base = publicHost.startsWith("ws://") || publicHost.startsWith("wss://") ? publicHost : `wss://${publicHost}`;
    this.socket = new WebSocket(`${base.replace(/\/$/, "")}/game`);
    this.socket.addEventListener("message", (event) => {
      const message = JSON.parse(String(event.data)) as { event?: string; data?: unknown };
      if (!message.data) return;
      if (message.event === "COMBAT_RESULT") this.handlers.onCombatResult(message.data as CombatResultPayload);
      if (message.event === "GROUND_ITEM_SPAWNED") this.handlers.onGroundItemSpawned(message.data as GroundItemSpawnedPayload);
      if (message.event === "GROUND_ITEM_REMOVED") this.handlers.onGroundItemRemoved(message.data as GroundItemRemovedPayload);
      if (message.event === "INVENTORY_SNAPSHOT") this.handlers.onInventorySnapshot(message.data as InventorySnapshotPayload);
      if (message.event === "PICKUP_RESULT") this.handlers.onPickupResult(message.data as PickupResultPayload);
    });
    this.socket.addEventListener("close", () => {
      this.socket = null;
      if (!this.disposed) this.reconnectTimer = window.setTimeout(() => this.connect(), 2_000);
    });
  }

  attack(targetEntityId: string): void {
    if (this.socket?.readyState !== WebSocket.OPEN) return;
    const payload: AttackIntentPayload = { targetEntityId, sequence: ++this.sequence };
    this.socket.send(JSON.stringify({ event: "ATTACK", data: payload }));
  }

  move(x: number, z: number): void {
    if (this.socket?.readyState !== WebSocket.OPEN) return;
    const payload: PositionSyncIntentPayload = { position: { x, z }, sequence: ++this.sequence };
    this.socket.send(JSON.stringify({ event: "MOVE", data: payload }));
  }

  pickup(groundItemId: string): void {
    if (this.socket?.readyState !== WebSocket.OPEN) return;
    const payload: PickupItemIntentPayload = { groundItemId, sequence: ++this.sequence };
    this.socket.send(JSON.stringify({ event: "PICKUP_ITEM", data: payload }));
  }

  dispose(): void {
    this.disposed = true;
    if (this.reconnectTimer !== null) window.clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
    this.socket?.close();
    this.socket = null;
  }
}
