import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway } from "@nestjs/websockets";
import type { AttackIntentPayload } from "@nekoria/protocol";
import type WebSocket from "ws";
import { CombatService } from "./combat.service.js";

@WebSocketGateway({ path: "/game" })
export class GameGateway {
  constructor(private readonly combat: CombatService) {}

  @SubscribeMessage("ATTACK")
  attack(@ConnectedSocket() client: WebSocket, @MessageBody() payload: AttackIntentPayload): void {
    const result = this.combat.attack(client, payload);
    if (result) client.send(JSON.stringify({ event: "COMBAT_RESULT", data: result }));
  }
}
