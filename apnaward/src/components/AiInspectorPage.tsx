import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  Cpu,
  ImagePlus,
  Loader2,
  ShieldAlert,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import {
  AIInspectionResult,
  CivicIssue,
  ILLUSTRATIVE_WARDS,
  IssueCategory,
} from '../types/civic';
import { analyzeCivicIssue } from '../utils/api';
import { processUploadedImage } from '../utils/imageHelper';
import { getIssuePriority } from '../utils/priority';
import { AnimatedNumber } from './MotionPrimitives';
import { PrefillReportDraft } from './ReportIssuePage';
import { SeverityIndicator } from './StatusIndicators';

const ALL_CATEGORIES: IssueCategory[] = [
  'road_damage',
  'water_leakage',
  'drainage',
  'streetlight',
  'garbage',
  'public_safety',
];

const CATEGORY_GRADIENTS: Record<IssueCategory, string> = {
  road_damage: 'from-blue-600 to-sky-500',
  water_leakage: 'from-cyan-500 to-sky-600',
  drainage: 'from-teal-500 to-emerald-600',
  streetlight: 'from-amber-500 to-orange-500',
  garbage: 'from-emerald-500 to-green-600',
  waterlogging: 'from-sky-500 to-blue-600',
  public_safety: 'from-orange-500 to-red-600',
  other: 'from-slate-500 to-slate-600',
};

interface AiInspectorPageProps {
  issues: CivicIssue[];
  onPrefillReport: (draft: PrefillReportDraft) => void;
  initialSampleIssueId?: string | null;
  onClearInitialSample?: () => void;
}

export function AiInspectorPage({
  issues,
  onPrefillReport,
  initialSampleIssueId,
  onClearInitialSample,
}: AiInspectorPageProps) {
  const { t, categoryLabel, categoryShortLabel } = useTranslation();

  const [selectedExistingId, setSelectedExistingId] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [area, setArea] = useState<string>(ILLUSTRATIVE_WARDS[0].name);
  const [description, setDescription] = useState<string>('');
  const [photoDataUrl, setPhotoDataUrl] = useState<string | undefined>(undefined);
  const [photoMimeType, setPhotoMimeType] = useState<string>('image/jpeg');
  const [photoName, setPhotoName] = useState<string>('');
  const [photoError, setPhotoError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AIInspectionResult | null>(null);

  const insights = useMemo(() => {
    const total = Math.max(1, issues.length);
    const aiAnalyzedCount = issues.filter((i) => Boolean(i.aiAnalysis)).length;
    const critCount = issues.filter((i) => i.severity === 'Critical').length;
    const highCount = issues.filter((i) => i.severity === 'High').length;
    const medCount = issues.filter((i) => i.severity === 'Medium').length;
    const lowCount = issues.filter((i) => i.severity === 'Low').length;

    const categoryCounts = new Map<IssueCategory, number>();
    for (const issue of issues) {
      categoryCounts.set(issue.category, (categoryCounts.get(issue.category) ?? 0) + 1);
    }
    let topCategory: IssueCategory = 'road_damage';
    let topCategoryCount = 0;
    for (const [cat, count] of categoryCounts.entries()) {
      if (count > topCategoryCount) {
        topCategory = cat;
        topCategoryCount = count;
      }
    }

    const openIssues = issues.filter((i) => i.status !== 'Resolved');
    const avgPriority =
      openIssues.length > 0
        ? Math.round(
            openIssues.reduce((acc, item) => acc + getIssuePriority(item).totalScore, 0) /
              openIssues.length
          )
        : 0;

    const avgSeverityPts =
      openIssues.length > 0
        ? Math.round(
            openIssues.reduce((acc, item) => acc + getIssuePriority(item).severityPoints, 0) /
              openIssues.length
          )
        : 0;
    const avgImpactPts =
      openIssues.length > 0
        ? Math.round(
            openIssues.reduce((acc, item) => acc + getIssuePriority(item).impactPoints, 0) /
              openIssues.length
          )
        : 0;
    const avgWaitingPts =
      openIssues.length > 0
        ? Math.round(
            openIssues.reduce((acc, item) => acc + getIssuePriority(item).waitingPoints, 0) /
              openIssues.length
          )
        : 0;

    const categoryRows = ALL_CATEGORIES.map((cat) => {
      const catIssues = issues.filter((i) => i.category === cat);
      const count = catIssues.length;
      const aiCount = catIssues.filter((i) => Boolean(i.aiAnalysis)).length;
      const pct = Math.round((count / total) * 100);
      return {
        category: cat,
        label: categoryLabel(cat),
        shortLabel: categoryShortLabel(cat),
        count,
        aiCount,
        pct,
      };
    }).sort((a, b) => b.count - a.count);

    const wardRows = ILLUSTRATIVE_WARDS.map((ward) => {
      const wardIssues = issues.filter((i) => i.wardId === ward.id);
      const count = wardIssues.length;
      const open = wardIssues.filter((i) => i.status !== 'Resolved').length;
      const resolved = wardIssues.filter((i) => i.status === 'Resolved').length;
      const meanScore =
        count > 0
          ? Math.round(
              wardIssues.reduce((acc, item) => acc + getIssuePriority(item).totalScore, 0) / count
            )
          : 0;
      return {
        id: ward.id,
        name: ward.shortName,
        count,
        open,
        resolved,
        meanScore,
      };
    });
    const maxWardCount = Math.max(1, ...wardRows.map((w) => w.count));

    return {
      total: issues.length,
      aiAnalyzedCount,
      critCount,
      highCount,
      medCount,
      lowCount,
      critPct: Math.round((critCount / total) * 100),
      highPct: Math.round((highCount / total) * 100),
      medPct: Math.round((medCount / total) * 100),
      lowPct: Math.round((lowCount / total) * 100),
      topCategoryLabel: categoryShortLabel(topCategory),
      topCategoryCount,
      avgPriority,
      avgSeverityPts,
      avgImpactPts,
      avgWaitingPts,
      openCount: openIssues.length,
      categoryRows,
      wardRows,
      maxWardCount,
    };
  }, [issues, categoryLabel, categoryShortLabel]);

  const handleLoadExisting = (issueId: string) => {
    setSelectedExistingId(issueId);
    const found = issues.find((i) => i.id === issueId);
    if (!found) return;
    setTitle(found.title);
    setArea(`${found.wardName} — ${found.landmark}`);
    setDescription(found.description);
    setPhotoDataUrl(found.photoDataUrl);
    setPhotoMimeType('image/jpeg');
    setPhotoName(found.photoDataUrl ? `Photo (${found.id})` : '');
    setResult(found.aiAnalysis ?? null);
    setError(null);
  };

  useEffect(() => {
    if (!initialSampleIssueId) return;
    handleLoadExisting(initialSampleIssueId);
    onClearInitialSample?.();
  }, [initialSampleIssueId]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoError(null);
    try {
      const processed = await processUploadedImage(file);
      setPhotoDataUrl(processed.dataUrl);
      setPhotoMimeType(processed.mimeType);
      setPhotoName(processed.originalName);
    } catch (err) {
      setPhotoError(err instanceof Error ? err.message : 'Unable to process image.');
    }
  };

  const handleInspect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !description.trim() && !photoDataUrl) {
      setError(t.report.validationAiNeedInput);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await analyzeCivicIssue({
        title: title.trim(),
        description: description.trim(),
        area,
        imageBase64: photoDataUrl,
        imageMimeType: photoMimeType,
      });
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.report.aiUnavailableSub);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Grounded Dataset & AI Insights Cards */}
      <section aria-label={t.inspector.sandboxTitle} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="citizen-card citizen-card-hover rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{t.inspector.topCategory}</span>
            <BarChart3 className="w-4 h-4 text-blue-700" aria-hidden="true" />
          </div>
          <p className="text-xl font-display font-bold text-[#0B1B36]">
            {insights.topCategoryLabel}
          </p>
          <p className="text-xs text-slate-600">
            <AnimatedNumber value={insights.topCategoryCount} className="text-blue-700 font-bold" /> /{' '}
            <AnimatedNumber value={insights.total} /> {t.inspector.ofActive}
          </p>
        </div>

        <div className="citizen-card citizen-card-hover rounded-2xl p-5 space-y-2 border-purple-200">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{t.inspector.meanPriority}</span>
            <ShieldAlert className="w-4 h-4 text-purple-700" aria-hidden="true" />
          </div>
          <p className="text-xl font-display font-bold font-mono tabular-nums text-purple-700">
            <AnimatedNumber value={insights.avgPriority} /> / 100
          </p>
          <p className="text-xs text-slate-600">
            <AnimatedNumber value={insights.aiAnalyzedCount} className="text-[#0B1B36] font-bold" />{' '}
            {t.inspector.includeAiHint}
          </p>
        </div>

        <div className="citizen-card citizen-card-hover rounded-2xl p-5 space-y-2.5">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{t.inspector.severityMix}</span>
            <span className="font-mono tabular-nums text-[#0B1B36] font-semibold">
              {insights.critCount}C · {insights.highCount}H · {insights.medCount}M ·{' '}
              {insights.lowCount}L
            </span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-slate-200 overflow-hidden flex gap-0.5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${insights.critPct}%` }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="h-full bg-red-600"
            />
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${insights.highPct}%` }}
              transition={{ duration: 0.45, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
              className="h-full bg-orange-500"
            />
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${insights.medPct}%` }}
              transition={{ duration: 0.45, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="h-full bg-amber-500"
            />
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${insights.lowPct}%` }}
              transition={{ duration: 0.45, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="h-full bg-emerald-500"
            />
          </div>
          <p className="text-xs text-slate-600">{t.inspector.severityMixSub}</p>
        </div>
      </section>

      {/* Category Distribution, Ward Comparison & Priority Drivers */}
      <section aria-label={t.inspector.categoryDist} className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-4 citizen-card rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-display font-bold text-[#0B1B36]">
                {t.inspector.categoryDist}
              </h3>
              <p className="text-[11px] text-slate-500">{t.inspector.categoryDistSub}</p>
            </div>
            <span className="text-[11px] font-mono font-semibold text-amber-700">
              {t.common.demo}
            </span>
          </div>

          <div className="space-y-3">
            {insights.categoryRows.map((row) => (
              <div key={row.category} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700">{row.shortLabel}</span>
                  <span className="font-mono tabular-nums text-[#0B1B36] font-semibold">
                    {row.count} <span className="text-slate-400">({row.pct}%)</span>
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${row.pct}%` }}
                    transition={{ duration: 0.48, ease: [0.16, 1, 0.3, 1] }}
                    className={`h-full rounded-full bg-gradient-to-r ${CATEGORY_GRADIENTS[row.category]}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="xl:col-span-4 citizen-card rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-display font-bold text-[#0B1B36]">
                {t.inspector.wardComp}
              </h3>
              <p className="text-[11px] text-slate-500">{t.inspector.wardCompSub}</p>
            </div>
            <span className="text-[11px] font-mono font-bold text-blue-700">6 WARDS</span>
          </div>

          <div className="space-y-3">
            {insights.wardRows.map((ward) => {
              const openW = (ward.open / insights.maxWardCount) * 100;
              const resolvedW = (ward.resolved / insights.maxWardCount) * 100;
              return (
                <div key={ward.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700 truncate">{ward.name}</span>
                    <span className="font-mono tabular-nums text-slate-700 shrink-0">
                      {ward.count} · <span className="text-blue-700 font-bold">{ward.meanScore}</span>
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-200 overflow-hidden flex gap-0.5 p-0.5">
                    {ward.open > 0 ? (
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${openW}%` }}
                        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                        className="h-full rounded-full bg-amber-500"
                      />
                    ) : null}
                    {ward.resolved > 0 ? (
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${resolvedW}%` }}
                        transition={{ duration: 0.45, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
                        className="h-full rounded-full bg-emerald-500"
                      />
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="xl:col-span-4 citizen-card rounded-2xl p-5 space-y-4 flex flex-col justify-between border-purple-200">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-700" aria-hidden="true" />
                <h3 className="text-sm font-display font-bold text-[#0B1B36]">
                  {t.inspector.priorityDrivers} ({insights.openCount} {t.common.open})
                </h3>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">{t.inspector.avgSeverity}</span>
                  <span className="font-mono font-bold text-orange-700 tabular-nums">
                    {insights.avgSeverityPts} / 45 pts
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.round((insights.avgSeverityPts / 45) * 100)}%` }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full rounded-full bg-orange-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">{t.inspector.avgImpact}</span>
                  <span className="font-mono font-bold text-blue-700 tabular-nums">
                    {insights.avgImpactPts} / 35 pts
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.round((insights.avgImpactPts / 35) * 100)}%` }}
                    transition={{ duration: 0.45, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full rounded-full bg-blue-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">{t.inspector.avgWaiting}</span>
                  <span className="font-mono font-bold text-amber-700 tabular-nums">
                    {insights.avgWaitingPts} / 20 pts
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.round((insights.avgWaitingPts / 20) * 100)}%` }}
                    transition={{ duration: 0.45, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full rounded-full bg-amber-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 pt-3 border-t border-slate-200 leading-relaxed">
            {t.inspector.insightsNote}
          </p>
        </div>
      </section>

      {/* Purple AI Understand the Issue Sandbox Header */}
      <div className="citizen-card rounded-2xl p-5 border-purple-200 bg-purple-50/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-base font-display font-bold text-purple-950">
            {t.inspector.sandboxTitle}
          </h2>
          <p className="text-xs text-purple-800">{t.inspector.sandboxSub}</p>
        </div>
        <div className="shrink-0">
          <label htmlFor="inspector-load-issue" className="sr-only">
            {t.inspector.loadExisting}
          </label>
          <select
            id="inspector-load-issue"
            value={selectedExistingId}
            onChange={(e) => handleLoadExisting(e.target.value)}
            className="w-full md:w-auto px-3.5 py-2.5 rounded-xl bg-white border border-purple-200 text-xs text-slate-800 focus:outline-none focus:border-purple-500 min-h-[42px]"
          >
            <option value="">{t.inspector.loadExisting}</option>
            {issues.map((issue) => (
              <option key={issue.id} value={issue.id}>
                {issue.id} · {issue.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Understand the Issue Split */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <form
          onSubmit={handleInspect}
          className="xl:col-span-6 citizen-card rounded-2xl p-6 space-y-4"
        >
          <div>
            <label htmlFor="inspector-title" className="block text-xs font-semibold text-[#0B1B36] mb-1.5">
              {t.inspector.titleOptional}
            </label>
            <input
              id="inspector-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.report.titlePlaceholder}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-purple-500 min-h-[42px]"
            />
          </div>

          <div>
            <label htmlFor="inspector-area" className="block text-xs font-semibold text-[#0B1B36] mb-1.5">
              {t.inspector.areaOptional}
            </label>
            <input
              id="inspector-area"
              type="text"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder={t.report.landmarkPlaceholder}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-purple-500 min-h-[42px]"
            />
          </div>

          <div>
            <label htmlFor="inspector-description" className="block text-xs font-semibold text-[#0B1B36] mb-1.5">
              {t.inspector.descLabel}
            </label>
            <textarea
              id="inspector-description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.inspector.descPlaceholder}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="space-y-2">
            <span className="block text-xs font-semibold text-[#0B1B36]">
              {t.inspector.photoOptional}
            </span>
            {photoDataUrl ? (
              <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-sky-50 border border-sky-200">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={photoDataUrl}
                    alt="Inspection preview"
                    className="w-16 h-16 rounded-lg object-cover border border-slate-300 shrink-0"
                  />
                  <span className="text-xs font-medium text-[#0B1B36] truncate">
                    {photoName || 'Uploaded image'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPhotoDataUrl(undefined);
                    setPhotoName('');
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg min-h-[38px] whitespace-nowrap shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{t.report.removePhoto}</span>
                </button>
              </div>
            ) : (
              <label
                htmlFor="inspector-photo-upload"
                className="flex items-center justify-center gap-2 p-5 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:border-purple-400 cursor-pointer text-xs text-slate-600 transition-colors"
              >
                <ImagePlus className="w-4 h-4 text-purple-700" aria-hidden="true" />
                <span>{t.inspector.uploadPhotoHint}</span>
                <input
                  id="inspector-photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="sr-only"
                />
              </label>
            )}
            {photoError ? (
              <p className="text-xs text-red-600" role="alert">
                {photoError}
              </p>
            ) : null}
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() =>
                onPrefillReport({
                  title,
                  description,
                  photoDataUrl,
                  photoMimeType,
                  aiAnalysis: result ?? undefined,
                  category: result?.category,
                  severity: result?.severity,
                })
              }
              className="text-xs font-semibold text-slate-600 hover:text-blue-700 transition-colors min-h-[40px] whitespace-nowrap shrink-0"
            >
              {t.inspector.skipAiManual}
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-purple-700 text-white hover:bg-purple-800 disabled:opacity-60 transition-all min-h-[44px] whitespace-nowrap shrink-0"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              ) : (
                <Cpu className="w-4 h-4" aria-hidden="true" />
              )}
              <span>{loading ? t.inspector.analyzing : t.inspector.runAiInspection}</span>
            </button>
          </div>
        </form>

        {/* Purple AI Advisory Output Panel */}
        <section className="xl:col-span-6 citizen-card rounded-2xl p-6 space-y-5 border-purple-200">
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-purple-200">
            <h3 className="text-base font-display font-bold text-purple-950">
              {t.inspector.outputTitle}
            </h3>
            <span className="text-[11px] font-semibold text-purple-700">
              {t.inspector.suggestionOnly}
            </span>
          </div>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="inspector-loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4 py-3"
                aria-busy="true"
              >
                <div className="flex items-center gap-2 text-xs text-purple-700 font-medium">
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  <span>{t.inspector.loadingText}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-purple-50 border border-purple-200">
                  <div className="h-8 rounded-lg bg-purple-200/60 animate-pulse" />
                  <div className="h-8 rounded-lg bg-purple-200/60 animate-pulse" />
                </div>
                <div className="space-y-2">
                  <div className="h-3.5 w-2/3 rounded bg-purple-100 animate-pulse" />
                  <div className="h-3.5 w-full rounded bg-purple-100 animate-pulse" />
                  <div className="h-3.5 w-5/6 rounded bg-purple-100 animate-pulse" />
                </div>
              </motion.div>
            ) : error ? (
              <motion.div
                key="inspector-error"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-3"
                role="alert"
              >
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" aria-hidden="true" />
                  <div className="space-y-1">
                    <p className="font-semibold">{t.inspector.unavailableTitle}</p>
                    <p>{error}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onPrefillReport({
                      title,
                      description,
                      photoDataUrl,
                      photoMimeType,
                    })
                  }
                  className="btn-press inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500 text-white font-semibold hover:bg-amber-600 min-h-[40px]"
                >
                  <span>{t.inspector.proceedManual}</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </motion.div>
            ) : result ? (
              <motion.div
                key="inspector-result"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-purple-50/70 border border-purple-200">
                  <div>
                    <p className="text-xs text-purple-700 font-medium">
                      {t.report.suggestedCategory}
                    </p>
                    <p className="mt-1 text-sm font-bold text-[#0B1B36]">
                      {categoryLabel(result.category)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-purple-700 font-medium">
                      {t.report.suggestedSeverity}
                    </p>
                    <div className="mt-1.5">
                      <SeverityIndicator severity={result.severity} />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-purple-900">{t.inspector.whySuggested}</p>
                  <p className="text-sm text-slate-700 leading-relaxed">{result.explanation}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-purple-900">
                    {t.inspector.possibleImpact}
                  </p>
                  <p className="text-sm text-slate-700 leading-relaxed">{result.publicImpact}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-purple-900">
                    {t.inspector.recommendedAction}
                  </p>
                  <p className="text-sm text-purple-800 font-medium leading-relaxed">
                    {result.recommendedAction}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 space-y-1.5">
                  <p className="text-xs font-semibold text-purple-900">
                    {t.inspector.imageAssessment}
                  </p>
                  <p className="text-xs text-slate-700 leading-relaxed">{result.imageAssessment}</p>
                </div>

                <p className="text-xs font-medium text-purple-700">{result.disclaimer}</p>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() =>
                      onPrefillReport({
                        title,
                        category: result.category,
                        severity: result.severity,
                        description,
                        photoDataUrl,
                        photoMimeType,
                        aiAnalysis: result,
                      })
                    }
                    className="btn-press inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#1D4ED8] to-[#0284C7] text-white hover:brightness-110 min-h-[44px] whitespace-nowrap shrink-0"
                  >
                    <span>{t.inspector.prefillReport}</span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {!loading && !result && !error ? (
            <div className="py-12 text-center space-y-2 text-xs text-slate-500">
              <Cpu className="w-7 h-7 text-purple-600 mx-auto" aria-hidden="true" />
              <p className="text-[#0B1B36] font-semibold">{t.inspector.emptyTitle}</p>
              <p className="max-w-sm mx-auto">{t.inspector.emptySub}</p>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
