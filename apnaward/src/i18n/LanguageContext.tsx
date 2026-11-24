import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import {
  IssueCategory,
  IssueSeverity,
  IssueStatus,
  PriorityBreakdown,
} from '../types/civic';
import { AppLanguage, TRANSLATIONS, TranslationDictionary } from './translations';

const LANGUAGE_STORAGE_KEY = 'apnaward_language_v1';
const LEGACY_LANGUAGE_KEY = 'wardwatch_ai_language_v1';

interface LanguageContextValue {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  t: TranslationDictionary;
  categoryLabel: (category: IssueCategory) => string;
  categoryShortLabel: (category: IssueCategory) => string;
  statusLabel: (status: IssueStatus) => string;
  severityLabel: (severity: IssueSeverity) => string;
  bandLabel: (band: PriorityBreakdown['band']) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function loadSavedLanguage(): AppLanguage {
  try {
    const saved =
      window.localStorage.getItem(LANGUAGE_STORAGE_KEY) ??
      window.localStorage.getItem(LEGACY_LANGUAGE_KEY);
    if (saved === 'hi' || saved === 'en') return saved;
  } catch {
    // ignore storage read failure
  }
  return 'en';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>(() => loadSavedLanguage());

  const setLanguage = useCallback((lang: AppLanguage) => {
    setLanguageState(lang);
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch {
      // ignore storage write failure
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = TRANSLATIONS[language];

  const categoryLabel = useCallback(
    (category: IssueCategory) => t.categories[category] ?? category,
    [t]
  );

  const categoryShortLabel = useCallback(
    (category: IssueCategory) => t.categoriesShort[category] ?? category,
    [t]
  );

  const statusLabel = useCallback(
    (status: IssueStatus) => t.statuses[status] ?? status,
    [t]
  );

  const severityLabel = useCallback(
    (severity: IssueSeverity) => t.severities[severity] ?? severity,
    [t]
  );

  const bandLabel = useCallback(
    (band: PriorityBreakdown['band']) => t.priorityBands[band] ?? band,
    [t]
  );

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        categoryLabel,
        categoryShortLabel,
        statusLabel,
        severityLabel,
        bandLabel,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return ctx;
}
