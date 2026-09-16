# Fintech Currency & Kobo Integer Precision Guide

This guide defines the financial precision standard, mathematical rules, formatting patterns, and anti-patterns for handling Nigerian Naira (₦) and kobo integers within FirstBank NovaBiz.

---

## 1. Golden Rule: All Money Stored & Calculated in Kobo Integers

In JavaScript and TypeScript, floating-point math causes catastrophic drift:
```ts
// ❌ WRONG: Floating point arithmetic
0.1 + 0.2 // = 0.30000000000000004
1000.50 * 100 // = 100050.00000000001
19.99 * 100 // = 1998.9999999999998 (leads to Math.floor loss of 1 kobo!)
```

### The Standard
- **Every monetary property in API responses, state, and mutations MUST be an integer representing kobo.**
  - `100 kobo = ₦1.00`
  - `100050 kobo = ₦1,000.50`
  - `25000000 kobo = ₦250,000.00`
- Integers up to `Number.MAX_SAFE_INTEGER` ($9,007,199,254,740,991$ kobo $\approx ₦90\text{ trillion}$) are completely lossless.

---

## 2. Currency Utilities Implementation

```ts
/**
 * Formats a kobo integer into standard Naira currency string.
 * Example: 100050 -> "₦1,000.50"
 */
export function formatKoboToNaira(
  kobo: number,
  options?: {
    showCurrencySymbol?: boolean;
    compact?: boolean;
  }
): string {
  if (isNaN(kobo) || !isFinite(kobo)) return "₦0.00";

  const naira = kobo / 100;
  const { showCurrencySymbol = true, compact = false } = options || {};

  if (compact) {
    const formatter = new Intl.NumberFormat('en-NG', {
      notation: 'compact',
      maximumFractionDigits: 1,
    });
    return (showCurrencySymbol ? '₦' : '') + formatter.format(naira);
  }

  const formatter = new Intl.NumberFormat('en-NG', {
    style: showCurrencySymbol ? 'currency' : 'decimal',
    currency: 'NGN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return formatter.format(naira);
}

/**
 * Converts user-entered Naira string to exact integer kobo without floating-point error.
 * Example: "1,000.50" -> 100050
 * Example: "500" -> 50000
 */
export function parseNairaInputToKobo(input: string): number {
  if (!input) return 0;
  // Clean all characters except digits and single decimal dot
  const cleaned = input.replace(/[^0-9.]/g, '');
  if (!cleaned) return 0;

  const parts = cleaned.split('.');
  const wholeNaira = parseInt(parts[0] || '0', 10);
  const koboFraction = parts[1] ? (parts[1] + '00').slice(0, 2) : '00';
  const koboInt = wholeNaira * 100 + parseInt(koboFraction, 10);

  return isNaN(koboInt) ? 0 : koboInt;
}

/**
 * Converts kobo integer to decimal Naira number for chart scales.
 */
export function koboToNairaNumber(kobo: number): number {
  return Math.round(kobo) / 100;
}
```

---

## 3. Nigerian Banking Fees & Limits (NIBSS Standard)

- **NIP Transfer Fee**: `1000 kobo` (₦10.00)
- **VAT (7.5%)**: `75 kobo` (₦0.75)
- **Total Standard Transfer Fee**: `1075 kobo` (₦10.75)
- **Daily Merchant Tier 3 Limit**: `500,000,000 kobo` (₦5,000,000.00)
- **Single Transaction Limit**: `100,000,000 kobo` (₦1,000,000.00)

---

## 4. Prohibited Anti-Patterns

❌ **Never use string-splicing to add commas**:
```ts
// ❌ WRONG
const badFormat = "₦" + (kobo / 100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
```

❌ **Never multiply user input float directly**:
```ts
// ❌ WRONG (fails on 19.99 * 100 = 1998.9999999999998)
const badKobo = Math.round(parseFloat(inputVal) * 100);
```
