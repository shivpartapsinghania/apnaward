import { IssueCategory, IssueSeverity, IssueStatus, NavSection, PriorityBreakdown } from '../types/civic';

export type AppLanguage = 'en' | 'hi';

export interface TranslationDictionary {
  common: {
    appName: string;
    appTagline: string;
    skipToContent: string;
    languageLabel: string;
    demoData: string;
    demoModeTitle: string;
    demoModeDesc: string;
    reportIssueCta: string;
    reportShort: string;
    resetDemoData: string;
    confirmResetPrompt: string;
    confirmResetBtn: string;
    cancel: string;
    inspect: string;
    viewOnMap: string;
    all: string;
    open: string;
    resolved: string;
    close: string;
    back: string;
    submit: string;
    citizen: string;
    demo: string;
    notVerifiedFact: string;
    welcomeGuide: string;
  };
  guideNav: {
    storyGroup: string;
    workspaceGroup: string;
    opsGroup: string;
    whyApnaWard: string;
    howItWorks: string;
    platformFeatures: string;
    about: string;
    liveDashboard: string;
    tourCta: string;
    judgeDemoCta: string;
    demoModeBadge: string;
    resumeJudgeDemo: string;
  };
  nav: Record<NavSection, string>;
  pageMeta: Record<NavSection, { title: string; subtitle: string }>;
  categories: Record<IssueCategory, string>;
  categoriesShort: Record<IssueCategory, string>;
  statuses: Record<IssueStatus, string>;
  severities: Record<IssueSeverity, string>;
  priorityBands: Record<PriorityBreakdown['band'], string>;
  topbar: {
    searchPlaceholder: string;
    searchLabel: string;
    noMatches: string;
    filterInAdmin: string;
    alertsTitle: string;
    alertsAllResolved: string;
    wardOps: string;
    demoLead: string;
    wardOpsLead: string;
    mvpSession: string;
    priorityFormulaLink: string;
    trackAllComplaints: string;
    restoreDemoQuestion: string;
    confirm: string;
    openMenu: string;
    closeMenu: string;
    moreMenu: string;
  };
  onboarding: {
    kicker: string;
    title: string;
    subtitle: string;
    chooseLanguage: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
    getStarted: string;
    trackFirst: string;
    skip: string;
    footerNote: string;
  };
  overview: {
    badge: string;
    heroTitle: string;
    heroSubtitle: string;
    submitComplaint: string;
    totalReports: string;
    acrossWards: string;
    pendingQueue: string;
    inActiveWork: string;
    highCriticalOpen: string;
    highScoreHint: string;
    resolvedReports: string;
    closedWithNotes: string;
    resolutionRate: string;
    prioritySpotlight: string;
    inspectAndUpdate: string;
    categoryBreakdown: string;
    clickToFilter: string;
    categoryBreakdownSub: string;
    complaintsWord: string;
    wardPerformance: string;
    wardPerformanceSub: string;
    recentReports: string;
    recentReportsSub: string;
    mapBtn: string;
    allIssuesBtn: string;
    activityTimeline: string;
    activityTimelineSub: string;
    commandCenterBtn: string;
  };
  command: {
    fictionalSample: string;
    citizenSubmitted: string;
    title: string;
    subtitle: string;
    openCityMap: string;
    adminCommand: string;
    totalReported: string;
    storedComplaints: string;
    openIssues: string;
    newlyReported: string;
    inProgress: string;
    activeDispatch: string;
    resolved: string;
    closedWithNotes: string;
    highPriority: string;
    highCriticalOpen: string;
    resolutionRate: string;
    categoryDist: string;
    categoryDistSub: string;
    totalLabel: string;
    allIssuesLabel: string;
    wardDist: string;
    wardDistSub: string;
    resolvedPctLabel: string;
    hotspotTitle: string;
    hotspotSubPrefix: string;
    hotspotSubSuffix: string;
    openComplaintsOnly: string;
    noHotspotsTitle: string;
    noHotspotsSub: string;
    complaintsCount: string;
    openCount: string;
    avgPriority: string;
    mostCommonCategory: string;
    groupedIds: string;
    suggestedAttention: string;
    locateCluster: string;
    recentActivity: string;
    recentActivitySub: string;
    allComplaints: string;
    urgentQueue: string;
    urgentQueueSub: string;
    priorityRules: string;
  };
  report: {
    stepLabel: string;
    of: string;
    steps: Array<{ title: string; subtitle: string }>;
    step1Heading: string;
    step1Sub: string;
    samplePrefix: string;
    samples: {
      schoolRoad: string;
      clinicCorner: string;
      blockedDrain: string;
    };
    titleLabel: string;
    titlePlaceholder: string;
    categoryLabel: string;
    severityLabel: string;
    severityOptions: Record<IssueSeverity, string>;
    descriptionLabel: string;
    descriptionPlaceholder: string;
    descriptionHint: string;
    charsUnit: string;
    voiceDictate: string;
    voiceStop: string;
    voiceListening: string;
    voiceLangEn: string;
    voiceLangHi: string;
    voiceUnsupported: string;
    voiceDenied: string;
    voiceNoMic: string;
    voiceNoSpeech: string;
    voiceNetworkErr: string;
    voiceEditableHint: string;
    photoLabel: string;
    photoReady: string;
    removePhoto: string;
    dropPhotoPrefix: string;
    browseDevice: string;
    photoFormatsHint: string;
    step2Heading: string;
    step2Sub: string;
    wardLabel: string;
    landmarkLabel: string;
    landmarkPlaceholder: string;
    step3Heading: string;
    step3Sub: string;
    reviewTitle: string;
    reviewWard: string;
    reviewLocality: string;
    reviewDesc: string;
    reviewCatEditable: string;
    reviewSevEditable: string;
    previewAiTitle: string;
    previewAiSub: string;
    analyzeNow: string;
    analyzing: string;
    quickAiAnalyze: string;
    continueToStep: string;
    submitComplaint: string;
    submittingComplaint: string;
    duplicateTitle: string;
    duplicateSub: string;
    awaySuffix: string;
    matchSignals: string;
    inspectId: string;
    confirmSeparate: string;
    continueSubmitAnyway: string;
    aiSidebarTitle: string;
    aiSidebarSub: string;
    aiSuggestionOnly: string;
    aiLoadingText: string;
    aiUnavailableTitle: string;
    aiUnavailableSub: string;
    suggestedCategory: string;
    suggestedSeverity: string;
    whySuggested: string;
    possibleImpact: string;
    suggestedAction: string;
    photoReview: string;
    applyAiSuggestion: string;
    aiIdleHint: string;
    livePriorityTitle: string;
    livePriorityNote: string;
    validationTitleMin: string;
    validationDescMin: string;
    validationLandmarkMin: string;
    validationCoords: string;
    validationAiNeedInput: string;
    successBadge: string;
    successHeading: string;
    successSubtitle: string;
    successAiFallback: string;
    complaintIdLabel: string;
    wardAndSeverity: string;
    smartPriorityScore: string;
    aiTriageHeading: string;
    trackTimelineBtn: string;
    viewLiveMapBtn: string;
    submitAnotherBtn: string;
  };
  track: {
    kicker: string;
    title: string;
    subtitle: string;
    searchLabel: string;
    searchPlaceholder: string;
    searchBtn: string;
    clearBtn: string;
    quickPickLabel: string;
    emptyTitle: string;
    emptySub: string;
    emptyNotFoundTitle: string;
    emptyNotFoundSub: string;
    reportNewBtn: string;
    showLatestBtn: string;
    complaintIdLabel: string;
    categoryLabel: string;
    wardLocalityLabel: string;
    submittedOnLabel: string;
    currentStatusLabel: string;
    priorityScoreLabel: string;
    progressTitle: string;
    stepReportedDesc: string;
    stepInProgressDesc: string;
    stepResolvedDesc: string;
    latestAdminUpdate: string;
    citizenDescription: string;
    attachedPhoto: string;
    aiSummaryTitle: string;
    aiSummaryUnavailable: string;
    aiNoAnalysisYet: string;
    timelineHistoryTitle: string;
    viewOnMapBtn: string;
    openAdminDrawerBtn: string;
  };
  map: {
    subtitle: string;
    disclaimer: string;
    hotspotZones: string;
    mapView: string;
    listView: string;
    filtersTitle: string;
    activeCount: string;
    shownCount: string;
    reset: string;
    collapse: string;
    expand: string;
    searchMap: string;
    searchPlaceholder: string;
    ward: string;
    allWards: string;
    category: string;
    allCategories: string;
    status: string;
    allStatuses: string;
    severity: string;
    allSeverities: string;
    tileFallbackBanner: string;
    retryTiles: string;
    footerHint: string;
    mapData: string;
    legendTitle: string;
    legendSub: string;
    categoryIcons: string;
    workflowStates: string;
    reportedState: string;
    inProgressState: string;
    resolvedState: string;
    severityColors: string;
    legendFooter: string;
    noMatchesTitle: string;
    noMatchesSub: string;
  };
  management: {
    subtitle: string;
    searchPlaceholder: string;
    allWards: string;
    allCategories: string;
    allPriorityBands: string;
    allSeverities: string;
    sortPriorityDesc: string;
    sortPriorityAsc: string;
    sortNewest: string;
    sortOldest: string;
    showing: string;
    of: string;
    complaints: string;
    clearFilters: string;
    emptyTitle: string;
    emptySub: string;
    resetAll: string;
    colId: string;
    colTitle: string;
    colWard: string;
    colSeverity: string;
    colPriority: string;
    colStatus: string;
    colSubmitted: string;
    colAction: string;
    manageStatus: string;
    priorityLabel: string;
  };
  drawer: {
    closeAria: string;
    submitted: string;
    locateOnMap: string;
    wardAndLandmark: string;
    coordinates: string;
    illustrativeGrid: string;
    citizenDescription: string;
    attachedPhoto: string;
    smartPriorityTitle: string;
    severityFactor: string;
    impactFactor: string;
    waitingFactor: string;
    priorityDisclaimer: string;
    aiSuggestionTitle: string;
    editedByCitizen: string;
    whySuggested: string;
    possibleImpact: string;
    nextAction: string;
    fallbackNotice: string;
    adminUpdateTitle: string;
    adminUpdateSub: string;
    adminNoteLabel: string;
    adminNotePlaceholder: string;
    noteError: string;
    savedPrefix: string;
    savedSuffix: string;
    saveUpdateBtn: string;
    markResolvedBtn: string;
    timelineTitle: string;
  };
  inspector: {
    topCategory: string;
    ofActive: string;
    meanPriority: string;
    includeAiHint: string;
    severityMix: string;
    severityMixSub: string;
    categoryDist: string;
    categoryDistSub: string;
    wardComp: string;
    wardCompSub: string;
    priorityDrivers: string;
    avgSeverity: string;
    avgImpact: string;
    avgWaiting: string;
    insightsNote: string;
    sandboxTitle: string;
    sandboxSub: string;
    loadExisting: string;
    titleOptional: string;
    areaOptional: string;
    descLabel: string;
    descPlaceholder: string;
    photoOptional: string;
    uploadPhotoHint: string;
    skipAiManual: string;
    runAiInspection: string;
    analyzing: string;
    outputTitle: string;
    suggestionOnly: string;
    loadingText: string;
    unavailableTitle: string;
    proceedManual: string;
    whySuggested: string;
    possibleImpact: string;
    recommendedAction: string;
    imageAssessment: string;
    prefillReport: string;
    emptyTitle: string;
    emptySub: string;
  };
  priorityPage: {
    title: string;
    subtitle: string;
    disclaimer: string;
    rule1Title: string;
    rule1Desc: string;
    rule2Title: string;
    rule2Desc: string;
    rule3Title: string;
    rule3Desc: string;
    rankedQueue: string;
    complaintsShown: string;
    includeResolved: string;
    bandSuffix: string;
  };
  toasts: {
    createdTitlePrefix: string;
    createdTitleSuffix: string;
    createdDesc: string;
    updatedMiddle: string;
    updatedDesc: string;
    resetTitle: string;
    resetDescPrefix: string;
    resetDescSuffix: string;
  };
}

export const TRANSLATIONS: Record<AppLanguage, TranslationDictionary> = {
  en: {
    common: {
      appName: 'ApnaWard',
      appTagline: 'Your Neighbourhood. Your Voice.',
      skipToContent: 'Skip to main content',
      languageLabel: 'Language',
      demoData: 'DEMO DATA',
      demoModeTitle: 'DEMO DATA MODE',
      demoModeDesc:
        'Sample locations and ward records are illustrative demo data stored in your browser, not official municipal filings.',
      reportIssueCta: 'Report an Issue',
      reportShort: 'Report',
      resetDemoData: 'Reset Demo Data',
      confirmResetPrompt: 'Reset to sample demo records?',
      confirmResetBtn: 'Confirm Reset',
      cancel: 'Cancel',
      inspect: 'Inspect',
      viewOnMap: 'View on Explore Map',
      all: 'All',
      open: 'Open',
      resolved: 'Resolved',
      close: 'Close',
      back: 'Back',
      submit: 'Submit',
      citizen: 'Neighbour',
      demo: 'DEMO',
      notVerifiedFact: 'Advisory suggestion only',
      welcomeGuide: 'Community Welcome Guide',
    },
    guideNav: {
      storyGroup: 'For Residents',
      workspaceGroup: 'Community Tools',
      opsGroup: 'Ward Operations',
      whyApnaWard: 'Welcome to ApnaWard',
      howItWorks: 'How It Works',
      platformFeatures: 'Explore the Platform',
      about: 'Trust & Transparency',
      liveDashboard: 'Ward Operations',
      tourCta: '60-Sec Tour',
      judgeDemoCta: 'Guided Demo',
      demoModeBadge: 'DEMO MODE',
      resumeJudgeDemo: 'Resume Guided Demo',
    },
    nav: {
      home: 'Home',
      report: 'Report an Issue',
      track: 'Track Your Report',
      map: 'Explore Map',
      inspector: 'Neighbourhood Insights',
      overview: 'Ward Operations',
      command: 'Ward Analytics',
      management: 'Community Reports',
      priority: 'What Needs Attention First',
    },
    pageMeta: {
      home: {
        title: 'ApnaWard',
        subtitle: 'Your Neighbourhood. Your Voice. — Small reports. Better neighbourhoods.',
      },
      report: {
        title: 'Report an Issue',
        subtitle: 'What happened? Share location, add a photo if you have one, and get a tracking ID',
      },
      track: {
        title: 'Track Your Report',
        subtitle: 'Follow progress step by step using your report ID and read ward updates',
      },
      map: {
        title: 'Explore Map',
        subtitle: 'See what is happening nearby across neighbourhood streets and areas needing attention',
      },
      inspector: {
        title: 'Neighbourhood Insights',
        subtitle: 'Understand the issue with AI-assisted guidance (suggestions only) and ward trends',
      },
      overview: {
        title: 'Ward Operations',
        subtitle: 'Administrative view for coordinating community reports, priorities, and resolution notes',
      },
      command: {
        title: 'Ward Analytics',
        subtitle: 'Compare wards, examine areas needing attention, and track open vs. resolved reports',
      },
      management: {
        title: 'Community Reports',
        subtitle: 'Review resident submissions, update workflow status, and record resolution history',
      },
      priority: {
        title: 'What Needs Attention First',
        subtitle: 'Transparent rule-based priority queue explained clearly for ward teams and residents',
      },
    },
    categories: {
      road_damage: 'Road Damage',
      garbage: 'Garbage',
      water_leakage: 'Water Supply & Leakage',
      streetlight: 'Streetlight',
      drainage: 'Drainage',
      waterlogging: 'Waterlogging',
      public_safety: 'Public Infrastructure',
      other: 'Other Civic Issue',
    },
    categoriesShort: {
      road_damage: 'Road Damage',
      garbage: 'Garbage',
      water_leakage: 'Water Supply',
      streetlight: 'Streetlight',
      drainage: 'Drainage',
      waterlogging: 'Waterlogging',
      public_safety: 'Infrastructure',
      other: 'Other',
    },
    statuses: {
      Submitted: 'Submitted',
      Reported: 'Reported',
      'Under Review': 'Under Review',
      Assigned: 'Assigned',
      'In Progress': 'In Progress',
      Resolved: 'Resolved',
      Rejected: 'Rejected',
      Reopened: 'Reopened',
    },
    severities: {
      Low: 'Low',
      Medium: 'Medium',
      High: 'High',
      Critical: 'Critical',
    },
    priorityBands: {
      Critical: 'Critical',
      High: 'High',
      Elevated: 'Elevated',
      Standard: 'Standard',
    },
    topbar: {
      searchPlaceholder: 'Track ID (AW-2026-001) or street...',
      searchLabel: 'Search by report ID, ward, or title',
      noMatches: 'No reports match',
      filterInAdmin: 'View all in Community Reports',
      alertsTitle: 'Reports Needing Attention',
      alertsAllResolved: 'All reported neighbourhood issues are resolved.',
      wardOps: 'Ward Team',
      demoLead: 'Operations View',
      wardOpsLead: 'Ward Operations Team',
      mvpSession: 'Illustrative Demo Session',
      priorityFormulaLink: 'What Needs Attention First',
      trackAllComplaints: 'Community Reports',
      restoreDemoQuestion: 'Restore sample demo records?',
      confirm: 'Confirm',
      openMenu: 'Open navigation menu',
      closeMenu: 'Close navigation menu',
      moreMenu: 'More',
    },
    onboarding: {
      kicker: 'YOUR NEIGHBOURHOOD. YOUR VOICE.',
      title: 'Welcome to ApnaWard',
      subtitle:
        'See a pothole, broken streetlight, leaking pipe, or overflowing bin? Share it with your neighbourhood in English or Hindi and follow every step until it is resolved.',
      chooseLanguage: 'Choose your preferred language / अपनी भाषा चुनें',
      step1Title: '1. Report',
      step1Desc: 'Tell us what happened, add a photo if you have one, and mark where you noticed it.',
      step2Title: '2. Track',
      step2Desc: 'Receive a tracking ID to check clear updates and ward notes anytime.',
      step3Title: '3. Improve Together',
      step3Desc: 'Ward teams sort urgent issues first and mark repairs resolved with transparent notes.',
      getStarted: 'Report an Issue',
      trackFirst: 'Track Your Report',
      skip: 'Explore First',
      footerNote: 'Community prototype · Stored locally in your browser · No sign-up required',
    },
    overview: {
      badge: 'Ward Operations Hub',
      heroTitle: 'Ward Operations & Resolution Overview',
      heroSubtitle:
        'Coordinate community reports, inspect transparent priority cues, and keep residents informed across sample neighbourhood wards.',
      submitComplaint: 'Add Community Report',
      totalReports: 'Total Reports',
      acrossWards: 'Across 6 sample wards',
      pendingQueue: 'Pending Reports',
      inActiveWork: 'in active action',
      highCriticalOpen: 'High / Critical Open',
      highScoreHint: 'High/Critical or score 75+',
      resolvedReports: 'Resolved Reports',
      closedWithNotes: 'Marked as resolved with note',
      resolutionRate: 'Resolution Rate',
      prioritySpotlight: 'Highest Attention Report',
      inspectAndUpdate: 'Review & Update',
      categoryBreakdown: 'Issues by Category',
      clickToFilter: 'Click category to filter',
      categoryBreakdownSub: 'Breakdown across all 6 neighbourhood categories in the active dataset.',
      complaintsWord: 'Reports',
      wardPerformance: 'Ward Progress Summary',
      wardPerformanceSub: 'Open workload compared with resolved reports across sample wards.',
      recentReports: 'Recent Community Reports',
      recentReportsSub: 'Latest resident submissions across the ward',
      mapBtn: 'Map',
      allIssuesBtn: 'All Reports',
      activityTimeline: 'Ward Activity Timeline',
      activityTimelineSub: 'Chronological stream of resident reports and ward status updates',
      commandCenterBtn: 'Ward Analytics',
    },
    command: {
      fictionalSample: 'sample record',
      citizenSubmitted: 'resident submitted',
      title: 'Ward Analytics & Spatial Overview',
      subtitle:
        'Ward-level comparison, areas needing attention, and synchronized status updates. Sample ward coordinates are illustrative demo records, not official municipal feeds.',
      openCityMap: 'Open Explore Map',
      adminCommand: 'Community Reports',
      totalReported: 'Total Reported',
      storedComplaints: 'Stored reports',
      openIssues: 'Pending Reports',
      newlyReported: 'awaiting review',
      inProgress: 'In Progress',
      activeDispatch: 'Field action underway',
      resolved: 'Resolved',
      closedWithNotes: 'Marked as resolved',
      highPriority: 'High Priority',
      highCriticalOpen: 'High/Critical open',
      resolutionRate: 'Resolution Rate',
      categoryDist: 'Category Distribution',
      categoryDistSub: 'Click any category to view matching reports in Community Reports',
      totalLabel: 'total',
      allIssuesLabel: 'All Reports',
      wardDist: 'Ward Comparison',
      wardDistSub: 'Click any ward row to filter reports in Community Reports',
      resolvedPctLabel: 'resolved',
      hotspotTitle: 'Areas Needing Attention',
      hotspotSubPrefix: 'Proximity grouping of nearby reports within',
      hotspotSubSuffix:
        '(min 2 reports). Analytical guide only — does not verify an official field emergency.',
      openComplaintsOnly: 'Pending reports only',
      noHotspotsTitle: 'No clustered areas detected within',
      noHotspotsSub:
        'Try increasing the distance radius or turning off "Pending reports only" to see resolved areas.',
      complaintsCount: 'reports',
      openCount: 'open',
      avgPriority: 'Avg Score',
      mostCommonCategory: 'Most Common Issue',
      groupedIds: 'Grouped Report IDs',
      suggestedAttention: 'Suggested Focus:',
      locateCluster: 'See on Map',
      recentActivity: 'Recent Neighbourhood Activity',
      recentActivitySub: 'Live feed shared across resident tracking and Ward Operations',
      allComplaints: 'All Reports',
      urgentQueue: 'What Needs Attention First',
      urgentQueueSub: 'Highest-scoring open reports ready for ward review',
      priorityRules: 'Priority Rules',
    },
    report: {
      stepLabel: 'STEP',
      of: 'OF',
      steps: [
        { title: 'What happened?', subtitle: 'Details, voice & optional photo' },
        { title: 'Where did you notice it?', subtitle: 'Ward, landmark & map pin' },
        { title: 'Submit your report.', subtitle: 'Review details & get ID' },
      ],
      step1Heading: '1. What happened?',
      step1Sub: 'Describe the issue in your own words (type or speak in English or Hindi), or try a quick sample.',
      samplePrefix: 'Try an example:',
      samples: {
        schoolRoad: 'Road crater by school',
        clinicCorner: 'Dark streetlight by clinic',
        blockedDrain: 'Blocked street drain',
      },
      titleLabel: 'Short summary',
      titlePlaceholder: 'e.g. Deep pothole outside St. Xavier School gate',
      categoryLabel: 'What kind of issue is this?',
      severityLabel: 'How urgent does it feel? (Editable)',
      severityOptions: {
        Low: 'Low — Can wait for routine upkeep',
        Medium: 'Medium — Causes daily inconvenience',
        High: 'High — Risky for walkers or riders',
        Critical: 'Critical — Urgent safety or water hazard',
      },
      descriptionLabel: 'Tell us a little more',
      descriptionPlaceholder:
        'Share what you noticed, or tap the microphone to speak in English or Hindi...',
      descriptionHint:
        'Mentioning nearby schools, clinics, bus stops, or waterlogging helps ward teams prioritize accurately.',
      charsUnit: 'chars',
      voiceDictate: 'Speak Instead',
      voiceStop: 'Stop Listening',
      voiceListening: 'Listening... speak naturally. You can edit the text afterward.',
      voiceLangEn: 'EN',
      voiceLangHi: 'हिंदी',
      voiceUnsupported:
        'Voice input is not supported in this browser. Please type your description below.',
      voiceDenied:
        'Microphone permission was denied. Allow mic access in browser settings or type manually.',
      voiceNoMic: 'No microphone was detected on this device. Please type your description manually.',
      voiceNoSpeech: 'No speech detected. Tap the microphone again and speak closer to your device.',
      voiceNetworkErr:
        'Voice recognition service is temporarily unreachable. Please type your description manually.',
      voiceEditableHint: 'Your spoken words appear below and stay fully editable.',
      photoLabel: 'Add a photo if you have one.',
      photoReady: 'Photo attached and compressed cleanly',
      removePhoto: 'Remove',
      dropPhotoPrefix: 'Tap to add a photo, or drag & drop —',
      browseDevice: 'choose file',
      photoFormatsHint: 'JPEG, PNG, or WebP · Optional visual context',
      step2Heading: '2. Where did you notice it?',
      step2Sub:
        'Pick the ward, name a nearby landmark, and tap the map to drop your location pin.',
      wardLabel: 'Ward (Sample Area)',
      landmarkLabel: 'Nearby landmark or street',
      landmarkPlaceholder: 'e.g. Station Road Bus Stop or North Market Chowk',
      step3Heading: '3. Submit your report.',
      step3Sub:
        'Review your details below. You can optionally preview an AI-assisted suggestion ("Understand the Issue") or submit straight away.',
      reviewTitle: 'Summary',
      reviewWard: 'Ward',
      reviewLocality: 'Location & Coordinates',
      reviewDesc: 'Details',
      reviewCatEditable: 'Category (Editable)',
      reviewSevEditable: 'Urgency (Editable)',
      previewAiTitle: 'Optional: Understand the Issue with AI Assistance',
      previewAiSub: 'Offers an advisory category, urgency, and next-step suggestion for human review.',
      analyzeNow: 'Understand the Issue',
      analyzing: 'Checking...',
      quickAiAnalyze: 'Understand the Issue',
      continueToStep: 'Next Step',
      submitComplaint: 'Submit your report',
      submittingComplaint: 'Saving your report...',
      duplicateTitle: 'A similar report is already nearby',
      duplicateSub:
        'Neighbours may have already flagged this spot. Check below so efforts aren’t duplicated, or submit anyway if this is a separate issue.',
      awaySuffix: 'm away',
      matchSignals: 'Why it looks similar:',
      inspectId: 'View',
      confirmSeparate: 'Confirm this is a separate issue not listed above:',
      continueSubmitAnyway: 'Submit as Separate Report',
      aiSidebarTitle: 'Understand the Issue',
      aiSidebarSub: 'AI-assisted helper · Advisory only',
      aiSuggestionOnly: 'AI Suggestion · Human Review Needed',
      aiLoadingText: 'Reviewing your description and optional photo...',
      aiUnavailableTitle: 'AI Helper Unavailable',
      aiUnavailableSub: 'No problem — your manual category and urgency choices are ready to submit.',
      suggestedCategory: 'Suggested Category',
      suggestedSeverity: 'Suggested Urgency',
      whySuggested: 'Why Suggested',
      possibleImpact: 'Who May Be Affected',
      suggestedAction: 'Suggested Next Step',
      photoReview: 'Photo Note:',
      applyAiSuggestion: 'Use Suggested Category & Urgency',
      aiIdleHint:
        'Write or speak a short description first, then optionally click "Understand the Issue" or proceed to submit.',
      livePriorityTitle: 'Attention Priority Preview',
      livePriorityNote:
        'Transparent rule-based estimate only — helps show why urgent spots rise to the top.',
      validationTitleMin: 'Please add a short summary (at least 4 characters).',
      validationDescMin: 'Please share a few more details (at least 12 characters).',
      validationLandmarkMin: 'Please enter a nearby landmark or street (at least 3 characters).',
      validationCoords: 'Please pick valid map coordinates.',
      validationAiNeedInput:
        'Add a summary, description, or photo before running Understand the Issue.',
      successBadge: 'REPORT RECEIVED',
      successHeading: 'Thank you for helping your neighbourhood.',
      successSubtitle:
        'Your report has been saved with a unique tracking ID and is now visible on Explore Map, Track Your Report, and Ward Operations.',
      successAiFallback:
        'AI assistance was unavailable right now, so your report was saved safely using your own category and urgency choices.',
      complaintIdLabel: 'Your Tracking ID',
      wardAndSeverity: 'Ward & Urgency',
      smartPriorityScore: 'Attention Score',
      aiTriageHeading: 'AI-Assisted Understanding (Suggestion Only)',
      trackTimelineBtn: 'Track Your Report',
      viewLiveMapBtn: 'See on Explore Map',
      submitAnotherBtn: 'Report Another Issue',
    },
    track: {
      kicker: 'TRANSPARENT NEIGHBOURHOOD UPDATES',
      title: 'Track Your Report',
      subtitle:
        'Enter your tracking ID (like AW-2026-001) to follow progress step by step and read ward notes.',
      searchLabel: 'Tracking ID or street name',
      searchPlaceholder: 'Enter tracking ID (e.g. AW-2026-001) or landmark...',
      searchBtn: 'Check Status',
      clearBtn: 'Clear',
      quickPickLabel: 'Recent & sample tracking IDs:',
      emptyTitle: 'Enter a Tracking ID to Follow Progress',
      emptySub:
        'Search above or pick one of the recent IDs to see what has happened since the report was submitted.',
      emptyNotFoundTitle: 'No Report Found',
      emptyNotFoundSub:
        'We could not find a report matching that ID or keyword. Check the ID (e.g. AW-2026-001) or submit a new report.',
      reportNewBtn: 'Report an Issue',
      showLatestBtn: 'Show Latest Report',
      complaintIdLabel: 'Tracking ID',
      categoryLabel: 'Category',
      wardLocalityLabel: 'Ward & Location',
      submittedOnLabel: 'Submitted On',
      currentStatusLabel: 'Current Status',
      priorityScoreLabel: 'Attention Score',
      progressTitle: 'Step-by-Step Progress',
      stepReportedDesc: 'Report received and placed in the ward review queue',
      stepInProgressDesc: 'Ward team is reviewing or working on the spot',
      stepResolvedDesc: 'Marked as resolved with a closing note',
      latestAdminUpdate: 'Latest Ward Update',
      citizenDescription: 'What Was Reported',
      attachedPhoto: 'Attached Photo',
      aiSummaryTitle: 'Neighbourhood Insights Note (AI Suggestion)',
      aiSummaryUnavailable:
        'Submitted using citizen-selected category & urgency (AI helper was unavailable).',
      aiNoAnalysisYet: 'No AI-assisted note attached to this report.',
      timelineHistoryTitle: 'Full Update History',
      viewOnMapBtn: 'See on Explore Map',
      openAdminDrawerBtn: 'Open in Ward Operations',
    },
    map: {
      subtitle: 'Neighbourhood Map & Stored Community Reports',
      disclaimer:
        'Sample ward markers represent illustrative demo spots, not verified real-world incidents.',
      hotspotZones: 'Areas Needing Attention',
      mapView: 'Map View',
      listView: 'List View',
      filtersTitle: 'Filter Neighbourhood Map',
      activeCount: 'active',
      shownCount: 'shown',
      reset: 'Reset',
      collapse: 'Hide',
      expand: 'Show',
      searchMap: 'Search Area or ID',
      searchPlaceholder: 'ID (AW-2026-001), street, or keyword...',
      ward: 'Ward',
      allWards: 'All Wards',
      category: 'Category',
      allCategories: 'All Categories',
      status: 'Status',
      allStatuses: 'All Statuses',
      severity: 'Urgency',
      allSeverities: 'All Levels',
      tileFallbackBanner:
        'Map tiles could not load in this environment. Showing the accessible report list instead.',
      retryTiles: 'Retry Map',
      footerHint:
        'Use bottom-right +/- controls or click any map marker to read report details.',
      mapData: 'Map data',
      legendTitle: 'Map Guide',
      legendSub: 'Icon = Issue Type · Color = Urgency · Ring = Progress',
      categoryIcons: 'Issue Types',
      workflowStates: 'Report Status',
      reportedState: 'Reported (pending)',
      inProgressState: 'In Progress (active)',
      resolvedState: 'Resolved (completed)',
      severityColors: 'Urgency Colors',
      legendFooter:
        'Dashed rings mark nearby clusters of multiple reports (Areas Needing Attention).',
      noMatchesTitle: 'No matching neighbourhood reports',
      noMatchesSub: 'Try clearing or widening your ward, category, or status filters.',
    },
    management: {
      subtitle:
        'Select any community report to update status, record ward notes, or mark it as resolved',
      searchPlaceholder: 'Find by ID (AW-2026-001) or keyword...',
      allWards: 'All Wards',
      allCategories: 'All Categories',
      allPriorityBands: 'All Priority Levels',
      allSeverities: 'All Urgency Levels',
      sortPriorityDesc: 'Sort: Highest Attention First',
      sortPriorityAsc: 'Sort: Lowest Attention First',
      sortNewest: 'Sort: Newest Reports',
      sortOldest: 'Sort: Oldest Reports',
      showing: 'Showing',
      of: 'of',
      complaints: 'reports',
      clearFilters: 'Clear Filters',
      emptyTitle: 'No reports match your filters',
      emptySub:
        'Double-check the report ID (e.g. AW-2026-001) or reset your filters to view all community reports.',
      resetAll: 'Reset Filters',
      colId: 'Tracking ID',
      colTitle: 'Report, Category & Street',
      colWard: 'Ward',
      colSeverity: 'Urgency',
      colPriority: 'Attention Score',
      colStatus: 'Status',
      colSubmitted: 'Submitted',
      colAction: 'Action',
      manageStatus: 'Review & Update',
      priorityLabel: 'Attention',
    },
    drawer: {
      closeAria: 'Close report details',
      submitted: 'Submitted',
      locateOnMap: 'See on Map',
      wardAndLandmark: 'Ward & Street Landmark',
      coordinates: 'Pin Location:',
      illustrativeGrid: 'Sample grid',
      citizenDescription: 'Citizen Description',
      attachedPhoto: 'Attached Photo',
      smartPriorityTitle: 'What Needs Attention First Score',
      severityFactor: 'Urgency',
      impactFactor: 'Community Impact',
      waitingFactor: 'Waiting Time',
      priorityDisclaimer:
        'Transparent rule-based prioritization aid only — human review determines final action.',
      aiSuggestionTitle: 'AI-Assisted Understanding (Suggestion Only)',
      editedByCitizen: 'Edited by resident',
      whySuggested: 'Why Suggested:',
      possibleImpact: 'Who May Be Affected:',
      nextAction: 'Suggested Next Step:',
      fallbackNotice:
        'Submitted with manual selection because AI assistance was unavailable.',
      adminUpdateTitle: 'Ward Operations Status Update',
      adminUpdateSub:
        'Move status (Reported → In Progress → Resolved) and add a transparent public note.',
      adminNoteLabel: 'Public Ward Note',
      adminNotePlaceholder: 'e.g. Crew inspected the junction; cold-mix patch scheduled for 4 PM.',
      noteError: 'Choose a new status or write a short update note to save in the timeline.',
      savedPrefix: 'Updated to',
      savedSuffix: 'and saved locally.',
      saveUpdateBtn: 'Save Update',
      markResolvedBtn: 'Mark as Resolved',
      timelineTitle: 'Resolution History',
    },
    inspector: {
      topCategory: 'Most Reported Issue',
      ofActive: 'of active reports',
      meanPriority: 'Average Open Attention Score',
      includeAiHint: 'reports have AI-assisted notes',
      severityMix: 'Urgency Breakdown',
      severityMixSub: 'Share across Critical, High, Medium, and Low',
      categoryDist: 'Category Distribution',
      categoryDistSub: 'Report count & AI-assisted review coverage',
      wardComp: 'Ward Breakdown',
      wardCompSub: 'Open vs. resolved reports & average attention score',
      priorityDrivers: 'What Drives Attention Scores',
      avgSeverity: 'Avg Urgency Weight',
      avgImpact: 'Avg Community Impact',
      avgWaiting: 'Avg Wait Time Points',
      insightsNote:
        'Numbers come directly from stored demo & citizen records. AI insights are advisory suggestions only and never replace human judgement.',
      sandboxTitle: 'Understand the Issue — AI Insights Helper',
      sandboxSub:
        'Powered by server-side Gemini analysis. Suggests category, urgency, who may be affected, and a next step — always clearly marked as a suggestion.',
      loadExisting: 'Pick an existing report to examine...',
      titleOptional: 'Short Summary (Optional)',
      areaOptional: 'Ward / Street Context (Optional)',
      descLabel: 'Issue Description',
      descPlaceholder: 'Describe a neighbourhood issue to preview AI-assisted insights...',
      photoOptional: 'Photo Attachment (Optional)',
      uploadPhotoHint: 'Add a photo for visual context',
      skipAiManual: 'Report Manually Instead',
      runAiInspection: 'Understand the Issue',
      analyzing: 'Checking...',
      outputTitle: 'AI-Assisted Insight (Suggestion Only)',
      suggestionOnly: 'Advisory Suggestion · Human Review Needed',
      loadingText: 'Generating neighbourhood insight suggestion...',
      unavailableTitle: 'AI Insights Helper Unavailable',
      proceedManual: 'Open Manual Report Form',
      whySuggested: 'Why This Was Suggested',
      possibleImpact: 'Who May Be Affected',
      recommendedAction: 'Suggested Next Step',
      imageAssessment: 'Photo Context Note',
      prefillReport: 'Start a Report with These Suggestions',
      emptyTitle: 'Ready to help understand an issue',
      emptySub:
        'Select an existing report above or describe a street issue and click "Understand the Issue" to view advisory guidance.',
    },
    priorityPage: {
      title: 'What Needs Attention First',
      subtitle:
        'Every report gets a clear 0–100 score using transparent rules so both residents and ward teams see why urgent spots appear at the top.',
      disclaimer: 'Transparent priority guide — human teams confirm final field action',
      rule1Title: '1. Urgency Level',
      rule1Desc:
        'Critical = 45 pts · High = 36 pts · Medium = 22 pts · Low = 10 pts.',
      rule2Title: '2. Community Impact',
      rule2Desc:
        'Accounts for issue type and proximity to schools, clinics, transit stops, or waterlogging.',
      rule3Title: '3. Waiting Time',
      rule3Desc:
        'Unresolved reports gain +1 pt every 6 hours waiting (max 20 pts). Resets once Resolved.',
      rankedQueue: 'Attention Queue',
      complaintsShown: 'reports shown',
      includeResolved: 'Include resolved reports',
      bandSuffix: 'Attention',
    },
    toasts: {
      createdTitlePrefix: 'Report',
      createdTitleSuffix: 'received',
      createdDesc: 'Visible now on Explore Map, Track Your Report, and Ward Operations.',
      updatedMiddle: 'marked',
      updatedDesc: 'Update saved to timeline across all pages.',
      resetTitle: 'Sample demo data restored',
      resetDescPrefix: 'Loaded',
      resetDescSuffix: 'illustrative neighbourhood reports.',
    },
  },
  hi: {
    common: {
      appName: 'ApnaWard',
      appTagline: 'आपका मोहल्ला. आपकी आवाज़.',
      skipToContent: 'मुख्य सामग्री पर जाएं',
      languageLabel: 'भाषा',
      demoData: 'डेमो डेटा',
      demoModeTitle: 'डेमो डेटा मोड',
      demoModeDesc:
        'नमूना स्थान और वार्ड रिकॉर्ड आपके ब्राउज़र में उदाहरण डेटा हैं, कोई आधिकारिक सरकारी पोर्टल नहीं।',
      reportIssueCta: 'समस्या बताएं',
      reportShort: 'रिपोर्ट',
      resetDemoData: 'डेमो डेटा रीसेट करें',
      confirmResetPrompt: 'क्या उदाहरण डेमो डेटा वापस लाएं?',
      confirmResetBtn: 'पुष्टि करें',
      cancel: 'रद्द करें',
      inspect: 'देखें',
      viewOnMap: 'नक्शे पर देखें',
      all: 'सभी',
      open: 'लंबित',
      resolved: 'समाधान हो गया',
      close: 'बंद करें',
      back: 'वापस',
      submit: 'जमा करें',
      citizen: 'नागरिक',
      demo: 'डेमो',
      notVerifiedFact: 'केवल सलाहकार सुझाव',
      welcomeGuide: 'सामुदायिक परिचय गाइड',
    },
    guideNav: {
      storyGroup: 'मोहल्ले के लिए',
      workspaceGroup: 'नागरिक सेवाएँ',
      opsGroup: 'वार्ड संचालन',
      whyApnaWard: 'ApnaWard परिचय',
      howItWorks: 'यह कैसे काम करता है',
      platformFeatures: 'प्लेटफ़ॉर्म देखें',
      about: 'विश्वास और पारदर्शिता',
      liveDashboard: 'वार्ड संचालन',
      tourCta: '60-सेकंड टूर',
      judgeDemoCta: 'निर्देशित डेमो',
      demoModeBadge: 'डेमो मोड',
      resumeJudgeDemo: 'निर्देशित डेमो फिर खोलें',
    },
    nav: {
      home: 'होम',
      report: 'रिपोर्ट करें',
      track: 'अपनी रिपोर्ट ट्रैक करें',
      map: 'नक्शा देखें',
      inspector: 'मोहल्ला अंतर्दृष्टि',
      overview: 'वार्ड संचालन',
      command: 'वार्ड विश्लेषण',
      management: 'सामुदायिक रिपोर्ट',
      priority: 'क्या पहले ध्यान मांगता है',
    },
    pageMeta: {
      home: {
        title: 'ApnaWard',
        subtitle: 'आपका मोहल्ला. आपकी आवाज़. — छोटी रिपोर्ट. बेहतर मोहल्ले.',
      },
      report: {
        title: 'समस्या की रिपोर्ट करें',
        subtitle: 'क्या हुआ? स्थान बताएं, फ़ोटो जोड़ें और अपनी ट्रैकिंग ID पाएं',
      },
      track: {
        title: 'अपनी रिपोर्ट ट्रैक करें',
        subtitle: 'अपनी रिपोर्ट ID से हर कदम की प्रगति और वार्ड अपडेट देखें',
      },
      map: {
        title: 'नक्शा देखें',
        subtitle: 'जानें आपके आस-पास क्या हो रहा है और कौन-से क्षेत्र ध्यान मांगते हैं',
      },
      inspector: {
        title: 'मोहल्ला अंतर्दृष्टि',
        subtitle: 'समस्या को समझें — AI-सहायता प्राप्त सुझाव (सलाह मात्र) और वार्ड रुझान',
      },
      overview: {
        title: 'वार्ड संचालन',
        subtitle: 'सामुदायिक रिपोर्ट, प्राथमिकता और समाधान नोट्स प्रबंधित करने का दृश्य',
      },
      command: {
        title: 'वार्ड विश्लेषण',
        subtitle: 'वार्डों की तुलना करें, ध्यान देने योग्य क्षेत्र पहचानें और समाधान दर देखें',
      },
      management: {
        title: 'सामुदायिक रिपोर्ट',
        subtitle: 'नागरिक रिपोर्ट जांचें, स्थिति बदलें और समाधान इतिहास दर्ज करें',
      },
      priority: {
        title: 'क्या पहले ध्यान मांगता है',
        subtitle: 'नागरिकों और वार्ड टीम के लिए पारदर्शी नियम-आधारित प्राथमिकता क्रम',
      },
    },
    categories: {
      road_damage: 'सड़क क्षति',
      garbage: 'कचरा और सफ़ाई',
      water_leakage: 'जल आपूर्ति / रिसाव',
      streetlight: 'स्ट्रीटलाइट खराब',
      drainage: 'जल निकासी / नाला',
      waterlogging: 'जलभराव',
      public_safety: 'सार्वजनिक बुनियादी ढांचा',
      other: 'अन्य नागरिक समस्या',
    },
    categoriesShort: {
      road_damage: 'सड़क क्षति',
      garbage: 'कचरा',
      water_leakage: 'जल आपूर्ति',
      streetlight: 'स्ट्रीटलाइट',
      drainage: 'जल निकासी',
      waterlogging: 'जलभराव',
      public_safety: 'बुनियादी ढांचा',
      other: 'अन्य',
    },
    statuses: {
      Submitted: 'प्रस्तुत',
      Reported: 'दर्ज',
      'Under Review': 'समीक्षाधीन',
      Assigned: 'सौंपा गया',
      'In Progress': 'प्रगति में',
      Resolved: 'समाधान हो गया',
      Rejected: 'अस्वीकृत',
      Reopened: 'पुनः खोला गया',
    },
    severities: {
      Low: 'कम',
      Medium: 'मध्यम',
      High: 'उच्च',
      Critical: 'अत्यंत गंभीर',
    },
    priorityBands: {
      Critical: 'अत्यंत गंभीर',
      High: 'उच्च',
      Elevated: 'मध्यम-उच्च',
      Standard: 'सामान्य',
    },
    topbar: {
      searchPlaceholder: 'रिपोर्ट ID (AW-2026-001) या जगह खोजें...',
      searchLabel: 'रिपोर्ट ID, वार्ड या शीर्षक से खोजें',
      noMatches: 'कोई रिपोर्ट नहीं मिली:',
      filterInAdmin: 'सामुदायिक रिपोर्ट में सभी देखें',
      alertsTitle: 'ध्यान मांगने वाली रिपोर्टें',
      alertsAllResolved: 'सभी दर्ज समस्याओं का समाधान हो गया है।',
      wardOps: 'वार्ड टीम',
      demoLead: 'संचालन दृश्य',
      wardOpsLead: 'वार्ड संचालन टीम',
      mvpSession: 'उदाहरण डेमो सत्र',
      priorityFormulaLink: 'क्या पहले ध्यान मांगता है',
      trackAllComplaints: 'सामुदायिक रिपोर्ट',
      restoreDemoQuestion: 'उदाहरण डेमो डेटा वापस लाएं?',
      confirm: 'पुष्टि करें',
      openMenu: 'नेविगेशन मेनू खोलें',
      closeMenu: 'नेविगेशन मेनू बंद करें',
      moreMenu: 'मेनू',
    },
    onboarding: {
      kicker: 'आपका मोहल्ला. आपकी आवाज़.',
      title: 'ApnaWard में आपका स्वागत है',
      subtitle:
        'सड़क का गड्ढा, बंद स्ट्रीटलाइट, पानी का रिसाव या कचरे की समस्या दिखे? हिंदी या अंग्रेज़ी में आसानी से बताएं और समाधान तक हर कदम देखें।',
      chooseLanguage: 'अपनी भाषा चुनें / Choose your language',
      step1Title: '1. रिपोर्ट करें',
      step1Desc: 'बताएं क्या हुआ, चाहें तो फ़ोटो जोड़ें और नक्शे पर जगह चिह्नित करें।',
      step2Title: '2. ट्रैक करें',
      step2Desc: 'अपनी यूनिक ID से कभी भी ताज़ा स्थिति और वार्ड अपडेट देखें।',
      step3Title: '3. मिलकर सुधारें',
      step3Desc: 'वार्ड टीम ज़रूरी मुद्दों को पहले चुनती है और समाधान नोट लिखती है।',
      getStarted: 'समस्या बताएं',
      trackFirst: 'अपनी रिपोर्ट ट्रैक करें',
      skip: 'पहले प्लेटफ़ॉर्म देखें',
      footerNote: 'सामुदायिक प्रोटोटाइप · डेटा आपके ब्राउज़र में सहेजा गया · लॉगिन आवश्यक नहीं',
    },
    overview: {
      badge: 'वार्ड संचालन केंद्र',
      heroTitle: 'वार्ड संचालन और समाधान अवलोकन',
      heroSubtitle:
        'सामुदायिक रिपोर्टों का समन्वय करें, पारदर्शी प्राथमिकता देखें और सभी नमूना वार्डों में प्रगति साझा करें।',
      submitComplaint: 'नई रिपोर्ट जोड़ें',
      totalReports: 'कुल रिपोर्टें',
      acrossWards: '6 नमूना वार्डों में',
      pendingQueue: 'लंबित रिपोर्टें',
      inActiveWork: 'कार्रवाई प्रगति में',
      highCriticalOpen: 'उच्च / गंभीर लंबित',
      highScoreHint: 'उच्च/गंभीर या स्कोर 75+',
      resolvedReports: 'समाधान हो चुकीं',
      closedWithNotes: 'समाधान नोट सहित पूर्ण',
      resolutionRate: 'समाधान दर',
      prioritySpotlight: 'सबसे पहले ध्यान देने योग्य',
      inspectAndUpdate: 'जांचें और अपडेट करें',
      categoryBreakdown: 'श्रेणी के अनुसार रिपोर्ट',
      clickToFilter: 'फ़िल्टर करने के लिए चुनें',
      categoryBreakdownSub: 'सक्रिय डेटासेट में सभी 6 श्रेणियों का वितरण।',
      complaintsWord: 'रिपोर्टें',
      wardPerformance: 'वार्ड प्रगति सारांश',
      wardPerformanceSub: 'नमूना वार्डों में लंबित बनाम हल की गई रिपोर्टों की तुलना।',
      recentReports: 'हालिया सामुदायिक रिपोर्टें',
      recentReportsSub: 'मोहल्ले में दर्ज नवीनतम रिपोर्टें',
      mapBtn: 'नक्शा',
      allIssuesBtn: 'सभी रिपोर्टें',
      activityTimeline: 'वार्ड गतिविधि समयरेखा',
      activityTimelineSub: 'नागरिक रिपोर्टों और वार्ड अपडेट का क्रमवार विवरण',
      commandCenterBtn: 'वार्ड विश्लेषण',
    },
    command: {
      fictionalSample: 'नमूना रिकॉर्ड',
      citizenSubmitted: 'नागरिक द्वारा दर्ज',
      title: 'वार्ड विश्लेषण एवं स्थानिक दृश्य',
      subtitle:
        'वार्ड-वार तुलना, ध्यान देने योग्य क्षेत्र और स्थिति समन्वय। नमूना निर्देशांक केवल उदाहरण हैं।',
      openCityMap: 'नक्शा खोलें',
      adminCommand: 'सामुदायिक रिपोर्ट',
      totalReported: 'कुल दर्ज',
      storedComplaints: 'संग्रहीत रिपोर्टें',
      openIssues: 'लंबित रिपोर्टें',
      newlyReported: 'समीक्षा प्रतीक्षारत',
      inProgress: 'प्रगति में',
      activeDispatch: 'टीम कार्यरत',
      resolved: 'समाधान हो गया',
      closedWithNotes: 'समाधान हो गया चिह्नित',
      highPriority: 'उच्च प्राथमिकता',
      highCriticalOpen: 'गंभीर/उच्च लंबित',
      resolutionRate: 'समाधान दर',
      categoryDist: 'श्रेणी-वार वितरण',
      categoryDistSub: 'सामुदायिक रिपोर्ट में देखने के लिए किसी श्रेणी पर क्लिक करें',
      totalLabel: 'कुल',
      allIssuesLabel: 'सभी रिपोर्टें',
      wardDist: 'वार्ड तुलना',
      wardDistSub: 'सामुदायिक रिपोर्ट में फ़िल्टर करने के लिए वार्ड चुनें',
      resolvedPctLabel: 'हल',
      hotspotTitle: 'ध्यान देने योग्य क्षेत्र',
      hotspotSubPrefix: 'के भीतर नज़दीकी रिपोर्टों का समूह',
      hotspotSubSuffix:
        '(कम से कम 2 रिपोर्ट)। यह केवल विश्लेषणात्मक संकेत है — आधिकारिक पुष्टि नहीं।',
      openComplaintsOnly: 'केवल लंबित रिपोर्टें',
      noHotspotsTitle: 'इस दायरे में कोई समूहित क्षेत्र नहीं मिला:',
      noHotspotsSub:
        'हल हो चुके क्षेत्र देखने के लिए दूरी बढ़ाएं या "केवल लंबित रिपोर्टें" बंद करें।',
      complaintsCount: 'रिपोर्टें',
      openCount: 'लंबित',
      avgPriority: 'औसत स्कोर',
      mostCommonCategory: 'प्रमुख समस्या',
      groupedIds: 'संबद्ध रिपोर्ट IDs',
      suggestedAttention: 'सुझावित ध्यान:',
      locateCluster: 'नक्शे पर देखें',
      recentActivity: 'हालिया मोहल्ला गतिविधि',
      recentActivitySub: 'नागरिक ट्रैकिंग और वार्ड संचालन में साझा लाइव फ़ीड',
      allComplaints: 'सभी रिपोर्टें',
      urgentQueue: 'क्या पहले ध्यान मांगता है',
      urgentQueueSub: 'वार्ड समीक्षा के लिए सर्वाधिक स्कोर वाली लंबित रिपोर्टें',
      priorityRules: 'प्राथमिकता नियम',
    },
    report: {
      stepLabel: 'चरण',
      of: '/',
      steps: [
        { title: 'क्या हुआ?', subtitle: 'विवरण, आवाज़ व फ़ोटो' },
        { title: 'आपने इसे कहाँ देखा?', subtitle: 'वार्ड, पहचान व नक्शा पिन' },
        { title: 'अपनी रिपोर्ट जमा करें.', subtitle: 'पुष्टि करें और ID पाएं' },
      ],
      step1Heading: '1. क्या हुआ?',
      step1Sub: 'अपनी भाषा में लिखें या माइक से बोलें, या नीचे दिए उदाहरण आज़माएं।',
      samplePrefix: 'उदाहरण चुनें:',
      samples: {
        schoolRoad: 'स्कूल के पास सड़क गड्ढा',
        clinicCorner: 'क्लिनिक के पास अंधेरा',
        blockedDrain: 'बंद नाला व जलभराव',
      },
      titleLabel: 'संक्षिप्त शीर्षक',
      titlePlaceholder: 'उदा. सेंट ज़ेवियर स्कूल गेट के बाहर गहरा गड्ढा',
      categoryLabel: 'यह किस प्रकार की समस्या है?',
      severityLabel: 'यह कितनी ज़रूरी लगती है? (बदल सकते हैं)',
      severityOptions: {
        Low: 'कम — नियमित रखरखाव में ठीक हो सकता है',
        Medium: 'मध्यम — दैनिक आवागमन में असुविधा',
        High: 'उच्च — पैदल या वाहन चालकों के लिए जोखिम',
        Critical: 'अत्यंत गंभीर — तत्काल ध्यान आवश्यक',
      },
      descriptionLabel: 'थोड़ा और विवरण बताएं',
      descriptionPlaceholder:
        'बताएं आपने क्या देखा, या हिंदी/अंग्रेज़ी में बोलने के लिए माइक बटन दबाएं...',
      descriptionHint:
        'पास के स्कूल, क्लिनिक, बस स्टॉप या जलभराव का ज़िक्र करने से सही प्राथमिकता तय होती है।',
      charsUnit: 'अक्षर',
      voiceDictate: 'बोलकर लिखें',
      voiceStop: 'सुनना रोकें',
      voiceListening: 'सुन रहा है... सहजता से बोलें। बाद में आप पाठ बदल सकते हैं।',
      voiceLangEn: 'EN',
      voiceLangHi: 'हिंदी',
      voiceUnsupported:
        'इस ब्राउज़र में बोलकर लिखने की सुविधा उपलब्ध नहीं है। कृपया नीचे टाइप करें।',
      voiceDenied:
        'माइक्रोफ़ोन की अनुमति नहीं मिली। ब्राउज़र सेटिंग में अनुमति दें या टाइप करें।',
      voiceNoMic: 'डिवाइस पर माइक्रोफ़ोन नहीं मिला। कृपया टाइप करें।',
      voiceNoSpeech: 'आवाज़ सुनाई नहीं दी। माइक फिर दबाएं और स्पष्ट बोलें।',
      voiceNetworkErr: 'वॉइस सेवा अभी अनुपलब्ध है। कृपया टाइप करें।',
      voiceEditableHint: 'बोला गया पाठ नीचे जुड़ जाएगा और जमा करने से पहले बदला जा सकता है।',
      photoLabel: 'यदि आपके पास फ़ोटो है तो जोड़ें।',
      photoReady: 'फ़ोटो सुरक्षित रूप से संलग्न हो गई',
      removePhoto: 'हटाएं',
      dropPhotoPrefix: 'फ़ोटो जोड़ने के लिए टैप करें या यहाँ खींचें —',
      browseDevice: 'फ़ाइल चुनें',
      photoFormatsHint: 'JPEG, PNG या WebP · वैकल्पिक दृश्य संदर्भ',
      step2Heading: '2. आपने इसे कहाँ देखा?',
      step2Sub: 'वार्ड चुनें, नज़दीकी पहचान लिखें और नक्शे पर स्थान पिन करें।',
      wardLabel: 'वार्ड (नमूना क्षेत्र)',
      landmarkLabel: 'नज़दीकी लैंडमार्क या गली',
      landmarkPlaceholder: 'उदा. स्टेशन रोड बस स्टॉप या मुख्य बाज़ार चौक',
      step3Heading: '3. अपनी रिपोर्ट जमा करें.',
      step3Sub:
        'विवरण जांचें। आप चाहें तो "समस्या को समझें" (AI सुझाव) देख सकते हैं या सीधे जमा कर सकते हैं।',
      reviewTitle: 'सारांश',
      reviewWard: 'वार्ड',
      reviewLocality: 'स्थान और निर्देशांक',
      reviewDesc: 'विवरण',
      reviewCatEditable: 'श्रेणी (बदली जा सकती है)',
      reviewSevEditable: 'गंभीरता (बदली जा सकती है)',
      previewAiTitle: 'वैकल्पिक: AI सहायता से समस्या को समझें',
      previewAiSub: 'मानव समीक्षा के लिए श्रेणी, गंभीरता और अगला कदम सुझाता है।',
      analyzeNow: 'समस्या को समझें',
      analyzing: 'जांच हो रही है...',
      quickAiAnalyze: 'समस्या को समझें',
      continueToStep: 'आगे बढ़ें — चरण',
      submitComplaint: 'अपनी रिपोर्ट जमा करें',
      submittingComplaint: 'रिपोर्ट सहेजी जा रही है...',
      duplicateTitle: 'पास में ऐसी ही एक रिपोर्ट पहले से मौजूद है',
      duplicateSub:
        'संभव है किसी पड़ोसी ने यह समस्या पहले ही दर्ज की हो। नीचे देखें, या अलग घटना होने पर जमा करें।',
      awaySuffix: 'मी. दूर',
      matchSignals: 'समानता के कारण:',
      inspectId: 'देखें',
      confirmSeparate: 'पुष्टि करें कि यह ऊपर से अलग नई समस्या है:',
      continueSubmitAnyway: 'अलग रिपोर्ट के रूप में जमा करें',
      aiSidebarTitle: 'समस्या को समझें',
      aiSidebarSub: 'AI-सहायता प्राप्त गाइड · केवल सुझाव',
      aiSuggestionOnly: 'AI सुझाव · मानव समीक्षा आवश्यक',
      aiLoadingText: 'आपके विवरण और फ़ोटो की समीक्षा हो रही है...',
      aiUnavailableTitle: 'AI सहायता अनुपलब्ध',
      aiUnavailableSub: 'कोई बात नहीं — आपकी चुनी हुई श्रेणी और गंभीरता के साथ रिपोर्ट जमा हो जाएगी।',
      suggestedCategory: 'सुझावित श्रेणी',
      suggestedSeverity: 'सुझावित गंभीरता',
      whySuggested: 'सुझाव का कारण',
      possibleImpact: 'किस पर असर पड़ सकता है',
      suggestedAction: 'सुझावित अगला कदम',
      photoReview: 'फ़ोटो टिप्पणी:',
      applyAiSuggestion: 'सुझावित श्रेणी व गंभीरता लागू करें',
      aiIdleHint:
        'पहले थोड़ा विवरण लिखें या बोलें, फिर चाहें तो "समस्या को समझें" दबाएं या सीधे जमा करें।',
      livePriorityTitle: 'ध्यान प्राथमिकता पूर्वावलोकन',
      livePriorityNote:
        'केवल पारदर्शी नियम-आधारित अनुमान — दिखाता है कि ज़रूरी मुद्दे ऊपर क्यों आते हैं।',
      validationTitleMin: 'कृपया कम से कम 4 अक्षरों का संक्षिप्त शीर्षक लिखें।',
      validationDescMin: 'कृपया कम से कम 12 अक्षरों में थोड़ा विवरण लिखें।',
      validationLandmarkMin: 'कृपया कम से कम 3 अक्षरों का लैंडमार्क या गली लिखें।',
      validationCoords: 'कृपया मान्य मानचित्र निर्देशांक चुनें।',
      validationAiNeedInput:
        '"समस्या को समझें" चलाने के लिए पहले शीर्षक, विवरण या फ़ोटो जोड़ें।',
      successBadge: 'रिपोर्ट दर्ज हो गई',
      successHeading: 'अपने मोहल्ले की मदद करने के लिए धन्यवाद.',
      successSubtitle:
        'आपकी रिपोर्ट एक यूनिक ट्रैकिंग ID के साथ सहेजी गई है और अब नक्शा, रिपोर्ट ट्रैकर व वार्ड संचालन में दिखाई देगी।',
      successAiFallback:
        'इस समय AI सहायता उपलब्ध नहीं थी, इसलिए आपकी रिपोर्ट आपकी चुनी हुई श्रेणी के साथ सुरक्षित सहेजी गई।',
      complaintIdLabel: 'आपकी ट्रैकिंग ID',
      wardAndSeverity: 'वार्ड और गंभीरता',
      smartPriorityScore: 'प्राथमिकता स्कोर',
      aiTriageHeading: 'AI-सहायता प्राप्त समझ (केवल सुझाव)',
      trackTimelineBtn: 'अपनी रिपोर्ट ट्रैक करें',
      viewLiveMapBtn: 'नक्शे पर देखें',
      submitAnotherBtn: 'एक और समस्या बताएं',
    },
    track: {
      kicker: 'पारदर्शी मोहल्ला अपडेट',
      title: 'अपनी रिपोर्ट ट्रैक करें',
      subtitle:
        'कदम-दर-कदम प्रगति और वार्ड टीम की टिप्पणियाँ देखने के लिए अपनी ट्रैकिंग ID (जैसे AW-2026-001) दर्ज करें।',
      searchLabel: 'ट्रैकिंग ID या गली का नाम',
      searchPlaceholder: 'रिपोर्ट ID (जैसे AW-2026-001) या लैंडमार्क लिखें...',
      searchBtn: 'स्थिति देखें',
      clearBtn: 'साफ़ करें',
      quickPickLabel: 'हालिया एवं नमूना ट्रैकिंग IDs:',
      emptyTitle: 'प्रगति देखने के लिए ट्रैकिंग ID दर्ज करें',
      emptySub:
        'ऊपर खोजें या नीचे किसी हालिया ID को चुनकर देखें कि रिपोर्ट दर्ज होने के बाद क्या कार्रवाई हुई।',
      emptyNotFoundTitle: 'कोई रिपोर्ट नहीं मिली',
      emptyNotFoundSub:
        'इस ID या शब्द से कोई रिपोर्ट नहीं मिली। कृपया ID जांचें (जैसे AW-2026-001) या नई रिपोर्ट भेजें।',
      reportNewBtn: 'समस्या बताएं',
      showLatestBtn: 'नवीनतम रिपोर्ट दिखाएं',
      complaintIdLabel: 'ट्रैकिंग ID',
      categoryLabel: 'श्रेणी',
      wardLocalityLabel: 'वार्ड और स्थान',
      submittedOnLabel: 'दर्ज तिथि',
      currentStatusLabel: 'वर्तमान स्थिति',
      priorityScoreLabel: 'प्राथमिकता स्कोर',
      progressTitle: 'कदम-दर-कदम प्रगति',
      stepReportedDesc: 'रिपोर्ट प्राप्त हुई और वार्ड समीक्षा कतार में है',
      stepInProgressDesc: 'वार्ड टीम स्थान की जांच या कार्य कर रही है',
      stepResolvedDesc: 'समाधान नोट के साथ पूर्ण चिह्नित',
      latestAdminUpdate: 'नवीनतम वार्ड अपडेट',
      citizenDescription: 'क्या रिपोर्ट किया गया',
      attachedPhoto: 'संलग्न फ़ोटो',
      aiSummaryTitle: 'मोहल्ला अंतर्दृष्टि नोट (AI सुझाव)',
      aiSummaryUnavailable:
        'नागरिक द्वारा चुनी गई श्रेणी और गंभीरता के साथ दर्ज (AI सहायता अनुपलब्ध थी)।',
      aiNoAnalysisYet: 'इस रिपोर्ट के साथ कोई AI सुझाव नोट संलग्न नहीं है।',
      timelineHistoryTitle: 'पूर्ण अपडेट इतिहास',
      viewOnMapBtn: 'नक्शे पर देखें',
      openAdminDrawerBtn: 'वार्ड संचालन में खोलें',
    },
    map: {
      subtitle: 'मोहल्ला मानचित्र एवं संग्रहीत रिपोर्टें',
      disclaimer:
        'नमूना वार्ड पिन केवल उदाहरण स्थान दिखाते हैं, वास्तविक सरकारी घटनाएँ नहीं।',
      hotspotZones: 'ध्यान देने योग्य क्षेत्र',
      mapView: 'नक्शा दृश्य',
      listView: 'सूची दृश्य',
      filtersTitle: 'नक्शा फ़िल्टर व खोज',
      activeCount: 'सक्रिय',
      shownCount: 'प्रदर्शित',
      reset: 'रीसेट',
      collapse: 'छुपाएं',
      expand: 'दिखाएं',
      searchMap: 'स्थान या ID खोजें',
      searchPlaceholder: 'ID (AW-2026-001), गली या शब्द...',
      ward: 'वार्ड',
      allWards: 'सभी वार्ड',
      category: 'श्रेणी',
      allCategories: 'सभी श्रेणियां',
      status: 'स्थिति',
      allStatuses: 'सभी स्थितियां',
      severity: 'गंभीरता',
      allSeverities: 'सभी स्तर',
      tileFallbackBanner:
        'इस वातावरण में मानचित्र टाइल्स लोड नहीं हो सकीं। सुलभ रिपोर्ट सूची दिखाई जा रही है।',
      retryTiles: 'पुनः प्रयास करें',
      footerHint: 'ज़ूम करने के लिए नीचे दाईं ओर +/- बटन दबाएं या विवरण के लिए पिन चुनें।',
      mapData: 'मानचित्र डेटा',
      legendTitle: 'नक्शा संकेत',
      legendSub: 'चिह्न = प्रकार · रंग = गंभीरता · घेरा = प्रगति',
      categoryIcons: 'समस्या के प्रकार',
      workflowStates: 'रिपोर्ट स्थिति',
      reportedState: 'दर्ज (लंबित)',
      inProgressState: 'प्रगति में (सक्रिय)',
      resolvedState: 'समाधान हो गया (पूर्ण)',
      severityColors: 'गंभीरता रंग',
      legendFooter: 'डैश घेरे आस-पास की कई रिपोर्टों वाले क्षेत्र (ध्यान देने योग्य क्षेत्र) दिखाते हैं।',
      noMatchesTitle: 'कोई मेल खाती रिपोर्ट नहीं मिली',
      noMatchesSub: 'रिपोर्ट देखने के लिए वार्ड, श्रेणी या स्थिति फ़िल्टर बदलें।',
    },
    management: {
      subtitle:
        'स्थिति बदलने, वार्ड नोट जोड़ने या समाधान हो गया चिह्नित करने के लिए कोई रिपोर्ट चुनें',
      searchPlaceholder: 'ID (AW-2026-001) या शब्द से खोजें...',
      allWards: 'सभी वार्ड',
      allCategories: 'सभी श्रेणियां',
      allPriorityBands: 'सभी प्राथमिकता स्तर',
      allSeverities: 'सभी गंभीरता स्तर',
      sortPriorityDesc: 'क्रम: सबसे पहले ध्यान मांगने वाली',
      sortPriorityAsc: 'क्रम: कम प्राथमिकता पहले',
      sortNewest: 'क्रम: नवीनतम रिपोर्ट',
      sortOldest: 'क्रम: पुरानी रिपोर्ट',
      showing: 'प्रदर्शित:',
      of: '/',
      complaints: 'रिपोर्टें',
      clearFilters: 'फ़िल्टर हटाएं',
      emptyTitle: 'फ़िल्टर से कोई रिपोर्ट नहीं मिली',
      emptySub: 'रिपोर्ट ID (जैसे AW-2026-001) जांचें या सभी फ़िल्टर रीसेट करें।',
      resetAll: 'सभी फ़िल्टर रीसेट करें',
      colId: 'ट्रैकिंग ID',
      colTitle: 'रिपोर्ट, श्रेणी और स्थान',
      colWard: 'वार्ड',
      colSeverity: 'गंभीरता',
      colPriority: 'ध्यान स्कोर',
      colStatus: 'स्थिति',
      colSubmitted: 'दर्ज',
      colAction: 'कार्रवाई',
      manageStatus: 'समीक्षा व अपडेट',
      priorityLabel: 'प्राथमिकता',
    },
    drawer: {
      closeAria: 'विवरण बंद करें',
      submitted: 'दर्ज:',
      locateOnMap: 'नक्शे पर देखें',
      wardAndLandmark: 'वार्ड और गली की पहचान',
      coordinates: 'पिन स्थान:',
      illustrativeGrid: 'नमूना ग्रिड',
      citizenDescription: 'नागरिक विवरण',
      attachedPhoto: 'संलग्न फ़ोटो',
      smartPriorityTitle: 'क्या पहले ध्यान मांगता है स्कोर',
      severityFactor: 'गंभीरता',
      impactFactor: 'सामुदायिक प्रभाव',
      waitingFactor: 'प्रतीक्षा समय',
      priorityDisclaimer:
        'केवल पारदर्शी प्राथमिकता सहायता — अंतिम कार्रवाई मानव समीक्षा से तय होती है।',
      aiSuggestionTitle: 'AI-सहायता प्राप्त समझ (केवल सुझाव)',
      editedByCitizen: 'नागरिक द्वारा संपादित',
      whySuggested: 'सुझाव का कारण:',
      possibleImpact: 'किस पर असर पड़ सकता है:',
      nextAction: 'सुझावित अगला कदम:',
      fallbackNotice: 'AI सहायता अनुपलब्ध होने के कारण मैन्युअल चयन के साथ दर्ज।',
      adminUpdateTitle: 'वार्ड संचालन स्थिति अपडेट',
      adminUpdateSub:
        'स्थिति बदलें (दर्ज → प्रगति में → समाधान हो गया) और सार्वजनिक नोट लिखें।',
      adminNoteLabel: 'सार्वजनिक वार्ड टिप्पणी',
      adminNotePlaceholder: 'उदा. टीम ने स्थान का निरीक्षण किया; शाम 4 बजे तक मरम्मत तय।',
      noteError: 'समयरेखा में सहेजने के लिए नई स्थिति चुनें या छोटा नोट लिखें।',
      savedPrefix: 'स्थिति',
      savedSuffix: 'में अपडेट होकर सहेजी गई।',
      saveUpdateBtn: 'अपडेट सहेजें',
      markResolvedBtn: 'समाधान हो गया चिह्नित करें',
      timelineTitle: 'समाधान इतिहास',
    },
    inspector: {
      topCategory: 'सबसे अधिक रिपोर्ट श्रेणी',
      ofActive: 'सक्रिय रिपोर्टों में से',
      meanPriority: 'औसत लंबित ध्यान स्कोर',
      includeAiHint: 'रिपोर्टों में AI-सहायक नोट शामिल हैं',
      severityMix: 'गंभीरता वितरण',
      severityMixSub: 'अत्यंत गंभीर, उच्च, मध्यम व कम का अनुपात',
      categoryDist: 'श्रेणी वितरण',
      categoryDistSub: 'रिपोर्ट संख्या व AI समीक्षा कवरेज',
      wardComp: 'वार्ड तुलना',
      wardCompSub: 'लंबित बनाम पूर्ण व औसत स्कोर',
      priorityDrivers: 'ध्यान स्कोर के मुख्य कारक',
      avgSeverity: 'औसत गंभीरता अंक',
      avgImpact: 'औसत सामुदायिक प्रभाव',
      avgWaiting: 'औसत प्रतीक्षा अंक',
      insightsNote:
        'आंकड़े संग्रहीत डेमो और नागरिक रिकॉर्ड से आते हैं। AI अंतर्दृष्टि केवल सलाह है और मानव निर्णय की जगह नहीं लेती।',
      sandboxTitle: 'समस्या को समझें — मोहल्ला अंतर्दृष्टि सहायक',
      sandboxSub:
        'सर्वर-साइड Gemini विश्लेषण पर आधारित। श्रेणी, गंभीरता, प्रभाव और अगला कदम सुझाता है — हमेशा सुझाव के रूप में चिह्नित।',
      loadExisting: 'जांचने के लिए कोई मौजूदा रिपोर्ट चुनें...',
      titleOptional: 'संक्षिप्त शीर्षक (वैकल्पिक)',
      areaOptional: 'वार्ड / गली संदर्भ (वैकल्पिक)',
      descLabel: 'समस्या का विवरण',
      descPlaceholder: 'AI-सहायक अंतर्दृष्टि देखने के लिए समस्या का विवरण लिखें...',
      photoOptional: 'फ़ोटो संलग्न करें (वैकल्पिक)',
      uploadPhotoHint: 'दृश्य संदर्भ के लिए फ़ोटो जोड़ें',
      skipAiManual: 'मैन्युअल रिपोर्ट करें',
      runAiInspection: 'समस्या को समझें',
      analyzing: 'जांच हो रही है...',
      outputTitle: 'AI-सहायता प्राप्त अंतर्दृष्टि (केवल सुझाव)',
      suggestionOnly: 'सलाहकार सुझाव · मानव समीक्षा आवश्यक',
      loadingText: 'मोहल्ला अंतर्दृष्टि सुझाव तैयार हो रहा है...',
      unavailableTitle: 'AI सहायक अनुपलब्ध',
      proceedManual: 'मैन्युअल रिपोर्ट फ़ॉर्म खोलें',
      whySuggested: 'यह क्यों सुझाया गया',
      possibleImpact: 'किस पर असर पड़ सकता है',
      recommendedAction: 'सुझावित अगला कदम',
      imageAssessment: 'फ़ोटो संदर्भ नोट',
      prefillReport: 'इन सुझावों के साथ रिपोर्ट शुरू करें',
      emptyTitle: 'समस्या समझने के लिए तैयार',
      emptySub:
        'ऊपर कोई रिपोर्ट चुनें या विवरण लिखकर "समस्या को समझें" पर क्लिक करें।',
    },
    priorityPage: {
      title: 'क्या पहले ध्यान मांगता है',
      subtitle:
        'प्रत्येक रिपोर्ट को पारदर्शी नियमों से 0–100 स्कोर मिलता है ताकि नागरिक और वार्ड टीम जान सकें कि ज़रूरी मुद्दे ऊपर क्यों हैं।',
      disclaimer: 'पारदर्शी प्राथमिकता गाइड — अंतिम कार्रवाई वार्ड टीम तय करती है',
      rule1Title: '1. गंभीरता स्तर',
      rule1Desc: 'अत्यंत गंभीर = 45 · उच्च = 36 · मध्यम = 22 · कम = 10 अंक।',
      rule2Title: '2. सामुदायिक प्रभाव',
      rule2Desc: 'समस्या श्रेणी और स्कूल, क्लिनिक, बस स्टॉप या जलभराव की निकटता के आधार पर।',
      rule3Title: '3. प्रतीक्षा समय',
      rule3Desc: 'लंबित रिपोर्टों को प्रति 6 घंटे +1 अंक (अधिकतम 20 अंक)। समाधान पर रीसेट।',
      rankedQueue: 'प्राथमिकता सूची',
      complaintsShown: 'रिपोर्टें प्रदर्शित',
      includeResolved: 'समाधान हो चुकी रिपोर्टें भी दिखाएं',
      bandSuffix: 'प्राथमिकता',
    },
    toasts: {
      createdTitlePrefix: 'रिपोर्ट',
      createdTitleSuffix: 'प्राप्त हुई',
      createdDesc: 'अब नक्शा देखें, रिपोर्ट ट्रैकर और वार्ड संचालन में दिखाई देगी।',
      updatedMiddle: 'चिह्नित:',
      updatedDesc: 'अपडेट सभी पृष्ठों पर समयरेखा में सहेजा गया।',
      resetTitle: 'उदाहरण डेमो डेटा बहाल',
      resetDescPrefix: '',
      resetDescSuffix: 'उदाहरण मोहल्ला रिपोर्टें लोड की गईं।',
    },
  },
};
