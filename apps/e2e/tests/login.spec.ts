import { test, expect } from '@playwright/test';
import { TEST_USER } from '../fixtures/auth';

test.describe('Login', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('logs in with valid credentials and redirects to feed', async ({
    page,
  }) => {
    await page.goto('/#/login');

    await page.locator('input[name="email"]').fill(TEST_USER.email);
    await page.locator('input[name="password"]').fill(TEST_USER.password);
    await page.locator('button[type="submit"]').click();

    await expect(page).toHaveURL(/#\/(home|feed)$/);
    await expect(page.locator('main')).toBeVisible();
  });

  test('shows error message with invalid credentials', async ({ page }) => {
    await page.goto('/#/login');

    await page.locator('input[name="email"]').fill(TEST_USER.email);
    await page.locator('input[name="password"]').fill('wrong-password');
    await page.locator('button[type="submit"]').click();

    const error = page.locator('p[data-error]');
    await expect(error).toBeVisible();
    await expect(error).not.toHaveText('');
    await expect(page).toHaveURL(/#\/login$/);
  });
});
