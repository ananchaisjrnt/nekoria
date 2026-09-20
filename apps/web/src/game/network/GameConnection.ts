import type { AttackIntentPayload, CombatResultPayload } from "@nekoria/protocol";

export class GameConnection {
  private socket: WebSocket | null = null;
  private sequence = 0;
  private reconnectTimer: number | null = null;
  private disposed = false;

  constructor(private readonly onCombatResult: (result: CombatResultPayload) => void) {}

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
      const message = JSON.parse(String(event.data)) as { event?: string; data?: CombatResultPayload };
      if (message.event === "COMBAT_RESULT" && message.data) this.onCombatResult(message.data);
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

  dispose(): void {
    this.disposed = true;
    if (this.reconnectTimer !== null) window.clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
    this.socket?.close();
    this.socket = null;
  }
}
