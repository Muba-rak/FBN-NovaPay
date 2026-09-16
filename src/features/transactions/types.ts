export type TransactionType = 'credit' | 'debit';
export type TransactionStatus = 'successful' | 'pending' | 'failed';
export type PaymentChannel = 'pos_terminal' | 'qr_code' | 'nip_transfer' | 'ussd' | 'web_checkout';

export interface Transaction {
  id: string;
  reference: string;
  idempotencyKey?: string;
  type: TransactionType;
  channel: PaymentChannel;
  amountKobo: number;
  feeKobo: number;
  status: TransactionStatus;
  senderName?: string;
  senderBankName?: string;
  recipientName?: string;
  recipientAccount?: string;
  recipientBankName?: string;
  narration: string;
  createdAt: string;
  nibssSessionId?: string;
  terminalId?: string;
  customerPhone?: string;
}

export type DateRangeFilter = 'all' | 'today' | '7d' | '30d' | 'custom';
export type StatusFilter = 'all' | TransactionStatus;
export type TypeFilter = 'all' | TransactionType;

export interface TransactionFiltersState {
  dateRange: DateRangeFilter;
  status: StatusFilter;
  type: TypeFilter;
  search: string;
  startDate?: string;
  endDate?: string;
}

export interface TransactionsResponse {
  transactions: Transaction[];
  totalCount: number;
  filteredCount: number;
  summary: {
    totalVolumeKobo: number;
    totalCount: number;
    creditCount: number;
    debitCount: number;
    creditVolumeKobo: number;
    debitVolumeKobo: number;
  };
}
