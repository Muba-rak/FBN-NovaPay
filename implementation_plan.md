# Implementation Plan: NovaBiz Merchant Dashboard (FirstBank NovaPay)

Building a high-performance, accessible, and production-ready React + TypeScript web application for the **FirstBank NovaBiz Merchant Dashboard**, fulfilling all functional requirements, non-negotiable hard constraints, AI usage reporting, and stretch differentiator goals.

## Architecture & Design Overview

### Visual & Brand Identity
- **FirstBank Visual Design System**: Bespoke, modern financial UI with FirstBank's signature Navy (`#002D62`, `#001A3A`), Deep Indigo (`#0B192C`), Royal Gold (`#D4AF37`, `#F59E0B`), Emerald Green (`#10B981` for inflows/credits), and Crimson/Coral (`#EF4444` for debits/failed).
- **Dark Mode Support**: Persisted dark/light theme toggle using CSS Custom Properties with high contrast and smooth transitions.
- **Responsive Layout**: Designed mobile-first from 360px (mobile Android POS/merchant phone) to 1440px+ (desktop merchant portal).
- **Typography & Polish**: Clean Inter font hierarchy, tabular numbers (`font-variant-numeric: tabular-nums`) for currency amounts, glassmorphism cards, micro-interactions, skeleton loaders, and tactile button states.

### Data Architecture & State Management
1. **Kobo Integer Precision Engine**:
   - All monetary values are strictly stored, transmitted, and calculated as 64-bit safe integers in **kobo** (1 Naira = 100 kobo).
   - Zero floating point drift (no `0.1 + 0.2 === 0.30000000000000004` bugs).
   - Formatted via `Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' })`.
2. **Server State & Optimistic Updates**:
   - `@tanstack/react-query` managing balance and transaction query caching, stale-time invalidation, and mutation lifecycles.
   - **Optimistic Send Money Flow**: Immediately deducts balance and appends the pending transaction to the feed with a generated UUID `Idempotency-Key`.
   - **Rollback Reconciliation**: If the API request fails or times out, TanStack Query `onError` seamlessly rolls back the cache to the previous snapshot (`queryClient.setQueryData`) and triggers an accessible `aria-live` error toast with retry capability.
3. **Mock API Layer (MSW + Simulation Control Panel)**:
   - Mock Service Worker (MSW) intercepting REST endpoints (`/api/wallet/balance`, `/api/transactions`, `/api/banks`, `/api/resolve-account`, `/api/transfer/send`, `/api/stats`).
   - Interactive **DevTools / Simulation Control Bar** in the UI:
     - Configurable simulated latency (0ms to 3000ms).
     - Configurable failure rate (0% to 100%).
     - Simulated offline / network error toggle.
     - Reset mock database button.
4. **Transaction Feed with High-Performance Virtualization**:
   - Virtualized infinite list via `@tanstack/react-virtual` allowing 1,000+ to 10,000+ items to render with steady 60fps and minimal DOM nodes.
   - Comprehensive filters: Date range (Today, Last 7 Days, Last 30 Days, Custom range), Transaction Status (`all`, `successful`, `pending`, `failed`), and Transaction Type (`all`, `credit`, `debit`).
   - Live debounced search by customer name, reference, or narration.
   - Detail drawer modal showing NIBSS Session ID, payment channel (QR, POS-lite, NIP Transfer, USSD *894#), and receipt download preview.
5. **Send Money Multi-Step Wizard**:
   - **Step 1 (Recipient)**: Beneficiary selection or bank picker + 10-digit NUBAN account input with real-time simulated NIBSS Name Inquiry resolution.
   - **Step 2 (Amount & Details)**: Amount input with live Naira-to-kobo conversion, quick-pick chips, balance validation, daily transfer limit warnings, fee calculation.
   - **Step 3 (Review & Summary)**: Clear breakdown of recipient, institution, amount, NIP fee (₦10.75), total debit, and security warning.
   - **Step 4 (Confirm & Authorize)**: 4-digit PIN authorization + Submit with unique `Idempotency-Key` header.
6. **Accessibility (WCAG AA) & Security**:
   - Keyboard accessible modals (focus lock, Escape to dismiss, Tab indexing).
   - Dynamic screen reader announcements (`aria-live="polite"` / `aria-live="assertive"`).
   - XSS sanitization (sanitized rendering of untrusted transaction descriptions).

---

## Proposed Changes

### 1. Project Initialization & Tooling
- Initialize Vite React + TypeScript project.
- Install dependencies:
  - `@tanstack/react-query` & `@tanstack/react-virtual`
  - `msw` (Mock Service Worker)
  - `lucide-react` (clean, accessible icons)
  - `clsx` (CSS class helper)
  - Testing: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `jsdom`, `@playwright/test`

### 2. Core Library & Utilities
#### [NEW] `src/utils/currency.ts`
- `koboToNaira(kobo: number): number`
- `nairaToKobo(naira: number | string): number`
- `formatNairaFromKobo(kobo: number, options?: { showKobo?: boolean }): string`
- `parseNairaInput(val: string): number` (kobo)
- Unit-tested edge cases (large amounts, zero, odd kobo amounts).

#### [NEW] `src/utils/security.ts`
- `sanitizeText(input: string): string` to prevent XSS in merchant descriptions / customer names.
- `generateIdempotencyKey(): string` (UUID v4 format).

#### [NEW] `src/types/index.ts`
- Data models for `MerchantWallet`, `Transaction`, `Bank`, `AccountResolution`, `SendMoneyPayload`, `FilterState`, `SimulationConfig`.

### 3. Mock Service Worker & Data Engine
#### [NEW] `src/mocks/handlers.ts`
- MSW handlers for wallet balance, 1,000+ realistic seed transactions, bank directory (FirstBank, GTBank, Zenith, Access, Kuda, OPay, Moniepoint, etc.), account name resolution, transfer execution with idempotency tracking.
#### [NEW] `src/mocks/browser.ts` & `src/mocks/seed.ts`
- Generator for 1,000+ diverse transaction history spanning POS collections, QR payments, USSD *894#, and outgoing transfers.
#### [NEW] `src/mocks/networkState.ts`
- Global config for dynamic failure rate, latency, and offline state simulation.

### 4. Design System & CSS
#### [NEW] `src/styles/design-tokens.css`
- FirstBank corporate color scheme, light/dark mode CSS variables, typography tokens, shadow layers, spacing tokens.
#### [NEW] `src/styles/global.css` & component CSS modules
- Resets, accessible focus outlines, skeleton shimmer animations, badge styling, modal overlays.

### 5. Components
#### [NEW] `src/components/Header/Header.tsx`
- FirstBank NovaBiz brand logo, KYC Tier 3 verified status pill, balance quick glance, live connection status, Dark Mode toggle, Quick Send Money action button.
#### [NEW] `src/components/BalanceSummary/BalanceSummary.tsx`
- Hero card displaying current balance in ₦ (formatted from kobo), Today's Inflow (credit), Today's Outflow (debit), Pending settlements, and Quick Actions (Send Money, Collect QR, Download Statement).
#### [NEW] `src/components/TransactionFeed/`
- `TransactionFeed.tsx`: Main container with filters bar, search input, summary stats, empty/error/loading states, and virtualized list.
- `TransactionVirtualList.tsx`: Virtualized scroller using `@tanstack/react-virtual` handling 1,000+ rows smoothly at 60fps.
- `TransactionRow.tsx`: Optimized, accessible transaction item with status pill, formatted currency, category icon, and click-to-view receipt drawer.
- `TransactionFilters.tsx`: Filter tabs (Date range, Status, Type, Search).
- `TransactionReceiptModal.tsx`: Slide-out / modal displaying NIBSS NIP reference, session ID, stamp of verification, and printable receipt.
#### [NEW] `src/components/SendMoney/`
- `SendMoneyModal.tsx`: Multi-step modal container with focus trap and keyboard navigation.
- `StepRecipient.tsx`: Bank selector + NUBAN account input + auto Name Inquiry resolution state + recent beneficiaries.
- `StepAmount.tsx`: Amount input in Naira (with live kobo conversion), balance checker, daily limit checker, quick chips, narration.
- `StepReview.tsx`: Summary of transfer, recipient details, transfer charges (₦10.75 NIP fee), total debit.
- `StepConfirm.tsx`: 4-digit Transaction PIN + submission with `Idempotency-Key`.
- `TransferStatusBanner.tsx`: Live region notification for in-flight optimistic update, success feedback, or error rollback with retry button.
#### [NEW] `src/components/SimulationControls/SimulationControlBar.tsx`
- Floating/collapsible bottom dev panel allowing reviewers to adjust mock latency (0-3000ms), toggle failure rate (0%, 25%, 50%, 100%), trigger simulated network disconnect, and reset mock state.
#### [NEW] `src/components/Common/`
- `Skeleton.tsx`, `Toast.tsx`, `Modal.tsx`, `Badge.tsx`, `Button.tsx`, `Input.tsx`.

### 6. Automated Testing
#### [NEW] `src/tests/currency.test.ts`
- Comprehensive tests for kobo/Naira conversion, formatting, floating point safety.
#### [NEW] `src/tests/SendMoney.test.tsx`
- Component tests for multi-step navigation, form validation, NIBSS resolution, optimistic UI update on submit, and rollback verification when mock API throws an error.
#### [NEW] `src/tests/TransactionFeed.test.tsx`
- Component tests for transaction filtering, search query filtering, empty states, and pagination/virtual list behavior.
#### [NEW] `e2e/send-money.spec.ts`
- Playwright end-to-end tests for complete Send Money flow, error rollback, and responsive viewport tests (360px mobile and 1440px desktop).

### 7. Documentation Deliverables
#### [NEW] `README.md`
- Complete documentation: Architecture, State Management rationale, Data Fetching approach, Kobo Integer handling, MSW mock layer, Running & Testing instructions, Trade-offs.
#### [NEW] `AI_USAGE.md`
- Full AI usage report: Tools used, 3 concrete prompts and outputs, detailed critique of AI hallucinations/bugs (e.g., floating point kobo math, optimistic update state desynchronization without snapshot rollback), and how they were caught & resolved.

---

## Verification Plan

### Automated Tests
1. **Unit & Component Tests**:
   - `npm run test` (Vitest with React Testing Library)
2. **End-to-End Tests**:
   - `npm run test:e2e` (Playwright)
3. **TypeScript & Lint Check**:
   - `npm run typecheck` / `npx tsc --noEmit`

### Manual & Interactive Verification
- Browser testing using Playwright subagent / browser verification:
  - 360px mobile viewport test (small screen responsiveness, drawer interactions, touch targets).
  - 1440px desktop viewport test (rich dashboard telemetry).
  - Send Money flow: complete a transfer and verify instant optimistic update in balance & transaction feed.
  - Failure scenario: crank failure rate to 100% in simulation bar, submit transfer, verify optimistic update reverts gracefully with clear error toast and no corrupted state.
  - Virtualization test: scroll through 1,000+ transactions smoothly.
  - Dark mode test: toggle theme and verify color contrast and persistent `localStorage` preference.
