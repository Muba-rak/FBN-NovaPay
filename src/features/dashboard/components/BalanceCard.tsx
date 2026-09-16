import React, { useState } from 'react';
import { WalletBalance } from '../types';
import { formatKoboToNaira } from '@/lib/format-money';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import {
  Send,
  QrCode,
  FileDown,
  Eye,
  EyeOff,
  Copy,
  Check,
  RefreshCw,
  Building2,
  Sparkles,
} from 'lucide-react';

interface BalanceCardProps {
  balance?: WalletBalance;
  isLoading?: boolean;
  isFetching?: boolean;
  onRefresh?: () => void;
  onOpenSendMoney: () => void;
  onOpenReceiveQR?: () => void;
  onDownloadStatement?: () => void;
}

export function BalanceCard({
  balance,
  isLoading,
  isFetching,
  onRefresh,
  onOpenSendMoney,
  onOpenReceiveQR,
  onDownloadStatement,
}: BalanceCardProps) {
  const [showBalance, setShowBalance] = useState(true);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopyAccount = () => {
    if (!balance?.accountNumber) return;
    navigator.clipboard.writeText(balance.accountNumber);
    setCopied(true);
    toast({
      type: 'success',
      title: 'Account Number Copied',
      description: `${balance.accountNumber} (${balance.bankName}) copied to clipboard.`,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="w-full rounded-2xl bg-gradient-to-br from-[#002D62] via-[#001D40] to-[#00142C] p-6 sm:p-8 text-white shadow-xl animate-pulse min-h-[260px] flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="h-4 w-32 bg-white/20 rounded" />
            <div className="h-6 w-48 bg-white/20 rounded" />
          </div>
          <div className="h-8 w-24 bg-white/20 rounded-full" />
        </div>
        <div className="space-y-2 my-6">
          <div className="h-3 w-28 bg-white/20 rounded" />
          <div className="h-10 w-64 bg-white/20 rounded" />
        </div>
        <div className="grid grid-cols-3 gap-3 pt-2">
          <div className="h-10 bg-white/20 rounded-xl" />
          <div className="h-10 bg-white/20 rounded-xl" />
          <div className="h-10 bg-white/20 rounded-xl" />
        </div>
      </div>
    );
  }

  const availableKobo = balance?.availableBalanceKobo ?? 0;
  const ledgerKobo = balance?.ledgerBalanceKobo ?? 0;

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-br from-[#002D62] via-[#001E44] to-[#051124] p-6 sm:p-8 text-white shadow-xl border border-white/10 transition-all">
      {/* Background Decorative Crest Glow */}
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#D4AF37]/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl"
        aria-hidden="true"
      />

      {/* Top Merchant Identity & Refresh */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md text-[#D4AF37] ring-1 ring-white/20">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm sm:text-base font-bold tracking-tight text-white">
                {balance?.merchantName || 'ALHERI SUPERMARKET & WHOLESALE'}
              </span>
              <Badge variant="gold" className="text-[10px] uppercase font-bold tracking-wider px-2 py-0">
                Tier 3
              </Badge>
            </div>
            <div className="flex items-center space-x-2 text-xs text-slate-300">
              <span className="font-mono">
                {balance?.bankName || 'First Bank of Nigeria'} • {balance?.accountNumber || '3049281029'}
              </span>
              <button
                type="button"
                onClick={handleCopyAccount}
                className="rounded p-1 text-slate-300 hover:text-white hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 cursor-pointer transition-colors"
                aria-label="Copy NUBAN account number"
                title="Copy account number"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Live Refresh Button */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={onRefresh}
            className="flex items-center space-x-1.5 rounded-lg bg-white/10 hover:bg-white/15 px-3 py-1.5 text-xs text-slate-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 cursor-pointer"
            aria-label="Refresh wallet balance"
            disabled={isFetching}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin text-amber-400' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Main Balance Display */}
      <div className="relative z-10 my-6 sm:my-7">
        <div className="flex items-center space-x-2 text-xs sm:text-sm font-medium text-slate-300">
          <span>Available Merchant Balance</span>
          <button
            type="button"
            onClick={() => setShowBalance(!showBalance)}
            className="rounded p-1 text-slate-300 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 cursor-pointer"
            aria-label={showBalance ? 'Hide balance amount' : 'Reveal balance amount'}
          >
            {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <div className="mt-1 flex flex-wrap items-baseline gap-3">
          <span
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white tabular-nums"
            aria-live="polite"
            id="wallet-available-balance"
          >
            {showBalance ? formatKoboToNaira(availableKobo) : '₦ ••••••••'}
          </span>
          <span className="rounded-md bg-amber-400/20 px-2 py-0.5 text-xs font-semibold text-amber-300 ring-1 ring-amber-400/30">
            Instant NIP Rails
          </span>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300">
          <span>
            Ledger Balance:{' '}
            <strong className="text-slate-100 font-mono">
              {showBalance ? formatKoboToNaira(ledgerKobo) : '₦ ••••••••'}
            </strong>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 text-amber-300 font-medium">
            <Sparkles className="h-3 w-3" /> Auto-settlement active
          </span>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        
        {/* Send Money Button */}
        <Button
          onClick={onOpenSendMoney}
          variant="gold"
          size="lg"
          className="w-full gap-2 text-slate-950 font-bold shadow-md shadow-amber-900/20"
          id="balance-card-send-btn"
        >
          <Send className="h-4 w-4" />
          <span>Send Money</span>
        </Button>

        {/* QR Collection Button */}
        <Button
          onClick={onOpenReceiveQR}
          variant="outline"
          size="lg"
          className="w-full gap-2 border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white"
        >
          <QrCode className="h-4 w-4 text-amber-300" />
          <span>Collect via QR</span>
        </Button>

        {/* Download Statement Button */}
        <Button
          onClick={onDownloadStatement}
          variant="outline"
          size="lg"
          className="w-full gap-2 border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white"
        >
          <FileDown className="h-4 w-4 text-slate-300" />
          <span>Statement</span>
        </Button>

      </div>
    </div>
  );
}
