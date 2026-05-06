import { Body, Controller, Post } from "@nestjs/common";

@Controller("consultations")
export class ConsultationsController {
  @Post()
  create(@Body() body: unknown) {
    return {
      consultationId: "stub-consultation-id",
      status: "interview_requested",
      body
    };
  }
}

