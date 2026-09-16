import { SendMoneyResponse } from '../types';
import { formatKoboToNaira } from '@/lib/format-money';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { CheckCircle2, Download, Share2, ShieldCheck } from 'lucide-react';

interface TransferSuccessModalProps {
  response: SendMoneyResponse;
  onClose: () => void;
  onNewTransfer: () => void;
}

export function TransferSuccessModal({
  response,
  onClose,
  onNewTransfer,
}: TransferSuccessModalProps) {
  const { toast } = useToast();

  const handleDownloadReceipt = () => {
    toast({
      type: 'success',
      title: 'Downloading Transfer Receipt',
      description: `Official PDF receipt for ${response.reference} downloaded.`,
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `FirstBank Transfer - ${response.reference}`,
        text: `Sent ${formatKoboToNaira(response.amountKobo)} to ${response.recipientName}. Ref: ${response.reference}`,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(response.reference);
      toast({
        type: 'success',
        title: 'Reference Copied',
        description: `${response.reference} copied to clipboard.`,
      });
    }
  };

  return (
    <div className="space-y-4 text-center">
      {/* Success Hero Header */}
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 ring-4 ring-emerald-50 dark:ring-emerald-900/30">
        <CheckCircle2 className="h-8 w-8" />
      </div>

      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          Transfer Successful
        </span>
        <div className="mt-1 text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
          {formatKoboToNaira(response.amountKobo)}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Sent to <strong>{response.recipientName}</strong>
        </p>
      </div>

      {/* Transaction Details Box */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-xs dark:border-slate-800 dark:bg-slate-900/50 space-y-2.5 text-left">
        <div className="flex justify-between items-center">
          <span className="text-slate-500 dark:text-slate-400">Destination</span>
          <span className="font-semibold text-slate-900 dark:text-white">
            {response.recipientBankName} ({response.recipientAccount})
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-slate-500 dark:text-slate-400">Transaction Ref</span>
          <span className="font-mono font-bold text-slate-900 dark:text-white">
            {response.reference}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-slate-500 dark:text-slate-400">NIBSS Session ID</span>
          <span className="font-mono text-slate-600 dark:text-slate-400 text-[11px] truncate max-w-[170px]">
            {response.nibssSessionId}
          </span>
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-800">
          <span className="text-slate-500 dark:text-slate-400">New Available Balance</span>
          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
            {formatKoboToNaira(response.newAvailableBalanceKobo)}
          </span>
        </div>
      </div>

      {/* Security Guarantee */}
      <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
        <span>Processed & Settled instantly via NIBSS NIP Rail.</span>
      </div>

      {/* Actions */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleShare}
            className="flex-1 h-10 text-xs gap-1.5"
          >
            <Share2 className="h-3.5 w-3.5" />
            Share
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleDownloadReceipt}
            className="flex-1 h-10 text-xs gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            Download Receipt
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onNewTransfer}
            className="flex-1 h-10 text-xs text-amber-600 dark:text-amber-400"
          >
            Make Another Transfer
          </Button>
          <Button
            type="button"
            onClick={onClose}
            className="flex-1 h-10 bg-[#002D62] text-white hover:bg-[#00224b] hover:text-white dark:bg-[#D4AF37] dark:text-slate-900 font-semibold text-xs disabled:cursor-not-allowed"
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
