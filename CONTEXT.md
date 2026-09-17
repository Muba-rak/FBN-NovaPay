# FirstBank NovaBiz (FBN NovaPay) — Engineering Context & Handoff Guide

> **Document Purpose**: This file serves as the definitive engineering context and handoff reference for **FirstBank NovaBiz (FBN NovaPay)**. When you or any AI agent need to maintain, refactor, or extend this application in the future, this document provides complete situational awareness of the domain rules, architecture, state management, and critical non-negotiable invariants.

---

## 1. Executive Overview

* **Application Name**: FirstBank NovaBiz (FBN NovaPay)
* **Target Audience**: Nigerian business merchants, cashiers, and POS terminal operators.
* **Core Value Proposition**: High-speed, mission-critical merchant treasury dashboard supporting instant NIBSS NIP interbank transfers, real-time POS transaction telemetry, virtualized 60fps transaction ledgers (1,000+ rows), and resilient network-failure handling.
* **Core Tech Stack**:
  - **Framework**: React 19 + TypeScript (Strict Mode)
  - **Bundler & Build**: Vite 6
  - **Styling**: Tailwind CSS + Shadcn UI HSL Design System (Dark/Light mode)
  - **Server State**: TanStack Query v5 (React Query)
  - **Network Mocking**: Mock Service Worker (MSW v2) via Browser Service Worker
  - **Feed Virtualization**: `react-window` (fixed-size 60fps windowing)
  - **Testing**: Vitest + Testing Library (Unit/Integration) & Playwright (E2E)

---

## 2. Non-Negotiable Domain Invariants & Rules

When modifying any code in this repository, the following 5 rules **must never be broken**:

### 1. Zero Floating-Point Arithmetic (Strict Kobo Integer Engine)
* **The Invariant**: All monetary values (balances, inflows, outflows, transfer amounts, fees, and VAT) **must be calculated and stored strictly as discrete integer Kobo** ($1\text{ NGN} = 100\text{ Kobo}$).
* **Why**: JavaScript's IEEE-754 floating-point standard produces cumulative rounding anomalies (e.g. `0.1 + 0.2 = 0.30000000000000004`). In financial ledgers, this causes tax reconciliation discrepancies.
* **Helpers ([`src/lib/format-money.ts`](file:///Users/mac/Desktop/FBN%20NovaPay/src/lib/format-money.ts))**:
  - `formatKoboToNaira(kobo: number, options?)`: Formats integer Kobo into formatted Naira string with 2 decimals (e.g. `384525000` $\rightarrow$ `₦3,845,250.00`).
  - `parseNairaInputToKobo(input: string)`: Converts merchant decimal input string to integer Kobo strictly at the UI boundary.
* **Regulatory Constants**:
  - `NIP_TRANSFER_FEE_KOBO = 1075` (₦10.00 NIBSS Fee + ₦0.75 7.5% VAT = ₦10.75).
  - `DAILY_TRANSFER_LIMIT_KOBO = 500000000` (₦5,000,000.00 KYC Tier 3 single transaction ceiling).

### 2. Anti-Double-Spend Idempotency
* **The Invariant**: Every transfer dispatch must include an RFC4122 v4 UUID `Idempotency-Key` header.
* **Why**: On flaky mobile networks (2G/3G in Nigeria), if a transfer request times out after the core banking rail debited the account, merchant retries must not cause a second deduction.
* **Helpers ([`src/lib/idempotency.ts`](file:///Users/mac/Desktop/FBN%20NovaPay/src/lib/idempotency.ts))**:
  - `generateIdempotencyKey()`: Generates a cryptographically random UUID v4 string.
  - The MSW mock handler (`src/mocks/handlers/transfers.ts`) maintains an in-memory `processedIdempotencyMap` cache so duplicate submissions replay the original receipt safely.

### 3. Untrusted Input & Payment Remark Sanitization
* **The Invariant**: All merchant-entered text, customer names, bank names, and payment remarks must be treated as untrusted input.
* **Helpers ([`src/lib/utils.ts`](file:///Users/mac/Desktop/FBN%20NovaPay/src/lib/utils.ts))**:
  - `sanitizeText(text)`: Strips HTML/XML tags (`<script>`, `<b>`, `<img>`) and ASCII control characters (`\x00-\x1F\x7F-\x9F`).
  - `sanitizeNarration(text)`: Extends `sanitizeText` by neutralizing spreadsheet formula injection triggers (`=`, `+`, `-`, `@`) and enforcing the 50-character NIBSS length limit.
* **Numeric Inputs**:
  - NUBAN Account Number: Strictly filtered to digits only `e.target.value.replace(/\D/g, "").slice(0, 10)`.
  - Transaction PIN: Strictly filtered to digits only `e.target.value.replace(/\D/g, "").slice(0, 4)`.

### 4. Modal Backdrop Dismissal Protection
* **The Invariant**: Modals must **not** close when users accidentally click or tap on the dark backdrop outside the dialog.
* **Implementation ([`src/components/ui/dialog.tsx`](file:///Users/mac/Desktop/FBN%20NovaPay/src/components/ui/dialog.tsx))**:
  - `DialogContent` has `preventOutsideClick = true` by default, calling `e.preventDefault()` on both `onPointerDownOutside` and `onInteractOutside`.
  - Users must explicitly close modals via the close "X" button, "Cancel" / "Done" CTAs, or the <kbd>Escape</kbd> key.

### 5. Resilient Offline & Low-Connectivity Handling
* **The Invariant**: Under network dropouts, the application must never show a blank screen or lose uncommitted merchant input.
* **Query Retry & Exponential Backoff ([`src/lib/query-client.ts`](file:///Users/mac/Desktop/FBN%20NovaPay/src/lib/query-client.ts))**:
  - Queries retry transient failures up to 2 times using exponential backoff with jitter ($1\text{s}, 2\text{s}, 4\text{s}\dots$ capped at $10\text{s}$). Client 4xx errors are never retried.
  - Mutations do not auto-retry blindly (prevents accidental multiple charges).
* **Graceful Degradation**:
  - If a cached balance exists during a network drop, `BalanceCard` preserves the balance and renders an `Out of sync` badge with a manual sync trigger.
  - If no cache exists, it renders an accessible in-card offline fallback with a retry button.

---

## 3. High-Level Architecture & Component Map

```
src/
├── app/
│   ├── App.tsx                     # Main layout orchestrator (Hero + Daily Summary + Feed)
│   ├── AppShell.tsx                # Master shell with sticky Header & Mobile Navigation
│   └── providers.tsx               # ThemeProvider, QueryClientProvider, ToastProvider
├── components/
│   ├── layout/
│   │   ├── Header.tsx              # FirstBank branding, Tier 3 badge, connection status pill
│   │   ├── MobileNav.tsx           # Bottom navigation bar for mobile POS viewports
│   │   └── SimulationBar.tsx       # Floating DevTools panel (Ctrl+Shift+D)
│   └── ui/                         # Accessible UI components (Dialog, Button, Badge, Toast, Input)
├── features/
│   ├── dashboard/                  # Merchant Overview Feature
│   │   ├── components/
│   │   │   ├── BalanceCard.tsx     # Available/Ledger balances, eye toggle, quick actions, offline card
│   │   │   └── DailySummary.tsx    # Today's Inflow, Outflow, Net Flow, Pending Settlement cards
│   │   └── hooks/
│   │       └── useBalance.ts       # TanStack Query hook for /api/wallet/balance
│   ├── send-money/                 # Multi-Step Transfer Feature
│   │   ├── components/
│   │   │   ├── SendMoneyModal.tsx  # Dialog container controlling 4-step wizard
│   │   │   ├── StepRecipient.tsx   # Step 1: Bank selector + NUBAN + auto NIBSS Name Resolution
│   │   │   ├── StepAmount.tsx      # Step 2: Amount input + quick chips + narration + fee glance
│   │   │   ├── StepReview.tsx      # Step 3: Fee & VAT breakdown + total debit confirmation
│   │   │   ├── StepPin.tsx         # Step 4: 4-digit masked PIN entry via keyboard or on-screen pad
│   │   │   └── TransferSuccessModal.tsx # Step 5: Official receipt modal with Ref & Session ID
│   │   └── hooks/
│   │       ├── useBanks.ts         # Query hooks for banks & beneficiaries, mutation for NIBSS resolve
│   │       └── useSendMoney.ts     # Transfer mutation with optimistic debit & snapshot rollback
│   └── transactions/               # Virtualized Ledger Feature
│       ├── components/
│       │   ├── TransactionFeed.tsx # Ledger container + telemetry cards + CSV export
│       │   ├── TransactionList.tsx # react-window 60fps virtualized list
│       │   ├── TransactionFilters.tsx # Status chips, Type chips, Date ranges, debounced search
│       │   ├── TransactionRow.tsx  # Individual memoized row card with channel badge
│       │   └── TransactionReceiptModal.tsx # Full receipt drawer with copy/share/download
│       └── hooks/
│           └── useTransactions.ts  # Filtering & search hook with 250ms debounce
├── lib/
│   ├── api-client.ts               # Resilient fetch wrapper throwing structured ApiError
│   ├── format-money.ts             # Integer Kobo math and Naira currency formatter
│   ├── idempotency.ts              # RFC4122 v4 UUID generator
│   ├── query-client.ts             # TanStack QueryClient with exponential backoff + jitter
│   └── utils.ts                    # Class merging (cn), sanitizeText, sanitizeNarration
└── mocks/                          # MSW Mock Service Worker
    ├── browser.ts                  # Browser service worker setup
    ├── config.ts                   # Simulation configuration store (latency, fail rate, offline)
    ├── data/
    │   └── transactions.ts         # 1,000+ diverse seed transactions and initial balance
    └── handlers/                   # MSW Route handlers
        ├── balance.ts              # GET /api/wallet/balance
        ├── transactions.ts         # GET /api/transactions
        └── transfers.ts            # GET /api/banks, POST /api/banks/resolve, POST /api/transfers/send
```

---

## 4. Multi-Step Send Money Flow & Optimistic Rollback Lifecycle

The transfer flow follows an enterprise-grade state machine:

```
[Step 1: Recipient]
  │  Select Bank (15 Nigerian Commercial Banks & MFBs)
  │  Enter 10-digit NUBAN
  ▼  Auto-trigger /api/banks/resolve (NIBSS Name Resolution)
[Step 2: Amount & Narration]
  │  Validate against Available Balance (cannot overdraft)
  │  Validate against KYC Tier 3 Limit (₦5,000,000 max)
  ▼  Sanitize Narration (strip HTML, control chars, formula triggers)
[Step 3: Review & Summary]
  │  Display transparent NIP Fee: ₦10.00 + ₦0.75 VAT = ₦10.75
  ▼  Display exact Total Debit in Kobo integer
[Step 4: PIN Authorization]
  │  Enter 4-digit PIN (masked)
  ▼  Generate UUID v4 Idempotency-Key
[Execution & Optimistic UI]
  │  1. Cancel in-flight balance & transaction queries
  │  2. Snapshot previous cache state
  │  3. Optimistically subtract total debit from wallet balance
  │  4. Optimistically prepend PENDING transaction into ledger
  │
  ├───► SUCCESS ──► Display TransferSuccessModal (Official Ref & NIBSS Session ID)
  │
  └───► FAILURE ──► Snapshot Rollback: Restore exact previous balance & transactions
                    Display assertive aria-live alert: "NIBSS switch connection timed out"
```

---

## 5. Interactive DevTools Simulation Bar (`SimulationBar.tsx`)

To test low connectivity, degraded networks, and system errors without external proxies:

* **Open/Close Shortcut**: Press <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>D</kbd> (or <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>D</kbd>) or click the floating button at the bottom center.
* **Latency Simulation**:
  - `0ms`: Instant
  - `150ms`: Standard 4G
  - `800ms`: Typical 3G mobile POS
  - `2500ms`: Degraded 2G / Congested tower
* **Failure Injection Rate**:
  - `0%`: All requests succeed
  - `25%`, `50%`, `100%`: Injects randomized 503 or 500 network errors
* **Offline Switch**: Toggles `simulationConfig.offline = true`, forcing all API calls to fail immediately with `HttpResponse.error()`.
* **Mock Database Reset**: Single-click button that restores the 1,000+ transaction ledger and merchant balance to initial state (`₦3,845,250.00`).

---

## 6. Testing Strategy & Verification Commands

The codebase maintains a dual-tier testing setup with 100% pass rate:

### Automated Test Commands
```bash
# Run all 52 unit and integration tests (Vitest)
npm test

# Run tests in watch mode
npm run test:watch

# Run all Playwright E2E suites (Headless)
npm run test:e2e

# Run Playwright with interactive visual UI
npx playwright test --ui

# Validate TypeScript compilation without emitting files
npx tsc -p tsconfig.app.json --noEmit
```

### Test Suites Map
1. **`src/lib/__tests__/format-money.test.ts` (13 tests)**:
   - Validates integer kobo conversion, fractional formatting, zero balance, negative amounts, and NIP fee calculations.
2. **`src/lib/__tests__/utils.test.ts` (9 tests)**:
   - Validates XSS tag stripping (`<script>`, `<img>`), control character removal, spreadsheet formula neutralization, and NIBSS 50-character narration clamping.
3. **`src/features/dashboard/__tests__/BalanceCard.test.tsx` (7 tests)**:
   - Tests balance display, eye icon visibility toggle, in-card offline fallback, "Out of sync" cached state, and DailySummary inflow/outflow arithmetic.
4. **`src/features/send-money/__tests__/SendMoney.test.tsx` (6 tests)**:
   - Tests StepAmount chips, balance limit validation, review fee breakdown, PIN entry, full happy path, and optimistic rollback on simulated 500 error.
5. **`src/features/transactions/__tests__/TransactionFeed.test.tsx` (8 tests)**:
   - Tests row formatting, status badges, counterparty names, debounced search filtering, receipt modal copy actions, and error retry states.
6. **`src/components/layout/__tests__/SimulationBar.test.tsx` (7 tests)**:
   - Tests latency slider, failure rate chips, offline mode toggle, keyboard shortcut (`Ctrl+Shift+D`), and database reset.
7. **`src/components/__tests__/ThemeProvider.test.tsx` (2 tests)**:
   - Tests dark/light mode toggle and theme persistence.
8. **Playwright E2E Suites (`e2e/`)**:
   - `send-money.spec.ts`: Full real-browser transfer flow from hero CTA to receipt dismissal.
   - `send-money-failure.spec.ts`: 100% failure rate simulation verifying snapshot rollback in browser DOM.
   - `mobile-responsive.spec.ts`: 360px Android POS viewport compliance, 44px touch targets, and keyboard navigation.

---

## 7. Common Gotchas & Maintenance Tips

1. **Strict TypeScript Null Checks**:
   - Component props like `balance?: WalletBalance | null` must explicitly allow `null` if callers or mock tests pass `null`. Do not narrow it to only `undefined`.
2. **MSW Startup Timing in Development**:
   - When Vite boots or hot-reloads, `SendMoneyModal` mounts immediately. If `fetch('/api/banks')` fires a few milliseconds before MSW finishes claiming the page, Vite returns a 404. The UI gracefully displays *"Unable to load commercial banks directory"* with a **Retry** button. Simply clicking **Retry** fetches the banks cleanly without needing a full-page reload.
3. **Modal Backdrop Click**:
   - Modals intentionally do not close on backdrop click (`preventOutsideClick = true`). If you create a new dialog that *should* close on backdrop click, explicitly pass `preventOutsideClick={false}` to `DialogContent`.
4. **CSV Exporting**:
   - If extending the CSV export functionality in `TransactionFeed.tsx`, ensure all string columns pass through `sanitizeNarration` or `sanitizeText` to prevent Excel DDE / CSV injection attacks.
