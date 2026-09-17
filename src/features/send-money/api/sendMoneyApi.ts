import {
  Bank,
  Beneficiary,
  AccountResolutionResult,
  SendMoneyPayload,
  SendMoneyResponse,
} from '../types';
import { NIGERIAN_BANKS_LIST, INITIAL_BENEFICIARIES } from '@/mocks/handlers/transfers';

export async function fetchBanks(): Promise<Bank[]> {
  try {
    const res = await fetch('/api/banks');
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch {
    // Network or service worker initialization failure
  }
  // Fall back to bundled banks directory if MSW hasn't claimed client or network dropped
  return NIGERIAN_BANKS_LIST;
}

export async function fetchBeneficiaries(): Promise<Beneficiary[]> {
  try {
    const res = await fetch('/api/beneficiaries');
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (Array.isArray(data)) {
        return data;
      }
    }
  } catch {
    // Network or service worker initialization failure
  }
  return INITIAL_BENEFICIARIES;
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

  const contentType = res.headers.get('content-type') || '';
  if (!res.ok || !contentType.includes('application/json')) {
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

  const contentType = res.headers.get('content-type') || '';
  if (!res.ok || !contentType.includes('application/json')) {
    const errorData = await res.json().catch(() => ({}));
    const error = new Error(
      errorData.message || 'Transfer failed. NIBSS gateway timeout.'
    );
    (error as Error & { code?: string }).code = errorData.code;
    throw error;
  }

  return res.json();
}
