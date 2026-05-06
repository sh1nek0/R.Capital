"use client";

import Link from "next/link";
import {
  Languages,
  LogOut,
  Menu,
  Moon,
  Sun,
  UserRound,
  X
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { usePreferences } from "@/lib/preferences";

const navCopy = {
  ru: {
    links: [
      ["Главная", "/"],
      ["Диагностика", "/diagnostic"],
      ["Витрина стартапов", "/startups"]
    ],
    founderLogin: "Вход фаундера",
    founderPanel: "Кабинет",
    founderView: "Founder-view",
    adminPanel: "Админка",
    logout: "Выйти",
    openMenu: "Открыть меню",
    theme: "Тема",
    light: "Светлая",
    dark: "Темная",
    language: "Язык"
  },
  en: {
    links: [
      ["Home", "/"],
      ["Diagnostic", "/diagnostic"],
      ["Startup Showcase", "/startups"]
    ],
    founderLogin: "Founder Login",
    founderPanel: "Dashboard",
    founderView: "Founder-view",
    adminPanel: "Admin",
    logout: "Sign Out",
    openMenu: "Open menu",
    theme: "Theme",
    light: "Light",
    dark: "Dark",
    language: "Language"
  }
};

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isAdminLike, logout } = useAuth();
  const { language, theme, toggleLanguage, toggleTheme } = usePreferences();
  const [isOpen, setIsOpen] = useState(false);
  const copy = navCopy[language];

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded bg-ink text-sm font-semibold text-white">
            CO
          </span>
          <span>
            <span className="block text-sm font-semibold text-ink">Capital OS</span>
            <span className="block text-xs text-ink/55">Navigator</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 rounded border border-ink/10 bg-white p-1 md:flex">
          {copy.links.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className={`rounded px-3 py-2 text-sm font-semibold ${
                pathname === href ? "bg-ink text-white" : "text-ink/70"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex items-center gap-2 rounded border border-ink/15 bg-white px-3 py-2 text-sm font-semibold text-ink"
            title={copy.theme}
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            {theme === "dark" ? copy.light : copy.dark}
          </button>
          <button
            type="button"
            onClick={toggleLanguage}
            className="inline-flex items-center gap-2 rounded border border-ink/15 bg-white px-3 py-2 text-sm font-semibold text-ink"
            title={copy.language}
          >
            <Languages size={16} />
            {language.toUpperCase()}
          </button>
          {isAuthenticated ? (
            <>
              <Link
                href="/founder"
                className="inline-flex items-center gap-2 rounded bg-ink px-4 py-2 text-sm font-semibold text-white"
              >
                <UserRound size={16} />
                {isAdminLike ? copy.founderView : copy.founderPanel}
              </Link>
              {isAdminLike && (
                <Link
                  href="/admin/startups"
                  className="rounded border border-ink/15 bg-white px-3 py-2 text-sm font-semibold text-ink"
                >
                  {copy.adminPanel}
                </Link>
              )}
              <button
                type="button"
                onClick={() => {
                  logout();
                  router.push("/");
                }}
                className="inline-flex items-center gap-2 rounded border border-ink/15 bg-white px-3 py-2 text-sm font-semibold text-ink"
              >
                <LogOut size={16} />
                {copy.logout}
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded bg-ink px-4 py-2 text-sm font-semibold text-white"
            >
              <UserRound size={16} />
              {copy.founderLogin}
            </Link>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((value) => !value)}
          className="grid h-10 w-10 place-items-center rounded border border-ink/15 bg-white md:hidden"
          aria-label={copy.openMenu}
        >
          {isOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {isOpen && (
        <div className="border-t border-ink/10 bg-white px-6 py-4 md:hidden">
          <nav className="grid gap-2">
            {copy.links.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                onClick={() => setIsOpen(false)}
                className="rounded border border-ink/10 px-4 py-3 text-sm font-semibold text-ink"
              >
                {label}
              </Link>
            ))}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={toggleTheme}
                className="inline-flex items-center gap-2 rounded border border-ink/10 px-4 py-3 text-sm font-semibold text-ink"
              >
                {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                {theme === "dark" ? copy.light : copy.dark}
              </button>
              <button
                type="button"
                onClick={toggleLanguage}
                className="inline-flex items-center gap-2 rounded border border-ink/10 px-4 py-3 text-sm font-semibold text-ink"
              >
                <Languages size={16} />
                {language.toUpperCase()}
              </button>
            </div>
            {isAuthenticated ? (
              <>
                <Link
                  href="/founder"
                  onClick={() => setIsOpen(false)}
                  className="rounded bg-ink px-4 py-3 text-sm font-semibold text-white"
                >
                  {isAdminLike ? copy.founderView : copy.founderPanel}
                </Link>
                {isAdminLike && (
                  <Link
                    href="/admin/startups"
                    onClick={() => setIsOpen(false)}
                    className="rounded border border-ink/10 px-4 py-3 text-sm font-semibold text-ink"
                  >
                    {copy.adminPanel}
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                    router.push("/");
                  }}
                  className="rounded border border-ink/10 px-4 py-3 text-left text-sm font-semibold text-ink"
                >
                  {copy.logout}: {user?.role}
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="rounded bg-ink px-4 py-3 text-sm font-semibold text-white"
              >
                {copy.founderLogin}
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
