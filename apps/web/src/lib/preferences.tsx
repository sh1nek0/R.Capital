"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";

export type AppLanguage = "ru" | "en";
export type AppTheme = "light" | "dark";

type PreferencesContextValue = {
  language: AppLanguage;
  theme: AppTheme;
  setLanguage: (language: AppLanguage) => void;
  toggleLanguage: () => void;
  toggleTheme: () => void;
};

const PreferencesContext = createContext<PreferencesContextValue | null>(null);
const languageKey = "capital-os.language.v1";
const themeKey = "capital-os.theme.v1";

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>("ru");
  const [theme, setTheme] = useState<AppTheme>("light");

  useEffect(() => {
    const storedLanguage = window.localStorage.getItem(languageKey);
    const storedTheme = window.localStorage.getItem(themeKey);

    if (storedLanguage === "ru" || storedLanguage === "en") {
      setLanguageState(storedLanguage);
    }
    if (storedTheme === "light" || storedTheme === "dark") {
      setTheme(storedTheme);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    window.localStorage.setItem(languageKey, language);
  }, [language]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem(themeKey, theme);
  }, [theme]);

  const value = useMemo<PreferencesContextValue>(
    () => ({
      language,
      theme,
      setLanguage: setLanguageState,
      toggleLanguage: () =>
        setLanguageState((current) => (current === "ru" ? "en" : "ru")),
      toggleTheme: () =>
        setTheme((current) => (current === "light" ? "dark" : "light"))
    }),
    [language, theme]
  );

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error("usePreferences must be used inside PreferencesProvider");
  }

  return context;
}

