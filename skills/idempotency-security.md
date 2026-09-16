# Idempotency & Security Standards for NovaBiz

This guide documents anti-double-spend idempotency key generation, headers, retry safety, and XSS prevention for merchant inputs.

---

## 1. Idempotency Key Architecture

### Why Idempotency is Critical in Nigerian Rails
In unstable network environments (2G/3G in rural markets or crowded open markets):
- A merchant hits "Send ₦50,000".
- The server processes the debit, but the mobile connection drops before returning the HTTP 200 response.
- Without an `Idempotency-Key`, when the merchant clicks "Retry", the bank initiates a second debit of ₦50,000.

### The Standard
1. Every transfer initiation generates a **UUID v4 `Idempotency-Key`** on the client when entering the transfer flow.
2. The key is attached to the HTTP request header:
   `Idempotency-Key: 9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d`
3. **Automatic Retries MUST reuse the exact same Idempotency-Key**.
4. The server/mock identifies repeated keys and returns the existing transaction result without re-executing the debit.

---

## 2. Implementation (`src/lib/idempotency.ts`)

```ts
/**
 * Generates a standard RFC4122 v4 UUID for idempotency.
 */
export function generateIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Safe fallback
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
```

---

## 3. XSS Sanitization for Untrusted Text

Transaction narrations, customer names, and merchant notes are untrusted inputs. They must never be rendered using `dangerouslySetInnerHTML`.

### Rules
- Standard React JSX escaping `{transaction.narration}` is standard for text nodes.
- When formatting descriptions with highlights or badges, sanitize input strings:
  ```ts
  export function sanitizeText(text: string): string {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }
  ```
