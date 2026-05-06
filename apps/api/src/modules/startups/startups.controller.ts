import { Controller, Get, Param } from "@nestjs/common";

@Controller("startups")
export class StartupsController {
  @Get(":id/result")
  getResult(@Param("id") id: string) {
    return {
      startupId: id,
      status: "report_generated"
    };
  }
}

