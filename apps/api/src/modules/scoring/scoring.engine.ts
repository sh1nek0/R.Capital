import { Injectable } from "@nestjs/common";
import type { FundingReadinessScore } from "@capital-os/shared";

interface ScoringInput {
  stage: string;
  revenueRange: string;
  preparedDocuments: string[];
  clientType?: string;
  businessModel?: string;
  teamSize?: number;
  tractionSignals?: string[];
  description?: string;
  industry?: string;
  fundingNeedAmount?: number;
  fundingNeedPurpose?: string;
  preferredFundingTypes?: string[];
  previousFundingAttempts?: string;
  mainPain?: string;
}

@Injectable()
export class ScoringEngine {
  calculate(input: ScoringInput): FundingReadinessScore {
    const score: FundingReadinessScore = {
      grant: 50,
      accelerator: 50,
      pilot: 40,
      angel: 35,
      vc: 30,
      cvc: 30,
      debt: 20,
      document: 35,
      legal: 35
    };
    const preparedDocuments = input.preparedDocuments ?? [];
    const tractionSignals = input.tractionSignals ?? [];
    const preferredFundingTypes = input.preferredFundingTypes ?? [];

    if (input.stage === "idea") {
      score.vc -= 30;
      score.accelerator += 15;
      score.grant += 10;
    }

    if (["mvp", "traction", "revenue", "growth"].includes(input.stage)) {
      score.accelerator += 20;
      score.pilot += 10;
    }

    if (["traction", "revenue", "growth"].includes(input.stage)) {
      score.angel += 15;
      score.vc += 15;
      score.cvc += 10;
    }

    if (["revenue", "growth"].includes(input.stage)) {
      score.debt += 20;
      score.vc += 15;
    }

    if (input.revenueRange === "first_sales") {
      score.angel += 10;
      score.pilot += 8;
    }

    if (input.revenueRange === "stable" || input.revenueRange === "growing") {
      score.debt += 20;
      score.vc += 12;
      score.cvc += 10;
    }

    for (const signal of tractionSignals) {
      if (signal === "users") {
        score.accelerator += 5;
        score.pilot += 5;
        score.angel += 4;
      }
      if (signal === "pilots") {
        score.pilot += 16;
        score.cvc += 10;
        score.grant += 4;
      }
      if (signal === "paying_customers") {
        score.angel += 14;
        score.vc += 12;
        score.cvc += 8;
        score.debt += 12;
      }
      if (signal === "loi") {
        score.pilot += 9;
        score.grant += 6;
        score.angel += 5;
      }
      if (signal === "growth") {
        score.vc += 14;
        score.cvc += 10;
        score.debt += 8;
        score.angel += 8;
      }
      if (signal === "partners") {
        score.pilot += 8;
        score.cvc += 8;
        score.grant += 4;
      }
    }

    if (!preparedDocuments.includes("pitch_deck")) {
      score.document -= 15;
      score.vc -= 10;
    }

    if (preparedDocuments.includes("one_pager")) {
      score.document += 5;
      score.accelerator += 3;
      score.pilot += 3;
    }

    if (preparedDocuments.includes("financial_model")) {
      score.debt += 8;
      score.vc += 6;
      score.document += 8;
    }

    if (preparedDocuments.includes("legal_entity")) {
      score.legal += 20;
      score.debt += 8;
      score.vc += 6;
    }

    if (preparedDocuments.includes("customer_proof")) {
      score.pilot += 7;
      score.angel += 6;
      score.vc += 5;
    }

    if (preparedDocuments.includes("data_room")) {
      score.document += 12;
      score.vc += 8;
      score.cvc += 8;
    }

    if (input.clientType === "b2b" || input.clientType === "b2g") {
      score.pilot += 8;
      score.cvc += 6;
      score.debt += input.clientType === "b2g" ? 4 : 0;
    }

    if (input.businessModel === "saas" || input.businessModel === "license") {
      score.angel += 5;
      score.vc += 7;
      score.cvc += 4;
    }

    if (input.businessModel === "hardware") {
      score.grant += 7;
      score.pilot += 5;
      score.debt += 4;
    }

    for (const preference of preferredFundingTypes) {
      if (preference === "grant") {
        score.grant += 7;
      }
      if (preference === "accelerator") {
        score.accelerator += 7;
      }
      if (preference === "corporate") {
        score.pilot += 7;
        score.cvc += 7;
      }
      if (preference === "vc") {
        score.angel += 6;
        score.vc += 8;
      }
      if (preference === "debt") {
        score.debt += 7;
      }
    }

    if (input.teamSize && !Number.isNaN(input.teamSize)) {
      if (input.teamSize <= 1) {
        score.angel -= 6;
        score.vc -= 10;
        score.cvc -= 6;
        score.debt -= 4;
      }
      if (input.teamSize >= 3 && input.teamSize <= 8) {
        score.accelerator += 4;
        score.pilot += 4;
        score.angel += 5;
        score.vc += 5;
      }
      if (input.teamSize > 8) {
        score.vc += 7;
        score.cvc += 6;
        score.debt += 5;
      }
    }

    this.applyTextSignals(score, [
      input.description,
      input.industry,
      input.fundingNeedPurpose,
      input.previousFundingAttempts,
      input.businessModel,
      input.clientType,
      input.mainPain
    ]);

    if (input.fundingNeedAmount && input.fundingNeedAmount <= 3_000_000) {
      score.grant += 7;
      score.accelerator += 5;
      score.vc -= 4;
    }

    if (
      input.fundingNeedAmount &&
      input.fundingNeedAmount > 3_000_000 &&
      input.fundingNeedAmount <= 15_000_000
    ) {
      score.angel += 7;
      score.pilot += 4;
    }

    if (input.fundingNeedAmount && input.fundingNeedAmount > 15_000_000) {
      score.vc += 8;
      score.cvc += 6;
      score.grant -= 8;
    }

    return this.normalize(score);
  }

  private applyTextSignals(
    score: FundingReadinessScore,
    values: Array<string | undefined>
  ) {
    const text = values.filter(Boolean).join(" ").toLowerCase();

    if (/грант|r&d|нир|исслед|патент|климат|медтех|агро/.test(text)) {
      score.grant += 10;
    }

    if (/b2b|корпоратив|пилот|enterprise|банк|ритейл|промышлен/.test(text)) {
      score.pilot += 12;
      score.cvc += 8;
    }

    if (/mrr|arr|retention|ltv|cac|рост|масштаб|saas/.test(text)) {
      score.angel += 8;
      score.vc += 12;
    }

    if (/выруч|прибыл|марж|контракт|заказ|оборот/.test(text)) {
      score.debt += 10;
      score.vc += 5;
    }
  }

  private normalize(score: FundingReadinessScore): FundingReadinessScore {
    return {
      grant: this.clamp(score.grant),
      accelerator: this.clamp(score.accelerator),
      pilot: this.clamp(score.pilot),
      angel: this.clamp(score.angel),
      vc: this.clamp(score.vc),
      cvc: this.clamp(score.cvc),
      debt: this.clamp(score.debt),
      document: this.clamp(score.document),
      legal: this.clamp(score.legal)
    };
  }

  private clamp(value: number) {
    return Math.max(0, Math.min(100, Math.round(value)));
  }
}
