"use client";

import Link from "next/link";
import { Download, Filter, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { StartupStatus } from "@capital-os/shared";
import {
  listDiagnostics,
  routeLabels,
  stageLabels,
  statusLabels,
  updateDiagnosticStatus,
  type StoredDiagnostic
} from "@/lib/diagnostic";

export function AdminStartupsClient() {
  const [items, setItems] = useState<StoredDiagnostic[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StartupStatus | "all">("all");
  const [stage, setStage] = useState("all");

  useEffect(() => {
    setItems(listDiagnostics(true));
  }, []);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const haystack = [
        item.form.startupName,
        item.form.founderName,
        item.form.email,
        item.form.industry,
        item.route.primaryRoute
      ]
        .join(" ")
        .toLowerCase();
      const matchesQuery = haystack.includes(query.toLowerCase());
      const matchesStatus = status === "all" || item.status === status;
      const matchesStage = stage === "all" || item.form.stage === stage;

      return matchesQuery && matchesStatus && matchesStage;
    });
  }, [items, query, status, stage]);

  function changeStatus(id: string, nextStatus: StartupStatus) {
    updateDiagnosticStatus(id, nextStatus);
    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, status: nextStatus } : item
      )
    );
  }

  function exportCsv() {
    const header = [
      "project",
      "founder",
      "email",
      "stage",
      "industry",
      "funding_paths",
      "status",
      "funding_need"
    ];
    const rows = filtered.map((item) => [
      item.form.startupName,
      item.form.founderName,
      item.form.email,
      item.form.stage,
      item.form.industry,
      getTopRouteScores(item)
        .map((routeScore) => `${routeLabels[routeScore.route]} ${routeScore.score}%`)
        .join("; "),
      item.status,
      item.form.fundingNeedAmount
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "capital-os-startups.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-paper px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-steel">
              Внутренняя админка
            </p>
            <h1 className="mt-3 text-4xl font-semibold text-ink">
              Заявки стартапов
            </h1>
          </div>
          <button
            type="button"
            onClick={exportCsv}
            className="inline-flex items-center justify-center gap-2 rounded bg-ink px-5 py-3 text-sm font-semibold text-white"
          >
            <Download size={16} />
            CSV
          </button>
        </div>

        <section className="mt-8 rounded border border-ink/10 bg-white p-4">
          <div className="grid gap-3 lg:grid-cols-[1fr_220px_220px]">
            <label className="relative">
              <Search className="pointer-events-none absolute left-3 top-3.5 text-ink/40" size={18} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Поиск по проекту, фаундеру, отрасли"
                className="w-full rounded border border-ink/15 py-3 pl-10 pr-3 text-sm"
              />
            </label>
            <label className="relative">
              <Filter className="pointer-events-none absolute left-3 top-3.5 text-ink/40" size={18} />
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as StartupStatus | "all")}
                className="w-full rounded border border-ink/15 py-3 pl-10 pr-3 text-sm"
              >
                <option value="all">Все статусы</option>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <select
              value={stage}
              onChange={(event) => setStage(event.target.value)}
              className="w-full rounded border border-ink/15 px-3 py-3 text-sm"
            >
              <option value="all">Все стадии</option>
              {Object.entries(stageLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </section>

        <div className="mt-6 overflow-x-auto rounded border border-ink/10 bg-white">
          <table className="w-full min-w-[960px] border-collapse text-left text-sm">
            <thead className="bg-ink text-white">
              <tr>
                <th className="p-4">Проект</th>
                <th className="p-4">Фаундер</th>
                <th className="p-4">Стадия</th>
                <th className="p-4">Пути финансирования</th>
                <th className="p-4">Витрина</th>
                <th className="p-4">Статус</th>
                <th className="p-4">Создано</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className="border-t border-ink/10 align-top">
                  <td className="p-4">
                    <Link
                      href={`/admin/startups/${item.id}`}
                      className="font-semibold text-ink"
                    >
                      {item.form.startupName}
                    </Link>
                    <p className="mt-1 text-xs text-ink/55">{item.form.industry}</p>
                  </td>
                  <td className="p-4 text-ink/70">
                    <p>{item.form.founderName}</p>
                    <p className="mt-1 text-xs">{item.form.email}</p>
                  </td>
                  <td className="p-4 text-ink/70">{stageLabels[item.form.stage]}</td>
                  <td className="p-4">
                    <div className="flex min-w-72 flex-wrap gap-2">
                      {getTopRouteScores(item).map((routeScore, index) => (
                        <span
                          key={routeScore.route}
                          className={`rounded px-3 py-2 text-xs font-semibold ${
                            index === 0
                              ? "bg-mint/15 text-ink"
                              : "border border-ink/10 text-ink/70"
                          }`}
                        >
                          {routeLabels[routeScore.route]} {routeScore.score}%
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="rounded border border-ink/10 bg-paper px-3 py-2 text-xs font-semibold text-ink/70">
                      {showcaseStatusLabel(item)}
                    </span>
                  </td>
                  <td className="p-4">
                    <select
                      value={item.status}
                      onChange={(event) =>
                        changeStatus(item.id, event.target.value as StartupStatus)
                      }
                      className="w-full rounded border border-ink/15 px-3 py-2 text-sm text-ink"
                    >
                      {Object.entries(statusLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-4 text-ink/60">{formatDate(item.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="p-8 text-sm text-ink/60">Заявки не найдены.</div>
          )}
        </div>
      </div>
    </main>
  );
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

function getTopRouteScores(item: StoredDiagnostic) {
  return item.route.routeScores.slice(0, 3);
}

function showcaseStatusLabel(item: StoredDiagnostic) {
  if (item.showcase.status === "published") {
    return "Опубликован";
  }
  if (item.showcase.status === "rejected") {
    return "Отклонен";
  }

  return "На модерации";
}
