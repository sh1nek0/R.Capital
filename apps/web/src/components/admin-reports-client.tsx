"use client";

import Link from "next/link";
import { ExternalLink, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { listDiagnostics, routeLabels, type StoredDiagnostic } from "@/lib/diagnostic";

export function AdminReportsClient() {
  const [items, setItems] = useState<StoredDiagnostic[]>([]);

  useEffect(() => {
    setItems(listDiagnostics(true));
  }, []);

  return (
    <main className="min-h-screen bg-paper px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center gap-3">
          <FileText className="text-steel" size={24} />
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-steel">
              Очередь отчетов
            </p>
            <h1 className="mt-2 text-4xl font-semibold text-ink">Отчеты</h1>
          </div>
        </div>

        <div className="mt-8 grid gap-4">
          {items.map((item) => (
            <article key={item.id} className="rounded border border-ink/10 bg-white p-5">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <h2 className="text-xl font-semibold text-ink">
                    {item.form.startupName}
                  </h2>
                  <p className="mt-2 text-sm text-ink/65">
                    {routeLabels[item.route.primaryRoute]} - web-отчет готов
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href={`/diagnostic/result/${item.id}`}
                    className="inline-flex items-center gap-2 rounded bg-ink px-5 py-3 text-sm font-semibold text-white"
                  >
                    <ExternalLink size={16} />
                    Открыть
                  </Link>
                  <Link
                    href={`/admin/startups/${item.id}`}
                    className="rounded border border-ink/15 px-5 py-3 text-sm font-semibold text-ink"
                  >
                    Карточка
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
