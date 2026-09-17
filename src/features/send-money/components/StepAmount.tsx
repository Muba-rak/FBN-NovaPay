import {
  formatKoboToNaira,
  parseNairaInputToKobo,
  NIP_TRANSFER_FEE_KOBO,
  DAILY_TRANSFER_LIMIT_KOBO,
} from "@/lib/format-money";
import { sanitizeNarration } from "@/lib/utils";
import { useBalance } from "@/features/dashboard/hooks/useBalance";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft, Wallet, Info } from "lucide-react";

interface StepAmountProps {
  amountKobo: number;
  narration: string;
  recipientName: string;
  recipientAccount: string;
  recipientBankName: string;
  onChangeAmountKobo: (kobo: number) => void;
  onChangeNarration: (narration: string) => void;
  onBack: () => void;
  onNext: () => void;
}

const quickAmounts = [
  { label: "₦5,000", kobo: 500000 },
  { label: "₦10,000", kobo: 1000000 },
  { label: "₦20,000", kobo: 2000000 },
  { label: "₦50,000", kobo: 5000000 },
  { label: "₦100,000", kobo: 10000000 },
];

export function StepAmount({
  amountKobo,
  narration,
  recipientName,
  recipientAccount,
  recipientBankName,
  onChangeAmountKobo,
  onChangeNarration,
  onBack,
  onNext,
}: StepAmountProps) {
  const { balance } = useBalance();
  const availableBalanceKobo = balance?.availableBalanceKobo ?? 0;

  const totalDebitKobo = amountKobo + NIP_TRANSFER_FEE_KOBO;
  const isExceedingBalance =
    amountKobo > 0 && totalDebitKobo > availableBalanceKobo;
  const isExceedingDailyLimit = amountKobo > DAILY_TRANSFER_LIMIT_KOBO;
  const isValid =
    amountKobo > 0 && !isExceedingBalance && !isExceedingDailyLimit;

  const handleRawAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const parsedKobo = parseNairaInputToKobo(raw);
    onChangeAmountKobo(parsedKobo);
  };

  return (
    <div className="space-y-4">
      {/* Recipient Badge */}
      <div className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-900/60 p-3 text-xs border border-slate-200 dark:border-slate-800">
        <div>
          <span className="text-slate-500 dark:text-slate-400">
            Sending to:
          </span>
          <div className="font-bold text-slate-900 dark:text-slate-50 truncate max-w-50">
            {recipientName}
          </div>
          <div className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
            {recipientBankName} • {recipientAccount}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="h-7 text-xs text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40"
        >
          Edit
        </Button>
      </div>

      {/* Available Balance Glance */}
      <div className="flex items-center justify-between text-xs px-1 text-slate-600 dark:text-slate-400">
        <span className="flex items-center gap-1.5">
          <Wallet className="h-3.5 w-3.5 text-amber-500" />
          Available Wallet Balance:
        </span>
        <span className="font-mono font-bold text-slate-900 dark:text-slate-50">
          {formatKoboToNaira(availableBalanceKobo)}
        </span>
      </div>

      {/* Amount Input */}
      <div>
        <label
          htmlFor="transfer-amount"
          className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
        >
          Transfer Amount (NGN)
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400 dark:text-slate-500">
            ₦
          </div>
          <Input
            id="transfer-amount"
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            value={
              amountKobo > 0 ? (amountKobo / 100).toLocaleString("en-US") : ""
            }
            onChange={handleRawAmountChange}
            className={`font-mono text-xl font-bold pl-9 h-13 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 ${
              isExceedingBalance || isExceedingDailyLimit
                ? "border-red-500 focus-visible:ring-red-400"
                : ""
            }`}
            aria-invalid={isExceedingBalance || isExceedingDailyLimit}
          />
        </div>
      </div>

      {/* Quick Amount Chips */}
      <div className="flex flex-wrap gap-1.5">
        {quickAmounts.map((q) => (
          <button
            key={q.kobo}
            type="button"
            onClick={() => onChangeAmountKobo(q.kobo)}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all cursor-pointer ${
              amountKobo === q.kobo
                ? "bg-[#002D62] dark:bg-[#D4AF37] text-white dark:text-slate-950 shadow-2xs font-semibold"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-950 dark:hover:text-slate-50"
            }`}
          >
            {q.label}
          </button>
        ))}
      </div>

      {/* Validation Warnings */}
      {isExceedingBalance && (
        <div
          className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-950/50 p-3 text-xs text-red-800 dark:text-red-300 border border-red-200/80 dark:border-red-900/60"
          role="alert"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
          <span>
            Insufficient wallet balance. Total required including ₦10.75 NIP fee
            is{" "}
            <strong className="font-mono">
              {formatKoboToNaira(totalDebitKobo)}
            </strong>
            .
          </span>
        </div>
      )}

      {isExceedingDailyLimit && (
        <div
          className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-950/50 p-3 text-xs text-red-800 dark:text-red-300 border border-red-200/80 dark:border-red-900/60"
          role="alert"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
          <span>
            Transfer amount exceeds KYC Tier 3 single transaction limit of
            ₦5,000,000.00.
          </span>
        </div>
      )}

      {/* Narration Input */}
      <div>
        <label
          htmlFor="transfer-narration"
          className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
        >
          Payment Narration / Remark (Optional)
        </label>
        <Input
          id="transfer-narration"
          type="text"
          maxLength={50}
          placeholder="e.g. Invoice settlement, Goods purchase"
          value={narration}
          onChange={(e) => onChangeNarration(sanitizeNarration(e.target.value))}
          className="text-sm h-10 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50"
        />
      </div>

      {/* Fee Transparency Note */}
      <div className="flex items-center gap-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 p-2.5 text-[11px] text-slate-600 dark:text-slate-400 border border-slate-200/70 dark:border-slate-800/70">
        <Info className="h-3.5 w-3.5 text-amber-500 shrink-0" />
        <span>Standard NIBSS NIP Fee: ₦10.00 + ₦0.75 VAT (₦10.75 total).</span>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="h-11 px-4 gap-1.5 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button
          type="button"
          onClick={onNext}
          disabled={!isValid}
          className="flex-1 h-11 bg-[#002D62] dark:bg-[#D4AF37] text-white dark:text-slate-950 hover:bg-[#00224b] dark:hover:bg-[#c49f2e] font-semibold disabled:cursor-not-allowed shadow-xs"
        >
          Review Transfer
        </Button>
      </div>
    </div>
  );
}

