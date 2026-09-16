import { WalletBalance } from '../types';
import { formatKoboToNaira } from '@/lib/format-money';
import { Card, CardContent } from '@/components/ui/card';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  CreditCard,
  Scale,
  TrendingUp,
} from 'lucide-react';

interface DailySummaryProps {
  balance?: WalletBalance;
  isLoading?: boolean;
}

export function DailySummary({ balance, isLoading }: DailySummaryProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#112240] p-5 space-y-3"
          >
            <div className="flex justify-between items-center">
              <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-lg" />
            </div>
            <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const inflowKobo = balance?.todayInflowKobo ?? 0;
  const outflowKobo = balance?.todayOutflowKobo ?? 0;
  // Lossless integer arithmetic for net daily flow
  const netFlowKobo = inflowKobo - outflowKobo;
  const pendingKobo = balance?.pendingSettlementKobo ?? 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* 1. Today's Inflow (Credits) */}
      <Card className="hover:border-emerald-500/40 transition-colors">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Today's Inflow
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <ArrowDownLeft className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-50 tabular-nums">
              {formatKoboToNaira(inflowKobo)}
            </div>
            <div className="flex items-center space-x-1.5 mt-1 text-[11px] text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-3 w-3" />
              <span>POS & QR Collections</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Today's Outflow (Debits) */}
      <Card className="hover:border-red-500/40 transition-colors">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Today's Outflow
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-50 tabular-nums">
              {formatKoboToNaira(outflowKobo)}
            </div>
            <div className="flex items-center space-x-1.5 mt-1 text-[11px] text-red-600 dark:text-red-400">
              <span>Transfers & Supplier Payouts</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Net Daily Flow */}
      <Card className="hover:border-blue-500/40 transition-colors">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Net Today
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <Scale className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div
              className={`text-xl sm:text-2xl font-bold tabular-nums ${
                netFlowKobo >= 0
                  ? 'text-slate-900 dark:text-slate-50'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              {formatKoboToNaira(netFlowKobo, { showSign: true })}
            </div>
            <div className="flex items-center space-x-1.5 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              <span>Net Liquidity Gain</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. Pending Settlement & POS Count */}
      <Card className="hover:border-amber-500/40 transition-colors">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Pending Settlement
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-50 tabular-nums">
              {formatKoboToNaira(pendingKobo)}
            </div>
            <div className="flex items-center space-x-1.5 mt-1 text-[11px] text-amber-600 dark:text-amber-400">
              <CreditCard className="h-3 w-3" />
              <span>4 Terminals • T+1 Settlement</span>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
