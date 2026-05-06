import type {
  FundingReadinessScore,
  FundingRoute,
  StartupStatus
} from "@capital-os/shared";
import {
  calculateFundingProbabilityScore,
  calculatePreparationScore,
  getFundingRouteProbability,
  rankFundingRouteScores,
  type FundingRouteScore
} from "@/lib/scoring";

export type DiagnosticStage =
  | "idea"
  | "prototype"
  | "mvp"
  | "traction"
  | "revenue"
  | "growth";

export type DiagnosticFormValues = {
  founderName: string;
  email: string;
  telegram?: string;
  phone?: string;
  consent: boolean;
  startupName: string;
  description: string;
  website?: string;
  industry: string;
  city?: string;
  clientType: string;
  businessModel: string;
  stage: DiagnosticStage;
  revenueRange: string;
  teamSize: number;
  tractionSignals: string[];
  fundingNeedAmount: number;
  fundingNeedPurpose: string;
  preferredFundingTypes: string[];
  previousFundingAttempts?: string;
  preparedDocuments: string[];
  mainPain: string;
  interviewInterest: string;
  paidReadiness: string;
};

export type StoredDiagnostic = {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: StartupStatus;
  form: DiagnosticFormValues;
  score: FundingReadinessScore;
  route: RouteViewModel;
  notes: AdminNote[];
  showcase: ShowcaseProfile;
};

export type RouteViewModel = {
  primaryRoute: FundingRoute;
  secondaryRoutes: FundingRoute[];
  notRecommendedRoutes: FundingRoute[];
  routeScores: FundingRouteScore[];
  reasoning: string[];
  nextSteps: string[];
  gaps: string[];
};

export type AdminNote = {
  id: string;
  text: string;
  createdAt: string;
};

export type ShowcaseModerationStatus = "pending" | "published" | "rejected";

export type ShowcaseProfile = {
  status: ShowcaseModerationStatus;
  name: string;
  tagline: string;
  description: string;
  industry: string;
  city: string;
  businessModel: string;
  traction: string[];
  needs: string[];
  color: string;
  publishedAt?: string;
  updatedAt: string;
};

export type StoredConsultation = {
  id: string;
  startupId?: string;
  type: string;
  preferredContact: string;
  comment?: string;
  status: "requested" | "scheduled" | "done" | "won" | "lost";
  createdAt: string;
};

export const stageLabels: Record<DiagnosticStage, string> = {
  idea: "Идея",
  prototype: "Прототип",
  mvp: "MVP",
  traction: "Первые пользователи",
  revenue: "Выручка",
  growth: "Рост"
};

export const routeLabels: Record<FundingRoute, string> = {
  preparation: "Подготовительный маршрут",
  grant: "Гранты",
  accelerator: "Акселератор",
  corporate_pilot: "Корпоративный пилот",
  angel: "Ангельский раунд",
  vc: "Венчурный фонд",
  cvc: "Корпоративный фонд",
  debt: "Долг / краудлендинг",
  pre_ipo: "Pre-IPO / облигации"
};

export const statusLabels: Record<StartupStatus, string> = {
  new: "Новая",
  needs_review: "Нужен разбор",
  reviewed: "Разобрана",
  report_generated: "Отчет готов",
  report_sent: "Отчет отправлен",
  interview_requested: "Запрошено интервью",
  interview_scheduled: "Интервью назначено",
  interview_done: "Интервью проведено",
  paid_review_offered: "Предложен платный разбор",
  paid_review_won: "Платный разбор выигран",
  paid_review_lost: "Платный разбор потерян",
  not_relevant: "Не релевантно"
};

const diagnosticsKey = "capital-os.diagnostics.v1";
const consultationsKey = "capital-os.consultations.v1";

export const defaultDiagnosticValues: DiagnosticFormValues = {
  founderName: "",
  email: "",
  telegram: "",
  phone: "",
  consent: false,
  startupName: "",
  description: "",
  website: "",
  industry: "",
  city: "",
  clientType: "b2b",
  businessModel: "saas",
  stage: "mvp",
  revenueRange: "pre_revenue",
  teamSize: 3,
  tractionSignals: [],
  fundingNeedAmount: 3000000,
  fundingNeedPurpose: "",
  preferredFundingTypes: [],
  previousFundingAttempts: "",
  preparedDocuments: [],
  mainPain: "",
  interviewInterest: "yes",
  paidReadiness: "maybe"
};

export function createDiagnostic(values: DiagnosticFormValues): StoredDiagnostic {
  const now = new Date().toISOString();
  const score = calculateFundingScore(values);
  const route = buildRoute(values, score);

  return {
    id: createId("startup"),
    createdAt: now,
    updatedAt: now,
    status: values.interviewInterest === "yes" ? "interview_requested" : "new",
    form: values,
    score,
    route,
    notes: [],
    showcase: createShowcaseProfile(values, score, route)
  };
}

export function saveDiagnostic(values: DiagnosticFormValues): StoredDiagnostic {
  const diagnostic = createDiagnostic(values);
  const items = listDiagnostics();
  writeDiagnostics([diagnostic, ...items.filter((item) => item.id !== diagnostic.id)]);
  return diagnostic;
}

export function listDiagnostics(includeDemo = false): StoredDiagnostic[] {
  const stored = readJson<StoredDiagnostic[]>(diagnosticsKey, []);
  const normalized = stored.map(normalizeDiagnostic);

  return includeDemo && normalized.length === 0
    ? demoDiagnostics.map(normalizeDiagnostic)
    : normalized;
}

export function listFounderDiagnostics(email?: string): StoredDiagnostic[] {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    return [];
  }

  return listDiagnostics(false).filter(
    (item) => normalizeEmail(item.form.email) === normalizedEmail
  );
}

export function findDiagnostic(
  id: string,
  includeDemo = false
): StoredDiagnostic | undefined {
  return listDiagnostics(includeDemo).find((item) => item.id === id);
}

export function updateDiagnosticStatus(id: string, status: StartupStatus) {
  mutateDiagnostic(id, (item) => ({
    ...item,
    status,
    updatedAt: new Date().toISOString()
  }));
}

export function updateDiagnosticRoute(id: string, primaryRoute: FundingRoute) {
  mutateDiagnostic(id, (item) => ({
    ...item,
    route: {
      ...item.route,
      primaryRoute
    },
    updatedAt: new Date().toISOString()
  }));
}

export function recalculateDiagnosticScore(id: string) {
  mutateDiagnostic(id, (item) => {
    const score = calculateFundingScore(item.form);
    const route = buildRoute(item.form, score);

    return {
      ...item,
      score,
      route,
      showcase: {
        ...item.showcase,
        color: item.showcase.color || getRouteColor(route.primaryRoute),
        updatedAt: new Date().toISOString()
      },
      updatedAt: new Date().toISOString()
    };
  });
}

export function addDiagnosticNote(id: string, text: string) {
  mutateDiagnostic(id, (item) => ({
    ...item,
    notes: [
      {
        id: createId("note"),
        text,
        createdAt: new Date().toISOString()
      },
      ...item.notes
    ],
    updatedAt: new Date().toISOString()
  }));
}

export function updateDiagnosticShowcase(
  id: string,
  patch: Partial<ShowcaseProfile>
) {
  const now = new Date().toISOString();

  mutateDiagnostic(id, (item) => {
    const current = item.showcase ?? createShowcaseProfile(item.form, item.score, item.route);
    const nextStatus = patch.status ?? current.status;
    const wasPublished = current.status === "published";
    const isPublished = nextStatus === "published";

    return {
      ...item,
      showcase: {
        ...current,
        ...patch,
        status: nextStatus,
        publishedAt:
          isPublished && !wasPublished
            ? now
            : isPublished
              ? current.publishedAt ?? now
              : undefined,
        updatedAt: now
      },
      updatedAt: now
    };
  });
}

export function createShowcaseProfile(
  values: DiagnosticFormValues,
  score: FundingReadinessScore,
  route: RouteViewModel,
  status: ShowcaseModerationStatus = "pending"
): ShowcaseProfile {
  const now = new Date().toISOString();
  const traction = [
    stageLabels[values.stage],
    ...values.tractionSignals.map((signal) => tractionSignalLabels[signal] ?? signal)
  ].filter(Boolean);
  const needs = route.nextSteps.slice(0, 3);

  return {
    status,
    name: values.startupName || "Новый проект",
    tagline: buildTagline(values),
    description: values.description || "Описание проекта пока не заполнено.",
    industry: values.industry || "Не указано",
    city: values.city || "Не указан",
    businessModel: businessModelLabels[values.businessModel] ?? values.businessModel,
    traction: traction.length > 0 ? traction : ["Требуется модерация"],
    needs: needs.length > 0 ? needs : ["Подготовить публичное описание"],
    color: getRouteColor(route.primaryRoute),
    updatedAt: now
  };
}

export function saveConsultation(
  input: Omit<StoredConsultation, "id" | "status" | "createdAt">
): StoredConsultation {
  const consultation: StoredConsultation = {
    id: createId("consultation"),
    status: "requested",
    createdAt: new Date().toISOString(),
    ...input
  };
  const items = listConsultations();
  writeJson(consultationsKey, [consultation, ...items]);

  if (consultation.startupId) {
    updateDiagnosticStatus(consultation.startupId, "interview_requested");
  }

  return consultation;
}

export function listConsultations(includeDemo = false): StoredConsultation[] {
  const stored = readJson<StoredConsultation[]>(consultationsKey, []);
  return includeDemo && stored.length === 0 ? demoConsultations : stored;
}

export function listFounderConsultations(email?: string): StoredConsultation[] {
  const startupIds = new Set(listFounderDiagnostics(email).map((item) => item.id));

  if (startupIds.size === 0) {
    return [];
  }

  return listConsultations(false).filter(
    (item) => item.startupId && startupIds.has(item.startupId)
  );
}

export function updateConsultationStatus(
  id: string,
  status: StoredConsultation["status"]
) {
  const items = listConsultations();
  writeJson(
    consultationsKey,
    items.map((item) => (item.id === id ? { ...item, status } : item))
  );
}

export function calculateFundingScore(
  values: DiagnosticFormValues
): FundingReadinessScore {
  return calculateFundingProbabilityScore(values);
}

export function buildRoute(
  values: DiagnosticFormValues,
  score: FundingReadinessScore
): RouteViewModel {
  const routeScores = rankFundingRouteScores(score, values);
  const preparationScore = calculatePreparationScore(score);
  const primaryRoute =
    routeScores[0].score < 38 || preparationScore > routeScores[0].score + 10
      ? "preparation"
      : routeScores[0].route;
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
    reasoning: buildReasoning(values, primaryRoute, routeScores),
    nextSteps: buildNextSteps(values, primaryRoute),
    gaps: buildGaps(values)
  };
}

function buildReasoning(
  values: DiagnosticFormValues,
  route: FundingRoute,
  routeScores: FundingRouteScore[]
) {
  const topRoute = routeScores[0];
  const items = [
    `Стадия проекта: ${stageLabels[values.stage]}.`,
    `Скоринг оценивает вероятность получить желаемое финансирование по каждому источнику; лучший источник сейчас: ${routeLabels[topRoute.route]} (${topRoute.score}%).`,
    "На расчет влияют стадия, описание проекта, traction, выручка, сумма запроса, документы и юридическая готовность."
  ];

  if (route === "accelerator") {
    items.push("Акселератор выглядит сильнее, потому что проекту важны упаковка, подтверждение спроса и быстрый доступ к партнерам.");
  }
  if (route === "corporate_pilot") {
    items.push("Корпоративный пилот вероятен, если описание, B2B-контекст и traction можно превратить в проверяемый пилот.");
  }
  if (route === "preparation") {
    items.push("Подготовительный маршрут выбран, потому что вероятность по источникам капитала пока ниже, чем пробелы в документах или структуре.");
  }
  if (route === "vc") {
    items.push("VC-маршрут требует сильной динамики, рынка, метрик и доказательной базы в материалах.");
  }
  if (route === "debt") {
    items.push("Долговой маршрут усиливается при стабильной или растущей выручке, понятной маржинальности и юридической структуре.");
  }
  if (route === "grant") {
    items.push("Гранты выглядят реалистичнее для ранних, технологичных, исследовательских или социально значимых проектов.");
  }

  return items;
}

function buildNextSteps(values: DiagnosticFormValues, route: FundingRoute) {
  const common = [
    "Сформировать one-pager с проблемой, решением, рынком и текущими цифрами.",
    "Собрать список 15-20 релевантных контактов: программы, пилоты, ангелы или фонды.",
    "Назначить внутренний review по документам и финансовой логике."
  ];

  if (!values.preparedDocuments.includes("pitch_deck")) {
    common.unshift("Подготовить pitch deck на 10-12 слайдов.");
  }

  if (route === "grant") {
    common.unshift("Выбрать 3-5 грантовых программ по отрасли и стадии.");
  }
  if (route === "corporate_pilot") {
    common.unshift("Описать пилот на 6-8 недель: цель, метрики, ресурсы, цена.");
  }
  if (route === "angel" || route === "vc") {
    common.unshift("Подготовить инвестиционный teaser и список ключевых метрик.");
  }

  return common.slice(0, 5);
}

function buildGaps(values: DiagnosticFormValues) {
  const gaps: string[] = [];

  if (!values.preparedDocuments.includes("pitch_deck")) {
    gaps.push("Нет pitch deck.");
  }
  if (!values.preparedDocuments.includes("financial_model")) {
    gaps.push("Нет финансовой модели.");
  }
  if (!values.preparedDocuments.includes("legal_entity")) {
    gaps.push("Не подтверждена юридическая структура.");
  }
  if (values.tractionSignals.length === 0) {
    gaps.push("Не указаны traction-сигналы.");
  }
  if (!values.fundingNeedPurpose) {
    gaps.push("Не описана цель привлечения капитала.");
  }

  return gaps.length > 0 ? gaps : ["Критичных пробелов в базовой диагностике не найдено."];
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

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function mutateDiagnostic(
  id: string,
  updater: (diagnostic: StoredDiagnostic) => StoredDiagnostic
) {
  const items = listDiagnostics();
  const hasItem = items.some((item) => item.id === id);

  if (hasItem) {
    writeDiagnostics(items.map((item) => (item.id === id ? updater(item) : item)));
    return;
  }

  const demoItem = demoDiagnostics.find((item) => item.id === id);
  if (demoItem) {
    writeDiagnostics([updater(normalizeDiagnostic(demoItem)), ...items]);
  }
}

function writeDiagnostics(items: StoredDiagnostic[]) {
  writeJson(diagnosticsKey, items.map(normalizeDiagnostic));
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

function createId(prefix: string) {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);

  return `${prefix}_${random}`;
}

function normalizeEmail(email?: string) {
  return email?.trim().toLowerCase() ?? "";
}

function normalizeDiagnostic(item: StoredDiagnostic): StoredDiagnostic {
  const score = item.route?.routeScores ? item.score : calculateFundingScore(item.form);
  const route = item.route?.routeScores ? item.route : buildRoute(item.form, score);

  return {
    ...item,
    score,
    route,
    showcase: item.showcase ?? createShowcaseProfile(item.form, score, route)
  };
}

function buildTagline(values: DiagnosticFormValues) {
  const stage = stageLabels[values.stage];
  const industry = values.industry || "своем рынке";

  return `${stage}-проект в сфере ${industry}`;
}

const tractionSignalLabels: Record<string, string> = {
  users: "Первые пользователи",
  pilots: "Пилоты",
  paying_customers: "Платящие клиенты",
  loi: "LOI",
  growth: "Рост метрик",
  partners: "Партнерства"
};

const businessModelLabels: Record<string, string> = {
  saas: "Подписка",
  transaction: "Комиссия",
  hardware: "Оборудование",
  service: "Сервисная модель",
  license: "Лицензия"
};

function getRouteColor(route: FundingRoute) {
  const colors: Record<FundingRoute, string> = {
    preparation: "#537188",
    grant: "#f2c14e",
    accelerator: "#2fbf71",
    corporate_pilot: "#537188",
    angel: "#f2c14e",
    vc: "#2fbf71",
    cvc: "#537188",
    debt: "#17212b",
    pre_ipo: "#17212b"
  };

  return colors[route];
}

export const demoDiagnostics: StoredDiagnostic[] = [
  createDemoDiagnostic({
    startupName: "NeuroDesk",
    founderName: "Анна",
    email: "anna@neurodesk.local",
    industry: "B2B SaaS",
    stage: "mvp",
    revenueRange: "pre_revenue",
    preparedDocuments: ["pitch_deck", "one_pager"],
    tractionSignals: ["pilots", "loi"],
    mainPain: "Нужно упаковать пилот и выбрать акселераторы."
  }),
  createDemoDiagnostic({
    startupName: "BioPack",
    founderName: "Илья",
    email: "ilya@biopack.local",
    industry: "Climate Tech",
    stage: "revenue",
    revenueRange: "stable",
    preparedDocuments: ["pitch_deck", "financial_model", "legal_entity"],
    tractionSignals: ["paying_customers", "pilots"],
    mainPain: "Нужны корпоративные пилоты и CVC-интро."
  })
];

const demoConsultations: StoredConsultation[] = [
  {
    id: "consultation_demo_1",
    startupId: "startup_demo_neurodesk",
    type: "expert_review",
    preferredContact: "Telegram",
    comment: "Хочу разобрать маршрут акселератор -> пилот.",
    status: "requested",
    createdAt: new Date().toISOString()
  }
];

function createDemoDiagnostic(
  patch: Partial<DiagnosticFormValues>
): StoredDiagnostic {
  const form: DiagnosticFormValues = {
    ...defaultDiagnosticValues,
    description:
      "Продукт помогает компаниям быстрее проверять спрос и готовить данные для следующего шага финансирования.",
    clientType: "b2b",
    businessModel: "saas",
    fundingNeedAmount: 5000000,
    fundingNeedPurpose: "Пилоты, продуктовая разработка и упаковка продаж.",
    preferredFundingTypes: ["accelerator", "corporate"],
    interviewInterest: "yes",
    paidReadiness: "maybe",
    consent: true,
    ...patch
  };
  const score = calculateFundingScore(form);
  const route = buildRoute(form, score);
  const isBioPack = form.startupName === "BioPack";

  return {
    id: isBioPack ? "startup_demo_biopack" : "startup_demo_neurodesk",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: isBioPack ? "needs_review" : "new",
    form,
    score,
    route,
    showcase: createShowcaseProfile(form, score, route),
    notes: [
      {
        id: createId("note"),
        text: "Демо-заявка для проверки интерфейса.",
        createdAt: new Date().toISOString()
      }
    ]
  };
}
