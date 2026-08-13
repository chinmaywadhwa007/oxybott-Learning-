import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Info, WifiOff, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: 'error' | 'warning' | 'info' | 'success';
  duration?: number;
}

interface ToastNotificationProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
  const onDismissRef = React.useRef(onDismiss);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    const duration = typeof toast.duration === 'number' ? toast.duration : 3000;
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
    }, 30);

    const timer = setTimeout(() => {
      onDismissRef.current(toast.id);
    }, duration);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [toast.id, toast.duration]);

  const isError = toast.type === 'error' || !toast.type;
  const isWarning = toast.type === 'warning';
  const isSuccess = toast.type === 'success';

  return (
    <div
      className={`pointer-events-auto rounded-xl p-3.5 shadow-2xl border flex items-start gap-3 transition-all duration-300 transform animate-in slide-in-from-top-4 fade-in relative overflow-hidden bg-[#0f172a]/95 backdrop-blur-md ${
        isError
          ? 'border-rose-500/50 shadow-rose-950/40'
          : isWarning
          ? 'border-amber-500/50 shadow-amber-950/40'
          : isSuccess
          ? 'border-emerald-500/50 shadow-emerald-950/40'
          : 'border-blue-500/50 shadow-blue-950/40'
      }`}
    >
      {/* Icon Badge */}
      <div
        className={`shrink-0 p-2 rounded-lg flex items-center justify-center ${
          isError
            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
            : isWarning
            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            : isSuccess
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
        }`}
      >
        {isError ? (
          <WifiOff className="w-4 h-4" />
        ) : isWarning ? (
          <AlertTriangle className="w-4 h-4" />
        ) : isSuccess ? (
          <CheckCircle2 className="w-4 h-4" />
        ) : (
          <Info className="w-4 h-4" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-1">
        <div className="font-sans font-bold text-xs leading-snug text-white flex items-center gap-1.5">
          {toast.title}
        </div>
        {toast.description && (
          <div className="font-sans text-[11px] text-slate-300 mt-0.5 leading-relaxed">
            {toast.description}
          </div>
        )}
      </div>

      {/* Close Button */}
      <button
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
        title="Close Notification"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      {/* Animated Bottom Progress Line */}
      <div
        className={`absolute bottom-0 left-0 h-0.5 transition-all ease-linear ${
          isError
            ? 'bg-rose-500'
            : isWarning
            ? 'bg-amber-500'
            : isSuccess
            ? 'bg-emerald-400'
            : 'bg-blue-400'
        }`}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export const ToastNotification: React.FC<ToastNotificationProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none px-2 select-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};
