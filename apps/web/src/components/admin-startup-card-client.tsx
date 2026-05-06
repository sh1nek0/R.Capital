"use client";

import Link from "next/link";
import { ArrowLeft, FileText, RefreshCw, Save, StickyNote } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import type { FundingRoute, StartupStatus } from "@capital-os/shared";
import { ScoreBar } from "@/components/score-bar";
import { getFundingRouteProbability } from "@/lib/scoring";
import {
  addDiagnosticNote,
  findDiagnostic,
  recalculateDiagnosticScore,
  routeLabels,
  stageLabels,
  statusLabels,
  updateDiagnosticShowcase,
  updateDiagnosticRoute,
  updateDiagnosticStatus,
  type ShowcaseModerationStatus,
  type ShowcaseProfile,
  type StoredDiagnostic
} from "@/lib/diagnostic";

type AdminStartupCardClientProps = {
  id: string;
};

type ShowcaseDraft = {
  name: string;
  tagline: string;
  description: string;
  industry: string;
  city: string;
  businessModel: string;
  traction: string;
  needs: string;
  color: string;
};

const showcaseStatusLabels: Record<ShowcaseModerationStatus, string> = {
  pending: "На модерации",
  published: "Опубликован",
  rejected: "Отклонен"
};

const emptyShowcaseDraft: ShowcaseDraft = {
  name: "",
  tagline: "",
  description: "",
  industry: "",
  city: "",
  businessModel: "",
  traction: "",
  needs: "",
  color: "#2fbf71"
};

export function AdminStartupCardClient({ id }: AdminStartupCardClientProps) {
  const [diagnostic, setDiagnostic] = useState<StoredDiagnostic>();
  const [loaded, setLoaded] = useState(false);
  const [status, setStatus] = useState<StartupStatus>("new");
  const [route, setRoute] = useState<FundingRoute>("preparation");
  const [showcaseStatus, setShowcaseStatus] =
    useState<ShowcaseModerationStatus>("pending");
  const [showcaseDraft, setShowcaseDraft] =
    useState<ShowcaseDraft>(emptyShowcaseDraft);
  const [note, setNote] = useState("");

  useEffect(() => {
    const item = findDiagnostic(id, true);
    setDiagnostic(item);
    if (item) {
      setStatus(item.status);
      setRoute(item.route.primaryRoute);
      loadShowcaseState(item.showcase);
    }
    setLoaded(true);
  }, [id]);

  const sortedScores = useMemo(() => {
    if (!diagnostic) {
      return [];
    }

    return diagnostic.route.routeScores.map((routeScore) => ({
      key: routeScore.route,
      label: routeLabels[routeScore.route],
      value: routeScore.score
    }));
  }, [diagnostic]);

  function saveAdminChanges() {
    if (!diagnostic) {
      return;
    }

    updateDiagnosticStatus(diagnostic.id, status);
    updateDiagnosticRoute(diagnostic.id, route);
    const updated = findDiagnostic(diagnostic.id, true);
    if (updated) {
      setDiagnostic(updated);
      setStatus(updated.status);
      setRoute(updated.route.primaryRoute);
      loadShowcaseState(updated.showcase);
    }
  }

  function saveShowcaseChanges(nextStatus = showcaseStatus) {
    if (!diagnostic) {
      return;
    }

    updateDiagnosticShowcase(diagnostic.id, {
      status: nextStatus,
      name: showcaseDraft.name.trim() || diagnostic.form.startupName,
      tagline: showcaseDraft.tagline.trim(),
      description: showcaseDraft.description.trim(),
      industry: showcaseDraft.industry.trim() || diagnostic.form.industry,
      city: showcaseDraft.city.trim() || "Не указан",
      businessModel: showcaseDraft.businessModel.trim() || diagnostic.form.businessModel,
      traction: parseList(showcaseDraft.traction),
      needs: parseList(showcaseDraft.needs),
      color: showcaseDraft.color || "#2fbf71"
    });

    const updated = findDiagnostic(diagnostic.id, true);
    if (updated) {
      setDiagnostic(updated);
      loadShowcaseState(updated.showcase);
    }
  }

  function recalculateScore() {
    if (!diagnostic) {
      return;
    }

    recalculateDiagnosticScore(diagnostic.id);
    const updated = findDiagnostic(diagnostic.id, true);
    if (updated) {
      setDiagnostic(updated);
      setStatus(updated.status);
      setRoute(updated.route.primaryRoute);
      loadShowcaseState(updated.showcase);
    }
  }

  function submitNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!diagnostic || !note.trim()) {
      return;
    }

    addDiagnosticNote(diagnostic.id, note.trim());
    setDiagnostic({
      ...diagnostic,
      notes: [
        {
          id: `local_${Date.now()}`,
          text: note.trim(),
          createdAt: new Date().toISOString()
        },
        ...diagnostic.notes
      ]
    });
    setNote("");
  }

  if (!loaded) {
    return (
      <main className="min-h-screen bg-paper px-6 py-10">
        <div className="mx-auto max-w-6xl rounded border border-ink/10 bg-white p-6">
          <p className="text-sm text-ink/70">Загружаю карточку...</p>
        </div>
      </main>
    );
  }

  if (!diagnostic) {
    return (
      <main className="min-h-screen bg-paper px-6 py-10">
        <div className="mx-auto max-w-3xl rounded border border-ink/10 bg-white p-6">
          <h1 className="text-3xl font-semibold text-ink">Заявка не найдена</h1>
          <Link
            href="/admin/startups"
            className="mt-6 inline-flex items-center gap-2 rounded bg-ink px-5 py-3 text-sm font-semibold text-white"
          >
            <ArrowLeft size={16} />
            К списку
          </Link>
        </div>
      </main>
    );
  }

  const { form } = diagnostic;
  const routeScore = getPrimaryRouteScore(diagnostic);

  return (
    <main className="min-h-screen bg-paper px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/admin/startups"
          className="inline-flex items-center gap-2 text-sm font-semibold text-ink/70"
        >
          <ArrowLeft size={16} />
          К заявкам
        </Link>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          <section className="rounded border border-ink/10 bg-white p-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-steel">
              Карточка стартапа
            </p>
            <h1 className="mt-3 text-4xl font-semibold text-ink">
              {form.startupName}
            </h1>
            <p className="mt-4 max-w-3xl leading-7 text-ink/70">
              {form.description}
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-[220px_1fr]">
              <div className="rounded border border-ink/10 bg-paper p-5">
                <p className="text-xs uppercase tracking-wide text-ink/45">
                  Вероятность маршрута
                </p>
                <p className="mt-2 text-4xl font-semibold text-ink">
                  {routeScore}/100
                </p>
                <p className="mt-2 text-sm text-ink/65">
                  {routeLabels[diagnostic.route.primaryRoute]}
                </p>
              </div>
              <div className="rounded border border-ink/10 bg-paper p-5">
                <p className="text-xs uppercase tracking-wide text-ink/45">
                  Главная боль
                </p>
                <p className="mt-2 text-sm leading-6 text-ink/75">
                  {form.mainPain || "Не указано"}
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <Field label="Фаундер" value={`${form.founderName}, ${form.email}`} />
              <Field label="Стадия" value={stageLabels[form.stage]} />
              <Field label="Отрасль" value={form.industry} />
              <Field label="Выручка" value={form.revenueRange} />
              <Field label="Команда" value={`${form.teamSize}`} />
              <Field label="Потребность" value={formatRub(form.fundingNeedAmount)} />
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <InfoList title="Сигналы спроса" items={form.tractionSignals} />
              <InfoList title="Документы" items={form.preparedDocuments} />
            </div>
          </section>

          <aside className="grid gap-6">
            <section className="rounded border border-ink/10 bg-white p-6">
              <h2 className="text-2xl font-semibold text-ink">Действия аналитика</h2>
              <div className="mt-5 grid gap-4">
                <label className="grid gap-2 text-sm font-medium text-ink">
                  Статус
                  <select
                    value={status}
                    onChange={(event) => setStatus(event.target.value as StartupStatus)}
                    className="rounded border border-ink/15 px-3 py-3"
                  >
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-medium text-ink">
                  Основной маршрут
                  <select
                    value={route}
                    onChange={(event) => setRoute(event.target.value as FundingRoute)}
                    className="rounded border border-ink/15 px-3 py-3"
                  >
                    {Object.entries(routeLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  onClick={saveAdminChanges}
                  className="inline-flex items-center justify-center gap-2 rounded bg-ink px-5 py-3 text-sm font-semibold text-white"
                >
                  <Save size={16} />
                  Сохранить
                </button>
              </div>
            </section>

            <section className="rounded border border-ink/10 bg-white p-6">
              <div className="flex items-center gap-3">
                <FileText className="text-steel" size={20} />
                <h2 className="text-2xl font-semibold text-ink">Отчет</h2>
              </div>
              <div className="mt-5 grid gap-3">
                <Link
                  href={`/diagnostic/result/${diagnostic.id}`}
                  className="inline-flex items-center justify-center gap-2 rounded border border-ink/15 px-5 py-3 text-sm font-semibold text-ink"
                >
                  <FileText size={16} />
                  Открыть отчет
                </Link>
                <button
                  type="button"
                  onClick={recalculateScore}
                  className="inline-flex items-center justify-center gap-2 rounded border border-ink/15 px-5 py-3 text-sm font-semibold text-ink"
                >
                  <RefreshCw size={16} />
                  Пересчитать score
                </button>
              </div>
            </section>
          </aside>
        </div>

        <section className="mt-6 rounded border border-ink/10 bg-white p-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-steel">
                Модерация витрины
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-ink">
                Публичный профиль проекта
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-ink/65">
                Эти тексты видны на витрине только после публикации. Исходная
                анкета фаундера не меняется.
              </p>
            </div>
            <div className="grid gap-2 md:min-w-56">
              <label className="grid gap-2 text-sm font-medium text-ink">
                Статус витрины
                <select
                  value={showcaseStatus}
                  onChange={(event) =>
                    setShowcaseStatus(event.target.value as ShowcaseModerationStatus)
                  }
                  className="rounded border border-ink/15 px-3 py-3"
                >
                  {Object.entries(showcaseStatusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              {diagnostic.showcase.status === "published" && (
                <Link
                  href={`/startups/${diagnostic.id}`}
                  className="rounded border border-ink/15 px-4 py-3 text-center text-sm font-semibold text-ink"
                >
                  Открыть на витрине
                </Link>
              )}
            </div>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <TextInput
              label="Название"
              value={showcaseDraft.name}
              onChange={(value) => setShowcaseDraftField("name", value)}
            />
            <TextInput
              label="Отрасль"
              value={showcaseDraft.industry}
              onChange={(value) => setShowcaseDraftField("industry", value)}
            />
            <TextInput
              label="Город"
              value={showcaseDraft.city}
              onChange={(value) => setShowcaseDraftField("city", value)}
            />
            <TextInput
              label="Бизнес-модель"
              value={showcaseDraft.businessModel}
              onChange={(value) => setShowcaseDraftField("businessModel", value)}
            />
            <TextInput
              label="Короткий заголовок"
              value={showcaseDraft.tagline}
              onChange={(value) => setShowcaseDraftField("tagline", value)}
            />
            <label className="grid gap-2 text-sm font-medium text-ink">
              Цвет карточки
              <input
                type="color"
                value={showcaseDraft.color}
                onChange={(event) => setShowcaseDraftField("color", event.target.value)}
                className="h-12 w-full rounded border border-ink/15 bg-white px-2 py-2"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-ink md:col-span-2">
              Описание
              <textarea
                value={showcaseDraft.description}
                onChange={(event) =>
                  setShowcaseDraftField("description", event.target.value)
                }
                className="min-h-28 rounded border border-ink/15 px-3 py-3"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-ink">
              Сигналы спроса через запятую
              <textarea
                value={showcaseDraft.traction}
                onChange={(event) => setShowcaseDraftField("traction", event.target.value)}
                className="min-h-24 rounded border border-ink/15 px-3 py-3"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-ink">
              Что подготовить через запятую
              <textarea
                value={showcaseDraft.needs}
                onChange={(event) => setShowcaseDraftField("needs", event.target.value)}
                className="min-h-24 rounded border border-ink/15 px-3 py-3"
              />
            </label>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => saveShowcaseChanges()}
              className="inline-flex items-center gap-2 rounded bg-ink px-5 py-3 text-sm font-semibold text-white"
            >
              <Save size={16} />
              Сохранить модерацию
            </button>
            <button
              type="button"
              onClick={() => saveShowcaseChanges("published")}
              className="rounded border border-mint/40 bg-mint/10 px-5 py-3 text-sm font-semibold text-ink"
            >
              Опубликовать
            </button>
            <button
              type="button"
              onClick={() => saveShowcaseChanges("rejected")}
              className="rounded border border-ink/15 px-5 py-3 text-sm font-semibold text-ink"
            >
              Отклонить
            </button>
          </div>
        </section>

        <section className="mt-6">
          <h2 className="text-2xl font-semibold text-ink">
            Вероятность по источникам финансирования
          </h2>
          <p className="mt-2 text-sm leading-6 text-ink/65">
            Проценты показывают вероятность получить желаемое финансирование с
            текущим набором стадии, описания, traction, документов и суммы
            запроса.
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {sortedScores.map((score, index) => (
              <ScoreBar
                key={score.key}
                label={score.label}
                value={score.value}
                tone={index < 3 ? "mint" : index < 6 ? "steel" : "signal"}
              />
            ))}
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="rounded border border-ink/10 bg-white p-6">
            <h2 className="text-2xl font-semibold text-ink">Логика маршрута</h2>
            <ul className="mt-4 grid gap-3 text-sm leading-6 text-ink/75">
              {diagnostic.route.reasoning.map((item) => (
                <li key={item}>- {item}</li>
              ))}
            </ul>
          </section>

          <section className="rounded border border-ink/10 bg-white p-6">
            <div className="flex items-center gap-3">
              <StickyNote className="text-steel" size={20} />
              <h2 className="text-2xl font-semibold text-ink">Заметки</h2>
            </div>
            <form onSubmit={submitNote} className="mt-5 grid gap-3">
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                className="min-h-24 rounded border border-ink/15 px-3 py-3 text-sm"
              />
              <button
                type="submit"
                className="w-fit rounded bg-ink px-5 py-3 text-sm font-semibold text-white"
              >
                Добавить заметку
              </button>
            </form>
            <div className="mt-5 grid gap-3">
              {diagnostic.notes.map((item) => (
                <div key={item.id} className="rounded border border-ink/10 p-4">
                  <p className="text-sm leading-6 text-ink/75">{item.text}</p>
                  <p className="mt-2 text-xs text-ink/45">{formatDate(item.createdAt)}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );

  function setShowcaseDraftField(field: keyof ShowcaseDraft, value: string) {
    setShowcaseDraft((current) => ({
      ...current,
      [field]: value
    }));
  }

  function loadShowcaseState(profile: ShowcaseProfile) {
    setShowcaseStatus(profile.status);
    setShowcaseDraft({
      name: profile.name,
      tagline: profile.tagline,
      description: profile.description,
      industry: profile.industry,
      city: profile.city,
      businessModel: profile.businessModel,
      traction: profile.traction.join(", "),
      needs: profile.needs.join(", "),
      color: profile.color
    });
  }
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-ink/10 p-4">
      <p className="text-xs uppercase tracking-wide text-ink/45">{label}</p>
      <p className="mt-2 text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}

function InfoList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded border border-ink/10 p-4">
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.length > 0 ? (
          items.map((item) => (
            <span key={item} className="rounded bg-paper px-3 py-2 text-xs text-ink/70">
              {item}
            </span>
          ))
        ) : (
          <span className="text-sm text-ink/55">Не указано</span>
        )}
      </div>
    </div>
  );
}

function TextInput({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-ink">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded border border-ink/15 px-3 py-3"
      />
    </label>
  );
}

function formatRub(value: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function getPrimaryRouteScore(item: StoredDiagnostic) {
  return getFundingRouteProbability(item.route.primaryRoute, item.score, item.form);
}

function parseList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}
