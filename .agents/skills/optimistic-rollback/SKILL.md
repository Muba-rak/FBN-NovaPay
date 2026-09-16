---
name: optimistic-rollback
description: TanStack Query optimistic updates, in-flight query cancellation, snapshot rollback reconciliation, and accessible error alerts.
---

# Optimistic UI & Reversal Rollback Skill Guide

This skill details the TanStack Query mutation pattern for instant optimistic updates and fail-safe rollback reconciliation in financial workflows.

---

## 1. The Optimistic Transfer Lifecycle

1. **Instant UI Response (`onMutate`)**:
   - Cancel outgoing queries for `['wallet', 'balance']` and `['transactions']`.
   - Snapshot previous cache states.
   - Optimistically decrement available balance by `amount + fee`.
   - Optimistically prepend a pending transaction to the feed.
   - Return `{ previousBalance, previousTransactions, tempId }`.
2. **On Failure / Timeout (`onError`)**:
   - Reconcile cache back to exact snapshot using `queryClient.setQueryData`.
   - Trigger screen reader alert via `aria-live="assertive"`.
3. **On Success (`onSuccess`)**:
   - Update temporary transaction to `status: 'successful'` with confirmed NIBSS session ID.
4. **Settled Sync (`onSettled`)**:
   - Invalidate queries to guarantee true server synchronization.
