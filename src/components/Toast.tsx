import React from 'react';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isWarning = toast.type === 'warning';
        const isError = toast.type === 'error';

        const borderColor = isSuccess
          ? 'border-emerald-600/70'
          : isWarning
          ? 'border-amber-600/70'
          : isError
          ? 'border-rose-600/70'
          : 'border-cyan-600/70';

        const iconColor = isSuccess
          ? 'text-emerald-400'
          : isWarning
          ? 'text-amber-400'
          : isError
          ? 'text-rose-400'
          : 'text-cyan-400';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto bg-slate-900/95 backdrop-blur-md border ${borderColor} rounded-xl p-3.5 shadow-2xl text-xs text-slate-200 flex items-start gap-3 transition-all animate-in fade-in slide-in-from-bottom-2 duration-200`}
          >
            <div className={`mt-0.5 flex-shrink-0 ${iconColor}`}>
              {isSuccess && <CheckCircle2 className="w-4 h-4" />}
              {isWarning && <AlertTriangle className="w-4 h-4" />}
              {isError && <XCircle className="w-4 h-4" />}
              {toast.type === 'info' && <Info className="w-4 h-4" />}
            </div>

            <div className="flex-1 space-y-0.5">
              <div className="font-semibold text-white">{toast.title}</div>
              {toast.message && <div className="text-[11px] text-slate-400 leading-relaxed">{toast.message}</div>}
            </div>

            <button
              onClick={() => onDismiss(toast.id)}
              className="text-slate-500 hover:text-slate-300 transition-colors p-1 rounded-md cursor-pointer flex-shrink-0"
              aria-label="Dismiss toast"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
