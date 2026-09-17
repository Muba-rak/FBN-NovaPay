import { http, HttpResponse, delay } from 'msw';
import { currentBalanceState, seedTransactions } from '../data/transactions';
import { simulationConfig } from '../config';
import { Bank, Beneficiary, AccountResolutionResult, SendMoneyPayload, SendMoneyResponse } from '@/features/send-money/types';
import { Transaction } from '@/features/transactions/types';

export const NIGERIAN_BANKS_LIST: Bank[] = [
  { id: '1', name: 'First Bank of Nigeria', code: '011', slug: 'first-bank', isPopular: true },
  { id: '2', name: 'Guaranty Trust Bank (GTBank)', code: '058', slug: 'gtb', isPopular: true },
  { id: '3', name: 'Zenith Bank', code: '057', slug: 'zenith', isPopular: true },
  { id: '4', name: 'Access Bank', code: '044', slug: 'access', isPopular: true },
  { id: '5', name: 'United Bank for Africa (UBA)', code: '033', slug: 'uba', isPopular: true },
  { id: '6', name: 'Kuda Microfinance Bank', code: '50211', slug: 'kuda', isPopular: true },
  { id: '7', name: 'Moniepoint MFB', code: '50515', slug: 'moniepoint', isPopular: true },
  { id: '8', name: 'OPay Digital Services', code: '999992', slug: 'opay', isPopular: true },
  { id: '9', name: 'PalmPay', code: '999991', slug: 'palmpay', isPopular: true },
  { id: '10', name: 'Stanbic IBTC Bank', code: '221', slug: 'stanbic' },
  { id: '11', name: 'Fidelity Bank', code: '070', slug: 'fidelity' },
  { id: '12', name: 'Sterling Bank', code: '232', slug: 'sterling' },
  { id: '13', name: 'Union Bank of Nigeria', code: '032', slug: 'union' },
  { id: '14', name: 'Wema Bank (ALAT)', code: '035', slug: 'wema' },
  { id: '15', name: 'Polaris Bank', code: '076', slug: 'polaris' },
];

export const INITIAL_BENEFICIARIES: Beneficiary[] = [
  {
    id: 'ben-1',
    name: 'CHINEDU AHMADU BELLO',
    accountNumber: '0123456789',
    bankCode: '011',
    bankName: 'First Bank of Nigeria',
    lastUsed: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'ben-2',
    name: 'GOLDEN PENNY FLOUR MILLS LTD',
    accountNumber: '2049281742',
    bankCode: '058',
    bankName: 'Guaranty Trust Bank (GTBank)',
    lastUsed: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: 'ben-3',
    name: 'CHI FARMS LOGISTICS LTD',
    accountNumber: '1029384756',
    bankCode: '057',
    bankName: 'Zenith Bank',
    lastUsed: new Date(Date.now() - 259200000).toISOString(),
  },
  {
    id: 'ben-4',
    name: 'IKEJA ELECTRIC PLC DISCO',
    accountNumber: '0492817263',
    bankCode: '044',
    bankName: 'Access Bank',
    lastUsed: new Date(Date.now() - 345600000).toISOString(),
  },
];

// In-memory processed idempotency keys to prevent double-spending
const processedIdempotencyMap = new Map<string, SendMoneyResponse>();

export const transferHandlers = [
  // 1. Bank Directory
  http.get('/api/banks', async () => {
    return HttpResponse.json(NIGERIAN_BANKS_LIST);
  }),

  // 2. Beneficiaries List
  http.get('/api/beneficiaries', async () => {
    return HttpResponse.json(INITIAL_BENEFICIARIES);
  }),

  // 3. Simulated NIBSS Name Inquiry Resolution
  http.post('/api/banks/resolve', async ({ request }) => {
    if (simulationConfig.latencyMs > 0) {
      await delay(Math.min(simulationConfig.latencyMs, 400));
    }

    const body = (await request.json()) as { accountNumber: string; bankCode: string };
    const { accountNumber, bankCode } = body;

    if (!accountNumber || accountNumber.length !== 10) {
      return HttpResponse.json(
        { message: 'NUBAN account number must be exactly 10 digits' },
        { status: 400 }
      );
    }

    // Deterministic simulated name resolution
    const sampleNames = [
      'CHINEDU AHMADU BELLO',
      'ALHERI COMMODITIES VENTURES',
      'FATIMA OLUWAKEMI ADEYEMI',
      'EMMANUEL OBIORA NWOSU',
      'ZAINAB IBRAHIM SULEIMAN',
      'GOLDEN PENNY FLOUR MILLS LTD',
      'BABATUNDE RASHEED BAKARE',
    ];

    const charSum = accountNumber.split('').reduce((acc, c) => acc + parseInt(c, 10), 0);
    const resolvedName = sampleNames[charSum % sampleNames.length];

    const result: AccountResolutionResult = {
      accountNumber,
      bankCode,
      accountName: resolvedName,
      status: 'valid',
      bvnLinked: true,
    };

    return HttpResponse.json(result);
  }),

  // 4. Send Money Transfer Execution
  http.post('/api/transfers/send', async ({ request }) => {
    // A. Simulated Latency
    if (simulationConfig.latencyMs > 0) {
      await delay(simulationConfig.latencyMs);
    }

    // B. Simulated Offline Mode
    if (simulationConfig.offline) {
      return HttpResponse.error();
    }

    // C. Simulated Failure Rate (e.g. for testing optimistic rollback)
    if (simulationConfig.failureRate > 0 && Math.random() < simulationConfig.failureRate) {
      return HttpResponse.json(
        {
          code: 'NIBSS_ROUTING_FAILURE',
          message: 'Transfer rejected by destination switch. NIBSS timeout error (91). Balance was not debited.',
        },
        { status: 500 }
      );
    }

    const idempotencyKey = request.headers.get('Idempotency-Key');
    const payload = (await request.json()) as SendMoneyPayload;

    // Check if this idempotency key was already executed
    if (idempotencyKey && processedIdempotencyMap.has(idempotencyKey)) {
      const cached = processedIdempotencyMap.get(idempotencyKey)!;
      return HttpResponse.json(cached);
    }

    // Validate PIN
    if (payload.pin !== '1234' && payload.pin !== '0000') {
      return HttpResponse.json(
        {
          code: 'INVALID_PIN',
          message: 'Incorrect 4-digit transaction PIN. (Demo PIN is 1234)',
        },
        { status: 400 }
      );
    }

    const totalDebitKobo = payload.amountKobo + (payload.feeKobo || 1075);

    // Validate Balance
    if (totalDebitKobo > currentBalanceState.availableBalanceKobo) {
      return HttpResponse.json(
        {
          code: 'INSUFFICIENT_FUNDS',
          message: 'Insufficient merchant wallet balance to complete this transfer.',
        },
        { status: 400 }
      );
    }

    // Deduct Balance
    currentBalanceState.availableBalanceKobo -= totalDebitKobo;
    currentBalanceState.todayOutflowKobo += totalDebitKobo;

    const txId = `TX-FBN-${Date.now().toString().slice(-6)}`;
    const reference = `FBN-${Date.now().toString().slice(-8)}`;
    const nibssSessionId = `999011${Date.now()}`;
    const createdAt = new Date().toISOString();

    const newTx: Transaction = {
      id: txId,
      reference,
      idempotencyKey: payload.idempotencyKey || idempotencyKey || undefined,
      type: 'debit',
      channel: 'nip_transfer',
      amountKobo: payload.amountKobo,
      feeKobo: payload.feeKobo || 1075,
      status: 'successful',
      senderName: currentBalanceState.merchantName,
      recipientName: payload.recipientName,
      recipientAccount: payload.recipientAccount,
      recipientBankName: payload.recipientBankName,
      narration: payload.narration || 'Transfer from NovaBiz',
      createdAt,
      nibssSessionId,
    };

    // Prepend to transaction ledger
    seedTransactions.unshift(newTx);

    const response: SendMoneyResponse = {
      success: true,
      transactionId: txId,
      reference,
      idempotencyKey: payload.idempotencyKey || idempotencyKey || '',
      nibssSessionId,
      amountKobo: payload.amountKobo,
      feeKobo: payload.feeKobo || 1075,
      recipientName: payload.recipientName,
      recipientAccount: payload.recipientAccount,
      recipientBankName: payload.recipientBankName,
      createdAt,
      status: 'successful',
      newAvailableBalanceKobo: currentBalanceState.availableBalanceKobo,
    };

    if (idempotencyKey) {
      processedIdempotencyMap.set(idempotencyKey, response);
    }

    return HttpResponse.json(response);
  }),
];
