import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchBanks, fetchBeneficiaries, resolveAccountName } from '../api/sendMoneyApi';
import { Bank, Beneficiary, AccountResolutionResult } from '../types';

export function useBanks() {
  return useQuery<Bank[]>({
    queryKey: ['banks'],
    queryFn: fetchBanks,
    staleTime: 1000 * 60 * 60, // 1 hour cache
  });
}

export function useBeneficiaries() {
  return useQuery<Beneficiary[]>({
    queryKey: ['beneficiaries'],
    queryFn: fetchBeneficiaries,
    staleTime: 1000 * 60 * 5, // 5 min cache
  });
}

export function useResolveAccount() {
  return useMutation<
    AccountResolutionResult,
    Error,
    { accountNumber: string; bankCode: string }
  >({
    mutationFn: ({ accountNumber, bankCode }) =>
      resolveAccountName(accountNumber, bankCode),
  });
}
