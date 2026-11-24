import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Compass,
  Maximize2,
  Minimize2,
  Play,
  X,
} from 'lucide-react';
import { HOME_TRANSLATIONS } from '../i18n/homeTranslations';
import { useTranslation } from '../i18n/LanguageContext';

interface GuidedProductTourProps {
  open: boolean;
  stepIndex: number;
  onStepChange: (nextStep: number) => void;
  onClose: () => void;
  onFinish: () => void;
}

export function GuidedProductTour({
  open,
  stepIndex,
  onStepChange,
  onClose,
  onFinish,
}: GuidedProductTourProps) {
  const { language } = useTranslation();
  const tour = HOME_TRANSLATIONS[language].tour;
  const [minimized, setMinimized] = useState(false);

  const totalSteps = tour.steps.length;
  const clampedStep = Math.max(0, Math.min(totalSteps - 1, stepIndex));
  const current = tour.steps[clampedStep];
  const progressPct = Math.round(((clampedStep + 1) / totalSteps) * 100);
  const isLast = clampedStep === totalSteps - 1;

  useEffect(() => {
    if (!open) {
      setMinimized(false);
      return;
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.aside
          key="guided-product-tour"
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.96 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          role="dialog"
          aria-label={tour.badge}
          className="fixed bottom-20 lg:bottom-6 right-3 sm:right-6 left-3 sm:left-auto sm:w-[440px] max-w-[calc(100vw-24px)] z-[65] glass-floating rounded-2xl overflow-hidden shadow-[0_24px_60px_rgba(11,27,54,0.28)]"
        >
          <div className="h-1 w-full animated-gradient-border" aria-hidden="true" />

          {/* Header Bar */}
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-2 bg-[#0B1B36] text-white">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-7 h-7 rounded-lg bg-sky-500/20 border border-cyan-400/40 text-cyan-300 flex items-center justify-center shrink-0">
                <Play className="w-3.5 h-3.5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-mono font-semibold text-cyan-300 truncate">
                  {tour.badge}
                </p>
                <p className="text-xs font-display font-semibold text-white truncate">
                  {current.sectionTag}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setMinimized((m) => !m)}
                aria-label={minimized ? tour.expandBtn : tour.minimizeBtn}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 min-h-[34px] min-w-[34px] flex items-center justify-center"
              >
                {minimized ? (
                  <Maximize2 className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <Minimize2 className="w-4 h-4" aria-hidden="true" />
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                aria-label={tour.skipBtn}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 min-h-[34px] min-w-[34px] flex items-center justify-center"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-1 w-full bg-slate-200">
            <motion.div
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="h-full bg-gradient-to-r from-[#1D4ED8] via-[#0284C7] to-[#16A34A]"
            />
          </div>

          {!minimized ? (
            <div className="p-4 sm:p-5 space-y-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${clampedStep}-${language}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.16 }}
                  className="space-y-2.5"
                >
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                    <span>
                      {tour.stepLabel} {clampedStep + 1} {tour.of} {totalSteps}
                    </span>
                    <span className="font-semibold text-blue-700">{current.stepTitle}</span>
                  </div>

                  <h3 className="text-base font-display font-bold text-[#0B1B36]">
                    {current.headline}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {current.explanation}
                  </p>

                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2 text-[11px] text-amber-900">
                    <Compass className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{current.highlightNote}</span>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Clickable Step Dots */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-1.5" role="group" aria-label="Tour steps">
                  {tour.steps.map((s, idx) => {
                    const active = idx === clampedStep;
                    return (
                      <button
                        key={s.sectionTag}
                        type="button"
                        onClick={() => onStepChange(idx)}
                        aria-label={`${tour.stepLabel} ${idx + 1}: ${s.stepTitle}`}
                        aria-current={active ? 'step' : undefined}
                        className={`h-2.5 rounded-full transition-all ${
                          active
                            ? 'w-7 bg-blue-700'
                            : idx < clampedStep
                              ? 'w-2.5 bg-emerald-500 hover:bg-emerald-600'
                              : 'w-2.5 bg-slate-300 hover:bg-slate-400'
                        }`}
                      />
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="text-xs font-medium text-slate-500 hover:text-slate-900 px-2 py-1 rounded-lg whitespace-nowrap"
                >
                  {tour.skipBtn}
                </button>
              </div>

              {/* Navigation Controls */}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onStepChange(Math.max(0, clampedStep - 1))}
                  disabled={clampedStep === 0}
                  className="btn-press inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-100 border border-slate-300 text-slate-700 hover:border-slate-400 disabled:opacity-40 min-h-[42px] whitespace-nowrap shrink-0"
                >
                  <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{tour.prevBtn}</span>
                </button>

                {isLast ? (
                  <button
                    type="button"
                    onClick={onFinish}
                    className="btn-press inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 min-h-[42px] whitespace-nowrap shrink-0"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{tour.finishBtn}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onStepChange(Math.min(totalSteps - 1, clampedStep + 1))}
                    className="btn-press inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#1D4ED8] to-[#0284C7] text-white hover:brightness-110 min-h-[42px] whitespace-nowrap shrink-0"
                  >
                    <span>{tour.nextBtn}</span>
                    <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="px-4 py-2.5 flex items-center justify-between gap-2 text-xs">
              <span className="font-mono text-slate-600">
                {tour.stepLabel} {clampedStep + 1} / {totalSteps}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onStepChange(Math.max(0, clampedStep - 1))}
                  disabled={clampedStep === 0}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 disabled:opacity-40"
                >
                  {tour.prevBtn}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    isLast
                      ? onFinish()
                      : onStepChange(Math.min(totalSteps - 1, clampedStep + 1))
                  }
                  className="px-2.5 py-1 rounded-lg bg-blue-700 text-white font-semibold"
                >
                  {isLast ? tour.finishBtn : tour.nextBtn}
                </button>
              </div>
            </div>
          )}
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}
