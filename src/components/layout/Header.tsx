import React from "react";
import { Button } from "@/components/ui/button";
import {
  Send,
  ShieldCheck,
  Wifi,
  WifiOff,
  Terminal,
  SlidersHorizontal,
} from "lucide-react";
import { simulationConfig, subscribeSimulationConfig } from "@/mocks/config";
import { ModeToggle } from "@/components/mode-toggle";

interface HeaderProps {
  onOpenSendMoney: () => void;
  onOpenMockApi?: () => void;
}

export function Header({ onOpenSendMoney, onOpenMockApi }: HeaderProps) {
  const [config, setConfig] = React.useState(simulationConfig);

  React.useEffect(() => {
    return subscribeSimulationConfig((updated) => setConfig(updated));
  }, []);

  const hasForcedBehavior =
    config.nextTransferBehavior !== "none" ||
    config.nextSettlementBehavior !== "none" ||
    config.offline ||
    config.failureRate > 0;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-[#060e1f]/95 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand & Terminal Info */}
        <div className="flex items-center space-x-3.5">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#002D62] dark:bg-[#002D62] text-[#D4AF37] shadow-sm ring-1 ring-amber-400/20">
            <span className="font-black text-xl tracking-tighter">NB</span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-900 dark:text-slate-50 tracking-tight text-base sm:text-lg">
                FirstBank <span className="text-[#D4AF37]">NovaBiz</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                <ShieldCheck className="h-3 w-3" /> Tier 3 Verified
              </span>
            </div>
            <div className="flex items-center space-x-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Terminal className="h-3 w-3" /> POS: FBN-POS-77492
              </span>
              <span className="hidden md:inline">•</span>
              <span className="hidden md:inline font-mono">
                NIBSS NIP Connected
              </span>
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Connection / Failure Rate Status Pill */}
          <button
            type="button"
            onClick={onOpenMockApi}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 cursor-pointer hover:border-amber-400/50 transition-colors"
            title="Click to open Mock API controls"
          >
            {config.offline ? (
              <>
                <WifiOff className="h-3.5 w-3.5 text-red-500" />
                <span className="text-red-600 dark:text-red-400 font-mono text-[11px]">
                  Simulated Offline
                </span>
              </>
            ) : config.failureRate > 0 ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                <span className="text-amber-600 dark:text-amber-400 font-mono text-[11px]">
                  Fail Rate: {Math.round(config.failureRate * 100)}%
                </span>
              </>
            ) : (
              <>
                <Wifi className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">
                  MSW Mock ({config.latencyMs}ms)
                </span>
              </>
            )}
          </button>

          {/* Dedicated Mock API Button */}
          <Button
            onClick={onOpenMockApi}
            variant="outline"
            size="default"
            id="header-mock-api-btn"
            className="relative gap-2 border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/80 font-medium text-xs sm:text-sm text-slate-800 dark:text-slate-100"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-amber-500" />
            <span>Mock API</span>
            {hasForcedBehavior && (
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </span>
            )}
          </Button>

          {/* Theme Mode Toggle */}
          <ModeToggle />

          {/* Send Money CTA */}
          <Button
            onClick={onOpenSendMoney}
            variant="gold"
            size="default"
            className="gap-2 shadow-sm font-semibold text-slate-900"
            id="header-send-money-btn"
          >
            <Send className="h-4 w-4" />
            <span className="hidden xs:inline">Send Money</span>
          </Button>
        </div>
      </div>
    </header>
  );
}


