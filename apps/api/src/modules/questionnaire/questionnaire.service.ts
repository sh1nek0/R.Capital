import { Injectable } from "@nestjs/common";
import { RoutingEngine } from "../routing/routing.engine";
import { ScoringEngine } from "../scoring/scoring.engine";
import { SubmitQuestionnaireDto } from "./dto/submit-questionnaire.dto";

@Injectable()
export class QuestionnaireService {
  constructor(
    private readonly scoringEngine: ScoringEngine,
    private readonly routingEngine: RoutingEngine
  ) {}

  async submit(dto: SubmitQuestionnaireDto) {
    const score = this.scoringEngine.calculate({
      stage: dto.stage,
      revenueRange: dto.revenueRange,
      clientType: dto.clientType,
      businessModel: dto.businessModel,
      teamSize: Number(dto.teamSize),
      tractionSignals: dto.tractionSignals,
      preparedDocuments: dto.preparedDocuments,
      description: dto.description,
      industry: dto.industry,
      fundingNeedAmount: Number(dto.fundingNeedAmount),
      fundingNeedPurpose: dto.fundingNeedPurpose,
      preferredFundingTypes: dto.preferredFundingTypes,
      previousFundingAttempts: dto.previousFundingAttempts,
      mainPain: dto.mainPain
    });
    const route = this.routingEngine.recommend(score);

    return {
      startupId: "stub-startup-id",
      status: "report_generated",
      score,
      route
    };
  }
}
