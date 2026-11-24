import { ReactNode, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export interface ToastNotice {
  id: string;
  title: string;
  description?: string;
  tone?: 'success' | 'info' | 'warning';
}

export function AnimatedNumber({
  value,
  suffix = '',
  className = '',
}: {
  value: number;
  suffix?: string;
  className?: string;
}) {
  const prefersReducedMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = useState<number>(value);
  const previousRef = useRef<number>(value);

  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplayValue(value);
      previousRef.current = value;
      return;
    }

    const startVal = previousRef.current === value ? 0 : previousRef.current;
    const endVal = value;
    const durationMs = 420;
    const startTime = performance.now();
    let frameId = 0;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startVal + (endVal - startVal) * eased);
      setDisplayValue(current);
      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      } else {
        previousRef.current = endVal;
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [value, prefersReducedMotion]);

  return (
    <span className={`font-mono tabular-nums ${className}`}>
      {displayValue}
      {suffix}
    </span>
  );
}

export function RevealSection({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: ToastNotice[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div
      className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2.5 max-w-sm w-[calc(100vw-2rem)] pointer-events-none"
      aria-live="polite"
      aria-label="Notifications"
    >
      <AnimatePresence>
        {toasts.map((toast) => {
          const tone = toast.tone ?? 'success';
          const Icon =
            tone === 'warning'
              ? AlertCircle
              : tone === 'info'
                ? Info
                : CheckCircle2;
          const borderAccent =
            tone === 'warning'
              ? 'border-amber-300'
              : tone === 'info'
                ? 'border-blue-300'
                : 'border-emerald-300';
          const iconColor =
            tone === 'warning'
              ? 'text-amber-600'
              : tone === 'info'
                ? 'text-blue-600'
                : 'text-emerald-600';

          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.96 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className={`pointer-events-auto bg-white/95 backdrop-blur-md rounded-xl p-3.5 border ${borderAccent} shadow-[0_14px_34px_-10px_rgba(11,27,54,0.22)] flex items-start gap-3`}
              role="status"
            >
              <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${iconColor}`} aria-hidden="true" />
              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="text-xs font-semibold text-slate-900">{toast.title}</p>
                {toast.description ? (
                  <p className="text-[11px] text-slate-600 leading-relaxed">{toast.description}</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => onDismiss(toast.id)}
                aria-label="Dismiss notification"
                className="p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors shrink-0"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
