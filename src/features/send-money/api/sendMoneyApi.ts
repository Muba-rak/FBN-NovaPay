import {
  Bank,
  Beneficiary,
  AccountResolutionResult,
  SendMoneyPayload,
  SendMoneyResponse,
} from '../types';

export async function fetchBanks(): Promise<Bank[]> {
  const res = await fetch('/api/banks');
  if (!res.ok) {
    throw new Error('Failed to fetch financial institutions directory');
  }
  return res.json();
}

export async function fetchBeneficiaries(): Promise<Beneficiary[]> {
  const res = await fetch('/api/beneficiaries');
  if (!res.ok) {
    throw new Error('Failed to fetch recent beneficiaries');
  }
  return res.json();
}

export async function resolveAccountName(
  accountNumber: string,
  bankCode: string
): Promise<AccountResolutionResult> {
  const res = await fetch('/api/banks/resolve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accountNumber, bankCode }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Could not resolve account name on NIBSS network');
  }

  return res.json();
}

export async function executeSendMoney(
  payload: SendMoneyPayload
): Promise<SendMoneyResponse> {
  const res = await fetch('/api/transfers/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': payload.idempotencyKey,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const error = new Error(
      errorData.message || 'Transfer failed. NIBSS gateway timeout.'
    );
    (error as Error & { code?: string }).code = errorData.code;
    throw error;
  }

  return res.json();
}
