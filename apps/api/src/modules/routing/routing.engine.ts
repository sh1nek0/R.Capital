import { Injectable } from "@nestjs/common";
import type {
  FundingReadinessScore,
  FundingRoute,
  FundingRouteScore,
  RouteRecommendation
} from "@capital-os/shared";

@Injectable()
export class RoutingEngine {
  recommend(score: FundingReadinessScore): RouteRecommendation {
    const routeScores = this.rankRoutes(score);
    const preparationScore = this.calculatePreparationScore(score);
    const topRoute = routeScores[0];
    const primaryRoute: FundingRoute =
      topRoute.score < 38 || preparationScore > topRoute.score + 10
        ? "preparation"
        : topRoute.route;
    const secondaryRoutes = routeScores
      .filter((item) => item.route !== primaryRoute && item.score >= 42)
      .slice(0, 3)
      .map((item) => item.route);
    const notRecommendedRoutes = routeScores
      .filter((item) => item.score < 32)
      .map((item) => item.route);

    return {
      primaryRoute,
      secondaryRoutes,
      notRecommendedRoutes,
      routeScores,
      reasoning: [
        `Скоринг оценивает вероятность получить желаемое финансирование по каждому источнику; лучший источник сейчас: ${topRoute.route} (${topRoute.score}%).`,
        "На расчет влияют стадия, описание проекта, traction, выручка, сумма запроса, документы и юридическая готовность.",
        "Результат является подготовительной диагностикой, а не инвестиционной рекомендацией."
      ],
      nextSteps: [
        "Подготовить pitch deck и one-pager.",
        "Собрать подтверждения спроса.",
        "Выбрать 3-7 релевантных возможностей финансирования.",
        "Запланировать экспертный разбор."
      ]
    };
  }

  private rankRoutes(score: FundingReadinessScore): FundingRouteScore[] {
    const routes: FundingRouteScore[] = [
      { route: "grant", score: score.grant },
      { route: "accelerator", score: score.accelerator },
      { route: "corporate_pilot", score: score.pilot },
      { route: "angel", score: score.angel },
      { route: "vc", score: score.vc },
      { route: "cvc", score: score.cvc },
      { route: "debt", score: score.debt },
      { route: "pre_ipo", score: this.calculatePreIpoScore(score) }
    ];

    return routes.sort((a, b) => b.score - a.score);
  }

  private calculatePreparationScore(score: FundingReadinessScore) {
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

    return this.clamp(readinessGap * 0.55 + (100 - maxFundingScore) * 0.35);
  }

  private calculatePreIpoScore(score: FundingReadinessScore) {
    return this.clamp(
      score.vc * 0.34 + score.debt * 0.28 + score.legal * 0.2 + score.document * 0.18 - 8
    );
  }

  private clamp(value: number) {
    return Math.max(0, Math.min(100, Math.round(value)));
  }
}
