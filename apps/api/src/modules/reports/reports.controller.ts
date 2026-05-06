import { Controller, Get, Param } from "@nestjs/common";

@Controller("reports")
export class ReportsController {
  @Get(":startupId")
  getByStartup(@Param("startupId") startupId: string) {
    return {
      startupId,
      reportStatus: "draft"
    };
  }
}

