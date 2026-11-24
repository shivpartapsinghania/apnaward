import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, ShieldAlert } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import { CivicIssue } from '../types/civic';
import { getIssuePriority } from '../utils/priority';
import { AnimatedNumber } from './MotionPrimitives';
import { SeverityIndicator, StatusIndicator } from './StatusIndicators';

interface SmartPriorityPageProps {
  issues: CivicIssue[];
  onSelectIssue: (issue: CivicIssue) => void;
}

export function SmartPriorityPage({ issues, onSelectIssue }: SmartPriorityPageProps) {
  const { t, categoryShortLabel, bandLabel } = useTranslation();
  const [includeResolved, setIncludeResolved] = useState(false);

  const ranked = useMemo(() => {
    return issues
      .filter((i) => (includeResolved ? true : i.status !== 'Resolved'))
      .map((issue) => ({ issue, priority: getIssuePriority(issue) }))
      .sort((a, b) => b.priority.totalScore - a.priority.totalScore);
  }, [issues, includeResolved]);

  return (
    <div className="space-y-6">
      {/* Transparent Formula Overview */}
      <section className="glass-surface rounded-2xl p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
                <ShieldAlert className="w-4 h-4" aria-hidden="true" />
              </span>
              <h2 className="text-lg font-display font-semibold text-slate-50">
                {t.priorityPage.title}
              </h2>
            </div>
            <p className="text-xs text-slate-400">{t.priorityPage.subtitle}</p>
          </div>
          <span className="text-xs text-amber-300">{t.priorityPage.disclaimer}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          <div className="p-4 rounded-xl bg-[#070E1D] border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-100">{t.priorityPage.rule1Title}</span>
              <span className="font-mono text-red-300 font-semibold">Max 45 pts</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">{t.priorityPage.rule1Desc}</p>
          </div>

          <div className="p-4 rounded-xl bg-[#070E1D] border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-100">{t.priorityPage.rule2Title}</span>
              <span className="font-mono text-cyan-300 font-semibold">Max 35 pts</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">{t.priorityPage.rule2Desc}</p>
          </div>

          <div className="p-4 rounded-xl bg-[#070E1D] border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-100">{t.priorityPage.rule3Title}</span>
              <span className="font-mono text-amber-300 font-semibold">Max 20 pts</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">{t.priorityPage.rule3Desc}</p>
          </div>
        </div>
      </section>

      {/* Queue Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-slate-300">
          {t.priorityPage.rankedQueue} (
          <span className="font-mono tabular-nums text-cyan-300">{ranked.length}</span>{' '}
          {t.priorityPage.complaintsShown})
        </p>
        <label className="inline-flex items-center gap-2 text-xs text-slate-300 cursor-pointer min-h-[38px]">
          <input
            type="checkbox"
            checked={includeResolved}
            onChange={(e) => setIncludeResolved(e.target.checked)}
            className="rounded border-slate-700 bg-[#070E1D] text-cyan-400 focus:ring-cyan-400"
          />
          <span>{t.priorityPage.includeResolved}</span>
        </label>
      </div>

      {/* Itemized Score Cards */}
      <div className="space-y-3">
        {ranked.map(({ issue, priority }, index) => (
          <article
            key={issue.id}
            className="glass-surface glass-card-hover rounded-2xl p-5 space-y-4"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                  <span className="font-mono font-semibold text-slate-300">#{index + 1}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono font-semibold text-cyan-300">{issue.id}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-slate-200 font-medium">
                    {categoryShortLabel(issue.category)}
                  </span>
                  <SeverityIndicator severity={issue.severity} tone="navy" />
                  <StatusIndicator status={issue.status} tone="navy" />
                </div>
                <h3 className="text-sm font-semibold text-slate-100">
                  {issue.title} — {issue.wardName.replace(' (Demo)', '')}
                </h3>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <p className="text-lg font-mono font-bold tabular-nums text-cyan-300">
                    <AnimatedNumber value={priority.totalScore} /> / 100
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {bandLabel(priority.band)} {t.priorityPage.bandSuffix}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onSelectIssue(issue)}
                  className="btn-press inline-flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-medium bg-[#0D172B] border border-sky-400/20 text-slate-200 hover:border-cyan-400/50 hover:text-cyan-200 transition-colors min-h-[42px] whitespace-nowrap shrink-0"
                >
                  <span>{t.common.inspect}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Stacked Score Breakdown Bar */}
            <div className="space-y-2.5">
              <div className="h-2.5 w-full rounded-full bg-slate-800/90 overflow-hidden flex gap-0.5 p-0.5">
                {priority.severityPoints > 0 ? (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${priority.severityPoints}%` }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full rounded-full bg-red-400"
                    title={`${t.drawer.severityFactor}: ${priority.severityPoints} pts`}
                  />
                ) : null}
                {priority.impactPoints > 0 ? (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${priority.impactPoints}%` }}
                    transition={{ duration: 0.45, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full rounded-full bg-cyan-400"
                    title={`${t.drawer.impactFactor}: ${priority.impactPoints} pts`}
                  />
                ) : null}
                {priority.waitingPoints > 0 ? (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${priority.waitingPoints}%` }}
                    transition={{ duration: 0.45, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full rounded-full bg-amber-400"
                    title={`${t.drawer.waitingFactor}: ${priority.waitingPoints} pts`}
                  />
                ) : null}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300">
                <div>
                  <span className="text-red-300 font-mono tabular-nums font-medium">
                    {t.drawer.severityFactor} ({priority.severityPoints}/45):
                  </span>{' '}
                  {priority.severityReason}
                </div>
                <div>
                  <span className="text-cyan-300 font-mono tabular-nums font-medium">
                    {t.drawer.impactFactor} ({priority.impactPoints}/35):
                  </span>{' '}
                  {priority.impactFactors.join('; ')}
                </div>
                <div>
                  <span className="text-amber-300 font-mono tabular-nums font-medium">
                    {t.drawer.waitingFactor} ({priority.waitingPoints}/20):
                  </span>{' '}
                  {priority.waitingReason}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
