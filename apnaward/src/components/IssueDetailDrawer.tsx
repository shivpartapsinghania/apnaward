import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Cpu,
  MapPin,
  ShieldAlert,
  X,
} from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import { CivicIssue, IssueStatus } from '../types/civic';
import { getIssuePriority } from '../utils/priority';
import { calculateIssueSla } from '../utils/sla';
import { formatDateTime } from '../utils/api';
import { getEvidenceSignedUrl } from '../utils/cloud';
import { processUploadedImage } from '../utils/imageHelper';
import { AnimatedNumber } from './MotionPrimitives';
import { SeverityIndicator, StatusIndicator } from './StatusIndicators';

interface IssueDetailDrawerProps {
  issue: CivicIssue | null;
  onClose: () => void;
  onUpdateStatus: (issueId: string, status: IssueStatus, note: string, resolutionPhotoDataUrl?: string) => Promise<void> | void;
  onViewOnMap: (issue: CivicIssue) => void;
}

const STATUS_OPTIONS: IssueStatus[] = ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Rejected', 'Reopened'];

export function IssueDetailDrawer({
  issue,
  onClose,
  onUpdateStatus,
  onViewOnMap,
}: IssueDetailDrawerProps) {
  const { language, t, categoryLabel, statusLabel, bandLabel } = useTranslation();

  const [nextStatus, setNextStatus] = useState<IssueStatus>('Reported');
  const [adminNote, setAdminNote] = useState('');
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [noteError, setNoteError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [signedPhotoUrl, setSignedPhotoUrl] = useState<string | null>(null);
  const [resolutionPhotoDataUrl, setResolutionPhotoDataUrl] = useState<string | undefined>(undefined);
  const prevIssueIdRef = useRef<string | null>(null);

  useEffect(() => {
    let active = true;
    setSignedPhotoUrl(null);
    if (issue?.photoPath && !issue.photoDataUrl) {
      getEvidenceSignedUrl(issue.photoPath)
        .then((url) => { if (active && url) setSignedPhotoUrl(url); })
        .catch(() => undefined);
    }
    return () => { active = false; };
  }, [issue?.id, issue?.photoPath, issue?.photoDataUrl]);

  useEffect(() => {
    if (issue) {
      setNextStatus(issue.status);
      setNoteError(null);
      if (prevIssueIdRef.current !== issue.id) {
        setAdminNote('');
        setResolutionPhotoDataUrl(undefined);
        setSaveMessage(null);
        prevIssueIdRef.current = issue.id;
      }
    } else {
      prevIssueIdRef.current = null;
    }
  }, [issue]);

  useEffect(() => {
    if (!issue) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [issue, onClose]);

  const priority = issue ? getIssuePriority(issue) : null;
  const sla = issue ? calculateIssueSla(issue) : null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issue || saving) return;
    if (nextStatus === issue.status && !adminNote.trim()) {
      setNoteError(t.drawer.noteError);
      return;
    }
    setNoteError(null);
    setSaveMessage(null);
    setSaving(true);
    try {
      await onUpdateStatus(issue.id, nextStatus, adminNote.trim(), resolutionPhotoDataUrl);
      setAdminNote('');
      setSaveMessage(`${t.drawer.savedPrefix} ${statusLabel(nextStatus)} ${t.drawer.savedSuffix}`);
    } catch (err) {
      setNoteError(err instanceof Error ? err.message : 'Status update failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleMarkResolved = async () => {
    if (!issue || saving) return;
    setNoteError(null);
    setSaveMessage(null);
    setSaving(true);
    const defaultNote =
      language === 'hi'
        ? 'वार्ड संचालन टीम द्वारा जांच कर समस्या का समाधान दर्ज किया गया।'
        : 'Verified by Ward Operations team and marked as resolved.';
    try {
      await onUpdateStatus(issue.id, 'Resolved', adminNote.trim() || defaultNote, resolutionPhotoDataUrl);
      setNextStatus('Resolved');
      setAdminNote('');
      setSaveMessage(`${t.drawer.savedPrefix} ${statusLabel('Resolved')} ${t.drawer.savedSuffix}`);
    } catch (err) {
      setNoteError(err instanceof Error ? err.message : 'Status update failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {issue && priority ? (
        <motion.div
          key="issue-drawer-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[70] flex justify-end bg-slate-950/70 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="drawer-issue-title"
          onClick={onClose}
        >
          <motion.div
            key={issue.id}
            initial={{ x: 48, opacity: 0.75 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 48, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-2xl h-full navy-floating border-l border-sky-400/25 overflow-y-auto flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sticky Navy Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between gap-4 px-5 sm:px-6 py-4 bg-[#09162E]/95 backdrop-blur-xl border-b border-sky-400/18">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                  <span className="font-mono font-semibold text-cyan-300">{issue.id}</span>
                  <span aria-hidden="true">·</span>
                  <span>{categoryLabel(issue.category)}</span>
                  <span aria-hidden="true">·</span>
                  <span>
                    {t.drawer.submitted} {formatDateTime(issue.createdAt)}
                  </span>
                </div>
                <h2
                  id="drawer-issue-title"
                  className="mt-1 text-base sm:text-lg font-display font-semibold text-slate-50 truncate"
                >
                  {issue.title}
                </h2>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label={t.drawer.closeAria}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800/70 transition-colors min-h-[42px] min-w-[42px] flex items-center justify-center shrink-0"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 sm:p-6 space-y-6 flex-1">
              {/* Status & Location Row */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
                <div className="flex flex-wrap items-center gap-3">
                  <StatusIndicator status={issue.status} tone="navy" />
                  <SeverityIndicator severity={issue.severity} tone="navy" />
                  <span className="text-xs text-slate-300">{issue.wardName}</span>
                  {sla ? (
                    <span className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold border ${
                      sla.state === 'overdue'
                        ? 'bg-red-500/20 border-red-400/50 text-red-200'
                        : sla.state === 'due_soon'
                          ? 'bg-amber-500/20 border-amber-400/50 text-amber-200'
                          : sla.state === 'resolved'
                            ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-200'
                            : 'bg-sky-500/20 border-sky-400/50 text-sky-200'
                    }`}>
                      {sla.label}
                    </span>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => onViewOnMap(issue)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-cyan-300 bg-[#0E182E] border border-sky-400/20 rounded-xl hover:border-cyan-400/50 transition-colors min-h-[40px] whitespace-nowrap shrink-0"
                >
                  <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{t.drawer.locateOnMap}</span>
                </button>
              </div>

              {/* Description & Photo */}
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-slate-400 mb-1">
                    {t.drawer.wardAndLandmark}
                  </p>
                  <p className="text-sm font-medium text-slate-100">
                    {issue.wardName} — {issue.landmark}
                  </p>
                  <p className="mt-1 text-xs font-mono tabular-nums text-slate-400">
                    {t.drawer.coordinates} {issue.latitude.toFixed(5)},{' '}
                    {issue.longitude.toFixed(5)} ({t.drawer.illustrativeGrid})
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-400 mb-1">
                    {t.drawer.citizenDescription}
                  </p>
                  <p className="text-sm text-slate-200 leading-relaxed">{issue.description}</p>
                </div>

                {(issue.photoDataUrl || signedPhotoUrl) ? (
                  <div>
                    <p className="text-xs font-medium text-slate-400 mb-1.5">
                      {t.drawer.attachedPhoto}
                    </p>
                    <div className="rounded-xl overflow-hidden border border-sky-400/15 bg-[#050A15]">
                      <img
                        src={issue.photoDataUrl || signedPhotoUrl || ''}
                        alt={`Uploaded evidence for ${issue.id}`}
                        className="w-full max-h-64 object-contain"
                      />
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Smart Priority Transparent Breakdown */}
              <div className="glass-surface rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-cyan-400" aria-hidden="true" />
                    <h3 className="text-sm font-display font-semibold text-slate-100">
                      {t.drawer.smartPriorityTitle}
                    </h3>
                  </div>
                  <span className="text-base font-mono font-semibold tabular-nums text-cyan-300">
                    <AnimatedNumber value={priority.totalScore} /> / 100 · {bandLabel(priority.band)}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-[#070E1D] border border-slate-800/80 space-y-1.5">
                    <p className="text-slate-400">{t.drawer.severityFactor}</p>
                    <p className="font-mono font-semibold tabular-nums text-slate-100">
                      {priority.severityPoints} / 45 pts
                    </p>
                    <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.round((priority.severityPoints / 45) * 100)}%` }}
                        transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
                        className="h-full rounded-full bg-rose-400"
                      />
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#070E1D] border border-slate-800/80 space-y-1.5">
                    <p className="text-slate-400">{t.drawer.impactFactor}</p>
                    <p className="font-mono font-semibold tabular-nums text-slate-100">
                      {priority.impactPoints} / 35 pts
                    </p>
                    <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.round((priority.impactPoints / 35) * 100)}%` }}
                        transition={{ duration: 0.42, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
                        className="h-full rounded-full bg-cyan-400"
                      />
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#070E1D] border border-slate-800/80 space-y-1.5">
                    <p className="text-slate-400">{t.drawer.waitingFactor}</p>
                    <p className="font-mono font-semibold tabular-nums text-slate-100">
                      {priority.waitingPoints} / 20 pts
                    </p>
                    <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.round((priority.waitingPoints / 20) * 100)}%` }}
                        transition={{ duration: 0.42, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                        className="h-full rounded-full bg-amber-400"
                      />
                    </div>
                  </div>
                </div>

                <ul className="space-y-1 text-xs text-slate-300">
                  <li>{priority.severityReason}</li>
                  {priority.impactFactors.map((factor, idx) => (
                    <li key={idx}>• {factor}</li>
                  ))}
                  <li>{priority.waitingReason}</li>
                </ul>
                <p className="text-[11px] text-slate-400">{t.drawer.priorityDisclaimer}</p>
              </div>

              {/* Neighbourhood Insights AI Summary or Graceful Fallback Notice */}
              {issue.aiAnalysis ? (
                <div className="rounded-2xl p-4 space-y-2.5 bg-purple-950/35 border border-purple-400/35">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-purple-300" aria-hidden="true" />
                      <h3 className="text-sm font-display font-semibold text-purple-100">
                        {t.drawer.aiSuggestionTitle}
                      </h3>
                    </div>
                    {issue.aiSuggestionEdited ? (
                      <span className="text-[11px] text-amber-300">{t.drawer.editedByCitizen}</span>
                    ) : null}
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    <strong className="text-white">{t.drawer.whySuggested}</strong>{' '}
                    {issue.aiAnalysis.explanation}
                  </p>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    <strong className="text-white">{t.drawer.possibleImpact}</strong>{' '}
                    {issue.aiAnalysis.publicImpact}
                  </p>
                  <p className="text-xs text-purple-200 leading-relaxed">
                    <strong className="text-purple-100">{t.drawer.nextAction}</strong>{' '}
                    {issue.aiAnalysis.recommendedAction}
                  </p>
                  <p className="text-[11px] text-slate-300">{issue.aiAnalysis.imageAssessment}</p>
                  <p className="text-[11px] text-amber-300/90">{issue.aiAnalysis.disclaimer}</p>
                </div>
              ) : issue.aiUnavailableFallback ? (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-300" aria-hidden="true" />
                  <span>{t.drawer.fallbackNotice}</span>
                </div>
              ) : null}

              {/* Admin Status Update Form */}
              <form onSubmit={handleSave} className="glass-surface rounded-2xl p-4 space-y-4">
                <div>
                  <h3 className="text-sm font-display font-semibold text-slate-100">
                    {t.drawer.adminUpdateTitle}
                  </h3>
                  <p className="text-xs text-slate-400">{t.drawer.adminUpdateSub}</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" role="radiogroup" aria-label={t.map.status}>
                  {STATUS_OPTIONS.map((statusOption) => {
                    const active = nextStatus === statusOption;
                    return (
                      <button
                        key={statusOption}
                        type="button"
                        onClick={() => setNextStatus(statusOption)}
                        className={`py-2.5 px-2.5 rounded-xl text-xs font-medium border transition-all min-h-[42px] whitespace-nowrap ${
                          active
                            ? 'bg-cyan-400/15 border-cyan-400/60 text-cyan-200 shadow-[0_0_16px_rgba(34,211,238,0.18)]'
                            : 'bg-[#070E1D] border-slate-800 text-slate-300 hover:border-slate-600'
                        }`}
                      >
                        {statusLabel(statusOption)}
                      </button>
                    );
                  })}
                </div>

                <div>
                  <label
                    htmlFor="admin-note-input"
                    className="block text-xs font-medium text-slate-300 mb-1.5"
                  >
                    {t.drawer.adminNoteLabel}
                  </label>
                  <textarea
                    id="admin-note-input"
                    rows={3}
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder={t.drawer.adminNotePlaceholder}
                    className="w-full px-3 py-2 rounded-xl bg-[#070E1D] border border-slate-800 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/60"
                  />
                </div>

                <div>
                  <label htmlFor="admin-resolution-photo" className="block text-xs font-medium text-slate-300 mb-1.5">
                    After / Resolution Photo Proof (Optional)
                  </label>
                  <input
                    id="admin-resolution-photo"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        const processed = await processUploadedImage(file);
                        setResolutionPhotoDataUrl(processed.dataUrl);
                      } catch (err) {
                        setNoteError(err instanceof Error ? err.message : 'Invalid image file.');
                      }
                    }}
                    className="w-full text-xs text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-cyan-500/20 file:text-cyan-200 hover:file:bg-cyan-500/30"
                  />
                  {resolutionPhotoDataUrl ? (
                    <p className="mt-1 text-[11px] text-emerald-300">✓ Resolution photo attached</p>
                  ) : null}
                </div>

                {noteError ? (
                  <p className="text-xs text-red-300" role="alert">
                    {noteError}
                  </p>
                ) : null}

                <AnimatePresence>
                  {saveMessage ? (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.16 }}
                      className="flex items-center gap-2 text-xs text-emerald-300"
                      role="status"
                    >
                      <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>{saveMessage}</span>
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                <div className="flex flex-wrap items-center justify-end gap-2.5">
                  {issue.status !== 'Resolved' ? (
                    <button
                      type="button"
                      onClick={handleMarkResolved}
                      className="btn-press inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-500/20 border border-emerald-400/50 text-emerald-200 hover:bg-emerald-500/30 min-h-[44px] whitespace-nowrap shrink-0"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{t.drawer.markResolvedBtn}</span>
                    </button>
                  ) : null}
                  <button
                    type="submit"
                    className="btn-press px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-400 to-sky-500 text-slate-950 hover:from-cyan-300 hover:to-sky-400 min-h-[44px] whitespace-nowrap shrink-0"
                  >
                    {t.drawer.saveUpdateBtn}
                  </button>
                </div>
              </form>

              {/* Visible Status Timeline */}
              <div className="space-y-3">
                <h3 className="text-sm font-display font-semibold text-slate-100">
                  {t.drawer.timelineTitle}
                </h3>
                <ol className="space-y-3 border-l border-sky-400/25 ml-2 pl-4">
                  {issue.timeline.map((entry) => (
                    <li key={entry.id} className="relative space-y-1">
                      <span
                        className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-cyan-400 border-2 border-[#081021]"
                        aria-hidden="true"
                      />
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-semibold text-slate-100">
                          {statusLabel(entry.status)}
                        </span>
                        <span aria-hidden="true" className="text-slate-500">·</span>
                        <span className="text-slate-400">{entry.actor}</span>
                        <span aria-hidden="true" className="text-slate-500">·</span>
                        <span className="inline-flex items-center gap-1 font-mono tabular-nums text-slate-400">
                          <Clock className="w-3 h-3" aria-hidden="true" />
                          {formatDateTime(entry.timestamp)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{entry.note}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
