import { setupWorker } from 'msw/browser';
import { balanceHandlers } from './handlers/balance';
import { transactionHandlers } from './handlers/transactions';
import { transferHandlers } from './handlers/transfers';

export const handlers = [
  ...balanceHandlers,
  ...transactionHandlers,
  ...transferHandlers,
];

export const worker =
  typeof window !== 'undefined' && typeof navigator !== 'undefined' && 'serviceWorker' in navigator
    ? setupWorker(...handlers)
    : null;

export async function enableMocking() {
  if (typeof window === 'undefined' || !worker) {
    return;
  }

  // Register and start MSW Service Worker
  return worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: {
      url: '/mockServiceWorker.js',
    },
  });
}
