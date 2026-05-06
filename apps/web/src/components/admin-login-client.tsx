"use client";

import Link from "next/link";
import { LogIn, Shield } from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth";

const reasonMessages: Record<string, string> = {
  missing_token: "Сначала нужно войти.",
  invalid_token: "Сессия истекла или токен некорректный.",
  forbidden: "Для этого раздела нужна роль admin или analyst."
};

export function AdminLoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, logout, user, isAdminLike } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(searchParams.get("reason") ? reasonMessages[searchParams.get("reason") ?? ""] : "");
  const nextPath = searchParams.get("next") ?? "/admin/startups";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    try {
      const nextUser = await login({ email, password });
      if (nextUser.role !== "admin" && nextUser.role !== "analyst") {
        logout();
        setError("У пользователя нет доступа к админке.");
        return;
      }

      router.replace(nextPath);
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Не удалось войти");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-6">
      <section className="grid w-full max-w-5xl gap-6 md:grid-cols-[0.85fr_1.15fr]">
        <aside className="rounded border border-ink/10 bg-white p-6">
          <div className="flex items-center gap-3">
            <Shield className="text-steel" size={24} />
            <p className="text-sm font-semibold uppercase tracking-wide text-steel">
              Внутренний контур
            </p>
          </div>
          <h1 className="mt-5 text-4xl font-semibold leading-tight text-ink">
            Вход для admin и analyst
          </h1>
          <p className="mt-4 leading-7 text-ink/70">
            После входа токен сохраняется в cookie и localStorage. Middleware
            проверяет подпись токена и роль до открытия `/admin/*`.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/admin/bootstrap"
              className="rounded border border-ink/15 px-4 py-3 text-sm font-semibold text-ink"
            >
              Создать первого админа
            </Link>
            <Link
              href="/login"
              className="rounded border border-ink/15 px-4 py-3 text-sm font-semibold text-ink"
            >
              Вход фаундера
            </Link>
          </div>
        </aside>

        <form onSubmit={submit} className="rounded border border-ink/10 bg-white p-6">
          <h2 className="text-3xl font-semibold text-ink">Войти</h2>
          {user && (
            <p className="mt-3 rounded border border-ink/10 bg-paper p-3 text-sm text-ink/70">
              Сейчас активен пользователь {user.email} с ролью {user.role}.
              {isAdminLike ? " Можно перейти в админку." : " Для админки этой роли недостаточно."}
            </p>
          )}
          <div className="mt-6 grid gap-4">
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
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded bg-ink px-5 py-3 text-sm font-semibold text-white"
            >
              <LogIn size={16} />
              Войти
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
