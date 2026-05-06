import type { Metadata } from "next";
import { AppFrame } from "@/components/app-frame";
import { AuthProvider } from "@/lib/auth";
import { PreferencesProvider } from "@/lib/preferences";
import "./globals.css";

export const metadata: Metadata = {
  title: "Capital OS Navigator",
  description: "Диагностика маршрута финансирования для стартапов"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>
        <PreferencesProvider>
          <AuthProvider>
            <AppFrame>{children}</AppFrame>
          </AuthProvider>
        </PreferencesProvider>
      </body>
    </html>
  );
}
