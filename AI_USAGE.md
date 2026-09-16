# FirstBank NovaBiz (FBN NovaPay) — AI Usage & Engineering Critique Report

## 1. Executive Summary

This report provides a transparent audit of AI-assisted engineering methodologies used during the development of the **FirstBank NovaBiz Merchant Dashboard (FBN NovaPay)**. While generative AI accelerated initial scaffolding and interface prototyping, critical domain requirements for banking rails, precision ledger integrity, and network fault tolerance required rigorous human-in-the-loop oversight, static analysis, and programmatic validation.

Below are three documented instances of AI prompts, initial generated outputs, critical financial/architectural hallucinations or pitfalls caught during review, and the production-grade engineering resolutions implemented.

---

## 2. Case Study 1: Financial Currency Engine & Floating-Point Precision

### 2.1 The Prompt
> *"Write a TypeScript helper function to format Nigerian Naira amounts and calculate transfer fees with VAT for the merchant transfer modal."*

### 2.2 Initial AI-Generated Output (Flawed)
```typescript
// AI-generated draft
export function calculateTransfer(amount: number) {
  const fee = 10.00;
  const vat = fee * 0.075; // 7.5% VAT = 0.75
  const total = amount + fee + vat;
  return {
    formattedTotal: `₦${total.toFixed(2)}`,
    totalAmount: total
  };
}
```

### 2.3 Hallucination & Vulnerability Critique
1. **IEEE-754 Floating-Point Arithmetic Corruption**:
   - In JavaScript/TypeScript, standard IEEE-754 binary floating-point representation causes cumulative rounding errors (e.g. `0.1 + 0.2 = 0.30000000000000004`, `50000.10 + 10.75 = 50010.850000000006`).
   - In banking ledgers, floating-point numbers lead to discrepancies during transaction reconciliation, tax auditing, and regulatory compliance.
2. **Missing Sub-unit Integer Representation**:
   - Currency must always be computed and stored as discrete sub-unit integers (Kobo, where $\text{₦}1 = 100\text{ Kobo}$).

### 2.4 Production Engineering Resolution (`src/lib/format-money.ts`)
We refactored all monetary operations to use strict 64-bit safe integer Kobo math:
```typescript
export const NIP_TRANSFER_FEE_KOBO = 1075; // ₦10.00 + ₦0.75 VAT = 1,075 Kobo
export const DAILY_TRANSFER_LIMIT_KOBO = 500000000; // ₦5,000,000.00

export function formatKoboToNaira(kobo: number): string {
  if (!Number.isFinite(kobo)) return '₦0.00';
  const isNegative = kobo < 0;
  const absKobo = Math.abs(Math.round(kobo));
  const naira = Math.floor(absKobo / 100);
  const remainingKobo = absKobo % 100;
  const formattedNaira = naira.toLocaleString('en-NG');
  const formattedKobo = remainingKobo.toString().padStart(2, '0');
  return `${isNegative ? '-' : ''}₦${formattedNaira}.${formattedKobo}`;
}

export function parseNairaInputToKobo(input: string): number {
  const sanitized = input.replace(/[^0-9.]/g, '');
  if (!sanitized) return 0;
  const parts = sanitized.split('.');
  const wholeNaira = parseInt(parts[0] || '0', 10);
  const koboStr = (parts[1] || '').slice(0, 2).padEnd(2, '0');
  const kobo = parseInt(koboStr, 10);
  return wholeNaira * 100 + kobo;
}
```

---

## 3. Case Study 2: Anti-Double-Spend Idempotency & Network Resilience

### 3.1 The Prompt
> *"Implement an API transfer mutation in React to send money from the wallet to a destination bank."*

### 3.2 Initial AI-Generated Output (Flawed)
```typescript
// AI-generated draft
export function useSendMoney() {
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/transfers/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.json();
    },
  });
}
```

### 3.3 Hallucination & Vulnerability Critique
1. **Double-Spend Vulnerability**:
   - In degraded mobile networks (e.g. 2G/3G in Nigeria), if a request times out after the server processes the debit, a merchant retry will submit a duplicate debit, causing irreversible double deductions.
2. **Missing RFC4122 Idempotency Headers**:
   - The AI failed to generate unique cryptographic/UUID idempotency keys per transfer attempt.
3. **No In-Memory / Distributed Replay Cache**:
   - The mock server did not maintain an idempotency registry to safely return cached transaction outcomes upon retries.

### 3.4 Production Engineering Resolution (`src/lib/idempotency.ts` & `src/mocks/handlers/transfers.ts`)
1. **RFC4122 v4 UUID Generation**:
```typescript
export function generateIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
```
2. **Server-Side Idempotency Interceptor**:
```typescript
const processedIdempotencyMap = new Map<string, SendMoneyResponse>();

// In MSW transfer handler:
const idempotencyKey = request.headers.get('Idempotency-Key') || body.idempotencyKey;
if (idempotencyKey && processedIdempotencyMap.has(idempotencyKey)) {
  const cachedResponse = processedIdempotencyMap.get(idempotencyKey)!;
  return HttpResponse.json(cachedResponse, { status: 200 });
}
```

---

## 4. Case Study 3: TanStack Query Optimistic Updates & Snapshot Rollback

### 4.1 The Prompt
> *"Add optimistic updates to the transfer flow so the wallet balance updates immediately without waiting for the backend."*

### 4.2 Initial AI-Generated Output (Flawed)
```typescript
// AI-generated draft
export function useSendMoney() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sendMoneyApi,
    onMutate: async (newTransfer) => {
      queryClient.setQueryData(['wallet', 'balance'], (old: any) => ({
        ...old,
        availableBalance: old.availableBalance - newTransfer.amount,
      }));
    },
  });
}
```

### 4.3 Hallucination & Vulnerability Critique
1. **In-Flight Query Race Condition**:
   - The AI omitted `await queryClient.cancelQueries()`. If an automatic background refetch completes while the mutation is in-flight, it overwrites the optimistic state, causing screen flickering.
2. **No Rollback Context (`onError` Snapshot)**:
   - If the network fails (e.g. MSW 100% failure rate simulation), the mutation throws, but the balance remains prematurely decremented, displaying an inaccurate financial balance to the merchant.
3. **Ledger Feed Out of Sync**:
   - The AI updated the balance card but did not optimistically prepend the pending transaction into the transaction feed.

### 4.4 Production Engineering Resolution (`src/features/send-money/hooks/useSendMoney.ts`)
```typescript
export function useSendMoney() {
  const queryClient = useQueryClient();

  return useMutation<SendMoneyResponse, Error, SendMoneyPayload, TransferContext>({
    mutationFn: sendMoney,

    onMutate: async (newTransfer) => {
      // 1. Cancel in-flight queries
      await queryClient.cancelQueries({ queryKey: ['wallet', 'balance'] });
      await queryClient.cancelQueries({ queryKey: ['transactions'] });

      // 2. Snapshot previous state
      const previousBalance = queryClient.getQueryData<WalletBalance>(['wallet', 'balance']);
      const previousTransactions = queryClient.getQueryData<Transaction[]>(['transactions']);

      const totalDebitKobo = newTransfer.amountKobo + newTransfer.feeKobo;

      // 3. Optimistically deduct balance
      if (previousBalance) {
        queryClient.setQueryData<WalletBalance>(['wallet', 'balance'], {
          ...previousBalance,
          availableBalanceKobo: Math.max(0, previousBalance.availableBalanceKobo - totalDebitKobo),
          ledgerBalanceKobo: previousBalance.ledgerBalanceKobo,
        });
      }

      // 4. Optimistically prepend transaction into virtualized ledger
      const optimisticTx: Transaction = {
        id: `optimistic-${Date.now()}`,
        reference: `FBN-OPT-${Date.now()}`,
        type: 'DEBIT',
        category: 'TRANSFER',
        amountKobo: newTransfer.amountKobo,
        feeKobo: newTransfer.feeKobo,
        narration: newTransfer.narration,
        recipientName: newTransfer.recipientName,
        recipientAccount: newTransfer.recipientAccount,
        recipientBankName: newTransfer.recipientBankName,
        senderName: 'Merchant Account',
        senderAccount: '3049281742',
        senderBankName: 'First Bank of Nigeria',
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        settledAt: null,
        channel: 'NIP_TRANSFER',
      };

      if (previousTransactions) {
        queryClient.setQueryData<Transaction[]>(['transactions'], [optimisticTx, ...previousTransactions]);
      }

      return { previousBalance, previousTransactions, optimisticTxId: optimisticTx.id };
    },

    onError: (_err, _newTransfer, context) => {
      // Safe rollback on simulated failure
      if (context?.previousBalance) {
        queryClient.setQueryData(['wallet', 'balance'], context.previousBalance);
      }
      if (context?.previousTransactions) {
        queryClient.setQueryData(['transactions'], context.previousTransactions);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet', 'balance'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}
```

---

## 5. Summary of AI Safety & Quality Safeguards

| Domain Area | AI Vulnerability Caught | Enforced Engineering Standard | Verification Suite |
|---|---|---|---|
| **Currency Math** | IEEE-754 floating-point rounding errors | Zero floating-point arithmetic; 100% discrete integer Kobo math | Vitest Unit Suite (13 tests) |
| **Idempotency** | Duplicate debits on network retry | RFC4122 v4 UUID headers + Map cache | Integration & E2E Suites |
| **State Rollback** | Incomplete mutation rollback | Dual query cancellation + Snapshot store | Vitest & Playwright E2E |
| **Feed Performance** | Unbounded DOM rendering of 1,000+ items | `react-window` 60fps feed virtualization | Manual & Performance Profiling |
| **Accessibility** | Missing focus traps, untagged buttons | WCAG 2.1 AA keyboard traps, ARIA live regions | Playwright A11y Suite |
