"use client";

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Building2,
  ClipboardList,
  FileText,
  Route,
  Sparkles
} from "lucide-react";
import { AnimatedMetrics } from "@/components/animated-metrics";
import { Disclaimer } from "@/components/disclaimer";
import { routeLabels } from "@/lib/diagnostic";
import { usePreferences } from "@/lib/preferences";
import {
  getShowcaseRouteScore,
  getShowcaseRouteScores,
  showcaseStartups
} from "@/lib/showcase";

const homeCopy = {
  ru: {
    badge: "Capital OS Navigator v0.1",
    title: "Диагностика маршрута финансирования для стартапа",
    subtitle:
      "Фаундер получает понятный маршрут финансирования, команда Capital OS видит структурированную заявку, оценку готовности, пробелы и следующий шаг.",
    primaryCta: "Пройти диагностику",
    showcaseCta: "Смотреть витрину",
    metrics: [
      { value: 8420, label: "стартапов в карте рынка" },
      { value: 1286, label: "инвесторов и программ" },
      { value: 317, label: "активных запросов от корпораций" },
      { value: 184, label: "корпорации в поиске технологий" }
    ],
    scoreLabel: "Маршрут финансирования",
    scoreTitle: "NeuroDesk",
    scoreHint: "Наведи на оценку",
    scoreExplanationTitle: "Почему",
    scoreExplanation: [
      "Стадия MVP усиливает акселератор и корпоративный пилот.",
      "В описании есть B2B-контекст, пилоты и письма интереса.",
      "Запрос капитала ближе к пилотам и упаковке, чем к зрелому VC.",
      "Вероятность снижается из-за отсутствия стабильной выручки и полной финмодели."
    ],
    primaryRoute: "Основной маршрут",
    routeText:
      "Сначала усиливаем упаковку и проверку спроса, затем готовим выход к пилотам и ангельскому раунду.",
    outcomes: [
      ["Без хаоса", "Вместо разрозненных советов фаундер получает один понятный маршрут."],
      ["Быстрый ответ", "За несколько минут видно, куда идти сейчас, а куда пока рано."],
      ["Готовность", "Сервис подсвечивает пробелы в traction, документах и упаковке."],
      ["Следующий шаг", "Диагностика заканчивается конкретным планом подготовки."]
    ],
    productEyebrow: "Контур продукта",
    productTitle: "Показываем путь к капиталу до первого интро",
    productText:
      "Capital OS превращает сырую заявку в ясный профиль проекта: стадия, сильные стороны, риски, подходящие каналы финансирования и материалы, которые нужно дособрать перед разговором с рынком.",
    modules: [
      {
        icon: ClipboardList,
        title: "Умная анкета",
        text: "Собирает только то, что влияет на маршрут: рынок, спрос, команда, документы, сумма и цель привлечения."
      },
      {
        icon: BarChart3,
        title: "Оценка готовности",
        text: "Показывает, почему проект ближе к грантам, пилотам, ангелам, фондам или долгу."
      },
      {
        icon: Route,
        title: "Маршрут действий",
        text: "Не просто score, а последовательность: что делать первым, что готовить дальше и что отложить."
      },
      {
        icon: FileText,
        title: "Отчет для решения",
        text: "Короткий web-отчет помогает фаундеру и аналитику быстро перейти к предметному разбору."
      }
    ],
    routesEyebrow: "Примеры маршрутов",
    routesTitle: "Каждой стадии нужен свой капитал",
    routesText:
      "Ранняя команда часто теряет месяцы на неподходящие фонды. Navigator помогает выбрать более реалистичный канал и подготовиться к нему до отправки заявок.",
    routeExamples: [
      ["MVP без выручки", "Акселератор → корпоративный пилот → ангельский раунд"],
      ["Первые продажи", "Корпоративный пилот → корпоративный фонд → посевной раунд"],
      ["Стабильная выручка", "Готовность к долгу → подготовка к фондам"],
      ["Идея или прототип", "Грант → акселератор → подтверждение спроса"]
    ],
    showcaseEyebrow: "Витрина стартапов",
    showcaseTitle: "Смотри, как выглядит упакованный профиль",
    openShowcase: "Открыть витрину",
    finalText:
      "Начни с диагностики: за один проход станет понятно, какой капитал искать и что мешает выйти на него сейчас.",
    finalCta: "Начать диагностику"
  },
  en: {
    badge: "Capital OS Navigator v0.1",
    title: "Funding route diagnostics for startups",
    subtitle:
      "A founder receives a clear funding route while the Capital OS team sees structured intake, readiness score, gaps, and next action.",
    primaryCta: "Start Diagnostic",
    showcaseCta: "View Showcase",
    metrics: [
      { value: 8420, label: "startups in the market map" },
      { value: 1286, label: "investors and programs" },
      { value: 317, label: "active corporate requests" },
      { value: 184, label: "corporations scouting tech" }
    ],
    scoreLabel: "Funding route",
    scoreTitle: "NeuroDesk",
    scoreHint: "Hover the score",
    scoreExplanationTitle: "Why",
    scoreExplanation: [
      "The MVP stage strengthens accelerator and corporate pilot routes.",
      "The description includes B2B context, pilots, and letters of intent.",
      "The capital request is closer to pilots and packaging than mature VC.",
      "Probability is reduced by the lack of stable revenue and a full financial model."
    ],
    primaryRoute: "Primary route",
    routeText:
      "First improve packaging and demand proof, then prepare pilot outreach and angel round materials.",
    outcomes: [
      ["Less noise", "Founders get one clear route instead of scattered advice."],
      ["Fast signal", "In minutes, the team sees where to go now and what is premature."],
      ["Readiness", "The system highlights gaps in traction, documents, and packaging."],
      ["Next step", "The diagnostic ends with a concrete preparation plan."]
    ],
    productEyebrow: "Product contour",
    productTitle: "Find the path to capital before the first intro",
    productText:
      "Capital OS turns a raw application into a clear startup profile: stage, strengths, risks, suitable funding channels, and the materials to prepare before market outreach.",
    modules: [
      {
        icon: ClipboardList,
        title: "Smart intake",
        text: "Captures the facts that shape the route: market, demand, team, documents, amount, and funding goal."
      },
      {
        icon: BarChart3,
        title: "Readiness score",
        text: "Explains whether the project is closer to grants, pilots, angels, funds, CVC, or debt."
      },
      {
        icon: Route,
        title: "Action route",
        text: "Not just a score: a sequence of what to do first, what to prepare next, and what to delay."
      },
      {
        icon: FileText,
        title: "Decision report",
        text: "A concise web report helps the founder and analyst move into a focused review faster."
      }
    ],
    routesEyebrow: "Route examples",
    routesTitle: "Each stage needs the right capital",
    routesText:
      "Early teams often lose months pitching the wrong funds. Navigator helps choose a more realistic channel and prepare before applications go out.",
    routeExamples: [
      ["MVP without revenue", "Accelerator → corporate pilot → angel round"],
      ["First sales", "Corporate pilot → CVC → seed round"],
      ["Stable revenue", "Debt readiness → fund preparation"],
      ["Idea or prototype", "Grant → accelerator → demand proof"]
    ],
    showcaseEyebrow: "Startup showcase",
    showcaseTitle: "See what a packaged profile looks like",
    openShowcase: "Open showcase",
    finalText:
      "Start with diagnostics: one pass shows which capital to pursue and what blocks the project right now.",
    finalCta: "Start diagnostic"
  }
};

const routeLabelsEn = {
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

export default function HomePage() {
  const { language } = usePreferences();
  const copy = homeCopy[language];
  const featured = showcaseStartups.slice(0, 3);
  const activeRouteLabels = language === "ru" ? routeLabels : routeLabelsEn;
  const heroStartup = showcaseStartups[0];
  const heroRouteScore = getShowcaseRouteScore(heroStartup);
  const heroRouteScores = getShowcaseRouteScores(heroStartup).slice(0, 4);
  const heroRouteTrail = heroRouteScores
    .slice(0, 3)
    .map((item) => activeRouteLabels[item.route])
    .join(" → ");

  return (
    <main className="bg-paper">
      <section className="mx-auto grid min-h-[calc(100vh-73px)] max-w-7xl items-center gap-10 px-6 py-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="mb-4 inline-flex items-center gap-2 rounded border border-ink/10 bg-white px-3 py-2 text-sm font-semibold uppercase tracking-wide text-steel">
            <Sparkles size={16} />
            {copy.badge}
          </p>
          <h1 className="max-w-4xl text-5xl font-semibold leading-tight text-ink md:text-7xl">
            {copy.title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-ink/75">
            {copy.subtitle}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/diagnostic"
              className="inline-flex items-center gap-2 rounded bg-ink px-5 py-3 text-sm font-semibold text-white"
            >
              {copy.primaryCta}
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/startups"
              className="rounded border border-ink/20 bg-white px-5 py-3 text-sm font-semibold text-ink"
            >
              {copy.showcaseCta}
            </Link>
          </div>
        </div>

        <div className="rounded border border-ink/10 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4 border-b border-ink/10 pb-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-ink/45">
                {copy.scoreLabel}
              </p>
              <h2 className="mt-1 text-2xl font-semibold text-ink">
                {copy.scoreTitle}
              </h2>
            </div>
            <ScoreBadge copy={copy} score={heroRouteScore} />
          </div>
          <div className="mt-5 grid gap-4">
            {heroRouteScores.map((item) => (
              <div key={item.route}>
                <div className="flex justify-between text-sm font-medium text-ink">
                  <span>{activeRouteLabels[item.route]}</span>
                  <span>{item.score}</span>
                </div>
                <div className="mt-2 h-2 rounded bg-ink/10">
                  <div
                    className="h-2 rounded bg-mint"
                    style={{ width: `${item.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded border border-ink/10 bg-paper p-4">
            <p className="text-sm font-semibold text-ink">
              {copy.primaryRoute}: {heroRouteTrail}
            </p>
            <p className="mt-2 text-sm leading-6 text-ink/65">{copy.routeText}</p>
          </div>
        </div>

        <div className="lg:col-span-2">
          <AnimatedMetrics
            metrics={copy.metrics}
            locale={language === "ru" ? "ru-RU" : "en-US"}
          />
        </div>
      </section>

      <section className="border-y border-ink/10 bg-white">
        <div className="mx-auto grid max-w-7xl gap-4 px-6 py-8 md:grid-cols-4">
          {copy.outcomes.map(([title, text]) => (
            <div key={title} className="rounded border border-ink/10 p-5">
              <p className="text-lg font-semibold text-ink">{title}</p>
              <p className="mt-2 text-sm leading-6 text-ink/65">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-steel">
            {copy.productEyebrow}
          </p>
          <h2 className="mt-3 text-4xl font-semibold text-ink">
            {copy.productTitle}
          </h2>
          <p className="mt-4 leading-7 text-ink/70">{copy.productText}</p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {copy.modules.map((module) => (
            <article
              key={module.title}
              className="rounded border border-ink/10 bg-white p-5"
            >
              <module.icon className="text-steel" size={24} />
              <h3 className="mt-4 text-xl font-semibold text-ink">
                {module.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-ink/65">{module.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-ink px-6 py-16 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-white/70">
                {copy.routesEyebrow}
              </p>
              <h2 className="mt-3 text-4xl font-semibold">{copy.routesTitle}</h2>
              <p className="mt-4 leading-7 text-white/80">{copy.routesText}</p>
            </div>
            <div className="grid gap-3">
              {copy.routeExamples.map(([stage, route]) => (
                <div
                  key={stage}
                  className="rounded border border-white/10 bg-white/10 p-4"
                >
                  <p className="text-sm text-white/70">{stage}</p>
                  <p className="mt-2 text-lg font-semibold">{route}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-steel">
              {copy.showcaseEyebrow}
            </p>
            <h2 className="mt-3 text-4xl font-semibold text-ink">
              {copy.showcaseTitle}
            </h2>
          </div>
          <Link
            href="/startups"
            className="inline-flex items-center gap-2 rounded bg-ink px-5 py-3 text-sm font-semibold text-white"
          >
            {copy.openShowcase}
            <ArrowRight size={16} />
          </Link>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {featured.map((startup) => (
            <article
              key={startup.id}
              className="rounded border border-ink/10 bg-white p-5"
            >
              <div
                className="h-2 rounded"
                style={{ backgroundColor: startup.color }}
              />
              <h3 className="mt-5 text-2xl font-semibold text-ink">
                {startup.name}
              </h3>
              <p className="mt-2 text-sm font-medium text-steel">
                {startup.tagline}
              </p>
              <p className="mt-3 text-sm leading-6 text-ink/65">
                {startup.description}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {startup.traction.slice(0, 3).map((item) => (
                  <span
                    key={item}
                    className="rounded bg-paper px-3 py-2 text-xs text-ink/70"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
          <div className="flex items-center gap-3">
            <Building2 className="text-steel" size={24} />
            <p className="text-sm leading-6 text-ink/70">{copy.finalText}</p>
          </div>
          <Link
            href="/diagnostic"
            className="rounded bg-ink px-5 py-3 text-center text-sm font-semibold text-white"
          >
            {copy.finalCta}
          </Link>
        </div>
        <div className="mt-6">
          <Disclaimer />
        </div>
      </section>
    </main>
  );
}

function ScoreBadge({
  copy,
  score
}: {
  copy: (typeof homeCopy)["ru"] | (typeof homeCopy)["en"];
  score: number;
}) {
  const title = `${copy.scoreExplanationTitle} ${score}`;

  return (
    <div className="group relative">
      <button
        type="button"
        className="rounded bg-mint/15 px-3 py-2 text-left text-sm font-semibold text-ink outline-none ring-mint/30 transition focus:ring-4"
        aria-label={title}
      >
        <span className="block">{score}/100</span>
        <span className="block text-xs font-medium text-ink/55">
          {copy.scoreHint}
        </span>
      </button>
      <div className="pointer-events-none absolute right-0 top-full z-20 mt-3 w-80 rounded border border-ink/10 bg-white p-4 opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-within:opacity-100">
        <p className="text-sm font-semibold text-ink">
          {title}
        </p>
        <ul className="mt-3 grid gap-2 text-sm leading-5 text-ink/70">
          {copy.scoreExplanation.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
