"use client";

import Link from "next/link";
import { Calendar, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  findDiagnostic,
  listConsultations,
  updateConsultationStatus,
  type StoredConsultation
} from "@/lib/diagnostic";

const consultationStatusLabels: Record<StoredConsultation["status"], string> = {
  requested: "Запрошена",
  scheduled: "Назначена",
  done: "Проведена",
  won: "Won",
  lost: "Lost"
};

export function AdminConsultationsClient() {
  const [items, setItems] = useState<StoredConsultation[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    setItems(listConsultations(true));
  }, []);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const startup = item.startupId ? findDiagnostic(item.startupId, true) : undefined;
      const haystack = [
        item.type,
        item.preferredContact,
        item.comment,
        startup?.form.startupName,
        startup?.form.founderName
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(query.toLowerCase());
    });
  }, [items, query]);

  function changeStatus(id: string, status: StoredConsultation["status"]) {
    updateConsultationStatus(id, status);
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, status } : item))
    );
  }

  return (
    <main className="min-h-screen bg-paper px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center gap-3">
          <Calendar className="text-steel" size={24} />
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-steel">
              Воронка разборов
            </p>
            <h1 className="mt-2 text-4xl font-semibold text-ink">
              Заявки на разбор
            </h1>
          </div>
        </div>

        <label className="relative mt-8 block max-w-xl">
          <Search className="pointer-events-none absolute left-3 top-3.5 text-ink/40" size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Поиск по проекту, контакту или формату"
            className="w-full rounded border border-ink/15 py-3 pl-10 pr-3 text-sm"
          />
        </label>

        <div className="mt-6 overflow-x-auto rounded border border-ink/10 bg-white">
          <table className="w-full min-w-[860px] border-collapse text-left text-sm">
            <thead className="bg-ink text-white">
              <tr>
                <th className="p-4">Проект</th>
                <th className="p-4">Формат</th>
                <th className="p-4">Контакт</th>
                <th className="p-4">Комментарий</th>
                <th className="p-4">Статус</th>
                <th className="p-4">Дата</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const startup = item.startupId
                  ? findDiagnostic(item.startupId, true)
                  : undefined;

                return (
                  <tr key={item.id} className="border-t border-ink/10 align-top">
                    <td className="p-4">
                      {startup ? (
                        <Link
                          href={`/admin/startups/${startup.id}`}
                          className="font-semibold text-ink"
                        >
                          {startup.form.startupName}
                        </Link>
                      ) : (
                        <span className="text-ink/60">Без проекта</span>
                      )}
                    </td>
                    <td className="p-4 text-ink/70">{item.type}</td>
                    <td className="p-4 text-ink/70">{item.preferredContact}</td>
                    <td className="p-4 text-ink/70">{item.comment || "-"}</td>
                    <td className="p-4">
                      <select
                        value={item.status}
                        onChange={(event) =>
                          changeStatus(
                            item.id,
                            event.target.value as StoredConsultation["status"]
                          )
                        }
                        className="w-full rounded border border-ink/15 px-3 py-2 text-sm text-ink"
                      >
                        {Object.entries(consultationStatusLabels).map(
                          ([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          )
                        )}
                      </select>
                    </td>
                    <td className="p-4 text-ink/60">{formatDate(item.createdAt)}</td>
                  </tr>
                );
              })}
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
