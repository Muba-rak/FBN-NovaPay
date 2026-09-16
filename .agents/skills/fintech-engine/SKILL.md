---
name: fintech-engine
description: Financial currency math, zero floating-point kobo integer engine, anti-double-spend idempotency, and Nigerian banking rails.
---

# Fintech Precision & Kobo Integer Engine Guide

This skill governs the financial math, currency conversions, and idempotency protection in the FirstBank NovaBiz application.

---

## 1. Zero Floating-Point Precision
- Store and calculate all money strictly as integer **kobo** ($1\text{ NGN} = 100\text{ kobo}$).
- Use `formatKoboToNaira()` for display.
- Use `parseNairaInputToKobo()` for user inputs.

---

## 2. Idempotency Standard
- Generate RFC4122 v4 UUID `Idempotency-Key` on the client when entering transfer flow.
- Attach to `Idempotency-Key` header on all transfers to prevent double-spending under network jitter.

---

## 3. Nigerian Banking Fees & Limits
- Standard NIP Transfer Fee: ₦10.00 (1,000 kobo) + ₦0.75 VAT (75 kobo) = ₦10.75 (1,075 kobo).
- KYC Tier 3 single transaction limit: ₦5,000,000.00 (500,000,000 kobo).
