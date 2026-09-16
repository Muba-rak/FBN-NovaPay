import { test, expect } from '@playwright/test';

test.describe('Send Money Flow (Happy Path)', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/');
    // Wait for the app shell and balance card to load
    await expect(page.locator('#wallet-available-balance')).toBeVisible({ timeout: 10000 });
  });

  test('successfully executes end-to-end NIP transfer with instant settlement', async ({ page }) => {
    // 1. Check initial balance is visible
    const initialBalanceText = await page.locator('#wallet-available-balance').textContent();
    expect(initialBalanceText).toContain('₦');

    // 2. Open Send Money modal from hero action
    const sendMoneyBtn = page.getByRole('button', { name: /Send Money/i }).first();
    await sendMoneyBtn.click();

    // Verify modal opened at Step 1
    await expect(page.getByRole('heading', { name: 'Send Money' })).toBeVisible();
    await expect(page.getByText('Step 1 of 4')).toBeVisible();

    // 3. Select Bank and Enter 10-digit NUBAN
    // Click First Bank chip or popular bank chip
    const firstBankChip = page.getByRole('button', { name: /First Bank/i }).first();
    await firstBankChip.click();

    const nubanInput = page.locator('#nuban-input');
    await nubanInput.fill('0123456789');

    // Wait for real-time NIBSS account resolution
    await expect(page.getByText('Verified Account Holder')).toBeVisible({ timeout: 5000 });

    // Click Proceed to Amount
    const proceedToAmountBtn = page.getByRole('button', { name: /Proceed to Amount/i });
    await expect(proceedToAmountBtn).toBeEnabled();
    await proceedToAmountBtn.click();

    // 4. Step 2: Amount & Narration
    await expect(page.getByText('Step 2 of 4')).toBeVisible();

    // Select quick amount chip ₦50,000
    const chip50k = page.getByRole('button', { name: '₦50,000' });
    await chip50k.click();

    // Fill narration
    const narrationInput = page.locator('#transfer-narration');
    await narrationInput.fill('Monthly Inventory Settlement');

    // Click Review Transfer
    const reviewBtn = page.getByRole('button', { name: /Review Transfer/i });
    await expect(reviewBtn).toBeEnabled();
    await reviewBtn.click();

    // 5. Step 3: Review Transfer Details
    await expect(page.getByText('Step 3 of 4')).toBeVisible();
    await expect(page.getByText('Beneficiary Name')).toBeVisible();
    await expect(page.getByText('Destination Bank')).toBeVisible();
    await expect(page.getByText('₦50,000.00').first()).toBeVisible();

    // Click Enter Transaction PIN
    const proceedToPinBtn = page.getByRole('button', { name: /Enter Transaction PIN/i });
    await proceedToPinBtn.click();

    // 6. Step 4: PIN Authorization
    await expect(page.getByText('Step 4 of 4')).toBeVisible();
    await expect(page.getByText(/Authorizing debit of/i)).toBeVisible();

    // Click on-screen numeric keypad: 1 -> 2 -> 3 -> 4
    await page.getByRole('button', { name: '1', exact: true }).click();
    await page.getByRole('button', { name: '2', exact: true }).click();
    await page.getByRole('button', { name: '3', exact: true }).click();
    await page.getByRole('button', { name: '4', exact: true }).click();

    // Submit Transfer
    const authorizeBtn = page.getByRole('button', { name: /Authorize Transfer/i });
    await authorizeBtn.click();

    // 7. Step 5: Transfer Success Modal
    await expect(page.getByText(/Transfer Successful/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('₦50,000.00').first()).toBeVisible();
    await expect(page.getByText('Transaction Ref')).toBeVisible();
    await expect(page.getByText('NIBSS Session ID')).toBeVisible();

    // Click Done to dismiss
    const doneBtn = page.getByRole('button', { name: 'Done' });
    await doneBtn.click();

    // 8. Verify Modal closed and balance is debited
    await expect(page.getByRole('heading', { name: 'Send Money' })).not.toBeVisible();
    await expect(page.locator('#wallet-available-balance')).toBeVisible();
    const updatedBalanceText = await page.locator('#wallet-available-balance').textContent();
    expect(updatedBalanceText).not.toBe(initialBalanceText);
  });
});
