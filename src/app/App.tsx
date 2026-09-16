import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useTheme } from './providers';
import { BalanceCard } from '@/features/dashboard/components/BalanceCard';
import { DailySummary } from '@/features/dashboard/components/DailySummary';
import { useBalance } from '@/features/dashboard/hooks/useBalance';
import { ErrorState } from '@/components/feedback/ErrorState';
import { useToast } from '@/components/ui/toast';
import { QrCode, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export function App() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { balance, isLoading, isError, error, refetch, isFetching } = useBalance();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions'>('dashboard');
  const [isSendMoneyOpen, setIsSendMoneyOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  const handleDownloadStatement = () => {
    toast({
      type: 'info',
      title: 'Generating Account Statement',
      description: 'Preparing your official FirstBank e-statement (PDF/CSV) for the current financial cycle.',
    });
  };

  return (
    <AppShell
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      onOpenSendMoney={() => setIsSendMoneyOpen(true)}
      isDarkMode={isDarkMode}
      onToggleDarkMode={toggleDarkMode}
    >
      <div className="space-y-6">
        
        {/* Error Boundary for Balance */}
        {isError && (
          <ErrorState
            title="Failed to load merchant wallet"
            message={error instanceof Error ? error.message : 'Could not synchronize wallet balance.'}
            onRetry={() => refetch()}
            isRetrying={isFetching}
          />
        )}

        {/* Hero Section: Balance Card & Quick Actions */}
        <section aria-labelledby="wallet-balance-heading">
          <h2 id="wallet-balance-heading" className="sr-only">
            Merchant Wallet Balance Summary
          </h2>
          <BalanceCard
            balance={balance}
            isLoading={isLoading}
            isFetching={isFetching}
            onRefresh={() => refetch()}
            onOpenSendMoney={() => setIsSendMoneyOpen(true)}
            onOpenReceiveQR={() => setIsQRModalOpen(true)}
            onDownloadStatement={handleDownloadStatement}
          />
        </section>

        {/* Daily Telemetry & Inflow/Outflow Breakdown */}
        <section aria-labelledby="daily-summary-heading">
          <h2 id="daily-summary-heading" className="sr-only">
            Today's Transaction Volume and Settlement Breakdown
          </h2>
          <DailySummary balance={balance} isLoading={isLoading} />
        </section>

        {/* Dynamic Section Placeholder for Phase 6 (Transaction Feed) & Phase 7 (Send Money) */}
        <div id="transaction-feed-container" className="pt-2">
          {/* Will be populated in Phase 6 */}
        </div>

      </div>

      {/* Instant QR Payment Collection Modal */}
      <Dialog open={isQRModalOpen} onOpenChange={setIsQRModalOpen}>
        <DialogContent onClose={() => setIsQRModalOpen(false)}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-amber-500" />
              <span>NovaBiz Merchant QR</span>
            </DialogTitle>
            <DialogDescription>
              Scan with FirstBank NovaPay, USSD *894#, or any NIBSS NIP QR app to pay.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-900 rounded-xl my-4">
            <div className="p-4 bg-white rounded-2xl shadow-md border-2 border-[#002D62]">
              {/* Dynamic QR SVG Pattern */}
              <svg className="w-48 h-48" viewBox="0 0 100 100" fill="currentColor">
                <path d="M0 0h30v30H0zM10 10h10v10H10zM70 0h30v30H70zM80 10h10v10H80zM0 70h30v30H0zM10 80h10v10H10zM40 10h10v10H40zM50 20h10v10H50zM10 40h10v10H10zM20 50h10v10H20zM40 40h20v20H40zM70 40h10v10H70zM80 50h20v10H80zM40 70h10v10H40zM50 80h10v20H50zM70 70h30v10H70zM80 80h10v20H80zM90 90h10v10H90z" />
              </svg>
            </div>
            <div className="mt-4 text-center">
              <span className="text-xs text-slate-500 dark:text-slate-400">Merchant Terminal ID</span>
              <div className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                FBN-POS-77492
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
export default App;
