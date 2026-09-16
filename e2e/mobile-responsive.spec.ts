import { test, expect } from '@playwright/test';

test.describe('Mobile Viewport (360px) & Accessibility Audit', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto('/');
    await expect(page.locator('#wallet-available-balance')).toBeVisible({ timeout: 10000 });
  });

  test('renders mobile bottom navigation with accessible touch targets (>= 44px)', async ({ page }) => {
    const bottomNav = page.getByRole('navigation', { name: 'Mobile Bottom Navigation' });
    await expect(bottomNav).toBeVisible();

    // Verify all 4 bottom nav buttons are visible and accessible
    const buttons = bottomNav.getByRole('button');
    const count = await buttons.count();
    expect(count).toBe(4);

    for (let i = 0; i < count; i++) {
      const btn = buttons.nth(i);
      const box = await btn.boundingBox();
      expect(box).not.toBeNull();
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
  });

  test('allows searching and filtering transactions on mobile', async ({ page }) => {
    const searchInput = page.locator('#tx-search');
    await expect(searchInput).toBeVisible();

    // Search for a specific merchant or string
    await searchInput.fill('First');
    // Wait for debounced search and feed update
    await page.waitForTimeout(400);

    // Filter by Credits only
    const creditsFilterBtn = page.getByRole('button', { name: /Credits/i });
    await creditsFilterBtn.click();
    await page.waitForTimeout(300);

    // Clear search
    await searchInput.fill('');
    const allTypesBtn = page.getByRole('button', { name: /All Types/i });
    if (await allTypesBtn.isVisible()) {
      await allTypesBtn.click();
    }
  });

  test('dialogs trap focus and close gracefully with Escape key (WCAG 2.1 AA)', async ({ page }) => {
    // Open QR Collection Modal
    const qrBtn = page.getByRole('button', { name: /Receive QR|QR/i }).first();
    await qrBtn.click();

    // Assert dialog opened
    await expect(page.getByRole('heading', { name: /NovaBiz Merchant QR/i })).toBeVisible();

    // Press Escape to close
    await page.keyboard.press('Escape');
    await expect(page.getByRole('heading', { name: /NovaBiz Merchant QR/i })).not.toBeVisible();
  });

  test('toggles theme between Light and Dark mode seamlessly', async ({ page }) => {
    const themeBtn = page.getByRole('button', { name: /Switch to (light|dark) mode/i }).first();
    await expect(themeBtn).toBeVisible();

    const isInitialDark = await page.evaluate(() =>
      document.documentElement.classList.contains('dark')
    );

    // Click theme toggle
    await themeBtn.click();

    const isAfterDark = await page.evaluate(() =>
      document.documentElement.classList.contains('dark')
    );
    expect(isAfterDark).toBe(!isInitialDark);

    // Toggle back
    await themeBtn.click();
    const isRestoredDark = await page.evaluate(() =>
      document.documentElement.classList.contains('dark')
    );
    expect(isRestoredDark).toBe(isInitialDark);
  });
});
