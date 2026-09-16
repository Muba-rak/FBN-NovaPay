import React from 'react';
import {
  simulationConfig,
  updateSimulationConfig,
  resetSimulationConfig,
  subscribeSimulationConfig,
} from '@/mocks/config';
import { resetTransactionDatabase } from '@/mocks/data/transactions';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/toast';
import { Sliders, RotateCcw, AlertOctagon, CheckCircle2, ChevronDown, ChevronUp, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function SimulationBar({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) {
  const [config, setConfig] = React.useState(simulationConfig);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  React.useEffect(() => {
    return subscribeSimulationConfig((updated) => setConfig(updated));
  }, []);

  const handleResetData = () => {
    resetTransactionDatabase();
    queryClient.invalidateQueries({ queryKey: ['wallet', 'balance'] });
    queryClient.invalidateQueries({ queryKey: ['transactions'] });
    toast({
      type: 'info',
      title: 'Mock Database Reset',
      description: 'Transaction ledger and wallet balance restored to initial state (₦3,845,250.00).',
    });
  };

  const setFailureRate = (rate: number) => {
    updateSimulationConfig({ failureRate: rate });
    toast({
      type: rate > 0 ? 'warning' : 'success',
      title: rate > 0 ? `Simulated Failure Rate: ${Math.round(rate * 100)}%` : 'Failure Rate: 0% (All Requests Succeed)',
      description: rate > 0 ? 'Outgoing transfers will randomly fail/timeout to test optimistic rollback.' : 'Normal operation restored.',
    });
  };

  return (
    <div className="fixed bottom-14 md:bottom-3 left-1/2 -translate-x-1/2 z-40 w-full max-w-4xl px-3 transition-all duration-300">
      <div className="rounded-2xl border border-slate-700/80 bg-slate-900/95 text-white shadow-2xl backdrop-blur-lg overflow-hidden">
        
        {/* Bar Header / Toggle */}
        <div
          onClick={onToggle}
          className="flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-slate-800/80 transition-colors select-none"
        >
          <div className="flex items-center space-x-2.5">
            <div className="flex items-center justify-center w-6 h-6 rounded-md bg-amber-500/20 text-amber-400">
              <Zap className="h-3.5 w-3.5" />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs sm:text-sm font-semibold text-slate-100">
                MSW Simulation Controls
              </span>
              <Badge variant="gold" className="text-[10px] px-1.5 py-0 h-4">
                Latency: {config.latencyMs}ms
              </Badge>
              {config.failureRate > 0 && (
                <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4">
                  Fail: {Math.round(config.failureRate * 100)}%
                </Badge>
              )}
              {config.offline && (
                <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4">
                  Offline
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              {isOpen ? 'Click to minimize' : 'Test Latency & Rollback'}
            </span>
            {isOpen ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronUp className="h-4 w-4 text-slate-400" />}
          </div>
        </div>

        {/* Expanded Controls */}
        {isOpen && (
          <div className="p-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-950/60">
            
            {/* Latency Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Simulated Latency</span>
                <span className="font-mono text-amber-400">{config.latencyMs} ms</span>
              </div>
              <input
                type="range"
                min="0"
                max="2500"
                step="50"
                value={config.latencyMs}
                onChange={(e) => updateSimulationConfig({ latencyMs: Number(e.target.value) })}
                className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg appearance-none"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0ms (Instant)</span>
                <span>1000ms</span>
                <span>2500ms (2G)</span>
              </div>
            </div>

            {/* Failure Rate Preset Buttons */}
            <div className="space-y-1.5">
              <span className="text-xs text-slate-300 block">Failure Rate (Test Rollback)</span>
              <div className="grid grid-cols-4 gap-1">
                {[
                  { label: '0%', val: 0.0 },
                  { label: '25%', val: 0.25 },
                  { label: '50%', val: 0.5 },
                  { label: '100%', val: 1.0 },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setFailureRate(item.val)}
                    className={`px-2 py-1 text-xs rounded-md font-mono transition-all cursor-pointer ${
                      config.failureRate === item.val
                        ? item.val > 0
                          ? 'bg-red-600 text-white font-bold ring-1 ring-red-400'
                          : 'bg-emerald-600 text-white font-bold'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <span className="text-[10px] text-slate-400 block">
                {config.failureRate === 1.0
                  ? '⚡ 100% fail: tests optimistic rollback & alert'
                  : 'Tests optimistic UI reconciliation on failure'}
              </span>
            </div>

            {/* Network Disconnect & DB Reset */}
            <div className="flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300">Simulate Network Drop</span>
                <button
                  type="button"
                  onClick={() => updateSimulationConfig({ offline: !config.offline })}
                  className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer ${
                    config.offline
                      ? 'bg-red-500 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {config.offline ? 'Offline Active' : 'Go Offline'}
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetData}
                  className="w-full text-xs h-8 bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 gap-1.5"
                >
                  <RotateCcw className="h-3 w-3" /> Reset Database
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetSimulationConfig}
                  className="text-xs h-8 text-slate-400 hover:text-white"
                >
                  Defaults
                </Button>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
