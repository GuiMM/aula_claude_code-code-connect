import * as fs from 'fs';
import * as path from 'path';
import { request, APIRequestContext } from '@playwright/test';

export const TEST_USER = {
  email: 'ana@codeconnect.dev',
  password: 'senha123',
};

export const TOKEN_STORAGE_KEY = 'code-connect:token';

export const STORAGE_STATE_PATH = '.auth/user.json';

export function getStoredToken(): string {
  const filePath = path.resolve(__dirname, '..', STORAGE_STATE_PATH);
  const raw = fs.readFileSync(filePath, 'utf8');
  const parsed = JSON.parse(raw) as {
    origins: Array<{ localStorage: Array<{ name: string; value: string }> }>;
  };
  const entry = parsed.origins
    .flatMap((o) => o.localStorage)
    .find((item) => item.name === TOKEN_STORAGE_KEY);
  if (!entry) {
    throw new Error(`Token not found in storage state at ${filePath}`);
  }
  return entry.value;
}

export async function loginAndGetToken(apiURL: string): Promise<string> {
  const ctx = await request.newContext();
  const response = await ctx.post(`${apiURL}/auth/login`, {
    data: { email: TEST_USER.email, password: TEST_USER.password },
  });

  if (!response.ok()) {
    throw new Error(
      `Login failed: ${response.status()} ${await response.text()}`,
    );
  }

  const body = (await response.json()) as { access_token: string };
  await ctx.dispose();
  return body.access_token;
}

export async function authedApiContext(
  token: string,
): Promise<APIRequestContext> {
  return request.newContext({
    extraHTTPHeaders: { Authorization: `Bearer ${token}` },
  });
}
