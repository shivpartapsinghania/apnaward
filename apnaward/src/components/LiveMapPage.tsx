import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import L from 'leaflet';
import {
  AlertCircle,
  Check,
  ChevronDown,
  ChevronUp,
  Droplets,
  Flame,
  Hammer,
  Lightbulb,
  List,
  Map as MapIcon,
  RotateCcw,
  Search,
  Shield,
  SlidersHorizontal,
  Trash2,
  Waves,
  Wrench,
} from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import {
  CATEGORY_LABELS,
  CivicIssue,
  ILLUSTRATIVE_WARDS,
  IssueCategory,
  IssueSeverity,
  IssueStatus,
} from '../types/civic';
import { detectHotspots } from '../utils/hotspots';
import { getIssuePriority } from '../utils/priority';

export interface MapFocusArea {
  lat: number;
  lng: number;
  label?: string;
}

interface LiveMapPageProps {
  issues: CivicIssue[];
  focusedIssueId?: string | null;
  focusedArea?: MapFocusArea | null;
  onSelectIssue: (issue: CivicIssue) => void;
  onClearFocus?: () => void;
}

const SEVERITY_STYLES: Record<
  IssueSeverity,
  { fill: string; border: string; glow: string }
> = {
  Critical: {
    fill: '#DC2626',
    border: '#FEE2E2',
    glow: '0 0 0 4px rgba(220, 38, 38, 0.30), 0 4px 12px rgba(15, 23, 42, 0.35)',
  },
  High: {
    fill: '#EA580C',
    border: '#FFEDD5',
    glow: '0 0 0 3px rgba(234, 88, 12, 0.28), 0 4px 12px rgba(15, 23, 42, 0.32)',
  },
  Medium: {
    fill: '#D97706',
    border: '#FEF3C7',
    glow: '0 0 0 3px rgba(217, 119, 6, 0.25), 0 4px 12px rgba(15, 23, 42, 0.30)',
  },
  Low: {
    fill: '#16A34A',
    border: '#DCFCE7',
    glow: '0 0 0 3px rgba(22, 163, 74, 0.22), 0 4px 12px rgba(15, 23, 42, 0.28)',
  },
};

const CATEGORY_MARKER_SVG: Record<IssueCategory, string> = {
  road_damage:
    '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19 8 5"/><path d="M16 5l4 14"/><path d="M12 6v3"/><path d="M12 13v2"/><path d="M12 18v2"/></svg>',
  garbage:
    '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M6 6l1 14h10l1-14"/></svg>',
  water_leakage:
    '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>',
  streetlight:
    '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg>',
  drainage:
    '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 8c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/><path d="M2 14c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/><path d="M2 20c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/></svg>',
  waterlogging:
    '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/><path d="M2 18c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/></svg>',
  public_safety:
    '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>',
  other:
    '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>',
};

const CATEGORY_ICON_MAP: Record<IssueCategory, typeof Hammer> = {
  road_damage: Hammer,
  garbage: Trash2,
  water_leakage: Droplets,
  streetlight: Lightbulb,
  drainage: Waves,
  waterlogging: Waves,
  public_safety: Shield,
  other: Wrench,
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function LiveMapPage({
  issues,
  focusedIssueId,
  focusedArea,
  onSelectIssue,
  onClearFocus,
}: LiveMapPageProps) {
  const { language, t, categoryLabel, categoryShortLabel, statusLabel, severityLabel } =
    useTranslation();

  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<IssueCategory | 'all'>('all');
  const [wardFilter, setWardFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<IssueSeverity | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<IssueStatus | 'all'>('all');
  const [showHotspots, setShowHotspots] = useState(true);
  const [filtersExpanded, setFiltersExpanded] = useState(true);
  const [tilesFailed, setTilesFailed] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const hotspotsLayerRef = useRef<L.LayerGroup | null>(null);
  const onSelectIssueRef = useRef(onSelectIssue);
  onSelectIssueRef.current = onSelectIssue;

  const filteredIssues = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return issues.filter((issue) => {
      if (categoryFilter !== 'all' && issue.category !== categoryFilter) return false;
      if (wardFilter !== 'all' && issue.wardId !== wardFilter) return false;
      if (severityFilter !== 'all' && issue.severity !== severityFilter) return false;
      if (statusFilter !== 'all' && issue.status !== statusFilter) return false;
      if (q) {
        const text = `${issue.id} ${issue.title} ${issue.landmark} ${issue.wardName} ${issue.description} ${CATEGORY_LABELS[issue.category]} ${categoryLabel(issue.category)}`.toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });
  }, [issues, searchQuery, categoryFilter, wardFilter, severityFilter, statusFilter, categoryLabel]);

  const detectedHotspots = useMemo(
    () => detectHotspots(filteredIssues, { radiusMeters: 450, minCount: 2 }),
    [filteredIssues]
  );

  useEffect(() => {
    if (viewMode !== 'map' || tilesFailed) return;
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [12.9718, 77.5965],
      zoom: 13,
      zoomControl: false,
      attributionControl: true,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    });

    let errorCount = 0;
    tileLayer.on('tileerror', () => {
      errorCount += 1;
      if (errorCount >= 4) {
        setTilesFailed(true);
      }
    });
    tileLayer.on('tileload', () => {
      errorCount = 0;
    });

    tileLayer.addTo(map);

    const hotspotsLayer = L.layerGroup().addTo(map);
    const markersLayer = L.layerGroup().addTo(map);
    mapRef.current = map;
    hotspotsLayerRef.current = hotspotsLayer;
    markersLayerRef.current = markersLayer;

    const resizeTimer = window.setTimeout(() => {
      map.invalidateSize();
    }, 240);

    const observer =
      typeof ResizeObserver !== 'undefined' && mapContainerRef.current
        ? new ResizeObserver(() => map.invalidateSize())
        : null;
    if (observer && mapContainerRef.current) {
      observer.observe(mapContainerRef.current);
    }

    return () => {
      window.clearTimeout(resizeTimer);
      observer?.disconnect();
      map.remove();
      mapRef.current = null;
      hotspotsLayerRef.current = null;
      markersLayerRef.current = null;
    };
  }, [viewMode, tilesFailed]);

  useEffect(() => {
    const map = mapRef.current;
    const markersLayer = markersLayerRef.current;
    const hotspotsLayer = hotspotsLayerRef.current;
    if (!map || !markersLayer || !hotspotsLayer || viewMode !== 'map' || tilesFailed) return;

    const hsPopupTitle =
      language === 'hi' ? 'ध्यान देने योग्य क्षेत्र' : 'Area Needing Attention';
    const hsPopupNote =
      language === 'hi'
        ? 'केवल नज़दीकी रिपोर्ट का समूह — वास्तविक स्थिति की मानव जाँच आवश्यक है।'
        : 'Proximity cluster of nearby reports — illustrative analytical grouping only.';
    const popupBtnLabel =
      language === 'hi' ? 'विवरण देखें व स्थिति बदलें' : 'Open Details & Update Status';

    hotspotsLayer.clearLayers();
    if (showHotspots) {
      for (const hs of detectedHotspots) {
        const isSevere = hs.highestSeverity === 'Critical' || hs.highestSeverity === 'High';
        const circle = L.circle([hs.centerLat, hs.centerLng], {
          radius: hs.radiusMeters,
          color: isSevere ? '#EA580C' : '#0284C7',
          weight: 1.8,
          dashArray: '5 5',
          fillColor: isSevere ? '#EA580C' : '#0284C7',
          fillOpacity: 0.12,
        });

        const hsPopup = document.createElement('div');
        hsPopup.className = 'p-3.5 space-y-1.5 text-xs text-slate-900';
        hsPopup.innerHTML = `
          <div class="flex items-center justify-between gap-2">
            <span class="font-bold text-blue-700">${escapeHtml(hsPopupTitle)}</span>
            <span class="font-mono font-semibold text-slate-700">${hs.complaintCount} ${escapeHtml(t.command.complaintsCount)}</span>
          </div>
          <p class="font-bold text-[#0B1B36]">${escapeHtml(hs.areaName)}</p>
          <p class="text-slate-600">${escapeHtml(categoryLabel(hs.dominantCategory))} · ${escapeHtml(severityLabel(hs.highestSeverity))}</p>
          <p class="text-[11px] text-amber-700 pt-1 border-t border-slate-200">${escapeHtml(hsPopupNote)}</p>
        `;
        circle.bindPopup(hsPopup);
        circle.addTo(hotspotsLayer);
      }
    }

    markersLayer.clearLayers();
    const markerById = new Map<string, L.Marker>();

    for (const issue of filteredIssues) {
      const style = SEVERITY_STYLES[issue.severity] ?? SEVERITY_STYLES.Medium;
      const priority = getIssuePriority(issue);
      const size =
        issue.severity === 'Critical'
          ? 30
          : issue.severity === 'High'
            ? 28
            : 26;

      const statusClass =
        issue.status === 'In Progress'
          ? 'ww-marker-inprogress'
          : issue.status === 'Resolved'
            ? 'ww-marker-resolved'
            : '';

      const badgeHtml =
        issue.status === 'In Progress'
          ? `<span class="ww-marker-state-badge" style="background:#0284C7;color:#FFFFFF;" title="${escapeHtml(statusLabel('In Progress'))}"><svg viewBox="0 0 24 24" width="8" height="8" fill="none" stroke="currentColor" stroke-width="3"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg></span>`
          : issue.status === 'Resolved'
            ? `<span class="ww-marker-state-badge" style="background:#16A34A;color:#FFFFFF;" title="${escapeHtml(statusLabel('Resolved'))}"><svg viewBox="0 0 24 24" width="8" height="8" fill="none" stroke="currentColor" stroke-width="3.2"><polyline points="20 6 9 17 4 12"/></svg></span>`
            : '';

      const categorySvg = CATEGORY_MARKER_SVG[issue.category] ?? CATEGORY_MARKER_SVG.public_safety;

      const icon = L.divIcon({
        className: '',
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        popupAnchor: [0, -size / 2],
        html: `<div class="ww-marker-wrapper" style="width:${size}px;height:${size}px;"><div class="ww-marker-pin ${statusClass}" style="width:${size}px;height:${size}px;background:${style.fill};border:2px solid ${style.border};box-shadow:${style.glow};">${categorySvg}</div>${badgeHtml}</div>`,
      });

      const marker = L.marker([issue.latitude, issue.longitude], { icon });

      const popupEl = document.createElement('div');
      popupEl.className = 'p-4 space-y-2.5 text-slate-900';
      popupEl.innerHTML = `
        <div class="flex items-center justify-between gap-2 text-xs">
          <span class="font-mono font-bold text-blue-700">${escapeHtml(issue.id)}</span>
          <span class="text-[11px] font-medium text-slate-600">${issue.isDemoData ? 'DEMO DATA · ' : ''}${escapeHtml(statusLabel(issue.status))}</span>
        </div>
        <div>
          <p class="text-sm font-bold text-[#0B1B36]">${escapeHtml(issue.title)}</p>
          <p class="text-xs font-medium text-blue-700 mt-0.5">${escapeHtml(categoryLabel(issue.category))}</p>
          <p class="text-xs text-slate-600 mt-0.5">${escapeHtml(issue.wardName)} · ${escapeHtml(issue.landmark)}</p>
        </div>
        <div class="flex items-center justify-between gap-2 pt-2 border-t border-slate-200 text-xs">
          <span class="text-slate-600">${escapeHtml(t.map.severity)}: <strong class="text-[#0B1B36]">${escapeHtml(severityLabel(issue.severity))}</strong></span>
          <span class="font-mono text-blue-700 font-bold">${escapeHtml(t.management.priorityLabel)} ${priority.totalScore}/100</span>
        </div>
        <button
          type="button"
          data-open-issue="${escapeHtml(issue.id)}"
          class="w-full mt-1 py-2.5 px-3 rounded-lg bg-gradient-to-r from-[#1D4ED8] to-[#0284C7] text-white font-semibold text-xs hover:brightness-110 transition-all cursor-pointer"
        >
          ${escapeHtml(popupBtnLabel)}
        </button>
      `;

      const btn = popupEl.querySelector('button[data-open-issue]');
      if (btn) {
        btn.addEventListener('click', () => {
          onSelectIssueRef.current(issue);
        });
      }

      marker.bindPopup(popupEl);
      marker.addTo(markersLayer);
      markerById.set(issue.id, marker);
    }

    if (focusedIssueId) {
      const targetMarker = markerById.get(focusedIssueId);
      const targetIssue = filteredIssues.find((i) => i.id === focusedIssueId);
      if (targetMarker && targetIssue) {
        map.setView([targetIssue.latitude, targetIssue.longitude], 15, { animate: true });
        targetMarker.openPopup();
        onClearFocus?.();
      }
    } else if (focusedArea) {
      map.setView([focusedArea.lat, focusedArea.lng], 15, { animate: true });
      onClearFocus?.();
    } else if (filteredIssues.length > 0) {
      const bounds = L.latLngBounds(
        filteredIssues.map((i) => [i.latitude, i.longitude] as [number, number])
      );
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [44, 44], maxZoom: 14 });
      }
    }
  }, [
    filteredIssues,
    detectedHotspots,
    showHotspots,
    focusedIssueId,
    focusedArea,
    viewMode,
    tilesFailed,
    onClearFocus,
    language,
    t,
    categoryLabel,
    statusLabel,
    severityLabel,
  ]);

  const resetFilters = () => {
    setSearchQuery('');
    setCategoryFilter('all');
    setWardFilter('all');
    setSeverityFilter('all');
    setStatusFilter('all');
  };

  const activeFilterCount =
    (searchQuery.trim() ? 1 : 0) +
    (categoryFilter !== 'all' ? 1 : 0) +
    (wardFilter !== 'all' ? 1 : 0) +
    (severityFilter !== 'all' ? 1 : 0) +
    (statusFilter !== 'all' ? 1 : 0);

  const showListFallback = viewMode === 'list' || tilesFailed;

  const filterControlsMarkup = (
    <div
      className={`rounded-2xl p-3.5 sm:p-4 space-y-3 ${
        !showListFallback ? 'glass-floating' : 'citizen-card'
      }`}
      onMouseDown={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 text-xs">
          <span className="inline-flex items-center gap-1.5 font-display font-bold text-[#0B1B36]">
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-700" aria-hidden="true" />
            <span>{t.map.filtersTitle}</span>
          </span>
          {activeFilterCount > 0 ? (
            <span className="px-2 py-0.5 rounded-md bg-sky-50 border border-sky-200 text-[11px] font-mono font-bold text-blue-700 tabular-nums">
              {activeFilterCount} {t.map.activeCount}
            </span>
          ) : null}
          <span className="font-mono tabular-nums text-slate-600">
            · {filteredIssues.length}/{issues.length} {t.map.shownCount}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {activeFilterCount > 0 ? (
            <button
              type="button"
              onClick={resetFilters}
              className="btn-press inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 border border-slate-300 text-[11px] text-slate-700 hover:text-blue-700 hover:border-blue-300 transition-colors min-h-[34px] whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-3 h-3" aria-hidden="true" />
              <span>{t.map.reset}</span>
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setFiltersExpanded((v) => !v)}
            aria-expanded={filtersExpanded}
            className="btn-press inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-sky-50 border border-sky-200 text-[11px] font-semibold text-[#0B1B36] hover:bg-sky-100 transition-colors min-h-[34px] whitespace-nowrap shrink-0"
          >
            <span>{filtersExpanded ? t.map.collapse : t.map.expand}</span>
            {filtersExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {filtersExpanded ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5 items-end pt-1">
              <div className="lg:col-span-2 relative">
                <label htmlFor="map-search" className="block text-[11px] font-medium text-slate-600 mb-1">
                  {t.map.searchMap}
                </label>
                <div className="relative">
                  <Search
                    className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    id="map-search"
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.map.searchPlaceholder}
                    className="w-full pl-8.5 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 min-h-[40px] transition-all"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="map-filter-ward" className="block text-[11px] font-medium text-slate-600 mb-1">
                  {t.map.ward}
                </label>
                <select
                  id="map-filter-ward"
                  value={wardFilter}
                  onChange={(e) => setWardFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600 min-h-[40px] transition-all"
                >
                  <option value="all">{t.map.allWards}</option>
                  {ILLUSTRATIVE_WARDS.map((ward) => (
                    <option key={ward.id} value={ward.id}>
                      {ward.shortName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="map-filter-category" className="block text-[11px] font-medium text-slate-600 mb-1">
                  {t.map.category}
                </label>
                <select
                  id="map-filter-category"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value as IssueCategory | 'all')}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600 min-h-[40px] transition-all"
                >
                  <option value="all">{t.map.allCategories}</option>
                  {(Object.keys(CATEGORY_LABELS) as IssueCategory[]).map((cat) => (
                    <option key={cat} value={cat}>
                      {categoryLabel(cat)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="map-filter-status" className="block text-[11px] font-medium text-slate-600 mb-1">
                  {t.map.status}
                </label>
                <select
                  id="map-filter-status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as IssueStatus | 'all')}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600 min-h-[40px] transition-all"
                >
                  <option value="all">{t.map.allStatuses}</option>
                  <option value="Reported">{statusLabel('Reported')}</option>
                  <option value="In Progress">{statusLabel('In Progress')}</option>
                  <option value="Resolved">{statusLabel('Resolved')}</option>
                </select>
              </div>

              <div>
                <label htmlFor="map-filter-severity" className="block text-[11px] font-medium text-slate-600 mb-1">
                  {t.map.severity}
                </label>
                <select
                  id="map-filter-severity"
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value as IssueSeverity | 'all')}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600 min-h-[40px] transition-all"
                >
                  <option value="all">{t.map.allSeverities}</option>
                  <option value="Critical">{severityLabel('Critical')}</option>
                  <option value="High">{severityLabel('High')}</option>
                  <option value="Medium">{severityLabel('Medium')}</option>
                  <option value="Low">{severityLabel('Low')}</option>
                </select>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header & View Toggle */}
      <div className="citizen-card rounded-2xl p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-mono font-bold text-amber-700">{t.common.demoData}</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="text-slate-600">{t.map.subtitle}</span>
          </div>
          <p className="text-sm font-display font-bold text-[#0B1B36]">
            {t.pageMeta.map.title} (Leaflet + OpenStreetMap)
          </p>
          <p className="text-xs text-slate-500">{t.map.disclaimer}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <button
            type="button"
            onClick={() => setShowHotspots((v) => !v)}
            className={`btn-press inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-colors min-h-[42px] whitespace-nowrap shrink-0 ${
              showHotspots
                ? 'bg-orange-50 border-orange-300 text-orange-800'
                : 'bg-slate-50 border-slate-300 text-slate-700 hover:border-slate-400'
            }`}
          >
            <Flame className="w-3.5 h-3.5" aria-hidden="true" />
            <span>
              {t.map.hotspotZones} ({detectedHotspots.length})
            </span>
          </button>

          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setTilesFailed(false);
                setViewMode('map');
              }}
              className={`btn-press inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors min-h-[36px] whitespace-nowrap shrink-0 ${
                viewMode === 'map' && !tilesFailed
                  ? 'bg-gradient-to-r from-[#1D4ED8] to-[#0284C7] text-white'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{t.map.mapView}</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`btn-press inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors min-h-[36px] whitespace-nowrap shrink-0 ${
                viewMode === 'list' || tilesFailed
                  ? 'bg-gradient-to-r from-[#1D4ED8] to-[#0284C7] text-white'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              <List className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{t.map.listView}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className={showListFallback ? 'block' : 'md:hidden'}>
        {filterControlsMarkup}
      </div>

      {/* Tile Error Fallback Banner */}
      {tilesFailed ? (
        <div
          className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-wrap items-center justify-between gap-3 text-xs text-amber-900"
          role="alert"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" aria-hidden="true" />
            <span>{t.map.tileFallbackBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setTilesFailed(false);
              setViewMode('map');
            }}
            className="btn-press px-3 py-1.5 rounded-lg bg-amber-500 text-white font-semibold hover:bg-amber-600 min-h-[38px]"
          >
            {t.map.retryTiles}
          </button>
        </div>
      ) : null}

      {/* Map Viewport with Floating Filter Panel + Map Legend */}
      {!showListFallback ? (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-stretch">
          <div className="xl:col-span-9 citizen-card rounded-2xl overflow-hidden flex flex-col relative">
            <div className="hidden md:block md:absolute md:top-3 md:left-3 md:right-3 md:z-[450]">
              {filterControlsMarkup}
            </div>

            <div
              ref={mapContainerRef}
              className="w-full h-[500px] sm:h-[560px] lg:h-[640px] flex-1"
              aria-label={t.pageMeta.map.title}
            />
            <div className="px-4 py-3 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
              <span>{t.map.footerHint}</span>
              <span>
                {t.map.mapData}{' '}
                <a
                  href="https://www.openstreetmap.org/copyright"
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-700 font-semibold hover:underline"
                >
                  &copy; OpenStreetMap contributors
                </a>
              </span>
            </div>
          </div>

          {/* Dedicated Map Legend Panel */}
          <aside className="xl:col-span-3 citizen-card rounded-2xl p-5 space-y-5 flex flex-col justify-between">
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-display font-bold text-[#0B1B36]">
                  {t.map.legendTitle}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{t.map.legendSub}</p>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-[#0B1B36]">{t.map.categoryIcons}</p>
                <div className="grid grid-cols-2 xl:grid-cols-1 gap-2 text-xs">
                  {(Object.keys(CATEGORY_LABELS) as IssueCategory[]).map((cat) => {
                    const Icon = CATEGORY_ICON_MAP[cat];
                    return (
                      <div key={cat} className="flex items-center gap-2.5 text-slate-700">
                        <span className="w-6 h-6 rounded-full bg-sky-50 border border-sky-200 flex items-center justify-center text-blue-700 shrink-0">
                          <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                        </span>
                        <span>{categoryLabel(cat)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2 pt-3 border-t border-slate-200">
                <p className="text-xs font-semibold text-[#0B1B36]">{t.map.workflowStates}</p>
                <div className="space-y-2 text-xs text-slate-700">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-600 border-2 border-amber-100 inline-block shrink-0" />
                    <span>{t.map.reportedState}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="relative w-5 h-5 rounded-full bg-sky-600 border-2 border-sky-100 outline-2 outline-dashed outline-sky-600 outline-offset-2 inline-flex items-center justify-center shrink-0">
                      <Wrench className="w-2.5 h-2.5 text-white" aria-hidden="true" />
                    </span>
                    <span>{t.map.inProgressState}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 border-2 border-emerald-100 inline-flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-white" aria-hidden="true" />
                    </span>
                    <span>{t.map.resolvedState}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-3 border-t border-slate-200">
                <p className="text-xs font-semibold text-[#0B1B36]">{t.map.severityColors}</p>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-700">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-600 border border-red-200" />
                    {severityLabel('Critical')}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-orange-600 border border-orange-200" />
                    {severityLabel('High')}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-amber-600 border border-amber-200" />
                    {severityLabel('Medium')}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-emerald-600 border border-emerald-200" />
                    {severityLabel('Low')}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 pt-3 border-t border-slate-200 leading-relaxed">
              {t.map.legendFooter}
            </p>
          </aside>
        </div>
      ) : (
        <div className="citizen-card rounded-2xl overflow-hidden">
          {filteredIssues.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <p className="text-sm font-semibold text-[#0B1B36]">{t.map.noMatchesTitle}</p>
              <p className="text-xs text-slate-500">{t.map.noMatchesSub}</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {filteredIssues.map((issue) => {
                const priority = getIssuePriority(issue);
                return (
                  <div
                    key={issue.id}
                    className="p-4 hover:bg-sky-50/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="font-mono font-bold text-blue-700">{issue.id}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-[#0B1B36] font-medium">
                          {categoryShortLabel(issue.category)}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">
                          {issue.latitude.toFixed(4)}, {issue.longitude.toFixed(4)}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-[#0B1B36]">{issue.title}</p>
                      <p className="text-xs text-slate-600 truncate">
                        {issue.wardName} · {issue.landmark}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs font-mono font-bold tabular-nums text-blue-700">
                        {t.management.priorityLabel} {priority.totalScore}/100
                      </span>
                      <span className="text-xs font-medium text-slate-700">
                        {statusLabel(issue.status)}
                      </span>
                      <button
                        type="button"
                        onClick={() => onSelectIssue(issue)}
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-sky-50 border border-sky-200 text-[#0B1B36] hover:bg-sky-100 transition-colors min-h-[40px] whitespace-nowrap shrink-0"
                      >
                        {t.common.inspect}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
