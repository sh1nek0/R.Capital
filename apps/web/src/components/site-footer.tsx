"use client";

import Link from "next/link";
import { Shield, UserRound } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { usePreferences } from "@/lib/preferences";

const footerCopy = {
  ru: {
    product: "Продукт",
    diagnostic: "Диагностика",
    showcase: "Витрина стартапов",
    founder: "Фаундеру",
    founderPanel: "Кабинет фаундера",
    founderLogin: "Вход фаундера",
    founderRegister: "Регистрация",
    legal: "Документы",
    privacy: "Персональные данные",
    terms: "Соглашение",
    internal: "Внутренний контур",
    adminLogin: "Вход для администрации",
    adminPanel: "Панель администратора",
    bootstrap: "Первичная настройка",
    disclaimer:
      "Capital OS Navigator не является инвестиционной платформой и не организует инвестиционные сделки.",
    rolePrefix: "Текущая роль"
  },
  en: {
    product: "Product",
    diagnostic: "Diagnostic",
    showcase: "Startup showcase",
    founder: "Founder",
    founderPanel: "Founder dashboard",
    founderLogin: "Founder login",
    founderRegister: "Register",
    legal: "Legal",
    privacy: "Privacy",
    terms: "Terms",
    internal: "Internal",
    adminLogin: "Administration login",
    adminPanel: "Admin panel",
    bootstrap: "Bootstrap",
    disclaimer:
      "Capital OS Navigator is not an investment platform and does not organize investment transactions.",
    rolePrefix: "Current role"
  }
};

export function SiteFooter() {
  const { language } = usePreferences();
  const { isAdminLike, isAuthenticated, user } = useAuth();
  const copy = footerCopy[language];

  return (
    <footer className="border-t border-ink/10 bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 md:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr_1fr]">
        <div>
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded bg-ink text-sm font-semibold text-white">
              CO
            </span>
            <span>
              <span className="block text-sm font-semibold text-ink">Capital OS</span>
              <span className="block text-xs text-ink/55">Navigator</span>
            </span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-6 text-ink/65">
            {copy.disclaimer}
          </p>
        </div>

        <FooterColumn
          title={copy.product}
          links={[
            [copy.diagnostic, "/diagnostic"],
            [copy.showcase, "/startups"]
          ]}
        />
        <FooterColumn
          title={copy.founder}
          links={[
            [copy.founderPanel, "/founder"],
            [copy.founderLogin, "/login"],
            [copy.founderRegister, "/register"]
          ]}
        />
        <FooterColumn
          title={copy.legal}
          links={[
            [copy.privacy, "/privacy"],
            [copy.terms, "/terms"]
          ]}
        />

        <div>
          <p className="text-sm font-semibold text-ink">{copy.internal}</p>
          <div className="mt-3 grid gap-2">
            <Link
              href={isAdminLike ? "/admin/startups" : "/admin/login"}
              className="inline-flex items-center gap-2 rounded border border-ink/15 px-3 py-2 text-sm font-semibold text-ink"
            >
              <Shield size={16} />
              {isAdminLike ? copy.adminPanel : copy.adminLogin}
            </Link>
            <Link
              href="/admin/bootstrap"
              className="text-sm font-medium text-ink/65"
            >
              {copy.bootstrap}
            </Link>
            {isAuthenticated && (
              <p className="inline-flex items-center gap-2 text-xs text-ink/50">
                <UserRound size={14} />
                {copy.rolePrefix}: {user?.role}
              </p>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links
}: {
  title: string;
  links: string[][];
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-ink">{title}</p>
      <div className="mt-3 grid gap-2">
        {links.map(([label, href]) => (
          <Link key={href} href={href} className="text-sm font-medium text-ink/65">
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
