# NovaBiz Merchant Dashboard — Project Roadmap & Phase Tracker

This document tracks all implementation phases for the **FirstBank NovaBiz Merchant Dashboard**, detailing completed milestones, current deliverables, and upcoming work.

---

## 🚦 Phase Status Summary

| Phase        | Description                                 | Status               | Deliverables & Highlights                                                              |
| :----------- | :------------------------------------------ | :------------------- | :------------------------------------------------------------------------------------- |
| **Phase 1**  | Project Initialization & Tooling            | ✅ **Completed**     | Vite, React 19, TypeScript, Vitest, Tailwind CSS, Playwright                           |
| **Phase 2**  | Core Currency & Precision Engine            | ✅ **Completed**     | Kobo integer engine, floating-point safety, idempotency UUID v4                        |
| **Phase 3**  | Mock Service Worker (MSW) & Seed Data       | ✅ **Completed**     | 1,000+ realistic seed transactions, bank directory, NIBSS name inquiry                 |
| **Phase 4**  | FirstBank Visual Design System              | ✅ **Completed**     | Navy & Gold palette, responsive layout, shadcn tokens, typography                      |
| **Phase 5**  | Merchant Dashboard & Daily Telemetry        | ✅ **Completed**     | BalanceCard, balance hide/reveal toggle, DailySummary, ThemeProvider                   |
| **Phase 6**  | Virtualized Transaction Feed & Filters      | ✅ **Completed**     | `react-window` 60fps feed, status/type/date chips, debounced search, receipt modal     |
| **Phase 7**  | Multi-Step Send Money & Optimistic Rollback | ✅ **Completed**     | 4-step transfer modal, auto NIBSS name resolution, optimistic debit, snapshot rollback |
| **Phase 8**  | Interactive Network Simulation Panel        | 🟡 **Next (Active)** | Floating dev bar: latency slider (0-3000ms), fail rate (0-100%), offline toggle        |
| **Phase 9**  | E2E Testing, A11y Audit & WCAG AA Polish    | ⏳ **Upcoming**      | Playwright flows (happy path & rollback), screen reader testing, 360px mobile audit    |
| **Phase 10** | Production Verification & AI Usage Report   | ⏳ **Upcoming**      | `AI_USAGE.md` prompt report, bug resolutions, production build verification            |

---

## 📋 Detailed Phase Breakdown

### ✅ Phase 1: Project Initialization & Tooling

- [x] Initialized Vite React + TypeScript boilerplate
- [x] Configured Path Aliases (`@/*` -> `./src/*`)
- [x] Configured Vitest, Testing Library, and Playwright
- [x] Added architectural skill guides in `skills/`

### ✅ Phase 2: Core Utilities & Precision Engine

- [x] `src/lib/format-money.ts`: Integer kobo to Naira currency formatting (`formatKoboToNaira`)
- [x] Safe string/number parsing to integer kobo (`parseNairaInputToKobo`)
- [x] `src/lib/idempotency.ts`: RFC4122 v4 UUID generator for anti-double-spend requests
- [x] `src/lib/__tests__/format-money.test.ts`: 13 unit tests covering rounding, zero, and kobo boundary cases

### ✅ Phase 3: MSW Mock Service Worker & Data Engine

- [x] Intercepts `/api/wallet/balance`, `/api/transactions`, `/api/banks`, `/api/banks/resolve`, `/api/transfers/send`
- [x] Seeded 1,000+ diverse transaction history spanning POS, QR, USSD, and NIP Transfer
- [x] Dynamic simulation configuration (`latencyMs`, `failureRate`, `offline`) in `src/mocks/config.ts`
- [x] Node test interceptor server `src/mocks/server.ts` for Vitest

### ✅ Phase 4: FirstBank Visual Design System & Theme Provider

- [x] FirstBank Navy (`#002D62`), Deep Navy (`#001A3A`), and Royal Gold (`#D4AF37`) tokens
- [x] `src/index.css`: Complete shadcn HSL CSS variables for light & dark modes
- [x] `src/app/providers.tsx`: ThemeProvider with `localStorage` persistence and OS auto-detection
- [x] Reusable UI primitives: Button, Card, Badge, Toast, Dialog, Input, Select, Tabs

### ✅ Phase 5: Dashboard Balance & Daily Telemetry Overview

- [x] `BalanceCard.tsx`: Formatted balance in ₦ from kobo, hidden balance toggle, Tier 3 KYC pill, Quick Actions
- [x] `DailySummary.tsx`: Real-time Today Inflow, Outflow, and Net Telemetry calculation
- [x] `useBalance.ts`: TanStack React Query hook for live balance synchronization
- [x] `BalanceCard.test.tsx`: Component tests verifying balance rendering, eye toggle, and callbacks

### ✅ Phase 6: Virtualized Transaction Feed & Real-Time Filters

- [x] `TransactionList.tsx`: High-performance 60fps virtualized list using `react-window`
- [x] `TransactionFilters.tsx`: Status pills (`All`, `Successful`, `Pending`, `Failed`), Type pills, Date range chips, and 250ms debounced search
- [x] `TransactionRow.tsx`: Memoized row card with payment channel badges, formatted currency, and spaced boundaries
- [x] `TransactionReceiptModal.tsx`: Official FirstBank receipt preview with NIBSS NIP Session ID, copy-to-clipboard, and download action
- [x] `TransactionFeed.tsx`: Integrated volume telemetry cards, live search announcements, and empty/loading states
- [x] `TransactionFeed.test.tsx`: 6 integration tests passing

---

### ✅ Phase 7: Multi-Step "Send Money" Flow & Optimistic Rollback

- [x] **Step 1: Recipient Selection**:
  - [x] Bank selector with popular bank badges (FirstBank, GTBank, Zenith, Access, Kuda, OPay, Moniepoint)
  - [x] 10-digit NUBAN account input with auto-formatting
  - [x] Real-time simulated NIBSS Name Inquiry resolution with loading spinner & verified checkmark
  - [x] Quick-select recent beneficiaries list
- [x] **Step 2: Amount & Details**:
  - [x] Naira amount input with live kobo integer conversion
  - [x] Quick-pick amount chips (₦5,000, ₦10,000, ₦20,000, ₦50,000, ₦100,000)
  - [x] Real-time available balance validation & daily limit warnings (₦5,000,000.00 max)
  - [x] Narration / payment note input
- [x] **Step 3: Transfer Review & Fee Breakdown**:
  - [x] Detailed transfer summary: Recipient Name, Destination Bank, Account Number, Amount
  - [x] Transparent NIP transfer fee breakdown (₦10.00 NIP + ₦0.75 VAT = ₦10.75)
  - [x] Total debit calculation in kobo integer
  - [x] Security warning badge
- [x] **Step 4: PIN Authorization & Submission**:
  - [x] 4-digit masked Transaction PIN entry with keypad or keyboard navigation
  - [x] UUID v4 `Idempotency-Key` generation per transfer intent
- [x] **Optimistic UI & Rollback Engine**:
  - [x] TanStack Query mutation with instant optimistic balance deduction and pending transaction feed prepend
  - [x] Rollback reconciliation restoring snapshot on simulated 500 error / offline disconnect
  - [x] Screen reader `aria-live="assertive"` failure alerts with retry button
- [x] **Testing**:
  - [x] Vitest unit & component tests for multi-step navigation, NIBSS resolution, validation, and optimistic rollback (6 tests passing)

---

### ⏳ Phase 8: Interactive Network Simulation DevTools Panel

- [ ] Floating/collapsible bottom dev panel for reviewer testing
- [ ] Live latency slider (0ms to 3,000ms)
- [ ] Failure rate slider (0% to 100%)
- [ ] Simulated offline mode toggle
- [ ] Mock database reset CTA

### ⏳ Phase 9: End-to-End Testing & WCAG AA Accessibility Audit

- [ ] Playwright E2E tests: Complete Send Money flow, Instant Settlement, and Failure Rollback
- [ ] Mobile responsive layout audit (360px viewport on mobile Android)
- [ ] Keyboard trap, Focus restoration, and WCAG AA contrast audit

### ⏳ Phase 10: Production Polish & AI Usage Report

- [ ] Build verification (`npm run build` / `tsc -b && vite build`)
- [ ] Complete `README.md` and `AI_USAGE.md` report
