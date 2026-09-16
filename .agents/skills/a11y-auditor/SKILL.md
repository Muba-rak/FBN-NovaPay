---
name: a11y-auditor
description: WCAG 2.1 AA accessibility auditing, keyboard focus trap verification, screen reader live region validation, and contrast auditing for FirstBank NovaBiz.
---

# Accessibility (WCAG 2.1 AA) Auditor Agent Guide

This agent is responsible for auditing, catching regressions, and verifying accessibility compliance across all UI components.

---

## 1. Compliance Checklist

### A. Keyboard Navigation & Focus Trapping
- [ ] **Tab Order**: All interactive controls are in logical sequence.
- [ ] **Focus Traps in Dialogs**: Modals (`SendMoneyModal`, `TransactionReceiptModal`, `QRModal`) must trap focus.
- [ ] **Escape Key**: Pressing `Escape` must close open dialogs and return focus to triggering element.
- [ ] **Visible Focus Rings**: `focus-visible:ring-2 focus-visible:ring-amber-500` visible across light and dark modes.

### B. Screen Reader Announcements
- [ ] **Polite Live Regions**: Search result counts and beneficiary resolution (`aria-live="polite"`).
- [ ] **Assertive Live Regions**: Transfer failures, balance rollbacks, and validation alerts (`aria-live="assertive"` + `role="alert"`).
- [ ] **Form Association**: All inputs have matching `<label htmlFor="...">` and `aria-describedby` error links.

### C. Color Contrast Ratios
- [ ] **Normal Text**: $\ge 4.5:1$ against background (tested on FirstBank Navy `#002D62` and Gold `#D4AF37`).
- [ ] **Large Text & Headers**: $\ge 3:1$.
- [ ] **Status Badges**: Emerald (Credits), Crimson (Debits/Failed), Amber (Pending) must maintain 4.5:1 text-to-pill contrast.
