import { WalletBalance } from "../types";
import { formatKoboToNaira } from "@/lib/format-money";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  CreditCard,
  Scale,
  TrendingUp,
} from "lucide-react";

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
            className="h-28 rounded-2xl border border-slate-200/90 bg-white p-5 space-y-3 shadow-xs"
          >
            <div className="flex justify-between items-center">
              <div className="h-3 w-24 bg-slate-100 rounded" />
              <div className="h-8 w-8 bg-slate-100 rounded-lg" />
            </div>
            <div className="h-6 w-32 bg-slate-100 rounded" />
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

  const summaryItems = [
    {
      id: "inflow",
      label: "Today's Inflow",
      amount: formatKoboToNaira(inflowKobo),
      amountClassName: "text-slate-900",
      icon: ArrowDownLeft,
      iconContainerClassName:
        "bg-emerald-50 text-emerald-600 border-emerald-200/60",
      cardHoverClassName: "hover:border-emerald-400/60",
      subtitle: (
        <div className="flex items-center space-x-1.5 mt-1 text-[11px] font-medium text-emerald-600">
          <TrendingUp className="h-3 w-3" />
          <span>POS & QR Collections</span>
        </div>
      ),
    },
    {
      id: "outflow",
      label: "Today's Outflow",
      amount: formatKoboToNaira(outflowKobo),
      amountClassName: "text-slate-900",
      icon: ArrowUpRight,
      iconContainerClassName: "bg-red-50 text-red-600 border-red-200/60",
      cardHoverClassName: "hover:border-red-400/60",
      subtitle: (
        <div className="flex items-center space-x-1.5 mt-1 text-[11px] font-medium text-red-600">
          <span>Transfers & Supplier Payouts</span>
        </div>
      ),
    },
    {
      id: "net-flow",
      label: "Net Today",
      amount: formatKoboToNaira(netFlowKobo, { showSign: true }),
      amountClassName: netFlowKobo >= 0 ? "text-[#002D62]" : "text-red-600",
      icon: Scale,
      iconContainerClassName: "bg-blue-50 text-[#002D62] border-blue-200/60",
      cardHoverClassName: "hover:border-[#002D62]/40",
      subtitle: (
        <div className="flex items-center space-x-1.5 mt-1 text-[11px] font-medium text-slate-500">
          <span>Net Liquidity Balance</span>
        </div>
      ),
    },
    {
      id: "pending-settlement",
      label: "Pending Settlement",
      amount: formatKoboToNaira(pendingKobo),
      amountClassName: "text-slate-900",
      icon: Clock,
      iconContainerClassName: "bg-amber-50 text-amber-700 border-amber-200/60",
      cardHoverClassName: "hover:border-amber-400/60",
      subtitle: (
        <div className="flex items-center space-x-1.5 mt-1 text-[11px] font-medium text-amber-700">
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
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
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
                  className={`text-xl sm:text-2xl font-black tabular-nums tracking-tight ${item.amountClassName}`}
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
