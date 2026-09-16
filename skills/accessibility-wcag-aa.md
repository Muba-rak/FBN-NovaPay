# Accessibility (WCAG 2.1 AA) Skill Guide for NovaBiz

This guide outlines mandatory accessibility standards, ARIA patterns, keyboard navigation rules, and color contrast requirements for the FirstBank NovaBiz merchant dashboard.

---

## 1. Non-Negotiable Hard Constraints

- **Keyboard Operable Multi-Step Flows**: All interactive elements in the Send Money flow, transaction filters, and modals must be reachable and operable using `Tab`, `Shift+Tab`, `Enter`, `Space`, `Arrow` keys, and `Escape`.
- **Visible Focus States**: High-contrast, non-subtle focus rings must be visible across all interactive components (minimum 3:1 contrast against adjacent background).
  ```css
  /* Focus indicator rule */
  :focus-visible {
    outline: 2px solid var(--fbn-gold, #D4AF37);
    outline-offset: 2px;
  }
  ```
- **Live Status Regions**: Screen readers must immediately announce asynchronous feedback (balance updates, optimistic transfer in-flight status, failure alerts, and success toasts).
  - Use `aria-live="polite"` for non-disruptive feedback (e.g., auto-resolved account names, copy feedback).
  - Use `aria-live="assertive"` + `role="alert"` for errors and failed transfer rollbacks.
- **Mobile Touch Targets**: Minimum touch target size of $44 \times 44\text{px}$ across all mobile buttons, tabs, and select triggers to support small Android screens (360px width).

---

## 2. Accessible Form Patterns (React Hook Form + Radix / Custom Modals)

### Dynamic Form Inputs
- Every form field must have an explicit `<label>` associated via `htmlFor` matching the input's `id`.
- Error messages must link to the input via `aria-describedby="[field]-error"`.
- When a field fails validation, set `aria-invalid="true"`.

```tsx
<div>
  <label htmlFor="accountNumber" className="block text-sm font-medium text-slate-700 dark:text-slate-200">
    NUBAN Account Number
  </label>
  <input
    id="accountNumber"
    type="text"
    inputMode="numeric"
    pattern="[0-9]*"
    maxLength={10}
    aria-invalid={errors.accountNumber ? "true" : "false"}
    aria-describedby={errors.accountNumber ? "accountNumber-error" : "accountNumber-helper"}
    className="focus-visible:ring-2 focus-visible:ring-amber-500 ..."
  />
  {errors.accountNumber && (
    <p id="accountNumber-error" role="alert" className="text-sm text-red-600 dark:text-red-400">
      {errors.accountNumber.message}
    </p>
  )}
</div>
```

---

## 3. Modal Focus Trap & Keyboard Escape

- When the Send Money dialog opens:
  1. Trap keyboard focus within the modal container.
  2. Focus the first interactive element or close button.
  3. Pressing `Escape` closes the modal.
  4. Closing the dialog restores focus to the triggering button.

---

## 4. Live Region Announcements for Optimistic Updates

```tsx
{/* Dynamic Live Region */}
<div className="sr-only" aria-live="assertive" aria-atomic="true">
  {isOptimisticSending && "Transfer initiated. Balance updated optimistically."}
  {isRollbackError && "Transfer failed. Balance has been restored."}
  {isSuccess && "Transfer completed successfully."}
</div>
```

---

## 5. Color Contrast Standard (WCAG AA)

| Element | Background | Minimum Ratio | Color Used |
| :--- | :--- | :--- | :--- |
| Primary Text | White (`#FFFFFF`) / Dark Navy (`#0A192F`) | 4.5:1 | Slate-900 / Slate-100 |
| Secondary Text | White (`#FFFFFF`) / Dark Navy (`#0A192F`) | 4.5:1 | Slate-600 / Slate-300 |
| Action Buttons | Navy (`#002D62`) / Gold (`#D4AF37`) | 4.5:1 | White text on Navy / Dark Slate on Gold |
| Status Pills | Green/Red tint | 4.5:1 | High-contrast dark text over light tint |
