import React from 'react';
import { useToast, ToastType } from './toast';
import { cn } from '@/lib/utils';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />,
  error: <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />,
  warning: <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />,
  info: <Info className="h-5 w-5 text-[#002D62] shrink-0" />,
};

export function Toaster() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-16 sm:bottom-6 right-4 sm:right-6 z-50 flex flex-col space-y-2 max-w-sm sm:max-w-md w-full pointer-events-none"
      aria-live="assertive"
      aria-atomic="true"
    >
      {toasts.map((t) => {
        const type = t.type || 'info';
        return (
          <div
            key={t.id}
            role={type === 'error' ? 'alert' : 'status'}
            className={cn(
              'pointer-events-auto flex items-start gap-3 rounded-2xl border p-4 shadow-xl backdrop-blur-md transition-all duration-300 animate-fade-in',
              type === 'success' && 'bg-emerald-50/95 border-emerald-200 text-emerald-950',
              type === 'error' && 'bg-red-50/95 border-red-200 text-red-950',
              type === 'warning' && 'bg-amber-50/95 border-amber-200 text-amber-950',
              type === 'info' && 'bg-[#002D62] border-[#001D40] text-white'
            )}
          >
            {icons[type]}
            <div className="flex-1 text-sm">
              {t.title && <div className="font-semibold">{t.title}</div>}
              <div className="text-xs sm:text-sm opacity-90 mt-0.5">{t.description}</div>
              {t.action && (
                <button
                  type="button"
                  onClick={t.action.onClick}
                  className="mt-2 text-xs font-bold underline underline-offset-2 hover:opacity-80"
                >
                  {t.action.label}
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => removeToast(t.id)}
              className="rounded p-1 opacity-70 hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
