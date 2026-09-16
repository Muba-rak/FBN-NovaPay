import { Search, X, Filter, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  TransactionFiltersState,
  DateRangeFilter,
  StatusFilter,
  TypeFilter,
} from '../types';

interface TransactionFiltersProps {
  filters: TransactionFiltersState;
  onSearchChange: (search: string) => void;
  onDateRangeChange: (dateRange: DateRangeFilter) => void;
  onStatusChange: (status: StatusFilter) => void;
  onTypeChange: (type: TypeFilter) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
  totalFilteredCount?: number;
}

const dateOptions: { label: string; value: DateRangeFilter }[] = [
  { label: 'All Time', value: 'all' },
  { label: 'Today', value: 'today' },
  { label: 'Last 7 Days', value: '7d' },
  { label: 'Last 30 Days', value: '30d' },
];

const statusOptions: { label: string; value: StatusFilter }[] = [
  { label: 'All Status', value: 'all' },
  { label: 'Successful', value: 'successful' },
  { label: 'Pending', value: 'pending' },
  { label: 'Failed', value: 'failed' },
];

const typeOptions: { label: string; value: TypeFilter }[] = [
  { label: 'All Types', value: 'all' },
  { label: 'Credits (Inflow)', value: 'credit' },
  { label: 'Debits (Outflow)', value: 'debit' },
];

export function TransactionFilters({
  filters,
  onSearchChange,
  onDateRangeChange,
  onStatusChange,
  onTypeChange,
  onResetFilters,
  hasActiveFilters,
  totalFilteredCount,
}: TransactionFiltersProps) {
  return (
    <div className="space-y-3 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 p-4">
      {/* Top Row: Search & Reset */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        {/* Search Bar */}
        <div className="relative flex-1">
          <label htmlFor="tx-search" className="sr-only">
            Search transactions by name, reference, or narration
          </label>
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            id="tx-search"
            type="text"
            placeholder="Search by customer, reference, terminal ID..."
            value={filters.search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-9 text-sm"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              aria-label="Clear search input"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Results Counter & Reset Button */}
        <div className="flex items-center justify-between sm:justify-end gap-2">
          {totalFilteredCount !== undefined && (
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 px-1">
              <span className="font-bold text-slate-900 dark:text-slate-50 tabular-nums">
                {totalFilteredCount.toLocaleString()}
              </span>{' '}
              records
            </span>
          )}

          {hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onResetFilters}
              className="h-8 gap-1.5 text-xs text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-800"
            >
              <RotateCcw className="h-3 w-3" />
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      {/* Filter Chips / Segments */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200/70 dark:border-slate-800/70">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 mr-1 uppercase tracking-wider">
          <Filter className="h-3.5 w-3.5" />
          <span>Filters:</span>
        </div>

        {/* Date Range Chips */}
        <div className="flex flex-wrap gap-1" role="group" aria-label="Date range filter">
          {dateOptions.map((opt) => {
            const isSelected = filters.dateRange === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onDateRangeChange(opt.value)}
                aria-pressed={isSelected}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#002D62] dark:bg-[#D4AF37] text-white dark:text-slate-950 shadow-2xs font-semibold'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-950 dark:hover:text-slate-50 shadow-2xs'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block mx-1" />

        {/* Status Chips */}
        <div className="flex flex-wrap gap-1" role="group" aria-label="Status filter">
          {statusOptions.map((opt) => {
            const isSelected = filters.status === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onStatusChange(opt.value)}
                aria-pressed={isSelected}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#002D62] dark:bg-[#D4AF37] text-white dark:text-slate-950 shadow-2xs font-semibold'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-950 dark:hover:text-slate-50 shadow-2xs'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block mx-1" />

        {/* Type Chips */}
        <div className="flex flex-wrap gap-1" role="group" aria-label="Transaction type filter">
          {typeOptions.map((opt) => {
            const isSelected = filters.type === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onTypeChange(opt.value)}
                aria-pressed={isSelected}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#002D62] dark:bg-[#D4AF37] text-white dark:text-slate-950 shadow-2xs font-semibold'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-950 dark:hover:text-slate-50 shadow-2xs'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

