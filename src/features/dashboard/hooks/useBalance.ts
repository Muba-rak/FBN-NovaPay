import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { WalletBalance } from '../types';

export function useBalance() {
  const query = useQuery<WalletBalance>({
    queryKey: ['wallet', 'balance'],
    queryFn: () => apiClient<WalletBalance>('/api/wallet/balance'),
    staleTime: 1000 * 15, // 15 seconds
  });

  return {
    balance: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
