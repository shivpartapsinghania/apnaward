import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Cpu,
  FilePlus2,
  MapPin,
  Search,
  ShieldAlert,
  Wrench,
} from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import { CivicIssue, IssueStatus, NavSection } from '../types/civic';
import { formatDateTime, formatRelativeTime } from '../utils/api';
import { publicTrackCloudIssue } from '../utils/cloud';
import { getIssuePriority } from '../utils/priority';
import { calculateIssueSla } from '../utils/sla';
import { AnimatedNumber } from './MotionPrimitives';
import { SeverityIndicator, StatusIndicator } from './StatusIndicators';

interface ComplaintTrackingPageProps {
  issues: CivicIssue[];
  initialTrackedId?: string | null;
  onClearInitialTrackedId?: () => void;
  onNavigate: (section: NavSection) => void;
  onViewOnMap: (issue: CivicIssue) => void;
  onOpenAdminDrawer: (issue: CivicIssue) => void;
  onVerifyIssue?: (issueId: string) => void;
}

const PROGRESS_STEPS: IssueStatus[] = ['Submitted', 'In Progress', 'Resolved'];

export function ComplaintTrackingPage({
  issues,
  initialTrackedId,
  onClearInitialTrackedId,
  onNavigate,
  onViewOnMap,
  onOpenAdminDrawer,
  onVerifyIssue,
}: ComplaintTrackingPageProps) {
  const [copiedShare, setCopiedShare] = useState(false);
  const { t, categoryLabel, statusLabel, bandLabel } = useTranslation();

  const [query, setQuery] = useState<string>(() => initialTrackedId ?? issues[0]?.id ?? '');
  const [submittedQuery, setSubmittedQuery] = useState<string>(
    () => initialTrackedId ?? issues[0]?.id ?? ''
  );
  const [cloudTrackedIssue, setCloudTrackedIssue] = useState<CivicIssue | null>(null);
  const [cloudLookupBusy, setCloudLookupBusy] = useState(false);

  useEffect(() => {
    if (initialTrackedId) {
      setQuery(initialTrackedId);
      setSubmittedQuery(initialTrackedId);
      onClearInitialTrackedId?.();
    }
  }, [initialTrackedId, onClearInitialTrackedId]);

  const quickPickIds = useMemo(() => {
    return [...issues]
      .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
      .slice(0, 6);
  }, [issues]);

  const localMatchedIssue = useMemo(() => {
    const q = submittedQuery.trim().toLowerCase();
    if (!q) return null;
    const exactId = issues.find((i) => i.id.toLowerCase() === q);
    if (exactId) return exactId;
    return (
      issues.find((i) => {
        const haystack = `${i.id} ${i.title} ${i.landmark} ${i.wardName}`.toLowerCase();
        return haystack.includes(q);
      }) ?? null
    );
  }, [issues, submittedQuery]);

  useEffect(() => {
    const q = submittedQuery.trim();
    if (!q || localMatchedIssue || !/^[A-Za-z0-9-]{6,40}$/.test(q)) {
      setCloudTrackedIssue(null);
      return;
    }
    let active = true;
    setCloudLookupBusy(true);
    publicTrackCloudIssue(q)
      .then((res) => {
        if (active) setCloudTrackedIssue(res);
      })
      .catch(() => {
        if (active) setCloudTrackedIssue(null);
      })
      .finally(() => {
        if (active) setCloudLookupBusy(false);
      });
    return () => { active = false; };
  }, [submittedQuery, localMatchedIssue]);

  const matchedIssue = localMatchedIssue ?? cloudTrackedIssue;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedQuery(query);
  };

  const priority = matchedIssue ? getIssuePriority(matchedIssue) : null;
  const sla = matchedIssue ? calculateIssueSla(matchedIssue) : null;
  const latestUpdate = matchedIssue
    ? matchedIssue.timeline[matchedIssue.timeline.length - 1] ?? null
    : null;

  const activeStepIndex = matchedIssue
    ? matchedIssue.status === 'Resolved' || matchedIssue.status === 'Rejected'
      ? 2
      : matchedIssue.status === 'Under Review' ||
          matchedIssue.status === 'Assigned' ||
          matchedIssue.status === 'In Progress' ||
          matchedIssue.status === 'Reopened'
        ? 1
        : 0
    : -1;
  const progressPct =
    activeStepIndex === 0 ? 18 : activeStepIndex === 1 ? 58 : activeStepIndex === 2 ? 100 : 0;

  return (
    <div className="space-y-6">
      {/* Citizen Tracking Search Hero */}
      <section className="citizen-card rounded-2xl overflow-hidden relative">
        <div className="h-1 w-full animated-gradient-border" aria-hidden="true" />
        <div className="p-5 sm:p-6 space-y-5">
          <div className="space-y-1">
            <p className="text-[11px] font-mono font-bold text-blue-700">{t.track.kicker}</p>
            <h2 className="text-xl font-display font-bold text-[#0B1B36]">{t.track.title}</h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              {t.track.subtitle}
            </p>
          </div>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <label htmlFor="citizen-track-input" className="sr-only">
                {t.track.searchLabel}
              </label>
              <Search
                className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                id="citizen-track-input"
                type="search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (!e.target.value.trim()) {
                    setSubmittedQuery('');
                  }
                }}
                placeholder={t.track.searchPlaceholder}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 min-h-[46px]"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="submit"
                className="btn-press inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#1D4ED8] to-[#0284C7] text-white hover:brightness-110 min-h-[46px] flex-1 sm:flex-initial whitespace-nowrap shrink-0"
              >
                <Search className="w-4 h-4" aria-hidden="true" />
                <span>{t.track.searchBtn}</span>
              </button>
              {query ? (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setSubmittedQuery('');
                  }}
                  className="btn-press px-4 py-3 rounded-xl text-xs font-medium bg-slate-100 border border-slate-300 text-slate-700 hover:text-slate-950 min-h-[46px] whitespace-nowrap shrink-0"
                >
                  {t.track.clearBtn}
                </button>
              ) : null}
            </div>
          </form>

          {/* Quick-Pick Report IDs */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">{t.track.quickPickLabel}</span>
            {quickPickIds.map((item) => {
              const selected = matchedIssue?.id === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setQuery(item.id);
                    setSubmittedQuery(item.id);
                  }}
                  className={`btn-press px-3 py-1.5 rounded-lg font-mono text-xs border transition-colors min-h-[36px] whitespace-nowrap shrink-0 ${
                    selected
                      ? 'bg-sky-50 border-blue-500 text-blue-700 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-blue-300 hover:text-blue-700'
                  }`}
                >
                  {item.id}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Live Tracking Result or Empty State */}
      <AnimatePresence mode="wait">
        {matchedIssue && priority ? (
          <motion.div
            key={matchedIssue.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
            aria-live="polite"
          >
            {/* Summary Metadata Grid */}
            <section className="citizen-card rounded-2xl p-5 sm:p-6 space-y-5">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 pb-5 border-b border-slate-200">
                <div className="space-y-2 min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5 text-xs">
                    <span className="px-2.5 py-1 rounded-md bg-sky-50 border border-sky-200 font-mono font-bold text-blue-700">
                      {matchedIssue.id}
                    </span>
                    <StatusIndicator status={matchedIssue.status} />
                    <SeverityIndicator severity={matchedIssue.severity} />
                    {sla ? (
                      <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-mono font-semibold border ${
                        sla.state === 'overdue'
                          ? 'bg-red-50 border-red-200 text-red-700'
                          : sla.state === 'due_soon'
                            ? 'bg-amber-50 border-amber-200 text-amber-800'
                            : sla.state === 'resolved'
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                              : 'bg-sky-50 border-sky-200 text-sky-800'
                      }`}>
                        {sla.label}
                      </span>
                    ) : null}
                    {matchedIssue.isDemoData ? (
                      <span className="font-mono font-semibold text-amber-700">
                        {t.common.demoData}
                      </span>
                    ) : null}
                  </div>
                  <h3 className="text-lg sm:text-xl font-display font-bold text-[#0B1B36]">
                    {matchedIssue.title}
                  </h3>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => onViewOnMap(matchedIssue)}
                    className="btn-press inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-sky-50 border border-sky-200 text-[#0B1B36] hover:bg-sky-100 min-h-[44px] whitespace-nowrap shrink-0"
                  >
                    <MapPin className="w-3.5 h-3.5 text-blue-700" aria-hidden="true" />
                    <span>{t.track.viewOnMapBtn}</span>
                  </button>
                  {onVerifyIssue && !matchedIssue.isDemoData ? null : null}
                  {onVerifyIssue ? (
                    <button
                      type="button"
                      onClick={() => onVerifyIssue(matchedIssue.id)}
                      className="btn-press inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 min-h-[44px] whitespace-nowrap shrink-0"
                    >
                      <span>👍 I see this too ({matchedIssue.communityVerifications ?? 0})</span>
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => {
                      const summary = `ApnaWard Report ${matchedIssue.id}\n${matchedIssue.title}\nWard: ${matchedIssue.wardName}\nStatus: ${matchedIssue.status}`;
                      navigator.clipboard?.writeText(summary).catch(() => undefined);
                      setCopiedShare(true);
                      window.setTimeout(() => setCopiedShare(false), 2200);
                    }}
                    className="btn-press inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-sky-50 border border-sky-200 text-blue-800 hover:bg-sky-100 min-h-[44px] whitespace-nowrap shrink-0"
                  >
                    <span>{copiedShare ? '✓ Copied Update' : 'Share Update'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="btn-press inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 border border-slate-300 text-slate-800 hover:bg-slate-200 min-h-[44px] whitespace-nowrap shrink-0"
                  >
                    <span>Print Receipt</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenAdminDrawer(matchedIssue)}
                    className="btn-press inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#0B1B36] text-white hover:bg-[#13294E] min-h-[44px] whitespace-nowrap shrink-0"
                  >
                    <span>{t.track.openAdminDrawerBtn}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <p className="text-slate-500">{t.track.complaintIdLabel}</p>
                  <p className="font-mono font-bold text-blue-700">{matchedIssue.id}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <p className="text-slate-500">{t.track.categoryLabel}</p>
                  <p className="font-semibold text-[#0B1B36]">
                    {categoryLabel(matchedIssue.category)}
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <p className="text-slate-500">{t.track.wardLocalityLabel}</p>
                  <p className="font-medium text-slate-800 truncate">
                    {matchedIssue.wardName.replace(' (Demo)', '')} · {matchedIssue.landmark}
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <p className="text-slate-500">{t.track.submittedOnLabel}</p>
                  <p className="font-mono tabular-nums text-slate-800">
                    {formatDateTime(matchedIssue.createdAt)}
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <p className="text-slate-500">{t.track.priorityScoreLabel}</p>
                  <p className="font-mono font-bold tabular-nums text-blue-700">
                    <AnimatedNumber value={priority.totalScore} /> / 100 ({bandLabel(priority.band)})
                  </p>
                </div>
              </div>
            </section>

            {/* Animated Visual 3-Step Progress Timeline */}
            <section className="citizen-card rounded-2xl p-5 sm:p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-base font-display font-bold text-[#0B1B36]">
                  {t.track.progressTitle}
                </h4>
                <span className="text-xs font-mono font-semibold text-blue-700 tabular-nums">
                  {t.track.currentStatusLabel}: {statusLabel(matchedIssue.status)}
                </span>
              </div>

              <div className="space-y-4">
                <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full rounded-full bg-gradient-to-r from-[#D97706] via-[#0284C7] to-[#16A34A]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {PROGRESS_STEPS.map((stepStatus, idx) => {
                    const reached = idx <= activeStepIndex;
                    const isCurrent = idx === activeStepIndex;
                    const Icon =
                      stepStatus === 'Resolved'
                        ? CheckCircle2
                        : stepStatus === 'In Progress'
                          ? Wrench
                          : Clock;
                    const desc =
                      stepStatus === 'Resolved'
                        ? t.track.stepResolvedDesc
                        : stepStatus === 'In Progress'
                          ? t.track.stepInProgressDesc
                          : t.track.stepReportedDesc;

                    const activeColor =
                      stepStatus === 'Resolved'
                        ? 'bg-emerald-50 border-emerald-400'
                        : stepStatus === 'In Progress'
                          ? 'bg-sky-50 border-blue-500'
                          : 'bg-amber-50 border-amber-400';

                    return (
                      <div
                        key={stepStatus}
                        className={`p-4 rounded-xl border transition-colors space-y-1.5 ${
                          isCurrent
                            ? activeColor
                            : reached
                              ? 'bg-emerald-50/70 border-emerald-200'
                              : 'bg-slate-50 border-slate-200 opacity-70'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-2 text-xs font-display font-bold text-[#0B1B36]">
                            <Icon
                              className={`w-4 h-4 ${
                                isCurrent
                                  ? stepStatus === 'Resolved'
                                    ? 'text-emerald-600'
                                    : stepStatus === 'In Progress'
                                      ? 'text-blue-700'
                                      : 'text-amber-600'
                                  : reached
                                    ? 'text-emerald-600'
                                    : 'text-slate-400'
                              }`}
                              aria-hidden="true"
                            />
                            <span>{statusLabel(stepStatus)}</span>
                          </span>
                          <span className="font-mono text-[11px] text-slate-500">0{idx + 1}</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Latest Ward Update + Citizen Description + AI Note Summary (Purple ONLY for AI) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6 space-y-6">
                {latestUpdate ? (
                  <section className="citizen-card rounded-2xl p-5 sm:p-6 space-y-2.5 border-sky-200 bg-sky-50/40">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="font-display font-bold text-blue-800">
                        {t.track.latestAdminUpdate}
                      </span>
                      <span className="font-mono tabular-nums text-slate-500">
                        {formatRelativeTime(latestUpdate.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-[#0B1B36] leading-relaxed">{latestUpdate.note}</p>
                    <p className="text-xs text-slate-500">
                      {latestUpdate.actor} · {formatDateTime(latestUpdate.timestamp)}
                    </p>
                  </section>
                ) : null}

                <section className="citizen-card rounded-2xl p-5 sm:p-6 space-y-3">
                  <h4 className="text-sm font-display font-bold text-[#0B1B36]">
                    {t.track.citizenDescription}
                  </h4>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {matchedIssue.description}
                  </p>
                  {matchedIssue.photoDataUrl ? (
                    <div className="pt-2 space-y-1.5">
                      <p className="text-xs font-medium text-slate-500">{t.track.attachedPhoto}</p>
                      <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                        <img
                          src={matchedIssue.photoDataUrl}
                          alt={`${matchedIssue.id} photo`}
                          className="w-full max-h-60 object-contain"
                        />
                      </div>
                    </div>
                  ) : null}
                </section>
              </div>

              <div className="lg:col-span-6 space-y-6">
                {/* Purple exclusively for AI insights */}
                <section className="citizen-card rounded-2xl p-5 sm:p-6 space-y-3 border-purple-200">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-purple-700" aria-hidden="true" />
                      <h4 className="text-sm font-display font-bold text-[#0B1B36]">
                        {t.track.aiSummaryTitle}
                      </h4>
                    </div>
                    <span className="text-[11px] font-semibold text-purple-700">
                      {t.common.notVerifiedFact}
                    </span>
                  </div>

                  {matchedIssue.aiAnalysis ? (
                    <div className="space-y-2.5 text-xs p-3.5 rounded-xl bg-purple-50/70 border border-purple-200">
                      <p className="text-slate-700 leading-relaxed">
                        <strong className="text-purple-950">{t.drawer.whySuggested}</strong>{' '}
                        {matchedIssue.aiAnalysis.explanation}
                      </p>
                      <p className="text-slate-700 leading-relaxed">
                        <strong className="text-purple-950">{t.drawer.possibleImpact}</strong>{' '}
                        {matchedIssue.aiAnalysis.publicImpact}
                      </p>
                      <p className="text-purple-900 leading-relaxed font-medium">
                        <strong className="text-purple-950">{t.drawer.nextAction}</strong>{' '}
                        {matchedIssue.aiAnalysis.recommendedAction}
                      </p>
                    </div>
                  ) : matchedIssue.aiUnavailableFallback ? (
                    <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 p-3 rounded-xl leading-relaxed">
                      {t.track.aiSummaryUnavailable}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-500">{t.track.aiNoAnalysisYet}</p>
                  )}
                </section>

                {/* Chronological Status Timeline */}
                <section className="citizen-card rounded-2xl p-5 sm:p-6 space-y-4">
                  <h4 className="text-sm font-display font-bold text-[#0B1B36]">
                    {t.track.timelineHistoryTitle}
                  </h4>
                  <ol className="space-y-4 border-l-2 border-sky-200 ml-2 pl-4">
                    {matchedIssue.timeline.map((entry) => (
                      <li key={entry.id} className="relative space-y-1">
                        <span
                          className="absolute -left-[22px] top-1.5 w-3 h-3 rounded-full bg-blue-700 border-2 border-white"
                          aria-hidden="true"
                        />
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="font-bold text-[#0B1B36]">
                            {statusLabel(entry.status)}
                          </span>
                          <span aria-hidden="true" className="text-slate-300">·</span>
                          <span className="text-slate-600">{entry.actor}</span>
                          <span aria-hidden="true" className="text-slate-300">·</span>
                          <span className="font-mono tabular-nums text-slate-500">
                            {formatDateTime(entry.timestamp)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed">{entry.note}</p>
                      </li>
                    ))}
                  </ol>
                </section>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.section
            key="track-empty-state"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="citizen-card rounded-2xl p-8 sm:p-12 text-center space-y-4"
            aria-live="polite"
          >
            <div className="w-14 h-14 mx-auto rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center">
              {submittedQuery.trim() ? (
                <AlertCircle className="w-6 h-6 text-amber-600" aria-hidden="true" />
              ) : (
                <ShieldAlert className="w-6 h-6 text-blue-700" aria-hidden="true" />
              )}
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-base font-display font-bold text-[#0B1B36]">
                {submittedQuery.trim() ? t.track.emptyNotFoundTitle : t.track.emptyTitle}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {submittedQuery.trim() ? t.track.emptyNotFoundSub : t.track.emptySub}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              {issues[0] ? (
                <button
                  type="button"
                  onClick={() => {
                    setQuery(issues[0].id);
                    setSubmittedQuery(issues[0].id);
                  }}
                  className="btn-press px-4 py-2.5 rounded-xl text-xs font-semibold bg-sky-50 border border-sky-200 text-[#0B1B36] hover:bg-sky-100 min-h-[44px] whitespace-nowrap shrink-0"
                >
                  {t.track.showLatestBtn} ({issues[0].id})
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => onNavigate('report')}
                className="btn-press inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#1D4ED8] to-[#0284C7] text-white hover:brightness-110 min-h-[44px] whitespace-nowrap shrink-0"
              >
                <FilePlus2 className="w-4 h-4" aria-hidden="true" />
                <span>{t.track.reportNewBtn}</span>
              </button>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
