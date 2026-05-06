import type { FundingReadinessScore, FundingRoute } from "@capital-os/shared";
import {
  listDiagnostics,
  type DiagnosticStage,
  type StoredDiagnostic
} from "@/lib/diagnostic";
import {
  calculateFundingProbabilityScore,
  getFundingRouteProbability,
  rankFundingRouteScores,
  type FundingScoringInput
} from "@/lib/scoring";

export type ShowcaseStartup = {
  id: string;
  source?: "demo" | "moderated";
  name: string;
  tagline: string;
  description: string;
  industry: string;
  stage: DiagnosticStage;
  route: FundingRoute;
  city: string;
  businessModel: string;
  traction: string[];
  needs: string[];
  color: string;
};

export const showcaseStartups: ShowcaseStartup[] = [
  {
    id: "neurodesk",
    name: "NeuroDesk",
    tagline: "ИИ-поддержка для нишевых корпоративных сервисов",
    description:
      "Автоматизирует первую линию поддержки и собирает продуктовые инсайты из клиентских обращений.",
    industry: "Корпоративный SaaS",
    stage: "mvp",
    route: "accelerator",
    city: "Москва",
    businessModel: "Подписка",
    traction: ["MVP", "2 пилота", "LOI"],
    needs: ["Pitch deck", "Корпоративные пилоты", "Акселератор"],
    color: "#2fbf71"
  },
  {
    id: "biopack",
    name: "BioPack",
    tagline: "Биоразлагаемая упаковка для продуктового ритейла",
    description:
      "Материалы на растительной основе для сетей, которым нужно снижать пластиковый след без потери маржинальности.",
    industry: "Климатические технологии",
    stage: "revenue",
    route: "corporate_pilot",
    city: "Казань",
    businessModel: "Производство для бизнеса",
    traction: ["Первые продажи", "3 B2B-клиента", "Сертификация"],
    needs: ["CVC intro", "Пилоты", "Финмодель"],
    color: "#537188"
  },
  {
    id: "medroute",
    name: "MedRoute",
    tagline: "Маршрутизация пациентов после первичного приема",
    description:
      "Помогает клиникам снижать потери между консультацией, диагностикой и повторным визитом.",
    industry: "Медтех",
    stage: "traction",
    route: "angel",
    city: "Санкт-Петербург",
    businessModel: "Подписка и использование",
    traction: ["5 клиник", "Платящие клиенты", "Рост MRR"],
    needs: ["Angel round", "Data room", "Unit economics"],
    color: "#f2c14e"
  },
  {
    id: "agrosense",
    name: "AgroSense",
    tagline: "Датчики и аналитика для тепличных комплексов",
    description:
      "Собирает данные по климату и урожайности, показывает операторам отклонения и экономический эффект.",
    industry: "Агротех",
    stage: "prototype",
    route: "grant",
    city: "Краснодар",
    businessModel: "Оборудование и подписка",
    traction: ["Прототип", "1 полевой тест", "Партнерство"],
    needs: ["Грант", "Пилот", "Техдокументация"],
    color: "#17212b"
  },
  {
    id: "finpilot",
    name: "FinPilot",
    tagline: "Финансовое планирование для производственных SMB",
    description:
      "Сводит план-факт, кассовые разрывы и сценарии закупок в один рабочий контур для собственника.",
    industry: "Финтех",
    stage: "growth",
    route: "vc",
    city: "Екатеринбург",
    businessModel: "Подписка",
    traction: ["Рост выручки", "48 клиентов", "Положительный retention"],
    needs: ["Seed round", "Финмодель", "Sales playbook"],
    color: "#2fbf71"
  },
  {
    id: "edulab",
    name: "EduLab",
    tagline: "Практические симуляторы для инженерного образования",
    description:
      "Дает вузам и корпоративным академиям цифровые лаборатории для обучения без дорогого оборудования.",
    industry: "Образовательные технологии",
    stage: "mvp",
    route: "accelerator",
    city: "Новосибирск",
    businessModel: "Лицензия",
    traction: ["MVP", "2 вуза", "Методические партнеры"],
    needs: ["Акселератор", "Грант", "Пилоты"],
    color: "#537188"
  }
];

export const showcaseIndustries = Array.from(
  new Set(showcaseStartups.map((startup) => startup.industry))
);

export function getShowcaseStartup(id: string) {
  return showcaseStartups.find((startup) => startup.id === id);
}

export function listPublishedShowcaseStartups() {
  return listDiagnostics()
    .filter((diagnostic) => diagnostic.showcase.status === "published")
    .map(diagnosticToShowcaseStartup);
}

export function listPendingShowcaseStartups() {
  return listDiagnostics()
    .filter((diagnostic) => diagnostic.showcase.status === "pending")
    .map(diagnosticToShowcaseStartup);
}

export function getPublishedShowcaseStartup(id: string) {
  return listPublishedShowcaseStartups().find((startup) => startup.id === id);
}

export function diagnosticToShowcaseStartup(
  diagnostic: StoredDiagnostic
): ShowcaseStartup {
  const profile = diagnostic.showcase;

  return {
    id: diagnostic.id,
    source: "moderated",
    name: profile.name,
    tagline: profile.tagline,
    description: profile.description,
    industry: profile.industry,
    stage: diagnostic.form.stage,
    route: diagnostic.route.primaryRoute,
    city: profile.city,
    businessModel: profile.businessModel,
    traction: profile.traction,
    needs: profile.needs,
    color: profile.color
  };
}

export function getShowcaseStartupScore(
  startup: ShowcaseStartup
): FundingReadinessScore {
  return calculateFundingProbabilityScore(showcaseToScoringInput(startup));
}

export function getShowcaseRouteScore(startup: ShowcaseStartup) {
  const input = showcaseToScoringInput(startup);
  const score = calculateFundingProbabilityScore(input);

  return getFundingRouteProbability(startup.route, score, input);
}

export function getShowcaseRouteScores(startup: ShowcaseStartup) {
  const input = showcaseToScoringInput(startup);
  const score = calculateFundingProbabilityScore(input);

  return rankFundingRouteScores(score, input);
}

function getDiagnosticRouteScore(diagnostic: StoredDiagnostic) {
  return getFundingRouteProbability(
    diagnostic.route.primaryRoute,
    diagnostic.score,
    diagnostic.form
  );
}

function showcaseToScoringInput(startup: ShowcaseStartup): FundingScoringInput {
  const tractionSignals = startup.traction.flatMap((item) => {
    const value = item.toLowerCase();
    const signals: string[] = [];

    if (value.includes("пилот") || value.includes("pilot")) {
      signals.push("pilots");
    }
    if (value.includes("плат") || value.includes("продаж") || value.includes("клиент")) {
      signals.push("paying_customers");
    }
    if (value.includes("loi")) {
      signals.push("loi");
    }
    if (value.includes("рост") || value.includes("growth") || value.includes("retention")) {
      signals.push("growth");
    }
    if (value.includes("партнер")) {
      signals.push("partners");
    }
    if (value.includes("mvp") || value.includes("пользовател")) {
      signals.push("users");
    }

    return signals;
  });
  const preparedDocuments = [
    ...(startup.stage === "mvp" ? ["one_pager"] : []),
    ...(startup.stage === "traction" ? ["pitch_deck", "customer_proof"] : []),
    ...(startup.stage === "revenue"
      ? ["pitch_deck", "financial_model", "legal_entity", "customer_proof"]
      : []),
    ...(startup.stage === "growth"
      ? ["pitch_deck", "financial_model", "legal_entity", "data_room", "customer_proof"]
      : []),
    ...(startup.traction.some((item) => /loi|сертификац/i.test(item))
      ? ["customer_proof"]
      : [])
  ];

  return {
    stage: startup.stage,
    description: `${startup.tagline}. ${startup.description}`,
    industry: startup.industry,
    city: startup.city,
    businessModel: startup.businessModel,
    revenueRange:
      startup.stage === "growth"
        ? "growing"
        : startup.stage === "revenue"
          ? "stable"
          : startup.traction.some((item) => /продаж|плат|клиент/i.test(item))
            ? "first_sales"
            : "pre_revenue",
    tractionSignals: Array.from(new Set(tractionSignals)),
    preparedDocuments: Array.from(new Set(preparedDocuments)),
    fundingNeedPurpose: startup.needs.join(", "),
    preferredFundingTypes: routeToFundingPreferences(startup.route),
    teamSize: startup.stage === "growth" ? 15 : startup.stage === "revenue" ? 9 : 4,
    fundingNeedAmount:
      startup.stage === "growth"
        ? 80_000_000
        : startup.stage === "revenue"
          ? 35_000_000
          : 8_000_000
  };
}

function routeToFundingPreferences(route: FundingRoute) {
  if (route === "grant") {
    return ["grant"];
  }
  if (route === "accelerator") {
    return ["accelerator"];
  }
  if (route === "corporate_pilot" || route === "cvc") {
    return ["corporate"];
  }
  if (route === "angel" || route === "vc" || route === "pre_ipo") {
    return ["vc"];
  }
  if (route === "debt") {
    return ["debt"];
  }

  return ["not_sure"];
}
