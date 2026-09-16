import { cn } from '@/lib/utils';

interface LoadingStateProps {
  message?: string;
  rows?: number;
  className?: string;
}

export function LoadingState({
  message = 'Loading transaction ledger...',
  rows = 5,
  className,
}: LoadingStateProps) {
  return (
    <div
      className={cn('w-full py-6 space-y-4 animate-pulse', className)}
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">{message}</span>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between p-4 rounded-xl border border-slate-200/80 bg-slate-50/50"
        >
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-full bg-slate-200" />
            <div className="space-y-2">
              <div className="h-4 w-32 sm:w-48 bg-slate-200 rounded" />
              <div className="h-3 w-20 sm:w-32 bg-slate-200 rounded" />
            </div>
          </div>
          <div className="space-y-2 text-right">
            <div className="h-4 w-20 sm:w-28 bg-slate-200 rounded ml-auto" />
            <div className="h-3 w-14 bg-slate-200 rounded ml-auto" />
          </div>
        </div>
      ))}
    </div>
  );
}
