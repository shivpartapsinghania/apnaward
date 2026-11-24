import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  FilePlus2,
  FolderKanban,
  MapPin,
  RotateCcw,
  ShieldAlert,
  TrendingUp,
} from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import {
  CivicIssue,
  ILLUSTRATIVE_WARDS,
  IssueCategory,
  NavSection,
} from '../types/civic';
import { formatDateTime, formatRelativeTime } from '../utils/api';
import { getIssuePriority } from '../utils/priority';
import { AnimatedNumber } from './MotionPrimitives';
import { SeverityIndicator, StatusIndicator } from './StatusIndicators';

interface OverviewPageProps {
  issues: CivicIssue[];
  onNavigate: (section: NavSection) => void;
  onSelectIssue: (issue: CivicIssue) => void;
  onFilterByCategory: (category: IssueCategory) => void;
  onResetDemoData: () => void;
}

const CATEGORY_ORDER: IssueCategory[] = [
  'road_damage',
  'water_leakage',
  'drainage',
  'streetlight',
  'garbage',
  'public_safety',
];

const CATEGORY_STYLES: Record<IssueCategory, { bar: string; stroke: string; dot: string }> = {
  road_damage: { bar: 'from-cyan-400 to-sky-500', stroke: '#22D3EE', dot: 'bg-cyan-400' },
  water_leakage: { bar: 'from-blue-400 to-indigo-500', stroke: '#60A5FA', dot: 'bg-blue-400' },
  drainage: { bar: 'from-teal-400 to-emerald-500', stroke: '#2DD4BF', dot: 'bg-teal-400' },
  streetlight: { bar: 'from-amber-400 to-orange-400', stroke: '#FBBF24', dot: 'bg-amber-400' },
  garbage: { bar: 'from-emerald-400 to-green-500', stroke: '#34D399', dot: 'bg-emerald-400' },
  waterlogging: { bar: 'from-sky-400 to-cyan-500', stroke: '#38BDF8', dot: 'bg-sky-400' },
  public_safety: { bar: 'from-rose-400 to-red-500', stroke: '#FB7185', dot: 'bg-rose-400' },
  other: { bar: 'from-slate-400 to-slate-500', stroke: '#94A3B8', dot: 'bg-slate-400' },
};

export function OverviewPage({
  issues,
  onNavigate,
  onSelectIssue,
  onFilterByCategory,
  onResetDemoData,
}: OverviewPageProps) {
  const { t, categoryLabel, categoryShortLabel, statusLabel, bandLabel } = useTranslation();
  const [confirmReset, setConfirmReset] = useState(false);
  const [hoveredCat, setHoveredCat] = useState<IssueCategory | null>(null);

  const metrics = useMemo(() => {
    const total = issues.length;
    const resolved = issues.filter((i) => i.status === 'Resolved').length;
    const inProgress = issues.filter((i) => i.status === 'In Progress').length;
    const pending = total - resolved;
    const highPriority = issues.filter(
      (i) =>
        i.status !== 'Resolved' &&
        (i.severity === 'Critical' ||
          i.severity === 'High' ||
          getIssuePriority(i).totalScore >= 75)
    ).length;
    const resolutionPct = total > 0 ? Math.round((resolved / total) * 100) : 0;

    return { total, resolved, inProgress, pending, highPriority, resolutionPct };
  }, [issues]);

  const categoryStats = useMemo(() => {
    const total = Math.max(1, issues.length);
    let cumulativePct = 0;
    return CATEGORY_ORDER.map((cat) => {
      const count = issues.filter((i) => i.category === cat).length;
      const pct = Math.round((count / total) * 100);
      const exactShare = (count / total) * 100;
      const startPct = cumulativePct;
      cumulativePct += exactShare;
      return {
        category: cat,
        label: categoryLabel(cat),
        shortLabel: categoryShortLabel(cat),
        count,
        pct,
        exactShare,
        startPct,
      };
    }).sort((a, b) => b.count - a.count);
  }, [issues, categoryLabel, categoryShortLabel]);

  const wardStats = useMemo(() => {
    const rows = ILLUSTRATIVE_WARDS.map((ward) => {
      const wardIssues = issues.filter((i) => i.wardId === ward.id);
      const resolved = wardIssues.filter((i) => i.status === 'Resolved').length;
      const open = wardIssues.length - resolved;
      const pct = wardIssues.length > 0 ? Math.round((resolved / wardIssues.length) * 100) : 0;
      return {
        id: ward.id,
        name: ward.shortName,
        total: wardIssues.length,
        open,
        resolved,
        pct,
      };
    });
    const maxTotal = Math.max(1, ...rows.map((r) => r.total));
    return { rows, maxTotal };
  }, [issues]);

  const priorityQueue = useMemo(() => {
    return issues
      .filter((i) => i.status !== 'Resolved')
      .map((issue) => ({ issue, priority: getIssuePriority(issue) }))
      .sort((a, b) => b.priority.totalScore - a.priority.totalScore);
  }, [issues]);

  const spotlightIssue = priorityQueue[0] ?? null;

  const recentReports = useMemo(() => {
    return [...issues]
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
      .slice(0, 4);
  }, [issues]);

  const activityTimeline = useMemo(() => {
    const events: Array<{
      id: string;
      issue: CivicIssue;
      status: CivicIssue['status'];
      timestamp: string;
      actor: string;
      note: string;
    }> = [];
    for (const issue of issues) {
      for (const entry of issue.timeline) {
        events.push({
          id: `${issue.id}-${entry.id}`,
          issue,
          status: entry.status,
          timestamp: entry.timestamp,
          actor: entry.actor,
          note: entry.note,
        });
      }
    }
    return events
      .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp))
      .slice(0, 6);
  }, [issues]);

  const hoveredRow = hoveredCat
    ? categoryStats.find((c) => c.category === hoveredCat) ?? null
    : null;

  return (
    <div className="space-y-6">
      {/* Executive Welcome Header */}
      <section className="glass-surface rounded-2xl overflow-hidden relative">
        <div className="h-[2px] w-full animated-gradient-border" aria-hidden="true" />
        <div
          className="pointer-events-none absolute -right-14 -top-12 w-72 h-72 rounded-full bg-cyan-500/10 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute left-1/3 -bottom-16 w-64 h-64 rounded-full bg-blue-500/12 blur-3xl"
          aria-hidden="true"
        />

        <div className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-mono font-semibold text-amber-300">{t.common.demoData}</span>
              <span aria-hidden="true" className="text-slate-500">·</span>
              <span className="text-cyan-300 font-medium">{t.overview.badge}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-50">
              {t.overview.heroTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {t.overview.heroSubtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {confirmReset ? (
              <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-xl bg-slate-900/90 border border-amber-500/40">
                <span className="text-xs text-amber-200 px-2">
                  {t.common.confirmResetPrompt}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onResetDemoData();
                    setConfirmReset(false);
                  }}
                  className="btn-press px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-400 text-slate-950 hover:bg-amber-300 min-h-[38px] whitespace-nowrap shrink-0"
                >
                  {t.common.confirmResetBtn}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="btn-press px-2.5 py-1.5 text-xs font-medium rounded-lg text-slate-300 hover:text-white min-h-[38px] whitespace-nowrap shrink-0"
                >
                  {t.common.cancel}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="btn-press inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-200 bg-[#0D172B]/90 border border-sky-400/18 rounded-xl hover:text-cyan-200 hover:border-cyan-400/45 min-h-[42px] whitespace-nowrap shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{t.common.resetDemoData}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => onNavigate('report')}
              className="btn-press inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 rounded-xl hover:brightness-110 shadow-[0_8px_24px_-8px_rgba(34,211,238,0.55)] min-h-[42px] whitespace-nowrap shrink-0"
            >
              <FilePlus2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{t.overview.submitComplaint}</span>
            </button>
          </div>
        </div>
      </section>

      {/* 5 Animated KPI Cards */}
      <section aria-label={t.overview.badge} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <div className="glass-surface glass-card-hover rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-slate-400">{t.overview.totalReports}</span>
            <span className="w-8 h-8 rounded-xl bg-sky-500/15 border border-sky-400/25 flex items-center justify-center text-sky-300">
              <FolderKanban className="w-4 h-4" aria-hidden="true" />
            </span>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-display font-bold text-slate-50">
              <AnimatedNumber value={metrics.total} />
            </p>
            <p className="mt-1 text-xs text-slate-400">{t.overview.acrossWards}</p>
          </div>
        </div>

        <div className="glass-surface glass-card-hover rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-slate-400">{t.overview.pendingQueue}</span>
            <span className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-400/25 flex items-center justify-center text-cyan-300">
              <Activity className="w-4 h-4" aria-hidden="true" />
            </span>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-display font-bold text-cyan-300">
              <AnimatedNumber value={metrics.pending} />
            </p>
            <p className="mt-1 text-xs text-slate-400">
              <AnimatedNumber value={metrics.inProgress} className="text-slate-200" />{' '}
              {t.overview.inActiveWork}
            </p>
          </div>
        </div>

        <div className="glass-surface glass-card-hover rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-slate-400">
              {t.overview.highCriticalOpen}
            </span>
            <span className="w-8 h-8 rounded-xl bg-rose-500/15 border border-rose-400/30 flex items-center justify-center text-rose-300">
              <AlertTriangle className="w-4 h-4" aria-hidden="true" />
            </span>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-display font-bold text-rose-400">
              <AnimatedNumber value={metrics.highPriority} />
            </p>
            <p className="mt-1 text-xs text-slate-400">{t.overview.highScoreHint}</p>
          </div>
        </div>

        <div className="glass-surface glass-card-hover rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-slate-400">
              {t.overview.resolvedReports}
            </span>
            <span className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-400/25 flex items-center justify-center text-emerald-300">
              <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
            </span>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-display font-bold text-emerald-400">
              <AnimatedNumber value={metrics.resolved} />
            </p>
            <p className="mt-1 text-xs text-slate-400">{t.overview.closedWithNotes}</p>
          </div>
        </div>

        <div className="glass-surface glass-card-hover rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-slate-400">
              {t.overview.resolutionRate}
            </span>
            <span className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
              <TrendingUp className="w-4 h-4" aria-hidden="true" />
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline justify-between">
              <p className="text-3xl font-display font-bold text-slate-50">
                <AnimatedNumber value={metrics.resolutionPct} suffix="%" />
              </p>
              <span className="text-xs font-mono tabular-nums text-cyan-300">
                {metrics.resolved}/{metrics.total}
              </span>
            </div>
            <div className="mt-2.5 h-2 w-full rounded-full bg-slate-800/90 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${metrics.resolutionPct}%` }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                className="h-full rounded-full bg-gradient-to-r from-sky-400 via-cyan-400 to-emerald-400"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Priority Issue Spotlight Banner */}
      {spotlightIssue ? (
        <section className="glass-surface rounded-2xl p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-rose-400/25 relative overflow-hidden">
          <div
            className="pointer-events-none absolute -left-12 -top-12 w-48 h-48 rounded-full bg-rose-500/10 blur-3xl"
            aria-hidden="true"
          />
          <div className="space-y-1.5 min-w-0 relative">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold text-rose-300">{t.overview.prioritySpotlight}</span>
              <span aria-hidden="true" className="text-slate-500">·</span>
              <span className="font-mono font-semibold text-cyan-300">{spotlightIssue.issue.id}</span>
              <SeverityIndicator severity={spotlightIssue.issue.severity} tone="navy" />
              <StatusIndicator status={spotlightIssue.issue.status} tone="navy" />
            </div>
            <h3 className="text-base sm:text-lg font-display font-semibold text-slate-50 truncate">
              {spotlightIssue.issue.title}
            </h3>
            <p className="text-xs text-slate-300">
              {spotlightIssue.issue.wardName} · {spotlightIssue.priority.summary}
            </p>
          </div>
          <div className="flex items-center gap-4 shrink-0 relative">
            <div className="text-right">
              <p className="text-2xl font-display font-bold text-cyan-300">
                <AnimatedNumber value={spotlightIssue.priority.totalScore} />
                <span className="text-xs font-normal text-slate-400"> / 100</span>
              </p>
              <p className="text-[11px] text-slate-400">
                {bandLabel(spotlightIssue.priority.band)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onSelectIssue(spotlightIssue.issue)}
              className="btn-press inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#0D172B] border border-cyan-400/35 text-cyan-200 hover:border-cyan-400/70 min-h-[44px] whitespace-nowrap shrink-0"
            >
              <span>{t.overview.inspectAndUpdate}</span>
              <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </section>
      ) : null}

      {/* Interactive Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-6 glass-surface rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <h2 className="text-base font-display font-semibold text-slate-50">
                {t.overview.categoryBreakdown}
              </h2>
              <span className="text-xs text-cyan-300">{t.overview.clickToFilter}</span>
            </div>
            <p className="text-xs text-slate-400 mb-6">{t.overview.categoryBreakdownSub}</p>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
              <div className="sm:col-span-4 flex flex-col items-center justify-center">
                <div className="relative w-36 h-36">
                  <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90" aria-hidden="true">
                    <circle
                      cx="60"
                      cy="60"
                      r="46"
                      fill="none"
                      stroke="rgba(30, 41, 59, 0.8)"
                      strokeWidth="12"
                    />
                    {categoryStats.map((seg) => {
                      const circumference = 2 * Math.PI * 46;
                      const dashLength = (seg.exactShare / 100) * circumference;
                      const dashOffset = -(seg.startPct / 100) * circumference;
                      if (seg.count === 0) return null;
                      const dimmed = hoveredCat && hoveredCat !== seg.category;
                      return (
                        <motion.circle
                          key={seg.category}
                          cx="60"
                          cy="60"
                          r="46"
                          fill="none"
                          stroke={CATEGORY_STYLES[seg.category].stroke}
                          strokeWidth={hoveredCat === seg.category ? 14 : 12}
                          strokeDasharray={`${dashLength} ${circumference}`}
                          initial={{ strokeDashoffset: circumference }}
                          animate={{
                            strokeDashoffset: dashOffset,
                            opacity: dimmed ? 0.32 : 1,
                          }}
                          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                          strokeLinecap="butt"
                          className="cursor-pointer"
                          onMouseEnter={() => setHoveredCat(seg.category)}
                          onMouseLeave={() => setHoveredCat(null)}
                          onClick={() => onFilterByCategory(seg.category)}
                        />
                      );
                    })}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-2">
                    <span className="text-2xl font-display font-bold font-mono tabular-nums text-slate-50">
                      {hoveredRow ? hoveredRow.count : metrics.total}
                    </span>
                    <span className="text-[11px] text-slate-400 truncate max-w-[88px]">
                      {hoveredRow ? hoveredRow.shortLabel : t.overview.complaintsWord}
                    </span>
                  </div>
                </div>
              </div>

              <div className="sm:col-span-8 space-y-2.5">
                {categoryStats.map((row) => (
                  <button
                    key={row.category}
                    type="button"
                    onMouseEnter={() => setHoveredCat(row.category)}
                    onMouseLeave={() => setHoveredCat(null)}
                    onClick={() => onFilterByCategory(row.category)}
                    className="w-full text-left group rounded-lg p-1.5 -m-1.5 hover:bg-slate-800/45 transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="inline-flex items-center gap-2 font-medium text-slate-200 group-hover:text-cyan-200 transition-colors">
                        <span
                          className={`w-2 h-2 rounded-full ${CATEGORY_STYLES[row.category].dot}`}
                          aria-hidden="true"
                        />
                        {row.label}
                      </span>
                      <span className="font-mono tabular-nums text-slate-300">
                        {row.count} <span className="text-slate-500">({row.pct}%)</span>
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-800/90 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${row.pct}%` }}
                        transition={{ duration: 0.48, ease: [0.16, 1, 0.3, 1] }}
                        className={`h-full rounded-full bg-gradient-to-r ${CATEGORY_STYLES[row.category].bar}`}
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Ward Performance Section */}
        <section className="lg:col-span-6 glass-surface rounded-2xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
            <h2 className="text-base font-display font-semibold text-slate-50">
              {t.overview.wardPerformance}
            </h2>
            <div className="flex items-center gap-4 text-xs text-slate-300">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400 inline-block" aria-hidden="true" />
                {t.common.open}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400 inline-block" aria-hidden="true" />
                {t.common.resolved}
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-400 mb-6">{t.overview.wardPerformanceSub}</p>

          <div className="space-y-4">
            {wardStats.rows.map((ward) => {
              const openWidth = (ward.open / wardStats.maxTotal) * 100;
              const resolvedWidth = (ward.resolved / wardStats.maxTotal) * 100;
              return (
                <div key={ward.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-200">{ward.name}</span>
                    <span className="font-mono tabular-nums text-slate-300">
                      {ward.open} {t.common.open} · {ward.resolved} {t.common.resolved}{' '}
                      <span className="text-slate-500">({ward.pct}%)</span>
                    </span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-slate-800/90 overflow-hidden flex gap-0.5 p-0.5">
                    {ward.open > 0 ? (
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${openWidth}%` }}
                        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                        className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-sky-500"
                        title={`${ward.open} ${t.common.open}`}
                      />
                    ) : null}
                    {ward.resolved > 0 ? (
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${resolvedWidth}%` }}
                        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                        className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
                        title={`${ward.resolved} ${t.common.resolved}`}
                      />
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Bottom Split: Recent Civic Reports + Activity Timeline */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <section className="xl:col-span-6 glass-surface rounded-2xl p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-display font-semibold text-slate-50">
                {t.overview.recentReports}
              </h2>
              <p className="text-xs text-slate-400">{t.overview.recentReportsSub}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onNavigate('map')}
                className="btn-press inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/70 border border-slate-700/70 text-xs font-medium text-slate-200 hover:text-cyan-300 hover:border-cyan-400/40 min-h-[38px] whitespace-nowrap shrink-0"
              >
                <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{t.overview.mapBtn}</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('management')}
                className="btn-press inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800/70 border border-slate-700/70 text-xs font-medium text-cyan-300 hover:border-cyan-400/40 min-h-[38px] whitespace-nowrap shrink-0"
              >
                <span>{t.overview.allIssuesBtn}</span>
                <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="space-y-2.5">
            {recentReports.map((issue) => (
              <button
                key={issue.id}
                type="button"
                onClick={() => onSelectIssue(issue)}
                className="w-full p-3.5 rounded-xl bg-[#070E1D]/90 border border-slate-800/90 hover:border-cyan-400/40 hover:bg-[#0C1730] transition-all text-left space-y-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-cyan-300">{issue.id}</span>
                    <span aria-hidden="true" className="text-slate-500">·</span>
                    <span className="text-slate-300">{categoryShortLabel(issue.category)}</span>
                  </div>
                  <StatusIndicator status={issue.status} tone="navy" />
                </div>
                <p className="text-sm font-medium text-slate-100 truncate">{issue.title}</p>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                  <span>
                    {issue.wardName.replace(' (Demo)', '')} · {issue.landmark}
                  </span>
                  <span className="font-mono tabular-nums">
                    {formatRelativeTime(issue.createdAt)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Attractive Activity Timeline */}
        <section className="xl:col-span-6 glass-surface rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-display font-semibold text-slate-50">
                {t.overview.activityTimeline}
              </h2>
              <p className="text-xs text-slate-400">{t.overview.activityTimelineSub}</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('command')}
              className="btn-press inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800/70 border border-slate-700/70 text-xs font-medium text-cyan-300 hover:border-cyan-400/45 min-h-[38px] whitespace-nowrap shrink-0"
            >
              <ShieldAlert className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{t.overview.commandCenterBtn}</span>
            </button>
          </div>

          <ol className="relative border-l border-sky-400/25 ml-2.5 pl-5 space-y-4">
            {activityTimeline.map((item) => {
              const dotColor =
                item.status === 'Resolved'
                  ? 'bg-emerald-400'
                  : item.status === 'In Progress'
                    ? 'bg-sky-400'
                    : 'bg-amber-400';

              return (
                <li key={item.id} className="relative">
                  <span
                    className={`absolute -left-[25px] top-1.5 w-2.5 h-2.5 rounded-full ${dotColor} border-2 border-[#081021]`}
                    aria-hidden="true"
                  />
                  <button
                    type="button"
                    onClick={() => onSelectIssue(item.issue)}
                    className="w-full text-left p-3 rounded-xl bg-[#070E1D]/85 border border-slate-800/80 hover:border-cyan-400/40 transition-colors space-y-1"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="font-mono font-semibold text-cyan-300">
                        {item.issue.id} · {statusLabel(item.status)}
                      </span>
                      <span className="inline-flex items-center gap-1 font-mono tabular-nums text-[11px] text-slate-400">
                        <Clock className="w-3 h-3" aria-hidden="true" />
                        {formatDateTime(item.timestamp)}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-slate-100 truncate">
                      {item.issue.title}
                    </p>
                    <p className="text-xs text-slate-400 line-clamp-2">{item.note}</p>
                  </button>
                </li>
              );
            })}
          </ol>
        </section>
      </div>
    </div>
  );
}
