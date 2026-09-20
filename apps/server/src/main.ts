import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";
import { WsAdapter } from "@nestjs/platform-ws";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.useWebSocketAdapter(new WsAdapter(app));
  app.enableCors({ origin: process.env.CORS_ORIGIN ?? "http://localhost:5173" });
  await app.listen(Number(process.env.PORT ?? 3001), "0.0.0.0");
}

void bootstrap();
