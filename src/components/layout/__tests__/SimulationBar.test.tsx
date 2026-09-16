import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SimulationBar } from '../SimulationBar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/ui/toast';
import { simulationConfig, resetSimulationConfig } from '@/mocks/config';

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        {ui}
      </ToastProvider>
    </QueryClientProvider>
  );
}

describe('SimulationBar Component', () => {
  beforeEach(() => {
    resetSimulationConfig();
    vi.clearAllMocks();
  });

  it('renders collapsed state with header and current latency badge', () => {
    const onToggle = vi.fn();
    renderWithProviders(<SimulationBar isOpen={false} onToggle={onToggle} />);

    expect(screen.getByText('MSW Simulation Controls')).toBeInTheDocument();
    expect(screen.getByText(/Latency:/)).toBeInTheDocument();
    expect(screen.queryByLabelText('Simulated latency in milliseconds')).not.toBeInTheDocument();
  });

  it('calls onToggle when header button is clicked', () => {
    const onToggle = vi.fn();
    renderWithProviders(<SimulationBar isOpen={false} onToggle={onToggle} />);

    const toggleBtn = screen.getByRole('button', { name: /MSW Simulation Controls/i });
    fireEvent.click(toggleBtn);
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('renders expanded controls when isOpen is true', () => {
    const onToggle = vi.fn();
    renderWithProviders(<SimulationBar isOpen={true} onToggle={onToggle} />);

    expect(screen.getByLabelText('Simulated latency in milliseconds')).toBeInTheDocument();
    expect(screen.getByText('Simulated Latency')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Set failure rate to 100%/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Go Offline/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reset Database/i })).toBeInTheDocument();
  });

  it('updates latency when a preset button is clicked', () => {
    renderWithProviders(<SimulationBar isOpen={true} onToggle={vi.fn()} />);

    const presetBtn = screen.getByRole('button', { name: '800ms' });
    fireEvent.click(presetBtn);

    expect(simulationConfig.latencyMs).toBe(800);
  });

  it('updates failure rate when failure preset is clicked', () => {
    renderWithProviders(<SimulationBar isOpen={true} onToggle={vi.fn()} />);

    const fail100Btn = screen.getByRole('button', { name: /Set failure rate to 100%/i });
    fireEvent.click(fail100Btn);

    expect(simulationConfig.failureRate).toBe(1.0);
  });

  it('toggles offline mode', () => {
    renderWithProviders(<SimulationBar isOpen={true} onToggle={vi.fn()} />);

    const offlineBtn = screen.getByRole('button', { name: /Go Offline/i });
    fireEvent.click(offlineBtn);

    expect(simulationConfig.offline).toBe(true);
  });

  it('triggers onToggle when Ctrl+Shift+D keyboard shortcut is pressed', () => {
    const onToggle = vi.fn();
    renderWithProviders(<SimulationBar isOpen={false} onToggle={onToggle} />);

    fireEvent.keyDown(window, { key: 'd', ctrlKey: true, shiftKey: true });
    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});
