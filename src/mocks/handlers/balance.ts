import { http, HttpResponse, delay } from 'msw';
import { currentBalanceState } from '../data/transactions';
import { simulationConfig } from '../config';

export const balanceHandlers = [
  http.get('/api/wallet/balance', async () => {
    // 1. Simulate Latency
    if (simulationConfig.latencyMs > 0) {
      await delay(simulationConfig.latencyMs);
    }

    // 2. Simulate Offline
    if (simulationConfig.offline) {
      return HttpResponse.error();
    }

    // 3. Simulate Failure
    if (simulationConfig.failureRate > 0 && Math.random() < simulationConfig.failureRate) {
      return HttpResponse.json(
        {
          code: 'SERVICE_UNAVAILABLE',
          message: 'Unable to fetch wallet balance from core banking rails. Please retry.',
        },
        { status: 503 }
      );
    }

    return HttpResponse.json(currentBalanceState);
  }),
];
