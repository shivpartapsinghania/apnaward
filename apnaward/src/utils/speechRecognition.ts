export type VoiceErrorCode =
  | 'unsupported'
  | 'permission-denied'
  | 'no-microphone'
  | 'no-speech'
  | 'network'
  | 'aborted'
  | 'unknown';

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternativeLike;
}

interface SpeechRecognitionEventLike extends Event {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: SpeechRecognitionResultLike;
  };
}

interface SpeechRecognitionErrorEventLike extends Event {
  error: string;
}

interface SpeechRecognitionInstanceLike extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
}

type SpeechRecognitionConstructorLike = new () => SpeechRecognitionInstanceLike;

function getSpeechRecognitionConstructor(): SpeechRecognitionConstructorLike | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructorLike;
    webkitSpeechRecognition?: SpeechRecognitionConstructorLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function isSpeechRecognitionSupported(): boolean {
  return getSpeechRecognitionConstructor() !== null;
}

export function mapSpeechError(errorName: string): VoiceErrorCode {
  switch (errorName) {
    case 'not-allowed':
    case 'service-not-allowed':
      return 'permission-denied';
    case 'audio-capture':
      return 'no-microphone';
    case 'no-speech':
      return 'no-speech';
    case 'network':
      return 'network';
    case 'aborted':
      return 'aborted';
    default:
      return 'unknown';
  }
}

export interface VoiceSessionHandle {
  stop: () => void;
  abort: () => void;
}

export function startVoiceRecognition(options: {
  lang: 'en-IN' | 'hi-IN';
  onStart?: () => void;
  onInterim?: (text: string) => void;
  onFinal?: (text: string) => void;
  onError?: (code: VoiceErrorCode) => void;
  onEnd?: () => void;
}): VoiceSessionHandle | null {
  const RecognitionCtor = getSpeechRecognitionConstructor();
  if (!RecognitionCtor) {
    options.onError?.('unsupported');
    return null;
  }

  try {
    const recognition = new RecognitionCtor();
    recognition.lang = options.lang;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      options.onStart?.();
    };

    recognition.onresult = (event) => {
      let interim = '';
      let finalChunk = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result?.[0]?.transcript ?? '';
        if (result.isFinal) {
          finalChunk += transcript;
        } else {
          interim += transcript;
        }
      }
      if (interim.trim()) {
        options.onInterim?.(interim.trim());
      } else if (!finalChunk) {
        options.onInterim?.('');
      }
      if (finalChunk.trim()) {
        options.onInterim?.('');
        options.onFinal?.(finalChunk.trim());
      }
    };

    recognition.onerror = (event) => {
      const code = mapSpeechError(event.error);
      if (code !== 'aborted') {
        options.onError?.(code);
      }
    };

    recognition.onend = () => {
      options.onEnd?.();
    };

    recognition.start();

    return {
      stop: () => {
        try {
          recognition.stop();
        } catch {
          // ignore stop error
        }
      },
      abort: () => {
        try {
          recognition.abort();
        } catch {
          // ignore abort error
        }
      },
    };
  } catch {
    options.onError?.('unknown');
    return null;
  }
}
