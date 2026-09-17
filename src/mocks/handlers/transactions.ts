import { http, HttpResponse, delay } from 'msw';
import { seedTransactions } from '../data/transactions';
import { simulationConfig } from '../config';
import { TransactionsResponse } from '@/features/transactions/types';

export const transactionHandlers = [
  http.get('/api/transactions', async ({ request }) => {
    // 1. Latency
    if (simulationConfig.latencyMs > 0) {
      await delay(simulationConfig.latencyMs);
    }

    // 2. Offline
    if (simulationConfig.offline) {
      return HttpResponse.error();
    }

    // 3. Failure
    if (simulationConfig.failureRate > 0 && Math.random() < simulationConfig.failureRate) {
      return HttpResponse.json(
        {
          code: 'FEED_FETCH_FAILED',
          message: 'Failed to synchronize transaction ledger. NIBSS gateway timeout.',
        },
        { status: 500 }
      );
    }

    const url = new URL(request.url);
    const dateRange = url.searchParams.get('dateRange') || 'all';
    const status = url.searchParams.get('status') || 'all';
    const type = url.searchParams.get('type') || 'all';
    const search = (url.searchParams.get('search') || '').toLowerCase().trim();
    const startDateParam = url.searchParams.get('startDate');
    const endDateParam = url.searchParams.get('endDate');
    const limit = parseInt(url.searchParams.get('limit') || '10000', 10);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const sevenDaysAgo = todayStart - 7 * 24 * 60 * 60 * 1000;
    const thirtyDaysAgo = todayStart - 30 * 24 * 60 * 60 * 1000;

    const filtered = seedTransactions.filter((tx) => {
      const txTime = new Date(tx.createdAt).getTime();

      // Preset Date Range Filter
      if (dateRange === 'today' && txTime < todayStart) return false;
      if (dateRange === '7d' && txTime < sevenDaysAgo) return false;
      if (dateRange === '30d' && txTime < thirtyDaysAgo) return false;

      // Custom Date Range (Start Date & End Date)
      if (startDateParam) {
        const start = new Date(startDateParam).getTime();
        if (!isNaN(start) && txTime < start) return false;
      }
      if (endDateParam) {
        const end = new Date(endDateParam);
        end.setHours(23, 59, 59, 999);
        const endTime = end.getTime();
        if (!isNaN(endTime) && txTime > endTime) return false;
      }

      // Status Filter
      if (status !== 'all' && tx.status !== status) return false;

      // Type Filter
      if (type !== 'all' && tx.type !== type) return false;

      // Search Query Filter
      if (search) {
        const matchesName =
          (tx.senderName && tx.senderName.toLowerCase().includes(search)) ||
          (tx.recipientName && tx.recipientName.toLowerCase().includes(search));
        const matchesRef = tx.reference.toLowerCase().includes(search);
        const matchesNarration = tx.narration.toLowerCase().includes(search);
        const matchesTerminal = tx.terminalId && tx.terminalId.toLowerCase().includes(search);
        const matchesAccount = tx.recipientAccount && tx.recipientAccount.includes(search);

        if (!matchesName && !matchesRef && !matchesNarration && !matchesTerminal && !matchesAccount) {
          return false;
        }
      }

      return true;
    });

    // Compute Summary stats for filtered view
    let creditVolumeKobo = 0;
    let debitVolumeKobo = 0;
    let creditCount = 0;
    let debitCount = 0;

    filtered.forEach((tx) => {
      if (tx.status === 'successful') {
        if (tx.type === 'credit') {
          creditVolumeKobo += tx.amountKobo;
          creditCount++;
        } else {
          debitVolumeKobo += tx.amountKobo;
          debitCount++;
        }
      }
    });

    const paginated = filtered.slice(offset, offset + limit);

    const response: TransactionsResponse = {
      transactions: paginated,
      totalCount: seedTransactions.length,
      filteredCount: filtered.length,
      summary: {
        totalVolumeKobo: creditVolumeKobo + debitVolumeKobo,
        totalCount: filtered.length,
        creditCount,
        debitCount,
        creditVolumeKobo,
        debitVolumeKobo,
      },
    };

    return HttpResponse.json(response);
  }),

  http.get('/api/transactions/:id', async ({ params }) => {
    if (simulationConfig.latencyMs > 0) {
      await delay(Math.min(simulationConfig.latencyMs, 200));
    }

    const { id } = params;
    const tx = seedTransactions.find((t) => t.id === id);

    if (!tx) {
      return HttpResponse.json({ message: 'Transaction not found' }, { status: 404 });
    }

    return HttpResponse.json(tx);
  }),
];
