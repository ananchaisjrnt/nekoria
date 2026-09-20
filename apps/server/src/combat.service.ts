import { Injectable } from "@nestjs/common";
import { GREEN_SLIME, expForNextLevel, statusPointsForLevel } from "@nekoria/game-core";
import type { AttackIntentPayload, CombatResultPayload } from "@nekoria/protocol";

interface PlayerState {
  hp: number;
  level: number;
  exp: number;
  statusPoints: number;
  lastAttackAt: number;
  monsters: Map<string, number>;
}

@Injectable()
export class CombatService {
  private readonly players = new Map<object, PlayerState>();

  attack(client: object, intent: AttackIntentPayload): CombatResultPayload | null {
    const player = this.players.get(client) ?? this.createPlayerState();
    this.players.set(client, player);
    if (player.hp <= 0) return null;
    const now = Date.now();
    if (now - player.lastAttackAt < 900) return null;
    const hp = player.monsters.get(intent.targetEntityId);
    if (hp === undefined || hp <= 0) return null;
    player.lastAttackAt = now;
    const roll = Math.random();
    const outcome = roll < 0.1 ? "CRIT" : roll < 0.25 ? "MISS" : "HIT";
    const damage = outcome === "MISS" ? 0 : outcome === "CRIT" ? 18 : 12;
    const targetHp = Math.max(0, hp - damage);
    player.monsters.set(intent.targetEntityId, targetHp);
    const targetDead = targetHp === 0;
    if (!targetDead) player.hp = Math.max(0, player.hp - 4);
    if (targetDead) {
      player.exp += 25;
      while (player.exp >= expForNextLevel(player.level)) {
        player.exp -= expForNextLevel(player.level);
        player.level += 1;
        player.statusPoints += statusPointsForLevel(player.level);
      }
    }
    return { targetEntityId: intent.targetEntityId, outcome, damage, targetHp, targetMaxHp: GREEN_SLIME.maxHp, targetDead, playerHp: player.hp, exp: player.exp, expToNextLevel: expForNextLevel(player.level), level: player.level, statusPoints: player.statusPoints };
  }

  disconnect(client: object): void {
    this.players.delete(client);
  }

  private createPlayerState(): PlayerState {
    return {
      hp: 100,
      level: 1,
      exp: 0,
      statusPoints: 0,
      lastAttackAt: 0,
      monsters: new Map([1, 2, 3, 4, 5].map((id) => [`monster-green-slime-${id}`, GREEN_SLIME.maxHp])),
    };
  }
}
