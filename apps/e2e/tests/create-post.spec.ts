import { test, expect, request } from '@playwright/test';
import { apiURL } from '../playwright.config';
import {
  STORAGE_STATE_PATH,
  authedApiContext,
  getStoredToken,
} from '../fixtures/auth';

test.describe('Create post', () => {
  test.use({ storageState: STORAGE_STATE_PATH });

  test('creates a post via API and renders it in the feed', async ({
    page,
  }) => {
    const uniqueTitle = `E2E Post ${Date.now()}`;
    const token = getStoredToken();
    const api = await authedApiContext(token);

    const response = await api.post(`${apiURL}/posts`, {
      data: {
        title: uniqueTitle,
        description:
          'Post criado pelo teste automatizado de ponta-a-ponta para validar o fluxo de criação.',
        content:
          '## Conteúdo\n\nEste é um post criado pelo Playwright para verificar que a API persiste e o feed exibe o novo post.',
      },
    });

    expect(response.status()).toBe(201);
    const body = (await response.json()) as { id: string; title: string };
    expect(body.id).toBeTruthy();
    expect(body.title).toBe(uniqueTitle);

    await page.goto('/#/feed');
    await expect(page.getByText(uniqueTitle).first()).toBeVisible({
      timeout: 10_000,
    });

    await page.goto(`/#/posts/${body.id}`);
    await expect(
      page.getByRole('heading', { name: uniqueTitle }),
    ).toBeVisible();

    await api.dispose();
  });
});

test.describe('Create post (negative)', () => {
  test('rejects post creation without authentication', async () => {
    const ctx = await request.newContext();
    const response = await ctx.post(`${apiURL}/posts`, {
      data: {
        title: 'no auth',
        description: 'descrição mínima para passar de validação',
        content: 'conteúdo mínimo para passar da validação',
      },
    });
    expect(response.status()).toBe(401);
    await ctx.dispose();
  });
});
