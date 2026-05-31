import * as fs from 'fs';
import * as path from 'path';
import { FullConfig } from '@playwright/test';
import {
  STORAGE_STATE_PATH,
  TOKEN_STORAGE_KEY,
  loginAndGetToken,
} from './auth';

async function globalSetup(_config: FullConfig): Promise<void> {
  const apiURL = process.env.E2E_API_URL ?? 'http://localhost:3000/v1';
  const baseURL = process.env.E2E_BASE_URL ?? 'http://localhost:5173';

  const token = await loginAndGetToken(apiURL);

  const storageState = {
    cookies: [],
    origins: [
      {
        origin: baseURL,
        localStorage: [{ name: TOKEN_STORAGE_KEY, value: token }],
      },
    ],
  };

  const outPath = path.resolve(__dirname, '..', STORAGE_STATE_PATH);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(storageState, null, 2), 'utf8');

  process.env.E2E_ACCESS_TOKEN = token;
}

export default globalSetup;
