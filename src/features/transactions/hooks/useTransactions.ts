import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TransactionFiltersState, TransactionsResponse, DateRangeFilter, StatusFilter, TypeFilter } from '../types';

const defaultFilters: TransactionFiltersState = {
  dateRange: 'all',
  status: 'all',
  type: 'all',
  search: '',
};

export function useTransactions() {
  const [filters, setFilters] = useState<TransactionFiltersState>(defaultFilters);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // 250ms search debounce as recommended in performance guide
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search.trim());
    }, 250);
    return () => clearTimeout(timer);
  }, [filters.search]);

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.dateRange !== 'all') params.set('dateRange', filters.dateRange);
    if (filters.status !== 'all') params.set('status', filters.status);
    if (filters.type !== 'all') params.set('type', filters.type);
    if (debouncedSearch) params.set('search', debouncedSearch);
    return params.toString();
  }, [filters.dateRange, filters.status, filters.type, debouncedSearch]);

  const query = useQuery<TransactionsResponse>({
    queryKey: ['transactions', filters.dateRange, filters.status, filters.type, debouncedSearch],
    queryFn: async () => {
      const res = await fetch(`/api/transactions?${queryParams}`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch transaction records');
      }
      return res.json();
    },
    staleTime: 30_000,
  });

  const setDateRange = useCallback((dateRange: DateRangeFilter) => {
    setFilters((prev) => ({ ...prev, dateRange }));
  }, []);

  const setStatus = useCallback((status: StatusFilter) => {
    setFilters((prev) => ({ ...prev, status }));
  }, []);

  const setType = useCallback((type: TypeFilter) => {
    setFilters((prev) => ({ ...prev, type }));
  }, []);

  const setSearch = useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const hasActiveFilters = useMemo(() => {
    return (
      filters.dateRange !== 'all' ||
      filters.status !== 'all' ||
      filters.type !== 'all' ||
      filters.search.trim().length > 0
    );
  }, [filters]);

  return {
    ...query,
    filters,
    debouncedSearch,
    setDateRange,
    setStatus,
    setType,
    setSearch,
    resetFilters,
    hasActiveFilters,
  };
}
