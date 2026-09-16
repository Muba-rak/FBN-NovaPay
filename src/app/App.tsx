import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { BalanceCard } from "@/features/dashboard/components/BalanceCard";
import { DailySummary } from "@/features/dashboard/components/DailySummary";
import { useBalance } from "@/features/dashboard/hooks/useBalance";
import { TransactionFeed } from "@/features/transactions";
import { SendMoneyModal } from "@/features/send-money";
import { useToast } from "@/components/ui/toast";
import { ErrorState } from "@/components/feedback/ErrorState";

export function App() {
  const { balance, isLoading, isError, error, refetch, isFetching } =
    useBalance();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"dashboard" | "transactions">(
    "dashboard",
  );
  const [isSendMoneyOpen, setIsSendMoneyOpen] = useState(false);

  const handleDownloadStatement = () => {
    toast({
      type: "info",
      title: "Generating Account Statement",
      description:
        "Preparing your official FirstBank e-statement (PDF/CSV) for the current financial cycle.",
    });
  };

  return (
    <AppShell
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      onOpenSendMoney={() => setIsSendMoneyOpen(true)}
    >
      <div className="space-y-6">
        {/* Error Boundary for Balance */}
        {isError && (
          <ErrorState
            title="Failed to load merchant wallet"
            message={
              error instanceof Error
                ? error.message
                : "Could not synchronize wallet balance."
            }
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

        {/* Transaction Ledger Feed */}
        <div id="transaction-feed-container" className="pt-2">
          <TransactionFeed onOpenSendMoney={() => setIsSendMoneyOpen(true)} />
        </div>
      </div>

      {/* Multi-Step Send Money Flow Modal */}
      <SendMoneyModal
        isOpen={isSendMoneyOpen}
        onClose={() => setIsSendMoneyOpen(false)}
      />
    </AppShell>
  );
}
export default App;
