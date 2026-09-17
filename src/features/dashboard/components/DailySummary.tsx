import { WalletBalance } from "../types";
import { formatKoboToNaira } from "@/lib/format-money";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  CreditCard,
  Scale,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

interface DailySummaryProps {
  balance?: WalletBalance | null;
  isLoading?: boolean;
  isError?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export function DailySummary({
  balance,
  isLoading,
  isError,
  error: _error,
  onRetry,
  isRetrying,
}: DailySummaryProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#0b1736] p-5 space-y-3 shadow-xs"
          >
            <div className="flex justify-between items-center">
              <div className="h-3 w-24 bg-slate-100 dark:bg-slate-800 rounded" />
              <div className="h-8 w-8 bg-slate-100 dark:bg-slate-800 rounded-lg" />
            </div>
            <div className="h-6 w-32 bg-slate-100 dark:bg-slate-800 rounded" />
          </div>
        ))}
      </div>
    );
  }

  // Explicit Error State for Daily Telemetry
  if (isError && !balance) {
    return (
      <div
        role="alert"
        aria-live="assertive"
        className="rounded-2xl border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/30 p-5 text-left transition-all"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50">
                Settlement telemetry temporarily unavailable
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Could not load today's inflow and outflow breakdown. Click retry to refresh your figures.
              </p>
            </div>
          </div>
          {onRetry && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRetry}
              disabled={isRetrying}
              className="h-8 gap-1.5 text-xs text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800 bg-white dark:bg-slate-900 hover:bg-amber-50 dark:hover:bg-amber-950/40 shrink-0 cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRetrying ? "animate-spin" : ""}`} />
              <span>{isRetrying ? "Retrying..." : "Retry Breakdown"}</span>
            </Button>
          )}
        </div>
      </div>
    );
  }

  const inflowKobo = balance?.todayInflowKobo ?? 0;
  const outflowKobo = balance?.todayOutflowKobo ?? 0;
  // Lossless integer arithmetic for net daily flow
  const netFlowKobo = inflowKobo - outflowKobo;
  const pendingKobo = balance?.pendingSettlementKobo ?? 0;

  const summaryItems = [
    {
      id: "inflow",
      label: "Today's Inflow",
      amount: formatKoboToNaira(inflowKobo),
      amountClassName: "text-slate-900 dark:text-slate-50",
      icon: ArrowDownLeft,
      iconContainerClassName:
        "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-900/60",
      cardHoverClassName: "hover:border-emerald-400/60 dark:hover:border-emerald-500/60",
      subtitle: (
        <div className="flex items-center space-x-1.5 mt-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
          <TrendingUp className="h-3 w-3" />
          <span>POS & QR Collections</span>
        </div>
      ),
    },
    {
      id: "outflow",
      label: "Today's Outflow",
      amount: formatKoboToNaira(outflowKobo),
      amountClassName: "text-slate-900 dark:text-slate-50",
      icon: ArrowUpRight,
      iconContainerClassName: "bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 border-red-200/60 dark:border-red-900/60",
      cardHoverClassName: "hover:border-red-400/60 dark:hover:border-red-500/60",
      subtitle: (
        <div className="flex items-center space-x-1.5 mt-1 text-[11px] font-medium text-red-600 dark:text-red-400">
          <span>Transfers & Supplier Payouts</span>
        </div>
      ),
    },
    {
      id: "net-flow",
      label: "Net Today",
      amount: formatKoboToNaira(netFlowKobo, { showSign: true }),
      amountClassName: netFlowKobo >= 0 ? "text-[#002D62] dark:text-[#D4AF37]" : "text-red-600 dark:text-red-400",
      icon: Scale,
      iconContainerClassName: "bg-blue-50 dark:bg-blue-950/50 text-[#002D62] dark:text-blue-300 border-blue-200/60 dark:border-blue-900/60",
      cardHoverClassName: "hover:border-[#002D62]/40 dark:hover:border-blue-400/40",
      subtitle: (
        <div className="flex items-center space-x-1.5 mt-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
          <span>Net Liquidity Balance</span>
        </div>
      ),
    },
    {
      id: "pending-settlement",
      label: "Pending Settlement",
      amount: formatKoboToNaira(pendingKobo),
      amountClassName: "text-slate-900 dark:text-slate-50",
      icon: Clock,
      iconContainerClassName: "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-200/60 dark:border-amber-900/60",
      cardHoverClassName: "hover:border-amber-400/60 dark:hover:border-amber-500/60",
      subtitle: (
        <div className="flex items-center space-x-1.5 mt-1 text-[11px] font-medium text-amber-700 dark:text-amber-400">
          <CreditCard className="h-3 w-3" />
          <span>4 Terminals • T+1 Settlement</span>
        </div>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {summaryItems.map((item) => {
        const Icon = item.icon;
        return (
          <Card
            key={item.id}
            className={`${item.cardHoverClassName} hover:shadow-sm transition-all`}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between p-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-white uppercase tracking-wider">
                  {item.label}
                </span>
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-xl border shadow-2xs ${item.iconContainerClassName}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2.5">
                <div
                  className={`text-xl sm:text-2xl font-black dark:text-white tabular-nums tracking-tight ${item.amountClassName}`}
                >
                  {item.amount}
                </div>
                {item.subtitle}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
