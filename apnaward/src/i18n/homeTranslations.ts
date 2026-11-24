import { IssueCategory, NavSection } from '../types/civic';
import { AppLanguage } from './translations';

export interface HomeProblemItem {
  id: string;
  title: string;
  problem: string;
  solution: string;
}

export interface WhatToReportCategoryItem {
  category: IssueCategory;
  title: string;
  examples: string;
  ctaLabel: string;
}

export interface HomeStageItem {
  stage: string;
  title: string;
  description: string;
  detail: string;
  highlightNote?: string;
}

export interface PlatformFeatureGuideItem {
  id: string;
  section: NavSection;
  title: string;
  purpose: string;
  whyUseful: string;
  example: string;
  disclaimer?: string;
  openButton: string;
}

export interface StakeholderRoleItem {
  id: string;
  role: string;
  summary: string;
  benefits: string[];
  actionLabel: string;
  targetSection: NavSection;
}

export interface DemoScenarioStep {
  id: string;
  stepNum: string;
  title: string;
  actor: string;
  statusBadge: string;
  summary: string;
  systemNote: string;
  metaRows: Array<{ label: string; value: string }>;
}

export interface ProductTourStepCopy {
  stepTitle: string;
  sectionTag: string;
  headline: string;
  explanation: string;
  highlightNote: string;
}

export interface JudgeChapterItem {
  id: string;
  chapterTag: string;
  title: string;
  subtitle: string;
  bullets: string[];
  calloutTitle: string;
  calloutBody: string;
  actionType:
    | 'why'
    | 'how'
    | 'report'
    | 'track'
    | 'inspector'
    | 'map'
    | 'command'
    | 'drawer'
    | 'priority';
  actionLabel: string;
  secondaryActionType?: 'track' | 'command' | 'report';
  secondaryActionLabel?: string;
}

export interface HomeTranslationDictionary {
  anchors: {
    home: string;
    why: string;
    howItWorks: string;
    wardGlance: string;
    features: string;
    trust: string;
  };
  hero: {
    brandLine: string;
    prototypeNotice: string;
    headline: string;
    subheadline: string;
    supportLine: string;
    reportIssueCta: string;
    exploreWardCta: string;
    tourCta: string;
    journeyCaption: string;
    journeyNodes: Array<{
      id: string;
      label: string;
      shortDesc: string;
    }>;
    snapshotLabel: string;
    snapshotDemoCount: string;
    snapshotCitizenCount: string;
    snapshotOpenQueue: string;
    snapshotResolved: string;
  };
  welcome: {
    eyebrow: string;
    heading: string;
    subheading: string;
    problemLabel: string;
    solutionLabel: string;
    items: HomeProblemItem[];
  };
  whatToReport: {
    eyebrow: string;
    heading: string;
    subheading: string;
    categories: WhatToReportCategoryItem[];
  };
  howItWorks: {
    eyebrow: string;
    heading: string;
    subheading: string;
    aiAdvisoryBadge: string;
    stages: HomeStageItem[];
  };
  wardGlance: {
    eyebrow: string;
    heading: string;
    subheading: string;
    totalLabel: string;
    pendingLabel: string;
    highPriorityLabel: string;
    resolvedLabel: string;
    demoNote: string;
    openOpsBtn: string;
    openAnalyticsBtn: string;
  };
  nearbyMap: {
    eyebrow: string;
    heading: string;
    subheading: string;
    exploreMapCta: string;
    legendReported: string;
    legendInProgress: string;
    legendResolved: string;
    attributionNote: string;
  };
  yourVoice: {
    eyebrow: string;
    heading: string;
    subheading: string;
    nonOfficialNote: string;
    roles: StakeholderRoleItem[];
  };
  scenario: {
    heading: string;
    subheading: string;
    illustrativeLabel: string;
    disclaimer: string;
    stepOf: string;
    prevBtn: string;
    nextBtn: string;
    autoPlayBtn: string;
    pauseBtn: string;
    tryReportBtn: string;
    steps: DemoScenarioStep[];
  };
  features: {
    heading: string;
    subheading: string;
    purposeLabel: string;
    usefulLabel: string;
    exampleLabel: string;
    cards: PlatformFeatureGuideItem[];
  };
  trust: {
    eyebrow: string;
    heading: string;
    subheading: string;
    questions: Array<{
      title: string;
      body: string;
    }>;
    bottomCtaTitle: string;
    bottomCtaSub: string;
  };
  tour: {
    badge: string;
    stepLabel: string;
    of: string;
    prevBtn: string;
    nextBtn: string;
    skipBtn: string;
    finishBtn: string;
    minimizeBtn: string;
    expandBtn: string;
    steps: ProductTourStepCopy[];
  };
  judgeDemo: {
    badge: string;
    title: string;
    chapterWord: string;
    of: string;
    prevBtn: string;
    nextBtn: string;
    exitBtn: string;
    liveActionHint: string;
    expectedValueNotice: string;
    chapters: JudgeChapterItem[];
  };
}

export const HOME_TRANSLATIONS: Record<AppLanguage, HomeTranslationDictionary> = {
  en: {
    anchors: {
      home: 'Home',
      why: 'Welcome',
      howItWorks: 'How It Works',
      wardGlance: 'Your Ward',
      features: 'Explore',
      trust: 'Trust & Transparency',
    },
    hero: {
      brandLine: 'ApnaWard · Your Neighbourhood. Your Voice.',
      prototypeNotice: 'COMMUNITY PROTOTYPE · ILLUSTRATIVE DEMO DATA & LOCAL BROWSER STORAGE',
      headline: 'Your Neighbourhood Deserves Better.',
      subheadline:
        'See an issue? Report it. Follow its progress. Help make your neighbourhood better.',
      supportLine: 'Small reports. Better neighbourhoods.',
      reportIssueCta: 'Report an Issue',
      exploreWardCta: 'Explore Your Ward',
      tourCta: 'Take a 60-Second Tour',
      journeyCaption: 'How one community report flows — click any step to preview',
      journeyNodes: [
        {
          id: 'report',
          label: 'Report',
          shortDesc: 'Share what happened with text or voice (EN/HI), a photo, and a map pin.',
        },
        {
          id: 'understand',
          label: 'Understand the Issue',
          shortDesc: 'Optional AI insight suggests category and urgency for human review.',
        },
        {
          id: 'priority',
          label: 'What Needs Attention First',
          shortDesc: 'Transparent rules rank urgent safety and high-footfall reports.',
        },
        {
          id: 'action',
          label: 'Ward Operations',
          shortDesc: 'Coordinators review reports, spot clusters, and record progress notes.',
        },
        {
          id: 'track',
          label: 'Track Your Report',
          shortDesc: 'Look up your unique ID anytime to see every step clearly.',
        },
      ],
      snapshotLabel: 'Live Browser Dataset',
      snapshotDemoCount: 'Sample Ward Records',
      snapshotCitizenCount: 'Your Local Reports',
      snapshotOpenQueue: 'Pending & Active',
      snapshotResolved: 'Resolved Reports',
    },
    welcome: {
      eyebrow: 'A · WELCOME TO APNAWARD',
      heading: 'Built Around Everyday Streets and Open Progress',
      subheading:
        'Local road, water, waste, and lighting problems are visible to residents long before they appear in any neat list. ApnaWard makes it easy for neighbours to speak up and see what happens next.',
      problemLabel: 'Common Gap',
      solutionLabel: 'How ApnaWard Helps',
      items: [
        {
          id: 'scattered',
          title: '1. Scattered Complaints',
          problem:
            'Reports get lost across phone calls, chat forwards, and unorganized messages.',
          solution:
            'Brings every report into one searchable Community Reports list with clear categories, ward tags, and a unique tracking ID.',
        },
        {
          id: 'visibility',
          title: '2. No Clear Updates',
          problem:
            'Residents rarely know whether someone read their message or started fixing the problem.',
          solution:
            'Track Your Report lets anyone check status (Reported, In Progress, Resolved) and read timestamped update notes.',
        },
        {
          id: 'prioritizing',
          title: '3. Figuring Out What Is Urgent',
          problem:
            'Without clear context, urgent safety hazards sit beside minor maintenance requests.',
          solution:
            'What Needs Attention First scores severity, public impact cues, and waiting time with a transparent 0–100 breakdown.',
        },
        {
          id: 'area-insights',
          title: '4. Missing Neighbourhood Patterns',
          problem:
            'Repeated problems on the same lane or market corner stay invisible when handled one by one.',
          solution:
            'Explore Map plots pins on OpenStreetMap and groups nearby complaints into Areas Needing Attention.',
        },
        {
          id: 'accessibility',
          title: '5. Language & Form Barriers',
          problem:
            'Long English-only forms discourage busy neighbours from sharing helpful details.',
          solution:
            'Instant English ↔ हिंदी switching, simple 3-step guidance, and optional browser voice dictation.',
        },
      ],
    },
    whatToReport: {
      eyebrow: 'B · WHAT CAN YOU REPORT?',
      heading: 'Pick Any Everyday Issue to Start a Report',
      subheading:
        'Select a category below to open the guided reporting form pre-filled for that problem.',
      categories: [
        {
          category: 'road_damage',
          title: 'Road Damage',
          examples: 'Potholes, broken paving, uneven crossings, washed-out lanes.',
          ctaLabel: 'Report Road Damage',
        },
        {
          category: 'garbage',
          title: 'Garbage',
          examples: 'Overflowing bins, uncollected waste piles, blocked footpaths.',
          ctaLabel: 'Report Garbage',
        },
        {
          category: 'water_leakage',
          title: 'Water Leakage',
          examples: 'Burst supply lines, leaking valves, continuous street water waste.',
          ctaLabel: 'Report Water Leakage',
        },
        {
          category: 'streetlight',
          title: 'Streetlight',
          examples: 'Dark intersections, flickering poles, unlit pedestrian stretches.',
          ctaLabel: 'Report Streetlight',
        },
        {
          category: 'drainage',
          title: 'Drainage',
          examples: 'Clogged storm drains, stagnant waterlogging, broken drain covers.',
          ctaLabel: 'Report Drainage',
        },
        {
          category: 'public_safety',
          title: 'Public Safety',
          examples: 'Exposed wires, missing manhole covers, fallen branches, unsafe crossings.',
          ctaLabel: 'Report Public Safety',
        },
      ],
    },
    howItWorks: {
      eyebrow: 'C · HOW IT WORKS',
      heading: 'From a Quick Photo & Pin to Visible Resolution',
      subheading:
        'Follow the simple community workflow designed to keep both residents and ward teams informed.',
      aiAdvisoryBadge: 'Neighbourhood Insights (AI) are advisory suggestions requiring human review',
      stages: [
        {
          stage: 'Step 1 — Report',
          title: 'Report an Issue',
          description:
            'Describe what happened in English or हिंदी (typing or voice), add an optional photo, and drop a pin.',
          detail:
            'Checks automatically for similar open reports nearby and gives you a unique tracking ID.',
        },
        {
          stage: 'Step 2 — Understand the Issue',
          title: 'Understand the Issue',
          description:
            'ApnaWard can suggest the category, urgency, and neighbourhood impact from your description and photo.',
          detail:
            'Always clearly labelled as an AI suggestion — you and ward reviewers stay in full control.',
          highlightNote: 'AI suggestion only — human review required',
        },
        {
          stage: 'Step 3 — Prioritize',
          title: 'What Needs Attention First',
          description:
            'Transparent rules combine severity, public-place cues, and wait time into an explainable score.',
          detail:
            'Every point is visible so communities can understand why hazards near schools or hospitals rise first.',
        },
        {
          stage: 'Step 4 — Ward Action',
          title: 'Action & Ward Operations',
          description:
            'Ward teams view Community Reports, spot Areas Needing Attention on the map, and log field notes.',
          detail:
            'Updates status cleanly through Reported → In Progress → Mark as Resolved.',
        },
        {
          stage: 'Step 5 — Track Progress',
          title: 'Track Your Report',
          description:
            'Enter your report ID anytime to view the progress bar and read the latest update note.',
          detail:
            'No login wall needed in this demo — open transparency for every submitted ID.',
        },
      ],
    },
    wardGlance: {
      eyebrow: 'D · YOUR WARD AT A GLANCE',
      heading: 'A Clear Snapshot of What Is Happening Across Wards',
      subheading:
        'Live numbers computed directly from the active reports stored in this browser (sample demo records + any reports you submit).',
      totalLabel: 'Total Reports',
      pendingLabel: 'Pending & In Progress',
      highPriorityLabel: 'High-Priority Open',
      resolvedLabel: 'Marked Resolved',
      demoNote: 'Includes clearly marked illustrative Ward 1–6 demo data alongside local browser reports.',
      openOpsBtn: 'Open Ward Operations',
      openAnalyticsBtn: 'Open Ward Analytics',
    },
    nearbyMap: {
      eyebrow: 'E · SEE WHAT IS HAPPENING NEARBY',
      heading: 'Explore Issues Around the Neighbourhood Map',
      subheading:
        'Browse reported spots, active repairs, and resolved reports directly on an interactive OpenStreetMap view.',
      exploreMapCta: 'Explore Full Map',
      legendReported: 'Pending / Reported',
      legendInProgress: 'In Progress',
      legendResolved: 'Resolved',
      attributionNote: 'Interactive preview powered by Leaflet & © OpenStreetMap contributors (illustrative ward grid).',
    },
    yourVoice: {
      eyebrow: 'F · YOUR VOICE MATTERS',
      heading: 'Designed for Neighbours, Community Reviewers, and Ward Teams',
      subheading:
        'Whether you are reporting a broken light outside your gate or organizing weekly ward maintenance, ApnaWard speaks plain human language.',
      nonOfficialNote:
        'Prototype disclosure: ApnaWard is an independent civic-tech demonstration. It does not claim official municipal partnership or transmit reports to government portals.',
      roles: [
        {
          id: 'citizens',
          role: 'For Residents',
          summary: 'Share local problems in under a minute without confusing jargon.',
          benefits: [
            'Friendly prompts in English or हिंदी',
            'Optional voice dictation & photo upload',
            'Nearby duplicate notice before submitting',
            'Instant unique ID to Track Your Report',
          ],
          actionLabel: 'Report an Issue',
          targetSection: 'report',
        },
        {
          id: 'admins',
          role: 'For Ward Teams',
          summary: 'Organize incoming Community Reports with clear priorities and public notes.',
          benefits: [
            'See What Needs Attention First at a glance',
            'Inspect photos, map pins & AI suggestions',
            'Move issues to In Progress or Mark as Resolved',
            'Keep residents informed with timestamped notes',
          ],
          actionLabel: 'Open Ward Operations',
          targetSection: 'management',
        },
        {
          id: 'planners',
          role: 'For Neighbourhood Coordinators',
          summary: 'Spot chronic streets and recurring issues across all six sample wards.',
          benefits: [
            'Compare categories ward by ward',
            'Identify Areas Needing Attention automatically',
            'Track resolution completion over time',
            'Turn scattered reports into clear priorities',
          ],
          actionLabel: 'Explore Ward Analytics',
          targetSection: 'command',
        },
      ],
    },
    scenario: {
      heading: 'Follow One Neighbourhood Report From Start to Finish',
      subheading:
        'Step through an illustrative story showing how a single broken road report moves from a resident’s phone to visible completion.',
      illustrativeLabel: 'ILLUSTRATIVE DEMO · SAMPLE JOURNEY',
      disclaimer:
        'Transparency note: Ward 2 · Station Road and sample ID AW-DEMO-RD01 are illustrative demo examples. No actual municipal crew dispatch happens in this prototype.',
      stepOf: 'Step',
      prevBtn: 'Previous',
      nextBtn: 'Next',
      autoPlayBtn: 'Auto-Play Story',
      pauseBtn: 'Pause',
      tryReportBtn: 'Try Reporting a Similar Issue',
      steps: [
        {
          id: 'submit',
          stepNum: '01',
          title: 'Resident Reports the Crater',
          actor: 'Neighbour (Demo)',
          statusBadge: 'Submitted',
          summary:
            'A commuter spots a deep pothole beside the Ward 2 · Station Road Bus Stop and submits a quick report with a photo and map pin.',
          systemNote: 'Assigned sample tracking ID AW-DEMO-RD01 locally.',
          metaRows: [
            { label: 'Location (Demo)', value: 'Ward 2 · Station Road' },
            { label: 'How Submitted', value: 'Voice note (EN/HI) + 1 photo' },
            { label: 'Data Tag', value: 'ILLUSTRATIVE DEMO' },
          ],
        },
        {
          id: 'ai-cat',
          stepNum: '02',
          title: 'Understand the Issue: Category',
          actor: 'Neighbourhood Insights (Advisory)',
          statusBadge: 'Suggested: Road Damage',
          summary:
            'ApnaWard reads the description and photo context and suggests the "Road Damage" category so the resident does not have to guess.',
          systemNote: 'Clearly marked as an AI suggestion — editable anytime.',
          metaRows: [
            { label: 'Suggested Category', value: 'Road Damage' },
            { label: 'Control', value: 'Resident & reviewer can change' },
            { label: 'Offline Safe', value: 'Manual selection always works' },
          ],
        },
        {
          id: 'ai-sev',
          stepNum: '03',
          title: 'Understand the Issue: Urgency',
          actor: 'Neighbourhood Insights (Advisory)',
          statusBadge: 'High Priority Cue',
          summary:
            'Because two-wheelers swerve near a busy bus stop, the advisory insight highlights High urgency and commuter safety impact.',
          systemNote: 'Advisory triage cue only — not an engineering inspection.',
          metaRows: [
            { label: 'Suggested Urgency', value: 'High' },
            { label: 'Neighbourhood Cue', value: 'Busy bus stop & school route' },
            { label: 'Suggested First Step', value: 'Place cones & inspect surface' },
          ],
        },
        {
          id: 'priority',
          stepNum: '04',
          title: 'What Needs Attention First',
          actor: 'Transparent Priority Rules',
          statusBadge: 'Score: 84 / 100',
          summary:
            'Explainable rules add urgency points, landmark impact points, and waiting hours so dangerous bus-stop craters rise above routine upkeep.',
          systemNote: 'Every point is shown in plain language — never a hidden score.',
          metaRows: [
            { label: 'Urgency Points', value: '34 / 45 (High)' },
            { label: 'Public Place Impact', value: '30 / 35 (Transit & school)' },
            { label: 'Waiting Time', value: '20 / 20 (Elapsed wait)' },
          ],
        },
        {
          id: 'map',
          stepNum: '05',
          title: 'Appears on Explore Map',
          actor: 'Community Map',
          statusBadge: 'Pinned in Ward 2',
          summary:
            'An amber-red Road Damage pin appears on the OpenStreetMap grid so neighbours and coordinators can see nearby clusters.',
          systemNote: 'Demo coordinates represent a fictional ward grid.',
          metaRows: [
            { label: 'Sample Coordinates', value: '12.9762° N, 77.5713° E' },
            { label: 'Pin State', value: 'Reported (Amber / High Ring)' },
            { label: 'Cluster Check', value: 'Included in Ward 2 hotspot check' },
          ],
        },
        {
          id: 'admin-review',
          stepNum: '06',
          title: 'Reviewed in Community Reports',
          actor: 'Ward Operations Demo',
          statusBadge: 'Under Review',
          summary:
            'The ward coordinator opens the report drawer, checks the uploaded photo, confirms the suggested priority, and prepares a field update.',
          systemNote: 'All actions stay synced across every ApnaWard screen.',
          metaRows: [
            { label: 'Queue Rank', value: 'Top priority tier (84/100)' },
            { label: 'AI Suggestion', value: 'Reviewed & confirmed by human' },
            { label: 'Next Action', value: 'Post status update' },
          ],
        },
        {
          id: 'in-progress',
          stepNum: '07',
          title: 'Moved to In Progress',
          actor: 'Ward Operations Demo',
          statusBadge: 'In Progress',
          summary:
            'Status changes to In Progress with a plain note: "Safety barriers placed; road patching scheduled for afternoon."',
          systemNote: 'Timestamped update appears immediately for residents.',
          metaRows: [
            { label: 'Status', value: 'In Progress' },
            { label: 'Map Ring', value: 'Active blue/cyan progress ring' },
            { label: 'Resident View', value: 'Live in Track Your Report' },
          ],
        },
        {
          id: 'resolved',
          stepNum: '08',
          title: 'Marked as Resolved (Demo)',
          actor: 'Ward Operations Demo',
          statusBadge: 'Resolved',
          summary:
            'Once repaired in this sample story, the coordinator clicks Mark as Resolved and adds a closing note. Your Ward at a Glance updates instantly.',
          systemNote: 'ILLUSTRATIVE DEMO ONLY — no real physical repair was triggered.',
          metaRows: [
            { label: 'Status', value: 'Resolved (Green)' },
            { label: 'Ward Snapshot', value: 'Resolution count updates' },
            { label: 'Note Logged', value: 'Timestamped closure summary' },
          ],
        },
        {
          id: 'citizen-track',
          stepNum: '09',
          title: 'Resident Verifies via Track Your Report',
          actor: 'Neighbour',
          statusBadge: 'Verified by ID',
          summary:
            'The resident enters AW-DEMO-RD01 (or any real local ID like AW-2026-001) on Track Your Report and sees the full 3-step timeline.',
          systemNote: 'Available immediately in both English and हिंदी.',
          metaRows: [
            { label: 'Timeline', value: 'Reported → In Progress → Resolved' },
            { label: 'Latest Note', value: 'Shown with date & time' },
            { label: 'Languages', value: 'English / हिंदी' },
          ],
        },
      ],
    },
    features: {
      heading: 'G · EXPLORE EVERY PART OF APNAWARD',
      subheading:
        'Open any live workspace below — designed cleanly for residents on one side and ward teams on the other.',
      purposeLabel: 'What It Does',
      usefulLabel: 'Why It Helps',
      exampleLabel: 'Example',
      cards: [
        {
          id: 'report',
          section: 'report',
          title: 'Report an Issue',
          purpose:
            'Simple guided steps to share what happened, pin the spot on a map, attach a photo, or speak in English or हिंदी.',
          whyUseful:
            'Makes reporting effortless while checking nearby open reports to avoid duplicates.',
          example:
            'Reporting a dark streetlight near Riverside Clinic gives you an instant ID like AW-2026-013.',
          openButton: 'Open Report an Issue',
        },
        {
          id: 'track',
          section: 'track',
          title: 'Track Your Report',
          purpose:
            'Look up any unique report ID to see its current status, visual 3-step timeline, and latest ward note.',
          whyUseful:
            'Gives neighbours clear answers anytime without phone calls or guesswork.',
          example:
            'Entering AW-2026-001 shows In Progress status, urgency score, and the latest Ward 2 update.',
          openButton: 'Open Track Your Report',
        },
        {
          id: 'map',
          section: 'map',
          title: 'Explore Map',
          purpose:
            'Displays every report on OpenStreetMap with category icons, status colours, filters, and Areas Needing Attention.',
          whyUseful:
            'Helps residents and ward coordinators spot streets where problems keep repeating.',
          example:
            'Filtering Ward 2 shows clustered road and drainage reports along Station Road.',
          openButton: 'Open Explore Map',
        },
        {
          id: 'inspector',
          section: 'inspector',
          title: 'Neighbourhood Insights',
          purpose:
            'Provides AI-assisted "Understand the Issue" suggestions for category, urgency, public impact, and practical first steps.',
          whyUseful:
            'Speeds up reading long descriptions while keeping every decision in human hands.',
          example:
            'Testing a leaking main water pipe highlights Critical urgency as an advisory suggestion.',
          disclaimer: 'AI insights are advisory suggestions only — human review is always required.',
          openButton: 'Open Neighbourhood Insights',
        },
        {
          id: 'overview',
          section: 'overview',
          title: 'Ward Operations',
          purpose:
            'Gives coordinators a unified summary of open reports, high-priority alerts, resolution rate, and recent updates.',
          whyUseful:
            'Keeps ward teams focused on active queues and recent changes at a glance.',
          example:
            'Spotting 4 high-priority open items and jumping straight into the top urgent report.',
          openButton: 'Open Ward Operations',
        },
        {
          id: 'management',
          section: 'management',
          title: 'Community Reports',
          purpose:
            'Filter, search, sort, and update every submitted report with status changes, Mark as Resolved, and transparent notes.',
          whyUseful:
            'Replaces scattered spreadsheets with one accountable workflow shared directly with Track Your Report.',
          example:
            'Opening AW-2026-002 in the drawer, switching it to In Progress, and adding a field update.',
          openButton: 'Open Community Reports',
        },
        {
          id: 'command',
          section: 'command',
          title: 'Ward Analytics & What Needs Attention First',
          purpose:
            'Compares open vs. resolved patterns across wards, highlights Areas Needing Attention, and explains priority scores.',
          whyUseful:
            'Turns everyday neighbourhood reports into transparent, fair planning.',
          example:
            'Comparing Ward 1 North Market and Ward 4 Lakeview East across categories.',
          openButton: 'Open Ward Analytics',
        },
      ],
    },
    trust: {
      eyebrow: 'COMMUNITY TRUST & TRANSPARENCY',
      heading: 'Clear Answers About How ApnaWard Works',
      subheading:
        'Trust comes from honesty. Here is exactly what happens behind every report, score, and status update in this prototype.',
      questions: [
        {
          title: '1. What happens after a report is submitted?',
          body: 'Your report is saved immediately in this browser with a unique tracking ID (such as AW-2026-013), placed on Explore Map, and added to Community Reports so it can be reviewed and tracked.',
        },
        {
          title: '2. How is "What Needs Attention First" calculated?',
          body: 'An open rule-based score (0–100) adds Urgency points (Low/Medium/High/Critical), Public Place cues (such as schools, clinics, transit, or live hazards), and Waiting Time. AI insights are advisory suggestions only and never override human judgment.',
        },
        {
          title: '3. Who can update issue status in this demo?',
          body: 'Because this is a standalone civic prototype without login walls or official government connections, anyone switching to Ward Operations → Community Reports can test updating statuses and notes to experience the full loop.',
        },
        {
          title: '4. What does each status mean?',
          body: 'Reported (Amber) means logged and awaiting review. In Progress (Blue/Cyan) means active work or inspection is underway. Resolved (Green) means marked completed with a closing note.',
        },
        {
          title: '5. How can citizens follow progress?',
          body: 'Save your unique report ID shown on confirmation, then enter it anytime on Track Your Report to see the 3-step timeline, latest note, and current status in English or हिंदी.',
        },
      ],
      bottomCtaTitle: 'Ready to help your neighbourhood?',
      bottomCtaSub: 'Submit a test report, track sample ID AW-2026-001, or take the 60-second tour.',
    },
    tour: {
      badge: '60-SECOND APNAWARD TOUR',
      stepLabel: 'Step',
      of: 'of',
      prevBtn: 'Previous',
      nextBtn: 'Next',
      skipBtn: 'Skip Tour',
      finishBtn: 'Finish Tour',
      minimizeBtn: 'Minimize',
      expandBtn: 'Expand Tour',
      steps: [
        {
          stepTitle: 'Ward Operations Overview',
          sectionTag: '1 · Ward Operations',
          headline: 'See Ward Health & Open Reports at a Glance',
          explanation:
            'We opened Ward Operations. Review total reports, open queue, high-priority count, completion rate, category mix, and recent activity.',
          highlightNote: 'Demo records are labelled DEMO DATA; reports you create stay saved in your browser.',
        },
        {
          stepTitle: 'Explore Map',
          sectionTag: '2 · Explore Map',
          headline: 'Neighbourhood Pins & Areas Needing Attention',
          explanation:
            'This interactive Leaflet + OpenStreetMap map is centered on sample report AW-2026-002. Pins show category icons, status colours, and local hotspot clusters.',
          highlightNote: 'Demo coordinates represent an illustrative neighbourhood grid.',
        },
        {
          stepTitle: 'Report an Issue',
          sectionTag: '3 · Report an Issue',
          headline: 'Friendly Reporting with Voice, Photo & Map Pin',
          explanation:
            'We pre-filled a sample road report in the guided 3-step form. Residents can type or speak in English or हिंदी, add a photo, and spot nearby duplicates.',
          highlightNote: 'Edit anything or submit it to receive a real local AW-2026 ID.',
        },
        {
          stepTitle: 'Understand the Issue (AI)',
          sectionTag: '4 · Neighbourhood Insights',
          headline: 'Advisory AI Insights for Faster Reading',
          explanation:
            'Sample report AW-2026-002 is loaded inside Neighbourhood Insights. Notice how suggested category, urgency, public impact, and next steps are clearly marked as suggestions.',
          highlightNote: 'Purple highlights AI insights only — human review is always required.',
        },
        {
          stepTitle: 'Track Your Report',
          sectionTag: '5 · Track Your Report',
          headline: 'Look Up Any Report by Unique ID',
          explanation:
            'Viewing sample report AW-2026-001 on Track Your Report. Enter any report ID to see its 3-step progress bar, urgency score, and latest ward note.',
          highlightNote: 'Try switching EN ↔ हिंदी in the top bar while IDs like AW-2026-001 stay consistent.',
        },
        {
          stepTitle: 'Ward Analytics & Priority',
          sectionTag: '6 · Ward Analytics',
          headline: 'Compare Wards, Clusters & What Needs Attention First',
          explanation:
            'Ward Analytics compares open vs. resolved reports across wards, surfaces Areas Needing Attention, and ranks the What Needs Attention First queue.',
          highlightNote: 'Click Finish Tour to explore freely or open Community Reports to test status updates.',
        },
      ],
    },
    judgeDemo: {
      badge: 'GUIDED PLATFORM WALKTHROUGH',
      title: 'ApnaWard — Complete Story & Feature Deck',
      chapterWord: 'Chapter',
      of: 'of',
      prevBtn: 'Previous',
      nextBtn: 'Next Chapter',
      exitBtn: 'Exit Walkthrough',
      liveActionHint: 'Jump straight into the live screen, then click Resume Walkthrough anytime:',
      expectedValueNotice:
        'Prototype note: Benefits described in Chapter 7 reflect expected community value of this workflow design using illustrative demo data, not measured municipal outcomes.',
      chapters: [
        {
          id: 'problem',
          chapterTag: 'CHAPTER 1 · WHY APNAWARD',
          title: 'Everyday Neighbourhood Issues Need One Clear Home',
          subtitle:
            'Why small street problems turn into chronic frustration when reports are scattered and opaque.',
          bullets: [
            'Residents report potholes, garbage, and leaks across disconnected channels with no shared view.',
            'People rarely find out whether anyone saw their complaint or started working on it.',
            'Ward teams lack a transparent, fair way to surface high-risk issues first.',
            'Complex English-only forms keep many neighbours from participating.',
          ],
          calloutTitle: 'The Core Gap',
          calloutBody:
            'Without location-grounded, bilingual, and open tracking, communities lose confidence and urgent hazards wait too long.',
          actionType: 'why',
          actionLabel: 'View Welcome Section on Home',
        },
        {
          id: 'solution',
          chapterTag: 'CHAPTER 2 · THE COMMUNITY WORKFLOW',
          title: 'One Connected Loop: Report, Understand, Act, Track',
          subtitle:
            'ApnaWard connects resident reporting with transparent Ward Operations in plain language.',
          bullets: [
            '1. Report an Issue: Guided 3-step form with voice dictation (EN/HI), photo upload, and map pin.',
            '2. Understand the Issue: Advisory AI insight suggests category and urgency for human review.',
            '3. What Needs Attention First: Explainable 0–100 score balances urgency, public place impact, and wait time.',
            '4. Explore & Track: OpenStreetMap clusters, Community Reports notes, and resident ID lookup.',
          ],
          calloutTitle: 'Honest & Reliable Prototype',
          calloutBody:
            'Works smoothly with illustrative Ward 1–6 sample data in localStorage and manual fallback if AI is offline.',
          actionType: 'how',
          actionLabel: 'View How It Works on Home',
        },
        {
          id: 'citizen',
          chapterTag: 'CHAPTER 3 · RESIDENT EXPERIENCE',
          title: 'Welcoming Citizen Reporting & Instant ID Tracking',
          subtitle:
            'Built for accessibility with instant English ↔ हिंदी switching and Web Speech voice input.',
          bullets: [
            'Friendly prompts ("What happened?", "Where did you notice it?") keep reporting quick.',
            'Automatic nearby duplicate check alerts residents if a similar open report already exists.',
            'Every submission generates a unique, untranslated tracking ID (e.g., AW-2026-013).',
            'Track Your Report shows the 3-step progress bar and latest ward update anytime.',
          ],
          calloutTitle: 'Try It Live',
          calloutBody:
            'Submit a sample report or look up AW-2026-001 on Track Your Report right now.',
          actionType: 'report',
          actionLabel: 'Open Report an Issue',
          secondaryActionType: 'track',
          secondaryActionLabel: 'Track AW-2026-001',
        },
        {
          id: 'ai',
          chapterTag: 'CHAPTER 4 · NEIGHBOURHOOD INSIGHTS',
          title: 'Advisory AI Assistance + Open Priority Rules',
          subtitle:
            'AI helps summarize and suggest — humans stay completely in control.',
          bullets: [
            'Server-side /api/analyze-issue route calls Gemini safely without exposing keys to the browser.',
            'Suggests category, Low/Medium/High/Critical urgency, reasoning, impact, and first steps.',
            'Clearly marked in purple as an advisory suggestion — editable before and after submission.',
            'Rule-based Priority Engine adds Urgency (45 pts) + Public Impact (35 pts) + Wait Time (20 pts).',
          ],
          calloutTitle: 'Human Review First',
          calloutBody:
            'If AI is unavailable, reporting continues cleanly with manual category and urgency controls.',
          actionType: 'inspector',
          actionLabel: 'Open Neighbourhood Insights (AW-2026-002)',
        },
        {
          id: 'ward',
          chapterTag: 'CHAPTER 5 · MAP & WARD ANALYTICS',
          title: 'Explore Map, Areas Needing Attention & Ward Comparison',
          subtitle:
            'See recurring neighbourhood corridors clearly with Leaflet and OpenStreetMap.',
          bullets: [
            'Category markers and status colours (Amber, Blue/Cyan, Green) directly on OpenStreetMap.',
            'Filter by ward, category, severity, status, or keyword.',
            'Proximity clustering automatically flags Areas Needing Attention (300m–650m radius).',
            'All charts update instantaneously from the same shared browser report list.',
          ],
          calloutTitle: 'Illustrative Ward Grid',
          calloutBody:
            'Sample Wards 1–6 use clearly labelled illustrative coordinates for demonstration.',
          actionType: 'map',
          actionLabel: 'Open Explore Map',
          secondaryActionType: 'command',
          secondaryActionLabel: 'Open Ward Analytics',
        },
        {
          id: 'admin',
          chapterTag: 'CHAPTER 6 · WARD OPERATIONS',
          title: 'Community Reports, Mark as Resolved & Public Notes',
          subtitle:
            'Close the communication loop cleanly inside one shared detail drawer.',
          bullets: [
            'Community Reports sorts submissions by priority score, ward, category, and status.',
            'Opening any item shows photo evidence, map pin, AI suggestion, and priority score math.',
            'Moving to In Progress or clicking Mark as Resolved with a note updates every view at once.',
            'Residents see the new timestamped note immediately inside Track Your Report.',
          ],
          calloutTitle: 'Test a Status Update',
          calloutBody:
            'Open sample report AW-2026-002 in the drawer, update its status, and verify it on Track Your Report.',
          actionType: 'drawer',
          actionLabel: 'Open Report Drawer (AW-2026-002)',
          secondaryActionType: 'track',
          secondaryActionLabel: 'Verify on Track Your Report',
        },
        {
          id: 'value',
          chapterTag: 'CHAPTER 7 · COMMUNITY VALUE',
          title: 'Small Reports. Better Neighbourhoods.',
          subtitle:
            'How organized reporting builds everyday trust between residents and local teams.',
          bullets: [
            'Clearer communication: Structured reports and unique IDs replace lost messages.',
            'Open accountability: Residents can verify progress in Hindi or English anytime.',
            'Fairer urgency: Transparent scoring explains why high-risk issues move first.',
            'Shared spatial awareness: Recurring streets and corridors stand out immediately.',
            'Human-centred design: AI stays strictly advisory while communities stay in charge.',
          ],
          calloutTitle: 'Prototype Stage Reminder',
          calloutBody:
            'This walkthrough uses illustrative demo data in local browser storage and makes no claims of official municipal deployment.',
          actionType: 'command',
          actionLabel: 'Finish & Explore Ward Analytics',
        },
      ],
    },
  },
  hi: {
    anchors: {
      home: 'होम',
      why: 'परिचय',
      howItWorks: 'यह कैसे काम करता है',
      wardGlance: 'आपका वार्ड',
      features: 'प्लेटफ़ॉर्म देखें',
      trust: 'विश्वास और पारदर्शिता',
    },
    hero: {
      brandLine: 'ApnaWard · आपका मोहल्ला। आपकी आवाज़।',
      prototypeNotice: 'समुदाय प्रोटोटाइप · उदाहरणात्मक डेमो डेटा और स्थानीय ब्राउज़र स्टोरेज',
      headline: 'आपका मोहल्ला बेहतर देखभाल का हकदार है।',
      subheadline:
        'कोई समस्या दिखी? रिपोर्ट करें। उसकी प्रगति देखें। अपने मोहल्ले को बेहतर बनाने में मदद करें।',
      supportLine: 'छोटी रिपोर्ट। बेहतर मोहल्ले।',
      reportIssueCta: 'समस्या रिपोर्ट करें',
      exploreWardCta: 'अपना वार्ड देखें',
      tourCta: '60-सेकंड टूर देखें',
      journeyCaption: 'एक सामुदायिक रिपोर्ट का पूरा सफ़र — देखने के लिए किसी भी चरण पर क्लिक करें',
      journeyNodes: [
        {
          id: 'report',
          label: 'रिपोर्ट',
          shortDesc: 'टेक्स्ट या आवाज़ (EN/HI), फ़ोटो और मैप पिन से बताएं कि क्या हुआ।',
        },
        {
          id: 'understand',
          label: 'समस्या को समझें',
          shortDesc: 'वैकल्पिक AI जानकारी मानव समीक्षा के लिए श्रेणी और गंभीरता सुझाती है।',
        },
        {
          id: 'priority',
          label: 'पहले किस पर ध्यान दें',
          shortDesc: 'पारदर्शी नियम सुरक्षित और व्यस्त स्थानों की रिपोर्ट को ऊपर रखते हैं।',
        },
        {
          id: 'action',
          label: 'वार्ड संचालन',
          shortDesc: 'समन्वयक रिपोर्ट देखते हैं, क्लस्टर पहचानते हैं और अपडेट नोट्स जोड़ते हैं।',
        },
        {
          id: 'track',
          label: 'अपनी रिपोर्ट ट्रैक करें',
          shortDesc: 'अपनी यूनिक ID से कभी भी हर चरण की प्रगति देखें।',
        },
      ],
      snapshotLabel: 'ब्राउज़र डेटा सारांश',
      snapshotDemoCount: 'नमूना वार्ड रिकॉर्ड',
      snapshotCitizenCount: 'आपकी स्थानीय रिपोर्ट',
      snapshotOpenQueue: 'लंबित और सक्रिय',
      snapshotResolved: 'समाधान हो चुकीं',
    },
    welcome: {
      eyebrow: 'A · APNAWARD में आपका स्वागत है',
      heading: 'रोज़मर्रा की गलियों और खुली प्रगति के लिए बनाया गया',
      subheading:
        'सड़क, पानी, कचरा और स्ट्रीटलाइट की समस्याएँ किसी सूची से पहले निवासियों को सड़क पर दिखती हैं। ApnaWard पड़ोसियों के लिए आवाज़ उठाना और प्रगति देखना सरल बनाता है।',
      problemLabel: 'आम समस्या',
      solutionLabel: 'ApnaWard कैसे मदद करता है',
      items: [
        {
          id: 'scattered',
          title: '1. बिखरी हुई रिपोर्ट',
          problem: 'कॉल, चैट संदेशों और अनौपचारिक नोट्स में रिपोर्ट खो जाती हैं।',
          solution:
            'हर रिपोर्ट को स्पष्ट श्रेणी, वार्ड टैग और यूनिक ट्रैकिंग ID के साथ एक सामुदायिक रिपोर्ट सूची में लाता है।',
        },
        {
          id: 'visibility',
          title: '2. स्पष्ट अपडेट की कमी',
          problem: 'निवासियों को पता नहीं चलता कि किसी ने उनकी रिपोर्ट पढ़ी या काम शुरू किया या नहीं।',
          solution:
            'अपनी रिपोर्ट ट्रैक करें पेज पर स्थिति (रिपोर्ट की गई, प्रगति पर, समाधान) और समय-चिह्नित नोट्स दिखते हैं।',
        },
        {
          id: 'prioritizing',
          title: '3. जरूरी काम पहचानने में कठिनाई',
          problem: 'स्पष्ट संदर्भ के बिना सुरक्षा से जुड़े बड़े खतरे सामान्य काम के साथ दब जाते हैं।',
          solution:
            'पहले किस पर ध्यान दें में गंभीरता, सार्वजनिक स्थान प्रभाव और प्रतीक्षा समय का पारदर्शी 0–100 स्कोर दिखता है।',
        },
        {
          id: 'area-insights',
          title: '4. मोहल्ले के पैटर्न न दिखना',
          problem: 'एक ही गली या मोड़ पर बार-बार होने वाली समस्याएँ अलग-अलग संभालने पर छिपी रहती हैं।',
          solution:
            'मैप देखें पर OpenStreetMap पिन दिखते हैं और पास-पास की समस्याएँ ध्यान देने योग्य क्षेत्र में जुड़ती हैं।',
        },
        {
          id: 'accessibility',
          title: '5. भाषा और फ़ॉर्म की बाधाएँ',
          problem: 'केवल अंग्रेज़ी के लंबे फ़ॉर्म कई पड़ोसियों को रिपोर्ट करने से रोकते हैं।',
          solution:
            'तुरंत अंग्रेज़ी ↔ हिंदी बदलाव, सरल 3-चरणीय फ़ॉर्म और वैकल्पिक आवाज़ डिक्टेशन मिलता है।',
        },
      ],
    },
    whatToReport: {
      eyebrow: 'B · आप क्या रिपोर्ट कर सकते हैं?',
      heading: 'रिपोर्ट शुरू करने के लिए कोई भी श्रेणी चुनें',
      subheading:
        'नीचे किसी भी श्रेणी पर क्लिक करें और वही श्रेणी चुने हुए फ़ॉर्म के साथ तुरंत रिपोर्ट शुरू करें।',
      categories: [
        {
          category: 'road_damage',
          title: 'सड़क क्षति',
          examples: 'गड्ढे, टूटी सड़क, असमान क्रॉसिंग, धँसा हुआ रास्ता।',
          ctaLabel: 'सड़क क्षति रिपोर्ट करें',
        },
        {
          category: 'garbage',
          title: 'कचरा और स्वच्छता',
          examples: 'भरे हुए कूड़ेदान, सड़कों पर कचरे के ढेर, रुका हुआ फुटपाथ।',
          ctaLabel: 'कचरा रिपोर्ट करें',
        },
        {
          category: 'water_leakage',
          title: 'पानी का रिसाव',
          examples: 'फटी पाइपलाइन, बहते वाल्व, सड़क पर लगातार पानी की बर्बादी।',
          ctaLabel: 'पानी रिसाव रिपोर्ट करें',
        },
        {
          category: 'streetlight',
          title: 'स्ट्रीटलाइट',
          examples: 'अंधेरे चौराहे, झिलमिलाते खंभे, बिना रोशनी वाले पैदल मार्ग।',
          ctaLabel: 'स्ट्रीटलाइट रिपोर्ट करें',
        },
        {
          category: 'drainage',
          title: 'जल निकासी',
          examples: 'बंद नालियाँ, जलभराव, टूटे हुए नाली के ढक्कन।',
          ctaLabel: 'जल निकासी रिपोर्ट करें',
        },
        {
          category: 'public_safety',
          title: 'जन सुरक्षा',
          examples: 'खुले तार, खुला मैनहोल, गिरी हुई टहनियाँ, असुरक्षित क्रॉसिंग।',
          ctaLabel: 'जन सुरक्षा रिपोर्ट करें',
        },
      ],
    },
    howItWorks: {
      eyebrow: 'C · यह कैसे काम करता है',
      heading: 'एक फ़ोटो और पिन से दिखने वाले समाधान तक',
      subheading:
        'सरल सामुदायिक प्रक्रिया जो निवासियों और वार्ड टीमों दोनों को स्पष्ट जानकारी देती है।',
      aiAdvisoryBadge: 'मोहल्ला अंतर्दृष्टि (AI) केवल सलाहकार सुझाव हैं जिन पर मानव समीक्षा आवश्यक है',
      stages: [
        {
          stage: 'चरण 1 — रिपोर्ट',
          title: 'समस्या रिपोर्ट करें',
          description:
            'अंग्रेज़ी या हिंदी में (टाइप या आवाज़ से) बताएं क्या हुआ, चाहें तो फ़ोटो जोड़ें और मैप पर पिन लगाएं।',
          detail: 'पास की खुली रिपोर्ट से डुप्लीकेट जाँच होती है और यूनिक ट्रैकिंग ID मिलती है।',
        },
        {
          stage: 'चरण 2 — समस्या को समझें',
          title: 'समस्या को समझें',
          description:
            'ApnaWard विवरण और फ़ोटो के आधार पर श्रेणी, गंभीरता और मोहल्ला प्रभाव का सुझाव दे सकता है।',
          detail: 'हमेशा AI सुझाव के रूप में स्पष्ट रूप से चिह्नित — अंतिम नियंत्रण आपका और टीम का है।',
          highlightNote: 'केवल AI सुझाव — मानव समीक्षा आवश्यक',
        },
        {
          stage: 'चरण 3 — प्राथमिकता',
          title: 'पहले किस पर ध्यान दें',
          description:
            'पारदर्शी नियम गंभीरता, सार्वजनिक स्थान के संकेतों और प्रतीक्षा समय को स्पष्ट स्कोर में बदलते हैं।',
          detail: 'हर अंक दिखता है ताकि लोग समझ सकें कि स्कूल या क्लिनिक के पास के खतरे पहले क्यों आते हैं।',
        },
        {
          stage: 'चरण 4 — वार्ड कार्रवाई',
          title: 'वार्ड संचालन और कार्रवाई',
          description:
            'वार्ड टीमें सामुदायिक रिपोर्ट देखती हैं, ध्यान देने योग्य क्षेत्र पहचानती हैं और फ़ील्ड नोट्स लिखती हैं।',
          detail: 'रिपोर्ट की गई → प्रगति पर → समाधान चिह्नित करें के रूप में स्थिति बदलती है।',
        },
        {
          stage: 'चरण 5 — प्रगति देखें',
          title: 'अपनी रिपोर्ट ट्रैक करें',
          description: 'प्रगति बार और ताज़ा अपडेट नोट पढ़ने के लिए कभी भी अपनी रिपोर्ट ID डालें।',
          detail: 'इस डेमो में बिना लॉगिन के हर रिपोर्ट ID की खुली पारदर्शिता उपलब्ध है।',
        },
      ],
    },
    wardGlance: {
      eyebrow: 'D · आपका वार्ड एक नज़र में',
      heading: 'सभी वार्डों में क्या हो रहा है, इसका स्पष्ट सारांश',
      subheading:
        'इस ब्राउज़र में सहेजी गई सक्रिय रिपोर्टों (नमूना डेमो रिकॉर्ड + आपकी जोड़ी गई रिपोर्ट) से सीधे गणना किए गए आँकड़े।',
      totalLabel: 'कुल रिपोर्ट',
      pendingLabel: 'लंबित और प्रगति पर',
      highPriorityLabel: 'उच्च-प्राथमिकता खुली',
      resolvedLabel: 'समाधान चिह्नित',
      demoNote: 'इसमें स्थानीय ब्राउज़र रिपोर्ट के साथ स्पष्ट रूप से चिह्नित वार्ड 1–6 डेमो डेटा शामिल है।',
      openOpsBtn: 'वार्ड संचालन खोलें',
      openAnalyticsBtn: 'वार्ड विश्लेषण खोलें',
    },
    nearbyMap: {
      eyebrow: 'E · देखें आसपास क्या हो रहा है',
      heading: 'मोहल्ले के मानचित्र पर समस्याएँ देखें',
      subheading:
        'इंटरैक्टिव OpenStreetMap दृश्य पर रिपोर्ट किए गए स्थान, चल रहे काम और समाधान हो चुकी रिपोर्ट देखें।',
      exploreMapCta: 'पूरा मैप खोलें',
      legendReported: 'लंबित / रिपोर्ट की गई',
      legendInProgress: 'प्रगति पर',
      legendResolved: 'समाधान हो चुका',
      attributionNote: 'Leaflet और © OpenStreetMap योगदानकर्ताओं द्वारा संचालित इंटरैक्टिव पूर्वावलोकन (उदाहरणात्मक वार्ड ग्रिड)।',
    },
    yourVoice: {
      eyebrow: 'F · आपकी आवाज़ मायने रखती है',
      heading: 'पड़ोसियों, सामुदायिक समीक्षकों और वार्ड टीमों के लिए बनाया गया',
      subheading:
        'चाहे आप अपने घर के बाहर खराब स्ट्रीटलाइट रिपोर्ट कर रहे हों या साप्ताहिक वार्ड रखरखाव की योजना बना रहे हों, ApnaWard सरल मानवीय भाषा का उपयोग करता है।',
      nonOfficialNote:
        'प्रोटोटाइप सूचना: ApnaWard एक स्वतंत्र नागरिक-तकनीक प्रदर्शन है। यह किसी सरकारी विभाग से आधिकारिक जुड़ाव का दावा नहीं करता।',
      roles: [
        {
          id: 'citizens',
          role: 'निवासियों के लिए',
          summary: 'बिना उलझन वाले शब्दों के एक मिनट से कम समय में स्थानीय समस्या साझा करें।',
          benefits: [
            'अंग्रेज़ी या हिंदी में सरल संकेत',
            'वैकल्पिक आवाज़ डिक्टेशन और फ़ोटो अपलोड',
            'सबमिट करने से पहले पास के डुप्लीकेट की सूचना',
            'अपनी रिपोर्ट ट्रैक करें के लिए तुरंत यूनिक ID',
          ],
          actionLabel: 'समस्या रिपोर्ट करें',
          targetSection: 'report',
        },
        {
          id: 'admins',
          role: 'वार्ड टीमों के लिए',
          summary: 'सामुदायिक रिपोर्ट को स्पष्ट प्राथमिकता और सार्वजनिक नोट्स के साथ संभालें।',
          benefits: [
            'एक नज़र में देखें पहले किस पर ध्यान दें',
            'फ़ोटो, मैप पिन और AI सुझाव एक साथ देखें',
            'प्रगति पर या समाधान चिह्नित करें चुनें',
            'समय-चिह्नित नोट्स से निवासियों को सूचित रखें',
          ],
          actionLabel: 'वार्ड संचालन खोलें',
          targetSection: 'management',
        },
        {
          id: 'planners',
          role: 'मोहल्ला समन्वयकों के लिए',
          summary: 'सभी छह नमूना वार्डों में बार-बार आने वाली सड़कों की समस्याओं को पहचानें।',
          benefits: [
            'वार्ड-दर-वार्ड श्रेणियों की तुलना करें',
            'ध्यान देने योग्य क्षेत्र स्वतः पहचानें',
            'समय के साथ समाधान प्रगति पर नज़र रखें',
            'बिखरी रिपोर्टों को स्पष्ट प्राथमिकताओं में बदलें',
          ],
          actionLabel: 'वार्ड विश्लेषण देखें',
          targetSection: 'command',
        },
      ],
    },
    scenario: {
      heading: 'शुरू से अंत तक एक मोहल्ले की रिपोर्ट का सफ़र देखें',
      subheading:
        'देखें कि कैसे एक निवासी के फ़ोन से भेजी गई टूटी सड़क की रिपोर्ट स्पष्ट समाधान ट्रैकिंग तक पहुँचती है।',
      illustrativeLabel: 'उदाहरणात्मक डेमो · नमूना यात्रा',
      disclaimer:
        'पारदर्शिता सूचना: वार्ड 2 · स्टेशन रोड और नमूना ID AW-DEMO-RD01 केवल उदाहरणात्मक डेमो डेटा हैं। इससे कोई वास्तविक सरकारी मरम्मत शुरू नहीं होती।',
      stepOf: 'चरण',
      prevBtn: 'पिछला',
      nextBtn: 'अगला',
      autoPlayBtn: 'स्वतः चलाएं',
      pauseBtn: 'रोकें',
      tryReportBtn: 'ऐसी ही रिपोर्ट करके देखें',
      steps: [
        {
          id: 'submit',
          stepNum: '01',
          title: 'निवासी ने गड्ढे की रिपोर्ट की',
          actor: 'पड़ोसी (डेमो)',
          statusBadge: 'सबमिट किया गया',
          summary:
            'एक यात्री वार्ड 2 · स्टेशन रोड बस स्टॉप के पास गहरा गड्ढा देखता है और फ़ोटो व मैप पिन के साथ रिपोर्ट भेजता है।',
          systemNote: 'ब्राउज़र में नमूना ट्रैकिंग ID AW-DEMO-RD01 मिली।',
          metaRows: [
            { label: 'स्थान (डेमो)', value: 'वार्ड 2 · स्टेशन रोड' },
            { label: 'माध्यम', value: 'आवाज़ (EN/HI) + 1 फ़ोटो' },
            { label: 'डेटा प्रकार', value: 'उदाहरणात्मक डेमो' },
          ],
        },
        {
          id: 'ai-cat',
          stepNum: '02',
          title: 'समस्या को समझें: श्रेणी',
          actor: 'मोहल्ला अंतर्दृष्टि (सलाहकार)',
          statusBadge: 'सुझाव: सड़क क्षति',
          summary:
            'ApnaWard विवरण और फ़ोटो पढ़कर "सड़क क्षति" श्रेणी का सुझाव देता है ताकि निवासी को अनुमान न लगाना पड़े।',
          systemNote: 'AI सुझाव के रूप में चिह्नित — कभी भी बदला जा सकता है।',
          metaRows: [
            { label: 'सुझाई गई श्रेणी', value: 'सड़क क्षति' },
            { label: 'नियंत्रण', value: 'निवासी और समीक्षक बदल सकते हैं' },
            { label: 'ऑफ़लाइन सुरक्षा', value: 'मैनुअल चयन हमेशा उपलब्ध' },
          ],
        },
        {
          id: 'ai-sev',
          stepNum: '03',
          title: 'समस्या को समझें: गंभीरता',
          actor: 'मोहल्ला अंतर्दृष्टि (सलाहकार)',
          statusBadge: 'उच्च प्राथमिकता संकेत',
          summary:
            'व्यस्त बस स्टॉप के पास दोपहिया वाहनों को अचानक मुड़ना पड़ता है, इसलिए सलाहकार अंतर्दृष्टि उच्च गंभीरता सुझाती है।',
          systemNote: 'केवल सलाहकार संकेत — कोई इंजीनियरिंग जाँच नहीं।',
          metaRows: [
            { label: 'सुझाई गई गंभीरता', value: 'उच्च (High)' },
            { label: 'मोहल्ला संकेत', value: 'व्यस्त बस स्टॉप और स्कूल मार्ग' },
            { label: 'सुझाया गया पहला कदम', value: 'चेतावनी कोन लगाएं और जाँच करें' },
          ],
        },
        {
          id: 'priority',
          stepNum: '04',
          title: 'पहले किस पर ध्यान दें',
          actor: 'पारदर्शी प्राथमिकता नियम',
          statusBadge: 'स्कोर: 84 / 100',
          summary:
            'खुले नियम गंभीरता, सार्वजनिक स्थान प्रभाव और प्रतीक्षा घंटे जोड़ते हैं ताकि बस स्टॉप के पास का खतरा पहले दिखे।',
          systemNote: 'हर अंक सरल भाषा में दिखता है — कोई छिपा स्कोर नहीं।',
          metaRows: [
            { label: 'गंभीरता अंक', value: '34 / 45 (उच्च)' },
            { label: 'सार्वजनिक स्थान प्रभाव', value: '30 / 35 (परिवहन और स्कूल)' },
            { label: 'प्रतीक्षा समय', value: '20 / 20 (बीता समय)' },
          ],
        },
        {
          id: 'map',
          stepNum: '05',
          title: 'मैप देखें पर दिखाई देता है',
          actor: 'सामुदायिक मानचित्र',
          statusBadge: 'वार्ड 2 में पिन',
          summary:
            'OpenStreetMap पर एम्बर-लाल सड़क क्षति पिन दिखता है ताकि पड़ोसी और समन्वयक आसपास के क्लस्टर देख सकें।',
          systemNote: 'डेमो निर्देशांक केवल काल्पनिक वार्ड ग्रिड दर्शाते हैं।',
          metaRows: [
            { label: 'नमूना निर्देशांक', value: '12.9762° N, 77.5713° E' },
            { label: 'पिन स्थिति', value: 'रिपोर्ट की गई (एम्बर/उच्च रिंग)' },
            { label: 'क्लस्टर जाँच', value: 'वार्ड 2 हॉटस्पॉट में शामिल' },
          ],
        },
        {
          id: 'admin-review',
          stepNum: '06',
          title: 'सामुदायिक रिपोर्ट में समीक्षा',
          actor: 'वार्ड संचालन डेमो',
          statusBadge: 'समीक्षाधीन',
          summary:
            'वार्ड समन्वयक ड्रॉअर खोलकर फ़ोटो देखता है, प्राथमिकता पुष्टि करता है और फ़ील्ड अपडेट तैयार करता है।',
          systemNote: 'सभी बदलाव हर स्क्रीन पर तुरंत सिंक होते हैं।',
          metaRows: [
            { label: 'सूची स्थान', value: 'शीर्ष प्राथमिकता (84/100)' },
            { label: 'AI सुझाव', value: 'मानव समीक्षक द्वारा पुष्ट' },
            { label: 'अगला कदम', value: 'स्थिति अपडेट लिखना' },
          ],
        },
        {
          id: 'in-progress',
          stepNum: '07',
          title: 'स्थिति प्रगति पर बदली गई',
          actor: 'वार्ड संचालन डेमो',
          statusBadge: 'प्रगति पर',
          summary:
            'स्थिति "प्रगति पर" कर दी जाती है और सरल नोट जोड़ा जाता है: "सुरक्षा बैरिकेड लगा दिए गए हैं; दोपहर में मरम्मत तय है।"',
          systemNote: 'समय-चिह्नित अपडेट तुरंत निवासियों को दिखता है।',
          metaRows: [
            { label: 'स्थिति', value: 'प्रगति पर' },
            { label: 'मैप रिंग', value: 'सक्रिय नीली/सियान रिंग' },
            { label: 'निवासी दृश्य', value: 'अपनी रिपोर्ट ट्रैक करें में लाइव' },
          ],
        },
        {
          id: 'resolved',
          stepNum: '08',
          title: 'समाधान चिह्नित करें (डेमो)',
          actor: 'वार्ड संचालन डेमो',
          statusBadge: 'समाधान हो चुका',
          summary:
            'इस नमूना कहानी में मरम्मत के बाद समन्वयक "समाधान चिह्नित करें" चुनकर समापन नोट लिखता है। वार्ड सारांश तुरंत अपडेट होता है।',
          systemNote: 'केवल उदाहरणात्मक डेमो — कोई वास्तविक मरम्मत नहीं हुई।',
          metaRows: [
            { label: 'स्थिति', value: 'समाधान हो चुका (हरा)' },
            { label: 'वार्ड सारांश', value: 'समाधान संख्या तुरंत अपडेट' },
            { label: 'नोट दर्ज', value: 'समय-चिह्नित समापन विवरण' },
          ],
        },
        {
          id: 'citizen-track',
          stepNum: '09',
          title: 'निवासी ने अपनी रिपोर्ट ट्रैक की',
          actor: 'पड़ोसी',
          statusBadge: 'ID से सत्यापित',
          summary:
            'निवासी अपनी रिपोर्ट ट्रैक करें पर AW-DEMO-RD01 (या AW-2026-001) दर्ज करता है और पूरी 3-चरणीय टाइमलाइन देखता है।',
          systemNote: 'अंग्रेज़ी और हिंदी दोनों में तुरंत उपलब्ध।',
          metaRows: [
            { label: 'टाइमलाइन', value: 'रिपोर्ट की गई → प्रगति पर → समाधान' },
            { label: 'ताज़ा नोट', value: 'तिथि और समय सहित दिखता है' },
            { label: 'भाषाएँ', value: 'English / हिंदी' },
          ],
        },
      ],
    },
    features: {
      heading: 'G · APNAWARD के हर हिस्से को देखें',
      subheading:
        'नीचे किसी भी लाइव कार्यक्षेत्र को खोलें — एक ओर निवासियों के लिए सरल और दूसरी ओर वार्ड टीमों के लिए स्पष्ट।',
      purposeLabel: 'यह क्या करता है',
      usefulLabel: 'यह क्यों उपयोगी है',
      exampleLabel: 'उदाहरण',
      cards: [
        {
          id: 'report',
          section: 'report',
          title: 'समस्या रिपोर्ट करें',
          purpose:
            'क्या हुआ बताने, मैप पर स्थान पिन करने, फ़ोटो जोड़ने या अंग्रेज़ी/हिंदी में बोलकर रिपोर्ट करने के सरल चरण।',
          whyUseful: 'डुप्लीकेट रिपोर्ट से बचाते हुए पहली बार में सही विवरण दर्ज करना आसान बनाता है।',
          example:
            'रिवरसाइड क्लिनिक के पास खराब स्ट्रीटलाइट रिपोर्ट करने पर AW-2026-013 जैसी यूनिक ID मिलती है।',
          openButton: 'समस्या रिपोर्ट करें खोलें',
        },
        {
          id: 'track',
          section: 'track',
          title: 'अपनी रिपोर्ट ट्रैक करें',
          purpose: 'किसी भी रिपोर्ट ID से वर्तमान स्थिति, 3-चरणीय टाइमलाइन और ताज़ा वार्ड नोट देखें।',
          whyUseful: 'पड़ोसियों को बिना फ़ोन कॉल या चक्कर लगाए स्पष्ट उत्तर देता है।',
          example: 'AW-2026-001 दर्ज करने पर प्रगति पर स्थिति, प्राथमिकता स्कोर और वार्ड 2 अपडेट दिखता है।',
          openButton: 'रिपोर्ट ट्रैकिंग खोलें',
        },
        {
          id: 'map',
          section: 'map',
          title: 'मैप देखें',
          purpose:
            'OpenStreetMap पर श्रेणी आइकन, स्थिति रंग, फ़िल्टर और ध्यान देने योग्य क्षेत्र दिखाता है।',
          whyUseful: 'उन गलियों को आसानी से दिखाता है जहाँ समस्याएँ बार-बार आती हैं।',
          example: 'वार्ड 2 फ़िल्टर करने पर स्टेशन रोड के पास सड़क और जल निकासी के पिन समूह दिखते हैं।',
          openButton: 'मैप देखें खोलें',
        },
        {
          id: 'inspector',
          section: 'inspector',
          title: 'मोहल्ला अंतर्दृष्टि',
          purpose:
            'श्रेणी, गंभीरता, सार्वजनिक प्रभाव और पहले कदमों के लिए AI-सहायता प्राप्त "समस्या को समझें" सुझाव देता है।',
          whyUseful: 'लंबे विवरण पढ़ने का समय बचाता है जबकि अंतिम निर्णय मनुष्य के हाथ में रहता है।',
          example: 'मुख्य पानी पाइप रिसाव की जाँच करने पर सलाहकार के रूप में गंभीर स्थिति का सुझाव मिलता है।',
          disclaimer: 'AI अंतर्दृष्टि केवल सलाहकार सुझाव हैं — मानव समीक्षा हमेशा आवश्यक है।',
          openButton: 'मोहल्ला अंतर्दृष्टि खोलें',
        },
        {
          id: 'overview',
          section: 'overview',
          title: 'वार्ड संचालन',
          purpose:
            'समन्वयकों को खुली रिपोर्ट, उच्च-प्राथमिकता अलर्ट, समाधान दर और हाल की गतिविधियों का पूरा सार देता है।',
          whyUseful: 'वार्ड टीमों का ध्यान सक्रिय काम और ताज़ा बदलावों पर बनाए रखता है।',
          example: '4 उच्च-प्राथमिकता वाली रिपोर्ट देखकर तुरंत सबसे जरूरी समस्या खोलना।',
          openButton: 'वार्ड संचालन खोलें',
        },
        {
          id: 'management',
          section: 'management',
          title: 'सामुदायिक रिपोर्ट',
          purpose:
            'स्थिति बदलने, समाधान चिह्नित करने और पारदर्शी नोट्स जोड़ने के साथ हर रिपोर्ट को फ़िल्टर और प्रबंधित करें।',
          whyUseful: 'बिखरी हुई शीट्स की जगह एक जवाबदेह सूची लाता है जो सीधे ट्रैकिंग पेज से जुड़ती है।',
          example: 'ड्रॉअर में AW-2026-002 खोलकर उसे प्रगति पर करना और फ़ील्ड नोट जोड़ना।',
          openButton: 'सामुदायिक रिपोर्ट खोलें',
        },
        {
          id: 'command',
          section: 'command',
          title: 'वार्ड विश्लेषण और पहले किस पर ध्यान दें',
          purpose:
            'वार्डों के बीच लंबित बनाम समाधान पैटर्न की तुलना करता है, ध्यान देने योग्य क्षेत्र दिखाता है और प्राथमिकता स्कोर समझाता है।',
          whyUseful: 'मोहल्ले की रिपोर्टों को पारदर्शी और न्यायसंगत योजना में बदलता है।',
          example: 'वार्ड 1 नॉर्थ मार्केट और वार्ड 4 लेकव्यू ईस्ट की श्रेणियों की तुलना करना।',
          openButton: 'वार्ड विश्लेषण खोलें',
        },
      ],
    },
    trust: {
      eyebrow: 'समुदाय विश्वास और पारदर्शिता',
      heading: 'ApnaWard कैसे काम करता है — स्पष्ट उत्तर',
      subheading:
        'भरोसा ईमानदारी से बनता है। जानिए इस प्रोटोटाइप में हर रिपोर्ट, स्कोर और स्थिति अपडेट के पीछे क्या होता है।',
      questions: [
        {
          title: '1. रिपोर्ट सबमिट करने के बाद क्या होता है?',
          body: 'आपकी रिपोर्ट तुरंत एक यूनिक ट्रैकिंग ID (जैसे AW-2026-013) के साथ इस ब्राउज़र में सहेजी जाती है, मैप देखें पर दिखाई देती है और समीक्षा के लिए सामुदायिक रिपोर्ट में जुड़ जाती है।',
        },
        {
          title: '2. "पहले किस पर ध्यान दें" स्कोर कैसे निकलता है?',
          body: 'एक खुला नियम-आधारित स्कोर (0–100) गंभीरता अंक (कम/मध्यम/उच्च/गंभीर), सार्वजनिक स्थान संकेत (जैसे स्कूल, क्लिनिक, बस स्टॉप) और प्रतीक्षा समय को जोड़ता है। AI सुझाव केवल सलाहकार हैं।',
        },
        {
          title: '3. इस डेमो में स्थिति कौन बदल सकता है?',
          body: 'क्योंकि यह बिना लॉगिन और बिना किसी सरकारी जुड़ाव वाला प्रोटोटाइप है, कोई भी व्यक्ति वार्ड संचालन → सामुदायिक रिपोर्ट में जाकर पूरा अपडेट अनुभव कर सकता है।',
        },
        {
          title: '4. हर स्थिति का क्या अर्थ है?',
          body: 'रिपोर्ट की गई (एम्बर) का अर्थ है कि रिपोर्ट दर्ज हो चुकी है। प्रगति पर (नीला/सियान) का अर्थ है कि जाँच या काम चल रहा है। समाधान हो चुका (हरा) का अर्थ है कि समापन नोट के साथ कार्य पूरा चिह्नित हो गया है।',
        },
        {
          title: '5. नागरिक प्रगति कैसे देख सकते हैं?',
          body: 'सबमिट करते समय मिली अपनी यूनिक ID संभाल कर रखें और कभी भी अपनी रिपोर्ट ट्रैक करें पेज पर डालकर अंग्रेज़ी या हिंदी में पूरी टाइमलाइन और नोट देखें।',
        },
      ],
      bottomCtaTitle: 'अपने मोहल्ले की मदद के लिए तैयार हैं?',
      bottomCtaSub: 'एक नमूना रिपोर्ट भेजें, AW-2026-001 ट्रैक करें या 60-सेकंड का टूर देखें।',
    },
    tour: {
      badge: '60-सेकंड APNAWARD टूर',
      stepLabel: 'चरण',
      of: 'में से',
      prevBtn: 'पिछला',
      nextBtn: 'अगला',
      skipBtn: 'टूर छोड़ें',
      finishBtn: 'टूर समाप्त करें',
      minimizeBtn: 'छोटा करें',
      expandBtn: 'टूर खोलें',
      steps: [
        {
          stepTitle: 'वार्ड संचालन सारांश',
          sectionTag: '1 · वार्ड संचालन',
          headline: 'एक नज़र में वार्ड स्थिति और खुली रिपोर्ट देखें',
          explanation:
            'हमने वार्ड संचालन खोला है। यहाँ कुल रिपोर्ट, खुली सूची, उच्च-प्राथमिकता संख्या, समाधान दर और हाल की गतिविधियाँ देखें।',
          highlightNote: 'डेमो रिकॉर्ड DEMO DATA टैग के साथ हैं; आपकी बनाई रिपोर्ट ब्राउज़र में सहेजी रहती हैं।',
        },
        {
          stepTitle: 'मैप देखें',
          sectionTag: '2 · मैप देखें',
          headline: 'मोहल्ले के पिन और ध्यान देने योग्य क्षेत्र',
          explanation:
            'यह इंटरैक्टिव Leaflet + OpenStreetMap मानचित्र नमूना रिपोर्ट AW-2026-002 पर केंद्रित है। पिन श्रेणी, स्थिति रंग और हॉटस्पॉट दिखाते हैं।',
          highlightNote: 'डेमो निर्देशांक केवल एक उदाहरणात्मक मोहल्ला ग्रिड दर्शाते हैं।',
        },
        {
          stepTitle: 'समस्या रिपोर्ट करें',
          sectionTag: '3 · समस्या रिपोर्ट करें',
          headline: 'आवाज़, फ़ोटो और मैप पिन के साथ सरल रिपोर्टिंग',
          explanation:
            'हमने 3-चरणीय फ़ॉर्म में एक नमूना सड़क रिपोर्ट भरी है। निवासी अंग्रेज़ी या हिंदी में बोलकर या लिखकर रिपोर्ट भेज सकते हैं।',
          highlightNote: 'आप इसे बदलकर या सबमिट करके स्थानीय AW-2026 ID बना सकते हैं।',
        },
        {
          stepTitle: 'समस्या को समझें (AI)',
          sectionTag: '4 · मोहल्ला अंतर्दृष्टि',
          headline: 'तेज़ समीक्षा के लिए सलाहकार AI सुझाव',
          explanation:
            'मोहल्ला अंतर्दृष्टि में नमूना रिपोर्ट AW-2026-002 लोड है। देखें कि श्रेणी, गंभीरता और अगले कदम स्पष्ट रूप से सुझाव के रूप में चिह्नित हैं।',
          highlightNote: 'बैंगनी रंग केवल AI अंतर्दृष्टि के लिए है — मानव समीक्षा हमेशा आवश्यक है।',
        },
        {
          stepTitle: 'अपनी रिपोर्ट ट्रैक करें',
          sectionTag: '5 · अपनी रिपोर्ट ट्रैक करें',
          headline: 'यूनिक ID से किसी भी रिपोर्ट की प्रगति देखें',
          explanation:
            'अब आप नमूना रिपोर्ट AW-2026-001 की ट्रैकिंग देख रहे हैं। कोई भी ID डालकर 3-चरणीय प्रगति और ताज़ा वार्ड नोट देखें।',
          highlightNote: 'शीर्ष बार में EN ↔ हिंदी बदलकर देखें — AW-2026-001 जैसी ID वही रहेगी।',
        },
        {
          stepTitle: 'वार्ड विश्लेषण और प्राथमिकता',
          sectionTag: '6 · वार्ड विश्लेषण',
          headline: 'वार्ड तुलना, क्लस्टर और पहले किस पर ध्यान दें',
          explanation:
            'वार्ड विश्लेषण सभी वार्डों के पैटर्न, ध्यान देने योग्य क्षेत्र और प्राथमिकता क्रम को एक साथ दिखाता है।',
          highlightNote: 'स्वतंत्र रूप से देखने के लिए टूर समाप्त करें या सामुदायिक रिपोर्ट में स्थिति बदलकर देखें।',
        },
      ],
    },
    judgeDemo: {
      badge: 'गाइडेड प्लेटफ़ॉर्म परिचय',
      title: 'ApnaWard — संपूर्ण कहानी और सुविधा परिचय',
      chapterWord: 'अध्याय',
      of: 'में से',
      prevBtn: 'पिछला',
      nextBtn: 'अगला अध्याय',
      exitBtn: 'परिचय बंद करें',
      liveActionHint: 'सीधे लाइव स्क्रीन पर जाएं और कभी भी वापस लौटें:',
      expectedValueNotice:
        'प्रोटोटाइप सूचना: अध्याय 7 में दिए गए लाभ इस कार्यप्रणाली डिज़ाइन के अपेक्षित सामुदायिक मूल्य हैं, वास्तविक सरकारी आँकड़े नहीं।',
      chapters: [
        {
          id: 'problem',
          chapterTag: 'अध्याय 1 · APNAWARD क्यों',
          title: 'मोहल्ले की रोज़मर्रा की समस्याओं के लिए एक स्पष्ट मंच',
          subtitle: 'जब रिपोर्ट बिखरी और अस्पष्ट होती हैं, तो छोटी समस्याएँ बड़ी परेशानी बन जाती हैं।',
          bullets: [
            'गड्ढे, कचरा और पानी रिसाव की शिकायतें अलग-अलग माध्यमों में बंटी रहती हैं।',
            'लोगों को पता नहीं चलता कि उनकी रिपोर्ट पर काम शुरू हुआ या नहीं।',
            'वार्ड टीमों के पास खतरनाक समस्याओं को पहले छांटने का पारदर्शी तरीका नहीं होता।',
            'कठिन अंग्रेज़ी फ़ॉर्म कई पड़ोसियों को भाग लेने से रोकते हैं।',
          ],
          calloutTitle: 'मुख्य कमी',
          calloutBody: 'स्थान-आधारित, द्विभाषी और खुली ट्रैकिंग के बिना समुदाय का विश्वास कम होता है।',
          actionType: 'why',
          actionLabel: 'होम पर परिचय अनुभाग देखें',
        },
        {
          id: 'solution',
          chapterTag: 'अध्याय 2 · सामुदायिक कार्यप्रणाली',
          title: 'एक जुड़ा हुआ चक्र: रिपोर्ट, समझ, कार्रवाई, ट्रैक',
          subtitle: 'ApnaWard सरल भाषा में निवासी रिपोर्टिंग को वार्ड संचालन से जोड़ता है।',
          bullets: [
            '1. समस्या रिपोर्ट करें: आवाज़ (EN/HI), फ़ोटो और मैप पिन के साथ 3-चरणीय फ़ॉर्म।',
            '2. समस्या को समझें: मानव समीक्षा के लिए सलाहकार AI श्रेणी और गंभीरता सुझाता है।',
            '3. पहले किस पर ध्यान दें: खुला 0–100 स्कोर गंभीरता, प्रभाव और प्रतीक्षा समय जोड़ता है।',
            '4. मैप और ट्रैकिंग: OpenStreetMap क्लस्टर, सामुदायिक रिपोर्ट और ID खोज।',
          ],
          calloutTitle: 'विश्वसनीय प्रोटोटाइप',
          calloutBody: 'स्थानीय ब्राउज़र में वार्ड 1–6 डेमो डेटा और ऑफ़लाइन मैनुअल फ़ॉलबैक के साथ चलता है।',
          actionType: 'how',
          actionLabel: 'होम पर कार्यप्रणाली देखें',
        },
        {
          id: 'citizen',
          chapterTag: 'अध्याय 3 · निवासी अनुभव',
          title: 'आसान रिपोर्टिंग और तुरंत ID ट्रैकिंग',
          subtitle: 'त्वरित अंग्रेज़ी ↔ हिंदी बदलाव और वॉइस डिक्टेशन के साथ सुलभ डिज़ाइन।',
          bullets: [
            'सरल प्रश्न ("क्या हुआ?", "यह कहाँ देखा?") रिपोर्टिंग को तेज़ बनाते हैं।',
            'पास की समान खुली रिपोर्ट होने पर स्वतः डुप्लीकेट चेतावनी दिखती है।',
            'हर सबमिशन पर AW-2026-013 जैसी स्थायी यूनिक ID बनती है।',
            'अपनी रिपोर्ट ट्रैक करें पर 3-चरणीय टाइमलाइन और ताज़ा नोट दिखता है।',
          ],
          calloutTitle: 'लाइव आज़माएं',
          calloutBody: 'अभी एक नमूना रिपोर्ट भेजें या AW-2026-001 को ट्रैक करें।',
          actionType: 'report',
          actionLabel: 'समस्या रिपोर्ट करें खोलें',
          secondaryActionType: 'track',
          secondaryActionLabel: 'AW-2026-001 ट्रैक करें',
        },
        {
          id: 'ai',
          chapterTag: 'अध्याय 4 · मोहल्ला अंतर्दृष्टि',
          title: 'सलाहकार AI सहायता + खुले प्राथमिकता नियम',
          subtitle: 'AI समझने में मदद करता है — अंतिम निर्णय हमेशा मनुष्य के हाथ में रहता है।',
          bullets: [
            'सर्वर-साइड /api/analyze-issue रूट सुरक्षित तरीके से Gemini का उपयोग करता है।',
            'श्रेणी, गंभीरता, कारण, जन-प्रभाव और पहला कदम सुझाता है।',
            'बैंगनी रंग में स्पष्ट रूप से सलाहकार सुझाव के रूप में चिह्नित।',
            'नियम-आधारित इंजन गंभीरता (45) + प्रभाव (35) + प्रतीक्षा (20) जोड़ता है।',
          ],
          calloutTitle: 'मानव समीक्षा सर्वोपरि',
          calloutBody: 'AI उपलब्ध न होने पर भी मैनुअल चयन से रिपोर्टिंग बिना रुके जारी रहती है।',
          actionType: 'inspector',
          actionLabel: 'मोहल्ला अंतर्दृष्टि खोलें (AW-2026-002)',
        },
        {
          id: 'ward',
          chapterTag: 'अध्याय 5 · मैप और वार्ड विश्लेषण',
          title: 'मैप देखें, ध्यान देने योग्य क्षेत्र और वार्ड तुलना',
          subtitle: 'Leaflet और OpenStreetMap से बार-बार होने वाले क्षेत्रों को स्पष्ट देखें।',
          bullets: [
            'OpenStreetMap पर सीधे श्रेणी आइकन और स्थिति रंग (एम्बर, नीला, हरा)।',
            'वार्ड, श्रेणी, गंभीरता, स्थिति या कीवर्ड से फ़िल्टर करें।',
            'नज़दीकी क्लस्टरिंग से ध्यान देने योग्य क्षेत्र (300m–650m) स्वतः दिखते हैं।',
            'सभी चार्ट एक ही साझा रिपोर्ट सूची से तुरंत अपडेट होते हैं।',
          ],
          calloutTitle: 'उदाहरणात्मक वार्ड ग्रिड',
          calloutBody: 'नमूना वार्ड 1–6 प्रदर्शन के लिए स्पष्ट उदाहरणात्मक निर्देशांक उपयोग करते हैं।',
          actionType: 'map',
          actionLabel: 'मैप देखें खोलें',
          secondaryActionType: 'command',
          secondaryActionLabel: 'वार्ड विश्लेषण खोलें',
        },
        {
          id: 'admin',
          chapterTag: 'अध्याय 6 · वार्ड संचालन',
          title: 'सामुदायिक रिपोर्ट, समाधान चिह्नित करें और सार्वजनिक नोट्स',
          subtitle: 'एक साझा विवरण ड्रॉअर से पूरी पारदर्शिता बनाए रखें।',
          bullets: [
            'सामुदायिक रिपोर्ट प्राथमिकता स्कोर, वार्ड, श्रेणी और स्थिति से छांटता है।',
            'किसी भी रिपोर्ट को खोलने पर फ़ोटो, मैप पिन, AI सुझाव और स्कोर गणित दिखता है।',
            'प्रगति पर करने या समाधान चिह्नित करने पर हर पेज तुरंत अपडेट होता है।',
            'निवासी अपनी रिपोर्ट ट्रैक करें पेज पर नया नोट तुरंत देख सकते हैं।',
          ],
          calloutTitle: 'अपडेट करके देखें',
          calloutBody: 'ड्रॉअर में AW-2026-002 खोलकर स्थिति बदलें और ट्रैकिंग पेज पर जांचें।',
          actionType: 'drawer',
          actionLabel: 'रिपोर्ट ड्रॉअर खोलें (AW-2026-002)',
          secondaryActionType: 'track',
          secondaryActionLabel: 'ट्रैकिंग पेज पर जांचें',
        },
        {
          id: 'value',
          chapterTag: 'अध्याय 7 · सामुदायिक मूल्य',
          title: 'छोटी रिपोर्ट। बेहतर मोहल्ले।',
          subtitle: 'कैसे व्यवस्थित रिपोर्टिंग निवासियों और स्थानीय टीमों के बीच रोज़मर्रा का भरोसा बनाती है।',
          bullets: [
            'स्पष्ट संवाद: खोए संदेशों की जगह व्यवस्थित रिपोर्ट और यूनिक ID।',
            'खुली जवाबदेही: निवासी कभी भी हिंदी या अंग्रेज़ी में प्रगति देख सकते हैं।',
            'न्यायसंगत प्राथमिकता: पारदर्शी स्कोर बताता है कि जरूरी काम पहले क्यों है।',
            'साझा स्थानिक समझ: बार-बार प्रभावित गलियाँ तुरंत सामने आती हैं।',
            'मानव-केंद्रित डिज़ाइन: AI केवल सलाह देता है, निर्णय समुदाय लेता है।',
          ],
          calloutTitle: 'प्रोटोटाइप स्मरण',
          calloutBody: 'यह परिचय ब्राउज़र स्टोरेज में उदाहरणात्मक डेमो डेटा का उपयोग करता है।',
          actionType: 'command',
          actionLabel: 'समाप्त करें और वार्ड विश्लेषण देखें',
        },
      ],
    },
  },
};
