import { test, expect, request } from '@playwright/test';
import { apiURL } from '../playwright.config';
import { STORAGE_STATE_PATH } from '../fixtures/auth';

test.describe('Create comment', () => {
  test.use({ storageState: STORAGE_STATE_PATH });

  test('posts a comment on an existing post and sees it in the list', async ({
    page,
  }) => {
    const ctx = await request.newContext();
    const listResponse = await ctx.get(`${apiURL}/posts?limit=1`);
    expect(listResponse.ok()).toBeTruthy();
    const list = (await listResponse.json()) as {
      data: Array<{ id: string }>;
    };
    expect(list.data.length).toBeGreaterThan(0);
    const postId = list.data[0].id;
    await ctx.dispose();

    await page.goto(`/#/posts/${postId}`);

    const textarea = page.locator(
      'textarea[aria-label="Escreva um comentário"]:visible',
    );
    await expect(textarea).toBeVisible();

    const uniqueContent = `Comentário automatizado E2E ${Date.now()}`;
    await textarea.fill(uniqueContent);
    await page
      .getByRole('button', { name: 'Comentar' })
      .first()
      .click();

    await expect(page.getByText(uniqueContent)).toBeVisible({
      timeout: 10_000,
    });
    await expect(textarea).toHaveValue('');
  });
});
