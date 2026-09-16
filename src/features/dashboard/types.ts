export interface WalletBalance {
  merchantId: string;
  merchantName: string;
  accountNumber: string;
  bankName: string;
  kycTier: string;
  currency: 'NGN';
  availableBalanceKobo: number;
  ledgerBalanceKobo: number;
  todayInflowKobo: number;
  todayOutflowKobo: number;
  pendingSettlementKobo: number;
  posTerminalCount: number;
  activeTerminalId: string;
}
