import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards
} from "@nestjs/common";
import { AuthService } from "../auth/auth.service";
import { CreateAdminDto } from "../auth/dto/create-admin.dto";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("admin", "analyst")
@Controller("admin")
export class AdminController {
  constructor(private readonly authService: AuthService) {}

  @Roles("admin")
  @Get("admins")
  listAdmins() {
    return this.authService.listAdmins();
  }

  @Roles("admin")
  @Post("admins")
  createAdmin(@Body() body: CreateAdminDto) {
    return this.authService.createAdmin(body);
  }

  @Get("startups")
  listStartups() {
    return {
      items: []
    };
  }

  @Get("startups/:id")
  getStartup(@Param("id") id: string) {
    return {
      id,
      status: "new"
    };
  }

  @Post("startups/:id/recalculate-score")
  recalculateScore(@Param("id") id: string) {
    return {
      id,
      status: "recalculated"
    };
  }

  @Patch("startups/:id/route")
  updateRoute(@Param("id") id: string, @Body() body: unknown) {
    return {
      id,
      body
    };
  }

  @Post("startups/:id/generate-report")
  generateReport(@Param("id") id: string) {
    return {
      id,
      reportStatus: "generated"
    };
  }

  @Patch("startups/:id/status")
  updateStatus(@Param("id") id: string, @Body() body: unknown) {
    return {
      id,
      body
    };
  }

  @Post("startups/:id/notes")
  addNote(@Param("id") id: string, @Body() body: unknown) {
    return {
      id,
      body
    };
  }

  @Get("opportunities")
  listOpportunities() {
    return {
      items: []
    };
  }

  @Post("opportunities")
  createOpportunity(@Body() body: unknown) {
    return {
      opportunityId: "stub-opportunity-id",
      body
    };
  }

  @Patch("opportunities/:id")
  updateOpportunity(@Param("id") id: string, @Body() body: unknown) {
    return {
      id,
      body
    };
  }

  @Roles("admin")
  @Delete("opportunities/:id")
  deleteOpportunity(@Param("id") id: string) {
    return {
      id,
      deleted: true
    };
  }
}
