"use client";

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  ClipboardList,
  FileText,
  MessageSquareText,
  Plus,
  Rocket,
  ShieldCheck,
  Store
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth";
import {
  listConsultations,
  listDiagnostics,
  listFounderConsultations,
  listFounderDiagnostics,
  routeLabels,
  stageLabels,
  statusLabels,
  type StoredConsultation,
  type StoredDiagnostic
} from "@/lib/diagnostic";

type FounderStartupGroup = {
  key: string;
  name: string;
  diagnostics: StoredDiagnostic[];
  latest: StoredDiagnostic;
};

export function FounderDashboardClient() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, isAdminLike } = useAuth();
  const [diagnostics, setDiagnostics] = useState<StoredDiagnostic[]>([]);
  const [consultations, setConsultations] = useState<StoredConsultation[]>([]);
  const canOpenFounderView = user?.role === "founder" || isAdminLike;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login?next=/founder");
    }
    if (!isLoading && isAuthenticated && !canOpenFounderView) {
      router.replace("/");
    }
  }, [canOpenFounderView, isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (!user?.email) {
      return;
    }

    if (isAdminLike) {
      setDiagnostics(listDiagnostics(false));
      setConsultations(listConsultations(false));
      return;
    }

    setDiagnostics(listFounderDiagnostics(user.email));
    setConsultations(listFounderConsultations(user.email));
  }, [isAdminLike, user?.email]);

  const latestDiagnostic = diagnostics[0];
  const startupGroups = useMemo(() => groupDiagnosticsByStartup(diagnostics), [diagnostics]);
  const reports = diagnostics;
  const topRoutes = useMemo(() => {
    return latestDiagnostic?.route.routeScores.slice(0, 3) ?? [];
  }, [latestDiagnostic]);
  const consultationHref = latestDiagnostic
    ? `/consultation-request?startupId=${latestDiagnostic.id}`
    : "/diagnostic";
  const pathCards = [
    {
      title: "Новая заявка",
      text: "Добавить еще один стартап или повторно пройти диагностику для новой стадии.",
      href: "/diagnostic",
      icon: ClipboardList
    },
    {
      title: "Витрина стартапов",
      text: "Посмотреть публичные профили и свои проекты, которые ждут модерации.",
      href: "/startups",
      icon: Store
    },
    {
      title: "Запросить разбор",
      text: latestDiagnostic
        ? "Передать последний отчет аналитику Capital OS для ручного review."
        : "Сначала создай диагностику, чтобы привязать разбор к проекту.",
      href: consultationHref,
      icon: MessageSquareText
    }
  ];

  if (isLoading || !isAuthenticated || !canOpenFounderView) {
    return (
      <main className="min-h-screen bg-paper px-6 py-10">
        <div className="mx-auto max-w-5xl rounded border border-ink/10 bg-white p-6 text-sm text-ink/70">
          Проверяю founder-сессию...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-paper px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div className="rounded border border-ink/10 bg-white p-6">
            <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-steel">
              <Rocket size={17} />
              Профиль фаундера
            </p>
            <h1 className="mt-4 text-5xl font-semibold leading-tight text-ink">
              {isAdminLike
                ? "Founder-контур: просмотр всех проектов"
                : `${user?.name}, здесь все твои проекты`}
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-ink/65">
              {isAdminLike
                ? "Ты вошел как admin/analyst, поэтому видишь founder-профиль в режиме оператора: все стартапы, заявки, отчеты и запросы на разбор."
                : "У одного фаундера может быть несколько стартапов, заявок, отчетов и запросов на разбор. В MVP связываем их по email аккаунта и email в диагностике."}
            </p>

            <div className="mt-6 grid gap-3 md:grid-cols-4">
              <Metric label="Стартапы" value={`${startupGroups.length}`} />
              <Metric label="Заявки" value={`${diagnostics.length}`} />
              <Metric label="Отчеты" value={`${reports.length}`} />
              <Metric label="Разборы" value={`${consultations.length}`} />
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {pathCards.map((card) => (
                <Link
                  key={card.href}
                  href={card.href}
                  className="rounded border border-ink/10 p-5 transition hover:border-ink/30"
                >
                  <card.icon className="text-steel" size={24} />
                  <h2 className="mt-4 text-xl font-semibold text-ink">
                    {card.title}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-ink/65">
                    {card.text}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-ink">
                    Открыть
                    <ArrowRight size={15} />
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <aside className="rounded border border-ink/10 bg-white p-6">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-mint" size={22} />
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-steel">
                  Последний отчет
                </p>
                <h2 className="mt-1 text-2xl font-semibold text-ink">
                  {latestDiagnostic
                    ? latestDiagnostic.form.startupName
                    : "Пока нет диагностики"}
                </h2>
              </div>
            </div>

            {latestDiagnostic ? (
              <div className="mt-5">
                <p className="text-sm text-ink/60">
                  {stageLabels[latestDiagnostic.form.stage]} ·{" "}
                  {routeLabels[latestDiagnostic.route.primaryRoute]}
                </p>
                <div className="mt-5 grid gap-3">
                  {topRoutes.map((item) => (
                    <div key={item.route}>
                      <div className="flex justify-between text-sm font-medium text-ink">
                        <span>{routeLabels[item.route]}</span>
                        <span>{item.score}%</span>
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
                <div className="mt-6 grid gap-3">
                  <Link
                    href={`/diagnostic/result/${latestDiagnostic.id}`}
                    className="inline-flex w-full items-center justify-center gap-2 rounded bg-ink px-5 py-3 text-sm font-semibold text-white"
                  >
                    Открыть отчет
                    <ArrowRight size={16} />
                  </Link>
                  <Link
                    href={`/consultation-request?startupId=${latestDiagnostic.id}`}
                    className="inline-flex w-full items-center justify-center gap-2 rounded border border-ink/15 px-5 py-3 text-sm font-semibold text-ink"
                  >
                    Запросить разбор
                  </Link>
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded border border-ink/10 bg-paper p-4">
                <BarChart3 className="text-steel" size={22} />
                <p className="mt-3 text-sm leading-6 text-ink/70">
                  Начни с анкеты: после отправки появятся стартап, заявка,
                  отчет, маршрут и карточка проекта для модерации витрины.
                </p>
                <Link
                  href="/diagnostic"
                  className="mt-4 inline-flex items-center gap-2 rounded bg-ink px-4 py-3 text-sm font-semibold text-white"
                >
                  Создать первую заявку
                  <ArrowRight size={16} />
                </Link>
              </div>
            )}
          </aside>
        </section>

        <section className="mt-6 rounded border border-ink/10 bg-white p-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-steel">
                Мои стартапы
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-ink">
                Стартапы, привязанные к профилю
              </h2>
            </div>
            <Link
              href="/diagnostic"
              className="inline-flex items-center justify-center gap-2 rounded bg-ink px-5 py-3 text-sm font-semibold text-white"
            >
              <Plus size={16} />
              Добавить стартап
            </Link>
          </div>

          {startupGroups.length > 0 ? (
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {startupGroups.map((group) => (
                <StartupCard key={group.key} group={group} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Стартапов пока нет"
              text="Пройди диагностику, и первый проект автоматически появится в профиле."
              href="/diagnostic"
              cta="Пройти диагностику"
            />
          )}
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded border border-ink/10 bg-white p-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-steel">
              Заявки и отчеты
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-ink">
              История диагностик
            </h2>

            {diagnostics.length > 0 ? (
              <div className="mt-5 grid gap-3">
                {diagnostics.map((item) => (
                  <ApplicationRow key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="Заявок пока нет"
                text="Каждая отправленная анкета станет заявкой и отчетом."
                href="/diagnostic"
                cta="Создать заявку"
              />
            )}
          </div>

          <div className="rounded border border-ink/10 bg-white p-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-steel">
              Разборы
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-ink">
              Запросы аналитикам
            </h2>

            {consultations.length > 0 ? (
              <div className="mt-5 grid gap-3">
                {consultations.map((item) => (
                  <ConsultationRow
                    key={item.id}
                    item={item}
                    diagnostic={diagnostics.find(
                      (diagnostic) => diagnostic.id === item.startupId
                    )}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="Разборов пока нет"
                text="Запрос можно отправить из отчета или из последнего проекта."
                href={consultationHref}
                cta="Запросить разбор"
              />
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-ink/10 bg-paper p-4">
      <p className="text-xs uppercase tracking-wide text-ink/45">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-ink">{value}</p>
    </div>
  );
}

function StartupCard({ group }: { group: FounderStartupGroup }) {
  const { latest } = group;
  const topScore = latest.route.routeScores[0];

  return (
    <article className="rounded border border-ink/10 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-steel">{latest.form.industry}</p>
          <h3 className="mt-2 text-2xl font-semibold text-ink">{group.name}</h3>
        </div>
        <span className="rounded bg-mint/15 px-3 py-2 text-xs font-semibold text-ink">
          {topScore.score}%
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-ink/65">
        {latest.form.description}
      </p>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <SmallFact label="Стадия" value={stageLabels[latest.form.stage]} />
        <SmallFact label="Маршрут" value={routeLabels[latest.route.primaryRoute]} />
        <SmallFact label="Заявки" value={`${group.diagnostics.length}`} />
        <SmallFact label="Витрина" value={showcaseStatusLabel(latest.showcase.status)} />
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          href={`/diagnostic/result/${latest.id}`}
          className="rounded bg-ink px-4 py-3 text-sm font-semibold text-white"
        >
          Последний отчет
        </Link>
        <Link
          href={`/consultation-request?startupId=${latest.id}`}
          className="rounded border border-ink/15 px-4 py-3 text-sm font-semibold text-ink"
        >
          Разбор
        </Link>
      </div>
    </article>
  );
}

function ApplicationRow({ item }: { item: StoredDiagnostic }) {
  const topScore = item.route.routeScores[0];

  return (
    <div className="grid gap-4 rounded border border-ink/10 p-4 md:grid-cols-[1fr_180px_150px_auto] md:items-center">
      <div>
        <p className="font-semibold text-ink">{item.form.startupName}</p>
        <p className="mt-1 text-sm text-ink/60">
          {formatDate(item.createdAt)} · {stageLabels[item.form.stage]}
        </p>
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-ink/45">Статус</p>
        <p className="mt-1 text-sm font-semibold text-ink">{statusLabels[item.status]}</p>
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-ink/45">Лучший путь</p>
        <p className="mt-1 text-sm font-semibold text-ink">
          {routeLabels[topScore.route]} {topScore.score}%
        </p>
      </div>
      <Link
        href={`/diagnostic/result/${item.id}`}
        className="inline-flex items-center justify-center gap-2 rounded border border-ink/15 px-4 py-3 text-sm font-semibold text-ink"
      >
        Отчет
        <FileText size={15} />
      </Link>
    </div>
  );
}

function ConsultationRow({
  item,
  diagnostic
}: {
  item: StoredConsultation;
  diagnostic?: StoredDiagnostic;
}) {
  return (
    <div className="rounded border border-ink/10 p-4">
      <p className="text-sm font-semibold text-ink">
        {diagnostic?.form.startupName ?? "Проект не найден"}
      </p>
      <p className="mt-1 text-sm text-ink/60">
        {consultationTypeLabel(item.type)} · {formatDate(item.createdAt)}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded bg-paper px-3 py-2 text-xs font-semibold text-ink/70">
          {item.status}
        </span>
        <span className="rounded border border-ink/10 px-3 py-2 text-xs text-ink/70">
          {item.preferredContact}
        </span>
      </div>
    </div>
  );
}

function SmallFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-ink/10 p-3">
      <p className="text-xs uppercase tracking-wide text-ink/45">{label}</p>
      <p className="mt-1 text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}

function EmptyState({
  title,
  text,
  href,
  cta
}: {
  title: string;
  text: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="mt-5 rounded border border-dashed border-ink/15 bg-paper p-6">
      <p className="text-lg font-semibold text-ink">{title}</p>
      <p className="mt-2 text-sm leading-6 text-ink/65">{text}</p>
      <Link
        href={href}
        className="mt-4 inline-flex items-center gap-2 rounded bg-ink px-4 py-3 text-sm font-semibold text-white"
      >
        {cta}
        <ArrowRight size={15} />
      </Link>
    </div>
  );
}

function groupDiagnosticsByStartup(
  diagnostics: StoredDiagnostic[]
): FounderStartupGroup[] {
  const groups = new Map<string, StoredDiagnostic[]>();

  for (const diagnostic of diagnostics) {
    const key = diagnostic.form.startupName.trim().toLowerCase() || diagnostic.id;
    groups.set(key, [diagnostic, ...(groups.get(key) ?? [])]);
  }

  return Array.from(groups.entries()).map(([key, items]) => {
    const sorted = [...items].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return {
      key,
      name: sorted[0].form.startupName || "Новый стартап",
      diagnostics: sorted,
      latest: sorted[0]
    };
  });
}

function showcaseStatusLabel(status: StoredDiagnostic["showcase"]["status"]) {
  if (status === "published") {
    return "Опубликован";
  }
  if (status === "rejected") {
    return "Отклонен";
  }

  return "Модерация";
}

function consultationTypeLabel(type: string) {
  if (type === "readiness_report") {
    return "Отчет готовности";
  }
  if (type === "fundraising_prep") {
    return "Подготовка к привлечению";
  }

  return "Экспертный разбор";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date(value));
}
