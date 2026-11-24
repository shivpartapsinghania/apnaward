import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Download, RotateCcw, Search } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import {
  CATEGORY_LABELS,
  CivicIssue,
  ILLUSTRATIVE_WARDS,
  IssueCategory,
  IssueSeverity,
  IssueStatus,
  PriorityBreakdown,
} from '../types/civic';
import { getIssuePriority } from '../utils/priority';
import { formatDateTime, formatRelativeTime } from '../utils/api';
import { SeverityIndicator, StatusIndicator } from './StatusIndicators';

interface IssueManagementPageProps {
  issues: CivicIssue[];
  initialCategoryFilter?: IssueCategory | 'all';
  initialWardFilter?: string;
  initialSearchQuery?: string;
  onClearInitialCategory?: () => void;
  onClearInitialWard?: () => void;
  onClearInitialSearch?: () => void;
  onSelectIssue: (issue: CivicIssue) => void;
}

type SortOption = 'priority_desc' | 'priority_asc' | 'newest' | 'oldest';
type PriorityBandFilter = PriorityBreakdown['band'] | 'all';

export function IssueManagementPage({
  issues,
  initialCategoryFilter = 'all',
  initialWardFilter = 'all',
  initialSearchQuery = '',
  onClearInitialCategory,
  onClearInitialWard,
  onClearInitialSearch,
  onSelectIssue,
}: IssueManagementPageProps) {
  const { t, categoryLabel, categoryShortLabel, statusLabel, severityLabel, bandLabel } =
    useTranslation();

  const [search, setSearch] = useState(initialSearchQuery);
  const [categoryFilter, setCategoryFilter] = useState<IssueCategory | 'all'>(
    initialCategoryFilter
  );
  const [priorityFilter, setPriorityFilter] = useState<PriorityBandFilter>('all');
  const [severityFilter, setSeverityFilter] = useState<IssueSeverity | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<IssueStatus | 'all'>('all');
  const [wardFilter, setWardFilter] = useState<string>(initialWardFilter);
  const [sortBy, setSortBy] = useState<SortOption>('priority_desc');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  useEffect(() => {
    if (initialCategoryFilter && initialCategoryFilter !== 'all') {
      setCategoryFilter(initialCategoryFilter);
      onClearInitialCategory?.();
    }
  }, [initialCategoryFilter, onClearInitialCategory]);

  useEffect(() => {
    if (initialWardFilter && initialWardFilter !== 'all') {
      setWardFilter(initialWardFilter);
      onClearInitialWard?.();
    }
  }, [initialWardFilter, onClearInitialWard]);

  useEffect(() => {
    if (initialSearchQuery) {
      setSearch(initialSearchQuery);
      onClearInitialSearch?.();
    }
  }, [initialSearchQuery, onClearInitialSearch]);

  const statusCounts = useMemo(() => {
    return {
      all: issues.length,
      reported: issues.filter((i) => i.status === 'Reported').length,
      inProgress: issues.filter((i) => i.status === 'In Progress').length,
      resolved: issues.filter((i) => i.status === 'Resolved').length,
    };
  }, [issues]);

  const filteredAndSorted = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = issues
      .map((issue) => ({ issue, priority: getIssuePriority(issue) }))
      .filter(({ issue, priority }) => {
        if (categoryFilter !== 'all' && issue.category !== categoryFilter) return false;
        if (priorityFilter !== 'all' && priority.band !== priorityFilter) return false;
        if (severityFilter !== 'all' && issue.severity !== severityFilter) return false;
        if (statusFilter !== 'all' && issue.status !== statusFilter) return false;
        if (wardFilter !== 'all' && issue.wardId !== wardFilter) return false;
        if (q) {
          const haystack = `${issue.id} ${issue.title} ${issue.landmark} ${issue.description} ${issue.wardName} ${CATEGORY_LABELS[issue.category]} ${categoryLabel(issue.category)}`.toLowerCase();
          if (!haystack.includes(q)) return false;
        }
        return true;
      });

    return list.sort((a, b) => {
      if (sortBy === 'priority_desc') {
        return b.priority.totalScore - a.priority.totalScore;
      }
      if (sortBy === 'priority_asc') {
        return a.priority.totalScore - b.priority.totalScore;
      }
      if (sortBy === 'newest') {
        return Date.parse(b.issue.createdAt) - Date.parse(a.issue.createdAt);
      }
      return Date.parse(a.issue.createdAt) - Date.parse(b.issue.createdAt);
    });
  }, [
    issues,
    search,
    categoryFilter,
    priorityFilter,
    severityFilter,
    statusFilter,
    wardFilter,
    sortBy,
    categoryLabel,
  ]);

  const handleExportCsv = () => {
    const safeCell = (val: string | number) => {
      const str = String(val ?? '').replace(/"/g, '""');
      const guarded = /^[=+\-@]/.test(str) ? `'${str}` : str;
      return `"${guarded}"`;
    };
    const headers = ['Tracking ID', 'Title', 'Category', 'Severity', 'Status', 'Priority Score', 'Ward', 'Landmark', 'Created At'];
    const rows = paginatedRows.map(({ issue, priority }) => [
      safeCell(issue.id),
      safeCell(issue.title),
      safeCell(categoryLabel(issue.category)),
      safeCell(issue.severity),
      safeCell(issue.status),
      safeCell(priority.totalScore),
      safeCell(issue.wardName),
      safeCell(issue.landmark),
      safeCell(issue.createdAt),
    ].join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `apnaward-ward-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetFilters = () => {
    setSearch('');
    setCategoryFilter('all');
    setPriorityFilter('all');
    setSeverityFilter('all');
    setStatusFilter('all');
    setWardFilter('all');
    setSortBy('priority_desc');
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedRows = useMemo(
    () => filteredAndSorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filteredAndSorted, currentPage]
  );

  return (
    <div className="space-y-4">
      {/* Admin Command Center Header + Quick Status Tabs */}
      <div className="glass-surface rounded-2xl p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-mono font-semibold text-amber-300">{t.common.demoData}</span>
            <span aria-hidden="true" className="text-slate-500">·</span>
            <span className="text-slate-400">{t.pageMeta.management.title}</span>
          </div>
          <p className="text-sm font-display font-semibold text-slate-100">
            {t.management.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportCsv}
            className="btn-press inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#070E1D] border border-sky-400/35 text-cyan-200 hover:border-cyan-300 transition-colors min-h-[38px] whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Export CSV</span>
          </button>
          <div className="flex flex-wrap items-center gap-1 p-1 rounded-xl bg-[#070E1D] border border-slate-800 text-xs">
          {(
            [
              { id: 'all', label: `${t.common.all} (${statusCounts.all})` },
              { id: 'Reported', label: `${statusLabel('Reported')} (${statusCounts.reported})` },
              {
                id: 'In Progress',
                label: `${statusLabel('In Progress')} (${statusCounts.inProgress})`,
              },
              { id: 'Resolved', label: `${statusLabel('Resolved')} (${statusCounts.resolved})` },
            ] as const
          ).map((tab) => {
            const active = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`btn-press relative px-3 py-1.5 rounded-lg font-medium transition-colors min-h-[36px] whitespace-nowrap shrink-0 ${
                  active ? 'text-slate-950 font-semibold' : 'text-slate-300 hover:text-white'
                }`}
              >
                {active ? (
                  <motion.span
                    layoutId="admin-status-tab"
                    transition={{ type: 'spring', stiffness: 440, damping: 34 }}
                    className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-400 to-sky-500"
                    aria-hidden="true"
                  />
                ) : null}
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
          </div>
        </div>
      </div>

      {/* Search & Multi-Filter Admin Toolbar */}
      <div className="glass-surface rounded-2xl p-4 sm:p-5 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-3">
          <div className="xl:col-span-2 relative">
            <label htmlFor="mgmt-search" className="sr-only">
              {t.management.searchPlaceholder}
            </label>
            <Search
              className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="mgmt-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.management.searchPlaceholder}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#070E1D] border border-slate-800 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/60 min-h-[42px]"
            />
          </div>

          <div>
            <label htmlFor="mgmt-ward" className="sr-only">
              {t.map.ward}
            </label>
            <select
              id="mgmt-ward"
              value={wardFilter}
              onChange={(e) => setWardFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#070E1D] border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-cyan-400/60 min-h-[42px]"
            >
              <option value="all">{t.management.allWards}</option>
              {ILLUSTRATIVE_WARDS.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.shortName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="mgmt-category" className="sr-only">
              {t.map.category}
            </label>
            <select
              id="mgmt-category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as IssueCategory | 'all')}
              className="w-full px-3 py-2.5 rounded-xl bg-[#070E1D] border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-cyan-400/60 min-h-[42px]"
            >
              <option value="all">{t.management.allCategories}</option>
              {(Object.keys(CATEGORY_LABELS) as IssueCategory[]).map((cat) => (
                <option key={cat} value={cat}>
                  {categoryShortLabel(cat)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="mgmt-priority" className="sr-only">
              {t.management.allPriorityBands}
            </label>
            <select
              id="mgmt-priority"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as PriorityBandFilter)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#070E1D] border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-cyan-400/60 min-h-[42px]"
            >
              <option value="all">{t.management.allPriorityBands}</option>
              <option value="Critical">{bandLabel('Critical')} (82+)</option>
              <option value="High">{bandLabel('High')} (65–81)</option>
              <option value="Elevated">{bandLabel('Elevated')} (45–64)</option>
              <option value="Standard">{bandLabel('Standard')} (&lt;45)</option>
            </select>
          </div>

          <div>
            <label htmlFor="mgmt-sort" className="sr-only">
              {t.management.sortPriorityDesc}
            </label>
            <select
              id="mgmt-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#070E1D] border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-cyan-400/60 min-h-[42px]"
            >
              <option value="priority_desc">{t.management.sortPriorityDesc}</option>
              <option value="priority_asc">{t.management.sortPriorityAsc}</option>
              <option value="newest">{t.management.sortNewest}</option>
              <option value="oldest">{t.management.sortOldest}</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <span>
              {t.management.showing}{' '}
              <strong className="font-mono tabular-nums text-slate-100">
                {filteredAndSorted.length}
              </strong>{' '}
              {t.management.of}{' '}
              <strong className="font-mono tabular-nums text-slate-100">{issues.length}</strong>{' '}
              {t.management.complaints}
            </span>
            <span aria-hidden="true">·</span>
            <select
              aria-label={t.management.allSeverities}
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as IssueSeverity | 'all')}
              className="px-2.5 py-1.5 rounded-lg bg-[#070E1D] border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-400/60 min-h-[36px]"
            >
              <option value="all">{t.management.allSeverities}</option>
              <option value="Critical">{severityLabel('Critical')}</option>
              <option value="High">{severityLabel('High')}</option>
              <option value="Medium">{severityLabel('Medium')}</option>
              <option value="Low">{severityLabel('Low')}</option>
            </select>
          </div>

          <button
            type="button"
            onClick={resetFilters}
            className="btn-press inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0D172B] border border-slate-700/80 text-xs text-slate-300 hover:text-cyan-300 hover:border-cyan-400/40 transition-colors min-h-[38px] whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{t.management.clearFilters}</span>
          </button>
        </div>
      </div>

      {/* Table / Mobile Cards / Empty State */}
      <div className="glass-surface rounded-2xl overflow-hidden">
        {filteredAndSorted.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <p className="text-sm font-medium text-slate-200">{t.management.emptyTitle}</p>
            <p className="text-xs text-slate-400">{t.management.emptySub}</p>
            <button
              type="button"
              onClick={resetFilters}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-400 to-sky-500 text-slate-950 hover:from-cyan-300 hover:to-sky-400 transition-all min-h-[42px]"
            >
              {t.management.resetAll}
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-sky-400/15 bg-[#060B18]/75 text-[11px] font-medium text-slate-400">
                    <th className="py-3.5 px-4">{t.management.colId}</th>
                    <th className="py-3.5 px-4">{t.management.colTitle}</th>
                    <th className="py-3.5 px-4">{t.management.colWard}</th>
                    <th className="py-3.5 px-4">{t.management.colSeverity}</th>
                    <th className="py-3.5 px-4 text-right">{t.management.colPriority}</th>
                    <th className="py-3.5 px-4">{t.management.colStatus}</th>
                    <th className="py-3.5 px-4 text-right">{t.management.colSubmitted}</th>
                    <th className="py-3.5 px-4 text-right">{t.management.colAction}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70 text-xs">
                  {paginatedRows.map(({ issue, priority }) => (
                    <tr
                      key={issue.id}
                      onClick={() => onSelectIssue(issue)}
                      className="hover:bg-sky-500/8 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-semibold text-cyan-300 whitespace-nowrap">
                        <div>{issue.id}</div>
                        <div className="text-[10px] font-sans font-normal text-amber-300/90">
                          {issue.isDemoData ? t.common.demoData : t.common.citizen}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-medium text-slate-100 truncate">{issue.title}</div>
                        <div className="text-slate-400 truncate mt-0.5">
                          {categoryShortLabel(issue.category)} · {issue.landmark}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 whitespace-nowrap">
                        {issue.wardName.replace(' (Demo)', '')}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <SeverityIndicator severity={issue.severity} tone="navy" />
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex flex-col items-end gap-1">
                          <span className="font-mono font-semibold tabular-nums text-slate-100">
                            {priority.totalScore} / 100
                          </span>
                          <div className="w-20 h-1.5 rounded-full bg-slate-800/90 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-sky-400 to-cyan-400"
                              style={{ width: `${priority.totalScore}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {bandLabel(priority.band)}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <StatusIndicator status={issue.status} tone="navy" />
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-400 whitespace-nowrap">
                        <div>{formatDateTime(issue.createdAt)}</div>
                        <div className="text-[10px] text-slate-500">
                          {formatRelativeTime(issue.updatedAt)}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectIssue(issue);
                          }}
                          className="btn-press px-3 py-1.5 rounded-xl bg-[#0D172B] border border-sky-400/20 text-cyan-300 hover:border-cyan-400/50 transition-colors font-medium min-h-[36px]"
                        >
                          {t.management.manageStatus}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List */}
            <div className="md:hidden divide-y divide-slate-800/80">
              {paginatedRows.map(({ issue, priority }) => (
                <button
                  key={issue.id}
                  type="button"
                  onClick={() => onSelectIssue(issue)}
                  className="w-full p-4 text-left hover:bg-slate-800/35 transition-colors space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-semibold text-cyan-300">
                      {issue.id} {issue.isDemoData ? `· ${t.common.demo}` : ''}
                    </span>
                    <StatusIndicator status={issue.status} tone="navy" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-100">{issue.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {categoryShortLabel(issue.category)} · {issue.landmark}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                    <SeverityIndicator severity={issue.severity} tone="navy" />
                    <span className="font-mono tabular-nums text-cyan-300">
                      {t.management.priorityLabel} {priority.totalScore}/100 (
                      {bandLabel(priority.band)})
                    </span>
                    <span className="font-mono tabular-nums text-slate-400">
                      {formatRelativeTime(issue.updatedAt)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
            {totalPages > 1 ? (
              <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-slate-800/80 text-xs text-slate-300">
                <span className="font-mono">
                  Page {currentPage} of {totalPages} ({filteredAndSorted.length} total)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 rounded-lg bg-[#070E1D] border border-slate-700 disabled:opacity-40 hover:border-cyan-400/50"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="px-3 py-1.5 rounded-lg bg-[#070E1D] border border-slate-700 disabled:opacity-40 hover:border-cyan-400/50"
                  >
                    Next
                  </button>
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
