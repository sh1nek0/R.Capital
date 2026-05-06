import { Body, Controller, Post } from "@nestjs/common";

@Controller("leads")
export class LeadsController {
  @Post()
  create(@Body() body: unknown) {
    return {
      leadId: "stub-lead-id",
      status: "created",
      body
    };
  }
}

