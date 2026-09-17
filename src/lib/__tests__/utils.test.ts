import { describe, it, expect } from 'vitest';
import { sanitizeText, sanitizeNarration } from '../utils';

describe('sanitizeText Utility', () => {
  it('strips script tags and malicious HTML injection vectors', () => {
    const dirty = '<script>alert("XSS")</script>Payment for Goods';
    expect(sanitizeText(dirty)).toBe('alert("XSS")Payment for Goods');
  });

  it('strips img tag with onerror payloads', () => {
    const dirty = '<img src=x onerror=alert(1)>Vendor Invoice';
    expect(sanitizeText(dirty)).toBe('Vendor Invoice');
  });

  it('strips complex nested HTML tags', () => {
    const dirty = '<div class="alert"><a href="http://evil.com">Click</a> <b>Store</b></div>';
    expect(sanitizeText(dirty)).toBe('Click Store');
  });

  it('strips non-printable ASCII control characters and null bytes', () => {
    const dirty = 'Order\x00\x08#4599\x1F\x7F';
    expect(sanitizeText(dirty)).toBe('Order#4599');
  });

  it('handles null, undefined, and empty string safely', () => {
    expect(sanitizeText(null)).toBe('');
    expect(sanitizeText(undefined)).toBe('');
    expect(sanitizeText('')).toBe('');
  });

  it('preserves clean legitimate merchant names and strings', () => {
    expect(sanitizeText('ALHERI SUPERMARKET & PHARMACY')).toBe('ALHERI SUPERMARKET & PHARMACY');
    expect(sanitizeText('CHINEDU AHMADU BELLO')).toBe('CHINEDU AHMADU BELLO');
  });
});

describe('sanitizeNarration Utility', () => {
  it('neutralizes spreadsheet formula injection prefixes (=, +, -, @)', () => {
    expect(sanitizeNarration('=cmd|"/c calc"!A0')).toBe('cmd|"/c calc"!A0');
    expect(sanitizeNarration('+123456789')).toBe('123456789');
    expect(sanitizeNarration('@SUM(1,2)')).toBe('SUM(1,2)');
    expect(sanitizeNarration('-1000')).toBe('1000');
  });

  it('strips HTML tags and enforces 50-character NIBSS limit', () => {
    const longDirty = '<script>alert(1)</script>' + 'A'.repeat(60);
    const result = sanitizeNarration(longDirty);
    expect(result).not.toContain('<script>');
    expect(result.length).toBeLessThanOrEqual(50);
  });

  it('safely processes normal payment remarks', () => {
    expect(sanitizeNarration('Invoice settlement for POS batch 04')).toBe(
      'Invoice settlement for POS batch 04'
    );
  });
});
