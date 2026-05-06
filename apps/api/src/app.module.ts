import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AdminModule } from "./modules/admin/admin.module";
import { AuthModule } from "./modules/auth/auth.module";
import { ConsultationsModule } from "./modules/consultations/consultations.module";
import { HealthModule } from "./modules/health/health.module";
import { LeadsModule } from "./modules/leads/leads.module";
import { OpportunitiesModule } from "./modules/opportunities/opportunities.module";
import { QuestionnaireModule } from "./modules/questionnaire/questionnaire.module";
import { ReportsModule } from "./modules/reports/reports.module";
import { StartupsModule } from "./modules/startups/startups.module";
import { PrismaModule } from "./prisma/prisma.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    HealthModule,
    AuthModule,
    LeadsModule,
    StartupsModule,
    QuestionnaireModule,
    ReportsModule,
    ConsultationsModule,
    OpportunitiesModule,
    AdminModule
  ]
})
export class AppModule {}
