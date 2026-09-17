import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30 seconds
      gcTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Don't retry 4xx errors (client validation errors, bad request, not found)
        if (error && typeof error === 'object' && 'status' in error) {
          const status = (error as { status: number }).status;
          if (status >= 400 && status < 500) return false;
        }
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => {
        // Exponential backoff: 1s, 2s, 4s... with random jitter, capped at 10s
        const baseDelay = Math.min(1000 * 2 ** attemptIndex, 10000);
        const jitter = Math.floor(Math.random() * 250);
        return baseDelay + jitter;
      },
    },
    mutations: {
      retry: false, // Don't auto-retry mutations to prevent unintentional multiple charges
    },
  },
});
