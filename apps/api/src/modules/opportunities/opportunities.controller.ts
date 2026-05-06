import { Controller, Get } from "@nestjs/common";

@Controller("opportunities")
export class OpportunitiesController {
  @Get()
  list() {
    return {
      items: []
    };
  }
}

