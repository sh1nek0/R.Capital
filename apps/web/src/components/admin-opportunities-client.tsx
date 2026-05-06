"use client";

import type { OpportunityType } from "@capital-os/shared";
import {
  CalendarDays,
  Coins,
  ExternalLink,
  Filter,
  MapPin,
  Plus,
  Save,
  Search
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

type OpportunityStatus = "active" | "draft" | "inactive";

type Opportunity = {
  id: string;
  title: string;
  type: OpportunityType;
  organizer: string;
  industries: string[];
  stages: string[];
  geography: string[];
  fundingMin?: number;
  fundingMax?: number;
  deadline?: string;
  requirements: string;
  applicationUrl?: string;
  status: OpportunityStatus;
  lastCheckedAt: string;
};

type OpportunityDraft = {
  title: string;
  type: OpportunityType;
  organizer: string;
  industries: string;
  stages: string;
  geography: string;
  fundingMin: string;
  fundingMax: string;
  deadline: string;
  requirements: string;
  applicationUrl: string;
};

const storageKey = "capital-os.opportunities.v1";

const emptyDraft: OpportunityDraft = {
  title: "",
  type: "grant",
  organizer: "",
  industries: "",
  stages: "mvp",
  geography: "Россия",
  fundingMin: "",
  fundingMax: "",
  deadline: "",
  requirements: "",
  applicationUrl: ""
};

const initialOpportunities: Opportunity[] = [
  {
    id: "opp_fsi",
    title: "Фонд содействия инновациям",
    type: "grant",
    organizer: "ФСИ",
    industries: ["DeepTech", "IT", "Медтех", "Промтех"],
    stages: ["prototype", "mvp"],
    geography: ["Россия"],
    fundingMin: 500000,
    fundingMax: 30000000,
    deadline: "2026-07-15",
    requirements:
      "Технологический проект, заявка по программе, описание НИОКР, команда и смета.",
    applicationUrl: "https://fasie.ru",
    status: "active",
    lastCheckedAt: "2026-05-01"
  },
  {
    id: "opp_industrial_pilot",
    title: "Industrial Pilot Track",
    type: "corporate_pilot",
    organizer: "Capital OS partners",
    industries: ["Промышленность", "Логистика", "AI"],
    stages: ["mvp", "traction", "revenue"],
    geography: ["Россия", "СНГ"],
    fundingMin: 1000000,
    fundingMax: 10000000,
    deadline: "2026-06-30",
    requirements:
      "Нужны MVP, B2B-кейс, гипотеза пилота на 6-8 недель и измеримые KPI.",
    applicationUrl: "",
    status: "active",
    lastCheckedAt: "2026-05-02"
  },
  {
    id: "opp_seed_angels",
    title: "Seed Angels Club",
    type: "angel_network",
    organizer: "Private angels",
    industries: ["SaaS", "Финтех", "EdTech"],
    stages: ["traction", "revenue"],
    geography: ["Россия"],
    fundingMin: 3000000,
    fundingMax: 25000000,
    deadline: "",
    requirements:
      "Первые продажи, pitch deck, финмодель, понятная экономика и план на 12 месяцев.",
    applicationUrl: "",
    status: "draft",
    lastCheckedAt: "2026-04-28"
  }
];

const typeLabels: Record<OpportunityType, string> = {
  grant: "Грант",
  accelerator: "Акселератор",
  fund: "Фонд",
  angel_network: "Ангельская сеть",
  cvc: "CVC",
  corporate_pilot: "Корпоративный пилот",
  contest: "Конкурс",
  oip_partner: "Партнер ОИП",
  bank: "Банк",
  debt: "Долг"
};

const statusLabels: Record<OpportunityStatus, string> = {
  active: "Активна",
  draft: "Черновик",
  inactive: "Выключена"
};

export function AdminOpportunitiesClient() {
  const [items, setItems] = useState<Opportunity[]>(initialOpportunities);
  const [selectedId, setSelectedId] = useState(initialOpportunities[0]?.id);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OpportunityStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<OpportunityType | "all">("all");
  const [draft, setDraft] = useState<OpportunityDraft>(emptyDraft);

  useEffect(() => {
    const stored = readOpportunities();
    if (stored.length > 0) {
      setItems(stored);
      setSelectedId(stored[0].id);
    }
  }, []);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const haystack = [
        item.title,
        item.organizer,
        item.type,
        item.industries.join(" "),
        item.stages.join(" "),
        item.geography.join(" "),
        item.requirements
      ]
        .join(" ")
        .toLowerCase();

      return (
        haystack.includes(query.toLowerCase()) &&
        (statusFilter === "all" || item.status === statusFilter) &&
        (typeFilter === "all" || item.type === typeFilter)
      );
    });
  }, [items, query, statusFilter, typeFilter]);

  const selected = items.find((item) => item.id === selectedId) ?? filtered[0];

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.title.trim()) {
      return;
    }

    const nextItem: Opportunity = {
      id: `opp_${Date.now()}`,
      title: draft.title.trim(),
      type: draft.type,
      organizer: draft.organizer.trim() || "Не указан",
      industries: parseList(draft.industries),
      stages: parseList(draft.stages),
      geography: parseList(draft.geography),
      fundingMin: parseNumber(draft.fundingMin),
      fundingMax: parseNumber(draft.fundingMax),
      deadline: draft.deadline || undefined,
      requirements: draft.requirements.trim() || "Требования нужно уточнить.",
      applicationUrl: draft.applicationUrl.trim() || undefined,
      status: "draft",
      lastCheckedAt: new Date().toISOString().slice(0, 10)
    };
    const nextItems = [nextItem, ...items];

    setItems(nextItems);
    writeOpportunities(nextItems);
    setSelectedId(nextItem.id);
    setDraft(emptyDraft);
    setIsOpen(false);
  }

  function changeStatus(id: string, status: OpportunityStatus) {
    const nextItems = items.map((item) =>
      item.id === id
        ? { ...item, status, lastCheckedAt: new Date().toISOString().slice(0, 10) }
        : item
    );

    setItems(nextItems);
    writeOpportunities(nextItems);
  }

  return (
    <main className="min-h-screen bg-paper px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-steel">
              Радар возможностей
            </p>
            <h1 className="mt-3 text-4xl font-semibold text-ink">
              Карточки возможностей
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-ink/65">
              Здесь админ и аналитик смотрят релевантные гранты, акселераторы,
              фонды, пилоты и долговые программы для ручного матчинга со
              стартапами.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen((value) => !value)}
            className="inline-flex items-center justify-center gap-2 rounded bg-ink px-5 py-3 text-sm font-semibold text-white"
          >
            <Plus size={16} />
            Добавить
          </button>
        </div>

        {isOpen && (
          <form onSubmit={submit} className="mt-8 rounded border border-ink/10 bg-white p-5">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <label className="grid gap-2 text-sm font-medium text-ink">
                Название
                <input
                  value={draft.title}
                  onChange={(event) => setDraftField("title", event.target.value)}
                  className="rounded border border-ink/15 px-3 py-3"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-ink">
                Тип
                <select
                  value={draft.type}
                  onChange={(event) =>
                    setDraftField("type", event.target.value as OpportunityType)
                  }
                  className="rounded border border-ink/15 px-3 py-3"
                >
                  {Object.entries(typeLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-medium text-ink">
                Организатор
                <input
                  value={draft.organizer}
                  onChange={(event) => setDraftField("organizer", event.target.value)}
                  className="rounded border border-ink/15 px-3 py-3"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-ink">
                Стадии через запятую
                <input
                  value={draft.stages}
                  onChange={(event) => setDraftField("stages", event.target.value)}
                  className="rounded border border-ink/15 px-3 py-3"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-ink">
                Отрасли через запятую
                <input
                  value={draft.industries}
                  onChange={(event) => setDraftField("industries", event.target.value)}
                  className="rounded border border-ink/15 px-3 py-3"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-ink">
                География
                <input
                  value={draft.geography}
                  onChange={(event) => setDraftField("geography", event.target.value)}
                  className="rounded border border-ink/15 px-3 py-3"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-ink">
                Мин. сумма
                <input
                  type="number"
                  value={draft.fundingMin}
                  onChange={(event) => setDraftField("fundingMin", event.target.value)}
                  className="rounded border border-ink/15 px-3 py-3"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-ink">
                Макс. сумма
                <input
                  type="number"
                  value={draft.fundingMax}
                  onChange={(event) => setDraftField("fundingMax", event.target.value)}
                  className="rounded border border-ink/15 px-3 py-3"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-ink">
                Дедлайн
                <input
                  type="date"
                  value={draft.deadline}
                  onChange={(event) => setDraftField("deadline", event.target.value)}
                  className="rounded border border-ink/15 px-3 py-3"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-ink md:col-span-2">
                Ссылка
                <input
                  value={draft.applicationUrl}
                  onChange={(event) =>
                    setDraftField("applicationUrl", event.target.value)
                  }
                  className="rounded border border-ink/15 px-3 py-3"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-ink md:col-span-2 xl:col-span-4">
                Требования
                <textarea
                  value={draft.requirements}
                  onChange={(event) =>
                    setDraftField("requirements", event.target.value)
                  }
                  className="min-h-24 rounded border border-ink/15 px-3 py-3"
                />
              </label>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded bg-ink px-5 py-3 text-sm font-semibold text-white md:w-fit"
              >
                <Save size={16} />
                Сохранить
              </button>
            </div>
          </form>
        )}

        <section className="mt-8 rounded border border-ink/10 bg-white p-4">
          <div className="grid gap-3 lg:grid-cols-[1fr_220px_220px]">
            <label className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-3.5 text-ink/40"
                size={18}
              />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Поиск по названию, отрасли, стадии, требованиям"
                className="w-full rounded border border-ink/15 py-3 pl-10 pr-3 text-sm"
              />
            </label>
            <label className="relative">
              <Filter
                className="pointer-events-none absolute left-3 top-3.5 text-ink/40"
                size={18}
              />
              <select
                value={typeFilter}
                onChange={(event) =>
                  setTypeFilter(event.target.value as OpportunityType | "all")
                }
                className="w-full rounded border border-ink/15 py-3 pl-10 pr-3 text-sm"
              >
                <option value="all">Все типы</option>
                {Object.entries(typeLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as OpportunityStatus | "all")
              }
              className="w-full rounded border border-ink/15 px-3 py-3 text-sm"
            >
              <option value="all">Все статусы</option>
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </section>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
          <section className="grid gap-4 md:grid-cols-2">
            {filtered.map((item) => (
              <OpportunityCard
                key={item.id}
                item={item}
                isSelected={selected?.id === item.id}
                onSelect={() => setSelectedId(item.id)}
                onStatusChange={changeStatus}
              />
            ))}
            {filtered.length === 0 && (
              <div className="rounded border border-ink/10 bg-white p-6 text-sm text-ink/60 md:col-span-2">
                Возможности не найдены.
              </div>
            )}
          </section>

          {selected && (
            <aside className="rounded border border-ink/10 bg-white p-6 lg:sticky lg:top-6 lg:self-start">
              <p className="text-sm font-semibold uppercase tracking-wide text-steel">
                Просмотр возможности
              </p>
              <h2 className="mt-3 text-3xl font-semibold leading-tight text-ink">
                {selected.title}
              </h2>
              <p className="mt-2 text-sm text-ink/60">{selected.organizer}</p>

              <div className="mt-5 grid gap-3">
                <DetailRow label="Тип" value={typeLabels[selected.type]} />
                <DetailRow label="Статус" value={statusLabels[selected.status]} />
                <DetailRow label="Стадии" value={selected.stages.join(", ")} />
                <DetailRow label="Отрасли" value={selected.industries.join(", ")} />
                <DetailRow label="География" value={selected.geography.join(", ")} />
                <DetailRow label="Сумма" value={formatFunding(selected)} />
                <DetailRow
                  label="Дедлайн"
                  value={selected.deadline ? formatDate(selected.deadline) : "Без дедлайна"}
                />
                <DetailRow
                  label="Проверено"
                  value={formatDate(selected.lastCheckedAt)}
                />
              </div>

              <div className="mt-5 rounded border border-ink/10 bg-paper p-4">
                <p className="text-xs uppercase tracking-wide text-ink/45">
                  Требования
                </p>
                <p className="mt-2 text-sm leading-6 text-ink/75">
                  {selected.requirements}
                </p>
              </div>

              {selected.applicationUrl && (
                <a
                  href={selected.applicationUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded bg-ink px-5 py-3 text-sm font-semibold text-white"
                >
                  Открыть заявку
                  <ExternalLink size={16} />
                </a>
              )}
            </aside>
          )}
        </div>
      </div>
    </main>
  );

  function setDraftField<K extends keyof OpportunityDraft>(
    field: K,
    value: OpportunityDraft[K]
  ) {
    setDraft((current) => ({
      ...current,
      [field]: value
    }));
  }
}

function OpportunityCard({
  item,
  isSelected,
  onSelect,
  onStatusChange
}: {
  item: Opportunity;
  isSelected: boolean;
  onSelect: () => void;
  onStatusChange: (id: string, status: OpportunityStatus) => void;
}) {
  return (
    <article
      className={`rounded border bg-white p-5 transition ${
        isSelected ? "border-ink shadow-sm" : "border-ink/10"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-steel">{typeLabels[item.type]}</p>
          <button
            type="button"
            onClick={onSelect}
            className="mt-2 text-left text-2xl font-semibold leading-tight text-ink"
          >
            {item.title}
          </button>
          <p className="mt-2 text-sm text-ink/60">{item.organizer}</p>
        </div>
        <span
          className={`rounded px-3 py-2 text-xs font-semibold ${
            item.status === "active"
              ? "bg-mint/15 text-ink"
              : item.status === "draft"
                ? "bg-paper text-ink/70"
                : "border border-ink/10 text-ink/55"
          }`}
        >
          {statusLabels[item.status]}
        </span>
      </div>

      <div className="mt-5 grid gap-3 text-sm text-ink/70">
        <p className="flex items-center gap-2">
          <Coins size={16} className="text-steel" />
          {formatFunding(item)}
        </p>
        <p className="flex items-center gap-2">
          <CalendarDays size={16} className="text-steel" />
          {item.deadline ? formatDate(item.deadline) : "Без дедлайна"}
        </p>
        <p className="flex items-center gap-2">
          <MapPin size={16} className="text-steel" />
          {item.geography.join(", ")}
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {item.stages.map((stage) => (
          <span key={stage} className="rounded bg-paper px-3 py-2 text-xs text-ink/70">
            {stage}
          </span>
        ))}
        {item.industries.slice(0, 3).map((industry) => (
          <span
            key={industry}
            className="rounded border border-ink/10 px-3 py-2 text-xs text-ink/70"
          >
            {industry}
          </span>
        ))}
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
        <select
          value={item.status}
          onChange={(event) =>
            onStatusChange(item.id, event.target.value as OpportunityStatus)
          }
          className="rounded border border-ink/15 px-3 py-2 text-sm text-ink"
        >
          {Object.entries(statusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={onSelect}
          className="rounded border border-ink/15 px-4 py-2 text-sm font-semibold text-ink"
        >
          Смотреть
        </button>
      </div>
    </article>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-ink/10 p-3">
      <p className="text-xs uppercase tracking-wide text-ink/45">{label}</p>
      <p className="mt-1 text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}

function parseList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseNumber(value: string) {
  const number = Number(value);

  return value && !Number.isNaN(number) ? number : undefined;
}

function formatFunding(item: Opportunity) {
  if (!item.fundingMin && !item.fundingMax) {
    return "Сумма не указана";
  }

  if (item.fundingMin && item.fundingMax) {
    return `${formatRub(item.fundingMin)} - ${formatRub(item.fundingMax)}`;
  }

  return item.fundingMin
    ? `от ${formatRub(item.fundingMin)}`
    : `до ${formatRub(item.fundingMax ?? 0)}`;
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
    year: "numeric"
  }).format(new Date(value));
}

function readOpportunities() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(storageKey);
    return raw ? (JSON.parse(raw) as Opportunity[]) : [];
  } catch {
    return [];
  }
}

function writeOpportunities(items: Opportunity[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(storageKey, JSON.stringify(items));
}
