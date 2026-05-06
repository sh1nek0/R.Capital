"use client";

import Link from "next/link";
import { Check, Send } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  findDiagnostic,
  saveConsultation,
  type StoredConsultation,
  type StoredDiagnostic
} from "@/lib/diagnostic";

export function ConsultationRequestClient() {
  const searchParams = useSearchParams();
  const startupId = searchParams.get("startupId") ?? undefined;
  const [diagnostic, setDiagnostic] = useState<StoredDiagnostic>();
  const [type, setType] = useState("expert_review");
  const [preferredContact, setPreferredContact] = useState("");
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [created, setCreated] = useState<StoredConsultation>();

  useEffect(() => {
    if (!startupId) {
      return;
    }

    const item = findDiagnostic(startupId, true);
    setDiagnostic(item);
    setPreferredContact(item?.form.telegram || item?.form.email || "");
  }, [startupId]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!preferredContact.trim()) {
      setError("Укажи удобный контакт");
      return;
    }

    const consultation = saveConsultation({
      startupId,
      type,
      preferredContact,
      comment
    });
    setCreated(consultation);
  }

  if (created) {
    return (
      <main className="min-h-screen bg-paper px-6 py-10">
        <div className="mx-auto max-w-3xl rounded border border-ink/10 bg-white p-6">
          <div className="flex items-start gap-3">
            <Check className="mt-1 text-mint" size={24} />
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-steel">
                Заявка создана
              </p>
              <h1 className="mt-3 text-4xl font-semibold text-ink">
                Команда увидит запрос в админке
              </h1>
              <p className="mt-4 leading-7 text-ink/70">
                Статус заявки: requested. На MVP оплату не подключаем, обработка
                идет вручную.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/founder"
                  className="rounded bg-ink px-5 py-3 text-sm font-semibold text-white"
                >
                  В профиль фаундера
                </Link>
                {startupId && (
                  <Link
                    href={`/diagnostic/result/${startupId}`}
                    className="rounded border border-ink/15 px-5 py-3 text-sm font-semibold text-ink"
                  >
                    Вернуться к отчету
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-paper px-6 py-10">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <aside className="rounded border border-ink/10 bg-white p-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-steel">
            Заявка на разбор
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-ink">
            Подключить эксперта Capital OS
          </h1>
          <p className="mt-4 leading-7 text-ink/70">
            Заявка попадет во внутренний поток. Аналитик увидит анкету, score и
            маршрут.
          </p>

          {diagnostic && (
            <div className="mt-6 rounded border border-ink/10 p-4">
              <p className="text-xs uppercase tracking-wide text-ink/45">Проект</p>
              <p className="mt-2 text-sm font-semibold text-ink">
                {diagnostic.form.startupName}
              </p>
              <p className="mt-2 text-sm text-ink/65">
                {diagnostic.form.industry}
              </p>
            </div>
          )}
        </aside>

        <form onSubmit={submit} className="rounded border border-ink/10 bg-white p-6">
          <div className="grid gap-5">
            <label className="grid gap-2 text-sm font-medium text-ink">
              Формат
              <select
                value={type}
                onChange={(event) => setType(event.target.value)}
                className="rounded border border-ink/15 px-3 py-3"
              >
                <option value="expert_review">Экспертный разбор, 30-45 минут</option>
                <option value="readiness_report">Отчет готовности</option>
                <option value="fundraising_prep">Подготовка к привлечению</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium text-ink">
              Удобный контакт
              <input
                value={preferredContact}
                onChange={(event) => setPreferredContact(event.target.value)}
                className="rounded border border-ink/15 px-3 py-3"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-ink">
              Комментарий
              <textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                className="min-h-28 rounded border border-ink/15 px-3 py-3"
              />
            </label>
            {error && <p className="text-sm font-medium text-red-600">{error}</p>}
            <button
              type="submit"
              className="inline-flex w-fit items-center gap-2 rounded bg-ink px-5 py-3 text-sm font-semibold text-white"
            >
              <Send size={16} />
              Отправить заявку
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
