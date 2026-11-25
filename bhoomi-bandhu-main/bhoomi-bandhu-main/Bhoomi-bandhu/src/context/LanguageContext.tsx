import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getLanguageOption,
  isValidLanguageCode,
  translate,
  type LanguageCode,
  type LanguageOption,
  type TranslationKey,
} from "../i18n/translations";

const STORAGE_KEY = "bhoomibandhu_language";

interface LanguageContextValue {
  language: LanguageCode;
  currentLanguage: LanguageOption;
  setLanguage: (code: LanguageCode) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      return isValidLanguageCode(saved) ? saved : "en";
    } catch {
      return "en";
    }
  });

  useEffect(() => {
    document.documentElement.lang = language;
    try {
      window.localStorage.setItem(STORAGE_KEY, language);
    } catch {
      // ignore storage quota / private mode errors
    }
  }, [language]);

  const setLanguage = useCallback((code: LanguageCode) => {
    if (isValidLanguageCode(code)) {
      setLanguageState(code);
    }
  }, []);

  const currentLanguage = useMemo(() => getLanguageOption(language), [language]);

  const t = useCallback(
    (key: TranslationKey) => translate(language, key),
    [language]
  );

  return (
    <LanguageContext.Provider
      value={{ language, currentLanguage, setLanguage, t }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }
  return ctx;
}
