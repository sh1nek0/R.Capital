"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  ClipboardList,
  FileText,
  ShieldCheck
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Disclaimer } from "@/components/disclaimer";
import { ScoreBar } from "@/components/score-bar";
import {
  findDiagnostic,
  routeLabels,
  stageLabels,
  type StoredDiagnostic
} from "@/lib/diagnostic";

type DiagnosticResultClientProps = {
  id: string;
};

export function DiagnosticResultClient({ id }: DiagnosticResultClientProps) {
  const [diagnostic, setDiagnostic] = useState<StoredDiagnostic>();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setDiagnostic(findDiagnostic(id, true));
    setLoaded(true);
  }, [id]);

  const topScores = useMemo(() => {
    if (!diagnostic) {
      return [];
    }

    return diagnostic.route.routeScores.map((routeScore) => ({
      key: routeScore.route,
      label: routeLabels[routeScore.route],
      value: routeScore.score
    }));
  }, [diagnostic]);

  if (!loaded) {
    return (
      <main className="min-h-screen bg-paper px-6 py-10">
        <div className="mx-auto max-w-5xl rounded border border-ink/10 bg-white p-6">
          <p className="text-sm text-ink/70">Загружаю отчет...</p>
        </div>
      </main>
    );
  }

  if (!diagnostic) {
    return (
      <main className="min-h-screen bg-paper px-6 py-10">
        <div className="mx-auto max-w-3xl rounded border border-ink/10 bg-white p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-1 text-signal" size={22} />
            <div>
              <h1 className="text-3xl font-semibold text-ink">Отчет не найден</h1>
              <p className="mt-3 leading-7 text-ink/70">
                Похоже, диагностика была создана в другом браузере или локальные
                данные очищены.
              </p>
              <Link
                href="/diagnostic"
                className="mt-6 inline-flex items-center gap-2 rounded bg-ink px-5 py-3 text-sm font-semibold text-white"
              >
                Пройти диагностику
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const { form, route } = diagnostic;

  return (
    <main className="min-h-screen bg-paper px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded border border-ink/10 bg-white p-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-steel">
              Отчет готовности к финансированию
            </p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight text-ink">
              {form.startupName}: {routeLabels[route.primaryRoute]}
            </h1>
            <p className="mt-4 max-w-3xl leading-7 text-ink/70">
              Диагностика оценивает вероятность получить желаемое финансирование
              по разным источникам. Это не инвестиционный рейтинг и не гарантия
              привлечения капитала.
            </p>

            <div className="mt-6 grid gap-3 md:grid-cols-4">
              <Metric label="Стадия" value={stageLabels[form.stage]} />
              <Metric label="Отрасль" value={form.industry} />
              <Metric label="Команда" value={`${form.teamSize}`} />
              <Metric label="Запрос" value={formatRub(form.fundingNeedAmount)} />
            </div>
          </section>

          <aside className="rounded border border-ink/10 bg-white p-6">
            <div className="flex items-center gap-3">
              <ClipboardList className="text-steel" size={22} />
              <h2 className="text-2xl font-semibold text-ink">Маршрут</h2>
            </div>
            <div className="mt-5 grid gap-4 text-sm leading-6 text-ink/75">
              <RouteBlock title="Основной" items={[routeLabels[route.primaryRoute]]} />
              <RouteBlock
                title="Альтернативы"
                items={route.secondaryRoutes.map((item) => routeLabels[item])}
              />
              <RouteBlock
                title="Пока рано"
                items={route.notRecommendedRoutes.map((item) => routeLabels[item])}
              />
            </div>
          </aside>
        </div>

        <section className="mt-6">
          <h2 className="text-2xl font-semibold text-ink">
            Вероятность по источникам финансирования
          </h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {topScores.map((score, index) => (
              <ScoreBar
                key={score.key}
                label={score.label}
                value={score.value}
                tone={index < 3 ? "mint" : index < 6 ? "steel" : "signal"}
              />
            ))}
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded border border-ink/10 bg-white p-6">
            <h2 className="text-2xl font-semibold text-ink">Почему так</h2>
            <ul className="mt-4 grid gap-3 text-sm leading-6 text-ink/75">
              {route.reasoning.map((item) => (
                <li key={item}>- {item}</li>
              ))}
            </ul>
          </section>

          <section className="rounded border border-ink/10 bg-white p-6">
            <h2 className="text-2xl font-semibold text-ink">Roadmap на 30 дней</h2>
            <ol className="mt-4 grid gap-3 text-sm leading-6 text-ink/75">
              {route.nextSteps.map((item, index) => (
                <li key={item}>
                  {index + 1}. {item}
                </li>
              ))}
            </ol>
          </section>
        </div>

        <section className="mt-6 rounded border border-ink/10 bg-white p-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-1 text-mint" size={22} />
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-steel">
                  Витрина стартапов
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-ink">
                  Проект добавлен в очередь публикации
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-ink/70">
                  После диагностики создан публичный профиль проекта. Сейчас он
                  находится в статусе{" "}
                  "{showcaseStatusLabel(diagnostic.showcase.status)}":
                  админ может отредактировать текст, проверить данные и
                  опубликовать карточку на витрине.
                </p>
              </div>
            </div>
            {diagnostic.showcase.status === "published" ? (
              <Link
                href={`/startups/${diagnostic.id}`}
                className="inline-flex items-center justify-center gap-2 rounded bg-ink px-5 py-3 text-sm font-semibold text-white"
              >
                Открыть на витрине
                <ArrowRight size={16} />
              </Link>
            ) : (
              <Link
                href="/startups"
                className="inline-flex items-center justify-center gap-2 rounded border border-ink/15 px-5 py-3 text-sm font-semibold text-ink"
              >
                Смотреть витрину
                <ArrowRight size={16} />
              </Link>
            )}
          </div>
        </section>

        <section className="mt-6 rounded border border-ink/10 bg-white p-6">
          <h2 className="text-2xl font-semibold text-ink">Главные пробелы</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {route.gaps.map((gap) => (
              <div key={gap} className="rounded border border-ink/10 p-4 text-sm text-ink/75">
                {gap}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 flex flex-col justify-between gap-4 rounded border border-ink/10 bg-white p-6 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-3">
              <FileText className="text-steel" size={22} />
              <h2 className="text-2xl font-semibold text-ink">Глубокий разбор</h2>
            </div>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/70">
              Можно отправить заявку команде Capital OS: аналитик увидит анкету,
              score, маршрут и сможет вручную подготовить следующий шаг.
            </p>
          </div>
          <Link
            href={`/consultation-request?startupId=${diagnostic.id}`}
            className="inline-flex items-center justify-center gap-2 rounded bg-ink px-5 py-3 text-sm font-semibold text-white"
          >
            Запросить разбор
            <ArrowRight size={16} />
          </Link>
        </section>

        <div className="mt-6">
          <Disclaimer />
        </div>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-ink/10 p-4">
      <p className="text-xs uppercase tracking-wide text-ink/45">{label}</p>
      <p className="mt-2 text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}

function RouteBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="font-semibold text-ink">{title}</p>
      <p className="mt-1 text-ink/70">{items.length > 0 ? items.join(", ") : "Нет"}</p>
    </div>
  );
}

function formatRub(value: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0
  }).format(value);
}

function showcaseStatusLabel(status: StoredDiagnostic["showcase"]["status"]) {
  if (status === "published") {
    return "опубликован";
  }
  if (status === "rejected") {
    return "отклонен";
  }

  return "на модерации";
}
