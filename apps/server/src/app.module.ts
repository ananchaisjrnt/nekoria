import { Module } from "@nestjs/common";
import { AppController } from "./app.controller.js";
import { CombatService } from "./combat.service.js";
import { GameGateway } from "./game.gateway.js";

@Module({ controllers: [AppController], providers: [CombatService, GameGateway] })
export class AppModule {}
