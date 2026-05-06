"use client";

import Link from "next/link";
import { KeyRound, ShieldPlus } from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export function AdminBootstrapClient() {
  const router = useRouter();
  const { createFirstAdmin, createAdmin, isAuthenticated, user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [name, setName] = useState("ret1w");
  const [email, setEmail] = useState("rostislavdolmatovitch@yandex.ru");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      if (isAdmin) {
        const created = await createAdmin({ name, email, password });
        setSuccess(`Администратор ${created.email} создан.`);
        setName("");
        setEmail("");
        setPassword("");
        return;
      }

      await createFirstAdmin({ name, email, password });
      router.replace("/admin/startups");
    } catch (authError) {
      setError(
        authError instanceof Error ? authError.message : "Не удалось создать админа"
      );
    }
  }

  const title = isAdmin ? "Добавить администратора" : "Создать первого администратора";
  const eyebrow = isAdmin ? "Управление доступом" : "Первичная настройка";
  const description = isAdmin
    ? "Нового администратора может добавить только пользователь с ролью admin."
    : "Эта форма создает первого администратора без bootstrap-токена только если в системе еще нет ни одного admin. Если такой email уже создан и пароль верный, система просто войдет в аккаунт.";

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-6">
      <form onSubmit={submit} className="w-full max-w-lg rounded border border-ink/10 bg-white p-6">
        <div className="flex items-center gap-3">
          {isAdmin ? (
            <ShieldPlus className="text-steel" size={24} />
          ) : (
            <KeyRound className="text-steel" size={24} />
          )}
          <p className="text-sm font-semibold uppercase tracking-wide text-steel">
            {eyebrow}
          </p>
        </div>
        <h1 className="mt-5 text-3xl font-semibold text-ink">
          {title}
        </h1>
        <p className="mt-3 leading-7 text-ink/70">
          {description}
        </p>
        {isAuthenticated && !isAdmin && (
          <p className="mt-4 rounded border border-signal/40 bg-signal/10 p-3 text-sm leading-6 text-ink/75">
            Сейчас ты вошел с ролью {user?.role}. Добавлять следующих админов
            может только admin.
          </p>
        )}
        <div className="mt-6 grid gap-4">
          <label className="grid gap-2 text-sm font-medium text-ink">
            Имя
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="rounded border border-ink/15 px-3 py-3"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-ink">
            Email
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="rounded border border-ink/15 px-3 py-3"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-ink">
            Пароль
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="rounded border border-ink/15 px-3 py-3"
            />
          </label>
          {error && <p className="text-sm font-medium text-red-600">{error}</p>}
          {success && <p className="text-sm font-medium text-mint">{success}</p>}
          <button
            type="submit"
            className="rounded bg-ink px-5 py-3 text-sm font-semibold text-white"
          >
            {isAdmin ? "Добавить администратора" : "Создать и войти"}
          </button>
          {isAdmin && (
            <Link href="/admin/startups" className="text-sm font-semibold text-ink/70">
              Вернуться в админку
            </Link>
          )}
          <Link href="/admin/login" className="text-sm font-semibold text-ink/70">
            Уже есть администратор
          </Link>
        </div>
      </form>
    </main>
  );
}
