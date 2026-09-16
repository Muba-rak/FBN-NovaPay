import React from "react";
import { Transaction } from "../types";
import { formatKoboToNaira } from "@/lib/format-money";
import { Badge } from "@/components/ui/badge";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  QrCode,
  Smartphone,
  Globe,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
} from "lucide-react";

interface TransactionRowProps {
  transaction: Transaction;
  onSelect: (tx: Transaction) => void;
}

function getChannelIcon(
  channel: Transaction["channel"],
  type: Transaction["type"],
) {
  switch (channel) {
    case "pos_terminal":
      return <CreditCard className="h-4 w-4" />;
    case "qr_code":
      return <QrCode className="h-4 w-4" />;
    case "ussd":
      return <Smartphone className="h-4 w-4" />;
    case "web_checkout":
      return <Globe className="h-4 w-4" />;
    case "nip_transfer":
    default:
      return type === "credit" ? (
        <ArrowDownLeft className="h-4 w-4" />
      ) : (
        <ArrowUpRight className="h-4 w-4" />
      );
  }
}

function getChannelLabel(channel: Transaction["channel"]): string {
  switch (channel) {
    case "pos_terminal":
      return "POS Terminal";
    case "qr_code":
      return "NovaBiz QR";
    case "ussd":
      return "USSD *894#";
    case "web_checkout":
      return "Web Pay";
    case "nip_transfer":
    default:
      return "NIP Transfer";
  }
}

function formatTransactionDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat("en-NG", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(d);
  } catch {
    return dateStr;
  }
}

export const TransactionRow = React.memo<TransactionRowProps>(
  ({ transaction, onSelect }) => {
    const isCredit = transaction.type === "credit";
    const isSuccessful = transaction.status === "successful";
    const isPending = transaction.status === "pending";
    const isFailed = transaction.status === "failed";

    const counterpartyName = isCredit
      ? transaction.senderName || "Anonymous Customer"
      : transaction.recipientName || "Beneficiary";

    const formattedAmount = formatKoboToNaira(transaction.amountKobo, {
      showSign: true,
    });

    return (
      <div
        role="button"
        tabIndex={0}
        onClick={() => onSelect(transaction)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect(transaction);
          }
        }}
        aria-label={`Transaction ${transaction.reference}, ${counterpartyName}, amount ${formattedAmount}, status ${transaction.status}`}
        className="group flex w-full items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-3 sm:p-3.5 text-left shadow-2xs transition-all duration-150 hover:border-slate-300 hover:bg-slate-50/80 hover:shadow-xs focus-visible:border-[#002D62] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002D62]/20 cursor-pointer"
      >
        {/* Left: Icon & Description */}
        <div className="flex items-center space-x-3.5 min-w-0 pr-2">
          {/* Channel Icon Bubble */}
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
              isFailed
                ? "bg-red-50 text-red-600 ring-1 ring-red-200"
                : isCredit
                  ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200"
                  : "bg-blue-50 text-[#002D62] ring-1 ring-blue-100"
            }`}
          >
            {getChannelIcon(transaction.channel, transaction.type)}
          </div>

          {/* Counterparty & Metadata */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2">
              <p className="truncate text-sm font-bold text-slate-900">
                {counterpartyName}
              </p>
              <span className="hidden sm:inline-block">
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 py-0 font-medium bg-slate-50 text-slate-600 border-slate-200"
                >
                  {getChannelLabel(transaction.channel)}
                </Badge>
              </span>
            </div>
            <div className="mt-0.5 flex items-center space-x-2 text-xs text-slate-500">
              <span className="font-mono text-[11px] truncate max-w-[120px] sm:max-w-[180px]">
                {transaction.reference}
              </span>
              <span>•</span>
              <span className="shrink-0 font-medium">
                {formatTransactionDate(transaction.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Amount & Status */}
        <div className="flex items-center space-x-3 shrink-0 text-right">
          <div>
            <div
              className={`font-black tabular-nums text-sm sm:text-base tracking-tight ${
                isFailed
                  ? "text-slate-400 line-through"
                  : isCredit
                    ? "text-emerald-600"
                    : "text-slate-900"
              }`}
            >
              {isFailed
                ? formatKoboToNaira(transaction.amountKobo)
                : formattedAmount}
            </div>

            {/* Status Badge */}
            <div className="mt-0.5 flex justify-end">
              {isSuccessful ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                  <CheckCircle2 className="h-3 w-3" /> Successful
                </span>
              ) : isPending ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700">
                  <Clock className="h-3 w-3" /> Pending
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-700">
                  <AlertCircle className="h-3 w-3" /> Failed
                </span>
              )}
            </div>
          </div>

          <ChevronRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    );
  },
);

TransactionRow.displayName = "TransactionRow";
