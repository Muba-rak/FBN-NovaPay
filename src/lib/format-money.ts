/**
 * Financial Currency & Kobo Integer Precision Utilities
 * FirstBank NovaPay / NovaBiz Merchant Module
 * 
 * GOLDEN RULE: All money inside the app is stored and calculated as integer kobo (1 Naira = 100 kobo)
 * to avoid IEEE 754 floating-point rounding drift.
 */

/**
 * Formats a kobo integer into standard Naira currency string.
 * Example: 100050 kobo -> "₦1,000.50"
 * Example: 0 kobo -> "₦0.00"
 * Example: -50000 kobo -> "-₦500.00"
 */
export function formatKoboToNaira(
  kobo: number | null | undefined,
  options?: {
    showCurrencySymbol?: boolean;
    compact?: boolean;
    showSign?: boolean;
  }
): string {
  if (kobo === null || kobo === undefined || isNaN(kobo) || !isFinite(kobo)) {
    return options?.showCurrencySymbol === false ? '0.00' : '₦0.00';
  }

  const isNegative = kobo < 0;
  const absKobo = Math.abs(Math.round(kobo));
  const absNaira = absKobo / 100;
  const { showCurrencySymbol = true, compact = false, showSign = false } = options || {};

  if (compact && absNaira >= 1000) {
    const compactFormatter = new Intl.NumberFormat('en-NG', {
      notation: 'compact',
      compactDisplay: 'short',
      maximumFractionDigits: 1,
    });
    const prefix = isNegative ? '-' : showSign ? '+' : '';
    const symbol = showCurrencySymbol ? '₦' : '';
    return `${prefix}${symbol}${compactFormatter.format(absNaira)}`;
  }

  const formatter = new Intl.NumberFormat('en-NG', {
    style: showCurrencySymbol ? 'currency' : 'decimal',
    currency: 'NGN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const formattedAbs = formatter.format(absNaira);

  if (isNegative) {
    return `-${formattedAbs}`;
  }
  if (showSign && absKobo > 0) {
    return `+${formattedAbs}`;
  }
  return formattedAbs;
}

/**
 * Converts user-entered Naira string or number into exact integer kobo without floating-point error.
 * Example: "1,000.50" -> 100050
 * Example: "500" -> 50000
 * Example: "0.5" -> 50
 * Example: "0.05" -> 5
 */
export function parseNairaInputToKobo(input: string | number): number {
  if (typeof input === 'number') {
    if (isNaN(input) || !isFinite(input)) return 0;
    input = input.toString();
  }

  if (!input || typeof input !== 'string') return 0;

  // Clean all characters except digits and the first decimal dot
  const cleaned = input.trim().replace(/[^0-9.]/g, '');
  if (!cleaned) return 0;

  const parts = cleaned.split('.');
  const wholeNairaStr = parts[0] || '0';
  const koboFractionStr = parts[1] !== undefined ? (parts[1] + '00').slice(0, 2) : '00';

  const wholeNairaInt = parseInt(wholeNairaStr, 10);
  const koboFractionInt = parseInt(koboFractionStr, 10);

  if (isNaN(wholeNairaInt) || isNaN(koboFractionInt)) return 0;

  return wholeNairaInt * 100 + koboFractionInt;
}

/**
 * Converts Naira value (string or number) to kobo integer.
 * Safe alias for parseNairaInputToKobo.
 */
export function nairaToKobo(naira: number | string): number {
  return parseNairaInputToKobo(naira);
}

/**
 * Converts kobo integer to exact decimal Naira number (for chart math or computations).
 * Example: 100050 kobo -> 1000.5
 */
export function koboToNairaNumber(kobo: number): number {
  if (isNaN(kobo) || !isFinite(kobo)) return 0;
  return Math.round(kobo) / 100;
}

/**
 * Calculates standard Nigerian banking fees.
 * NIP transfer fee: ₦10.00 (1000 kobo)
 * VAT 7.5%: ₦0.75 (75 kobo)
 * Total Fee: ₦10.75 (1075 kobo)
 */
export const NIP_TRANSFER_FEE_KOBO = 1075;
export const DAILY_TRANSFER_LIMIT_KOBO = 500000000; // ₦5,000,000.00
