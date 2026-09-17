import { cn } from '@/lib/utils';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
  retryLabel?: string;
  className?: string;
}

export function ErrorState({
  title = 'Unable to load data',
  message = 'A network or server error occurred while communicating with core banking rails.',
  onRetry,
  isRetrying,
  retryLabel = 'Retry Connection',
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        'flex flex-col items-center justify-center text-center p-6 sm:p-8 rounded-2xl border border-red-200/80 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/20',
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center text-red-600 dark:text-red-400 mb-3.5">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h3 className="text-base font-bold text-red-950 dark:text-red-200 mb-1">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-red-700 dark:text-red-300 max-w-sm mb-4">
        {message}
      </p>
      {onRetry && (
        <Button
          variant="destructive"
          size="sm"
          onClick={onRetry}
          isLoading={isRetrying}
          className="gap-2"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
