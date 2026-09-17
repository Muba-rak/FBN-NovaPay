import { useEffect, useState } from "react";
import {
  simulationConfig,
  updateSimulationConfig,
  resetSimulationConfig,
  subscribeSimulationConfig,
  NextTransferBehavior,
  NextSettlementBehavior,
} from "@/mocks/config";
import { resetTransactionDatabase } from "@/mocks/data/transactions";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/toast";
import {
  X,
  RotateCcw,
  WifiOff,
  Wifi,
  Zap,
  ArrowRightLeft,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";

interface MockApiDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface OptionCardProps {
  title: string;
  description: string;
  isSelected: boolean;
  onClick: () => void;
  badge?: string;
  variant?: "default" | "warning" | "danger" | "success";
}

function OptionCard({
  title,
  description,
  isSelected,
  onClick,
  badge,
  variant = "default",
}: OptionCardProps) {
  const getSelectedBorder = () => {
    if (!isSelected) {
      return "border-slate-200 hover:border-slate-300 bg-slate-50/70 hover:bg-slate-100/80 dark:border-slate-800 dark:hover:border-slate-700 dark:bg-slate-900/50";
    }
    if (variant === "danger") {
      return "border-red-500 ring-1 ring-red-500/50 bg-red-50/90 dark:bg-red-950/25";
    }
    if (variant === "warning") {
      return "border-amber-500 ring-1 ring-amber-500/50 bg-amber-50/90 dark:bg-amber-950/25";
    }
    if (variant === "success") {
      return "border-emerald-500 ring-1 ring-emerald-500/50 bg-emerald-50/90 dark:bg-emerald-950/25";
    }
    return "border-blue-600 dark:border-blue-500 ring-1 ring-blue-500/50 bg-blue-50/90 dark:bg-blue-950/30";
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left p-3.5 rounded-xl border transition-all duration-150 cursor-pointer ${getSelectedBorder()} flex flex-col gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500`}
    >
      <div className="flex items-center justify-between w-full">
        <span className={`text-sm tracking-tight ${isSelected ? "text-slate-950 dark:text-white font-bold" : "text-slate-800 dark:text-slate-200 font-semibold"}`}>
          {title}
        </span>
        {badge && (
          <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {badge}
          </span>
        )}
      </div>
      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{description}</p>
    </button>
  );
}

const latencyPresets = [
  { label: "0ms", val: 0 },
  { label: "150ms", val: 150 },
  { label: "800ms", val: 800 },
  { label: "2500ms", val: 2500 },
];

const failurePresets = [
  { label: "0%", val: 0.0 },
  { label: "25%", val: 0.25 },
  { label: "50%", val: 0.5 },
  { label: "100%", val: 1.0 },
];

export function MockApiDrawer({ isOpen, onClose }: MockApiDrawerProps) {
  const [config, setConfig] = useState(simulationConfig);
  const [isSettling, setIsSettling] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    return subscribeSimulationConfig((updated) => setConfig(updated));
  }, []);

  // Keyboard shortcut Esc to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelectTransfer = (behavior: NextTransferBehavior) => {
    updateSimulationConfig({ nextTransferBehavior: behavior });
    const titles: Record<NextTransferBehavior, string> = {
      none: "Nothing forced",
      succeeds: "Next transfer: Succeeds",
      error_nothing_sent: "Next transfer: Error, nothing sent",
      error_money_sent: "Next transfer: Error, money sent",
      timeout_nothing_sent: "Next transfer: Timeout, nothing sent",
      timeout_money_sent: "Next transfer: Timeout, money sent",
    };
    toast({
      type: behavior === "none" ? "info" : behavior === "succeeds" ? "success" : "warning",
      title: titles[behavior],
      description: "Applied to next transfer request.",
    });
  };

  const handleSelectSettlement = (behavior: NextSettlementBehavior) => {
    updateSimulationConfig({ nextSettlementBehavior: behavior });
    const titles: Record<NextSettlementBehavior, string> = {
      none: "Settlement: Follows failure rate",
      settles: "Next settlement: Settles",
      fails: "Next settlement: Fails to settle",
    };
    toast({
      type: behavior === "fails" ? "warning" : "info",
      title: titles[behavior],
      description: "Applied to next settlement request.",
    });
  };

  const handleTriggerSettlement = async () => {
    setIsSettling(true);
    try {
      const res = await apiClient<{ success: boolean; message: string; creditedKobo?: number }>(
        "/api/settlements/trigger",
        { method: "POST" }
      );
      await queryClient.invalidateQueries({ queryKey: ["wallet", "balance"] });
      await queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast({
        type: "success",
        title: "Settlement Completed",
        description: res.message || "Pending batch credited to merchant balance.",
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Bank settlement rail error";
      toast({
        type: "error",
        title: "Settlement Rejected",
        description: errorMsg,
      });
    } finally {
      setIsSettling(false);
    }
  };

  const handleResetData = () => {
    resetTransactionDatabase();
    queryClient.invalidateQueries({ queryKey: ["wallet", "balance"] });
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
    toast({
      type: "info",
      title: "Mock Database Reset",
      description: "Transaction ledger and wallet balance restored to initial state.",
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      aria-labelledby="mock-api-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop Click Dismiss */}
      <div className="flex-1 cursor-pointer" onClick={onClose} aria-hidden="true" />

      {/* Drawer Container */}
      <div className="relative w-full max-w-md h-full bg-white dark:bg-[#0a1020] text-slate-900 dark:text-slate-100 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
        
        {/* Top Header */}
        <div className="flex items-start justify-between p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#0c1427]">
          <div>
            <div className="flex items-center gap-2">
              <h2 id="mock-api-title" className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Mock API controls
              </h2>
              {config.nextTransferBehavior !== "none" && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40">
                  Override Active
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              A simulated bank server. Changes apply to the next requests.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Mock API controls"
            className="rounded-lg p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
          
          {/* Section: Next Transfer */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <ArrowRightLeft className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" /> Next transfer
              </span>
            </div>

            <div className="space-y-2">
              <OptionCard
                title="Nothing forced"
                description="The next transfer follows the network settings below."
                isSelected={config.nextTransferBehavior === "none"}
                onClick={() => handleSelectTransfer("none")}
              />

              <OptionCard
                title="Succeeds"
                description="Goes through and replies normally, whatever the settings below."
                isSelected={config.nextTransferBehavior === "succeeds"}
                onClick={() => handleSelectTransfer("succeeds")}
                variant="success"
              />

              <OptionCard
                title="Error, nothing sent"
                description="Fails with a server error before anything is written."
                isSelected={config.nextTransferBehavior === "error_nothing_sent"}
                onClick={() => handleSelectTransfer("error_nothing_sent")}
                variant="danger"
              />

              <OptionCard
                title="Error, money sent"
                description="Goes through, then replies with a server error."
                isSelected={config.nextTransferBehavior === "error_money_sent"}
                onClick={() => handleSelectTransfer("error_money_sent")}
                variant="danger"
              />

              <OptionCard
                title="Timeout, nothing sent"
                description="Never replies, and nothing is written."
                isSelected={config.nextTransferBehavior === "timeout_nothing_sent"}
                onClick={() => handleSelectTransfer("timeout_nothing_sent")}
                variant="warning"
              />

              <OptionCard
                title="Timeout, money sent"
                description="Goes through, but the reply never arrives. The case reconciliation exists for."
                isSelected={config.nextTransferBehavior === "timeout_money_sent"}
                onClick={() => handleSelectTransfer("timeout_money_sent")}
                variant="warning"
              />
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 leading-relaxed border-l-2 border-slate-300 dark:border-slate-700 pl-2">
              A timeout holds the reply for 60s; the app stops waiting after 15s and starts confirming.
            </p>
          </div>

          {/* Section: Next Settlement */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" /> Next settlement
              </span>
            </div>

            <div className="space-y-2">
              <OptionCard
                title="Nothing forced"
                description="Settles as the failure rate below decides."
                isSelected={config.nextSettlementBehavior === "none"}
                onClick={() => handleSelectSettlement("none")}
              />

              <OptionCard
                title="Settles"
                description="The bank completes it."
                isSelected={config.nextSettlementBehavior === "settles"}
                onClick={() => handleSelectSettlement("settles")}
                variant="success"
              />

              <OptionCard
                title="Fails to settle"
                description="The bank rejects the settlement batch."
                isSelected={config.nextSettlementBehavior === "fails"}
                onClick={() => handleSelectSettlement("fails")}
                variant="danger"
              />
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSettling}
              onClick={handleTriggerSettlement}
              className="w-full mt-2 text-xs bg-slate-100 hover:bg-slate-200 border-slate-300 text-amber-800 dark:bg-slate-800/80 dark:border-slate-700 dark:text-amber-400 dark:hover:bg-slate-700 dark:hover:text-amber-300 gap-1.5"
            >
              <Zap className="h-3.5 w-3.5" />
              {isSettling ? "Processing Settlement..." : "Trigger Batch Settlement Now"}
            </Button>
          </div>

          {/* Section: Network Settings */}
          <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Network settings
            </span>

            {/* Latency */}
            <div className="space-y-2 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between text-xs text-slate-700 dark:text-slate-300">
                <span>Simulated Latency</span>
                <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">{config.latencyMs} ms</span>
              </div>
              <input
                type="range"
                min="0"
                max="3000"
                step="50"
                value={config.latencyMs}
                aria-label="Simulated latency in milliseconds"
                onChange={(e) => updateSimulationConfig({ latencyMs: Number(e.target.value) })}
                className="w-full accent-amber-500 dark:accent-amber-400 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {latencyPresets.map((p) => (
                  <button
                    key={p.val}
                    type="button"
                    onClick={() => updateSimulationConfig({ latencyMs: p.val })}
                    className={`px-2 py-0.5 text-[11px] rounded font-mono transition-colors ${
                      config.latencyMs === p.val
                        ? "bg-amber-500 text-slate-950 font-bold"
                        : "bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Failure Rate */}
            <div className="space-y-2 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between text-xs text-slate-700 dark:text-slate-300">
                <span>Failure Rate (Rollback Test)</span>
                <span className="font-mono text-red-600 dark:text-red-400 font-bold">
                  {Math.round(config.failureRate * 100)}%
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {failurePresets.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => updateSimulationConfig({ failureRate: item.val })}
                    className={`px-2 py-1 text-xs rounded-lg font-mono transition-all ${
                      config.failureRate === item.val
                        ? item.val > 0
                          ? "bg-red-600 text-white font-bold"
                          : "bg-emerald-600 text-white font-bold"
                        : "bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Offline Mode Toggle */}
            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                {config.offline ? (
                  <WifiOff className="h-4 w-4 text-red-500" />
                ) : (
                  <Wifi className="h-4 w-4 text-emerald-500" />
                )}
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200">Simulate Offline</span>
              </div>
              <button
                type="button"
                onClick={() => updateSimulationConfig({ offline: !config.offline })}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                  config.offline ? "bg-red-600 text-white" : "bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                }`}
              >
                {config.offline ? "Offline Active" : "Go Offline"}
              </button>
            </div>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0c1427] flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleResetData}
            className="flex-1 text-xs h-9 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 gap-1.5"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset Database
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={resetSimulationConfig}
            className="text-xs h-9 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            Defaults
          </Button>
        </div>

      </div>
    </div>
  );
}
