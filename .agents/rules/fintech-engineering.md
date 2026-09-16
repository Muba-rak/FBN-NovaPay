# FirstBank NovaBiz — Fintech Engineering & Architectural Rules

This rule defines mandatory engineering standards, data integrity constraints, and security conventions across the NovaBiz codebase.

---

## 1. Monetary Precision (The Golden Kobo Rule)
- **Zero Floating-Point Math**: All monetary amounts throughout the application (state, network payloads, mock data, and calculations) MUST be represented and stored as 64-bit safe integers in **kobo** (1 Naira = 100 kobo).
- Floating-point calculations (`0.1 + 0.2`) are strictly prohibited in business logic.
- UI formatting to Naira (`₦`) must always use `formatKoboToNaira()` from `@/lib/format-money`.
- User Naira input must always be parsed using `parseNairaInputToKobo()`.

---

## 2. Idempotency & Anti-Double-Spend Protection
- Every fund transfer initiation MUST generate a unique RFC4122 v4 UUID `Idempotency-Key` on the client when entering the transfer flow.
- The `Idempotency-Key` header must be sent with all `POST /api/transfers/send` requests.
- Automatic or manual retries MUST reuse the exact same `Idempotency-Key`.

---

## 3. Optimistic UI & Reversal Rollback
- All mutations modifying wallet balances or transaction feeds must use TanStack Query's `onMutate` snapshot pattern.
- In-flight queries must be cancelled prior to setting optimistic cache data.
- If a request fails, times out, or the network is disconnected, `onError` MUST restore the exact snapshot and announce the failure via `aria-live="assertive"`.

---

## 4. Accessibility (WCAG 2.1 AA)
- **High-Contrast Focus Indicators**: Visible 2px outline with minimum 3:1 contrast against backgrounds.
- **Keyboard Navigation**: All multi-step flows and interactive dialogs must support `Tab`, `Shift+Tab`, `Enter`, `Space`, and `Escape`.
- **Screen Reader Live Regions**: Dynamic updates must use `aria-live="polite"` (for non-disruptive feedback like search counts) and `aria-live="assertive"` + `role="alert"` (for errors/rollbacks).
- **Minimum Touch Targets**: All mobile buttons, tabs, and interactive chips must be at least $44 \times 44\text{px}$ on mobile screens (360px width).
