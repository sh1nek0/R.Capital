import { Module } from "@nestjs/common";
import { StartupsController } from "./startups.controller";

@Module({
  controllers: [StartupsController]
})
export class StartupsModule {}

