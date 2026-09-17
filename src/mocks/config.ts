/**
 * MSW Dynamic Network Simulation Configuration
 * 
 * Allows real-time interactive adjustment of latency (0 - 3000ms),
 * simulated failure rates (0% - 100%), and network disconnects (offline mode).
 */

export interface SimulationConfig {
  latencyMs: number;
  failureRate: number; // 0.0 to 1.0 (e.g. 0.25 = 25% failure)
  offline: boolean;
}

const STORAGE_KEY = 'fbn_novapay_simulation_config';

const defaultConfig: SimulationConfig = {
  latencyMs: 350,
  failureRate: 0.0,
  offline: false,
};

function loadStoredConfig(): SimulationConfig {
  if (typeof window === 'undefined') return defaultConfig;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return { ...defaultConfig, ...JSON.parse(raw) };
    }
  } catch {
    // Ignore parse errors
  }
  return defaultConfig;
}

export const simulationConfig: SimulationConfig = loadStoredConfig();

export type SimulationChangeListener = (config: SimulationConfig) => void;
const listeners = new Set<SimulationChangeListener>();

export function updateSimulationConfig(newConfig: Partial<SimulationConfig>) {
  Object.assign(simulationConfig, newConfig);
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(simulationConfig));
    } catch {
      // Storage full or unavailable
    }
  }
  listeners.forEach((listener) => listener({ ...simulationConfig }));
}

export function resetSimulationConfig() {
  updateSimulationConfig(defaultConfig);
}

export function subscribeSimulationConfig(listener: SimulationChangeListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
