import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MockApiDrawer } from '../MockApiDrawer';
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

describe('MockApiDrawer Component', () => {
  beforeEach(() => {
    resetSimulationConfig();
    vi.clearAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    renderWithProviders(<MockApiDrawer isOpen={false} onClose={vi.fn()} />);
    expect(screen.queryByText('Mock API controls')).not.toBeInTheDocument();
  });

  it('renders title, transfer options, and settlement options when isOpen is true', () => {
    renderWithProviders(<MockApiDrawer isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByText('Mock API controls')).toBeInTheDocument();
    expect(screen.getByText('A simulated bank server. Changes apply to the next requests.')).toBeInTheDocument();

    // Next transfer & settlement options
    expect(screen.getAllByText('Nothing forced')).toHaveLength(2);
    expect(screen.getByText('Succeeds')).toBeInTheDocument();

    expect(screen.getByText('Error, nothing sent')).toBeInTheDocument();
    expect(screen.getByText('Error, money sent')).toBeInTheDocument();
    expect(screen.getByText('Timeout, nothing sent')).toBeInTheDocument();
    expect(screen.getByText('Timeout, money sent')).toBeInTheDocument();

    // Next settlement options
    expect(screen.getByText('Settles')).toBeInTheDocument();
    expect(screen.getByText('Fails to settle')).toBeInTheDocument();
  });

  it('updates nextTransferBehavior when an option is selected', () => {
    renderWithProviders(<MockApiDrawer isOpen={true} onClose={vi.fn()} />);

    const errorMoneySent = screen.getByText('Error, money sent');
    fireEvent.click(errorMoneySent);

    expect(simulationConfig.nextTransferBehavior).toBe('error_money_sent');
  });

  it('updates nextSettlementBehavior when settlement option is selected', () => {
    renderWithProviders(<MockApiDrawer isOpen={true} onClose={vi.fn()} />);

    const settlesBtn = screen.getByText('Settles');
    fireEvent.click(settlesBtn);

    expect(simulationConfig.nextSettlementBehavior).toBe('settles');
  });

  it('calls onClose when close X button or Escape key is pressed', () => {
    const onClose = vi.fn();
    renderWithProviders(<MockApiDrawer isOpen={true} onClose={onClose} />);

    const closeBtn = screen.getByLabelText('Close Mock API controls');
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
