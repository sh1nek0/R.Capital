"use client";

import Link from "next/link";
import { ArrowRight, Building2, Filter, Search, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { FundingRoute } from "@capital-os/shared";
import { Disclaimer } from "@/components/disclaimer";
import { routeLabels, stageLabels, type DiagnosticStage } from "@/lib/diagnostic";
import { usePreferences } from "@/lib/preferences";
import {
  getShowcaseRouteScore,
  listPendingShowcaseStartups,
  listPublishedShowcaseStartups,
  showcaseStartups,
  type ShowcaseStartup
} from "@/lib/showcase";

const showcaseCopy = {
  ru: {
    eyebrow: "Витрина стартапов",
    title: "Витрина стартапов Capital OS",
    subtitle:
      "Публичный каталог демонстрирует проекты, стадии и маршруты подготовки. Это не инвестиционная доска и не оферта.",
    infoTitle: "Что показывает витрина",
    infoText:
      "У каждого проекта видны стадия, отрасль, сигналы спроса, вероятность по маршруту финансирования и рекомендуемый следующий шаг. Для реального запуска профили должны проходить модерацию.",
    search: "Поиск по названию, отрасли, сигналам спроса",
    allIndustries: "Все отрасли",
    allStages: "Все стадии",
    allRoutes: "Все маршруты",
    stage: "Стадия",
    city: "Город",
    model: "Модель",
    route: "Маршрут",
    signals: "Сигналы спроса",
    needs: "Что нужно подготовить",
    details: "Открыть профиль",
    compare: "Сравнить со своим проектом",
    emptyTitle: "Ничего не найдено",
    emptyText: "Попробуй сбросить фильтры или изменить поисковый запрос.",
    addProject: "Добавить проект через диагностику",
    pendingTitle: "Мои проекты на модерации",
    pendingText:
      "Эти карточки видны только в текущем браузере. После проверки админом проект появится в публичной витрине.",
    pendingStatus: "На модерации"
  },
  en: {
    eyebrow: "Startup showcase",
    title: "Capital OS startup showcase",
    subtitle:
      "A public catalog of projects, stages, and preparation routes. This is not an investment board or an offer.",
    infoTitle: "What the showcase shows",
    infoText:
      "Each project shows stage, industry, demand signals, route funding probability, and the recommended next step. Real launch profiles should pass moderation.",
    search: "Search by name, industry, demand signals",
    allIndustries: "All industries",
    allStages: "All stages",
    allRoutes: "All routes",
    stage: "Stage",
    city: "City",
    model: "Model",
    route: "Route",
    signals: "Demand signals",
    needs: "What to prepare",
    details: "Open profile",
    compare: "Compare with my project",
    emptyTitle: "Nothing found",
    emptyText: "Try resetting filters or changing the search query.",
    addProject: "Add project via diagnostic",
    pendingTitle: "My projects in moderation",
    pendingText:
      "These cards are visible only in the current browser. After admin review, the project will appear in the public showcase.",
    pendingStatus: "In moderation"
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

export function StartupsShowcaseClient() {
  const { language } = usePreferences();
  const [query, setQuery] = useState("");
  const [industry, setIndustry] = useState("all");
  const [stage, setStage] = useState<DiagnosticStage | "all">("all");
  const [route, setRoute] = useState<FundingRoute | "all">("all");
  const [publicStartups, setPublicStartups] = useState<ShowcaseStartup[]>(
    showcaseStartups
  );
  const [pendingStartups, setPendingStartups] = useState<ShowcaseStartup[]>([]);
  const copy = showcaseCopy[language];
  const activeStageLabels = language === "ru" ? stageLabels : stageLabelsEn;
  const activeRouteLabels = language === "ru" ? routeLabels : routeLabelsEn;

  useEffect(() => {
    setPublicStartups([...showcaseStartups, ...listPublishedShowcaseStartups()]);
    setPendingStartups(listPendingShowcaseStartups());
  }, []);

  const industries = useMemo(
    () => Array.from(new Set(publicStartups.map((startup) => startup.industry))),
    [publicStartups]
  );

  const filtered = useMemo(() => {
    return publicStartups.filter((startup) => {
      const haystack = [
        startup.name,
        startup.tagline,
        startup.description,
        startup.industry,
        startup.city,
        startup.traction.join(" "),
        startup.needs.join(" ")
      ]
        .join(" ")
        .toLowerCase();

      return (
        haystack.includes(query.toLowerCase()) &&
        (industry === "all" || startup.industry === industry) &&
        (stage === "all" || startup.stage === stage) &&
        (route === "all" || startup.route === route)
      );
    });
  }, [industry, publicStartups, query, route, stage]);

  return (
    <main className="min-h-screen bg-paper">
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
          <div>
            <p className="inline-flex items-center gap-2 rounded border border-ink/10 bg-white px-3 py-2 text-sm font-semibold uppercase tracking-wide text-steel">
              <Building2 size={16} />
              {copy.eyebrow}
            </p>
            <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-tight text-ink md:text-6xl">
              {copy.title}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-ink/70">
              {copy.subtitle}
            </p>
          </div>

          <div className="rounded border border-ink/10 bg-white p-5">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-1 text-mint" size={24} />
              <div>
                <h2 className="text-2xl font-semibold text-ink">
                  {copy.infoTitle}
                </h2>
                <p className="mt-3 text-sm leading-6 text-ink/70">
                  {copy.infoText}
                </p>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-10 rounded border border-ink/10 bg-white p-4">
          <div className="grid gap-3 lg:grid-cols-[1fr_220px_220px_220px]">
            <label className="relative">
              <Search className="pointer-events-none absolute left-3 top-3.5 text-ink/40" size={18} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={copy.search}
                className="w-full rounded border border-ink/15 py-3 pl-10 pr-3 text-sm"
              />
            </label>

            <label className="relative">
              <Filter className="pointer-events-none absolute left-3 top-3.5 text-ink/40" size={18} />
              <select
                value={industry}
                onChange={(event) => setIndustry(event.target.value)}
                className="w-full rounded border border-ink/15 py-3 pl-10 pr-3 text-sm"
              >
                <option value="all">{copy.allIndustries}</option>
                {industries.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <select
              value={stage}
              onChange={(event) => setStage(event.target.value as DiagnosticStage | "all")}
              className="w-full rounded border border-ink/15 px-3 py-3 text-sm"
            >
              <option value="all">{copy.allStages}</option>
              {Object.entries(activeStageLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>

            <select
              value={route}
              onChange={(event) => setRoute(event.target.value as FundingRoute | "all")}
              className="w-full rounded border border-ink/15 px-3 py-3 text-sm"
            >
              <option value="all">{copy.allRoutes}</option>
              {Object.entries(activeRouteLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </section>

        {pendingStartups.length > 0 && (
          <section className="mt-8 rounded border border-mint/25 bg-mint/10 p-5">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
              <div>
                <h2 className="text-2xl font-semibold text-ink">
                  {copy.pendingTitle}
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-ink/65">
                  {copy.pendingText}
                </p>
              </div>
              <span className="w-fit rounded bg-white px-3 py-2 text-xs font-semibold text-ink">
                {copy.pendingStatus}
              </span>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {pendingStartups.map((startup) => (
                <article
                  key={startup.id}
                  className="rounded border border-ink/10 bg-white p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-steel">
                        {startup.industry}
                      </p>
                      <h3 className="mt-2 text-2xl font-semibold text-ink">
                        {startup.name}
                      </h3>
                    </div>
                    <div
                      className="grid h-14 w-14 shrink-0 place-items-center rounded text-sm font-semibold text-white"
                      style={{ backgroundColor: startup.color }}
                    >
                      {getShowcaseRouteScore(startup)}%
                    </div>
                  </div>
                  <p className="mt-3 text-sm font-semibold text-ink">
                    {startup.tagline}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-ink/65">
                    {startup.description}
                  </p>
                </article>
              ))}
            </div>
          </section>
        )}

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((startup) => (
            <article key={startup.id} className="rounded border border-ink/10 bg-white p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-steel">{startup.industry}</p>
                  <Link
                    href={`/startups/${startup.id}`}
                    className="mt-2 block text-2xl font-semibold text-ink"
                  >
                    {startup.name}
                  </Link>
                </div>
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded text-sm font-semibold text-white" style={{ backgroundColor: startup.color }}>
                  {getShowcaseRouteScore(startup)}%
                </div>
              </div>

              <p className="mt-3 text-sm font-semibold text-ink">
                {startup.tagline}
              </p>
              <p className="mt-3 min-h-20 text-sm leading-6 text-ink/65">
                {startup.description}
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <Metric label={copy.stage} value={activeStageLabels[startup.stage]} />
                <Metric label={copy.city} value={startup.city} />
                <Metric label={copy.model} value={startup.businessModel} />
                <Metric label={copy.route} value={activeRouteLabels[startup.route]} />
              </div>

              <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">
                  {copy.signals}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {startup.traction.map((item) => (
                    <span key={item} className="rounded bg-paper px-3 py-2 text-xs text-ink/70">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">
                  {copy.needs}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {startup.needs.map((item) => (
                    <span key={item} className="rounded border border-ink/10 px-3 py-2 text-xs text-ink/70">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={`/startups/${startup.id}`}
                  className="inline-flex items-center gap-2 rounded bg-ink px-4 py-3 text-sm font-semibold text-white"
                >
                  {copy.details}
                  <ArrowRight size={16} />
                </Link>
                <Link
                  href="/diagnostic"
                  className="inline-flex items-center gap-2 rounded border border-ink/15 px-4 py-3 text-sm font-semibold text-ink"
                >
                  {copy.compare}
                </Link>
              </div>
            </article>
          ))}
        </div>

        {filtered.length === 0 && (
          <section className="mt-8 rounded border border-ink/10 bg-white p-8 text-center">
            <h2 className="text-2xl font-semibold text-ink">{copy.emptyTitle}</h2>
            <p className="mt-3 text-sm text-ink/65">
              {copy.emptyText}
            </p>
          </section>
        )}

        <section className="mt-10 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <Disclaimer />
          <Link
            href="/diagnostic"
            className="rounded bg-ink px-5 py-3 text-center text-sm font-semibold text-white"
          >
            {copy.addProject}
          </Link>
        </section>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-ink/10 p-3">
      <p className="text-xs uppercase tracking-wide text-ink/45">{label}</p>
      <p className="mt-1 text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}
