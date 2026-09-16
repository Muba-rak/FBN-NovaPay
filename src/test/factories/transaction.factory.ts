export interface TransactionMock {
  id: string;
  reference: string;
  idempotencyKey?: string;
  type: 'credit' | 'debit';
  channel: 'pos_terminal' | 'qr_code' | 'nip_transfer' | 'ussd' | 'web_checkout';
  amountKobo: number;
  feeKobo: number;
  status: 'successful' | 'pending' | 'failed';
  senderName?: string;
  recipientName?: string;
  recipientAccount?: string;
  recipientBankName?: string;
  narration: string;
  createdAt: string;
  nibssSessionId?: string;
  customerPhone?: string;
}

let idCounter = 1;

export function createMockTransaction(overrides: Partial<TransactionMock> = {}): TransactionMock {
  const id = `tx-${idCounter++}`;
  const isCredit = overrides.type ? overrides.type === 'credit' : true;

  return {
    id,
    reference: `FBN-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`,
    type: isCredit ? 'credit' : 'debit',
    channel: 'pos_terminal',
    amountKobo: 250000, // ₦2,500.00
    feeKobo: isCredit ? 0 : 1075,
    status: 'successful',
    recipientName: isCredit ? 'ALHERI SUPERMARKET' : 'CHINEDU AHMADU BELLO',
    recipientAccount: isCredit ? undefined : '0123456789',
    recipientBankName: isCredit ? undefined : 'First Bank of Nigeria',
    senderName: isCredit ? 'BABATUNDE ADENLE' : 'ALHERI SUPERMARKET',
    narration: isCredit ? 'POS Terminal Collection' : 'NIP Merchant Outflow',
    createdAt: new Date().toISOString(),
    nibssSessionId: `999001${Date.now().toString().slice(-10)}`,
    ...overrides,
  };
}

export function createMockTransactions(count: number): TransactionMock[] {
  return Array.from({ length: count }, (_, i) =>
    createMockTransaction({
      id: `tx-${i + 1}`,
      createdAt: new Date(Date.now() - i * 3600000).toISOString(),
    })
  );
}
