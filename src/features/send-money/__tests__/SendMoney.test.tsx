import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/ui/toast';
import { SendMoneyModal } from '../components/SendMoneyModal';
import { StepAmount } from '../components/StepAmount';
import { StepReview } from '../components/StepReview';
import { StepPin } from '../components/StepPin';
import { server } from '@/mocks/server';
import { http, HttpResponse } from 'msw';
import { initialMerchantBalance } from '@/mocks/data/transactions';

function createTestQueryClient() {
  const qc = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: Infinity },
      mutations: { retry: false },
    },
  });
  qc.setQueryData(['wallet', 'balance'], initialMerchantBalance);
  return qc;
}

function renderWithProviders(ui: React.ReactElement, customClient?: QueryClient) {
  const queryClient = customClient || createTestQueryClient();
  return {
    queryClient,
    ...render(
      <QueryClientProvider client={queryClient}>
        <ToastProvider>{ui}</ToastProvider>
      </QueryClientProvider>
    ),
  };
}

describe('StepAmount Component', () => {
  it('allows picking quick amount chips and displays fee breakdown', () => {
    const handleChangeAmount = vi.fn();
    const handleChangeNarration = vi.fn();
    const handleNext = vi.fn();
    const handleBack = vi.fn();

    renderWithProviders(
      <StepAmount
        amountKobo={500000} // ₦5,000.00
        narration=""
        recipientName="CHINEDU AHMADU BELLO"
        recipientAccount="0123456789"
        recipientBankName="First Bank of Nigeria"
        onChangeAmountKobo={handleChangeAmount}
        onChangeNarration={handleChangeNarration}
        onBack={handleBack}
        onNext={handleNext}
      />
    );

    expect(screen.getByText('CHINEDU AHMADU BELLO')).toBeInTheDocument();
    expect(screen.getByText('₦5,000')).toBeInTheDocument();

    // Click ₦20,000 quick chip
    fireEvent.click(screen.getByRole('button', { name: '₦20,000' }));
    expect(handleChangeAmount).toHaveBeenCalledWith(2000000);

    // Proceed to Review
    const proceedBtn = screen.getByRole('button', { name: /Review Transfer/i });
    expect(proceedBtn).not.toBeDisabled();
    fireEvent.click(proceedBtn);
    expect(handleNext).toHaveBeenCalledTimes(1);
  });

  it('disables proceed button and shows error when amount exceeds wallet balance', () => {
    renderWithProviders(
      <StepAmount
        amountKobo={400000000} // ₦4,000,000.00 exceeds ₦3,845,250.00 available balance
        narration=""
        recipientName="CHINEDU AHMADU BELLO"
        recipientAccount="0123456789"
        recipientBankName="First Bank of Nigeria"
        onChangeAmountKobo={vi.fn()}
        onChangeNarration={vi.fn()}
        onBack={vi.fn()}
        onNext={vi.fn()}
      />
    );

    expect(screen.getByRole('alert')).toHaveTextContent(/Insufficient wallet balance/i);
    expect(screen.getByRole('button', { name: /Review Transfer/i })).toBeDisabled();
  });
});

describe('StepReview Component', () => {
  it('displays accurate total debit including ₦10.75 NIP fee', () => {
    renderWithProviders(
      <StepReview
        recipientName="CHINEDU AHMADU BELLO"
        recipientAccount="0123456789"
        recipientBankName="First Bank of Nigeria"
        amountKobo={500000} // ₦5,000.00
        narration="Supplies invoice"
        onBack={vi.fn()}
        onNext={vi.fn()}
      />
    );

    // Amount: ₦5,000.00 appears in hero & table
    expect(screen.getAllByText('₦5,000.00').length).toBeGreaterThanOrEqual(1);
    // Fee: ₦10.75
    expect(screen.getByText('₦10.75')).toBeInTheDocument();
    // Total Debit: ₦5,010.75
    expect(screen.getByText('₦5,010.75')).toBeInTheDocument();
    expect(screen.getByText('Supplies invoice')).toBeInTheDocument();
  });
});

describe('StepPin Component', () => {
  it('accepts 4 digits and enables authorization button', () => {
    const handleChangePin = vi.fn();
    const handleSubmit = vi.fn();

    renderWithProviders(
      <StepPin
        pin="1234"
        amountKobo={500000}
        recipientName="CHINEDU AHMADU BELLO"
        isSubmitting={false}
        onChangePin={handleChangePin}
        onSubmit={handleSubmit}
        onBack={vi.fn()}
      />
    );

    const authBtn = screen.getByRole('button', { name: /Authorize Transfer/i });
    expect(authBtn).not.toBeDisabled();
    fireEvent.click(authBtn);
    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });
});

describe('SendMoney Multi-Step Flow Integration & Rollback', () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  it('completes the full transfer flow from recipient selection to confirmation', async () => {
    const handleClose = vi.fn();
    renderWithProviders(<SendMoneyModal isOpen={true} onClose={handleClose} />);

    // Step 1: Select popular bank (First Bank)
    const firstBankChip = await screen.findByRole('button', { name: /First Bank/i });
    fireEvent.click(firstBankChip);

    // Enter 10-digit NUBAN
    const nubanInput = screen.getByPlaceholderText('0123456789');
    fireEvent.change(nubanInput, { target: { value: '0123456789' } });

    // Wait for simulated NIBSS Name resolution
    await waitFor(() => {
      expect(screen.getByText(/Verified Account Holder/i)).toBeInTheDocument();
    });

    // Advance to Step 2: Amount
    const proceedToAmount = screen.getByRole('button', { name: /Proceed to Amount/i });
    fireEvent.click(proceedToAmount);

    // Pick ₦10,000 quick chip
    const amountChip = await screen.findByRole('button', { name: '₦10,000' });
    fireEvent.click(amountChip);

    // Advance to Step 3: Review
    const reviewBtn = screen.getByRole('button', { name: /Review Transfer/i });
    fireEvent.click(reviewBtn);

    // Verify Review fee breakdown
    await waitFor(() => {
      expect(screen.getByText('₦10,010.75')).toBeInTheDocument();
    });

    // Advance to Step 4: PIN
    const enterPinBtn = screen.getByRole('button', { name: /Enter Transaction PIN/i });
    fireEvent.click(enterPinBtn);

    // Enter PIN "1234"
    const pinInput = screen.getByLabelText(/Enter 4-digit transaction PIN/i);
    fireEvent.change(pinInput, { target: { value: '1234' } });

    // Submit
    const authBtn = screen.getByRole('button', { name: /Authorize Transfer/i });
    fireEvent.click(authBtn);

    // Verify Success Screen
    await waitFor(() => {
      expect(screen.getByText(/Transfer Successful/i)).toBeInTheDocument();
    });
  });

  it('gracefully rolls back balance and displays error when transfer endpoint fails', async () => {
    // Override /api/transfers/send to simulate NIBSS switch failure
    server.use(
      http.post('/api/transfers/send', () => {
        return HttpResponse.json(
          {
            code: 'NIBSS_GATEWAY_TIMEOUT',
            message: 'NIBSS switch connection timed out. Transfer was not debited.',
          },
          { status: 500 }
        );
      })
    );

    const queryClient = createTestQueryClient();
    renderWithProviders(<SendMoneyModal isOpen={true} onClose={vi.fn()} />, queryClient);

    // Select bank & NUBAN
    const firstBankChip = await screen.findByRole('button', { name: /First Bank/i });
    fireEvent.click(firstBankChip);

    const nubanInput = screen.getByPlaceholderText('0123456789');
    fireEvent.change(nubanInput, { target: { value: '0123456789' } });

    await waitFor(() => {
      expect(screen.getByText(/Verified Account Holder/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Proceed to Amount/i }));

    const amountChip = await screen.findByRole('button', { name: '₦10,000' });
    fireEvent.click(amountChip);

    fireEvent.click(screen.getByRole('button', { name: /Review Transfer/i }));
    fireEvent.click(screen.getByRole('button', { name: /Enter Transaction PIN/i }));

    // Enter PIN "1234"
    const pinInput = screen.getByLabelText(/Enter 4-digit transaction PIN/i);
    fireEvent.change(pinInput, { target: { value: '1234' } });

    fireEvent.click(screen.getByRole('button', { name: /Authorize Transfer/i }));

    // Verify error alert is displayed
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        /NIBSS switch connection timed out/i
      );
    });

    // Verify balance is intact in queryClient cache
    const currentCache = queryClient.getQueryData<typeof initialMerchantBalance>(['wallet', 'balance']);
    expect(currentCache?.availableBalanceKobo).toBe(initialMerchantBalance.availableBalanceKobo);
  });
});
