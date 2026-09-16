import React, { useEffect } from 'react';
import {
  simulationConfig,
  updateSimulationConfig,
  resetSimulationConfig,
  subscribeSimulationConfig,
} from '@/mocks/config';
import { resetTransactionDatabase } from '@/mocks/data/transactions';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/toast';
import { RotateCcw, ChevronDown, ChevronUp, Zap, WifiOff, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SimulationBarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const latencyPresets = [
  { label: '0ms (Instant)', val: 0 },
  { label: '150ms (4G)', val: 150 },
  { label: '800ms (3G)', val: 800 },
  { label: '2500ms (Degraded)', val: 2500 },
];

const failurePresets = [
  { label: '0%', val: 0.0 },
  { label: '25%', val: 0.25 },
  { label: '50%', val: 0.5 },
  { label: '100%', val: 1.0 },
];

export function SimulationBar({ isOpen, onToggle }: SimulationBarProps) {
  const [config, setConfig] = React.useState(simulationConfig);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  React.useEffect(() => {
    return subscribeSimulationConfig((updated) => setConfig(updated));
  }, []);

  // Global keyboard shortcut: Ctrl+Shift+D or Cmd+Shift+D to toggle DevTools bar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        onToggle();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onToggle]);

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

  const handleToggleOffline = () => {
    const nextOffline = !config.offline;
    updateSimulationConfig({ offline: nextOffline });
    toast({
      type: nextOffline ? 'error' : 'success',
      title: nextOffline ? 'Simulated Network Disconnect' : 'Network Reconnected',
      description: nextOffline ? 'MSW will reject all outgoing API requests with network error.' : 'Requests will now process normally.',
    });
  };

  return (
    <aside
      role="region"
      aria-label="Simulation DevTools Panel"
      className="fixed bottom-14 md:bottom-3 left-1/2 -translate-x-1/2 z-40 w-full max-w-4xl px-3 transition-all duration-300"
    >
      <div className="rounded-2xl border border-slate-700/80 bg-slate-900/95 text-white shadow-2xl backdrop-blur-lg overflow-hidden">
        
        {/* Bar Header / Toggle */}
        <button
          type="button"
          id="simulation-toggle-btn"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls="simulation-controls-panel"
          className="w-full flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-slate-800/80 transition-colors select-none text-left"
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
                <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4 animate-pulse">
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
            <span className="text-[11px] text-slate-400 hidden sm:inline font-mono">
              {isOpen ? 'Minimize (Ctrl+Shift+D)' : 'Test Latency & Rollback (Ctrl+Shift+D)'}
            </span>
            {isOpen ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronUp className="h-4 w-4 text-slate-400" />}
          </div>
        </button>

        {/* Expanded Controls */}
        {isOpen && (
          <div
            id="simulation-controls-panel"
            className="p-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-950/60"
          >
            {/* Latency Controls */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Simulated Latency</span>
                <span className="font-mono text-amber-400 font-bold">{config.latencyMs} ms</span>
              </div>
              <input
                type="range"
                min="0"
                max="3000"
                step="50"
                value={config.latencyMs}
                aria-label="Simulated latency in milliseconds"
                onChange={(e) => updateSimulationConfig({ latencyMs: Number(e.target.value) })}
                className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg appearance-none"
              />
              <div className="flex flex-wrap gap-1 pt-0.5">
                {latencyPresets.map((p) => (
                  <button
                    key={p.val}
                    type="button"
                    onClick={() => updateSimulationConfig({ latencyMs: p.val })}
                    className={`px-1.5 py-0.5 text-[10px] rounded font-mono transition-colors ${
                      config.latencyMs === p.val
                        ? 'bg-amber-500 text-slate-900 font-bold'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {p.val}ms
                  </button>
                ))}
              </div>
            </div>

            {/* Failure Rate Preset Buttons */}
            <div className="space-y-1.5">
              <span className="text-xs text-slate-300 block">Failure Rate (Test Rollback)</span>
              <div className="grid grid-cols-4 gap-1">
                {failurePresets.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setFailureRate(item.val)}
                    aria-label={`Set failure rate to ${item.label}`}
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
                  ? '⚡ 100% fail: triggers instant optimistic rollback & alert'
                  : 'Tests optimistic UI snapshot rollback'}
              </span>
            </div>

            {/* Network Disconnect & DB Reset */}
            <div className="flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300">Simulate Offline</span>
                <button
                  type="button"
                  onClick={handleToggleOffline}
                  aria-pressed={config.offline}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer ${
                    config.offline
                      ? 'bg-red-500 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {config.offline ? <WifiOff className="h-3 w-3" /> : <Wifi className="h-3 w-3" />}
                  {config.offline ? 'Offline Active' : 'Go Offline'}
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleResetData}
                  className="w-full text-xs h-8 bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 gap-1.5"
                >
                  <RotateCcw className="h-3 w-3" /> Reset Database
                </Button>
                <Button
                  type="button"
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
    </aside>
  );
}
