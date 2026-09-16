import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BalanceCard } from '../components/BalanceCard';
import { DailySummary } from '../components/DailySummary';
import { ToastProvider } from '@/components/ui/toast';
import { initialMerchantBalance } from '@/mocks/data/transactions';

// Wrapper with ToastProvider
function renderWithToast(ui: React.ReactElement) {
  return render(<ToastProvider>{ui}</ToastProvider>);
}

describe('BalanceCard Component', () => {
  it('renders merchant name, KYC Tier 3, and formatted balance in Naira from kobo', () => {
    renderWithToast(
      <BalanceCard
        balance={initialMerchantBalance}
        onOpenSendMoney={vi.fn()}
      />
    );

    // Initial balance is 384525000 kobo = ₦3,845,250.00
    expect(screen.getByText('ALHERI SUPERMARKET & WHOLESALE')).toBeInTheDocument();
    expect(screen.getByText('Tier 3')).toBeInTheDocument();
    expect(screen.getByText('₦3,845,250.00')).toBeInTheDocument();
    expect(screen.getByText(/3049281029/)).toBeInTheDocument();
  });

  it('toggles balance visibility when eye icon is clicked', () => {
    renderWithToast(
      <BalanceCard
        balance={initialMerchantBalance}
        onOpenSendMoney={vi.fn()}
      />
    );

    const toggleBtn = screen.getByLabelText('Hide balance amount');
    expect(screen.getByText('₦3,845,250.00')).toBeInTheDocument();

    // Click to hide
    fireEvent.click(toggleBtn);
    expect(screen.queryByText('₦3,845,250.00')).not.toBeInTheDocument();
    expect(screen.getAllByText('₦ ••••••••').length).toBe(2);

    // Click to reveal
    const revealBtn = screen.getByLabelText('Reveal balance amount');
    fireEvent.click(revealBtn);
    expect(screen.getByText('₦3,845,250.00')).toBeInTheDocument();
  });

  it('triggers onOpenSendMoney callback when Send Money CTA is clicked', () => {
    const handleSend = vi.fn();
    renderWithToast(
      <BalanceCard
        balance={initialMerchantBalance}
        onOpenSendMoney={handleSend}
      />
    );

    const sendBtn = screen.getByRole('button', { name: /Send Money/i });
    fireEvent.click(sendBtn);
    expect(handleSend).toHaveBeenCalledTimes(1);
  });
});

describe('DailySummary Component', () => {
  it('correctly calculates and formats Today Inflow, Outflow, and Net Gain', () => {
    renderWithToast(<DailySummary balance={initialMerchantBalance} />);

    // Inflow: 84250000 kobo = ₦842,500.00
    expect(screen.getByText('₦842,500.00')).toBeInTheDocument();
    // Outflow: 12500000 kobo = ₦125,000.00
    expect(screen.getByText('₦125,000.00')).toBeInTheDocument();
    // Net: 84250000 - 12500000 = 71750000 kobo = +₦717,500.00
    expect(screen.getByText('+₦717,500.00')).toBeInTheDocument();
    // Pending settlement: 7475000 kobo = ₦74,750.00
    expect(screen.getByText('₦74,750.00')).toBeInTheDocument();
  });
});
