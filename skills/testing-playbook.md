# Testing Playbook for NovaBiz (Vitest, RTL & Playwright)

This playbook outlines testing strategies, assertion patterns, and mock server practices to catch regressions in financial workflows.

---

## 1. Component Testing with Vitest + React Testing Library

### Testing the Send Money Multi-Step Flow
1. **Step Navigation**: Assert user can fill in bank and account number, verify simulated NIBSS resolution appears, and proceed to next step.
2. **Form Validation**:
   - Assert error appears when account number is $<10$ digits.
   - Assert error appears when amount is $\le 0$ or exceeds available balance.
3. **Optimistic UI Verification**:
   - When user confirms transfer, assert balance decreases immediately and pending transaction row is rendered before network responds.
4. **Rollback Verification on Failure**:
   - Use `server.use(http.post('/api/transfers/send', () => HttpResponse.json({ message: 'Failed' }, { status: 500 })))`.
   - Submit transfer.
   - Assert error alert appears with `role="alert"`.
   - Assert balance reverts back to original amount.

---

## 2. Playwright End-to-End (E2E) Testing

### Key E2E Scenarios:
1. `e2e/send-money.spec.ts`:
   - Load dashboard.
   - Click "Send Money".
   - Select bank, enter valid 10-digit NUBAN (`0123456789`).
   - Expect recipient name "CHINEDU AHMADU BELLO" to resolve.
   - Enter amount `₦5,000`.
   - Review fee (`₦10.75`) and total (`₦5,010.75`).
   - Enter PIN `1234` and submit.
   - Assert transfer success confirmation and updated transaction feed.
2. `e2e/send-money-failure.spec.ts`:
   - Configure simulated failure rate to 100%.
   - Submit transfer.
   - Verify optimistic balance decrement is rolled back and error banner is displayed.
