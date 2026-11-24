import { AlertOctagon, AlertTriangle, CheckCircle2, Clock, RotateCcw, ShieldAlert, UserCheck, Wrench, XCircle } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import { IssueSeverity, IssueStatus } from '../types/civic';

type SurfaceTone = 'light' | 'navy';

export function SeverityIndicator({
  severity,
  tone = 'light',
}: {
  severity: IssueSeverity;
  tone?: SurfaceTone;
}) {
  const { severityLabel } = useTranslation();
  const label = severityLabel(severity);

  if (severity === 'Critical') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold whitespace-nowrap shrink-0 border ${
          tone === 'navy'
            ? 'bg-red-500/20 border-red-400/50 text-red-200'
            : 'bg-red-50 border-red-200 text-red-700'
        }`}
      >
        <AlertOctagon
          className={`w-3.5 h-3.5 ${tone === 'navy' ? 'text-red-400' : 'text-red-600'}`}
          aria-hidden="true"
        />
        <span>{label}</span>
      </span>
    );
  }
  if (severity === 'High') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold whitespace-nowrap shrink-0 border ${
          tone === 'navy'
            ? 'bg-orange-500/18 border-orange-400/45 text-orange-200'
            : 'bg-orange-50 border-orange-200 text-orange-700'
        }`}
      >
        <AlertTriangle
          className={`w-3.5 h-3.5 ${tone === 'navy' ? 'text-orange-400' : 'text-orange-600'}`}
          aria-hidden="true"
        />
        <span>{label}</span>
      </span>
    );
  }
  if (severity === 'Medium') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium whitespace-nowrap shrink-0 border ${
          tone === 'navy'
            ? 'bg-amber-500/16 border-amber-400/40 text-amber-200'
            : 'bg-amber-50 border-amber-200 text-amber-800'
        }`}
      >
        <ShieldAlert
          className={`w-3.5 h-3.5 ${tone === 'navy' ? 'text-amber-300' : 'text-amber-600'}`}
          aria-hidden="true"
        />
        <span>{label}</span>
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium whitespace-nowrap shrink-0 border ${
        tone === 'navy'
          ? 'bg-emerald-500/16 border-emerald-400/35 text-emerald-200'
          : 'bg-emerald-50 border-emerald-200 text-emerald-700'
      }`}
    >
      <CheckCircle2
        className={`w-3.5 h-3.5 ${tone === 'navy' ? 'text-emerald-400' : 'text-emerald-600'}`}
        aria-hidden="true"
      />
      <span>{label}</span>
    </span>
  );
}

export function StatusIndicator({
  status,
  tone = 'light',
}: {
  status: IssueStatus;
  tone?: SurfaceTone;
}) {
  const { statusLabel } = useTranslation();
  const label = statusLabel(status);

  if (status === 'Resolved') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap shrink-0 border ${
          tone === 'navy'
            ? 'bg-emerald-500/18 border-emerald-400/40 text-emerald-200'
            : 'bg-emerald-50 border-emerald-200 text-emerald-700'
        }`}
      >
        <CheckCircle2
          className={`w-3.5 h-3.5 ${tone === 'navy' ? 'text-emerald-400' : 'text-emerald-600'}`}
          aria-hidden="true"
        />
        <span>{label}</span>
      </span>
    );
  }
  if (status === 'In Progress') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap shrink-0 border ${
          tone === 'navy'
            ? 'bg-cyan-500/18 border-cyan-400/45 text-cyan-200'
            : 'bg-sky-50 border-sky-200 text-sky-800'
        }`}
      >
        <Wrench
          className={`w-3.5 h-3.5 ${tone === 'navy' ? 'text-cyan-300' : 'text-blue-600'}`}
          aria-hidden="true"
        />
        <span>{label}</span>
      </span>
    );
  }
  if (status === 'Assigned' || status === 'Under Review') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap shrink-0 border ${
          tone === 'navy'
            ? 'bg-blue-500/18 border-blue-400/45 text-blue-200'
            : 'bg-blue-50 border-blue-200 text-blue-800'
        }`}
      >
        <UserCheck
          className={`w-3.5 h-3.5 ${tone === 'navy' ? 'text-blue-300' : 'text-blue-600'}`}
          aria-hidden="true"
        />
        <span>{label}</span>
      </span>
    );
  }
  if (status === 'Rejected') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap shrink-0 border ${
          tone === 'navy'
            ? 'bg-red-500/18 border-red-400/45 text-red-200'
            : 'bg-red-50 border-red-200 text-red-700'
        }`}
      >
        <XCircle
          className={`w-3.5 h-3.5 ${tone === 'navy' ? 'text-red-300' : 'text-red-600'}`}
          aria-hidden="true"
        />
        <span>{label}</span>
      </span>
    );
  }
  if (status === 'Reopened') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap shrink-0 border ${
          tone === 'navy'
            ? 'bg-orange-500/18 border-orange-400/45 text-orange-200'
            : 'bg-orange-50 border-orange-200 text-orange-800'
        }`}
      >
        <RotateCcw
          className={`w-3.5 h-3.5 ${tone === 'navy' ? 'text-orange-300' : 'text-orange-600'}`}
          aria-hidden="true"
        />
        <span>{label}</span>
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap shrink-0 border ${
        tone === 'navy'
          ? 'bg-amber-500/16 border-amber-400/40 text-amber-200'
          : 'bg-amber-50 border-amber-200 text-amber-800'
      }`}
    >
      <Clock
        className={`w-3.5 h-3.5 ${tone === 'navy' ? 'text-amber-300' : 'text-amber-600'}`}
        aria-hidden="true"
      />
      <span>{label}</span>
    </span>
  );
}
