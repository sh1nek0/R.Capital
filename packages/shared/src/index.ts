export type UserRole = "founder" | "analyst" | "admin";

export type StartupStage =
  | "idea"
  | "prototype"
  | "mvp"
  | "traction"
  | "revenue"
  | "growth";

export type FundingRoute =
  | "preparation"
  | "grant"
  | "accelerator"
  | "corporate_pilot"
  | "angel"
  | "vc"
  | "cvc"
  | "debt"
  | "pre_ipo";

export type OpportunityType =
  | "grant"
  | "accelerator"
  | "fund"
  | "angel_network"
  | "cvc"
  | "corporate_pilot"
  | "contest"
  | "oip_partner"
  | "bank"
  | "debt";

export type ConsultationType =
  | "free_roadmap"
  | "expert_review"
  | "readiness_report"
  | "fundraising_prep";

export type StartupStatus =
  | "new"
  | "needs_review"
  | "reviewed"
  | "report_generated"
  | "report_sent"
  | "interview_requested"
  | "interview_scheduled"
  | "interview_done"
  | "paid_review_offered"
  | "paid_review_won"
  | "paid_review_lost"
  | "not_relevant";

export interface FundingReadinessScore {
  grant: number;
  accelerator: number;
  pilot: number;
  angel: number;
  vc: number;
  cvc: number;
  debt: number;
  document: number;
  legal: number;
}

export interface FundingRouteScore {
  route: FundingRoute;
  score: number;
}

export interface RouteRecommendation {
  primaryRoute: FundingRoute;
  secondaryRoutes: FundingRoute[];
  notRecommendedRoutes: FundingRoute[];
  routeScores: FundingRouteScore[];
  reasoning: string[];
  nextSteps: string[];
}

export const FUNDING_ROUTE_LABELS: Record<FundingRoute, string> = {
  preparation: "Preparation Route",
  grant: "Grant Route",
  accelerator: "Accelerator Route",
  corporate_pilot: "Corporate Pilot Route",
  angel: "Angel Route",
  vc: "VC Route",
  cvc: "CVC Route",
  debt: "Debt / Crowdlending Route",
  pre_ipo: "Pre-IPO / Bonds Route"
};
