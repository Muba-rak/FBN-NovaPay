---
name: simulation-controller
description: Mock Service Worker (MSW) runtime simulation, network latency injection, failure rate configuration, and offline mode testing for FirstBank NovaBiz.
---

# Network Simulation Controller Agent Guide

This agent manages the runtime simulation parameters to stress-test financial workflows under degraded network conditions.

---

## 1. Simulation Capabilities (`src/mocks/config.ts`)

| Parameter | Range | Purpose |
| :--- | :--- | :--- |
| **`latencyMs`** | `0ms` to `3,000ms` | Simulates high-latency 2G/3G connections in open markets. |
| **`failureRate`** | `0.0` to `1.0` ($0\% - 100\%$) | Simulates intermittent NIBSS network timeouts and destination switch drops. |
| **`offline`** | `boolean` (`true`/`false`) | Simulates complete client disconnect (`HttpResponse.error()`). |

---

## 2. DevTools Simulation Bar Integration
- Bottom collapsible panel mounted in `AppShell`.
- Real-time updates notify subscribers via `subscribeSimulationConfig()`.
- Updates persist to `localStorage` key `'fbn_simulation_config'`.
- Header status pill reflects active simulation state (e.g. `Fail Rate: 25%`, `Simulated Offline`, or `MSW Mock (300ms)`).
