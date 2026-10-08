import React from 'react';
import { useLexClearStore } from '../../store/useLexClearStore';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useLexClearStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />,
          warning: <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />,
          info: <Info className="w-4 h-4 text-primary-500 shrink-0" />,
          error: <XCircle className="w-4 h-4 text-red-500 shrink-0" />,
        };

        const borders = {
          success: 'border-emerald-200 dark:border-emerald-900/60 bg-white dark:bg-surface-900',
          warning: 'border-amber-200 dark:border-amber-900/60 bg-white dark:bg-surface-900',
          info: 'border-primary-200 dark:border-primary-900/60 bg-white dark:bg-surface-900',
          error: 'border-red-200 dark:border-red-900/60 bg-white dark:bg-surface-900',
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-xl border shadow-lg backdrop-blur-md flex items-center justify-between gap-3 transition-all duration-300 animate-fade-in ${borders[toast.type]}`}
          >
            <div className="flex items-center gap-2.5">
              {icons[toast.type]}
              <span className="text-xs font-medium text-surface-900 dark:text-white leading-snug">
                {toast.message}
              </span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
