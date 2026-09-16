import { useMutation, useQueryClient } from '@tanstack/react-query';
import { executeSendMoney } from '../api/sendMoneyApi';
import { SendMoneyPayload, SendMoneyResponse } from '../types';
import { WalletBalance } from '@/features/dashboard/types';
import { Transaction, TransactionsResponse } from '@/features/transactions/types';
import { NIP_TRANSFER_FEE_KOBO } from '@/lib/format-money';

interface SendMoneyMutationContext {
  previousBalance?: WalletBalance;
  previousTransactionsQueries: Array<[readonly unknown[], TransactionsResponse | undefined]>;
  tempId: string;
}

export function useSendMoney() {
  const queryClient = useQueryClient();

  return useMutation<SendMoneyResponse, Error, SendMoneyPayload, SendMoneyMutationContext>({
    mutationFn: (payload: SendMoneyPayload) => executeSendMoney(payload),

    onMutate: async (newTransfer) => {
      // 1. Cancel in-flight queries
      await queryClient.cancelQueries({ queryKey: ['wallet', 'balance'] });
      await queryClient.cancelQueries({ queryKey: ['transactions'] });

      // 2. Snapshot previous state
      const previousBalance = queryClient.getQueryData<WalletBalance>(['wallet', 'balance']);
      
      const transactionsQueries = queryClient.getQueriesData<TransactionsResponse>({
        queryKey: ['transactions'],
      });

      const totalDebitKobo = newTransfer.amountKobo + (newTransfer.feeKobo || NIP_TRANSFER_FEE_KOBO);
      const tempId = `temp-${Date.now()}`;

      // 3. Optimistically deduct Wallet Balance
      if (previousBalance) {
        queryClient.setQueryData<WalletBalance>(['wallet', 'balance'], {
          ...previousBalance,
          availableBalanceKobo: Math.max(0, previousBalance.availableBalanceKobo - totalDebitKobo),
          todayOutflowKobo: previousBalance.todayOutflowKobo + totalDebitKobo,
        });
      }

      // 4. Optimistically prepend Transaction to Transaction Feed
      const optimisticTx: Transaction = {
        id: tempId,
        reference: `OPT-${Date.now().toString().slice(-6)}`,
        idempotencyKey: newTransfer.idempotencyKey,
        type: 'debit',
        channel: 'nip_transfer',
        amountKobo: newTransfer.amountKobo,
        feeKobo: newTransfer.feeKobo || NIP_TRANSFER_FEE_KOBO,
        status: 'pending',
        recipientName: newTransfer.recipientName,
        recipientAccount: newTransfer.recipientAccount,
        recipientBankName: newTransfer.recipientBankName,
        narration: newTransfer.narration || 'Transfer from NovaBiz',
        createdAt: new Date().toISOString(),
      };

      transactionsQueries.forEach(([queryKey, oldData]) => {
        if (oldData) {
          queryClient.setQueryData<TransactionsResponse>(queryKey, {
            ...oldData,
            transactions: [optimisticTx, ...oldData.transactions],
            totalCount: oldData.totalCount + 1,
            filteredCount: oldData.filteredCount + 1,
            summary: {
              ...oldData.summary,
              totalVolumeKobo: oldData.summary.totalVolumeKobo + totalDebitKobo,
              debitCount: oldData.summary.debitCount + 1,
              debitVolumeKobo: oldData.summary.debitVolumeKobo + totalDebitKobo,
            },
          });
        }
      });

      return {
        previousBalance,
        previousTransactionsQueries: transactionsQueries,
        tempId,
      };
    },

    onError: (_err, _newTransfer, context) => {
      // Rollback Balance to snapshot
      if (context?.previousBalance) {
        queryClient.setQueryData(['wallet', 'balance'], context.previousBalance);
      }

      // Rollback Transaction queries to snapshot
      if (context?.previousTransactionsQueries) {
        context.previousTransactionsQueries.forEach(([queryKey, previousData]) => {
          queryClient.setQueryData(queryKey, previousData);
        });
      }
    },

    onSettled: () => {
      // Re-sync with server truth
      queryClient.invalidateQueries({ queryKey: ['wallet', 'balance'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}
