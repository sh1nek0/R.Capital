import { Module } from "@nestjs/common";
import { RoutingEngine } from "../routing/routing.engine";
import { ScoringEngine } from "../scoring/scoring.engine";
import { QuestionnaireController } from "./questionnaire.controller";
import { QuestionnaireService } from "./questionnaire.service";

@Module({
  controllers: [QuestionnaireController],
  providers: [QuestionnaireService, ScoringEngine, RoutingEngine]
})
export class QuestionnaireModule {}

