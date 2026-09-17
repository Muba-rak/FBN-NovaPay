import { useState } from 'react';
import { useTransactions } from '../hooks/useTransactions';
import { TransactionFilters } from './TransactionFilters';
import { TransactionList } from './TransactionList';
import { TransactionReceiptModal } from './TransactionReceiptModal';
import { Transaction } from '../types';
import { formatKoboToNaira } from '@/lib/format-money';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Download,
  History,
  RefreshCw,
  SearchX,
  SlidersHorizontal,
} from 'lucide-react';

interface TransactionFeedProps {
  onOpenSendMoney?: () => void;
}

export function TransactionFeed({ onOpenSendMoney }: TransactionFeedProps) {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
    filters,
    setDateRange,
    setStartDate,
    setEndDate,
    setStatus,
    setType,
    setSearch,
    resetFilters,
    hasActiveFilters,
  } = useTransactions();

  const { toast } = useToast();
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const transactions = data?.transactions || [];
  const summary = data?.summary;
  const filteredCount = data?.filteredCount ?? 0;

  const handleExportCSV = () => {
    toast({
      type: 'success',
      title: 'Exporting Transaction Ledger',
      description: `Downloading ${filteredCount.toLocaleString()} transactions as CSV.`,
    });
  };

  return (
    <section
      aria-labelledby="transaction-feed-heading"
      className="space-y-5 rounded-3xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#0b1736] p-4 sm:p-6 shadow-xs transition-colors"
    >
      {/* Feed Title & Quick Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#002D62] text-[#D4AF37] shadow-2xs">
            <History className="h-5 w-5" />
          </div>
          <div>
            <h2
              id="transaction-feed-heading"
              className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-50"
            >
              Transaction Ledger
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live NIBSS NIP & POS Real-Time Settlement Audit Trail
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-8 gap-1.5 text-xs text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800"
            aria-label="Refresh transaction ledger"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            <span className="hidden xs:inline">Sync</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={transactions.length === 0}
            className="h-8 gap-1.5 text-xs text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800"
            aria-label="Download transactions as CSV"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden xs:inline">Export CSV</span>
          </Button>
        </div>
      </div>

      {/* Filtered Telemetry Summary Bar */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5">
          {/* Total Inflow Volume */}
          <div className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/60 p-3">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Inflows ({summary.creditCount})</span>
              <ArrowDownLeft className="h-3.5 w-3.5 text-emerald-500" />
            </div>
            <div className="mt-1 font-mono font-bold text-sm sm:text-base text-emerald-600 dark:text-emerald-400 tracking-tight">
              {formatKoboToNaira(summary.creditVolumeKobo)}
            </div>
          </div>

          {/* Total Outflow Volume */}
          <div className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/60 p-3">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Outflows ({summary.debitCount})</span>
              <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" />
            </div>
            <div className="mt-1 font-mono font-bold text-sm sm:text-base text-slate-900 dark:text-slate-50 tracking-tight">
              {formatKoboToNaira(summary.debitVolumeKobo)}
            </div>
          </div>

          {/* Net Flow Volume (Hidden on small mobile, visible on desktop) */}
          <div className="col-span-2 lg:col-span-1 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/60 p-3">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Net Settlement Flow</span>
              <SlidersHorizontal className="h-3.5 w-3.5 text-amber-500" />
            </div>
            <div
              className={`mt-1 font-mono font-bold text-sm sm:text-base tracking-tight ${
                summary.creditVolumeKobo - summary.debitVolumeKobo >= 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              {formatKoboToNaira(summary.creditVolumeKobo - summary.debitVolumeKobo, {
                showSign: true,
              })}
            </div>
          </div>
        </div>
      )}

      {/* Interactive Filters Bar */}
      <TransactionFilters
        filters={filters}
        onSearchChange={setSearch}
        onDateRangeChange={setDateRange}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onStatusChange={setStatus}
        onTypeChange={setType}
        onResetFilters={resetFilters}
        hasActiveFilters={hasActiveFilters}
        totalFilteredCount={filteredCount}
      />

      {/* Screen Reader Live Announcement */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {!isLoading &&
          `Showing ${filteredCount} transactions for ${
            filters.dateRange === 'custom' && (filters.startDate || filters.endDate)
              ? `custom range ${filters.startDate || 'start'} to ${filters.endDate || 'now'}`
              : filters.dateRange
          } date range and ${filters.status} status.`}
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <LoadingState message="Synchronizing 1,000+ transaction audit trail..." rows={6} />
      ) : isError ? (
        <ErrorState
          title="Unable to load transaction history"
          message="We couldn't synchronize your transaction ledger. This is usually temporary — please check your connection or try again."
          onRetry={() => refetch()}
          isRetrying={isFetching}
          retryLabel="Retry Loading Transactions"
        />
      ) : transactions.length === 0 ? (
        <EmptyState
          icon={<SearchX className="h-6 w-6" />}
          title={
            hasActiveFilters
              ? 'No transactions found matching your criteria'
              : 'Your transaction ledger is ready'
          }
          description={
            hasActiveFilters
              ? 'Try expanding your date range, clearing your search keywords, or resetting your status filters.'
              : "You haven't made or received any payments yet. Tap below to initiate your first transfer."
          }
          actionLabel={hasActiveFilters ? 'Clear All Filters' : onOpenSendMoney ? 'Make a Transfer' : undefined}
          onAction={hasActiveFilters ? resetFilters : onOpenSendMoney}
        />
      ) : (
        <TransactionList
          transactions={transactions}
          onSelectTransaction={(tx) => setSelectedTx(tx)}
          height={580}
        />
      )}

      {/* Transaction Details & Receipt Modal */}
      <TransactionReceiptModal
        transaction={selectedTx}
        isOpen={!!selectedTx}
        onClose={() => setSelectedTx(null)}
      />
    </section>
  );
}
