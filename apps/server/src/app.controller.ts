import { Controller, Get } from "@nestjs/common";

@Controller()
export class AppController {
  @Get("health")
  health() {
    return { service: "nekoria-server", status: "ok", milestone: "paw-meadow-v0.1" } as const;
  }
}

