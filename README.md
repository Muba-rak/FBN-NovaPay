# FirstBank NovaBiz (FBN NovaPay) — Merchant Web Application

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF.svg)](https://vitejs.dev/)
[![TanStack Query](https://img.shields.io/badge/TanStack%20Query-5.x-FF4154.svg)](https://tanstack.com/query)
[![MSW](https://img.shields.io/badge/MSW-2.x-FF6A00.svg)](https://mswjs.io/)
[![Playwright](https://img.shields.io/badge/Playwright-E2E-45ba4b.svg)](https://playwright.dev/)
[![WCAG 2.1 AA](https://img.shields.io/badge/WCAG%202.1-AA%20Compliant-002D62.svg)](https://www.w3.org/WAI/WCAG21/quickref/)

A mission-critical merchant banking web application built for **First Bank of Nigeria (NovaBiz)**. Engineered with zero floating-point arithmetic, anti-double-spend idempotency, 60fps virtualized transaction ledgers, optimistic UI updates with snapshot rollback, and an interactive Mock Service Worker (MSW) network simulation control bar.

---

## 🏛️ System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                   FirstBank NovaBiz UI (React 19 + TS)                 │
│  ┌────────────────────┐ ┌────────────────────┐ ┌────────────────────┐  │
│  │   Balance Card     │ │  Virtualized Feed  │ │  Send Money Flow   │  │
│  │ (Available/Ledger) │ │ (react-window 60fps)│ │ (4-Step + Rollback)│  │
│  └─────────┬──────────┘ └─────────┬──────────┘ └─────────┬──────────┘  │
│            │                      │                      │             │
│            ▼                      ▼                      ▼             │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │       TanStack Query v5 Cache + Optimistic Snapshot Engine       │  │
│  └────────────────────────────────┬─────────────────────────────────┘  │
└───────────────────────────────────┼────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   Mock Service Worker (MSW v2) Layer                   │
│  ┌────────────────────┐ ┌────────────────────┐ ┌────────────────────┐  │
│  │ /api/wallet/balance│ │ /api/transactions  │ │/api/transfers/send │  │
│  │ (Integer Kobo Math)│ │ (1,000+ Seed Rows) │ │ (Idempotency Key)  │  │
│  └────────────────────┘ └────────────────────┘ └────────────────────┘  │
│                                   │                                    │
│       ▲                           ▼                           ▲        │
│       │             ┌───────────────────────────┐             │        │
│       └─────────────┤ Simulation Controls Bar   ├─────────────┘        │
│                     │ (0-3000ms, 0-100% Fail)   │                      │
│                     └───────────────────────────┘                      │
└────────────────────────────────────────────────────────────────────────┘
```

---

## ✨ Key Architectural Highlights

### 1. Zero Floating-Point Financial Engine (`src/lib/format-money.ts`)

- **Integer Kobo Rule**: All balances, debits, credits, and fees are calculated in discrete sub-unit integers ($\text{₦}1.00 = 100\text{ Kobo}$).
- Completely eliminates JavaScript IEEE-754 binary floating-point rounding anomalies (`0.1 + 0.2 !== 0.3`).
- Formats currency with commas, 2 decimal places, and Nigerian currency symbol (`₦3,845,250.00`).

### 2. Anti-Double-Spend Idempotency (`src/lib/idempotency.ts`)

- Every outgoing transfer request attaches an RFC4122 v4 UUID `Idempotency-Key` header.
- Server/MSW maintains an in-memory processed transaction cache to guarantee that duplicate requests (e.g. from network timeouts or double button clicks) safely replay the original settlement without repeated debits.

### 3. High-Performance 60fps Feed Virtualization (`src/features/transactions/`)

- Powered by `react-window` and dynamic window resizing.
- Renders 1,000+ to 10,000+ transaction rows seamlessly with smooth 60fps scrolling, minimal DOM footprint, debounced search (250ms), and real-time status filtering (Credits, Debits, Completed, Pending, Failed).

### 4. Optimistic UI Updates & Snapshot Rollback (`src/features/send-money/`)

- On transfer authorization, the available balance is immediately decremented and the new transaction is prepended to the top of the ledger.
- If MSW network simulation injects a failure (e.g. 100% failure rate or network disconnect), TanStack Query executes a full snapshot rollback, restoring the exact previous state and triggering an accessible `role="alert"` notification.

### 5. Interactive Network Simulation DevTools Bar (`src/components/layout/SimulationBar.tsx`)

- Toggleable via bottom toolbar button or keyboard shortcut: **`Ctrl + Shift + D`** (or `Cmd + Shift + D`).
- Adjustable latency slider (`0ms`, `150ms 4G`, `800ms 3G`, `2500ms Degraded`).
- Failure rate test presets (`0%`, `25%`, `50%`, `100%`).
- Simulated offline disconnect switch.
- One-click Mock Database Reset.

### 6. FirstBank Brand Design Tokens & Accessibility

- **Primary Navy**: `#002D62`
- **Deep Navy (Dark Mode App Shell)**: `#001A3A`
- **FirstBank Accent Gold**: `#D4AF37`
- WCAG 2.1 AA compliant contrast ratios, accessible keyboard focus rings (`focus-visible:ring-amber-500`), dialog focus trapping, and screen reader announcements (`aria-live="polite"` and `aria-live="assertive"`).

---

## ⚖️ Key Architectural Decisions & Trade-offs

### 1. State Management Choice: TanStack Query v5 over Redux/Zustand

- **Decision**: I adopted **TanStack Query (React Query v5)** for all server/async state instead of a global state store like Redux Toolkit or Zustand.
- **Rationale**: In banking dashboards, 90% of state represents remote financial resources (balances, transaction ledgers, exchange rates, beneficiaries). TanStack Query provides out-of-the-box cache invalidation, deduplication, background re-fetching, and declarative optimistic mutation rollbacks via query snapshotting.
- **Trade-off**: Requires strict query key discipline (`['wallet', 'balance']`, `['transactions', filters]`) and query cancellation handlers (`cancelQueries`) to prevent background refetches from clobbering in-flight optimistic UI states.

### 2. Data Fetching & Mocking Strategy: MSW v2 (Mock Service Worker)

- **Decision**: Implemented **Mock Service Worker (MSW v2)** intercepting requests at the browser Network Service Worker layer rather than using Axios mock adapters or in-memory API stubs.
- **Rationale**: MSW operates at the network protocol boundary, intercepting real browser `fetch` calls. This ensures identical HTTP request/response lifecycles, real latency simulation, HTTP status code handling, and network failure injections without modifying a single line of production application code.
- **Trade-off**: Requires registering the service worker (`public/mockServiceWorker.js`) during dev boot and handling service worker activation lifecycles in automated test runners.

### 3. Precision Financial Math: Discrete Integer Kobo vs. Decimal Libraries

- **Decision**: Engineered a custom zero-dependency integer Kobo engine with `Intl.NumberFormat` instead of pulling heavy decimal libraries like `bignumber.js` or `decimal.js`
- **Rationale**: Nigerian banking rails (NIBSS / NIP) operate strictly on 2-decimal fractional sub-units ($\text{₦}1 = 100\text{ Kobo}$). Integer kobo representation fits safely within JavaScript's `Number.MAX_SAFE_INTEGER` ($2^{53} - 1 \approx \text{₦}90\text{ Trillion}$), delivering microsecond calculation speeds with zero bundle bloat.
- **Trade-off**: Developers must strictly follow the rule that values passing into UI formatters or API payloads are integer kobo, converting user decimal inputs only at the input boundary.

### 4. Ledger Rendering: Feed Virtualization (`react-window`) vs. Traditional Pagination

- **Decision**: Implemented high-performance windowed virtualization for 1,000+ transaction rows instead of classic paginated page clicks.
- **Rationale**: POS operators and merchant cashiers require continuous fast scrolling and instant real-time search/filtering through hundreds of daily collections on mobile devices without page reload latency.
- **Trade-off**: Virtualization requires fixed/dynamic row heights and careful DOM measurement, but guarantees a consistent 60fps frame rate and bounded DOM node memory consumption on low-RAM mobile hardware.

---

The repository includes preconfigured agent definitions and skills located in `.agents/`:

- **`fintech-engine`**: Zero floating-point kobo rules and NIP fee calculations.
- **`optimistic-rollback`**: TanStack Query optimistic mutation rollback lifecycle.
- **`feed-virtualizer`**: `react-window` feed virtualization standards.
- **`simulation-controller`**: MSW runtime latency and failure injection.
- **`e2e-tester`**: Playwright test journeys across 360px mobile POS and 1440px desktop.
- **`a11y-auditor`**: WCAG 2.1 AA accessibility checklists and verification.
- **`ai-usage-reporter`**: AI prompt logging, hallucination critique, and reporting.

---

## 🚀 Getting Started

### Prerequisites

- Node.js $\ge 18$
- npm $\ge 9$

### Quick Start (Install & Run in One Command)

```bash
# Clone and launch immediately
git clone https://github.com/Muba-rak/FBN-NovaPay.git
cd FBN-NovaPay
npm start
```

> `npm start` automatically installs all dependencies and starts the Vite development server in a single step.

### Alternative (Step-by-Step)

```bash
# 1. Install dependencies
npm install

# 2. Start Vite development server with MSW mocking
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing Suite

### Unit & Integration Tests (Vitest)

```bash
# Run all unit tests
npm test

# Run tests with coverage
npm run test:coverage
```

### End-to-End & Accessibility Tests (Playwright)

```bash
# Run all Playwright tests
npm run test:e2e

# Run with interactive UI mode
npx playwright test --ui
```

### TypeScript Validation

```bash
npm run typecheck
```

---

## 📂 Project Structure

```
FBN-NovaPay/
├── .agents/                    # Specialized AI agent skills & rules
│   ├── rules/fintech-engineering.md
│   └── skills/
│       ├── a11y-auditor/
│       ├── ai-usage-reporter/
│       ├── e2e-tester/
│       ├── feed-virtualizer/
│       ├── fintech-engine/
│       ├── optimistic-rollback/
│       └── simulation-controller/
├── e2e/                        # Playwright E2E test suites
│   ├── mobile-responsive.spec.ts
│   ├── send-money-failure.spec.ts
│   └── send-money.spec.ts
├── public/
│   └── mockServiceWorker.js    # MSW Service Worker script
├── src/
│   ├── app/                    # App shell, root routing, providers
│   ├── components/             # Reusable UI components & layouts
│   │   ├── feedback/           # Error states, empty states
│   │   ├── layout/             # Header, MobileNav, SimulationBar, AppShell
│   │   └── ui/                 # Button, Badge, Dialog, Input, Toast
│   ├── features/
│   │   ├── dashboard/          # BalanceCard, DailySummary, useBalance
│   │   ├── send-money/         # Multi-step transfer wizard & optimistic hooks
│   │   └── transactions/       # react-window virtualized feed & receipt modal
│   ├── lib/                    # Currency engine, Idempotency, Class utilities
│   ├── mocks/                  # MSW handlers, seed data (1,000+ tx), config
│   └── main.tsx                # Browser MSW bootstrapping & React mount
├── AI_USAGE.md                 # Detailed AI prompts, outputs & hallucination critiques
├── PHASES.md                   # Complete implementation phase tracker
└── README.md
```

---

## 📄 License

Proprietary and confidential. Developed for First Bank of Nigeria NovaBiz.
