import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Flame,
  FolderKanban,
  MapPin,
  Radar,
  RotateCcw,
  ShieldAlert,
  TrendingUp,
  Wrench,
} from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import {
  CivicIssue,
  ILLUSTRATIVE_WARDS,
  IssueCategory,
  NavSection,
} from '../types/civic';
import { formatRelativeTime } from '../utils/api';
import { detectHotspots } from '../utils/hotspots';
import { getIssuePriority } from '../utils/priority';
import { MapFocusArea } from './LiveMapPage';
import { AnimatedNumber } from './MotionPrimitives';
import { SeverityIndicator, StatusIndicator } from './StatusIndicators';

interface CommandCenterPageProps {
  issues: CivicIssue[];
  onNavigate: (section: NavSection) => void;
  onSelectIssue: (issue: CivicIssue) => void;
  onFilterByCategory: (category: IssueCategory) => void;
  onFilterByWard: (wardId: string) => void;
  onLocateHotspotOnMap: (area: MapFocusArea) => void;
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

export function CommandCenterPage({
  issues,
  onNavigate,
  onSelectIssue,
  onFilterByCategory,
  onFilterByWard,
  onLocateHotspotOnMap,
  onResetDemoData,
}: CommandCenterPageProps) {
  const { t, categoryLabel, categoryShortLabel, statusLabel, bandLabel } = useTranslation();
  const [confirmReset, setConfirmReset] = useState(false);
  const [hotspotRadius, setHotspotRadius] = useState<number>(450);
  const [hotspotOpenOnly, setHotspotOpenOnly] = useState<boolean>(false);
  const [hoveredCategory, setHoveredCategory] = useState<IssueCategory | null>(null);

  const metrics = useMemo(() => {
    const total = issues.length;
    const reported = issues.filter((i) => i.status === 'Reported').length;
    const inProgress = issues.filter((i) => i.status === 'In Progress').length;
    const resolved = issues.filter((i) => i.status === 'Resolved').length;
    const open = reported + inProgress;
    const highPriority = issues.filter(
      (i) =>
        i.status !== 'Resolved' &&
        (i.severity === 'Critical' ||
          i.severity === 'High' ||
          getIssuePriority(i).totalScore >= 75)
    ).length;
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
    const demoCount = issues.filter((i) => i.isDemoData).length;
    const citizenCount = total - demoCount;

    return {
      total,
      reported,
      inProgress,
      resolved,
      open,
      highPriority,
      resolutionRate,
      demoCount,
      citizenCount,
    };
  }, [issues]);

  const categoryDistribution = useMemo(() => {
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

  const wardDistribution = useMemo(() => {
    const rows = ILLUSTRATIVE_WARDS.map((ward) => {
      const wardIssues = issues.filter((i) => i.wardId === ward.id);
      const reported = wardIssues.filter((i) => i.status === 'Reported').length;
      const inProgress = wardIssues.filter((i) => i.status === 'In Progress').length;
      const resolved = wardIssues.filter((i) => i.status === 'Resolved').length;
      const total = wardIssues.length;
      const rate = total > 0 ? Math.round((resolved / total) * 100) : 0;
      return {
        id: ward.id,
        name: ward.shortName,
        reported,
        inProgress,
        resolved,
        total,
        rate,
      };
    });
    const maxTotal = Math.max(1, ...rows.map((r) => r.total));
    return { rows, maxTotal };
  }, [issues]);

  const hotspots = useMemo(
    () =>
      detectHotspots(issues, {
        radiusMeters: hotspotRadius,
        minCount: 2,
        openOnly: hotspotOpenOnly,
      }),
    [issues, hotspotRadius, hotspotOpenOnly]
  );

  const recentActivity = useMemo(() => {
    return [...issues]
      .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
      .slice(0, 6);
  }, [issues]);

  const activeCategoryHover = hoveredCategory
    ? categoryDistribution.find((c) => c.category === hoveredCategory) ?? null
    : null;

  return (
    <div className="space-y-6">
      {/* Command Center Hero + Visible DEMO DATA Banner & Reset Confirmation */}
      <section className="glass-surface rounded-2xl relative overflow-hidden">
        <div className="h-[2px] w-full animated-gradient-border" aria-hidden="true" />
        <div className="p-5 sm:p-6 flex flex-col xl:flex-row xl:items-center justify-between gap-4 relative">
          <div
            className="pointer-events-none absolute -right-14 -top-14 w-64 h-64 rounded-full bg-cyan-500/12 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute left-1/3 -bottom-16 w-56 h-56 rounded-full bg-blue-500/12 blur-3xl"
            aria-hidden="true"
          />
          <div className="space-y-1.5 relative">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-mono font-semibold text-amber-300">{t.common.demoData}</span>
              <span aria-hidden="true" className="text-slate-500">·</span>
              <span className="text-slate-300 font-mono tabular-nums">
                {metrics.demoCount} {t.command.fictionalSample} · {metrics.citizenCount}{' '}
                {t.command.citizenSubmitted}
              </span>
            </div>
            <h2 className="text-xl font-display font-bold text-slate-50">{t.command.title}</h2>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              {t.command.subtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0 relative">
            {confirmReset ? (
              <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-xl bg-slate-900/90 border border-amber-500/40">
                <span className="text-xs text-amber-200 px-2">{t.common.confirmResetPrompt}</span>
                <button
                  type="button"
                  onClick={() => {
                    onResetDemoData();
                    setConfirmReset(false);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-400 text-slate-950 hover:bg-amber-300 transition-colors min-h-[38px] whitespace-nowrap shrink-0"
                >
                  {t.common.confirmResetBtn}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="px-2.5 py-1.5 text-xs font-medium rounded-lg text-slate-300 hover:text-white transition-colors min-h-[38px] whitespace-nowrap shrink-0"
                >
                  {t.common.cancel}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-200 bg-[#0D172B]/90 border border-sky-400/15 rounded-xl hover:text-amber-200 hover:border-amber-400/40 transition-colors min-h-[42px] whitespace-nowrap shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{t.common.resetDemoData}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onNavigate('map')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-cyan-200 bg-[#0D172B]/90 border border-cyan-400/30 rounded-xl hover:border-cyan-400/60 transition-colors min-h-[42px] whitespace-nowrap shrink-0"
            >
              <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{t.command.openCityMap}</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('management')}
              className="btn-press inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-500 rounded-xl hover:from-cyan-300 hover:to-sky-400 shadow-[0_8px_22px_-8px_rgba(34,211,238,0.5)] min-h-[42px] whitespace-nowrap shrink-0"
            >
              <span>{t.command.adminCommand}</span>
              <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      {/* Ward Intelligence 6-Metric Strip */}
      <section aria-label={t.command.title} className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="glass-surface glass-card-hover rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-slate-400">{t.command.totalReported}</span>
            <FolderKanban className="w-4 h-4 text-sky-300" aria-hidden="true" />
          </div>
          <p className="mt-3 text-2xl font-display font-bold text-slate-50">
            <AnimatedNumber value={metrics.total} />
          </p>
          <p className="mt-1 text-[11px] text-slate-400">{t.command.storedComplaints}</p>
        </div>

        <div className="glass-surface glass-card-hover rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-slate-400">{t.command.openIssues}</span>
            <Activity className="w-4 h-4 text-cyan-300" aria-hidden="true" />
          </div>
          <p className="mt-3 text-2xl font-display font-bold text-cyan-300">
            <AnimatedNumber value={metrics.open} />
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            <AnimatedNumber value={metrics.reported} className="text-slate-300" />{' '}
            {t.command.newlyReported}
          </p>
        </div>

        <div className="glass-surface glass-card-hover rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-slate-400">{t.command.inProgress}</span>
            <Wrench className="w-4 h-4 text-sky-300" aria-hidden="true" />
          </div>
          <p className="mt-3 text-2xl font-display font-bold text-sky-300">
            <AnimatedNumber value={metrics.inProgress} />
          </p>
          <p className="mt-1 text-[11px] text-slate-400">{t.command.activeDispatch}</p>
        </div>

        <div className="glass-surface glass-card-hover rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-slate-400">{t.command.resolved}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" aria-hidden="true" />
          </div>
          <p className="mt-3 text-2xl font-display font-bold text-emerald-400">
            <AnimatedNumber value={metrics.resolved} />
          </p>
          <p className="mt-1 text-[11px] text-slate-400">{t.command.closedWithNotes}</p>
        </div>

        <div className="glass-surface glass-card-hover rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-slate-400">{t.command.highPriority}</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" aria-hidden="true" />
          </div>
          <p className="mt-3 text-2xl font-display font-bold text-rose-400">
            <AnimatedNumber value={metrics.highPriority} />
          </p>
          <p className="mt-1 text-[11px] text-slate-400">{t.command.highCriticalOpen}</p>
        </div>

        <div className="glass-surface glass-card-hover rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-slate-400">{t.command.resolutionRate}</span>
            <TrendingUp className="w-4 h-4 text-emerald-300" aria-hidden="true" />
          </div>
          <p className="mt-3 text-2xl font-display font-bold text-slate-50">
            <AnimatedNumber value={metrics.resolutionRate} suffix="%" />
          </p>
          <div className="mt-2 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${metrics.resolutionRate}%` }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="h-full rounded-full bg-gradient-to-r from-sky-400 via-cyan-400 to-emerald-400"
            />
          </div>
        </div>
      </section>

      {/* Interactive Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-6 glass-surface rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-display font-semibold text-slate-50">
                {t.command.categoryDist}
              </h3>
              <p className="text-xs text-slate-400">{t.command.categoryDistSub}</p>
            </div>
            <span className="text-xs font-mono text-cyan-300 tabular-nums">
              {metrics.total} {t.command.totalLabel}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
            <div className="sm:col-span-5 flex flex-col items-center justify-center">
              <div className="relative w-40 h-40">
                <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90" aria-hidden="true">
                  <circle
                    cx="60"
                    cy="60"
                    r="46"
                    fill="none"
                    stroke="rgba(30, 41, 59, 0.8)"
                    strokeWidth="12"
                  />
                  {categoryDistribution.map((seg) => {
                    const circumference = 2 * Math.PI * 46;
                    const dashLength = (seg.exactShare / 100) * circumference;
                    const dashOffset = -(seg.startPct / 100) * circumference;
                    if (seg.count === 0) return null;
                    const isFocused = !hoveredCategory || hoveredCategory === seg.category;
                    return (
                      <motion.circle
                        key={seg.category}
                        cx="60"
                        cy="60"
                        r="46"
                        fill="none"
                        stroke={CATEGORY_STYLES[seg.category].stroke}
                        strokeWidth={hoveredCategory === seg.category ? 14 : 12}
                        strokeDasharray={`${dashLength} ${circumference}`}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{
                          strokeDashoffset: dashOffset,
                          opacity: isFocused ? 1 : 0.35,
                        }}
                        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                        strokeLinecap="butt"
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredCategory(seg.category)}
                        onMouseLeave={() => setHoveredCategory(null)}
                        onClick={() => onFilterByCategory(seg.category)}
                      />
                    );
                  })}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-3 pointer-events-none">
                  <span className="text-2xl font-display font-bold font-mono tabular-nums text-slate-50">
                    {activeCategoryHover ? activeCategoryHover.count : metrics.total}
                  </span>
                  <span className="text-[11px] text-slate-400 truncate max-w-[96px]">
                    {activeCategoryHover ? activeCategoryHover.shortLabel : t.command.allIssuesLabel}
                  </span>
                </div>
              </div>
            </div>

            <div className="sm:col-span-7 space-y-2.5">
              {categoryDistribution.map((row) => (
                <button
                  key={row.category}
                  type="button"
                  onMouseEnter={() => setHoveredCategory(row.category)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  onClick={() => onFilterByCategory(row.category)}
                  className="w-full text-left group rounded-lg p-1.5 -m-1.5 hover:bg-slate-800/45 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="inline-flex items-center gap-2 font-medium text-slate-200 group-hover:text-cyan-200">
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
        </section>

        {/* Ward-Wise Complaint Distribution */}
        <section className="lg:col-span-6 glass-surface rounded-2xl p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-display font-semibold text-slate-50">
                {t.command.wardDist}
              </h3>
              <p className="text-xs text-slate-400">{t.command.wardDistSub}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-300">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-400 inline-block" />
                {statusLabel('Reported')}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400 inline-block" />
                {statusLabel('In Progress')}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400 inline-block" />
                {statusLabel('Resolved')}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {wardDistribution.rows.map((ward) => {
              const repW = (ward.reported / wardDistribution.maxTotal) * 100;
              const progW = (ward.inProgress / wardDistribution.maxTotal) * 100;
              const resW = (ward.resolved / wardDistribution.maxTotal) * 100;
              return (
                <button
                  key={ward.id}
                  type="button"
                  onClick={() => onFilterByWard(ward.id)}
                  className="w-full text-left p-2 -mx-2 rounded-xl hover:bg-slate-800/40 transition-colors space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-200">{ward.name}</span>
                    <span className="font-mono tabular-nums text-slate-300">
                      {ward.total} {t.command.totalLabel} ·{' '}
                      <span className="text-emerald-300">
                        {ward.rate}% {t.command.resolvedPctLabel}
                      </span>
                    </span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-slate-800/90 overflow-hidden flex gap-0.5 p-0.5">
                    {ward.reported > 0 ? (
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${repW}%` }}
                        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                        className="h-full rounded-full bg-amber-400"
                        title={`${ward.reported} ${statusLabel('Reported')}`}
                      />
                    ) : null}
                    {ward.inProgress > 0 ? (
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progW}%` }}
                        transition={{ duration: 0.45, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
                        className="h-full rounded-full bg-cyan-400"
                        title={`${ward.inProgress} ${statusLabel('In Progress')}`}
                      />
                    ) : null}
                    {ward.resolved > 0 ? (
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${resW}%` }}
                        transition={{ duration: 0.45, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                        className="h-full rounded-full bg-emerald-400"
                        title={`${ward.resolved} ${statusLabel('Resolved')}`}
                      />
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </div>

      {/* MODULE 3: Smart Hotspot Detection */}
      <section className="glass-surface rounded-2xl p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-rose-500/15 border border-rose-400/30 flex items-center justify-center text-rose-300">
                <Radar className="w-4 h-4" aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-base font-display font-semibold text-slate-50">
                  {t.command.hotspotTitle}
                </h3>
                <p className="text-xs text-slate-400">
                  {t.command.hotspotSubPrefix} {hotspotRadius}m {t.command.hotspotSubSuffix}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs shrink-0">
            <div className="flex items-center gap-1 p-1 rounded-xl bg-[#070E1D] border border-slate-800">
              {[350, 450, 750].map((radius) => (
                <button
                  key={radius}
                  type="button"
                  onClick={() => setHotspotRadius(radius)}
                  className={`px-2.5 py-1.5 rounded-lg font-mono text-xs transition-colors min-h-[34px] whitespace-nowrap shrink-0 ${
                    hotspotRadius === radius
                      ? 'bg-cyan-400 text-slate-950 font-semibold'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {radius}m
                </button>
              ))}
            </div>

            <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[#070E1D] border border-slate-800 text-slate-200 cursor-pointer min-h-[38px] whitespace-nowrap shrink-0">
              <input
                type="checkbox"
                checked={hotspotOpenOnly}
                onChange={(e) => setHotspotOpenOnly(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-cyan-400 focus:ring-cyan-400"
              />
              <span>{t.command.openComplaintsOnly}</span>
            </label>
          </div>
        </div>

        {hotspots.length === 0 ? (
          <div className="py-10 text-center space-y-2 text-xs text-slate-400">
            <Flame className="w-6 h-6 text-slate-500 mx-auto" aria-hidden="true" />
            <p className="text-slate-200 font-medium">
              {t.command.noHotspotsTitle} {hotspotRadius}m
            </p>
            <p>{t.command.noHotspotsSub}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {hotspots.map((hs) => (
              <article
                key={hs.id}
                className="p-4 rounded-xl bg-[#070E1D] border border-slate-800/90 hover:border-cyan-400/35 transition-colors space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                      <span className="font-mono font-semibold text-cyan-300">
                        {hs.complaintCount} {t.command.complaintsCount} ({hs.openCount}{' '}
                        {t.command.openCount})
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>
                        {t.command.avgPriority} {hs.avgPriorityScore}/100
                      </span>
                    </div>
                    <h4 className="text-sm font-display font-semibold text-slate-100">
                      {hs.areaName}
                    </h4>
                  </div>
                  <SeverityIndicator severity={hs.highestSeverity} tone="navy" />
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs p-3 rounded-lg bg-[#0A1326] border border-slate-800/80">
                  <div>
                    <span className="text-slate-400">{t.command.mostCommonCategory}</span>
                    <p className="mt-0.5 font-semibold text-slate-100">
                      {categoryLabel(hs.dominantCategory)}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">{t.command.groupedIds}</span>
                    <div className="mt-0.5 flex flex-wrap gap-1.5">
                      {hs.issueIds.map((id) => {
                        const target = issues.find((i) => i.id === id);
                        if (!target) return null;
                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={() => onSelectIssue(target)}
                            className="font-mono text-[11px] text-cyan-300 hover:text-cyan-200 underline underline-offset-2"
                          >
                            {id}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed">
                  <strong className="text-cyan-200">{t.command.suggestedAttention}</strong>{' '}
                  {hs.suggestedAttention}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                  <span>{hs.groupingRuleSummary}</span>
                  <button
                    type="button"
                    onClick={() =>
                      onLocateHotspotOnMap({
                        lat: hs.centerLat,
                        lng: hs.centerLng,
                        label: hs.areaName,
                      })
                    }
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#0D172B] border border-sky-400/25 text-cyan-300 hover:border-cyan-400/50 text-xs font-medium min-h-[36px] whitespace-nowrap shrink-0"
                  >
                    <MapPin className="w-3 h-3" aria-hidden="true" />
                    <span>{t.command.locateCluster}</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Bottom Split: Recent Complaint Activity & Priority Watchlist */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <section className="xl:col-span-7 glass-surface rounded-2xl p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-display font-semibold text-slate-50">
                {t.command.recentActivity}
              </h3>
              <p className="text-xs text-slate-400">{t.command.recentActivitySub}</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('management')}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800/70 border border-slate-700/70 text-xs font-medium text-cyan-300 hover:border-cyan-400/40 transition-colors min-h-[38px] whitespace-nowrap shrink-0"
            >
              <span>{t.command.allComplaints}</span>
              <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>

          <div className="space-y-2.5">
            {recentActivity.map((issue) => {
              const latest = issue.timeline[issue.timeline.length - 1];
              return (
                <button
                  key={issue.id}
                  type="button"
                  onClick={() => onSelectIssue(issue)}
                  className="w-full p-3.5 rounded-xl bg-[#070E1D] border border-slate-800/90 hover:border-cyan-400/40 transition-all text-left flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                      <span className="font-mono font-semibold text-cyan-300">{issue.id}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-slate-200 font-medium">
                        {categoryShortLabel(issue.category)}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{issue.wardName.replace(' (Demo)', '')}</span>
                      {issue.isDemoData ? (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-amber-300/90">{t.common.demo}</span>
                        </>
                      ) : null}
                    </div>
                    <p className="text-sm font-medium text-slate-100 truncate">{issue.title}</p>
                    <p className="text-xs text-slate-400 truncate">
                      {latest ? latest.note : issue.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <StatusIndicator status={issue.status} tone="navy" />
                    <span className="inline-flex items-center gap-1 text-xs font-mono tabular-nums text-slate-400">
                      <Clock className="w-3 h-3" aria-hidden="true" />
                      {formatRelativeTime(issue.updatedAt)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="xl:col-span-5 glass-surface rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-display font-semibold text-slate-50">
                {t.command.urgentQueue}
              </h3>
              <p className="text-xs text-slate-400">{t.command.urgentQueueSub}</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('priority')}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800/70 border border-slate-700/70 text-xs font-medium text-cyan-300 hover:border-cyan-400/40 transition-colors min-h-[38px] whitespace-nowrap shrink-0"
            >
              <span>{t.command.priorityRules}</span>
              <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>

          <div className="space-y-2.5">
            {issues
              .filter((i) => i.status !== 'Resolved')
              .map((issue) => ({ issue, priority: getIssuePriority(issue) }))
              .sort((a, b) => b.priority.totalScore - a.priority.totalScore)
              .slice(0, 5)
              .map(({ issue, priority }) => (
                <button
                  key={issue.id}
                  type="button"
                  onClick={() => onSelectIssue(issue)}
                  className="w-full p-3.5 rounded-xl bg-[#070E1D] border border-slate-800/90 hover:border-cyan-400/40 transition-all text-left flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-mono font-semibold text-cyan-300">{issue.id}</span>
                      <SeverityIndicator severity={issue.severity} tone="navy" />
                    </div>
                    <p className="text-xs font-medium text-slate-100 truncate">{issue.title}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-flex items-center gap-1 text-sm font-mono font-bold tabular-nums text-cyan-300">
                      <ShieldAlert className="w-3.5 h-3.5" aria-hidden="true" />
                      {priority.totalScore}
                    </span>
                    <p className="text-[11px] text-slate-400">{bandLabel(priority.band)}</p>
                  </div>
                </button>
              ))}
          </div>
        </section>
      </div>
    </div>
  );
}
