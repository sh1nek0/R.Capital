"use client";

import Link from "next/link";
import { LogOut, Shield } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/lib/auth";

const publicAdminPaths = ["/admin/login", "/admin/bootstrap"];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, isAuthenticated, isAdminLike, logout } = useAuth();
  const isPublicAdminPath = publicAdminPaths.some((path) => pathname.startsWith(path));

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isPublicAdminPath) {
      router.replace(`/admin/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthenticated, isLoading, isPublicAdminPath, pathname, router]);

  if (isPublicAdminPath) {
    return children;
  }

  if (isLoading || !isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-paper px-6">
        <div className="rounded border border-ink/10 bg-white p-6 text-sm text-ink/70">
          Проверяю доступ...
        </div>
      </main>
    );
  }

  if (!isAdminLike) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-paper px-6">
        <section className="max-w-lg rounded border border-ink/10 bg-white p-6">
          <div className="flex items-start gap-3">
            <Shield className="mt-1 text-signal" size={24} />
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-steel">
                Доступ закрыт
              </p>
              <h1 className="mt-3 text-3xl font-semibold text-ink">
                Нужна роль admin или analyst
              </h1>
              <p className="mt-4 leading-7 text-ink/70">
                Текущая роль: {user?.role}. Admin-разделы заблокированы для
                обычных пользователей.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    router.replace("/admin/login");
                  }}
                  className="rounded bg-ink px-5 py-3 text-sm font-semibold text-white"
                >
                  Выйти
                </button>
                <Link
                  href="/"
                  className="rounded border border-ink/15 px-5 py-3 text-sm font-semibold text-ink"
                >
                  На главную
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-ink/10 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 px-6 py-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-semibold text-ink">Администрирование Capital OS</p>
            <p className="mt-1 text-xs text-ink/55">
              {user?.name} - {user?.role}
            </p>
          </div>
          <nav className="flex flex-wrap items-center gap-3 text-sm font-semibold text-ink/70">
            <Link href="/admin/startups">Стартапы</Link>
            <Link href="/admin/consultations">Разборы</Link>
            <Link href="/admin/reports">Отчеты</Link>
            <Link href="/admin/opportunities">Возможности</Link>
            {user?.role === "admin" && <Link href="/admin/bootstrap">Админы</Link>}
            <button
              type="button"
              onClick={() => {
                logout();
                router.replace("/admin/login");
              }}
              className="inline-flex items-center gap-2 rounded border border-ink/15 px-3 py-2 text-ink"
            >
              <LogOut size={15} />
              Выйти
            </button>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
