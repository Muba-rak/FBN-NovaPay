import React from 'react';
import { formatKoboToNaira, NIP_TRANSFER_FEE_KOBO } from '@/lib/format-money';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShieldCheck, ArrowRight, Lock } from 'lucide-react';

interface StepReviewProps {
  recipientName: string;
  recipientAccount: string;
  recipientBankName: string;
  amountKobo: number;
  narration: string;
  onBack: () => void;
  onNext: () => void;
}

export function StepReview({
  recipientName,
  recipientAccount,
  recipientBankName,
  amountKobo,
  narration,
  onBack,
  onNext,
}: StepReviewProps) {
  const feeKobo = NIP_TRANSFER_FEE_KOBO;
  const totalDebitKobo = amountKobo + feeKobo;

  return (
    <div className="space-y-4">
      {/* Transfer Amount Highlight Hero */}
      <div className="rounded-2xl bg-[#002D62] p-5 text-center text-white dark:bg-[#0A192F] border border-amber-400/20 shadow-xs">
        <span className="text-xs text-amber-300 font-medium">Total Transfer Amount</span>
        <div className="mt-1 text-2xl sm:text-3xl font-black tabular-nums tracking-tight text-white">
          {formatKoboToNaira(amountKobo)}
        </div>
        <div className="mt-1 text-xs text-slate-300">
          to <strong className="text-white">{recipientName}</strong>
        </div>
      </div>

      {/* Breakdown Summary Grid */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-xs dark:border-slate-800 dark:bg-slate-900/50 space-y-2.5">
        
        <div className="flex justify-between items-start">
          <span className="text-slate-500 dark:text-slate-400">Beneficiary Name</span>
          <span className="font-bold text-slate-900 dark:text-white text-right max-w-[200px]">
            {recipientName}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-slate-500 dark:text-slate-400">Destination Bank</span>
          <span className="font-medium text-slate-900 dark:text-white">{recipientBankName}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-slate-500 dark:text-slate-400">Account Number</span>
          <span className="font-mono font-bold text-slate-900 dark:text-white">
            {recipientAccount}
          </span>
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-800">
          <span className="text-slate-500 dark:text-slate-400">Transfer Amount</span>
          <span className="font-mono font-semibold text-slate-900 dark:text-white">
            {formatKoboToNaira(amountKobo)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-slate-500 dark:text-slate-400">NIP Transfer Fee & VAT</span>
          <span className="font-mono text-slate-700 dark:text-slate-300">
            {formatKoboToNaira(feeKobo)}
          </span>
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-800 text-sm">
          <span className="font-bold text-slate-900 dark:text-white">Total Amount to Debit</span>
          <span className="font-mono font-black text-[#002D62] dark:text-[#D4AF37]">
            {formatKoboToNaira(totalDebitKobo)}
          </span>
        </div>

        {narration && (
          <div className="flex justify-between items-start pt-2 border-t border-slate-200 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400">Narration</span>
            <span className="font-medium text-slate-700 dark:text-slate-300 text-right max-w-[200px]">
              {narration}
            </span>
          </div>
        )}
      </div>

      {/* Security Advisory */}
      <div className="flex items-center gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-900 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/80 dark:border-amber-900/40">
        <ShieldCheck className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
        <span>
          Please confirm all details above. FirstBank instant NIP transfers are processed in real-time.
        </span>
      </div>

      {/* Navigation Actions */}
      <div className="flex items-center gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="h-11 px-4 gap-1.5"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button
          type="button"
          onClick={onNext}
          className="flex-1 h-11 bg-[#002D62] text-white hover:bg-[#00224b] hover:text-white dark:bg-[#D4AF37] dark:text-slate-900 font-semibold gap-1.5 disabled:cursor-not-allowed"
        >
          <Lock className="h-4 w-4" />
          Enter Transaction PIN
        </Button>
      </div>
    </div>
  );
}
