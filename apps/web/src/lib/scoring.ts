import type { FundingReadinessScore, FundingRoute } from "@capital-os/shared";

export type FundingRouteScore = {
  route: FundingRoute;
  score: number;
};

export type FundingScoringInput = {
  stage: string;
  description?: string;
  industry?: string;
  city?: string;
  clientType?: string;
  businessModel?: string;
  revenueRange?: string;
  teamSize?: number;
  tractionSignals?: string[];
  fundingNeedAmount?: number;
  fundingNeedPurpose?: string;
  preferredFundingTypes?: string[];
  previousFundingAttempts?: string;
  preparedDocuments?: string[];
  mainPain?: string;
};

const routeScoreKey: Record<
  Exclude<FundingRoute, "preparation" | "pre_ipo">,
  keyof FundingReadinessScore
> = {
  grant: "grant",
  accelerator: "accelerator",
  corporate_pilot: "pilot",
  angel: "angel",
  vc: "vc",
  cvc: "cvc",
  debt: "debt"
};

export function calculateFundingProbabilityScore(
  input: FundingScoringInput
): FundingReadinessScore {
  const preparedDocuments = input.preparedDocuments ?? [];
  const tractionSignals = input.tractionSignals ?? [];
  const preferredFundingTypes = input.preferredFundingTypes ?? [];
  const text = normalizeText([
    input.description,
    input.industry,
    input.fundingNeedPurpose,
    input.previousFundingAttempts,
    input.mainPain,
    input.businessModel,
    input.clientType
  ]);
  const score: FundingReadinessScore = {
    grant: 30,
    accelerator: 26,
    pilot: 18,
    angel: 16,
    vc: 10,
    cvc: 12,
    debt: 6,
    document: 18,
    legal: preparedDocuments.includes("legal_entity") ? 46 : 18
  };

  applyStage(score, input.stage);
  applyTraction(score, tractionSignals);
  applyRevenue(score, input.revenueRange);
  applyDocuments(score, preparedDocuments);
  applyPreferences(score, preferredFundingTypes);
  applyDescription(score, text);
  applyFundingAmount(score, input.fundingNeedAmount, input.revenueRange);
  applyTeam(score, input.teamSize);

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

  return normalizeScore(score);
}

export function rankFundingRouteScores(
  score: FundingReadinessScore,
  input?: FundingScoringInput
): FundingRouteScore[] {
  const routes: FundingRouteScore[] = [
    { route: "grant", score: score.grant },
    { route: "accelerator", score: score.accelerator },
    { route: "corporate_pilot", score: score.pilot },
    { route: "angel", score: score.angel },
    { route: "vc", score: score.vc },
    { route: "cvc", score: score.cvc },
    { route: "debt", score: score.debt },
    { route: "pre_ipo", score: calculatePreIpoScore(score, input) }
  ];

  return routes.sort((a, b) => b.score - a.score);
}

export function getFundingRouteProbability(
  route: FundingRoute,
  score: FundingReadinessScore,
  input?: FundingScoringInput
) {
  if (route === "preparation") {
    return calculatePreparationScore(score);
  }

  if (route === "pre_ipo") {
    return calculatePreIpoScore(score, input);
  }

  return score[routeScoreKey[route]];
}

export function calculatePreparationScore(score: FundingReadinessScore) {
  const maxFundingScore = Math.max(
    score.grant,
    score.accelerator,
    score.pilot,
    score.angel,
    score.vc,
    score.cvc,
    score.debt
  );
  const readinessGap = 100 - Math.min(score.document, score.legal);

  return clamp(readinessGap * 0.55 + (100 - maxFundingScore) * 0.35);
}

function applyStage(score: FundingReadinessScore, stage: string) {
  if (stage === "idea") {
    score.grant += 24;
    score.accelerator += 14;
    score.pilot -= 10;
    score.angel -= 12;
    score.vc -= 22;
    score.cvc -= 14;
    score.debt -= 20;
  }

  if (stage === "prototype") {
    score.grant += 20;
    score.accelerator += 20;
    score.pilot += 10;
    score.angel += 4;
  }

  if (stage === "mvp") {
    score.grant += 12;
    score.accelerator += 28;
    score.pilot += 20;
    score.angel += 14;
    score.vc += 4;
    score.cvc += 6;
  }

  if (stage === "traction") {
    score.grant += 5;
    score.accelerator += 18;
    score.pilot += 30;
    score.angel += 28;
    score.vc += 18;
    score.cvc += 18;
    score.debt += 6;
  }

  if (stage === "revenue") {
    score.accelerator += 8;
    score.pilot += 28;
    score.angel += 30;
    score.vc += 28;
    score.cvc += 28;
    score.debt += 28;
  }

  if (stage === "growth") {
    score.grant -= 6;
    score.accelerator += 4;
    score.pilot += 18;
    score.angel += 26;
    score.vc += 36;
    score.cvc += 34;
    score.debt += 36;
  }
}

function applyTraction(score: FundingReadinessScore, signals: string[]) {
  for (const signal of signals) {
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
}

function applyRevenue(score: FundingReadinessScore, revenueRange?: string) {
  if (revenueRange === "first_sales") {
    score.angel += 10;
    score.pilot += 6;
    score.debt += 4;
  }

  if (revenueRange === "stable") {
    score.debt += 24;
    score.vc += 10;
    score.cvc += 8;
    score.angel += 8;
  }

  if (revenueRange === "growing") {
    score.debt += 18;
    score.vc += 18;
    score.cvc += 12;
    score.angel += 10;
  }
}

function applyDocuments(score: FundingReadinessScore, documents: string[]) {
  score.document += documents.length * 6;

  if (documents.includes("pitch_deck")) {
    score.document += 10;
    score.angel += 5;
    score.vc += 6;
    score.cvc += 4;
  } else {
    score.document -= 12;
    score.angel -= 7;
    score.vc -= 12;
    score.cvc -= 7;
  }

  if (documents.includes("one_pager")) {
    score.document += 5;
    score.accelerator += 3;
    score.pilot += 3;
  }

  if (documents.includes("financial_model")) {
    score.document += 10;
    score.debt += 8;
    score.vc += 7;
    score.cvc += 5;
  } else {
    score.document -= 8;
    score.debt -= 8;
    score.vc -= 6;
  }

  if (documents.includes("legal_entity")) {
    score.legal += 26;
    score.debt += 8;
    score.vc += 7;
    score.cvc += 7;
  } else {
    score.legal -= 16;
    score.debt -= 16;
    score.vc -= 10;
    score.cvc -= 8;
  }

  if (documents.includes("customer_proof")) {
    score.pilot += 7;
    score.angel += 6;
    score.vc += 5;
  }

  if (documents.includes("data_room")) {
    score.document += 12;
    score.vc += 8;
    score.cvc += 8;
  }
}

function applyPreferences(score: FundingReadinessScore, preferences: string[]) {
  if (preferences.includes("grant")) {
    score.grant += 7;
  }
  if (preferences.includes("accelerator")) {
    score.accelerator += 7;
  }
  if (preferences.includes("corporate")) {
    score.pilot += 7;
    score.cvc += 7;
  }
  if (preferences.includes("vc")) {
    score.angel += 6;
    score.vc += 8;
  }
  if (preferences.includes("debt")) {
    score.debt += 7;
  }
}

function applyDescription(score: FundingReadinessScore, text: string) {
  addForKeywords(score, text, ["грант", "r&d", "нир", "исслед", "патент", "университет", "импортозам", "сертификац", "климат", "био", "агро", "медтех", "deeptech"], {
    grant: 12,
    accelerator: 3
  });
  addForKeywords(score, text, ["mvp", "прототип", "первые пользов", "провер", "упаков", "акселератор"], {
    accelerator: 9,
    grant: 3
  });
  addForKeywords(score, text, ["b2b", "корпоратив", "пилот", "enterprise", "ритейл", "банк", "промышлен", "клиник", "логист"], {
    pilot: 12,
    cvc: 9
  });
  addForKeywords(score, text, ["mrr", "arr", "retention", "ltv", "cac", "рост", "масштаб", "подписк", "saas", "маркетплейс"], {
    angel: 8,
    vc: 12,
    cvc: 5
  });
  addForKeywords(score, text, ["выруч", "прибыл", "марж", "контракт", "заказ", "оборот", "производство", "закуп"], {
    debt: 10,
    vc: 4,
    cvc: 5
  });
  addForKeywords(score, text, ["ipo", "облигац", "pre-ipo", "pre ipo"], {
    vc: 8,
    debt: 8,
    legal: 6,
    document: 6
  });

  if (/\d/.test(text)) {
    score.document += 5;
    score.angel += 3;
    score.vc += 3;
  }
}

function applyFundingAmount(
  score: FundingReadinessScore,
  amount?: number,
  revenueRange?: string
) {
  if (!amount || Number.isNaN(amount)) {
    return;
  }

  if (amount <= 3_000_000) {
    score.grant += 7;
    score.accelerator += 5;
    score.vc -= 4;
  }

  if (amount > 3_000_000 && amount <= 15_000_000) {
    score.angel += 7;
    score.pilot += 4;
  }

  if (amount > 15_000_000 && amount <= 70_000_000) {
    score.vc += 9;
    score.cvc += 6;
    score.grant -= 5;
  }

  if (amount > 70_000_000) {
    score.vc += 12;
    score.cvc += 10;
    score.debt += revenueRange === "stable" || revenueRange === "growing" ? 8 : -8;
    score.grant -= 14;
    score.accelerator -= 8;
  }
}

function applyTeam(score: FundingReadinessScore, teamSize?: number) {
  if (!teamSize || Number.isNaN(teamSize)) {
    return;
  }

  if (teamSize <= 1) {
    score.grant += 2;
    score.accelerator += 3;
    score.angel -= 6;
    score.vc -= 10;
    score.cvc -= 6;
    score.debt -= 4;
  }

  if (teamSize >= 3 && teamSize <= 8) {
    score.accelerator += 4;
    score.pilot += 4;
    score.angel += 5;
    score.vc += 5;
  }

  if (teamSize > 8) {
    score.vc += 7;
    score.cvc += 6;
    score.debt += 5;
  }
}

function calculatePreIpoScore(
  score: FundingReadinessScore,
  input?: FundingScoringInput
) {
  const stageBoost = input?.stage === "growth" ? 18 : input?.stage === "revenue" ? 6 : -22;
  const revenueBoost =
    input?.revenueRange === "growing" || input?.revenueRange === "stable" ? 10 : -10;

  return clamp(score.vc * 0.34 + score.debt * 0.28 + score.legal * 0.2 + score.document * 0.18 + stageBoost + revenueBoost);
}

function normalizeScore(score: FundingReadinessScore): FundingReadinessScore {
  return {
    grant: clamp(score.grant),
    accelerator: clamp(score.accelerator),
    pilot: clamp(score.pilot),
    angel: clamp(score.angel),
    vc: clamp(score.vc),
    cvc: clamp(score.cvc),
    debt: clamp(score.debt),
    document: clamp(score.document),
    legal: clamp(score.legal)
  };
}

function addForKeywords(
  score: FundingReadinessScore,
  text: string,
  keywords: string[],
  patch: Partial<FundingReadinessScore>
) {
  if (!keywords.some((keyword) => text.includes(keyword))) {
    return;
  }

  for (const [key, value] of Object.entries(patch)) {
    score[key as keyof FundingReadinessScore] += value;
  }
}

function normalizeText(values: Array<string | undefined>) {
  return values.filter(Boolean).join(" ").trim().toLowerCase();
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}
