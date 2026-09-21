import { Module } from "@nestjs/common";
import { AppController } from "./app.controller.js";
import { CombatService } from "./combat.service.js";
import { GameGateway } from "./game.gateway.js";
import { LootService } from "./loot.service.js";

@Module({ controllers: [AppController], providers: [CombatService, LootService, GameGateway] })
export class AppModule {}
