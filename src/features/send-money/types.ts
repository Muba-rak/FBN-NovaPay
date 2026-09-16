export interface Bank {
  id: string;
  name: string;
  code: string;
  slug: string;
  isPopular?: boolean;
}

export interface Beneficiary {
  id: string;
  name: string;
  accountNumber: string;
  bankCode: string;
  bankName: string;
  lastUsed: string;
}

export interface AccountResolutionResult {
  accountNumber: string;
  bankCode: string;
  accountName: string;
  status: 'valid' | 'invalid';
  bvnLinked?: boolean;
}

export interface SendMoneyPayload {
  recipientAccount: string;
  recipientBankCode: string;
  recipientBankName: string;
  recipientName: string;
  amountKobo: number;
  feeKobo: number;
  narration: string;
  pin: string;
  idempotencyKey: string;
  saveBeneficiary?: boolean;
}

export interface SendMoneyResponse {
  success: boolean;
  transactionId: string;
  reference: string;
  idempotencyKey: string;
  nibssSessionId: string;
  amountKobo: number;
  feeKobo: number;
  recipientName: string;
  recipientAccount: string;
  recipientBankName: string;
  createdAt: string;
  status: 'successful';
  newAvailableBalanceKobo: number;
}
