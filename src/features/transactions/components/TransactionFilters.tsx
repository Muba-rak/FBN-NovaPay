import { Search, X, Filter, RotateCcw, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  onStartDateChange?: (startDate?: string) => void;
  onEndDateChange?: (endDate?: string) => void;
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
  { label: 'Custom Range', value: 'custom' },
];

const statusOptions: { label: string; value: StatusFilter }[] = [
  { label: 'All Statuses', value: 'all' },
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
  onStartDateChange,
  onEndDateChange,
  onStatusChange,
  onTypeChange,
  onResetFilters,
  hasActiveFilters,
  totalFilteredCount,
}: TransactionFiltersProps) {
  return (
    <div className="space-y-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 p-4 transition-colors">
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
            className="pl-9 pr-9 text-sm bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-50"
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
        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
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
              className="h-8 gap-1.5 text-xs text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-800 dark:hover:text-amber-300"
            >
              <RotateCcw className="h-3 w-3" />
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      {/* Filter Dropdowns Controls */}
      <div className="pt-2.5 border-t border-slate-200/70 dark:border-slate-800/70 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0 uppercase tracking-wider">
            <Filter className="h-3.5 w-3.5 text-amber-500" />
            <span>Filter By:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1">
            {/* 1. Date Range Dropdown */}
            <div>
              <label htmlFor="filter-date-range" className="sr-only">
                Filter by date range
              </label>
              <Select
                value={filters.dateRange}
                onValueChange={(val) => onDateRangeChange(val as DateRangeFilter)}
              >
                <SelectTrigger
                  id="filter-date-range"
                  aria-label="Date Range filter"
                  className="w-full h-9 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 font-medium"
                >
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xl text-xs">
                  {dateOptions.map((opt) => (
                    <SelectItem
                      key={opt.value}
                      value={opt.value}
                      className="cursor-pointer text-xs"
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 2. Status Dropdown */}
            <div>
              <label htmlFor="filter-status" className="sr-only">
                Filter by transaction status
              </label>
              <Select
                value={filters.status}
                onValueChange={(val) => onStatusChange(val as StatusFilter)}
              >
                <SelectTrigger
                  id="filter-status"
                  aria-label="Status filter"
                  className="w-full h-9 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 font-medium"
                >
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xl text-xs">
                  {statusOptions.map((opt) => (
                    <SelectItem
                      key={opt.value}
                      value={opt.value}
                      className="cursor-pointer text-xs"
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 3. Type Dropdown */}
            <div>
              <label htmlFor="filter-type" className="sr-only">
                Filter by transaction type
              </label>
              <Select
                value={filters.type}
                onValueChange={(val) => onTypeChange(val as TypeFilter)}
              >
                <SelectTrigger
                  id="filter-type"
                  aria-label="Type filter"
                  className="w-full h-9 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 font-medium"
                >
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xl text-xs">
                  {typeOptions.map((opt) => (
                    <SelectItem
                      key={opt.value}
                      value={opt.value}
                      className="cursor-pointer text-xs"
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Custom Start Date and End Date Range Fields */}
        {filters.dateRange === 'custom' && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-2.5 border-t border-slate-200/60 dark:border-slate-800/60 animate-in fade-in-50 duration-200">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 shrink-0">
              <Calendar className="h-3.5 w-3.5 text-amber-500" />
              <span>Custom Date Range:</span>
            </div>

            <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              {/* Start Date */}
              <div className="flex items-center gap-2 flex-1">
                <label
                  htmlFor="tx-start-date"
                  className="text-xs font-semibold text-slate-600 dark:text-slate-400 shrink-0"
                >
                  Start:
                </label>
                <Input
                  id="tx-start-date"
                  type="date"
                  aria-label="Start date"
                  value={filters.startDate || ''}
                  onChange={(e) => onStartDateChange?.(e.target.value || undefined)}
                  className="h-8.5 text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-50 w-full font-mono"
                />
              </div>

              {/* End Date */}
              <div className="flex items-center gap-2 flex-1">
                <label
                  htmlFor="tx-end-date"
                  className="text-xs font-semibold text-slate-600 dark:text-slate-400 shrink-0"
                >
                  End:
                </label>
                <Input
                  id="tx-end-date"
                  type="date"
                  aria-label="End date"
                  min={filters.startDate}
                  value={filters.endDate || ''}
                  onChange={(e) => onEndDateChange?.(e.target.value || undefined)}
                  className="h-8.5 text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-50 w-full font-mono"
                />
              </div>

              {/* Clear Date Range */}
              {(filters.startDate || filters.endDate) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onStartDateChange?.(undefined);
                    onEndDateChange?.(undefined);
                  }}
                  className="h-8 text-xs text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 shrink-0"
                >
                  Clear Dates
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
