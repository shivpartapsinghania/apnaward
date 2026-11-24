import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, MotionConfig } from 'motion/react';
import {
  Bell,
  BookOpen,
  ChevronDown,
  ClipboardList,
  Compass,
  Cpu,
  FilePlus2,
  Globe,
  HelpCircle,
  Home,
  Info,
  Layers,
  LayoutDashboard,
  MapPin,
  Menu,
  Play,
  Presentation,
  Radar,
  RotateCcw,
  Search,
  ShieldAlert,
  X,
} from 'lucide-react';
import { AiInspectorPage } from './components/AiInspectorPage';
import { ApnaWardLogo } from './components/ApnaWardLogo';
import { CitizenOnboardingModal } from './components/CitizenOnboardingModal';
import { CloudAccountModal } from './components/CloudAccountModal';
import { CommandCenterPage } from './components/CommandCenterPage';
import { ComplaintTrackingPage } from './components/ComplaintTrackingPage';
import { GuidedProductTour } from './components/GuidedProductTour';
import { HomePage } from './components/HomePage';
import { IssueDetailDrawer } from './components/IssueDetailDrawer';
import { IssueManagementPage } from './components/IssueManagementPage';
import { JudgePresentationModal } from './components/JudgePresentationModal';
import { LiveMapPage, MapFocusArea } from './components/LiveMapPage';
import { ToastNotice, ToastViewport } from './components/MotionPrimitives';
import { OverviewPage } from './components/OverviewPage';
import { PrefillReportDraft, ReportIssuePage } from './components/ReportIssuePage';
import { SmartPriorityPage } from './components/SmartPriorityPage';
import { HOME_TRANSLATIONS, JudgeChapterItem } from './i18n/homeTranslations';
import { LanguageProvider, useTranslation } from './i18n/LanguageContext';
import {
  AIInspectionResult,
  CATEGORY_LABELS,
  CivicIssue,
  HomeAnchorId,
  IssueCategory,
  IssueSeverity,
  IssueStatus,
  NavSection,
} from './types/civic';
import { formatRelativeTime } from './utils/api';
import { enqueueOfflineIssue, loadOfflineQueue, removeOfflineIssue } from './utils/offlineQueue';
import type { IndiaLocationRecord } from './data/indiaLocations';
import type { UserProfile } from './types/civic';
import { cloudConfigured, createCloudIssue, fetchCloudIssues, fetchCloudLocations, fetchCloudProfile, getCloudUser, signOutCloud, updateCloudIssueStatus } from './utils/cloud';
import { getIssuePriority } from './utils/priority';
import {
  appendStatusUpdate,
  generateUniqueIssueId,
  loadIssues,
  resetDemoIssues,
  saveIssues,
} from './utils/storage';

const ONBOARDING_STORAGE_KEY = 'apnaward_onboarding_v1';

interface NavConfigItem {
  id: NavSection;
  icon: typeof LayoutDashboard;
}

const COMMUNITY_NAV_ITEMS: NavConfigItem[] = [
  { id: 'report', icon: FilePlus2 },
  { id: 'track', icon: Compass },
  { id: 'map', icon: MapPin },
  { id: 'inspector', icon: Cpu },
];

const OPERATIONS_NAV_ITEMS: NavConfigItem[] = [
  { id: 'overview', icon: LayoutDashboard },
  { id: 'command', icon: Radar },
  { id: 'management', icon: ClipboardList },
  { id: 'priority', icon: ShieldAlert },
];

interface StoryNavItem {
  anchor: HomeAnchorId;
  key: 'home' | 'whyApnaWard' | 'howItWorks' | 'platformFeatures' | 'about';
  icon: typeof Home;
}

const STORY_NAV_ITEMS: StoryNavItem[] = [
  { anchor: 'home-intro', key: 'home', icon: Home },
  { anchor: 'why-apnaward', key: 'whyApnaWard', icon: BookOpen },
  { anchor: 'how-it-works', key: 'howItWorks', icon: Play },
  { anchor: 'platform-features', key: 'platformFeatures', icon: Layers },
  { anchor: 'trust-transparency', key: 'about', icon: Info },
];

function ApnaWardShell() {
  const { language, setLanguage, t, statusLabel } = useTranslation();

  const [issues, setIssues] = useState<CivicIssue[]>(() => loadIssues());
  const [activeSection, setActiveSection] = useState<NavSection>('home');
  const [activeHomeAnchor, setActiveHomeAnchor] = useState<HomeAnchorId>('home-intro');
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [trackedIssueId, setTrackedIssueId] = useState<string | null>(null);
  const [inspectorSampleIssueId, setInspectorSampleIssueId] = useState<string | null>(null);
  const [mapFocusIssueId, setMapFocusIssueId] = useState<string | null>(null);
  const [mapFocusArea, setMapFocusArea] = useState<MapFocusArea | null>(null);
  const [managementCategoryFilter, setManagementCategoryFilter] = useState<
    IssueCategory | 'all'
  >('all');
  const [managementWardFilter, setManagementWardFilter] = useState<string>('all');
  const [managementSearchPreset, setManagementSearchPreset] = useState<string>('');
  const [prefillDraft, setPrefillDraft] = useState<PrefillReportDraft | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState<boolean>(false);
  const [tourOpen, setTourOpen] = useState<boolean>(false);
  const [tourStep, setTourStep] = useState<number>(0);
  const [judgeDemoOpen, setJudgeDemoOpen] = useState<boolean>(false);
  const [judgeChapter, setJudgeChapter] = useState<number>(0);
  const [judgePausedForLive, setJudgePausedForLive] = useState<boolean>(false);

  // Top bar interactive controls & toast notifications
  const [globalSearch, setGlobalSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [confirmProfileReset, setConfirmProfileReset] = useState(false);
  const [cloudAccountOpen, setCloudAccountOpen] = useState(false);
  const [cloudEmail, setCloudEmail] = useState<string | null>(() => getCloudUser()?.email ?? null);
  const [cloudProfile, setCloudProfile] = useState<UserProfile | null>(null);
  const [cloudLocations, setCloudLocations] = useState<IndiaLocationRecord[]>([]);
  const [offlineOutboxCount, setOfflineOutboxCount] = useState<number>(() => loadOfflineQueue().length);
  const [toasts, setToasts] = useState<ToastNotice[]>([]);

  const issuesRef = useRef<CivicIssue[]>(issues);
  issuesRef.current = issues;
  const searchBoxRef = useRef<HTMLDivElement | null>(null);
  const notifBoxRef = useRef<HTMLDivElement | null>(null);
  const profileBoxRef = useRef<HTMLDivElement | null>(null);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const pushToast = useCallback((notice: Omit<ToastNotice, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev.slice(-3), { ...notice, id }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 4200);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (searchBoxRef.current && !searchBoxRef.current.contains(target)) {
        setSearchFocused(false);
      }
      if (notifBoxRef.current && !notifBoxRef.current.contains(target)) {
        setNotificationsOpen(false);
      }
      if (profileBoxRef.current && !profileBoxRef.current.contains(target)) {
        setProfileOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSearchFocused(false);
        setNotificationsOpen(false);
        setProfileOpen(false);
        setMobileNavOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleEscape);
    };
  }, []);

  useEffect(() => {
    if (!cloudConfigured) return;
    let active = true;
    fetchCloudLocations()
      .then((locs) => { if (active && locs.length > 0) setCloudLocations(locs); })
      .catch(() => undefined);

    if (!getCloudUser()) return () => { active = false; };

    fetchCloudProfile()
      .then((prof) => { if (active) setCloudProfile(prof); })
      .catch(() => undefined);

    fetchCloudIssues().then((cloudIssues) => {
      if (!active || cloudIssues.length === 0) return;
      setIssues((current) => {
        const demos = current.filter((item) => item.isDemoData);
        const localOnly = current.filter((item) => !item.isDemoData && !cloudIssues.some((cloud) => cloud.id === item.id));
        const merged = [...cloudIssues, ...localOnly, ...demos];
        issuesRef.current = merged;
        saveIssues(merged);
        return merged;
      });
    }).catch((error) => console.warn('ApnaWard cloud sync unavailable:', error));
    return () => { active = false; };
  }, [cloudEmail]);

  const selectedIssue = useMemo(
    () => issues.find((i) => i.id === selectedIssueId) ?? null,
    [issues, selectedIssueId]
  );

  const openCount = useMemo(
    () => issues.filter((i) => i.status !== 'Resolved').length,
    [issues]
  );

  const highPriorityAlerts = useMemo(() => {
    return issues
      .filter((i) => i.status !== 'Resolved')
      .map((issue) => ({ issue, priority: getIssuePriority(issue) }))
      .sort((a, b) => b.priority.totalScore - a.priority.totalScore)
      .slice(0, 5);
  }, [issues]);

  const urgentCount = useMemo(
    () =>
      issues.filter(
        (i) =>
          i.status !== 'Resolved' &&
          (i.severity === 'Critical' ||
            i.severity === 'High' ||
            getIssuePriority(i).totalScore >= 75)
      ).length,
    [issues]
  );

  const globalSearchMatches = useMemo(() => {
    const q = globalSearch.trim().toLowerCase();
    if (!q) return [];
    return issues
      .filter((i) => {
        const text = `${i.id} ${i.title} ${i.landmark} ${i.wardName} ${i.description} ${CATEGORY_LABELS[i.category]} ${t.categories[i.category]}`.toLowerCase();
        return text.includes(q);
      })
      .slice(0, 6);
  }, [issues, globalSearch, t.categories]);

  const handleNavigate = useCallback((section: NavSection) => {
    setActiveSection(section);
    setMobileNavOpen(false);
    setNotificationsOpen(false);
    setProfileOpen(false);
    if (section === 'home') {
      setActiveHomeAnchor('home-intro');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleNavigateHomeAnchor = useCallback(
    (anchor: HomeAnchorId) => {
      setActiveHomeAnchor(anchor);
      setMobileNavOpen(false);
      setNotificationsOpen(false);
      setProfileOpen(false);
      if (activeSection !== 'home') {
        setActiveSection('home');
        window.setTimeout(() => {
          const el = document.getElementById(anchor);
          el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 220);
      } else {
        const el = document.getElementById(anchor);
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },
    [activeSection]
  );

  const applyTourStep = useCallback(
    (stepIdx: number) => {
      const clamped = Math.max(0, Math.min(5, stepIdx));
      setTourStep(clamped);

      const sampleAiIssue =
        issues.find((i) => i.id === 'AW-2026-002') ??
        issues.find((i) => Boolean(i.aiAnalysis)) ??
        issues[0];
      const sampleTrackIssue =
        issues.find((i) => i.id === 'AW-2026-001') ?? issues[0];

      switch (clamped) {
        case 0:
          setActiveSection('overview');
          break;
        case 1:
          setMapFocusArea(null);
          setMapFocusIssueId(sampleAiIssue?.id ?? null);
          setActiveSection('map');
          break;
        case 2:
          setPrefillDraft({
            title:
              language === 'hi'
                ? 'स्टेशन रोड बस स्टॉप के पास सड़क क्षति (ILLUSTRATIVE DEMO)'
                : 'Deep Road Crater Near Station Road Bus Stop (ILLUSTRATIVE DEMO)',
            category: 'road_damage',
            severity: 'High',
            wardId: 'ward-2',
            landmark:
              language === 'hi'
                ? 'सेंट्रल बस स्टॉप, वार्ड 2 (डेमो)'
                : 'Central Bus Stop Crossing, Ward 2 (Demo)',
            description:
              language === 'hi'
                ? 'वार्ड 2 स्टेशन रोड बस स्टॉप के पास मुख्य लेन में गहरा गड्ढा है। यह टूर के लिए एक उदाहरणात्मक डेमो ड्राफ़्ट है।'
                : 'Deep road crater (~45 cm wide) near Station Road Bus Stop forcing two-wheelers to swerve. This is an illustrative demo draft loaded by the product tour.',
          });
          setActiveSection('report');
          break;
        case 3:
          if (sampleAiIssue) {
            setInspectorSampleIssueId(sampleAiIssue.id);
          }
          setActiveSection('inspector');
          break;
        case 4:
          if (sampleTrackIssue) {
            setTrackedIssueId(sampleTrackIssue.id);
          }
          setActiveSection('track');
          break;
        case 5:
        default:
          setActiveSection('command');
          break;
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [issues, language]
  );

  const handleStartTour = useCallback(() => {
    setMobileNavOpen(false);
    setNotificationsOpen(false);
    setProfileOpen(false);
    setOnboardingOpen(false);
    setJudgeDemoOpen(false);
    setJudgePausedForLive(false);
    setTourOpen(true);
    applyTourStep(0);
  }, [applyTourStep]);

  const handleOpenJudgeDemo = useCallback(() => {
    setMobileNavOpen(false);
    setNotificationsOpen(false);
    setProfileOpen(false);
    setOnboardingOpen(false);
    setTourOpen(false);
    setJudgePausedForLive(false);
    setJudgeChapter(0);
    setJudgeDemoOpen(true);
  }, []);

  const handleJudgeAction = useCallback(
    (
      actionType:
        | JudgeChapterItem['actionType']
        | NonNullable<JudgeChapterItem['secondaryActionType']>
    ) => {
      const sampleAiIssue =
        issuesRef.current.find((i) => i.id === 'AW-2026-002') ??
        issuesRef.current.find((i) => Boolean(i.aiAnalysis)) ??
        issuesRef.current[0];
      const sampleTrackIssue =
        issuesRef.current.find((i) => i.id === 'AW-2026-001') ?? issuesRef.current[0];

      const isFinalFinish = judgeChapter === 6 && actionType === 'command';
      setJudgeDemoOpen(false);
      setJudgePausedForLive(!isFinalFinish);

      switch (actionType) {
        case 'why':
          handleNavigateHomeAnchor('why-apnaward');
          return;
        case 'how':
          handleNavigateHomeAnchor('how-it-works');
          return;
        case 'report':
          setActiveSection('report');
          break;
        case 'track':
          if (sampleTrackIssue) {
            setTrackedIssueId(sampleTrackIssue.id);
          }
          setActiveSection('track');
          break;
        case 'inspector':
          if (sampleAiIssue) {
            setInspectorSampleIssueId(sampleAiIssue.id);
          }
          setActiveSection('inspector');
          break;
        case 'map':
          setMapFocusArea(null);
          if (sampleAiIssue) {
            setMapFocusIssueId(sampleAiIssue.id);
          }
          setActiveSection('map');
          break;
        case 'drawer':
          setActiveSection('management');
          if (sampleAiIssue) {
            setSelectedIssueId(sampleAiIssue.id);
          }
          break;
        case 'priority':
          setActiveSection('priority');
          break;
        case 'command':
        default:
          setActiveSection('command');
          break;
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [handleNavigateHomeAnchor, judgeChapter]
  );

  const handleCompleteOnboarding = useCallback(
    (nextAction?: 'report' | 'track') => {
      try {
        window.localStorage.setItem(ONBOARDING_STORAGE_KEY, 'done');
      } catch {
        // ignore storage error
      }
      setOnboardingOpen(false);
      if (nextAction === 'report') {
        setActiveSection('report');
      } else if (nextAction === 'track') {
        setActiveSection('track');
      }
    },
    []
  );

  const handleCreateIssue = useCallback(
    async (data: {
      title: string;
      category: IssueCategory;
      severity: IssueSeverity;
      locationId?: string;
      stateCode?: string;
      districtName?: string;
      cityName?: string;
      wardId: string;
      wardName: string;
      localityName?: string;
      landmark: string;
      description: string;
      latitude: number;
      longitude: number;
      photoDataUrl?: string;
      aiAnalysis?: AIInspectionResult;
      aiSuggestionEdited: boolean;
      aiUnavailableFallback?: boolean;
    }): Promise<CivicIssue> => {
      const nowMs = Date.now();
      const recentDuplicate = issuesRef.current.find((existing) => {
        if (existing.wardId !== data.wardId) return false;
        if (
          existing.title.trim().toLowerCase() !== data.title.trim().toLowerCase() ||
          existing.description.trim().toLowerCase() !== data.description.trim().toLowerCase()
        ) {
          return false;
        }
        const createdMs = new Date(existing.createdAt).getTime();
        return Number.isFinite(createdMs) && Math.abs(nowMs - createdMs) < 10_000;
      });
      if (recentDuplicate) {
        return recentDuplicate;
      }

      const now = new Date(nowMs).toISOString();
      const id = generateUniqueIssueId(issuesRef.current);
      const isCloudSession = Boolean(cloudConfigured && getCloudUser());
      const createdIssue: CivicIssue = {
        id,
        title: data.title,
        category: data.category,
        severity: data.severity,
        status: isCloudSession ? 'Submitted' : 'Reported',
        locationId: data.locationId,
        stateCode: data.stateCode,
        districtName: data.districtName,
        cityName: data.cityName,
        wardId: data.wardId,
        wardName: data.wardName,
        localityName: data.localityName,
        landmark: data.landmark,
        description: data.description,
        latitude: data.latitude,
        longitude: data.longitude,
        photoDataUrl: data.photoDataUrl,
        isDemoData: !isCloudSession,
        createdAt: now,
        updatedAt: now,
        aiAnalysis: data.aiAnalysis,
        aiSuggestionEdited: data.aiSuggestionEdited,
        aiUnavailableFallback: data.aiUnavailableFallback,
        timeline: [
          {
            id: `tl-${nowMs}-${Math.random().toString(36).slice(2, 6)}`,
            status: isCloudSession ? 'Submitted' : 'Reported',
            timestamp: now,
            actor: 'Resident Report',
            note: data.aiAnalysis
              ? 'Report submitted with AI-assisted understanding (suggestion only).'
              : data.aiUnavailableFallback
                ? 'Report submitted with manual category selection (AI helper unavailable).'
                : 'Report submitted by neighbour for ward review.',
          },
        ],
      };

      let finalIssue = createdIssue;
      if (isCloudSession) {
        try {
          finalIssue = await createCloudIssue(createdIssue);
        } catch (cloudErr) {
          const isNetworkErr = typeof navigator !== 'undefined' && !navigator.onLine;
          if (isNetworkErr) {
            const nextQueue = enqueueOfflineIssue(createdIssue);
            setOfflineOutboxCount(nextQueue.length);
            pushToast({
              title: 'Saved to Offline Outbox',
              description: 'Network is offline. This draft is saved locally and NOT yet in the cloud.',
              tone: 'warning',
            });
            return createdIssue;
          }
          throw cloudErr;
        }
      }

      const nextList = [finalIssue, ...issuesRef.current];
      issuesRef.current = nextList;
      setIssues((prev) => {
        const merged = prev.some((item) => item.id === finalIssue.id)
          ? prev
          : [finalIssue, ...prev];
        saveIssues(merged);
        return merged;
      });

      pushToast({
        title: `${t.toasts.createdTitlePrefix} ${createdIssue.id} ${t.toasts.createdTitleSuffix}`,
        description: finalIssue.evidenceWarning || t.toasts.createdDesc,
        tone: finalIssue.evidenceWarning ? 'warning' : 'success',
      });

      return finalIssue;
    },
    [pushToast, t.toasts]
  );

  const handleUpdateStatus = useCallback(
    async (issueId: string, newStatus: IssueStatus, note: string, resolutionPhotoDataUrl?: string) => {
      const previousIssue = issuesRef.current.find((issue) => issue.id === issueId);
      if (cloudConfigured && getCloudUser() && previousIssue && !previousIssue.isDemoData) {
        await updateCloudIssueStatus(issueId, newStatus);
      }
      setIssues((prev) => {
        const next = prev.map((issue) => {
          if (issue.id !== issueId) return issue;
          const updated = appendStatusUpdate(issue, newStatus, note);
          return resolutionPhotoDataUrl ? { ...updated, resolutionPhotoDataUrl } : updated;
        });
        saveIssues(next);
        return next;
      });
      pushToast({
        title: `${issueId} ${t.toasts.updatedMiddle} ${statusLabel(newStatus)}`,
        description: t.toasts.updatedDesc,
        tone: 'info',
      });
    },
    [pushToast, statusLabel, t.toasts]
  );

  const handleResetDemoData = useCallback(() => {
    const fresh = resetDemoIssues();
    setIssues(fresh);
    setSelectedIssueId(null);
    setProfileOpen(false);
    setConfirmProfileReset(false);
    pushToast({
      title: t.toasts.resetTitle,
      description: `${t.toasts.resetDescPrefix ? `${t.toasts.resetDescPrefix} ` : ''}${fresh.length} ${t.toasts.resetDescSuffix}`,
      tone: 'warning',
    });
  }, [pushToast, t.toasts]);

  const handleFilterCategoryFromOverview = useCallback((category: IssueCategory) => {
    setManagementCategoryFilter(category);
    setActiveSection('management');
  }, []);

  const handleFilterWardFromCommand = useCallback((wardId: string) => {
    setManagementWardFilter(wardId);
    setActiveSection('management');
  }, []);

  const handleLocateHotspotOnMap = useCallback((area: MapFocusArea) => {
    setMapFocusIssueId(null);
    setMapFocusArea(area);
    setActiveSection('map');
  }, []);

  const handleViewOnMap = useCallback((issue: CivicIssue) => {
    setSelectedIssueId(null);
    setMapFocusArea(null);
    setMapFocusIssueId(issue.id);
    setActiveSection('map');
  }, []);

  const handleVerifyIssue = useCallback((issueId: string) => {
    setIssues((prev) => {
      const next = prev.map((issue) =>
        issue.id === issueId
          ? { ...issue, communityVerifications: (issue.communityVerifications ?? 0) + 1 }
          : issue
      );
      saveIssues(next);
      return next;
    });
    pushToast({
      title: `Verified ${issueId}`,
      description: 'Community verification recorded — priority score updated.',
      tone: 'success',
    });
  }, [pushToast]);

  const handleTrackIssueById = useCallback((issueId: string) => {
    setTrackedIssueId(issueId);
    setActiveSection('track');
  }, []);

  const handlePrefillReport = useCallback((draft: PrefillReportDraft) => {
    setPrefillDraft(draft);
    setActiveSection('report');
  }, []);

  const handleGlobalSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = globalSearch.trim();
    if (!q) return;
    if (/^(?:aw|ww)-\d{4}-\d+/i.test(q)) {
      setTrackedIssueId(q.toUpperCase());
      setSearchFocused(false);
      setActiveSection('track');
      return;
    }
    setManagementSearchPreset(q);
    setSearchFocused(false);
    setActiveSection('management');
  };

  const pageMeta = t.pageMeta[activeSection];

  const renderLanguageSelector = (layoutPrefix: string) => (
    <div
      className="inline-flex items-center gap-0.5 p-1 rounded-xl bg-slate-100 border border-slate-200"
      role="group"
      aria-label={t.common.languageLabel}
    >
      <Globe className="w-3.5 h-3.5 text-[#0284C7] ml-1.5 mr-1 shrink-0 hidden sm:block" aria-hidden="true" />
      {(
        [
          { code: 'en', label: 'EN' },
          { code: 'hi', label: 'हिंदी' },
        ] as const
      ).map((opt) => {
        const active = language === opt.code;
        return (
          <button
            key={opt.code}
            type="button"
            onClick={() => setLanguage(opt.code)}
            aria-pressed={active}
            className={`btn-press relative px-2.5 py-1.5 rounded-lg text-xs font-medium min-h-[32px] transition-colors whitespace-nowrap shrink-0 ${
              active ? 'text-white font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {active ? (
              <motion.span
                layoutId={`${layoutPrefix}-lang-pill`}
                transition={{ type: 'spring', stiffness: 430, damping: 32 }}
                className="absolute inset-0 rounded-lg bg-[#1D4ED8] shadow-xs"
                aria-hidden="true"
              />
            ) : null}
            <span className="relative z-10">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen text-slate-900 flex overflow-x-clip bg-[#F5F7FB]">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2.5 focus:rounded-xl focus:bg-[#1D4ED8] focus:text-white focus:font-semibold focus:text-xs focus:shadow-xl"
        >
          {t.common.skipToContent}
        </a>

        {/* Balanced Deep Navy Desktop Sidebar */}
        <aside className="hidden lg:flex lg:w-68 lg:flex-col lg:fixed lg:inset-y-0 bg-gradient-to-b from-[#0D2040] via-[#0B1B36] to-[#09162E] text-slate-100 border-r border-sky-900/60 shadow-xl">
          <div className="px-5 py-4 border-b border-sky-400/15">
            <button
              type="button"
              onClick={() => handleNavigateHomeAnchor('home-intro')}
              className="flex items-center gap-3 text-left group rounded-xl focus-visible:outline-2 focus-visible:outline-sky-400"
            >
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-sky-400/30 flex items-center justify-center shadow-sm shrink-0">
                <ApnaWardLogo size={28} />
              </div>
              <div className="min-w-0">
                <span className="block font-display font-bold text-base tracking-tight text-white group-hover:text-sky-200 transition-colors whitespace-nowrap">
                  {t.common.appName}
                </span>
                <span className="block text-[11px] text-sky-200/80 whitespace-nowrap truncate">
                  {t.common.appTagline}
                </span>
              </div>
            </button>
          </div>

          <nav className="flex-1 px-3.5 py-4 space-y-4 overflow-y-auto" aria-label="Primary navigation">
            {/* Group 1: For Residents (Story & Guide) */}
            <div className="space-y-1">
              <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-sky-300/75">
                {t.guideNav.storyGroup}
              </p>
              {STORY_NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = activeSection === 'home' && activeHomeAnchor === item.anchor;
                const label = item.key === 'home' ? t.nav.home : t.guideNav[item.key];
                return (
                  <button
                    key={item.anchor}
                    type="button"
                    onClick={() => handleNavigateHomeAnchor(item.anchor)}
                    aria-current={active ? 'page' : undefined}
                    className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium min-h-[38px] transition-colors duration-150 whitespace-nowrap ${
                      active ? 'text-white' : 'text-slate-300 hover:text-white hover:bg-white/6'
                    }`}
                  >
                    {active ? (
                      <motion.span
                        layoutId="sidebar-active-pill"
                        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                        className="absolute inset-0 rounded-xl bg-gradient-to-r from-sky-500/25 to-blue-600/20 border border-sky-400/45"
                        aria-hidden="true"
                      />
                    ) : null}
                    <span className="relative flex items-center gap-3 min-w-0">
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                          active
                            ? 'bg-sky-400/25 text-sky-200'
                            : 'bg-white/8 text-slate-300'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      </span>
                      <span className="truncate">{label}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Group 2: Community Tools */}
            <div className="space-y-1 pt-2 border-t border-sky-400/15">
              <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-sky-300/75">
                {t.guideNav.workspaceGroup}
              </p>
              {COMMUNITY_NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = activeSection === item.id;
                const isAiPage = item.id === 'inspector';
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavigate(item.id)}
                    aria-current={active ? 'page' : undefined}
                    className={`relative w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-xs sm:text-[13px] font-medium min-h-[40px] transition-colors duration-150 whitespace-nowrap ${
                      active ? 'text-white' : 'text-slate-300 hover:text-white hover:bg-white/6'
                    }`}
                  >
                    {active ? (
                      <motion.span
                        layoutId="sidebar-active-pill"
                        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                        className={`absolute inset-0 rounded-xl border ${
                          isAiPage
                            ? 'bg-purple-500/25 border-purple-400/45'
                            : 'bg-gradient-to-r from-sky-500/25 to-blue-600/20 border-sky-400/45'
                        }`}
                        aria-hidden="true"
                      />
                    ) : null}
                    <span className="relative flex items-center gap-3 min-w-0">
                      <span
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                          active
                            ? isAiPage
                              ? 'bg-purple-400/25 text-purple-200'
                              : 'bg-sky-400/25 text-sky-200'
                            : 'bg-white/8 text-slate-300'
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                      </span>
                      <span className="truncate">{t.nav[item.id]}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Group 3: Ward Operations & Analytics */}
            <div className="space-y-1 pt-2 border-t border-sky-400/15">
              <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-sky-300/75">
                {t.guideNav.opsGroup}
              </p>
              {OPERATIONS_NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavigate(item.id)}
                    aria-current={active ? 'page' : undefined}
                    className={`relative w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-xs sm:text-[13px] font-medium min-h-[40px] transition-colors duration-150 whitespace-nowrap ${
                      active ? 'text-white' : 'text-slate-300 hover:text-white hover:bg-white/6'
                    }`}
                  >
                    {active ? (
                      <motion.span
                        layoutId="sidebar-active-pill"
                        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                        className="absolute inset-0 rounded-xl bg-gradient-to-r from-sky-500/25 to-blue-600/20 border border-sky-400/45"
                        aria-hidden="true"
                      />
                    ) : null}
                    <span className="relative flex items-center gap-3 min-w-0">
                      <span
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                          active
                            ? 'bg-sky-400/25 text-sky-200'
                            : 'bg-white/8 text-slate-300'
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                      </span>
                      <span className="truncate">{t.nav[item.id]}</span>
                    </span>
                    {item.id === 'management' ? (
                      <span className="relative px-2 py-0.5 rounded-md bg-white/10 text-[11px] font-mono tabular-nums text-sky-200 shrink-0">
                        {openCount}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </nav>

          <div className="px-3.5 pb-3 pt-2 border-t border-sky-400/15 space-y-2">
            <button
              type="button"
              onClick={handleOpenJudgeDemo}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-[#1D4ED8] to-[#0284C7] hover:brightness-110 transition-all min-h-[38px]"
            >
              <Presentation className="w-3.5 h-3.5 text-sky-100 shrink-0" aria-hidden="true" />
              <span className="truncate">{t.guideNav.judgeDemoCta}</span>
            </button>

            <button
              type="button"
              onClick={handleStartTour}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-sky-100 bg-white/8 border border-sky-400/30 hover:border-sky-300/60 transition-colors min-h-[38px]"
            >
              <Play className="w-3.5 h-3.5 text-sky-300 shrink-0" aria-hidden="true" />
              <span className="truncate">{t.guideNav.tourCta}</span>
            </button>

            <button
              type="button"
              onClick={() => setOnboardingOpen(true)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-200 bg-white/5 border border-white/10 hover:border-sky-400/45 transition-colors min-h-[38px]"
            >
              <HelpCircle className="w-4 h-4 text-sky-300 shrink-0" aria-hidden="true" />
              <span className="truncate">{t.common.welcomeGuide}</span>
            </button>

            <div className="p-3 rounded-xl bg-white/5 border border-sky-400/15 text-[11px] text-slate-300 space-y-1">
              <p className="font-mono font-semibold text-amber-300">{t.common.demoModeTitle}</p>
              <p className="leading-relaxed text-slate-300/90">{t.common.demoModeDesc}</p>
            </div>
          </div>
        </aside>

        {/* Mobile Drawer Navigation */}
        <AnimatePresence>
          {mobileNavOpen ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-50 lg:hidden flex bg-slate-950/60 backdrop-blur-xs"
              onClick={() => setMobileNavOpen(false)}
            >
              <motion.aside
                initial={{ x: -260 }}
                animate={{ x: 0 }}
                exit={{ x: -260 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="w-76 max-w-[85vw] h-full bg-gradient-to-b from-[#0D2040] to-[#09162E] text-slate-100 border-r border-sky-400/20 flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-4 py-4 border-b border-sky-400/15 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-white/10 border border-sky-400/30 flex items-center justify-center">
                      <ApnaWardLogo size={22} />
                    </div>
                    <div>
                      <span className="block font-display font-bold text-base text-white">
                        {t.common.appName}
                      </span>
                      <span className="block text-[10px] text-sky-200/80">
                        {t.common.appTagline}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileNavOpen(false)}
                    aria-label={t.topbar.closeMenu}
                    className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 min-h-[44px] min-w-[44px] flex items-center justify-center"
                  >
                    <X className="w-5 h-5" aria-hidden="true" />
                  </button>
                </div>

                <div className="px-4 pt-3 pb-2 flex items-center justify-between gap-2 border-b border-white/10">
                  <span className="text-xs font-medium text-slate-200">
                    {t.common.languageLabel}
                  </span>
                  <div
                    className="inline-flex items-center gap-0.5 p-1 rounded-xl bg-white/10 border border-white/15"
                    role="group"
                    aria-label={t.common.languageLabel}
                  >
                    {(
                      [
                        { code: 'en', label: 'EN' },
                        { code: 'hi', label: 'हिंदी' },
                      ] as const
                    ).map((opt) => {
                      const active = language === opt.code;
                      return (
                        <button
                          key={opt.code}
                          type="button"
                          onClick={() => setLanguage(opt.code)}
                          aria-pressed={active}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium min-h-[32px] ${
                            active ? 'bg-sky-400 text-slate-950 font-semibold' : 'text-slate-200'
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <nav className="flex-1 px-3 py-3 space-y-3 overflow-y-auto" aria-label="Mobile navigation">
                  <div className="space-y-1">
                    <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-sky-300/75">
                      {t.guideNav.storyGroup}
                    </p>
                    {STORY_NAV_ITEMS.map((item) => {
                      const Icon = item.icon;
                      const active = activeSection === 'home' && activeHomeAnchor === item.anchor;
                      const label = item.key === 'home' ? t.nav.home : t.guideNav[item.key];
                      return (
                        <button
                          key={item.anchor}
                          type="button"
                          onClick={() => handleNavigateHomeAnchor(item.anchor)}
                          aria-current={active ? 'page' : undefined}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium min-h-[40px] transition-colors ${
                            active
                              ? 'bg-sky-500/25 text-white border border-sky-400/45'
                              : 'text-slate-200 hover:text-white hover:bg-white/8 border border-transparent'
                          }`}
                        >
                          <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                          <span>{label}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="space-y-1 pt-2 border-t border-white/10">
                    <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-sky-300/75">
                      {t.guideNav.workspaceGroup}
                    </p>
                    {COMMUNITY_NAV_ITEMS.map((item) => {
                      const Icon = item.icon;
                      const active = activeSection === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleNavigate(item.id)}
                          aria-current={active ? 'page' : undefined}
                          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium min-h-[42px] transition-colors ${
                            active
                              ? 'bg-sky-500/25 text-white border border-sky-400/45'
                              : 'text-slate-200 hover:text-white hover:bg-white/8 border border-transparent'
                          }`}
                        >
                          <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                          <span>{t.nav[item.id]}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="space-y-1 pt-2 border-t border-white/10">
                    <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-sky-300/75">
                      {t.guideNav.opsGroup}
                    </p>
                    {OPERATIONS_NAV_ITEMS.map((item) => {
                      const Icon = item.icon;
                      const active = activeSection === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleNavigate(item.id)}
                          aria-current={active ? 'page' : undefined}
                          className={`w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium min-h-[42px] transition-colors ${
                            active
                              ? 'bg-sky-500/25 text-white border border-sky-400/45'
                              : 'text-slate-200 hover:text-white hover:bg-white/8 border border-transparent'
                          }`}
                        >
                          <span className="flex items-center gap-2.5">
                            <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                            <span>{t.nav[item.id]}</span>
                          </span>
                          {item.id === 'management' ? (
                            <span className="text-xs font-mono tabular-nums text-sky-200">
                              {openCount}
                            </span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </nav>

                <div className="p-3 border-t border-white/10 space-y-2">
                  <button
                    type="button"
                    onClick={handleOpenJudgeDemo}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-[#1D4ED8] to-[#0284C7] min-h-[42px]"
                  >
                    <Presentation className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{t.guideNav.judgeDemoCta}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleStartTour}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-sky-100 bg-white/10 border border-sky-400/35 min-h-[42px]"
                  >
                    <Play className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{t.guideNav.tourCta}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileNavOpen(false);
                      setOnboardingOpen(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-200 bg-white/5 border border-white/15 min-h-[42px]"
                  >
                    <HelpCircle className="w-4 h-4 text-sky-300" aria-hidden="true" />
                    <span>{t.common.welcomeGuide}</span>
                  </button>
                </div>
              </motion.aside>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Main Content Shell */}
        <div className="flex-1 lg:pl-68 flex flex-col min-w-0">
          {/* Crisp Light Top Navigation Bar */}
          <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-4 shadow-[0_2px_12px_-6px_rgba(15,23,42,0.08)]">
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                type="button"
                onClick={() => setMobileNavOpen(true)}
                aria-label={t.topbar.openMenu}
                className="lg:hidden p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:text-[#1D4ED8] min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
              >
                <Menu className="w-4 h-4" aria-hidden="true" />
              </button>
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activeSection}-${language}`}
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -3 }}
                  transition={{ duration: 0.14 }}
                  className="min-w-0"
                >
                  <h1 className="text-sm sm:text-lg font-display font-bold text-[#0B1B36] truncate">
                    {pageMeta.title}
                  </h1>
                  <p className="hidden xl:block text-xs text-slate-500 truncate">
                    {pageMeta.subtitle}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              {/* Clearly Visible Demo Mode Indicator */}
              <button
                type="button"
                onClick={() => {
                  setNotificationsOpen(false);
                  setProfileOpen(true);
                }}
                title={t.common.demoModeDesc}
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] font-mono font-semibold text-amber-800 hover:bg-amber-100 min-h-[36px] whitespace-nowrap shrink-0"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" aria-hidden="true" />
                <span>{t.guideNav.demoModeBadge}</span>
              </button>

              {/* Dedicated Guided Demo CTA */}
              <button
                type="button"
                onClick={handleOpenJudgeDemo}
                className="btn-press hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-sky-50 border border-sky-200 text-[#1D4ED8] hover:bg-sky-100 min-h-[38px] whitespace-nowrap shrink-0"
              >
                <Presentation className="w-3.5 h-3.5 text-[#0284C7] shrink-0" aria-hidden="true" />
                <span>{t.guideNav.judgeDemoCta}</span>
              </button>

              {/* Instant Multilingual Switcher */}
              {renderLanguageSelector('topbar')}

              {/* Global Search by Report ID or Keyword */}
              <div ref={searchBoxRef} className="relative hidden md:block w-48 lg:w-60">
                <form onSubmit={handleGlobalSearchSubmit}>
                  <label htmlFor="topbar-global-search" className="sr-only">
                    {t.topbar.searchLabel}
                  </label>
                  <Search
                    className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    id="topbar-global-search"
                    type="search"
                    value={globalSearch}
                    onFocus={() => setSearchFocused(true)}
                    onChange={(e) => {
                      setGlobalSearch(e.target.value);
                      setSearchFocused(true);
                    }}
                    placeholder={t.topbar.searchPlaceholder}
                    className="w-full pl-8.5 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#0284C7] min-h-[38px] transition-colors"
                  />
                </form>

                <AnimatePresence>
                  {searchFocused && globalSearch.trim().length > 0 ? (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.98 }}
                      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute right-0 mt-2 w-80 rounded-xl glass-floating p-2 z-50"
                    >
                      {globalSearchMatches.length === 0 ? (
                        <p className="px-3 py-2.5 text-xs text-slate-500">
                          {t.topbar.noMatches} &ldquo;{globalSearch.trim()}&rdquo;
                        </p>
                      ) : (
                        <div className="divide-y divide-slate-100">
                          {globalSearchMatches.map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => {
                                setTrackedIssueId(item.id);
                                setSearchFocused(false);
                                setActiveSection('track');
                              }}
                              className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors space-y-0.5"
                            >
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-mono font-semibold text-[#1D4ED8]">
                                  {item.id}
                                </span>
                                <span className="text-[11px] text-slate-500">
                                  {statusLabel(item.status)}
                                </span>
                              </div>
                              <p className="text-xs font-medium text-slate-900 truncate">
                                {item.title}
                              </p>
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              setManagementSearchPreset(globalSearch.trim());
                              setSearchFocused(false);
                              handleNavigate('management');
                            }}
                            className="w-full text-center py-2 text-xs font-semibold text-[#1D4ED8] hover:text-[#1E40AF]"
                          >
                            {t.topbar.filterInAdmin}
                          </button>
                        </div>
                      )}
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>

              {/* Notifications Dropdown */}
              <div ref={notifBoxRef} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setNotificationsOpen((o) => !o);
                    setProfileOpen(false);
                  }}
                  aria-label={`${t.topbar.alertsTitle} (${urgentCount})`}
                  aria-expanded={notificationsOpen}
                  className="btn-press relative p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:text-[#1D4ED8] hover:border-blue-300 min-h-[40px] min-w-[40px] flex items-center justify-center transition-colors"
                >
                  <Bell className="w-4 h-4" aria-hidden="true" />
                  {urgentCount > 0 ? (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#1D4ED8] text-white text-[10px] font-mono font-bold flex items-center justify-center tabular-nums">
                      {urgentCount}
                    </span>
                  ) : null}
                </button>

                <AnimatePresence>
                  {notificationsOpen ? (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.98 }}
                      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl glass-floating p-3 z-50 space-y-2"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                        <span className="text-xs font-display font-bold text-[#0B1B36]">
                          {t.topbar.alertsTitle}
                        </span>
                        <span className="text-[11px] font-mono font-semibold text-[#0284C7] tabular-nums">
                          {openCount} {t.common.open}
                        </span>
                      </div>
                      <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                        {highPriorityAlerts.length === 0 ? (
                          <p className="py-4 text-center text-xs text-slate-500">
                            {t.topbar.alertsAllResolved}
                          </p>
                        ) : (
                          highPriorityAlerts.map(({ issue, priority }) => (
                            <button
                              key={issue.id}
                              type="button"
                              onClick={() => {
                                setSelectedIssueId(issue.id);
                                setNotificationsOpen(false);
                              }}
                              className="w-full text-left py-2.5 px-2 rounded-lg hover:bg-slate-50 transition-colors flex items-start justify-between gap-2"
                            >
                              <div className="min-w-0">
                                <p className="text-xs font-medium text-slate-900 truncate">
                                  <span className="font-mono font-semibold text-[#1D4ED8]">
                                    {issue.id}
                                  </span>{' '}
                                  · {issue.title}
                                </p>
                                <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                                  {issue.wardName.replace(' (Demo)', '')} ·{' '}
                                  {formatRelativeTime(issue.updatedAt)}
                                </p>
                              </div>
                              <span className="text-xs font-mono font-bold text-[#0284C7] tabular-nums shrink-0">
                                {priority.totalScore}/100
                              </span>
                            </button>
                          ))
                        )}
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>

              {/* Profile / Workspace Menu */}
              <div ref={profileBoxRef} className="relative hidden sm:block">
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen((o) => !o);
                    setNotificationsOpen(false);
                  }}
                  aria-expanded={profileOpen}
                  className="btn-press flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-300 min-h-[40px] transition-colors"
                >
                  <span className="w-7 h-7 rounded-lg bg-[#0B1B36] text-xs font-display font-semibold text-white flex items-center justify-center shrink-0">
                    WT
                  </span>
                  <span className="hidden xl:block text-left leading-tight">
                    <span className="block text-xs font-semibold text-[#0B1B36] whitespace-nowrap">
                      {t.topbar.wardOps}
                    </span>
                    <span className="block text-[10px] text-slate-500 whitespace-nowrap">
                      {t.topbar.demoLead}
                    </span>
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                </button>

                <AnimatePresence>
                  {profileOpen ? (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.98 }}
                      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute right-0 mt-2 w-64 rounded-xl glass-floating p-2 z-50 space-y-1 text-xs"
                    >
                      <div className="px-3 py-2 border-b border-slate-200">
                        <p className="font-semibold text-[#0B1B36]">{t.topbar.wardOpsLead}</p>
                        <p className="text-[11px] text-slate-500">{t.topbar.mvpSession}</p>
                      </div>
                      {cloudConfigured ? (
                        <div className="mx-1 rounded-lg border border-blue-100 bg-blue-50/70 p-2">
                          <p className="text-[11px] font-semibold text-blue-900">{cloudEmail ? `Signed in: ${cloudEmail}` : 'Cloud sync is available'}</p>
                          <button type="button" onClick={async () => {
                            setProfileOpen(false);
                            if (cloudEmail) {
                              await signOutCloud();
                              setCloudEmail(null);
                              pushToast({ title: 'Signed out', description: 'This device will continue in local demo mode.', tone: 'info' });
                            } else setCloudAccountOpen(true);
                          }} className="mt-1 text-[11px] font-semibold text-blue-700 hover:underline">
                            {cloudEmail ? 'Sign out' : 'Sign in / Create account'}
                          </button>
                        </div>
                      ) : (
                        <p className="mx-1 rounded-lg bg-amber-50 p-2 text-[11px] text-amber-800">Cloud not configured · local demo mode</p>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setProfileOpen(false);
                          setOnboardingOpen(true);
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg text-[#1D4ED8] font-medium hover:bg-blue-50 transition-colors"
                      >
                        {t.common.welcomeGuide}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleNavigate('priority')}
                        className="w-full text-left px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 hover:text-[#1D4ED8] transition-colors"
                      >
                        {t.topbar.priorityFormulaLink}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleNavigate('management')}
                        className="w-full text-left px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 hover:text-[#1D4ED8] transition-colors"
                      >
                        {t.topbar.trackAllComplaints} ({issues.length})
                      </button>
                      {confirmProfileReset ? (
                        <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 space-y-2">
                          <p className="text-[11px] text-amber-900">{t.topbar.restoreDemoQuestion}</p>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={handleResetDemoData}
                              className="flex-1 py-1.5 rounded-md bg-amber-500 text-white font-semibold hover:bg-amber-600"
                            >
                              {t.topbar.confirm}
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmProfileReset(false)}
                              className="flex-1 py-1.5 rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                            >
                              {t.common.cancel}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmProfileReset(true)}
                          className="w-full text-left px-3 py-2 rounded-lg text-amber-800 hover:bg-amber-50 transition-colors flex items-center gap-2 font-medium"
                        >
                          <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>{t.common.resetDemoData}</span>
                        </button>
                      )}
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>

              {/* Primary Action */}
              <button
                type="button"
                onClick={() => handleNavigate('report')}
                className="btn-press inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold bg-[#1D4ED8] text-white hover:bg-[#1E40AF] shadow-sm min-h-[40px] whitespace-nowrap shrink-0"
              >
                <FilePlus2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">{t.common.reportIssueCta}</span>
                <span className="sm:hidden">{t.common.reportShort}</span>
              </button>
            </div>
          </header>

          {/* Active Page Viewport */}
          <main
            id="main-content"
            tabIndex={-1}
            className="flex-1 px-3.5 sm:px-6 lg:px-8 py-5 sm:py-6 pb-24 lg:pb-8 max-w-[1440px] w-full mx-auto focus:outline-none flex flex-col"
          >
            <div className="flex-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSection}
                  initial={{ opacity: 0, y: 8, scale: 0.992 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.994 }}
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                >
                  {activeSection === 'home' ? (
                    <HomePage
                      issues={issues}
                      activeAnchor={activeHomeAnchor}
                      onSelectAnchor={setActiveHomeAnchor}
                      onNavigate={handleNavigate}
                      onStartTour={handleStartTour}
                      onPrefillReport={handlePrefillReport}
                    />
                  ) : null}

                  {activeSection === 'command' ? (
                    <CommandCenterPage
                      issues={issues}
                      onNavigate={handleNavigate}
                      onSelectIssue={(issue) => setSelectedIssueId(issue.id)}
                      onFilterByCategory={handleFilterCategoryFromOverview}
                      onFilterByWard={handleFilterWardFromCommand}
                      onLocateHotspotOnMap={handleLocateHotspotOnMap}
                      onResetDemoData={handleResetDemoData}
                    />
                  ) : null}

                  {activeSection === 'overview' ? (
                    <OverviewPage
                      issues={issues}
                      onNavigate={handleNavigate}
                      onSelectIssue={(issue) => setSelectedIssueId(issue.id)}
                      onFilterByCategory={handleFilterCategoryFromOverview}
                      onResetDemoData={handleResetDemoData}
                    />
                  ) : null}

                  {activeSection === 'report' ? (
                    <ReportIssuePage
                      existingIssues={issues}
                      locations={cloudLocations}
                      onSubmitIssue={handleCreateIssue}
                      onNavigate={handleNavigate}
                      onSelectIssue={(issue) => setSelectedIssueId(issue.id)}
                      onTrackIssue={handleTrackIssueById}
                      prefillDraft={prefillDraft}
                      onClearPrefill={() => setPrefillDraft(null)}
                    />
                  ) : null}

                  {activeSection === 'track' ? (
                    <ComplaintTrackingPage
                      issues={issues}
                      initialTrackedId={trackedIssueId}
                      onClearInitialTrackedId={() => setTrackedIssueId(null)}
                      onNavigate={handleNavigate}
                      onViewOnMap={handleViewOnMap}
                      onOpenAdminDrawer={(issue) => setSelectedIssueId(issue.id)}
                      onVerifyIssue={handleVerifyIssue}
                    />
                  ) : null}

                  {activeSection === 'inspector' ? (
                    <AiInspectorPage
                      issues={issues}
                      onPrefillReport={handlePrefillReport}
                      initialSampleIssueId={inspectorSampleIssueId}
                      onClearInitialSample={() => setInspectorSampleIssueId(null)}
                    />
                  ) : null}

                  {activeSection === 'map' ? (
                    <LiveMapPage
                      issues={issues}
                      focusedIssueId={mapFocusIssueId}
                      focusedArea={mapFocusArea}
                      onSelectIssue={(issue) => setSelectedIssueId(issue.id)}
                      onClearFocus={() => {
                        setMapFocusIssueId(null);
                        setMapFocusArea(null);
                      }}
                    />
                  ) : null}

                  {activeSection === 'management' ? (
                    <IssueManagementPage
                      issues={issues}
                      initialCategoryFilter={managementCategoryFilter}
                      initialWardFilter={managementWardFilter}
                      initialSearchQuery={managementSearchPreset}
                      onClearInitialCategory={() => setManagementCategoryFilter('all')}
                      onClearInitialWard={() => setManagementWardFilter('all')}
                      onClearInitialSearch={() => setManagementSearchPreset('')}
                      onSelectIssue={(issue) => setSelectedIssueId(issue.id)}
                    />
                  ) : null}

                  {activeSection === 'priority' ? (
                    <SmartPriorityPage
                      issues={issues}
                      onSelectIssue={(issue) => setSelectedIssueId(issue.id)}
                    />
                  ) : null}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Quiet Community-Focused Footer */}
            <footer className="mt-10 pt-5 border-t border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <ApnaWardLogo size={18} />
                <span className="font-display font-semibold text-[#0B1B36]">
                  {t.common.appName}
                </span>
                <span aria-hidden="true">·</span>
                <span>{t.common.appTagline}</span>
              </div>
              <p className="text-[11px] text-slate-500">
                {language === 'hi'
                  ? 'छोटी रिपोर्ट. बेहतर मोहल्ले. · स्थानीय ब्राउज़र डेमो प्रोटोटाइप — कोई सरकारी पोर्टल नहीं।'
                  : 'Small reports. Better neighbourhoods. · Local browser demo prototype — not an official municipal portal.'}
              </p>
            </footer>
          </main>
        </div>

        {/* Mobile-First Bottom Quick-Navigation Bar */}
        <nav
          aria-label="Mobile quick navigation"
          className="fixed bottom-0 inset-x-0 z-30 lg:hidden bg-white/95 backdrop-blur-md border-t border-slate-200 px-1.5 py-1.5 grid grid-cols-5 gap-1 shadow-[0_-4px_16px_-6px_rgba(15,23,42,0.12)]"
        >
          {(
            [
              { id: 'home', icon: Home, label: t.nav.home },
              { id: 'report', icon: FilePlus2, label: t.common.reportShort },
              { id: 'track', icon: Compass, label: t.nav.track },
              { id: 'map', icon: MapPin, label: t.nav.map },
            ] as const
          ).map((item) => {
            const Icon = item.icon;
            const active = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavigate(item.id)}
                aria-current={active ? 'page' : undefined}
                className={`flex flex-col items-center justify-center gap-0.5 py-1.5 px-1 rounded-xl min-h-[46px] text-[10px] font-medium transition-colors ${
                  active
                    ? 'bg-blue-50 text-[#1D4ED8] border border-blue-200 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 border border-transparent'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span className="truncate max-w-full">{item.label}</span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            className="flex flex-col items-center justify-center gap-0.5 py-1.5 px-1 rounded-xl min-h-[46px] text-[10px] font-medium text-slate-600 hover:text-slate-900 border border-transparent"
          >
            <Menu className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span className="truncate max-w-full">{t.topbar.moreMenu}</span>
          </button>
        </nav>

        {/* 60-Second Interactive Guided Product Tour */}
        <GuidedProductTour
          open={tourOpen}
          stepIndex={tourStep}
          onStepChange={applyTourStep}
          onClose={() => setTourOpen(false)}
          onFinish={() => setTourOpen(false)}
        />

        {/* Guided Product Demo Deck */}
        <JudgePresentationModal
          open={judgeDemoOpen}
          chapterIndex={judgeChapter}
          onChapterChange={setJudgeChapter}
          onClose={() => {
            setJudgeDemoOpen(false);
            setJudgePausedForLive(false);
          }}
          onTriggerAction={handleJudgeAction}
        />

        {/* Floating Resume Guided Demo button when inspecting a live screen */}
        <AnimatePresence>
          {judgePausedForLive && !judgeDemoOpen ? (
            <motion.div
              key="resume-judge-demo"
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.96 }}
              transition={{ duration: 0.18 }}
              className="fixed bottom-20 lg:bottom-6 right-4 z-[64] flex items-center gap-1.5"
            >
              <button
                type="button"
                onClick={() => {
                  setJudgeDemoOpen(true);
                  setJudgePausedForLive(false);
                }}
                className="btn-press inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#1D4ED8] hover:bg-[#1E40AF] text-white shadow-lg min-h-[42px]"
              >
                <Presentation className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>
                  {t.guideNav.resumeJudgeDemo} ({HOME_TRANSLATIONS[language].judgeDemo.chapterWord}{' '}
                  {judgeChapter + 1})
                </span>
              </button>
              <button
                type="button"
                onClick={() => setJudgePausedForLive(false)}
                aria-label={t.common.close}
                className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 min-h-[42px] min-w-[42px] flex items-center justify-center shadow-lg"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Smart Citizen Onboarding Modal */}
        {cloudAccountOpen && <CloudAccountModal onClose={() => setCloudAccountOpen(false)} onSuccess={async (email) => {
        setCloudEmail(email);
        setCloudAccountOpen(false);
        try {
          const cloudIssues = await fetchCloudIssues();
          setIssues((current) => {
            const demos = current.filter((item) => item.isDemoData);
            const localOnly = current.filter((item) => !item.isDemoData && !cloudIssues.some((cloud) => cloud.id === item.id));
            const merged = [...cloudIssues, ...localOnly, ...demos];
            issuesRef.current = merged;
            saveIssues(merged);
            return merged;
          });
          pushToast({ title: 'Cloud account connected', description: 'Your cloud reports have been loaded.', tone: 'success' });
        } catch (error) {
          pushToast({ title: 'Account connected; sync needs setup', description: error instanceof Error ? error.message : 'Check the Supabase database migration.', tone: 'warning' });
        }
      }} />}
      <CitizenOnboardingModal
          open={onboardingOpen}
          onComplete={handleCompleteOnboarding}
        />

        {/* Shared Issue Detail & Ward Operations Resolution Drawer */}
        <IssueDetailDrawer
          issue={selectedIssue}
          onClose={() => setSelectedIssueId(null)}
          onUpdateStatus={handleUpdateStatus}
          onViewOnMap={handleViewOnMap}
        />

        {/* Animated Toast Feedback Stack */}
        <ToastViewport toasts={toasts} onDismiss={dismissToast} />
      </div>
    </MotionConfig>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <ApnaWardShell />
    </LanguageProvider>
  );
}
