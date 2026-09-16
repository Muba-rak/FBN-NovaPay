import { describe, it, expect } from 'vitest';
import {
  formatKoboToNaira,
  parseNairaInputToKobo,
  koboToNairaNumber,
  nairaToKobo,
  NIP_TRANSFER_FEE_KOBO,
} from '../format-money';

describe('formatKoboToNaira', () => {
  it('formats positive kobo integer correctly without floating-point drift', () => {
    // 100050 kobo -> ₦1,000.50
    expect(formatKoboToNaira(100050)).toBe('₦1,000.50');
  });

  it('formats small amounts and single-digit kobo fractions correctly', () => {
    expect(formatKoboToNaira(5)).toBe('₦0.05');
    expect(formatKoboToNaira(50)).toBe('₦0.50');
    expect(formatKoboToNaira(100)).toBe('₦1.00');
  });

  it('formats large merchant balances correctly with thousand separators', () => {
    // 50,000,000 kobo = ₦500,000.00
    expect(formatKoboToNaira(50000000)).toBe('₦500,000.00');
    // 1,234,567,890 kobo = ₦12,345,678.90
    expect(formatKoboToNaira(1234567890)).toBe('₦12,345,678.90');
  });

  it('handles zero, null, undefined and NaN gracefully', () => {
    expect(formatKoboToNaira(0)).toBe('₦0.00');
    expect(formatKoboToNaira(null)).toBe('₦0.00');
    expect(formatKoboToNaira(undefined)).toBe('₦0.00');
    expect(formatKoboToNaira(NaN)).toBe('₦0.00');
  });

  it('formats negative amounts properly', () => {
    expect(formatKoboToNaira(-50000)).toBe('-₦500.00');
  });

  it('supports compact notation for summaries', () => {
    const compact1 = formatKoboToNaira(50000000, { compact: true });
    // ₦500k or ₦500K depending on Intl locale
    expect(compact1.toLowerCase()).toContain('500');
  });
});

describe('parseNairaInputToKobo', () => {
  it('converts standard whole Naira string to integer kobo', () => {
    expect(parseNairaInputToKobo('1000')).toBe(100000);
    expect(parseNairaInputToKobo('500')).toBe(50000);
  });

  it('converts formatted currency strings with commas to kobo', () => {
    expect(parseNairaInputToKobo('1,000.50')).toBe(100050);
    expect(parseNairaInputToKobo('₦50,000.00')).toBe(5000000);
  });

  it('accurately parses decimal kobo fractions without precision loss', () => {
    expect(parseNairaInputToKobo('19.99')).toBe(1999);
    expect(parseNairaInputToKobo('0.5')).toBe(50);
    expect(parseNairaInputToKobo('0.05')).toBe(5);
    expect(parseNairaInputToKobo('.25')).toBe(25);
  });

  it('handles empty, invalid, and garbage strings safely', () => {
    expect(parseNairaInputToKobo('')).toBe(0);
    expect(parseNairaInputToKobo('abc')).toBe(0);
    expect(parseNairaInputToKobo('   ')).toBe(0);
  });
});

describe('koboToNairaNumber and aliases', () => {
  it('converts kobo to exact decimal Naira number', () => {
    expect(koboToNairaNumber(100050)).toBe(1000.5);
    expect(koboToNairaNumber(0)).toBe(0);
  });

  it('nairaToKobo alias matches parseNairaInputToKobo', () => {
    expect(nairaToKobo('250.75')).toBe(25075);
  });

  it('NIP transfer fee is 1075 kobo (₦10.75)', () => {
    expect(NIP_TRANSFER_FEE_KOBO).toBe(1075);
    expect(formatKoboToNaira(NIP_TRANSFER_FEE_KOBO)).toBe('₦10.75');
  });
});
