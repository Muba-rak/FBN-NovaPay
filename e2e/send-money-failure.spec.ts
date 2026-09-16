import { test, expect } from '@playwright/test';

test.describe('Send Money Optimistic Rollback on Failure', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#wallet-available-balance')).toBeVisible({ timeout: 10000 });
  });

  test('rolls back optimistic balance deduction and shows accessible error alert when transfer fails', async ({ page }) => {
    // 1. Expand MSW Simulation Controls Bar
    const simToggleBtn = page.locator('#simulation-toggle-btn');
    await simToggleBtn.click();

    // 2. Set Failure Rate to 100%
    const fail100Btn = page.getByRole('button', { name: /Set failure rate to 100%/i });
    await expect(fail100Btn).toBeVisible();
    await fail100Btn.click();

    // Minimize DevTools bar to clear viewport
    await simToggleBtn.click();

    // Record starting balance
    const startingBalance = await page.locator('#wallet-available-balance').textContent();

    // 3. Open Send Money Modal
    const sendMoneyBtn = page.locator('#header-send-money-btn');
    await sendMoneyBtn.click();

    // Step 1: Select Bank & Enter Account
    const firstBankChip = page.getByRole('button', { name: /First Bank/i }).first();
    await firstBankChip.click();

    const nubanInput = page.locator('#nuban-input');
    await nubanInput.fill('0123456789');

    await expect(page.getByText('Verified Account Holder')).toBeVisible({ timeout: 5000 });
    await page.getByRole('button', { name: /Proceed to Amount/i }).click();

    // Step 2: Enter Amount ₦20,000
    await page.getByRole('button', { name: '₦20,000' }).click();
    await page.getByRole('button', { name: /Review Transfer/i }).click();

    // Step 3: Review
    await page.getByRole('button', { name: /Enter Transaction PIN/i }).click();

    // Step 4: Enter PIN 1234
    await page.getByRole('button', { name: '1', exact: true }).click();
    await page.getByRole('button', { name: '2', exact: true }).click();
    await page.getByRole('button', { name: '3', exact: true }).click();
    await page.getByRole('button', { name: '4', exact: true }).click();

    // Submit transfer (will fail at MSW layer with 100% failure rate)
    const authorizeBtn = page.getByRole('button', { name: /Authorize Transfer/i });
    await authorizeBtn.click();

    // 4. Assert Error Notification / Alert appears
    await expect(
      page.getByText(/Simulated network timeout|Transfer failed|Transfer Rejected/i).first()
    ).toBeVisible({ timeout: 10000 });

    // 5. Assert balance reverts back to original starting balance (Snapshot Rollback)
    const currentBalance = await page.locator('#wallet-available-balance').textContent();
    expect(currentBalance).toBe(startingBalance);

    // 6. Dismiss error modal
    await page.keyboard.press('Escape');

    // 7. Restore failure rate to 0%
    await simToggleBtn.click();
    const fail0Btn = page.getByRole('button', { name: /Set failure rate to 0%/i });
    if (await fail0Btn.isVisible()) {
      await fail0Btn.click();
    }
    await simToggleBtn.click();
  });
});
