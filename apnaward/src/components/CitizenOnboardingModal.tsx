import { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Globe, Search, X } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import { ApnaWardLogo } from './ApnaWardLogo';

interface CitizenOnboardingModalProps {
  open: boolean;
  onComplete: (nextAction?: 'report' | 'track') => void;
}

export function CitizenOnboardingModal({ open, onComplete }: CitizenOnboardingModalProps) {
  const { language, setLanguage, t } = useTranslation();

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onComplete();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onComplete]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="citizen-onboarding-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-[#0B1B36]/65 backdrop-blur-sm overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="onboarding-heading"
          onClick={() => onComplete()}
        >
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl glass-floating rounded-2xl overflow-hidden my-auto relative"
          >
            <div className="h-1 w-full animated-gradient-border" aria-hidden="true" />

            <div className="p-5 sm:p-8 space-y-6 relative">
              {/* Top Row: Brand & Dismiss */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <ApnaWardLogo size={42} className="shrink-0" />
                  <div>
                    <p className="text-[11px] font-mono font-semibold text-blue-700">
                      {t.onboarding.kicker}
                    </p>
                    <h2
                      id="onboarding-heading"
                      className="text-xl sm:text-2xl font-display font-bold text-[#0B1B36]"
                    >
                      {t.onboarding.title}
                    </h2>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onComplete()}
                  aria-label={t.common.close}
                  className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center shrink-0"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>

              <AnimatePresence mode="wait">
                <motion.p
                  key={`sub-${language}`}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.16 }}
                  className="text-sm text-slate-600 leading-relaxed max-w-2xl"
                >
                  {t.onboarding.subtitle}
                </motion.p>
              </AnimatePresence>

              {/* Language Selector */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#0B1B36]">
                  <Globe className="w-4 h-4 text-blue-700 shrink-0" aria-hidden="true" />
                  <span>{t.onboarding.chooseLanguage}</span>
                </div>
                <div
                  className="inline-flex items-center gap-1 p-1 rounded-xl bg-white border border-slate-200 self-start sm:self-auto"
                  role="group"
                  aria-label={t.common.languageLabel}
                >
                  {(
                    [
                      { code: 'en', label: 'English' },
                      { code: 'hi', label: 'हिंदी (Hindi)' },
                    ] as const
                  ).map((opt) => {
                    const active = language === opt.code;
                    return (
                      <button
                        key={opt.code}
                        type="button"
                        onClick={() => setLanguage(opt.code)}
                        aria-pressed={active}
                        className={`btn-press relative px-4 py-2 rounded-lg text-xs font-semibold min-h-[40px] transition-colors whitespace-nowrap shrink-0 ${
                          active ? 'text-white' : 'text-slate-600 hover:text-slate-950'
                        }`}
                      >
                        {active ? (
                          <motion.span
                            layoutId="onboarding-lang-pill"
                            transition={{ type: 'spring', stiffness: 430, damping: 32 }}
                            className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#1D4ED8] to-[#0284C7]"
                            aria-hidden="true"
                          />
                        ) : null}
                        <span className="relative z-10">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Three Illustrated Steps: Report -> Track -> Resolve */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Step 1: Report */}
                <motion.div
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.16 }}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3"
                >
                  <div className="w-full h-24 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center">
                    <svg viewBox="0 0 120 72" className="w-28 h-20" aria-hidden="true">
                      <rect
                        x="18"
                        y="10"
                        width="84"
                        height="52"
                        rx="10"
                        fill="#FFFFFF"
                        stroke="#0284C7"
                        strokeOpacity="0.45"
                        strokeWidth="1.5"
                      />
                      <circle cx="40" cy="36" r="11" fill="#E0F2FE" stroke="#0284C7" strokeWidth="1.6" />
                      <path d="M40 30v7m0 0a3 3 0 0 0 3-3v-1a3 3 0 1 0-6 0v1a3 3 0 0 0 3 3zm-5 1a5 5 0 0 0 10 0m-5 5v3" stroke="#1D4ED8" strokeWidth="1.6" strokeLinecap="round" fill="none" />
                      <rect x="58" y="25" width="32" height="5" rx="2.5" fill="#1D4ED8" fillOpacity="0.7" />
                      <rect x="58" y="34" width="24" height="4" rx="2" fill="#94A3B8" fillOpacity="0.55" />
                      <rect x="58" y="42" width="28" height="4" rx="2" fill="#94A3B8" fillOpacity="0.4" />
                    </svg>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-display font-bold text-[#0B1B36]">
                      {t.onboarding.step1Title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {t.onboarding.step1Desc}
                    </p>
                  </div>
                </motion.div>

                {/* Step 2: Track */}
                <motion.div
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.16 }}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3"
                >
                  <div className="w-full h-24 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center">
                    <svg viewBox="0 0 120 72" className="w-28 h-20" aria-hidden="true">
                      <line x1="24" y1="36" x2="96" y2="36" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round" />
                      <line x1="24" y1="36" x2="64" y2="36" stroke="#0284C7" strokeWidth="3" strokeLinecap="round" />
                      <circle cx="24" cy="36" r="7" fill="#FFFBEB" stroke="#D97706" strokeWidth="2.2" />
                      <circle cx="60" cy="36" r="8" fill="#E0F2FE" stroke="#1D4ED8" strokeWidth="2.2" />
                      <circle cx="60" cy="36" r="3" fill="#1D4ED8" />
                      <circle cx="96" cy="36" r="7" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="2" />
                      <rect x="34" y="13" width="52" height="12" rx="4" fill="#0B1B36" />
                      <text x="60" y="21.5" textAnchor="middle" fontSize="6.5" fontFamily="monospace" fill="#67E8F9">
                        AW-2026
                      </text>
                    </svg>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-display font-bold text-blue-800">
                      {t.onboarding.step2Title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {t.onboarding.step2Desc}
                    </p>
                  </div>
                </motion.div>

                {/* Step 3: Resolve */}
                <motion.div
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.16 }}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3"
                >
                  <div className="w-full h-24 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                    <svg viewBox="0 0 120 72" className="w-28 h-20" aria-hidden="true">
                      <circle cx="60" cy="36" r="20" fill="#DCFCE7" stroke="#16A34A" strokeWidth="2" />
                      <path
                        d="M50 36.5l6.5 6.5 13.5-14"
                        fill="none"
                        stroke="#15803D"
                        strokeWidth="2.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-display font-bold text-emerald-800">
                      {t.onboarding.step3Title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {t.onboarding.step3Desc}
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* Footer CTAs */}
              <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-[11px] text-slate-500">{t.onboarding.footerNote}</p>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => onComplete()}
                    className="btn-press px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-950 min-h-[44px] whitespace-nowrap shrink-0"
                  >
                    {t.onboarding.skip}
                  </button>
                  <button
                    type="button"
                    onClick={() => onComplete('track')}
                    className="btn-press inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-sky-50 border border-sky-200 text-[#0B1B36] hover:bg-sky-100 min-h-[44px] whitespace-nowrap shrink-0"
                  >
                    <Search className="w-3.5 h-3.5 text-blue-700" aria-hidden="true" />
                    <span>{t.onboarding.trackFirst}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onComplete('report')}
                    className="btn-press inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#1D4ED8] to-[#0284C7] text-white hover:brightness-110 shadow-[0_10px_22px_-8px_rgba(29,78,216,0.5)] min-h-[44px] whitespace-nowrap shrink-0"
                  >
                    <span>{t.onboarding.getStarted}</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
