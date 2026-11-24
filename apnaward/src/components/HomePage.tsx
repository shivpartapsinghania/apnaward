import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import { motion } from 'motion/react';
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Compass,
  Cpu,
  Droplets,
  FilePlus2,
  Hammer,
  Lightbulb,
  LayoutDashboard,
  MapPin,
  Pause,
  Play,
  Radar,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Users,
  Waves,
  Wrench,
} from 'lucide-react';
import { HOME_TRANSLATIONS } from '../i18n/homeTranslations';
import { useTranslation } from '../i18n/LanguageContext';
import { CivicIssue, HomeAnchorId, IssueCategory, NavSection } from '../types/civic';
import { getIssuePriority } from '../utils/priority';
import { CommunityParticipationVisual, NeighbourhoodHeroScene } from './ApnaWardVisuals';
import { AnimatedNumber } from './MotionPrimitives';
import { PrefillReportDraft } from './ReportIssuePage';

interface HomePageProps {
  issues: CivicIssue[];
  activeAnchor: HomeAnchorId;
  onSelectAnchor: (anchor: HomeAnchorId) => void;
  onNavigate: (section: NavSection) => void;
  onStartTour: () => void;
  onPrefillReport: (draft: PrefillReportDraft) => void;
}

const SECTION_ANCHORS: HomeAnchorId[] = [
  'home-intro',
  'why-apnaward',
  'how-it-works',
  'ward-glance',
  'platform-features',
  'trust-transparency',
];

const JOURNEY_ICONS = [FilePlus2, Cpu, ShieldAlert, ClipboardList, Compass];

const CATEGORY_CARDS_META: Record<
  IssueCategory,
  { icon: typeof Hammer; iconBg: string; iconText: string; borderHover: string }
> = {
  road_damage: {
    icon: Hammer,
    iconBg: 'bg-sky-50 border-sky-200',
    iconText: 'text-blue-700',
    borderHover: 'hover:border-blue-300',
  },
  garbage: {
    icon: Trash2,
    iconBg: 'bg-emerald-50 border-emerald-200',
    iconText: 'text-emerald-700',
    borderHover: 'hover:border-emerald-300',
  },
  water_leakage: {
    icon: Droplets,
    iconBg: 'bg-cyan-50 border-cyan-200',
    iconText: 'text-cyan-700',
    borderHover: 'hover:border-cyan-300',
  },
  streetlight: {
    icon: Lightbulb,
    iconBg: 'bg-amber-50 border-amber-200',
    iconText: 'text-amber-700',
    borderHover: 'hover:border-amber-300',
  },
  drainage: {
    icon: Waves,
    iconBg: 'bg-indigo-50 border-indigo-200',
    iconText: 'text-indigo-700',
    borderHover: 'hover:border-indigo-300',
  },
  waterlogging: {
    icon: Waves,
    iconBg: 'bg-sky-50 border-sky-200',
    iconText: 'text-sky-700',
    borderHover: 'hover:border-sky-300',
  },
  public_safety: {
    icon: Shield,
    iconBg: 'bg-orange-50 border-orange-200',
    iconText: 'text-orange-700',
    borderHover: 'hover:border-orange-300',
  },
  other: {
    icon: Wrench,
    iconBg: 'bg-slate-50 border-slate-200',
    iconText: 'text-slate-700',
    borderHover: 'hover:border-slate-300',
  },
};

const FEATURE_ICONS: Record<NavSection, typeof LayoutDashboard> = {
  home: ShieldCheck,
  overview: LayoutDashboard,
  map: MapPin,
  report: FilePlus2,
  management: ClipboardList,
  inspector: Cpu,
  command: Radar,
  track: Compass,
  priority: ShieldAlert,
};

function renderProblemIllustration(id: string) {
  switch (id) {
    case 'scattered':
      return (
        <svg viewBox="0 0 120 64" className="w-28 h-16" aria-hidden="true">
          <rect x="8" y="10" width="24" height="16" rx="4" fill="#FFFBEB" stroke="#D97706" strokeOpacity="0.65" />
          <rect x="8" y="38" width="24" height="16" rx="4" fill="#F0F9FF" stroke="#0284C7" strokeOpacity="0.55" />
          <path d="M34 18 L60 32 M34 46 L60 32" stroke="#1D4ED8" strokeWidth="1.6" strokeDasharray="3 3" />
          <rect x="62" y="18" width="48" height="28" rx="6" fill="#0B1B36" stroke="#0EA5E9" strokeWidth="1.6" />
          <rect x="70" y="26" width="32" height="4" rx="2" fill="#38BDF8" />
          <rect x="70" y="34" width="22" height="4" rx="2" fill="#CBD5E1" fillOpacity="0.7" />
        </svg>
      );
    case 'visibility':
      return (
        <svg viewBox="0 0 120 64" className="w-28 h-16" aria-hidden="true">
          <line x1="18" y1="32" x2="102" y2="32" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round" />
          <line x1="18" y1="32" x2="72" y2="32" stroke="#0284C7" strokeWidth="3" strokeLinecap="round" />
          <circle cx="22" cy="32" r="7" fill="#FFFBEB" stroke="#D97706" strokeWidth="2" />
          <circle cx="60" cy="32" r="8" fill="#E0F2FE" stroke="#1D4ED8" strokeWidth="2" />
          <circle cx="60" cy="32" r="3" fill="#1D4ED8" />
          <circle cx="98" cy="32" r="7" fill="#DCFCE7" stroke="#16A34A" strokeWidth="2" />
        </svg>
      );
    case 'prioritizing':
      return (
        <svg viewBox="0 0 120 64" className="w-28 h-16" aria-hidden="true">
          <rect x="14" y="12" width="92" height="10" rx="5" fill="#E2E8F0" />
          <rect x="14" y="12" width="76" height="10" rx="5" fill="#DC2626" fillOpacity="0.88" />
          <rect x="14" y="28" width="92" height="10" rx="5" fill="#E2E8F0" />
          <rect x="14" y="28" width="54" height="10" rx="5" fill="#EA580C" fillOpacity="0.88" />
          <rect x="14" y="44" width="92" height="10" rx="5" fill="#E2E8F0" />
          <rect x="14" y="44" width="32" height="10" rx="5" fill="#0284C7" fillOpacity="0.85" />
        </svg>
      );
    case 'area-insights':
      return (
        <svg viewBox="0 0 120 64" className="w-28 h-16" aria-hidden="true">
          <rect x="12" y="8" width="96" height="48" rx="8" fill="#F0F9FF" stroke="#BAE6FD" />
          <circle cx="48" cy="32" r="16" fill="#0EA5E9" fillOpacity="0.16" stroke="#0284C7" strokeOpacity="0.55" strokeDasharray="3 2" />
          <circle cx="44" cy="28" r="3.5" fill="#DC2626" />
          <circle cx="54" cy="35" r="3.5" fill="#D97706" />
          <circle cx="43" cy="38" r="3" fill="#1D4ED8" />
          <circle cx="86" cy="24" r="3.5" fill="#16A34A" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 120 64" className="w-28 h-16" aria-hidden="true">
          <rect x="14" y="12" width="42" height="40" rx="8" fill="#EFF6FF" stroke="#93C5FD" />
          <text x="35" y="36" textAnchor="middle" fontSize="13" fontWeight="700" fill="#1D4ED8">
            अ/A
          </text>
          <circle cx="86" cy="32" r="16" fill="#E0F2FE" stroke="#38BDF8" />
          <path d="M86 24v8m0 0a3 3 0 0 0 3-3v-1a3 3 0 1 0-6 0v1a3 3 0 0 0 3 3zm-5 1a5 5 0 0 0 10 0m-5 5v3" stroke="#0369A1" strokeWidth="1.6" strokeLinecap="round" fill="none" />
        </svg>
      );
  }
}

export function HomePage({
  issues,
  activeAnchor,
  onSelectAnchor,
  onNavigate,
  onStartTour,
  onPrefillReport,
}: HomePageProps) {
  const { language, categoryLabel, statusLabel } = useTranslation();
  const h = HOME_TRANSLATIONS[language];

  const [selectedJourneyIdx, setSelectedJourneyIdx] = useState(0);
  const [selectedStageIdx, setSelectedStageIdx] = useState(0);
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [scenarioAutoPlay, setScenarioAutoPlay] = useState(false);

  const previewMapRef = useRef<HTMLDivElement | null>(null);
  const leafletPreviewRef = useRef<L.Map | null>(null);
  const previewLayerRef = useRef<L.LayerGroup | null>(null);

  const metrics = useMemo(() => {
    const total = issues.length;
    const demoCount = issues.filter((i) => i.isDemoData).length;
    const citizenCount = total - demoCount;
    const resolved = issues.filter((i) => i.status === 'Resolved').length;
    const open = total - resolved;
    const highPriority = issues.filter(
      (i) => i.status !== 'Resolved' && getIssuePriority(i).totalScore >= 75
    ).length;
    return { total, demoCount, citizenCount, open, resolved, highPriority };
  }, [issues]);

  // Embedded nearby interactive map preview (Section E)
  useEffect(() => {
    if (!previewMapRef.current || leafletPreviewRef.current) return;
    const map = L.map(previewMapRef.current, {
      center: [12.9718, 77.5965],
      zoom: 13,
      zoomControl: true,
      scrollWheelZoom: false,
      attributionControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    const layer = L.layerGroup().addTo(map);
    leafletPreviewRef.current = map;
    previewLayerRef.current = layer;

    const timer = window.setTimeout(() => map.invalidateSize(), 260);
    return () => {
      window.clearTimeout(timer);
      map.remove();
      leafletPreviewRef.current = null;
      previewLayerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = leafletPreviewRef.current;
    const layer = previewLayerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();

    for (const issue of issues) {
      const color =
        issue.status === 'Resolved'
          ? '#16A34A'
          : issue.status === 'In Progress'
            ? '#0284C7'
            : issue.severity === 'Critical'
              ? '#DC2626'
              : issue.severity === 'High'
                ? '#EA580C'
                : '#D97706';

      const marker = L.circleMarker([issue.latitude, issue.longitude], {
        radius: 7.5,
        color: '#FFFFFF',
        weight: 2,
        fillColor: color,
        fillOpacity: 0.92,
      });

      const popup = document.createElement('div');
      popup.className = 'p-3.5 space-y-1.5 text-slate-900 text-xs';

      const topRow = document.createElement('div');
      topRow.className = 'flex items-center justify-between gap-2';
      const idSpan = document.createElement('span');
      idSpan.className = 'font-mono font-bold text-blue-700';
      idSpan.textContent = issue.id;
      const statusSpan = document.createElement('span');
      statusSpan.className = 'font-medium text-slate-600';
      statusSpan.textContent = statusLabel(issue.status);
      topRow.append(idSpan, statusSpan);

      const titleP = document.createElement('p');
      titleP.className = 'font-semibold text-slate-900';
      titleP.textContent = issue.title;

      const metaP = document.createElement('p');
      metaP.className = 'text-[11px] text-slate-600';
      metaP.textContent = `${categoryLabel(issue.category)} · ${issue.wardName.replace(' (Demo)', '')}`;

      popup.append(topRow, titleP, metaP);
      marker.bindPopup(popup);
      marker.addTo(layer);
    }

    if (issues.length > 0) {
      const bounds = L.latLngBounds(
        issues.map((i) => [i.latitude, i.longitude] as [number, number])
      );
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [32, 32], maxZoom: 13 });
      }
    }
  }, [issues, categoryLabel, statusLabel]);

  // Observe visible sections for smooth active anchor indicator
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const elements = SECTION_ANCHORS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => Boolean(el)
    );
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target?.id) {
          onSelectAnchor(visible[0].target.id as HomeAnchorId);
        }
      },
      { rootMargin: '-25% 0px -55% 0px', threshold: [0.1, 0.35, 0.6] }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [onSelectAnchor]);

  // Auto-advance optional demo scenario playback
  useEffect(() => {
    if (!scenarioAutoPlay) return;
    const timer = window.setInterval(() => {
      setScenarioIdx((prev) => (prev + 1) % h.scenario.steps.length);
    }, 3200);
    return () => window.clearInterval(timer);
  }, [scenarioAutoPlay, h.scenario.steps.length]);

  const scrollToSection = (id: HomeAnchorId) => {
    onSelectAnchor(id);
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const activeScenarioStep = h.scenario.steps[scenarioIdx] ?? h.scenario.steps[0];
  const scenarioProgressPct = Math.round(
    ((scenarioIdx + 1) / Math.max(1, h.scenario.steps.length)) * 100
  );

  const handleTrySimilarReport = () => {
    onPrefillReport({
      title:
        language === 'hi'
          ? 'स्टेशन रोड बस स्टॉप के पास गहरा सड़क गड्ढा (डेमो)'
          : 'Deep Road Crater Near Station Road Bus Stop (Demo)',
      category: 'road_damage',
      severity: 'High',
      wardId: 'ward-2',
      landmark:
        language === 'hi'
          ? 'सेंट्रल बस स्टॉप क्रॉसिंग, वार्ड 2'
          : 'Central Bus Stop Crossing, Ward 2',
      description:
        language === 'hi'
          ? 'वार्ड 2 स्टेशन रोड बस स्टॉप के पास मुख्य लेन में गहरा गड्ढा बन गया है, जिससे दोपहिया वाहन चालक अचानक लेन बदलने को मजबूर हैं।'
          : 'Large road crater (~40 cm wide) along the main commuter lane beside Station Road Bus Stop. Two-wheelers and cyclists are forced to swerve suddenly.',
    });
  };

  return (
    <div className="space-y-12 sm:space-y-16">
      {/* Quick Section Anchor Bar */}
      <nav
        aria-label="ApnaWard homepage sections"
        className="hidden md:flex items-center justify-between gap-4 px-4 py-2.5 rounded-2xl citizen-card"
      >
        <div className="flex items-center gap-1 flex-wrap">
          {(
            [
              { id: 'home-intro', label: h.anchors.home },
              { id: 'why-apnaward', label: h.anchors.why },
              { id: 'how-it-works', label: h.anchors.howItWorks },
              { id: 'ward-glance', label: h.anchors.wardGlance },
              { id: 'platform-features', label: h.anchors.features },
              { id: 'trust-transparency', label: h.anchors.trust },
            ] as const
          ).map((item) => {
            const active = activeAnchor === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToSection(item.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-sky-50 text-blue-700 border border-sky-200'
                    : 'text-slate-600 hover:text-slate-950 border border-transparent'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onStartTour}
          className="btn-press inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#0B1B36] text-white hover:bg-[#13294E] whitespace-nowrap shrink-0"
        >
          <Play className="w-3.5 h-3.5 text-cyan-300" aria-hidden="true" />
          <span>{h.hero.tourCta}</span>
        </button>
      </nav>

      {/* HERO SECTION */}
      <section
        id="home-intro"
        className="scroll-mt-24 citizen-card rounded-3xl overflow-hidden relative"
      >
        <div className="h-1 w-full animated-gradient-border" aria-hidden="true" />
        <div className="p-6 sm:p-10 space-y-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
                <span className="font-semibold text-blue-700">{h.hero.brandLine}</span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span className="font-semibold text-amber-700">{h.hero.prototypeNotice}</span>
              </div>

              <h2
                className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-[#0B1B36] leading-[1.12] tracking-tight"
                style={{ textWrap: 'balance' }}
              >
                {h.hero.headline}
              </h2>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                {h.hero.subheadline}
              </p>

              <p className="text-xs font-semibold tracking-wide text-sky-700 uppercase">
                {h.hero.supportLine}
              </p>

              {/* Primary Hero CTAs */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => onNavigate('report')}
                  className="btn-press inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#1D4ED8] to-[#0284C7] text-white hover:brightness-110 shadow-[0_12px_26px_-10px_rgba(29,78,216,0.55)] min-h-[48px] whitespace-nowrap shrink-0"
                >
                  <FilePlus2 className="w-4 h-4" aria-hidden="true" />
                  <span>{h.hero.reportIssueCta}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('map')}
                  className="btn-press inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold bg-sky-50 border border-sky-200 text-[#0B1B36] hover:bg-sky-100 hover:border-sky-300 min-h-[48px] whitespace-nowrap shrink-0"
                >
                  <MapPin className="w-4 h-4 text-blue-700" aria-hidden="true" />
                  <span>{h.hero.exploreWardCta}</span>
                </button>

                <button
                  type="button"
                  onClick={onStartTour}
                  className="btn-press inline-flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-white border border-slate-300 text-slate-700 hover:border-slate-400 hover:text-slate-950 min-h-[48px] whitespace-nowrap shrink-0"
                >
                  <Play className="w-4 h-4 text-blue-700" aria-hidden="true" />
                  <span>{h.hero.tourCta}</span>
                </button>
              </div>
            </div>

            {/* Warm Community Neighbourhood Visual */}
            <div className="lg:col-span-5">
              <NeighbourhoodHeroScene
                caption={
                  language === 'hi'
                    ? 'साझा सड़कें, सक्रिय पड़ोसी और खुला वार्ड संवाद'
                    : 'Everyday streets, engaged neighbours, and open local tracking'
                }
                badgeText={language === 'hi' ? 'मोहल्ला दृश्य' : 'NEIGHBOURHOOD VIEW'}
              />
            </div>
          </div>

          {/* Interactive 5-Stage Community Flow Strip */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
              <span className="font-medium">{h.hero.journeyCaption}</span>
              <span className="font-mono font-semibold text-blue-700">
                {selectedJourneyIdx + 1} / {h.hero.journeyNodes.length}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {h.hero.journeyNodes.map((node, index) => {
                const Icon = JOURNEY_ICONS[index] ?? ShieldCheck;
                const active = selectedJourneyIdx === index;
                const isAiStep = node.id === 'understand';
                return (
                  <button
                    key={node.id}
                    type="button"
                    onClick={() => setSelectedJourneyIdx(index)}
                    className={`text-left p-4 rounded-xl border transition-all flex flex-col gap-2 min-h-[108px] ${
                      active
                        ? isAiStep
                          ? 'bg-purple-50 border-purple-300 shadow-sm'
                          : 'bg-white border-blue-500 shadow-sm'
                        : 'bg-white/80 border-slate-200 hover:border-sky-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`w-8 h-8 rounded-lg flex items-center justify-center border shrink-0 ${
                          isAiStep
                            ? 'bg-purple-100 border-purple-200 text-purple-700'
                            : active
                              ? 'bg-blue-700 border-blue-700 text-white'
                              : 'bg-sky-50 border-sky-200 text-blue-700'
                        }`}
                      >
                        <Icon className="w-4 h-4" aria-hidden="true" />
                      </span>
                      {index < h.hero.journeyNodes.length - 1 ? (
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                      ) : null}
                    </div>
                    <div>
                      <p className="text-xs font-display font-bold text-[#0B1B36]">{node.label}</p>
                      <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                        {node.shortDesc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grounded Live Dataset Snapshot */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200">
              <p className="text-[11px] font-medium text-amber-900">{h.hero.snapshotDemoCount}</p>
              <p className="text-2xl font-display font-bold text-amber-700 mt-1">
                <AnimatedNumber value={metrics.demoCount} />
              </p>
            </div>
            <div className="p-4 rounded-xl bg-sky-50/80 border border-sky-200">
              <p className="text-[11px] font-medium text-sky-900">{h.hero.snapshotCitizenCount}</p>
              <p className="text-2xl font-display font-bold text-blue-700 mt-1">
                <AnimatedNumber value={metrics.citizenCount} />
              </p>
            </div>
            <div className="p-4 rounded-xl bg-orange-50/70 border border-orange-200">
              <p className="text-[11px] font-medium text-orange-900">{h.hero.snapshotOpenQueue}</p>
              <p className="text-2xl font-display font-bold text-orange-700 mt-1">
                <AnimatedNumber value={metrics.open} />
              </p>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200">
              <p className="text-[11px] font-medium text-emerald-900">{h.hero.snapshotResolved}</p>
              <p className="text-2xl font-display font-bold text-emerald-700 mt-1">
                <AnimatedNumber value={metrics.resolved} />
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION A: WELCOME TO APNAWARD */}
      <motion.section
        id="why-apnaward"
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.12 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="scroll-mt-24 space-y-6"
      >
        <div className="max-w-3xl space-y-2">
          <p className="text-[11px] font-mono font-bold text-blue-700 tracking-wide">
            {h.welcome.eyebrow}
          </p>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#0B1B36]">
            {h.welcome.heading}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            {h.welcome.subheading}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {h.welcome.items.map((item, idx) => (
            <div
              key={item.id}
              className={`citizen-card citizen-card-hover rounded-2xl p-5 sm:p-6 flex flex-col justify-between gap-4 ${
                idx === 0 ? 'xl:col-span-2' : ''
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2">
                  <h3 className="text-base sm:text-lg font-display font-bold text-[#0B1B36]">
                    {item.title}
                  </h3>
                  <p className="text-xs font-semibold text-orange-700">{h.welcome.problemLabel}</p>
                  <p className="text-sm text-slate-600 leading-relaxed">{item.problem}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 shrink-0 self-start">
                  {renderProblemIllustration(item.id)}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 space-y-1">
                <p className="text-xs font-semibold text-blue-700">{h.welcome.solutionLabel}</p>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">{item.solution}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* SECTION B: WHAT CAN YOU REPORT? */}
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.12 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-6"
      >
        <div className="max-w-3xl space-y-2">
          <p className="text-[11px] font-mono font-bold text-blue-700 tracking-wide">
            {h.whatToReport.eyebrow}
          </p>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#0B1B36]">
            {h.whatToReport.heading}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            {h.whatToReport.subheading}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {h.whatToReport.categories.map((catItem) => {
            const meta = CATEGORY_CARDS_META[catItem.category];
            const CatIcon = meta.icon;
            return (
              <button
                key={catItem.category}
                type="button"
                onClick={() => onPrefillReport({ category: catItem.category })}
                className={`citizen-card citizen-card-hover ${meta.borderHover} rounded-2xl p-5 text-left flex flex-col justify-between gap-4`}
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${meta.iconBg} ${meta.iconText}`}
                    >
                      <CatIcon className="w-5 h-5" aria-hidden="true" />
                    </span>
                    <h3 className="text-base font-display font-bold text-[#0B1B36]">
                      {catItem.title}
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {catItem.examples}
                  </p>
                </div>

                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700">
                  <span>{catItem.ctaLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </span>
              </button>
            );
          })}
        </div>
      </motion.section>

      {/* SECTION C: HOW IT WORKS + ILLUSTRATIVE SCENARIO */}
      <motion.section
        id="how-it-works"
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.12 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="scroll-mt-24 citizen-card rounded-3xl p-6 sm:p-8 space-y-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="max-w-3xl space-y-2">
            <p className="text-[11px] font-mono font-bold text-blue-700 tracking-wide">
              {h.howItWorks.eyebrow}
            </p>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#0B1B36]">
              {h.howItWorks.heading}
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">{h.howItWorks.subheading}</p>
          </div>
          <p className="text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-lg">
            {h.howItWorks.aiAdvisoryBadge}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
          {h.howItWorks.stages.map((st, index) => {
            const active = selectedStageIdx === index;
            const isAiStage = index === 1;
            return (
              <button
                key={st.stage}
                type="button"
                onClick={() => setSelectedStageIdx(index)}
                className={`text-left p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                  active
                    ? isAiStage
                      ? 'bg-purple-50 border-purple-400 shadow-sm'
                      : 'bg-sky-50 border-blue-500 shadow-sm'
                    : 'bg-slate-50/70 border-slate-200 hover:border-sky-300'
                }`}
              >
                <div className="space-y-1.5">
                  <p
                    className={`text-[11px] font-mono font-semibold ${
                      isAiStage ? 'text-purple-700' : 'text-blue-700'
                    }`}
                  >
                    {st.stage}
                  </p>
                  <h3 className="text-base font-display font-bold text-[#0B1B36]">{st.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{st.description}</p>
                </div>
                <div className="pt-2 border-t border-slate-200 space-y-1">
                  <p className="text-[11px] text-slate-500 leading-relaxed">{st.detail}</p>
                  {st.highlightNote ? (
                    <p className="text-[11px] font-semibold text-purple-700">{st.highlightNote}</p>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>

        <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden" aria-hidden="true">
          <motion.div
            animate={{
              width: `${((selectedStageIdx + 1) / h.howItWorks.stages.length) * 100}%`,
            }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="h-full rounded-full bg-gradient-to-r from-[#1D4ED8] via-[#0284C7] to-[#059669]"
          />
        </div>
      </motion.section>

      {/* ILLUSTRATIVE END-TO-END SCENARIO (AW-DEMO-RD01) */}
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="citizen-card rounded-3xl p-6 sm:p-8 space-y-6 border-amber-200"
      >
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <p className="text-xs font-mono font-semibold text-amber-700">
              {h.scenario.illustrativeLabel}
            </p>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#0B1B36]">
              {h.scenario.heading}
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">{h.scenario.subheading}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setScenarioAutoPlay((v) => !v)}
              className="btn-press inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-50 border border-slate-300 text-slate-700 hover:border-blue-400 min-h-[40px] whitespace-nowrap shrink-0"
            >
              {scenarioAutoPlay ? (
                <>
                  <Pause className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{h.scenario.pauseBtn}</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-blue-700" aria-hidden="true" />
                  <span>{h.scenario.autoPlayBtn}</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleTrySimilarReport}
              className="btn-press inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#1D4ED8] to-[#0284C7] text-white hover:brightness-110 min-h-[40px] whitespace-nowrap shrink-0"
            >
              <FilePlus2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{h.scenario.tryReportBtn}</span>
            </button>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
          <span>{h.scenario.disclaimer}</span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2">
          {h.scenario.steps.map((st, idx) => {
            const active = scenarioIdx === idx;
            return (
              <button
                key={st.id}
                type="button"
                onClick={() => {
                  setScenarioAutoPlay(false);
                  setScenarioIdx(idx);
                }}
                className={`px-2.5 py-2 rounded-xl text-left border transition-all min-h-[54px] ${
                  active
                    ? 'bg-sky-50 border-blue-500 text-[#0B1B36]'
                    : idx < scenarioIdx
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-900'
                }`}
              >
                <span className="block text-[10px] font-mono font-bold text-blue-700">
                  {st.stepNum}
                </span>
                <span className="block text-[11px] font-medium truncate mt-0.5">{st.title}</span>
              </button>
            );
          })}
        </div>

        <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-mono font-semibold text-amber-700">
                  {h.scenario.illustrativeLabel}
                </span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span className="font-mono font-semibold text-blue-700">
                  {h.scenario.stepOf} {scenarioIdx + 1} / {h.scenario.steps.length}
                </span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span className="text-slate-600">{activeScenarioStep.actor}</span>
              </div>
              <h3 className="text-lg sm:text-xl font-display font-bold text-[#0B1B36]">
                {activeScenarioStep.stepNum}. {activeScenarioStep.title}
              </h3>
            </div>

            <span className="text-xs font-mono font-semibold text-blue-700 bg-sky-100 border border-sky-200 px-2.5 py-1 rounded-lg">
              {activeScenarioStep.statusBadge}
            </span>
          </div>

          <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
            <motion.div
              animate={{ width: `${scenarioProgressPct}%` }}
              transition={{ duration: 0.3 }}
              className="h-full rounded-full bg-gradient-to-r from-[#1D4ED8] via-[#0284C7] to-[#16A34A]"
            />
          </div>

          <p className="text-sm text-slate-700 leading-relaxed">{activeScenarioStep.summary}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {activeScenarioStep.metaRows.map((row) => (
              <div
                key={row.label}
                className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1"
              >
                <p className="text-[11px] text-slate-500">{row.label}</p>
                <p className="text-xs sm:text-sm font-semibold text-[#0B1B36]">{row.value}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-200">
            <p className="text-xs text-slate-500">{activeScenarioStep.systemNote}</p>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setScenarioAutoPlay(false);
                  setScenarioIdx((prev) => Math.max(0, prev - 1));
                }}
                disabled={scenarioIdx === 0}
                className="btn-press inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium bg-white border border-slate-300 text-slate-700 disabled:opacity-40 min-h-[40px]"
              >
                <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{h.scenario.prevBtn}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setScenarioAutoPlay(false);
                  setScenarioIdx((prev) =>
                    Math.min(h.scenario.steps.length - 1, prev + 1)
                  );
                }}
                disabled={scenarioIdx === h.scenario.steps.length - 1}
                className="btn-press inline-flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#0B1B36] text-white disabled:opacity-40 min-h-[40px]"
              >
                <span>{h.scenario.nextBtn}</span>
                <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </motion.section>

      {/* SECTION D: YOUR WARD AT A GLANCE (BALANCED DEEP NAVY BAND) */}
      <motion.section
        id="ward-glance"
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.12 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="scroll-mt-24 navy-panel rounded-3xl p-6 sm:p-8 space-y-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="max-w-3xl space-y-2">
            <p className="text-[11px] font-mono font-semibold text-cyan-300 tracking-wide">
              {h.wardGlance.eyebrow}
            </p>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white">
              {h.wardGlance.heading}
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">{h.wardGlance.subheading}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('overview')}
              className="btn-press inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/10 border border-sky-400/30 text-cyan-200 hover:bg-white/15 min-h-[42px]"
            >
              <span>{h.wardGlance.openOpsBtn}</span>
              <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate('command')}
              className="btn-press inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-400 to-sky-500 text-slate-950 hover:brightness-110 min-h-[42px]"
            >
              <span>{h.wardGlance.openAnalyticsBtn}</span>
              <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-[#071329] border border-sky-400/20 space-y-1">
            <p className="text-xs text-slate-300">{h.wardGlance.totalLabel}</p>
            <p className="text-3xl font-display font-bold text-white">
              <AnimatedNumber value={metrics.total} />
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-[#071329] border border-amber-400/25 space-y-1">
            <p className="text-xs text-amber-200">{h.wardGlance.pendingLabel}</p>
            <p className="text-3xl font-display font-bold text-amber-300">
              <AnimatedNumber value={metrics.open} />
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-[#071329] border border-orange-400/25 space-y-1">
            <p className="text-xs text-orange-200">{h.wardGlance.highPriorityLabel}</p>
            <p className="text-3xl font-display font-bold text-orange-300">
              <AnimatedNumber value={metrics.highPriority} />
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-[#071329] border border-emerald-400/25 space-y-1">
            <p className="text-xs text-emerald-200">{h.wardGlance.resolvedLabel}</p>
            <p className="text-3xl font-display font-bold text-emerald-300">
              <AnimatedNumber value={metrics.resolved} />
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-300">{h.wardGlance.demoNote}</p>
      </motion.section>

      {/* SECTION E: SEE WHAT IS HAPPENING NEARBY (INTERACTIVE MINI-MAP PREVIEW) */}
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.12 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="citizen-card rounded-3xl p-6 sm:p-8 space-y-5"
      >
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="max-w-3xl space-y-2">
            <p className="text-[11px] font-mono font-bold text-blue-700 tracking-wide">
              {h.nearbyMap.eyebrow}
            </p>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#0B1B36]">
              {h.nearbyMap.heading}
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">{h.nearbyMap.subheading}</p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('map')}
            className="btn-press inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#1D4ED8] to-[#0284C7] text-white hover:brightness-110 min-h-[44px] whitespace-nowrap shrink-0 self-start lg:self-auto"
          >
            <MapPin className="w-4 h-4" aria-hidden="true" />
            <span>{h.nearbyMap.exploreMapCta}</span>
          </button>
        </div>

        <div
          ref={previewMapRef}
          className="w-full h-72 sm:h-80 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100"
          aria-label={h.nearbyMap.heading}
        />

        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-600 border border-white shadow-xs" />
              <span>{h.nearbyMap.legendReported}</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-sky-600 border border-white shadow-xs" />
              <span>{h.nearbyMap.legendInProgress}</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-600 border border-white shadow-xs" />
              <span>{h.nearbyMap.legendResolved}</span>
            </span>
          </div>
          <span className="text-[11px] text-slate-500">{h.nearbyMap.attributionNote}</span>
        </div>
      </motion.section>

      {/* SECTION F: YOUR VOICE MATTERS */}
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.12 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 space-y-2">
            <p className="text-[11px] font-mono font-bold text-blue-700 tracking-wide">
              {h.yourVoice.eyebrow}
            </p>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#0B1B36]">
              {h.yourVoice.heading}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              {h.yourVoice.subheading}
            </p>
          </div>
          <div className="lg:col-span-5">
            <CommunityParticipationVisual label={h.yourVoice.heading} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {h.yourVoice.roles.map((role, idx) => {
            const RoleIcon = idx === 0 ? Users : idx === 1 ? ClipboardList : BarChart3;
            return (
              <div
                key={role.id}
                className="citizen-card citizen-card-hover rounded-2xl p-6 flex flex-col justify-between gap-5"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-blue-700 shrink-0">
                      <RoleIcon className="w-5 h-5" aria-hidden="true" />
                    </span>
                    <h3 className="text-lg font-display font-bold text-[#0B1B36]">{role.role}</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {role.summary}
                  </p>
                  <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                    {role.benefits.map((b) => (
                      <li key={b} className="flex items-start gap-2">
                        <CheckCircle2
                          className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5"
                          aria-hidden="true"
                        />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigate(role.targetSection)}
                  className="btn-press w-full inline-flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-sky-50 border border-sky-200 text-[#0B1B36] hover:bg-sky-100 hover:border-sky-300 min-h-[44px]"
                >
                  <span>{role.actionLabel}</span>
                  <ArrowUpRight className="w-4 h-4 text-blue-700 shrink-0" aria-hidden="true" />
                </button>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-slate-500">{h.yourVoice.nonOfficialNote}</p>
      </motion.section>

      {/* SECTION G: EXPLORE THE PLATFORM */}
      <motion.section
        id="platform-features"
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.08 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="scroll-mt-24 space-y-6"
      >
        <div className="max-w-3xl space-y-2">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#0B1B36]">
            {h.features.heading}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            {h.features.subheading}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {h.features.cards.map((card, idx) => {
            const Icon = FEATURE_ICONS[card.section] ?? Compass;
            const isAiCard = card.id === 'inspector';
            return (
              <div
                key={card.id}
                className={`citizen-card citizen-card-hover rounded-2xl p-6 flex flex-col justify-between gap-5 ${
                  idx === 6 ? 'md:col-span-2 xl:col-span-3' : ''
                } ${isAiCard ? 'border-purple-200' : ''}`}
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
                        isAiCard
                          ? 'bg-purple-50 border-purple-200 text-purple-700'
                          : 'bg-sky-50 border-sky-200 text-blue-700'
                      }`}
                    >
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </span>
                    <h3 className="text-lg font-display font-bold text-[#0B1B36]">{card.title}</h3>
                  </div>

                  <div className="space-y-2.5 text-xs sm:text-sm">
                    <div>
                      <p
                        className={`text-[11px] font-semibold ${
                          isAiCard ? 'text-purple-700' : 'text-blue-700'
                        }`}
                      >
                        {h.features.purposeLabel}
                      </p>
                      <p className="text-slate-700 leading-relaxed mt-0.5">{card.purpose}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-slate-500">
                        {h.features.usefulLabel}
                      </p>
                      <p className="text-slate-600 leading-relaxed mt-0.5">{card.whyUseful}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <p className="text-[11px] font-semibold text-[#0B1B36]">
                        {h.features.exampleLabel}
                      </p>
                      <p className="text-xs text-slate-600 leading-relaxed mt-0.5">
                        {card.example}
                      </p>
                    </div>
                    {card.disclaimer ? (
                      <p className="text-[11px] font-semibold text-purple-700">{card.disclaimer}</p>
                    ) : null}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigate(card.section)}
                  className={`btn-press inline-flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold min-h-[44px] self-start sm:self-stretch ${
                    isAiCard
                      ? 'bg-purple-50 border border-purple-200 text-purple-800 hover:bg-purple-100'
                      : 'bg-sky-50 border border-sky-200 text-[#0B1B36] hover:bg-sky-100'
                  }`}
                >
                  <span>{card.openButton}</span>
                  <ArrowUpRight className="w-4 h-4 shrink-0" aria-hidden="true" />
                </button>
              </div>
            );
          })}
        </div>
      </motion.section>

      {/* COMMUNITY TRUST & TRANSPARENCY */}
      <motion.section
        id="trust-transparency"
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.12 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="scroll-mt-24 citizen-card rounded-3xl p-6 sm:p-8 space-y-6"
      >
        <div className="max-w-3xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-blue-700">
            <ShieldCheck className="w-4 h-4" aria-hidden="true" />
            <span>{h.trust.eyebrow}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#0B1B36]">
            {h.trust.heading}
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">{h.trust.subheading}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {h.trust.questions.map((q) => (
            <div
              key={q.title}
              className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2"
            >
              <h3 className="text-sm font-display font-bold text-[#0B1B36]">{q.title}</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{q.body}</p>
            </div>
          ))}
        </div>

        <div className="pt-5 border-t border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-display font-bold text-[#0B1B36]">
              {h.trust.bottomCtaTitle}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">{h.trust.bottomCtaSub}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onStartTour}
              className="btn-press inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white border border-slate-300 text-[#0B1B36] hover:border-slate-400 min-h-[44px] whitespace-nowrap shrink-0"
            >
              <Play className="w-3.5 h-3.5 text-blue-700" aria-hidden="true" />
              <span>{h.hero.tourCta}</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('report')}
              className="btn-press inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#1D4ED8] to-[#0284C7] text-white hover:brightness-110 min-h-[44px] whitespace-nowrap shrink-0"
            >
              <span>{h.hero.reportIssueCta}</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
