import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Compass,
  Cpu,
  Loader2,
  MapPin,
  Mic,
  MicOff,
  ShieldAlert,
  Trash2,
  UploadCloud,
} from 'lucide-react';
import { DEMO_LOCATION_RECORDS, INDIA_STATES_AND_UTS, IndiaLocationRecord } from '../data/indiaLocations';
import { useTranslation } from '../i18n/LanguageContext';
import {
  AIInspectionResult,
  CATEGORY_LABELS,
  CivicIssue,
  ILLUSTRATIVE_WARDS,
  IssueCategory,
  IssueSeverity,
  NavSection,
} from '../types/civic';
import { analyzeCivicIssue } from '../utils/api';
import { findPotentialDuplicates } from '../utils/duplicates';
import { processUploadedImage } from '../utils/imageHelper';
import { calculateSmartPriority } from '../utils/priority';
import {
  isSpeechRecognitionSupported,
  startVoiceRecognition,
  VoiceErrorCode,
  VoiceSessionHandle,
} from '../utils/speechRecognition';
import { LocationPickerMap } from './LocationPickerMap';
import { AnimatedNumber } from './MotionPrimitives';
import { SeverityIndicator, StatusIndicator } from './StatusIndicators';

export interface PrefillReportDraft {
  title?: string;
  category?: IssueCategory;
  severity?: IssueSeverity;
  description?: string;
  landmark?: string;
  wardId?: string;
  photoDataUrl?: string;
  photoMimeType?: string;
  aiAnalysis?: AIInspectionResult;
}

interface ReportIssuePageProps {
  existingIssues: CivicIssue[];
  locations?: IndiaLocationRecord[];
  onSubmitIssue: (newIssueData: {
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
  }) => Promise<CivicIssue> | CivicIssue;
  onNavigate: (section: NavSection) => void;
  onSelectIssue: (issue: CivicIssue) => void;
  onTrackIssue?: (issueId: string) => void;
  prefillDraft?: PrefillReportDraft | null;
  onClearPrefill?: () => void;
}

export function ReportIssuePage({
  existingIssues,
  locations = [],
  onSubmitIssue,
  onNavigate,
  onSelectIssue,
  onTrackIssue,
  prefillDraft,
  onClearPrefill,
}: ReportIssuePageProps) {
  const { language, t, categoryLabel, bandLabel } = useTranslation();
  const defaultWard = ILLUSTRATIVE_WARDS[0];

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<IssueCategory>('road_damage');
  const [severity, setSeverity] = useState<IssueSeverity>('Medium');
  const [stateCode, setStateCode] = useState<string>('KA');
  const [districtName, setDistrictName] = useState<string>('Bengaluru Urban (Demo)');
  const [cityName, setCityName] = useState<string>('Bengaluru City (Demo)');
  const [localityName, setLocalityName] = useState<string>('');
  const [wardId, setWardId] = useState<string>(defaultWard.id);
  const [landmark, setLandmark] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [latitude, setLatitude] = useState<number>(defaultWard.centerLat);
  const [longitude, setLongitude] = useState<number>(defaultWard.centerLng);

  const [photoDataUrl, setPhotoDataUrl] = useState<string | undefined>(undefined);
  const [photoMimeType, setPhotoMimeType] = useState<string>('image/jpeg');
  const [photoName, setPhotoName] = useState<string>('');
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // Voice dictation state
  const voiceSupported = useMemo(() => isSpeechRecognitionSupported(), []);
  const [voiceLang, setVoiceLang] = useState<'en-IN' | 'hi-IN'>(
    language === 'hi' ? 'hi-IN' : 'en-IN'
  );
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [voiceErrorCode, setVoiceErrorCode] = useState<VoiceErrorCode | null>(null);
  const voiceSessionRef = useRef<VoiceSessionHandle | null>(null);

  const [aiResult, setAiResult] = useState<AIInspectionResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [userEditedClassification, setUserEditedClassification] = useState(false);

  const [duplicateAcknowledged, setDuplicateAcknowledged] = useState(false);
  const [duplicatePromptVisible, setDuplicatePromptVisible] = useState(false);

  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const [submittedIssue, setSubmittedIssue] = useState<CivicIssue | null>(null);

  // Sync voice speech language when app UI language changes (unless actively listening)
  useEffect(() => {
    if (!isListening) {
      setVoiceLang(language === 'hi' ? 'hi-IN' : 'en-IN');
    }
  }, [language, isListening]);

  // Clean up speech recognition session on unmount
  useEffect(() => {
    return () => {
      voiceSessionRef.current?.abort();
      voiceSessionRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!prefillDraft) return;
    if (prefillDraft.title) setTitle(prefillDraft.title);
    if (prefillDraft.category) setCategory(prefillDraft.category);
    if (prefillDraft.severity) setSeverity(prefillDraft.severity);
    if (prefillDraft.description) setDescription(prefillDraft.description);
    if (prefillDraft.landmark) setLandmark(prefillDraft.landmark);
    if (prefillDraft.wardId) {
      const ward = ILLUSTRATIVE_WARDS.find((w) => w.id === prefillDraft.wardId);
      if (ward) {
        setWardId(ward.id);
        setLatitude(ward.centerLat);
        setLongitude(ward.centerLng);
      }
    }
    if (prefillDraft.photoDataUrl) {
      setPhotoDataUrl(prefillDraft.photoDataUrl);
      setPhotoMimeType(prefillDraft.photoMimeType || 'image/jpeg');
      setPhotoName('Neighbourhood Insights');
    }
    if (prefillDraft.aiAnalysis) {
      setAiResult(prefillDraft.aiAnalysis);
    }
    onClearPrefill?.();
  }, [prefillDraft, onClearPrefill]);

  const samplePrompts = useMemo(
    () =>
      language === 'hi'
        ? [
            {
              label: t.report.samples.schoolRoad,
              title: 'ओकवुड स्कूल क्रॉसवॉक के बाहर सड़क पर गहरा गड्ढा',
              category: 'road_damage' as IssueCategory,
              wardId: 'ward-1',
              landmark: 'ओकवुड स्कूल क्रॉसवॉक',
              description:
                'मुख्य सड़क पर स्कूल क्रॉसवॉक के पास पानी से भरा गहरा गड्ढा है। सुबह स्कूल बसों और साइकिल चालकों को काफी परेशानी और दुर्घटना का खतरा है।',
            },
            {
              label: t.report.samples.clinicCorner,
              title: 'रिवरसाइड इवनिंग क्लिनिक के पास स्ट्रीटलाइट बंद',
              category: 'streetlight' as IssueCategory,
              wardId: 'ward-3',
              landmark: 'रिवरसाइड क्लिनिक गेट',
              description:
                'शाम के क्लिनिक के बाहर दो स्ट्रीटलाइट पूरी तरह बंद हैं, जिससे बुजुर्गों और पैदल चलने वालों को रात में अंधेरे में खतरा रहता है।',
            },
            {
              label: t.report.samples.blockedDrain,
              title: 'फाउंड्री रोड के पास खुला और जाम बरसाती नाला',
              category: 'drainage' as IssueCategory,
              wardId: 'ward-5',
              landmark: 'फाउंड्री रोड जंक्शन #4',
              description:
                '2 दिनों से नाले का ढक्कन हटा हुआ है और गंदा पानी पैदल रास्ते व सड़क पर जमा हो रहा है।',
            },
          ]
        : [
            {
              label: t.report.samples.schoolRoad,
              title: 'Deep crater pothole outside Oakwood Elementary',
              category: 'road_damage' as IssueCategory,
              wardId: 'ward-1',
              landmark: 'Oakwood Elementary Crosswalk',
              description:
                'Large water-filled pothole right next to the school crosswalk on the main road. Morning buses and cyclists are forced onto the shoulder.',
            },
            {
              label: t.report.samples.clinicCorner,
              title: 'Dark streetlamps near Riverside Evening Clinic',
              category: 'streetlight' as IssueCategory,
              wardId: 'ward-3',
              landmark: 'Riverside Health Clinic Gate',
              description:
                'Two street lamps outside the evening clinic are completely dark, creating poor visibility for elderly pedestrians and wheelchair users.',
            },
            {
              label: t.report.samples.blockedDrain,
              title: 'Open storm drain & standing sewage near Foundry Rd',
              category: 'drainage' as IssueCategory,
              wardId: 'ward-5',
              landmark: 'Foundry Road Junction #4',
              description:
                'Drainage grate displaced and storm channel blocked for 2 days, causing standing water across the pedestrian shoulder and bike lane.',
            },
          ],
    [language, t.report.samples]
  );

  const activeLocationRecords = useMemo(
    () => (locations.length > 0 ? locations : DEMO_LOCATION_RECORDS),
    [locations]
  );

  const cloudWardsForState = useMemo(
    () => activeLocationRecords.filter((l) => l.level === 'ward' && (!stateCode || l.stateCode === stateCode)),
    [activeLocationRecords, stateCode]
  );

  const availableWards = useMemo(() => {
    if (locations.length > 0 && cloudWardsForState.length > 0) {
      return cloudWardsForState.map((w) => ({
        id: w.id,
        name: w.name,
        shortName: w.name,
        centerLat: w.latitude ?? 20.5937,
        centerLng: w.longitude ?? 78.9629,
      }));
    }
    return ILLUSTRATIVE_WARDS;
  }, [locations.length, cloudWardsForState]);

  const selectedWard = useMemo(
    () => availableWards.find((w) => w.id === wardId) ?? availableWards[0],
    [availableWards, wardId]
  );

  const potentialDuplicates = useMemo(
    () =>
      findPotentialDuplicates(
        {
          title,
          category,
          wardId,
          landmark,
          description,
          latitude,
          longitude,
        },
        existingIssues
      ),
    [title, category, wardId, landmark, description, latitude, longitude, existingIssues]
  );

  useEffect(() => {
    setDuplicateAcknowledged(false);
    setDuplicatePromptVisible(false);
  }, [title, category, wardId, landmark]);

  const livePriorityPreview = useMemo(() => {
    return calculateSmartPriority({
      title,
      category,
      severity,
      status: 'Reported',
      description,
      landmark,
      createdAt: new Date().toISOString(),
    });
  }, [title, category, severity, description, landmark]);

  const handleToggleVoice = () => {
    if (isListening) {
      voiceSessionRef.current?.stop();
      setIsListening(false);
      setInterimTranscript('');
      return;
    }

    if (!voiceSupported) {
      setVoiceErrorCode('unsupported');
      return;
    }

    setVoiceErrorCode(null);
    setInterimTranscript('');

    const session = startVoiceRecognition({
      lang: voiceLang,
      onStart: () => {
        setIsListening(true);
      },
      onInterim: (text) => {
        setInterimTranscript(text);
      },
      onFinal: (finalText) => {
        setDescription((prev) => {
          const trimmed = prev.trimEnd();
          if (!trimmed) return finalText;
          const needsSpace = !/[\s\n]$/.test(prev);
          return `${trimmed}${needsSpace ? ' ' : ''}${finalText}`;
        });
        setAiResult(null);
      },
      onError: (code) => {
        setVoiceErrorCode(code);
        setIsListening(false);
        setInterimTranscript('');
      },
      onEnd: () => {
        setIsListening(false);
        setInterimTranscript('');
        voiceSessionRef.current = null;
      },
    });

    voiceSessionRef.current = session;
  };

  const voiceErrorMessage = useMemo(() => {
    if (!voiceSupported) return t.report.voiceUnsupported;
    switch (voiceErrorCode) {
      case 'unsupported':
        return t.report.voiceUnsupported;
      case 'permission-denied':
        return t.report.voiceDenied;
      case 'no-microphone':
        return t.report.voiceNoMic;
      case 'no-speech':
        return t.report.voiceNoSpeech;
      case 'network':
        return t.report.voiceNetworkErr;
      case 'unknown':
        return t.report.voiceNetworkErr;
      default:
        return null;
    }
  }, [voiceSupported, voiceErrorCode, t.report]);

  const handleWardChange = (nextWardId: string) => {
    setWardId(nextWardId);
    const ward = ILLUSTRATIVE_WARDS.find((w) => w.id === nextWardId);
    if (ward) {
      const jitterLat = Number((ward.centerLat + (Math.random() - 0.5) * 0.004).toFixed(5));
      const jitterLng = Number((ward.centerLng + (Math.random() - 0.5) * 0.004).toFixed(5));
      setLatitude(jitterLat);
      setLongitude(jitterLng);
    }
  };

  const handlePhotoFile = async (file: File) => {
    setPhotoError(null);
    try {
      const processed = await processUploadedImage(file);
      setPhotoDataUrl(processed.dataUrl);
      setPhotoMimeType(processed.mimeType);
      setPhotoName(processed.originalName);
      setAiResult(null);
    } catch (err) {
      setPhotoError(err instanceof Error ? err.message : 'Unable to process image.');
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await handlePhotoFile(file);
  };

  const handleDropPhoto = async (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    await handlePhotoFile(file);
  };

  const handleRunAiAnalysis = async () => {
    if (!title.trim() && !description.trim() && !photoDataUrl) {
      setAiError(t.report.validationAiNeedInput);
      return;
    }

    setAiLoading(true);
    setAiError(null);
    try {
      const result = await analyzeCivicIssue({
        title: title.trim(),
        description: description.trim(),
        area: `${selectedWard.name}${landmark ? ` - ${landmark}` : ''}`,
        selectedCategory: category,
        imageBase64: photoDataUrl,
        imageMimeType: photoMimeType,
      });
      setAiResult(result);
      setCategory(result.category);
      setSeverity(result.severity);
      setUserEditedClassification(false);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : t.report.aiUnavailableSub);
    } finally {
      setAiLoading(false);
    }
  };

  const validateStep1 = (): boolean => {
    const errors: string[] = [];
    if (title.trim().length < 4) {
      errors.push(t.report.validationTitleMin);
    }
    if (description.trim().length < 12) {
      errors.push(t.report.validationDescMin);
    }
    if (errors.length > 0) {
      setFormErrors(errors);
      return false;
    }
    setFormErrors([]);
    return true;
  };

  const validateStep2 = (): boolean => {
    const errors: string[] = [];
    if (landmark.trim().length < 3) {
      errors.push(t.report.validationLandmarkMin);
    }
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      errors.push(t.report.validationCoords);
    }
    if (errors.length > 0) {
      setFormErrors(errors);
      return false;
    }
    setFormErrors([]);
    return true;
  };

  const handleNextStep = () => {
    if (isListening) {
      voiceSessionRef.current?.stop();
      setIsListening(false);
    }
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const executeSubmission = async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    if (isListening) {
      voiceSessionRef.current?.stop();
      setIsListening(false);
    }
    setFormErrors([]);
    setDuplicatePromptVisible(false);
    setSubmitting(true);

    try {
      let finalAiResult = aiResult;
      let finalCategory = category;
      let finalSeverity = severity;
      let aiFallbackUsed = false;

      if (!finalAiResult) {
        try {
          finalAiResult = await analyzeCivicIssue({
            title: title.trim(),
            description: description.trim(),
            area: `${selectedWard.name}${landmark ? ` - ${landmark}` : ''}`,
            selectedCategory: category,
            imageBase64: photoDataUrl,
            imageMimeType: photoMimeType,
          });
          setAiResult(finalAiResult);
          if (!userEditedClassification) {
            finalCategory = finalAiResult.category;
            finalSeverity = finalAiResult.severity;
          }
        } catch {
          aiFallbackUsed = true;
        }
      }

      const editedFromAi = Boolean(
        finalAiResult &&
          (finalAiResult.category !== finalCategory || finalAiResult.severity !== finalSeverity)
      );

      const created = await onSubmitIssue({
        title: title.trim(),
        category: finalCategory,
        severity: finalSeverity,
        locationId: selectedWard.id,
        stateCode,
        districtName: districtName.trim() || undefined,
        cityName: cityName.trim() || undefined,
        wardId: selectedWard.id,
        wardName: selectedWard.name,
        localityName: localityName.trim() || landmark.trim(),
        landmark: landmark.trim(),
        description: description.trim(),
        latitude,
        longitude,
        photoDataUrl,
        aiAnalysis: finalAiResult ?? undefined,
        aiSuggestionEdited: editedFromAi,
        aiUnavailableFallback: aiFallbackUsed,
      });

      setSubmittedIssue(created);
    } catch (err) {
      setFormErrors([
        err instanceof Error
          ? err.message
          : 'Could not save your report. Please check your connection or sign-in status and try again.',
      ]);
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current || submitting) return;

    const errors: string[] = [];
    if (title.trim().length < 4) {
      errors.push(t.report.validationTitleMin);
    }
    if (description.trim().length < 12) {
      errors.push(t.report.validationDescMin);
    }
    if (landmark.trim().length < 3) {
      errors.push(t.report.validationLandmarkMin);
    }
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      errors.push(t.report.validationCoords);
    }

    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    if (potentialDuplicates.length > 0 && !duplicateAcknowledged) {
      setDuplicatePromptVisible(true);
      return;
    }

    await executeSubmission();
  };

  const handleResetForm = () => {
    setSubmittedIssue(null);
    setStep(1);
    setTitle('');
    setLandmark('');
    setDescription('');
    setPhotoDataUrl(undefined);
    setPhotoName('');
    setAiResult(null);
    setAiError(null);
    setUserEditedClassification(false);
    setDuplicateAcknowledged(false);
    setDuplicatePromptVisible(false);
    setFormErrors([]);
  };

  if (submittedIssue) {
    const priority = calculateSmartPriority({
      title: submittedIssue.title,
      category: submittedIssue.category,
      severity: submittedIssue.severity,
      status: submittedIssue.status,
      description: submittedIssue.description,
      landmark: submittedIssue.landmark,
      createdAt: submittedIssue.createdAt,
    });

    return (
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-2xl mx-auto citizen-card rounded-2xl border-emerald-300 overflow-hidden"
        role="region"
        aria-live="polite"
      >
        <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-sky-500 to-blue-700" aria-hidden="true" />
        <div className="p-5 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 420, damping: 22 }}
                className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 shrink-0"
              >
                <CheckCircle2 className="w-7 h-7" aria-hidden="true" />
              </motion.div>
              <div className="space-y-1">
                <p className="text-xs font-mono font-bold text-emerald-700">
                  {t.report.successBadge}
                </p>
                <h2 className="text-xl font-display font-bold text-[#0B1B36]">
                  {t.report.successHeading}
                </h2>
                <p className="text-sm font-medium text-slate-700">{submittedIssue.title}</p>
              </div>
            </div>

            <div className="px-3.5 py-2.5 rounded-xl bg-sky-50 border border-sky-200 text-left sm:text-right shrink-0">
              <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                {t.report.complaintIdLabel}
              </p>
              <p className="text-base font-mono font-bold text-blue-700">{submittedIssue.id}</p>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">{t.report.successSubtitle}</p>

          {submittedIssue.aiUnavailableFallback ? (
            <div
              className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5"
              role="status"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" aria-hidden="true" />
              <span>{t.report.successAiFallback}</span>
            </div>
          ) : null}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <p className="text-slate-500">{t.report.categoryLabel}</p>
              <p className="mt-1 font-semibold text-[#0B1B36]">
                {categoryLabel(submittedIssue.category)}
              </p>
            </div>
            <div>
              <p className="text-slate-500">{t.report.wardAndSeverity}</p>
              <div className="mt-1 flex items-center gap-2 flex-wrap">
                <span className="text-slate-800 font-medium">
                  {submittedIssue.wardName.replace(' (Demo)', '')}
                </span>
                <SeverityIndicator severity={submittedIssue.severity} />
              </div>
            </div>
            <div>
              <p className="text-slate-500">{t.report.smartPriorityScore}</p>
              <p className="mt-1 font-mono font-bold tabular-nums text-blue-700">
                <AnimatedNumber value={priority.totalScore} /> / 100 ({bandLabel(priority.band)})
              </p>
            </div>
          </div>

          {submittedIssue.aiAnalysis ? (
            <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 space-y-2 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-purple-800">{t.report.aiTriageHeading}</span>
                <span className="text-[11px] font-medium text-purple-700">{t.common.notVerifiedFact}</span>
              </div>
              <p className="text-slate-700">{submittedIssue.aiAnalysis.explanation}</p>
              <p className="text-slate-700">
                <strong className="text-[#0B1B36]">{t.report.possibleImpact}:</strong>{' '}
                {submittedIssue.aiAnalysis.publicImpact}
              </p>
              <p className="text-purple-900">
                <strong className="text-purple-950">{t.report.suggestedAction}:</strong>{' '}
                {submittedIssue.aiAnalysis.recommendedAction}
              </p>
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() =>
                onTrackIssue ? onTrackIssue(submittedIssue.id) : onSelectIssue(submittedIssue)
              }
              className="btn-press inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#1D4ED8] to-[#0284C7] text-white hover:brightness-110 shadow-[0_8px_20px_-8px_rgba(29,78,216,0.5)] min-h-[44px] whitespace-nowrap shrink-0"
            >
              <Compass className="w-4 h-4" aria-hidden="true" />
              <span>{t.report.trackTimelineBtn}</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('map')}
              className="btn-press inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-sky-50 text-[#0B1B36] border border-sky-200 hover:bg-sky-100 transition-colors min-h-[44px] whitespace-nowrap shrink-0"
            >
              <MapPin className="w-4 h-4 text-blue-700" aria-hidden="true" />
              <span>{t.report.viewLiveMapBtn}</span>
            </button>
            <button
              type="button"
              onClick={handleResetForm}
              className="btn-press px-4 py-2.5 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-950 transition-colors min-h-[44px] whitespace-nowrap shrink-0"
            >
              {t.report.submitAnotherBtn}
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  const currentStepMeta = t.report.steps[step - 1];

  return (
    <div className="space-y-6">
      {/* Stepper Header */}
      <div className="citizen-card rounded-2xl p-4 sm:p-5 space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-mono font-bold text-blue-700">
            {t.report.stepLabel} 0{step} {t.report.of} 03
          </span>
          <span className="text-slate-600 font-medium">
            {currentStepMeta.title} — {currentStepMeta.subtitle}
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
          <motion.div
            animate={{ width: `${(step / 3) * 100}%` }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="h-full rounded-full bg-gradient-to-r from-[#1D4ED8] via-[#0284C7] to-[#16A34A]"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {([1, 2, 3] as const).map((num) => {
            const meta = t.report.steps[num - 1];
            const active = step === num;
            const completed = step > num;
            return (
              <button
                key={num}
                type="button"
                onClick={() => {
                  if (num <= step) {
                    setFormErrors([]);
                    setStep(num);
                    return;
                  }
                  if (num === 2 && validateStep1()) {
                    setStep(2);
                  } else if (num === 3 && validateStep1() && validateStep2()) {
                    setStep(3);
                  }
                }}
                className={`btn-press flex items-center gap-3 p-3 rounded-xl border text-left transition-all min-h-[52px] ${
                  active
                    ? 'bg-sky-50 border-blue-500 shadow-xs'
                    : completed
                      ? 'bg-emerald-50 border-emerald-200 hover:border-emerald-300'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <span
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-mono font-bold shrink-0 ${
                    active
                      ? 'bg-blue-700 text-white'
                      : completed
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {completed ? <Check className="w-4 h-4" aria-hidden="true" /> : `0${num}`}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-display font-bold text-[#0B1B36] truncate">
                    {meta.title}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">{meta.subtitle}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left: Step-Based Citizen Report Form */}
        <form
          onSubmit={handleSubmit}
          className="xl:col-span-7 citizen-card rounded-2xl p-4 sm:p-6 space-y-5"
          noValidate
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            >
              {step === 1 ? (
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
                    <div>
                      <h2 className="text-base sm:text-lg font-display font-bold text-[#0B1B36]">
                        {t.report.step1Heading}
                      </h2>
                      <p className="text-xs text-slate-600">{t.report.step1Sub}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {samplePrompts.map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => {
                            setTitle(preset.title);
                            setCategory(preset.category);
                            handleWardChange(preset.wardId);
                            setLandmark(preset.landmark);
                            setDescription(preset.description);
                            setAiError(null);
                            setAiResult(null);
                            setFormErrors([]);
                          }}
                          className="px-2.5 py-1.5 text-[11px] font-medium rounded-lg bg-slate-50 border border-slate-200 text-slate-700 hover:text-blue-700 hover:border-blue-300 transition-colors whitespace-nowrap shrink-0 min-h-[34px]"
                        >
                          {t.report.samplePrefix} {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="report-title"
                      className="block text-xs font-semibold text-[#0B1B36] mb-1.5"
                    >
                      {t.report.titleLabel} <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="report-title"
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder={t.report.titlePlaceholder}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 min-h-[44px]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="report-category"
                        className="block text-xs font-semibold text-[#0B1B36] mb-1.5"
                      >
                        {t.report.categoryLabel}
                      </label>
                      <select
                        id="report-category"
                        value={category}
                        onChange={(e) => {
                          setCategory(e.target.value as IssueCategory);
                          setUserEditedClassification(true);
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-blue-600 min-h-[44px]"
                      >
                        {(Object.keys(CATEGORY_LABELS) as IssueCategory[]).map((cat) => (
                          <option key={cat} value={cat}>
                            {categoryLabel(cat)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="report-severity"
                        className="block text-xs font-semibold text-[#0B1B36] mb-1.5"
                      >
                        {t.report.severityLabel}
                      </label>
                      <select
                        id="report-severity"
                        value={severity}
                        onChange={(e) => {
                          setSeverity(e.target.value as IssueSeverity);
                          setUserEditedClassification(true);
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-blue-600 min-h-[44px]"
                      >
                        <option value="Low">{t.report.severityOptions.Low}</option>
                        <option value="Medium">{t.report.severityOptions.Medium}</option>
                        <option value="High">{t.report.severityOptions.High}</option>
                        <option value="Critical">{t.report.severityOptions.Critical}</option>
                      </select>
                    </div>
                  </div>

                  {/* Description + Voice Dictation Controls */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label
                        htmlFor="report-description"
                        className="block text-xs font-semibold text-[#0B1B36]"
                      >
                        {t.report.descriptionLabel} <span className="text-red-600">*</span>
                      </label>

                      <div className="flex flex-wrap items-center gap-1.5">
                        {voiceSupported ? (
                          <div
                            className="inline-flex items-center p-0.5 rounded-lg bg-slate-100 border border-slate-200 text-[11px]"
                            role="group"
                            aria-label="Speech recognition language"
                          >
                            <button
                              type="button"
                              disabled={isListening}
                              onClick={() => setVoiceLang('en-IN')}
                              aria-pressed={voiceLang === 'en-IN'}
                              className={`px-2 py-1 rounded-md transition-colors min-h-[32px] ${
                                voiceLang === 'en-IN'
                                  ? 'bg-white text-blue-700 font-semibold shadow-xs'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              {t.report.voiceLangEn}
                            </button>
                            <button
                              type="button"
                              disabled={isListening}
                              onClick={() => setVoiceLang('hi-IN')}
                              aria-pressed={voiceLang === 'hi-IN'}
                              className={`px-2 py-1 rounded-md transition-colors min-h-[32px] ${
                                voiceLang === 'hi-IN'
                                  ? 'bg-white text-blue-700 font-semibold shadow-xs'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              {t.report.voiceLangHi}
                            </button>
                          </div>
                        ) : null}

                        <button
                          type="button"
                          onClick={handleToggleVoice}
                          aria-pressed={isListening}
                          aria-label={isListening ? t.report.voiceStop : t.report.voiceDictate}
                          className={`btn-press inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all min-h-[38px] whitespace-nowrap shrink-0 ${
                            isListening
                              ? 'bg-red-50 border-red-300 text-red-700'
                              : voiceSupported
                                ? 'bg-sky-50 border-sky-200 text-blue-700 hover:bg-sky-100'
                                : 'bg-slate-100 border-slate-200 text-slate-500'
                          }`}
                        >
                          {isListening ? (
                            <MicOff className="w-3.5 h-3.5 animate-pulse text-red-600" aria-hidden="true" />
                          ) : (
                            <Mic className="w-3.5 h-3.5" aria-hidden="true" />
                          )}
                          <span>
                            {isListening ? t.report.voiceStop : t.report.voiceDictate}
                          </span>
                        </button>
                      </div>
                    </div>

                    <div aria-live="polite">
                      {isListening ? (
                        <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 flex items-start gap-2.5 mb-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping mt-1 shrink-0"
                            aria-hidden="true"
                          />
                          <div className="min-w-0 space-y-0.5">
                            <p className="font-semibold text-red-700">{t.report.voiceListening}</p>
                            {interimTranscript ? (
                              <p className="text-slate-700 italic truncate">{interimTranscript}</p>
                            ) : null}
                          </div>
                        </div>
                      ) : null}

                      {voiceErrorMessage ? (
                        <div
                          className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2 mb-2"
                          role="status"
                        >
                          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" aria-hidden="true" />
                          <span>{voiceErrorMessage}</span>
                        </div>
                      ) : null}
                    </div>

                    <textarea
                      id="report-description"
                      rows={4}
                      required
                      value={description}
                      onChange={(e) => {
                        setDescription(e.target.value);
                        setAiResult(null);
                      }}
                      placeholder={t.report.descriptionPlaceholder}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600"
                    />
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                      <span>{t.report.descriptionHint}</span>
                      <span className="font-mono tabular-nums">
                        {description.trim().length} {t.report.charsUnit}
                      </span>
                    </div>
                  </div>

                  {/* Optional Image Upload */}
                  <div className="space-y-2">
                    <span className="block text-xs font-semibold text-[#0B1B36]">
                      {t.report.photoLabel}
                    </span>
                    {photoDataUrl ? (
                      <div className="flex items-center justify-between gap-4 p-3.5 rounded-xl bg-sky-50 border border-sky-200">
                        <div className="flex items-center gap-3.5 min-w-0">
                          <img
                            src={photoDataUrl}
                            alt="Uploaded complaint preview"
                            className="w-18 h-18 rounded-lg object-cover border border-slate-300 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-[#0B1B36] truncate">
                              {photoName || 'Uploaded image'}
                            </p>
                            <p className="text-[11px] text-blue-700 mt-0.5">
                              {t.report.photoReady}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setPhotoDataUrl(undefined);
                            setPhotoName('');
                            setAiResult(null);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs text-red-700 hover:text-red-800 bg-red-50 border border-red-200 rounded-lg min-h-[40px] whitespace-nowrap shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>{t.report.removePhoto}</span>
                        </button>
                      </div>
                    ) : (
                      <label
                        htmlFor="report-photo-input"
                        onDragOver={(e) => {
                          e.preventDefault();
                          setDragOver(true);
                        }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDropPhoto}
                        className={`flex flex-col items-center justify-center gap-2 p-5 sm:p-6 rounded-xl border-2 border-dashed cursor-pointer transition-all text-center ${
                          dragOver
                            ? 'border-blue-500 bg-sky-50'
                            : 'border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-sky-50/50'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-xl bg-sky-100 border border-sky-200 flex items-center justify-center text-blue-700">
                          <UploadCloud className="w-5 h-5" aria-hidden="true" />
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-xs font-medium text-slate-700">
                            {t.report.dropPhotoPrefix}{' '}
                            <span className="text-blue-700 font-semibold underline">
                              {t.report.browseDevice}
                            </span>
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {t.report.photoFormatsHint}
                          </p>
                        </div>
                        <input
                          id="report-photo-input"
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
                </div>
              ) : null}

              {step === 2 ? (
                <div className="space-y-5">
                  <div className="pb-4 border-b border-slate-200">
                    <h2 className="text-base sm:text-lg font-display font-bold text-[#0B1B36]">
                      {t.report.step2Heading}
                    </h2>
                    <p className="text-xs text-slate-600">{t.report.step2Sub}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50/80 border border-slate-200">
                    <div>
                      <label htmlFor="report-state" className="block text-[11px] font-semibold text-slate-700 mb-1">
                        {language === 'hi' ? 'राज्य / केंद्र शासित प्रदेश' : 'State / UT'}
                      </label>
                      <select
                        id="report-state"
                        value={stateCode}
                        onChange={(e) => setStateCode(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600 min-h-[40px]"
                      >
                        {INDIA_STATES_AND_UTS.map((st) => (
                          <option key={st.code} value={st.code}>{st.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="report-district" className="block text-[11px] font-semibold text-slate-700 mb-1">
                        {language === 'hi' ? 'जिला' : 'District'}
                      </label>
                      <input
                        id="report-district"
                        type="text"
                        value={districtName}
                        onChange={(e) => setDistrictName(e.target.value)}
                        placeholder={language === 'hi' ? 'जिला दर्ज करें' : 'District name'}
                        className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600 min-h-[40px]"
                      />
                    </div>
                    <div>
                      <label htmlFor="report-city" className="block text-[11px] font-semibold text-slate-700 mb-1">
                        {language === 'hi' ? 'शहर / नगर पालिका' : 'City / Municipality'}
                      </label>
                      <input
                        id="report-city"
                        type="text"
                        value={cityName}
                        onChange={(e) => setCityName(e.target.value)}
                        placeholder={language === 'hi' ? 'शहर या नगर निकाय' : 'City / Municipality'}
                        className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600 min-h-[40px]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="report-ward"
                        className="block text-xs font-semibold text-[#0B1B36] mb-1.5"
                      >
                        {t.report.wardLabel}
                      </label>
                      <select
                        id="report-ward"
                        value={selectedWard.id}
                        onChange={(e) => {
                          const next = availableWards.find((w) => w.id === e.target.value);
                          setWardId(e.target.value);
                          if (next) {
                            setLatitude(next.centerLat);
                            setLongitude(next.centerLng);
                          }
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-blue-600 min-h-[44px]"
                      >
                        {availableWards.map((ward) => (
                          <option key={ward.id} value={ward.id}>
                            {ward.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="report-landmark"
                        className="block text-xs font-semibold text-[#0B1B36] mb-1.5"
                      >
                        {t.report.landmarkLabel} <span className="text-red-600">*</span>
                      </label>
                      <input
                        id="report-landmark"
                        type="text"
                        required
                        value={landmark}
                        onChange={(e) => setLandmark(e.target.value)}
                        placeholder={t.report.landmarkPlaceholder}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 min-h-[44px]"
                      />
                    </div>
                  </div>

                  <LocationPickerMap
                    latitude={latitude}
                    longitude={longitude}
                    onChange={(lat, lng) => {
                      setLatitude(lat);
                      setLongitude(lng);
                    }}
                    wardCenterLat={selectedWard.centerLat}
                    wardCenterLng={selectedWard.centerLng}
                  />
                </div>
              ) : null}

              {step === 3 ? (
                <div className="space-y-5">
                  <div className="pb-4 border-b border-slate-200">
                    <h2 className="text-base sm:text-lg font-display font-bold text-[#0B1B36]">
                      {t.report.step3Heading}
                    </h2>
                    <p className="text-xs text-slate-600">{t.report.step3Sub}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                    <div>
                      <span className="text-slate-500">{t.report.reviewTitle}</span>
                      <p className="mt-0.5 text-sm font-bold text-[#0B1B36]">
                        {title || '—'}
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <span className="text-slate-500">{t.report.reviewWard}</span>
                        <p className="mt-0.5 font-semibold text-slate-800">{selectedWard.name}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">{t.report.reviewLocality}</span>
                        <p className="mt-0.5 font-medium text-slate-800">
                          {landmark || '—'} ·{' '}
                          <span className="font-mono text-blue-700">
                            {latitude.toFixed(4)}, {longitude.toFixed(4)}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-500">{t.report.reviewDesc}</span>
                      <p className="mt-0.5 text-slate-700 leading-relaxed">
                        {description || '—'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="review-category"
                        className="block text-xs font-semibold text-[#0B1B36] mb-1.5"
                      >
                        {t.report.reviewCatEditable}
                      </label>
                      <select
                        id="review-category"
                        value={category}
                        onChange={(e) => {
                          setCategory(e.target.value as IssueCategory);
                          setUserEditedClassification(true);
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-blue-600 min-h-[44px]"
                      >
                        {(Object.keys(CATEGORY_LABELS) as IssueCategory[]).map((cat) => (
                          <option key={cat} value={cat}>
                            {categoryLabel(cat)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="review-severity"
                        className="block text-xs font-semibold text-[#0B1B36] mb-1.5"
                      >
                        {t.report.reviewSevEditable}
                      </label>
                      <select
                        id="review-severity"
                        value={severity}
                        onChange={(e) => {
                          setSeverity(e.target.value as IssueSeverity);
                          setUserEditedClassification(true);
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-blue-600 min-h-[44px]"
                      >
                        <option value="Low">{t.report.severityOptions.Low}</option>
                        <option value="Medium">{t.report.severityOptions.Medium}</option>
                        <option value="High">{t.report.severityOptions.High}</option>
                        <option value="Critical">{t.report.severityOptions.Critical}</option>
                      </select>
                    </div>
                  </div>

                  {/* Purple strictly on AI preview callout */}
                  <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-purple-900">
                        {t.report.previewAiTitle}
                      </p>
                      <p className="text-[11px] text-purple-700">{t.report.previewAiSub}</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRunAiAnalysis}
                      disabled={aiLoading}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-purple-700 text-white hover:bg-purple-800 disabled:opacity-60 transition-colors min-h-[42px] whitespace-nowrap shrink-0"
                    >
                      {aiLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                      ) : (
                        <Cpu className="w-4 h-4" aria-hidden="true" />
                      )}
                      <span>{aiLoading ? t.report.analyzing : t.report.analyzeNow}</span>
                    </button>
                  </div>
                </div>
              ) : null}
            </motion.div>
          </AnimatePresence>

          {potentialDuplicates.length > 0 ? (
            <div
              className={`p-4 rounded-xl border space-y-3 text-xs ${
                duplicatePromptVisible
                  ? 'bg-amber-50 border-amber-400'
                  : 'bg-amber-50/75 border-amber-200'
              }`}
              role="status"
            >
              <div className="flex items-start gap-2.5">
                <AlertCircle
                  className="w-4 h-4 shrink-0 mt-0.5 text-amber-600"
                  aria-hidden="true"
                />
                <div className="space-y-0.5">
                  <p className="font-semibold text-amber-900">
                    {t.report.duplicateTitle} ({potentialDuplicates.length})
                  </p>
                  <p className="text-amber-800">{t.report.duplicateSub}</p>
                </div>
              </div>

              <div className="space-y-2">
                {potentialDuplicates.map((match) => (
                  <div
                    key={match.issue.id}
                    className="p-3 rounded-lg bg-white border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-bold text-blue-700">
                          {match.issue.id}
                        </span>
                        <StatusIndicator status={match.issue.status} />
                        <span className="text-[11px] text-slate-500">
                          {match.distanceMeters} {t.report.awaySuffix}
                        </span>
                      </div>
                      <p className="font-medium text-[#0B1B36] truncate">{match.issue.title}</p>
                      <p className="text-[11px] text-amber-800">
                        {t.report.matchSignals} {match.reasons.join(' · ')}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onSelectIssue(match.issue)}
                      className="px-3 py-1.5 rounded-lg bg-sky-50 border border-sky-200 text-blue-700 hover:bg-sky-100 font-semibold min-h-[38px] whitespace-nowrap shrink-0"
                    >
                      {t.report.inspectId} {match.issue.id}
                    </button>
                  </div>
                ))}
              </div>

              {duplicatePromptVisible ? (
                <div className="pt-2 border-t border-amber-200 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-amber-900 font-medium">{t.report.confirmSeparate}</span>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => {
                      setDuplicateAcknowledged(true);
                      void executeSubmission();
                    }}
                    className="px-3.5 py-2 rounded-lg bg-amber-500 text-white font-semibold hover:bg-amber-600 transition-colors min-h-[40px] whitespace-nowrap shrink-0"
                  >
                    {t.report.continueSubmitAnyway}
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}

          {formErrors.length > 0 ? (
            <div
              className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 space-y-1"
              role="alert"
            >
              {formErrors.map((err, i) => (
                <p key={i}>• {err}</p>
              ))}
            </div>
          ) : null}

          {/* Step Footer Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200">
            <div className="flex items-center gap-2">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => {
                    setFormErrors([]);
                    setStep((s) => (s === 3 ? 2 : 1));
                  }}
                  className="btn-press inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 border border-slate-300 text-slate-700 hover:border-slate-400 transition-colors min-h-[44px] whitespace-nowrap shrink-0"
                >
                  <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{t.common.back}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleRunAiAnalysis}
                  disabled={aiLoading}
                  className="btn-press inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100 disabled:opacity-60 transition-colors min-h-[44px] whitespace-nowrap shrink-0"
                >
                  {aiLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                  ) : (
                    <Cpu className="w-3.5 h-3.5" aria-hidden="true" />
                  )}
                  <span>{aiLoading ? t.report.analyzing : t.report.quickAiAnalyze}</span>
                </button>
              )}
            </div>

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="btn-press inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#1D4ED8] to-[#0284C7] text-white hover:brightness-110 min-h-[44px] whitespace-nowrap shrink-0"
              >
                <span>
                  {t.report.continueToStep} {step + 1}
                </span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitting}
                className="btn-press inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#1D4ED8] to-[#0284C7] text-white hover:brightness-110 disabled:opacity-60 shadow-[0_8px_22px_-8px_rgba(29,78,216,0.5)] min-h-[44px] whitespace-nowrap shrink-0"
              >
                {submitting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                ) : null}
                <span>
                  {submitting ? t.report.submittingComplaint : t.report.submitComplaint}
                </span>
              </button>
            )}
          </div>
        </form>

        {/* Right Column: AI Understand the Issue (Purple ONLY for AI Insights) + Priority Preview */}
        <aside className="xl:col-span-5 space-y-6">
          <div className="citizen-card rounded-2xl p-5 sm:p-6 space-y-4 border-purple-200">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700">
                  <Cpu className="w-4 h-4" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-sm font-display font-bold text-[#0B1B36]">
                    {t.report.aiSidebarTitle}
                  </h3>
                  <p className="text-[11px] text-slate-500">{t.report.aiSidebarSub}</p>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-purple-700">
                {t.report.aiSuggestionOnly}
              </span>
            </div>

            {aiLoading ? (
              <div
                className="p-4 rounded-xl bg-purple-50 border border-purple-200 space-y-3"
                aria-busy="true"
              >
                <div className="flex items-center gap-2 text-xs text-purple-800">
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  <span>{t.report.aiLoadingText}</span>
                </div>
                <div className="h-3 w-3/4 rounded bg-purple-200/70 animate-pulse" />
                <div className="h-3 w-full rounded bg-purple-200/70 animate-pulse" />
                <div className="h-3 w-2/3 rounded bg-purple-200/70 animate-pulse" />
              </div>
            ) : null}

            {aiError ? (
              <div
                className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5"
                role="alert"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" aria-hidden="true" />
                <div className="space-y-1">
                  <p className="font-semibold">{t.report.aiUnavailableTitle}</p>
                  <p className="text-amber-800">{aiError}</p>
                </div>
              </div>
            ) : null}

            {!aiLoading && aiResult ? (
              <div className="space-y-3.5 p-4 rounded-xl bg-purple-50/70 border border-purple-200">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-slate-500">{t.report.suggestedCategory}</p>
                    <p className="mt-1 font-bold text-[#0B1B36]">
                      {categoryLabel(aiResult.category)}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">{t.report.suggestedSeverity}</p>
                    <div className="mt-1">
                      <SeverityIndicator severity={aiResult.severity} />
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-purple-900 mb-1">
                    {t.report.whySuggested}
                  </p>
                  <p className="text-xs text-slate-700 leading-relaxed">{aiResult.explanation}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-purple-900 mb-1">
                    {t.report.possibleImpact}
                  </p>
                  <p className="text-xs text-slate-700 leading-relaxed">{aiResult.publicImpact}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-purple-900 mb-1">
                    {t.report.suggestedAction}
                  </p>
                  <p className="text-xs text-purple-800 leading-relaxed font-medium">
                    {aiResult.recommendedAction}
                  </p>
                </div>

                <div className="pt-2 border-t border-purple-200 space-y-1.5">
                  <p className="text-[11px] text-slate-600">
                    <strong>{t.report.photoReview}</strong> {aiResult.imageAssessment}
                  </p>
                  <p className="text-[11px] font-medium text-purple-700">{aiResult.disclaimer}</p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setCategory(aiResult.category);
                    setSeverity(aiResult.severity);
                    setUserEditedClassification(false);
                  }}
                  className="w-full py-2.5 px-3 rounded-lg text-xs font-semibold bg-white border border-purple-300 text-purple-800 hover:bg-purple-100 transition-colors min-h-[40px]"
                >
                  {t.report.applyAiSuggestion}
                </button>
              </div>
            ) : null}

            {!aiLoading && !aiResult && !aiError ? (
              <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-200 text-xs text-purple-900 leading-relaxed">
                {t.report.aiIdleHint}
              </div>
            ) : null}
          </div>

          <div className="citizen-card rounded-2xl p-5 sm:p-6 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-blue-700" aria-hidden="true" />
                <h3 className="text-sm font-display font-bold text-[#0B1B36]">
                  {t.report.livePriorityTitle}
                </h3>
              </div>
              <span className="text-sm font-mono font-bold tabular-nums text-blue-700">
                <AnimatedNumber value={livePriorityPreview.totalScore} /> / 100
              </span>
            </div>

            <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
              <motion.div
                animate={{ width: `${livePriorityPreview.totalScore}%` }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="h-full rounded-full bg-gradient-to-r from-[#1D4ED8] via-[#0284C7] to-[#EA580C]"
              />
            </div>

            <ul className="space-y-1 text-xs text-slate-600">
              <li>• {livePriorityPreview.severityReason}</li>
              {livePriorityPreview.impactFactors.map((f, idx) => (
                <li key={idx}>• {f}</li>
              ))}
            </ul>
            <p className="text-[11px] text-slate-500">{t.report.livePriorityNote}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
