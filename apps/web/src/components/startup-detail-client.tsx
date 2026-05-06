"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, BarChart3, CheckCircle2, Route, Target } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { FundingReadinessScore, FundingRoute } from "@capital-os/shared";
import { ScoreBar } from "@/components/score-bar";
import { routeLabels, stageLabels, type DiagnosticStage } from "@/lib/diagnostic";
import { usePreferences } from "@/lib/preferences";
import {
  getPublishedShowcaseStartup,
  getShowcaseRouteScore,
  getShowcaseRouteScores,
  getShowcaseStartupScore,
  type ShowcaseStartup
} from "@/lib/showcase";

type StartupDetailClientProps = {
  startup?: ShowcaseStartup;
  score?: FundingReadinessScore;
  startupId: string;
};

const pageCopy = {
  ru: {
    back: "К витрине",
    eyebrow: "Профиль стартапа",
    readiness: "Вероятность",
    scoreTitle: "Вероятность маршрута",
    scoreText:
      "Это вероятность получить желаемое финансирование по выбранному источнику с текущим набором данных, а не инвестиционный рейтинг.",
    factsTitle: "Ключевые параметры",
    stage: "Стадия",
    city: "Город",
    model: "Модель",
    route: "Маршрут",
    scoreBreakdown: "Вероятность по источникам финансирования",
    whyScore: "Почему такая вероятность",
    signals: "Сигналы спроса",
    needs: "Что нужно подготовить",
    nextSteps: "Следующие шаги",
    compare: "Сравнить со своим проектом",
    disclaimer:
      "Профиль носит информационный характер: Capital OS не принимает инвестиции, не организует сделки и не гарантирует финансирование."
  },
  en: {
    back: "Back to showcase",
    eyebrow: "Startup profile",
    readiness: "Probability",
    scoreTitle: "Route probability",
    scoreText:
      "This is the probability of getting the desired financing from the selected source with the current data set, not an investment rating.",
    factsTitle: "Key parameters",
    stage: "Stage",
    city: "City",
    model: "Model",
    route: "Route",
    scoreBreakdown: "Funding source probability",
    whyScore: "Why this probability",
    signals: "Demand signals",
    needs: "What to prepare",
    nextSteps: "Next steps",
    compare: "Compare with my project",
    disclaimer:
      "This profile is informational: Capital OS does not accept investments, arrange deals, or guarantee funding."
  }
};

const stageLabelsEn: Record<DiagnosticStage, string> = {
  idea: "Idea",
  prototype: "Prototype",
  mvp: "MVP",
  traction: "Early traction",
  revenue: "Revenue",
  growth: "Growth"
};

const routeLabelsEn: Record<FundingRoute, string> = {
  preparation: "Preparation",
  grant: "Grants",
  accelerator: "Accelerator",
  corporate_pilot: "Corporate pilot",
  angel: "Angel round",
  vc: "VC fund",
  cvc: "Corporate fund",
  debt: "Debt",
  pre_ipo: "Pre-IPO / bonds"
};

export function StartupDetailClient({
  startup,
  score,
  startupId
}: StartupDetailClientProps) {
  const { language } = usePreferences();
  const [resolvedStartup, setResolvedStartup] = useState<ShowcaseStartup | undefined>(
    startup
  );
  const [resolvedScore, setResolvedScore] = useState<FundingReadinessScore | undefined>(
    score
  );
  const [loaded, setLoaded] = useState(Boolean(startup));
  const copy = pageCopy[language];
  const activeStageLabels = language === "ru" ? stageLabels : stageLabelsEn;
  const activeRouteLabels = language === "ru" ? routeLabels : routeLabelsEn;

  useEffect(() => {
    if (startup && score) {
      setResolvedStartup(startup);
      setResolvedScore(score);
      setLoaded(true);
      return;
    }

    const publishedStartup = getPublishedShowcaseStartup(startupId);
    setResolvedStartup(publishedStartup);
    setResolvedScore(
      publishedStartup ? getShowcaseStartupScore(publishedStartup) : undefined
    );
    setLoaded(true);
  }, [score, startup, startupId]);

  const routeScore = resolvedStartup ? getShowcaseRouteScore(resolvedStartup) : 0;

  const sortedScores = useMemo(() => {
    if (!resolvedScore || !resolvedStartup) {
      return [];
    }

    return getShowcaseRouteScores(resolvedStartup).map((routeScore) => ({
      key: routeScore.route,
      label: activeRouteLabels[routeScore.route],
      value: routeScore.score
    }));
  }, [activeRouteLabels, resolvedScore, resolvedStartup]);

  if (!loaded) {
    return (
      <main className="min-h-screen bg-paper px-6 py-10">
        <div className="mx-auto max-w-3xl rounded border border-ink/10 bg-white p-6">
          <p className="text-sm text-ink/70">Загружаю профиль...</p>
        </div>
      </main>
    );
  }

  if (!resolvedStartup || !resolvedScore) {
    return (
      <main className="min-h-screen bg-paper px-6 py-10">
        <div className="mx-auto max-w-3xl rounded border border-ink/10 bg-white p-6">
          <h1 className="text-3xl font-semibold text-ink">Профиль не найден</h1>
          <p className="mt-3 text-sm leading-6 text-ink/65">
            Возможно, проект еще не прошел модерацию или был снят с витрины.
          </p>
          <Link
            href="/startups"
            className="mt-6 inline-flex items-center gap-2 rounded bg-ink px-5 py-3 text-sm font-semibold text-white"
          >
            <ArrowLeft size={16} />
            {copy.back}
          </Link>
        </div>
      </main>
    );
  }

  const scoreReasons = buildScoreReasons(
    resolvedStartup,
    activeStageLabels[resolvedStartup.stage],
    activeRouteLabels[resolvedStartup.route],
    language
  );
  const nextSteps = buildNextSteps(resolvedStartup, language);

  return (
    <main className="min-h-screen bg-paper">
      <section className="mx-auto max-w-7xl px-6 py-10">
        <Link
          href="/startups"
          className="inline-flex items-center gap-2 text-sm font-semibold text-ink/70"
        >
          <ArrowLeft size={16} />
          {copy.back}
        </Link>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
          <section>
            <p className="text-sm font-semibold uppercase tracking-wide text-steel">
              {copy.eyebrow}
            </p>
            <div className="mt-4 flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div>
                <h1 className="text-5xl font-semibold leading-tight text-ink md:text-6xl">
                  {resolvedStartup.name}
                </h1>
                <p className="mt-4 max-w-3xl text-xl font-semibold leading-8 text-ink">
                  {resolvedStartup.tagline}
                </p>
              </div>
              <div
                className="grid h-24 w-24 shrink-0 place-items-center rounded text-2xl font-semibold text-white"
                style={{ backgroundColor: resolvedStartup.color }}
                aria-label={`${copy.readiness}: ${routeScore}`}
              >
                {routeScore}
              </div>
            </div>
            <p className="mt-6 max-w-4xl text-lg leading-8 text-ink/70">
              {resolvedStartup.description}
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Metric label={copy.stage} value={activeStageLabels[resolvedStartup.stage]} />
              <Metric label={copy.city} value={resolvedStartup.city} />
              <Metric label={copy.model} value={resolvedStartup.businessModel} />
              <Metric label={copy.route} value={activeRouteLabels[resolvedStartup.route]} />
            </div>
          </section>

          <aside className="rounded border border-ink/10 bg-white p-6">
            <div className="flex items-start gap-3">
              <BarChart3 className="mt-1 text-mint" size={24} />
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-steel">
                  {copy.readiness}
                </p>
                <h2 className="mt-2 text-3xl font-semibold text-ink">
                  {routeScore}/100
                </h2>
              </div>
            </div>
            <h3 className="mt-6 text-lg font-semibold text-ink">
              {copy.scoreTitle}
            </h3>
            <p className="mt-3 text-sm leading-6 text-ink/70">{copy.scoreText}</p>
            <Link
              href="/diagnostic"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded bg-ink px-5 py-3 text-sm font-semibold text-white"
            >
              {copy.compare}
              <ArrowRight size={16} />
            </Link>
          </aside>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded border border-ink/10 bg-white p-6">
            <div className="flex items-center gap-3">
              <Route className="text-steel" size={22} />
              <h2 className="text-2xl font-semibold text-ink">{copy.whyScore}</h2>
            </div>
            <ul className="mt-5 grid gap-3 text-sm leading-6 text-ink/75">
              {scoreReasons.map((reason) => (
                <li key={reason} className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 shrink-0 text-mint" size={17} />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded border border-ink/10 bg-white p-6">
            <div className="flex items-center gap-3">
              <Target className="text-steel" size={22} />
              <h2 className="text-2xl font-semibold text-ink">{copy.nextSteps}</h2>
            </div>
            <ol className="mt-5 grid gap-3 text-sm leading-6 text-ink/75">
              {nextSteps.map((step, index) => (
                <li key={step} className="flex gap-3">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded bg-paper text-xs font-semibold text-ink">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <section className="mt-8">
          <h2 className="text-3xl font-semibold text-ink">{copy.scoreBreakdown}</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {sortedScores.map((item, index) => (
              <ScoreBar
                key={item.key}
                label={item.label}
                value={item.value}
                tone={index < 3 ? "mint" : index < 6 ? "steel" : "signal"}
              />
            ))}
          </div>
        </section>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <InfoList title={copy.signals} items={resolvedStartup.traction} />
          <InfoList title={copy.needs} items={resolvedStartup.needs} />
        </div>

        <p className="mt-8 rounded border border-ink/10 bg-white p-4 text-sm leading-6 text-ink/65">
          {copy.disclaimer}
        </p>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-ink/10 bg-white p-4">
      <p className="text-xs uppercase tracking-wide text-ink/45">{label}</p>
      <p className="mt-2 text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}

function InfoList({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="rounded border border-ink/10 bg-white p-6">
      <h2 className="text-2xl font-semibold text-ink">{title}</h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item} className="rounded bg-paper px-3 py-2 text-sm text-ink/70">
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}

function buildScoreReasons(
  startup: ShowcaseStartup,
  stageLabel: string,
  routeLabel: string,
  language: "ru" | "en"
) {
  if (language === "en") {
    return [
      `The current stage is ${stageLabel}, so the route is calibrated toward ${routeLabel}.`,
      `${startup.traction.length} demand signals are visible: ${startup.traction.join(", ")}.`,
      `The preparation backlog still includes: ${startup.needs.join(", ")}.`,
      "The probability is reduced while documents, metrics, and partner validation are still incomplete."
    ];
  }

  return [
    `Текущая стадия: ${stageLabel}, поэтому маршрут сфокусирован на направлении "${routeLabel}".`,
    `Видны ${startup.traction.length} сигнала спроса: ${startup.traction.join(", ")}.`,
    `В подготовке остаются: ${startup.needs.join(", ")}.`,
    "Вероятность снижена, пока не закрыты документы, метрики и внешние подтверждения."
  ];
}

function buildNextSteps(startup: ShowcaseStartup, language: "ru" | "en") {
  if (language === "en") {
    return [
      `Package the route narrative around ${startup.route.replace("_", " ")}.`,
      "Refresh the one-pager, pitch materials, and key traction metrics.",
      "Select 10-15 relevant programs, partners, or capital sources.",
      "Run an analyst review before sending the project outward."
    ];
  }

  return [
    "Упаковать короткую логику маршрута и объяснить, почему он подходит именно сейчас.",
    "Обновить one-pager, презентацию и ключевые метрики по спросу.",
    "Собрать 10-15 релевантных программ, партнеров или источников капитала.",
    "Провести аналитический review перед отправкой проекта наружу."
  ];
}
