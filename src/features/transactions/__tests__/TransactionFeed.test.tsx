import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/ui/toast';
import { TransactionFeed } from '../components/TransactionFeed';
import { TransactionRow } from '../components/TransactionRow';
import { TransactionFilters } from '../components/TransactionFilters';
import { TransactionReceiptModal } from '../components/TransactionReceiptModal';
import { Transaction } from '../types';
import { server } from '@/mocks/server';
import { http, HttpResponse } from 'msw';

const mockTransaction: Transaction = {
  id: 'tx_test_001',
  reference: 'FBN-NIP-2026-99901',
  type: 'credit',
  channel: 'pos_terminal',
  amountKobo: 2500000, // ₦25,000.00
  feeKobo: 0,
  status: 'successful',
  senderName: 'MALLAM AUDU BELLO',
  recipientName: 'ALHERI SUPERMARKET',
  narration: 'POS Purchase / POS-01',
  createdAt: '2026-09-15T14:30:00.000Z',
  nibssSessionId: '999018273645192837465',
  terminalId: 'FBN-POS-77492',
};

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
      },
    },
  });
}

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>{ui}</ToastProvider>
    </QueryClientProvider>
  );
}

describe('TransactionRow Component', () => {
  it('renders credit transaction with correct formatted amount, status, and counterparty', () => {
    const handleSelect = vi.fn();
    renderWithProviders(
      <TransactionRow transaction={mockTransaction} onSelect={handleSelect} />
    );

    // Amount: ₦25,000.00 with + sign
    expect(screen.getByText('+₦25,000.00')).toBeInTheDocument();
    expect(screen.getByText('MALLAM AUDU BELLO')).toBeInTheDocument();
    expect(screen.getByText('FBN-NIP-2026-99901')).toBeInTheDocument();
    expect(screen.getByText('Successful')).toBeInTheDocument();
  });

  it('triggers onSelect when clicked or when Enter key is pressed', () => {
    const handleSelect = vi.fn();
    renderWithProviders(
      <TransactionRow transaction={mockTransaction} onSelect={handleSelect} />
    );

    const row = screen.getByRole('button', {
      name: /Transaction FBN-NIP-2026-99901/i,
    });

    // Click
    fireEvent.click(row);
    expect(handleSelect).toHaveBeenCalledTimes(1);

    // Keyboard Enter
    fireEvent.keyDown(row, { key: 'Enter', code: 'Enter' });
    expect(handleSelect).toHaveBeenCalledTimes(2);
  });
});

describe('TransactionFilters Component', () => {
  it('renders search input and select dropdown filters', () => {
    const handleSearch = vi.fn();
    const handleStatus = vi.fn();
    const handleDate = vi.fn();
    const handleType = vi.fn();
    const handleReset = vi.fn();

    render(
      <TransactionFilters
        filters={{ dateRange: 'all', status: 'all', type: 'all', search: '' }}
        onSearchChange={handleSearch}
        onDateRangeChange={handleDate}
        onStatusChange={handleStatus}
        onTypeChange={handleType}
        onResetFilters={handleReset}
        hasActiveFilters={false}
        totalFilteredCount={100}
      />
    );

    expect(
      screen.getByPlaceholderText(/Search by customer, reference/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /Date Range filter/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /Status filter/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /Type filter/i })).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('renders custom date range pickers when dateRange is custom and triggers callbacks', () => {
    const handleStartDate = vi.fn();
    const handleEndDate = vi.fn();

    render(
      <TransactionFilters
        filters={{
          dateRange: 'custom',
          status: 'all',
          type: 'all',
          search: '',
          startDate: '2026-09-01',
          endDate: '2026-09-15',
        }}
        onSearchChange={vi.fn()}
        onDateRangeChange={vi.fn()}
        onStartDateChange={handleStartDate}
        onEndDateChange={handleEndDate}
        onStatusChange={vi.fn()}
        onTypeChange={vi.fn()}
        onResetFilters={vi.fn()}
        hasActiveFilters={true}
      />
    );

    const startInput = screen.getByLabelText(/Start date/i);
    const endInput = screen.getByLabelText(/End date/i);

    expect(startInput).toHaveValue('2026-09-01');
    expect(endInput).toHaveValue('2026-09-15');

    fireEvent.change(startInput, { target: { value: '2026-09-05' } });
    expect(handleStartDate).toHaveBeenCalledWith('2026-09-05');

    fireEvent.change(endInput, { target: { value: '2026-09-10' } });
    expect(handleEndDate).toHaveBeenCalledWith('2026-09-10');

    // Clear dates button
    const clearDatesBtn = screen.getByRole('button', { name: /Clear Dates/i });
    expect(clearDatesBtn).toBeInTheDocument();
    fireEvent.click(clearDatesBtn);
    expect(handleStartDate).toHaveBeenCalledWith(undefined);
    expect(handleEndDate).toHaveBeenCalledWith(undefined);
  });
});

describe('TransactionReceiptModal Component', () => {
  it('displays receipt breakdown with NIBSS session ID, terminal, and amount', () => {
    const handleClose = vi.fn();
    renderWithProviders(
      <TransactionReceiptModal
        transaction={mockTransaction}
        isOpen={true}
        onClose={handleClose}
      />
    );

    expect(screen.getByText('₦25,000.00')).toBeInTheDocument();
    expect(screen.getByText('MALLAM AUDU BELLO')).toBeInTheDocument();
    expect(screen.getByText('FBN-POS-77492')).toBeInTheDocument();
    expect(screen.getByText('999018273645192837465')).toBeInTheDocument();
  });
});

describe('TransactionFeed Integration', () => {
  it('loads and renders the transaction ledger with summary stats', async () => {
    renderWithProviders(<TransactionFeed />);

    // Feed Title
    expect(screen.getByText('Transaction Ledger')).toBeInTheDocument();

    // Wait for MSW mock data to load
    await waitFor(
      () => {
        expect(
          screen.getByRole('region', {
            name: /Virtualized transaction history list/i,
          })
        ).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it('renders explicit user-friendly error state with retry button when API fails', async () => {
    server.use(
      http.get('/api/transactions', () => {
        return HttpResponse.json(
          { message: 'Database connection failed.' },
          { status: 500 }
        );
      })
    );

    renderWithProviders(<TransactionFeed />);

    await waitFor(() => {
      expect(screen.getByText('Unable to load transaction history')).toBeInTheDocument();
    });

    expect(
      screen.getByText(/We couldn't synchronize your transaction ledger. This is usually temporary/)
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: /Retry Loading Transactions/i })
    ).toBeInTheDocument();
  });

  it('renders clean empty state when no transactions exist for new merchant', async () => {
    server.use(
      http.get('/api/transactions', () => {
        return HttpResponse.json({
          transactions: [],
          total: 0,
          page: 1,
          limit: 50,
          totalPages: 0,
          hasMore: false,
          summary: {
            creditVolumeKobo: 0,
            debitVolumeKobo: 0,
            creditCount: 0,
            debitCount: 0,
          },
        });
      })
    );

    renderWithProviders(<TransactionFeed onOpenSendMoney={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Your transaction ledger is ready')).toBeInTheDocument();
    });

    expect(
      screen.getByText(/You haven't made or received any payments yet. Tap below to initiate your first transfer./)
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: /Make a Transfer/i })
    ).toBeInTheDocument();
  });
});
