# Optimistic UI & Rollback Reconciliation Skill Guide

This guide details the TanStack Query mutation pattern for instant optimistic updates and fail-safe rollback reconciliation in financial workflows.

---

## 1. The Optimistic Transfer Lifecycle

When a merchant submits a transfer:
1. **Instant UI Response (`onMutate`)**:
   - Cancel any outgoing refetches for queries so they don't overwrite optimistic data (`queryClient.cancelQueries`).
   - Snapshot previous cache states for both `['wallet', 'balance']` and `['transactions']`.
   - Optimistically decrement the balance by `amount + fee`.
   - Optimistically prepend a temporary `status: 'pending'` / `'sending'` transaction with generated `Idempotency-Key` to the top of the feed.
   - Return `{ previousBalance, previousTransactions, tempId }` context.
2. **On Failure / Timeout (`onError`)**:
   - Reconcile the cache back to the exact snapshot using `queryClient.setQueryData`.
   - Mark the optimistic transaction as `status: 'failed'` (or display a high-priority toast/alert with Retry capability).
   - Announce the failure via `aria-live="assertive"`.
3. **On Success (`onSuccess`)**:
   - Update the temporary transaction to `status: 'successful'` with confirmed NIBSS session ID.
4. **Settled Sync (`onSettled`)**:
   - Invalidate queries `queryClient.invalidateQueries({ queryKey: [...] })` to sync server truth.

---

## 2. TanStack Query Mutation Pattern

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sendMoneyApi } from '../api/send-money.api';
import { SendMoneyPayload } from '../types';
import { WalletBalance } from '@/features/dashboard/types';
import { Transaction } from '@/features/transactions/types';

export function useSendMoney() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SendMoneyPayload) => sendMoneyApi(payload),

    onMutate: async (newTransfer) => {
      // 1. Cancel in-flight queries
      await queryClient.cancelQueries({ queryKey: ['wallet', 'balance'] });
      await queryClient.cancelQueries({ queryKey: ['transactions'] });

      // 2. Snapshot previous values
      const previousBalance = queryClient.getQueryData<WalletBalance>(['wallet', 'balance']);
      const previousTransactions = queryClient.getQueryData<Transaction[]>(['transactions']);

      const totalDebitKobo = newTransfer.amountKobo + (newTransfer.feeKobo || 1075);
      const tempId = `temp-${Date.now()}`;

      // 3. Optimistically update Balance
      if (previousBalance) {
        queryClient.setQueryData<WalletBalance>(['wallet', 'balance'], {
          ...previousBalance,
          availableBalanceKobo: Math.max(0, previousBalance.availableBalanceKobo - totalDebitKobo),
          ledgerBalanceKobo: previousBalance.ledgerBalanceKobo,
          todayOutflowKobo: previousBalance.todayOutflowKobo + totalDebitKobo,
        });
      }

      // 4. Optimistically prepend Transaction
      const optimisticTx: Transaction = {
        id: tempId,
        reference: `OPT-${Date.now().toString().slice(-6)}`,
        idempotencyKey: newTransfer.idempotencyKey,
        type: 'debit',
        channel: 'nip_transfer',
        amountKobo: newTransfer.amountKobo,
        feeKobo: newTransfer.feeKobo || 1075,
        status: 'pending',
        recipientName: newTransfer.recipientName,
        recipientAccount: newTransfer.recipientAccount,
        recipientBankName: newTransfer.recipientBankName,
        narration: newTransfer.narration || 'Transfer from NovaBiz',
        createdAt: new Date().toISOString(),
      };

      if (previousTransactions) {
        queryClient.setQueryData<Transaction[]>(['transactions'], [
          optimisticTx,
          ...previousTransactions,
        ]);
      }

      return { previousBalance, previousTransactions, tempId };
    },

    onError: (err, newTransfer, context) => {
      // Rollback to previous state
      if (context?.previousBalance) {
        queryClient.setQueryData(['wallet', 'balance'], context.previousBalance);
      }
      if (context?.previousTransactions) {
        queryClient.setQueryData(['transactions'], context.previousTransactions);
      }
    },

    onSettled: () => {
      // Invalidate to guarantee true state
      queryClient.invalidateQueries({ queryKey: ['wallet', 'balance'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}
```
