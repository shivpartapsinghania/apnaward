import { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  AlertCircle,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Compass,
  Cpu,
  ExternalLink,
  FilePlus2,
  Layers,
  MapPin,
  Presentation,
  Radar,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import { HOME_TRANSLATIONS, JudgeChapterItem } from '../i18n/homeTranslations';
import { useTranslation } from '../i18n/LanguageContext';
import { ApnaWardLogo } from './ApnaWardLogo';

interface JudgePresentationModalProps {
  open: boolean;
  chapterIndex: number;
  onChapterChange: (nextIndex: number) => void;
  onClose: () => void;
  onTriggerAction: (
    actionType: JudgeChapterItem['actionType'] | NonNullable<JudgeChapterItem['secondaryActionType']>
  ) => void;
}

const CHAPTER_ICONS = [
  AlertCircle,
  Layers,
  FilePlus2,
  Cpu,
  MapPin,
  ShieldCheck,
  Sparkles,
];

function getActionIcon(
  actionType: JudgeChapterItem['actionType'] | NonNullable<JudgeChapterItem['secondaryActionType']>
) {
  switch (actionType) {
    case 'why':
      return BookOpen;
    case 'how':
      return Layers;
    case 'report':
      return FilePlus2;
    case 'track':
      return Compass;
    case 'inspector':
      return Cpu;
    case 'map':
      return MapPin;
    case 'command':
      return Radar;
    case 'drawer':
      return ShieldCheck;
    case 'priority':
    default:
      return ExternalLink;
  }
}

export function JudgePresentationModal({
  open,
  chapterIndex,
  onChapterChange,
  onClose,
  onTriggerAction,
}: JudgePresentationModalProps) {
  const { language } = useTranslation();
  const deck = HOME_TRANSLATIONS[language].judgeDemo;

  const totalChapters = deck.chapters.length;
  const clampedIdx = Math.max(0, Math.min(totalChapters - 1, chapterIndex));
  const current = deck.chapters[clampedIdx];
  const progressPct = Math.round(((clampedIdx + 1) / totalChapters) * 100);
  const isFirst = clampedIdx === 0;
  const isLast = clampedIdx === totalChapters - 1;

  const ChapterIcon = CHAPTER_ICONS[clampedIdx] ?? Presentation;
  const PrimaryActionIcon = getActionIcon(current.actionType);
  const SecondaryActionIcon = current.secondaryActionType
    ? getActionIcon(current.secondaryActionType)
    : null;
  const isAiChapter = current.id === 'ai';

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'SELECT';

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (isInput) return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (clampedIdx < totalChapters - 1) {
          onChapterChange(clampedIdx + 1);
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (clampedIdx > 0) {
          onChapterChange(clampedIdx - 1);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, clampedIdx, totalChapters, onChapterChange, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="judge-demo-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[75] bg-[#0B1B36]/65 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
          onClick={onClose}
        >
          <motion.section
            key="judge-demo-dialog"
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="judge-demo-heading"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl glass-floating rounded-2xl overflow-hidden shadow-[0_32px_90px_rgba(11,27,54,0.34)] my-auto"
          >
            <div className="h-1 w-full animated-gradient-border" aria-hidden="true" />

            {/* Modal Header */}
            <div className="px-4 sm:px-6 py-4 border-b border-slate-200 bg-[#0B1B36] text-white flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <ApnaWardLogo size={38} className="shrink-0" />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-mono font-semibold text-cyan-300">
                      {deck.badge}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-white/10 border border-sky-400/25 text-[11px] font-mono text-slate-200 tabular-nums">
                      {deck.chapterWord} {clampedIdx + 1} {deck.of} {totalChapters}
                    </span>
                  </div>
                  <h2
                    id="judge-demo-heading"
                    className="text-sm sm:text-base font-display font-semibold text-white truncate mt-0.5"
                  >
                    {deck.title}
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label={deck.exitBtn}
                className="btn-press inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white/10 border border-white/15 text-slate-200 hover:text-white hover:bg-white/15 min-h-[38px] shrink-0"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">{deck.exitBtn}</span>
              </button>
            </div>

            {/* Progress Bar */}
            <div className="h-1 w-full bg-slate-200">
              <motion.div
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="h-full bg-gradient-to-r from-[#1D4ED8] via-[#0284C7] to-[#16A34A]"
              />
            </div>

            {/* Chapter Jump Rail */}
            <div className="px-4 sm:px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto">
              {deck.chapters.map((chapter, idx) => {
                const active = idx === clampedIdx;
                const visited = idx < clampedIdx;
                return (
                  <button
                    key={chapter.id}
                    type="button"
                    onClick={() => onChapterChange(idx)}
                    aria-current={active ? 'step' : undefined}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-mono font-semibold transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 min-h-[32px] ${
                      active
                        ? 'bg-blue-700 text-white border border-blue-700'
                        : visited
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:border-emerald-300'
                          : 'bg-white text-slate-600 border border-slate-200 hover:text-slate-950 hover:border-slate-300'
                    }`}
                  >
                    <span className="tabular-nums">0{idx + 1}</span>
                    <span className="hidden sm:inline font-sans capitalize">
                      {chapter.id}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Active Chapter Content */}
            <div className="p-4 sm:p-6 max-h-[68vh] overflow-y-auto space-y-5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${current.id}-${language}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.16 }}
                  className="space-y-4"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${
                        isAiChapter
                          ? 'bg-purple-50 border-purple-200 text-purple-700'
                          : 'bg-sky-50 border-sky-200 text-blue-700'
                      }`}
                    >
                      <ChapterIcon className="w-5 h-5" aria-hidden="true" />
                    </span>
                    <div className="space-y-1 min-w-0">
                      <p
                        className={`text-[11px] font-mono font-semibold tracking-wide ${
                          isAiChapter ? 'text-purple-700' : 'text-blue-700'
                        }`}
                      >
                        {current.chapterTag}
                      </p>
                      <h3 className="text-lg sm:text-xl font-display font-bold text-[#0B1B36] leading-snug">
                        {current.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        {current.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Key Points */}
                  <ul className="grid grid-cols-1 gap-2.5">
                    {current.bullets.map((bullet, bIdx) => (
                      <li
                        key={`${current.id}-b-${bIdx}`}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed"
                      >
                        <CheckCircle2
                          className={`w-4 h-4 shrink-0 mt-0.5 ${
                            isAiChapter ? 'text-purple-700' : 'text-blue-700'
                          }`}
                          aria-hidden="true"
                        />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Callout Card */}
                  <div
                    className={`p-3.5 sm:p-4 rounded-xl border space-y-1 ${
                      isAiChapter
                        ? 'bg-purple-50 border-purple-200'
                        : 'bg-sky-50 border-sky-200'
                    }`}
                  >
                    <p
                      className={`text-xs font-display font-bold ${
                        isAiChapter ? 'text-purple-900' : 'text-[#0B1B36]'
                      }`}
                    >
                      {current.calloutTitle}
                    </p>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                      {current.calloutBody}
                    </p>
                  </div>

                  {/* Expected Value vs Measured Distinction on Chapter 7 */}
                  {current.id === 'value' ? (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900 leading-relaxed">
                      <AlertCircle
                        className="w-4 h-4 text-amber-600 shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      <span>{deck.expectedValueNotice}</span>
                    </div>
                  ) : null}

                  {/* Interactive Live Screen Jump Actions */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                    <p className="text-[11px] text-slate-600">{deck.liveActionHint}</p>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => onTriggerAction(current.actionType)}
                        className="btn-press inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#1D4ED8] to-[#0284C7] text-white hover:brightness-110 min-h-[40px]"
                      >
                        <PrimaryActionIcon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                        <span>{current.actionLabel}</span>
                        <ArrowUpRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      </button>

                      {current.secondaryActionType &&
                      current.secondaryActionLabel &&
                      SecondaryActionIcon ? (
                        <button
                          type="button"
                          onClick={() => onTriggerAction(current.secondaryActionType!)}
                          className="btn-press inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-300 text-[#0B1B36] hover:border-blue-400 min-h-[40px]"
                        >
                          <SecondaryActionIcon
                            className="w-3.5 h-3.5 shrink-0 text-blue-700"
                            aria-hidden="true"
                          />
                          <span>{current.secondaryActionLabel}</span>
                        </button>
                      ) : null}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Modal Footer Controls */}
            <div className="px-4 sm:px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={() => onChapterChange(Math.max(0, clampedIdx - 1))}
                disabled={isFirst}
                className="btn-press inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium bg-white border border-slate-300 text-slate-700 hover:border-slate-400 disabled:opacity-40 min-h-[42px]"
              >
                <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{deck.prevBtn}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-press px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-950 bg-white border border-slate-300 min-h-[42px]"
                >
                  {deck.exitBtn}
                </button>

                {isLast ? (
                  <button
                    type="button"
                    onClick={() => onTriggerAction('command')}
                    className="btn-press inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 min-h-[42px]"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{current.actionLabel}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      onChapterChange(Math.min(totalChapters - 1, clampedIdx + 1))
                    }
                    className="btn-press inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#1D4ED8] to-[#0284C7] text-white hover:brightness-110 min-h-[42px]"
                  >
                    <span>{deck.nextBtn}</span>
                    <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
