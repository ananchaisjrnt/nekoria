import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway } from "@nestjs/websockets";
import type { AttackIntentPayload, PositionSyncIntentPayload, PickupItemIntentPayload } from "@nekoria/protocol";
import type WebSocket from "ws";
import { CombatService } from "./combat.service.js";
import { LootService } from "./loot.service.js";

const monsterPositions: Record<string, { x: number; z: number }> = {
  "monster-green-slime-1": { x: 5, z: -2 },
  "monster-green-slime-2": { x: 12, z: 8 },
  "monster-green-slime-3": { x: -42, z: 34 },
  "monster-green-slime-4": { x: -105, z: -62 },
  "monster-green-slime-5": { x: 118, z: -84 },
};

@WebSocketGateway({ path: "/game" })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly combat: CombatService, private readonly loot: LootService) {}

  handleConnection(client: WebSocket): void {
    client.send(JSON.stringify({ event: "INVENTORY_SNAPSHOT", data: this.loot.snapshot(client) }));
  }

  @SubscribeMessage("ATTACK")
  attack(@ConnectedSocket() client: WebSocket, @MessageBody() payload: AttackIntentPayload): void {
    const result = this.combat.attack(client, payload);
    if (!result) return;
    client.send(JSON.stringify({ event: "COMBAT_RESULT", data: result }));
    if (!result.targetDead) return;
    const position = monsterPositions[result.targetEntityId];
    if (!position) return;
    this.loot.createMonsterDrops(client, position).forEach((drop) => client.send(JSON.stringify({ event: "GROUND_ITEM_SPAWNED", data: drop })));
  }

  @SubscribeMessage("MOVE")
  move(@ConnectedSocket() client: WebSocket, @MessageBody() payload: PositionSyncIntentPayload): void {
    this.loot.setPosition(client, payload.position).forEach((removed) => client.send(JSON.stringify({ event: "GROUND_ITEM_REMOVED", data: removed })));
  }

  @SubscribeMessage("PICKUP_ITEM")
  pickup(@ConnectedSocket() client: WebSocket, @MessageBody() payload: PickupItemIntentPayload): void {
    const result = this.loot.pickup(client, payload.groundItemId);
    client.send(JSON.stringify({ event: "PICKUP_RESULT", data: result }));
    if (!result.success) return;
    client.send(JSON.stringify({ event: "GROUND_ITEM_REMOVED", data: { groundItemId: result.groundItemId, reason: "PICKED_UP" } }));
    if (result.inventory) client.send(JSON.stringify({ event: "INVENTORY_SNAPSHOT", data: result.inventory }));
  }

  handleDisconnect(client: WebSocket): void {
    this.combat.disconnect(client);
  }
}
