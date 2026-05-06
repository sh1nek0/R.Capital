"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth";

export function FounderLoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const nextPath = searchParams.get("next") ?? "/founder";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    try {
      await login({ email, password });
      router.replace(nextPath);
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Не удалось войти");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-6">
      <form onSubmit={submit} className="w-full max-w-md rounded border border-ink/10 bg-white p-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-steel">
          Кабинет фаундера
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-ink">Вход</h1>
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
            className="rounded bg-ink px-5 py-3 text-sm font-semibold text-white"
          >
            Войти
          </button>
          <Link href="/register" className="text-sm font-semibold text-ink/70">
            Зарегистрироваться
          </Link>
        </div>
      </form>
    </main>
  );
}
