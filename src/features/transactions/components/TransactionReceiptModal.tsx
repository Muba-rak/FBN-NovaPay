import { useState } from 'react';
import { Transaction } from '../types';
import { formatKoboToNaira } from '@/lib/format-money';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  Copy,
  Check,
  Download,
  Share2,
  ShieldCheck,
} from 'lucide-react';

interface TransactionReceiptModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TransactionReceiptModal({
  transaction,
  isOpen,
  onClose,
}: TransactionReceiptModalProps) {
  const { toast } = useToast();
  const [copiedRef, setCopiedRef] = useState(false);
  const [copiedSession, setCopiedSession] = useState(false);

  if (!transaction) return null;

  const isCredit = transaction.type === 'credit';
  const isSuccessful = transaction.status === 'successful';
  const isPending = transaction.status === 'pending';

  const handleCopy = (text: string, type: 'ref' | 'session') => {
    navigator.clipboard.writeText(text);
    if (type === 'ref') {
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    } else {
      setCopiedSession(true);
      setTimeout(() => setCopiedSession(false), 2000);
    }
    toast({
      type: 'success',
      title: 'Copied to Clipboard',
      description: `${text} copied successfully.`,
    });
  };

  const handleDownload = () => {
    toast({
      type: 'info',
      title: 'Downloading Official Receipt',
      description: `Receipt for ${transaction.reference} generated (PDF format).`,
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `FirstBank NovaBiz Receipt - ${transaction.reference}`,
          text: `Transaction of ${formatKoboToNaira(transaction.amountKobo)} to/from ${
            transaction.senderName || transaction.recipientName
          }. Reference: ${transaction.reference}`,
        })
        .catch(() => {});
    } else {
      handleCopy(transaction.reference, 'ref');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent onClose={onClose} className="max-w-lg p-0 overflow-hidden">
        
        {/* Receipt Header Banner */}
        <div className="bg-[#002D62] p-6 text-white text-center relative">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur-xs">
            {isSuccessful ? (
              <CheckCircle2 className="h-7 w-7 text-emerald-400" />
            ) : isPending ? (
              <Clock className="h-7 w-7 text-amber-400" />
            ) : (
              <AlertCircle className="h-7 w-7 text-red-400" />
            )}
          </div>

          <Badge
            variant="outline"
            className={`mb-2 font-mono text-xs uppercase px-2.5 py-0.5 border ${
              isSuccessful
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30'
                : isPending
                ? 'bg-amber-950/80 text-amber-300 border-amber-500/30'
                : 'bg-red-950/80 text-red-300 border-red-500/30'
            }`}
          >
            {transaction.status}
          </Badge>

          <DialogHeader className="text-center">
            <DialogTitle className="text-2xl font-black text-white tabular-nums tracking-tight">
              {formatKoboToNaira(transaction.amountKobo)}
            </DialogTitle>
            <DialogDescription className="text-slate-300 text-xs">
              {isCredit ? 'Payment Received by Merchant' : 'Outgoing Transfer / Settlement'}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Receipt Body */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          
          {/* Metadata Grid */}
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-900/50 space-y-3 text-xs">
            
            {/* Counterparty */}
            <div className="flex justify-between items-start">
              <span className="text-slate-500 dark:text-slate-400">
                {isCredit ? 'Sender / Customer' : 'Recipient Name'}
              </span>
              <span className="font-semibold text-slate-900 dark:text-white text-right max-w-[220px]">
                {isCredit
                  ? transaction.senderName || 'Anonymous Customer'
                  : transaction.recipientName || 'Beneficiary'}
              </span>
            </div>

            {/* Institution / Bank */}
            {(transaction.senderBankName || transaction.recipientBankName) && (
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">Bank / Institution</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {transaction.senderBankName || transaction.recipientBankName}
                </span>
              </div>
            )}

            {/* Recipient Account (if applicable) */}
            {transaction.recipientAccount && (
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">Account Number</span>
                <span className="font-mono font-medium text-slate-900 dark:text-white">
                  {transaction.recipientAccount}
                </span>
              </div>
            )}

            {/* Payment Channel */}
            <div className="flex justify-between items-center">
              <span className="text-slate-500 dark:text-slate-400">Payment Channel</span>
              <span className="font-medium uppercase text-slate-900 dark:text-white">
                {transaction.channel.replace('_', ' ')}
              </span>
            </div>

            {/* POS Terminal ID */}
            {transaction.terminalId && (
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">Terminal ID</span>
                <span className="font-mono font-medium text-slate-900 dark:text-white">
                  {transaction.terminalId}
                </span>
              </div>
            )}

            {/* Date & Time */}
            <div className="flex justify-between items-center">
              <span className="text-slate-500 dark:text-slate-400">Timestamp</span>
              <span className="font-medium text-slate-900 dark:text-white">
                {new Date(transaction.createdAt).toLocaleString('en-NG')}
              </span>
            </div>

            {/* Narration */}
            {transaction.narration && (
              <div className="flex justify-between items-start pt-2 border-t border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Narration</span>
                <span className="font-medium text-slate-700 dark:text-slate-300 text-right max-w-[220px]">
                  {transaction.narration}
                </span>
              </div>
            )}

          </div>

          {/* Technical Identifiers (Reference & Session ID) */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-[#112240] space-y-2.5 text-xs">
            {/* Reference */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Transaction Reference</div>
                <div className="font-mono font-bold text-slate-900 dark:text-white">
                  {transaction.reference}
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleCopy(transaction.reference, 'ref')}
                className="h-7 px-2 text-[11px] gap-1"
              >
                {copiedRef ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                {copiedRef ? 'Copied' : 'Copy'}
              </Button>
            </div>

            {/* NIBSS Session ID */}
            {transaction.nibssSessionId && (
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">NIBSS NIP Session ID</div>
                  <div className="font-mono text-slate-700 dark:text-slate-300 text-[11px] break-all">
                    {transaction.nibssSessionId}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(transaction.nibssSessionId!, 'session')}
                  className="h-7 px-2 text-[11px] gap-1"
                >
                  {copiedSession ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                  {copiedSession ? 'Copied' : 'Copy'}
                </Button>
              </div>
            )}
          </div>

          {/* Security Guarantee Pill */}
          <div className="flex items-center gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-900 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/80 dark:border-amber-900/40">
            <ShieldCheck className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>
              Authorized by FirstBank of Nigeria Ltd. Licensed by CBN & Insured by NDIC.
            </span>
          </div>

        </div>

        {/* Actions Footer */}
        <div className="bg-slate-50 p-4 dark:bg-slate-900/80 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="flex-1 gap-1.5"
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={handleDownload}
            className="flex-1 gap-1.5 bg-[#002D62] text-white hover:bg-[#00224b] dark:bg-[#D4AF37] dark:text-slate-900"
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
}
