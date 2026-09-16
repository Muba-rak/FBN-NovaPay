# Mock Service Worker (MSW) & Network Simulation Guide

This guide covers setting up MSW v2, creating robust API mock handlers, and providing interactive runtime simulation controls (latency, failure rate, offline mode).

---

## 1. MSW v2 Architecture

Mock Service Worker intercepts requests at the network level using the Browser Service Worker API. In automated tests (Vitest), `setupServer` intercepts HTTP calls via NodeJS interceptors.

### Endpoints
- `GET /api/wallet/balance`: Returns available balance, ledger balance, today's inflow, today's outflow (all in kobo).
- `GET /api/transactions`: Returns paginated and filtered transactions.
- `GET /api/banks`: Returns list of Nigerian commercial and fintech banks (FirstBank, GTBank, Zenith, Access, Kuda, OPay, Moniepoint, etc.).
- `POST /api/banks/resolve`: Simulates real-time NIBSS Name Inquiry resolution.
- `POST /api/transfers/send`: Processes outgoing transfer with `Idempotency-Key` tracking and balance deduction.

---

## 2. Dynamic Simulation Configuration (`src/mocks/config.ts`)

```ts
export interface SimulationConfig {
  latencyMs: number;       // 0 to 3000ms
  failureRate: number;     // 0.0 to 1.0 (0% to 100%)
  offline: boolean;        // Simulates network connection error
}

export const simulationConfig: SimulationConfig = {
  latencyMs: 300,
  failureRate: 0.0,
  offline: false,
};

export function updateSimulationConfig(newConfig: Partial<SimulationConfig>) {
  Object.assign(simulationConfig, newConfig);
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('fbn_simulation_config', JSON.stringify(simulationConfig));
  }
}
```

---

## 3. MSW Handler with Simulation Injection

```ts
import { http, HttpResponse, delay } from 'msw';
import { simulationConfig } from '../config';

export const transferHandlers = [
  http.post('/api/transfers/send', async ({ request }) => {
    // 1. Simulate Latency
    if (simulationConfig.latencyMs > 0) {
      await delay(simulationConfig.latencyMs);
    }

    // 2. Simulate Offline / Disconnect
    if (simulationConfig.offline) {
      return HttpResponse.error();
    }

    // 3. Simulate Failure Rate
    if (Math.random() < simulationConfig.failureRate) {
      return HttpResponse.json(
        {
          code: 'TRANSFER_REJECTED',
          message: 'NIBSS network timeout: destination institution did not acknowledge settlement.',
        },
        { status: 500 }
      );
    }

    // 4. Happy Path Logic ...
  }),
];
```
