---
name: e2e-tester
description: Automated Playwright and cross-browser testing for FirstBank NovaBiz merchant flows across 360px mobile POS and 1440px desktop viewports.
---

# E2E Tester Agent & Skill Guide

This agent runs end-to-end user journeys using Playwright, verifying responsive rendering, multi-step transfers, and failure rollbacks.

---

## 1. Key Test Scenarios

### Scenario A: Send Money Happy Path
1. Navigate to `/`.
2. Click **Send Money** CTA in Header or Balance Card.
3. Select **First Bank of Nigeria** and enter account number `0123456789`.
4. Wait for simulated NIBSS Name Inquiry to resolve `CHINEDU AHMADU BELLO`.
5. Enter amount `₦5,000` and optional narration.
6. Review transfer details and NIP fee (`₦10.75`).
7. Enter PIN `1234` and authorize.
8. Assert **Transfer Successful** modal and verify balance deduction.

### Scenario B: 100% Simulated Failure & Snapshot Rollback
1. Set simulated failure rate to `100%` in DevTools bar.
2. Submit a transfer of `₦10,000`.
3. Assert optimistic balance decrement occurs immediately.
4. Assert error alert appears: `NIBSS switch connection timed out`.
5. Assert wallet balance reverts back to original amount with zero corruption.

### Scenario C: Mobile POS Viewport (360px)
1. Run Playwright with `viewport: { width: 360, height: 800 }`.
2. Verify bottom navigation bar, touch targets $\ge 44\text{px}$, and horizontal scrolling chips.

---

## 2. Command Execution
```bash
# Run all E2E tests
npm run test:e2e

# Run with interactive UI
npx playwright test --ui
```
