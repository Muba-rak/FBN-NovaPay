import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TransactionFiltersState, TransactionsResponse, DateRangeFilter, StatusFilter, TypeFilter } from '../types';

const defaultFilters: TransactionFiltersState = {
  dateRange: 'all',
  status: 'all',
  type: 'all',
  search: '',
  startDate: undefined,
  endDate: undefined,
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
    if (filters.startDate) params.set('startDate', filters.startDate);
    if (filters.endDate) params.set('endDate', filters.endDate);
    return params.toString();
  }, [filters.dateRange, filters.status, filters.type, debouncedSearch, filters.startDate, filters.endDate]);

  const query = useQuery<TransactionsResponse>({
    queryKey: [
      'transactions',
      filters.dateRange,
      filters.status,
      filters.type,
      debouncedSearch,
      filters.startDate,
      filters.endDate,
    ],
    queryFn: async () => {
      const res = await fetch(`/api/transactions?${queryParams}`);
      const contentType = res.headers.get('content-type') || '';
      if (!res.ok || !contentType.includes('application/json')) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch transaction records');
      }
      return res.json();
    },
    staleTime: 30_000,
  });

  const setDateRange = useCallback((dateRange: DateRangeFilter) => {
    setFilters((prev) => ({
      ...prev,
      dateRange,
      // If user switches away from custom, clear custom dates
      ...(dateRange !== 'custom' ? { startDate: undefined, endDate: undefined } : {}),
    }));
  }, []);

  const setStartDate = useCallback((startDate?: string) => {
    setFilters((prev) => ({
      ...prev,
      dateRange: 'custom',
      startDate,
    }));
  }, []);

  const setEndDate = useCallback((endDate?: string) => {
    setFilters((prev) => ({
      ...prev,
      dateRange: 'custom',
      endDate,
    }));
  }, []);

  const setCustomDateRange = useCallback((startDate?: string, endDate?: string) => {
    setFilters((prev) => ({
      ...prev,
      dateRange: 'custom',
      startDate,
      endDate,
    }));
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
      filters.search.trim().length > 0 ||
      !!filters.startDate ||
      !!filters.endDate
    );
  }, [filters]);

  return {
    ...query,
    filters,
    debouncedSearch,
    setDateRange,
    setStartDate,
    setEndDate,
    setCustomDateRange,
    setStatus,
    setType,
    setSearch,
    resetFilters,
    hasActiveFilters,
  };
}
