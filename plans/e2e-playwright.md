# Plano: E2E Playwright (login, criação de post via API, comentários) com agendamento diário no GitHub Actions

## Contexto

O `code-connect` é um monorepo pnpm com `apps/api` (NestJS 11 + Postgres + JWT) e `apps/web` (Vite + TypeScript puro, hash routing, Tailwind). Hoje a cobertura de testes é só unitária (Jest no API, Vitest no web) e **não existe nenhum workflow do GitHub Actions**. Queremos garantir todos os dias, automaticamente, que os fluxos críticos do usuário — login, criação de post, comentário em post — continuam funcionando ponta-a-ponta, executando contra a stack real (Postgres + API + web) que sobe no próprio runner.

Detalhe importante: **a tela de criação de post não existe no frontend** (existem login, registro, feed e detalhe do post). Para não inflar o escopo, o cenário de "criação de post" será exercitado pela **API diretamente via `request` do Playwright** (o endpoint `POST /v1/posts` já existe e é o que uma tela viria a consumir). Depois do POST, a verificação é feita na UI: o post recém-criado precisa aparecer no feed. Assim cobrimos o fluxo de ponta a ponta — autenticação + criação + persistência + render — sem depender de UI ainda não construída.

---

## Escopo

1. **Workspace `apps/e2e`:** Playwright configurado, fixtures de auth, três specs (login UI, criação de post via API + verificação no feed, comentário UI).
2. **GitHub Actions:** workflow `e2e.yml` agendado para `12:00 UTC` (09:00 BRT) + `workflow_dispatch`, subindo Postgres como service, API e web no runner, rodando `pnpm seed` e Playwright em Chromium.

Fora de escopo: criação da tela de criação de post no frontend, múltiplos browsers, visual regression, deploy, edição/exclusão de post.

---

## Parte 1 — Workspace `apps/e2e` com Playwright

Workspace dedicado mantém Playwright fora dos node_modules de api/web e permite `pnpm --filter e2e ...`.

### Estrutura de arquivos a criar

```
apps/e2e/
  package.json              # name: "e2e", scripts: "test", "test:ui", "install-browsers"
  playwright.config.ts      # baseURL http://localhost:5173, retries: 2 em CI, reporter: html
  tsconfig.json
  fixtures/
    auth.ts                 # helper login via API + storage state com token
    test.ts                 # custom test fixture com `authedPage`
  tests/
    login.spec.ts
    create-post.spec.ts
    comment.spec.ts
  .gitignore                # playwright-report/, test-results/, .auth/
```

### `playwright.config.ts` — pontos-chave

- `baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:5173'`
- `use: { trace: 'on-first-retry', screenshot: 'only-on-failure', video: 'retain-on-failure' }`
- `projects: [{ name: 'chromium', use: devices['Desktop Chrome'] }]`
- `globalSetup` faz login via API e salva storage state em `.auth/user.json`.
- `webServer` **não** será usado — o workflow do GH Actions sobe API e web em steps separados, com saúde verificada via `wait-on` (mais determinístico em CI que orquestrar dois servers pelo Playwright).
- `expect: { timeout: 5000 }`, `timeout: 30_000`.

### Credenciais de teste

Usuário do seed (confirmado em [apps/api/src/seeders/seed.ts:23-27](apps/api/src/seeders/seed.ts#L23-L27)):
- `ana@codeconnect.dev` / `senha123`

O seed é idempotente — checa contagem de posts antes de recriar ([seed.ts:195-200](apps/api/src/seeders/seed.ts#L195-L200)).

### Fixture de autenticação (`fixtures/auth.ts`)

`globalSetup` chama `POST /v1/auth/login` via `request.newContext()`, recebe `{ access_token }` e grava em `.auth/user.json` no formato de storage state do Playwright:

```ts
origins: [{
  origin: 'http://localhost:5173',
  localStorage: [{ name: 'code-connect:token', value: token }]
}]
```

A chave `code-connect:token` foi confirmada em [apps/web/src/services/tokenStorage.ts](apps/web/src/services/tokenStorage.ts). Cada spec que precisa estar logado declara `test.use({ storageState: '.auth/user.json' })`.

Também exportar um helper `apiContext()` que retorna um `APIRequestContext` já com `Authorization: Bearer <token>` para as chamadas diretas no spec de criação de post.

### Specs

**`login.spec.ts`** — testa a UI sem storage state:
1. `goto('/#/login')`.
2. Preenche `input[name="email"]`, `input[name="password"]` (selectors confirmados em [apps/web/src/components/organisms/LoginForm/LoginForm.ts](apps/web/src/components/organisms/LoginForm/LoginForm.ts)).
3. Clica `button[type="submit"]`.
4. Aguarda URL conter `#/feed` e elemento característico do feed estar visível.
5. Caso negativo: senha errada → assert `p[data-error]` visível.

**`create-post.spec.ts`** — usa storage state + API:
1. Via `request` autenticado, faz `POST http://localhost:3000/v1/posts` com `{ title: 'E2E ' + Date.now(), description: '...', content: '...' }`. Endpoint confirmado em [apps/api/src/posts/posts.controller.ts:65-76](apps/api/src/posts/posts.controller.ts#L65-L76).
2. Assert `response.status() === 201` e body com `id`.
3. `page.goto('/#/feed')` (já autenticado via storage state).
4. Espera o título recém-criado aparecer (`expect(page.getByText(uniqueTitle)).toBeVisible()`) — valida que API persistiu E que o feed renderiza.
5. Opcional: `goto('/#/posts/{id})` e validar título no detalhe.

**`comment.spec.ts`** — usa storage state:
1. Via `request`, busca `GET /v1/posts?limit=1` e pega o `id` do primeiro post (seed garante que existe).
2. `goto('/#/posts/{id}')`.
3. Preenche `textarea[aria-label="Escreva um comentário"]` (selector confirmado em [apps/web/src/components/molecules/CommentForm/CommentForm.ts](apps/web/src/components/molecules/CommentForm/CommentForm.ts)) e clica o botão "Comentar".
4. Assert que o conteúdo digitado aparece na lista de comentários.

### Dependências do workspace `apps/e2e`

- `@playwright/test` (dev)
- `typescript` (dev)

---

## Parte 2 — GitHub Actions

### Arquivo: `.github/workflows/e2e.yml`

```yaml
name: E2E (Playwright)

on:
  schedule:
    - cron: '0 12 * * *'   # 09:00 America/Sao_Paulo = 12:00 UTC
  workflow_dispatch:
  pull_request:
    paths:
      - 'apps/web/**'
      - 'apps/api/**'
      - 'apps/e2e/**'
      - '.github/workflows/e2e.yml'

jobs:
  e2e:
    runs-on: ubuntu-latest
    timeout-minutes: 20

    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_DB: code_connect
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
        ports: ['5432:5432']
        options: >-
          --health-cmd "pg_isready -U postgres"
          --health-interval 5s --health-timeout 5s --health-retries 10

    env:
      DB_HOST: localhost
      DB_PORT: 5432
      DB_USER: postgres
      DB_PASSWORD: postgres
      DB_NAME: code_connect
      PORT: 3000
      WEB_ORIGIN: http://localhost:5173
      VITE_API_BASE_URL: http://localhost:3000/v1
      E2E_BASE_URL: http://localhost:5173

    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: '22', cache: 'pnpm' }

      - run: pnpm install --frozen-lockfile

      - name: Build API
        run: pnpm --filter api build

      - name: Seed database
        run: pnpm --filter api seed

      - name: Start API
        run: pnpm --filter api start &

      - name: Wait for API
        run: pnpm dlx wait-on http://localhost:3000/v1/posts -t 60000

      - name: Build & preview web
        run: |
          pnpm --filter web build
          pnpm --filter web preview --port 5173 --host &

      - name: Wait for web
        run: pnpm dlx wait-on http://localhost:5173 -t 60000

      - name: Install Playwright browsers
        run: pnpm --filter e2e exec playwright install --with-deps chromium

      - name: Run Playwright
        run: pnpm --filter e2e test

      - name: Upload report on failure
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: apps/e2e/playwright-report/
          retention-days: 7
```

Detalhes que importam:
- O cron do GitHub Actions é sempre UTC; `0 12 * * *` = 09:00 BRT (UTC-3). Comentário no YAML torna isso explícito.
- O `seed` é idempotente — seguro rodar em CI.
- `synchronize: true` em [apps/api/src/app.module.ts](apps/api/src/app.module.ts) cria o schema automaticamente ao subir a API, então não há migration manual.
- Job também roda em PRs que tocam api/web/e2e, garantindo que regressões sejam pegas antes do merge (não só na execução agendada).
- O `wait-on http://localhost:3000/v1/posts` aceita qualquer 2xx — funciona porque o endpoint é público (OptionalJwtAuthGuard em [posts.controller.ts:42-51](apps/api/src/posts/posts.controller.ts#L42-L51)).

---

## Ordem de execução

1. Criar `apps/e2e/` com `package.json`, `playwright.config.ts`, `tsconfig.json`, fixtures e os 3 specs.
2. Verificar que o glob `apps/*` no `pnpm-workspace.yaml` já cobre o novo workspace; rodar `pnpm install`.
3. Rodar localmente: `docker compose up -d` → `pnpm --filter api seed` → `pnpm dev` (em outro terminal) → `pnpm --filter e2e test`. Os 3 specs devem passar.
4. Criar `.github/workflows/e2e.yml`.
5. Validar o workflow via `workflow_dispatch` manual antes de esperar o agendamento.

---

## Verificação ponta-a-ponta

- **Local:** sequência do passo 3 acima passa nos 3 specs em <60s no Chromium headless.
- **CI (manual):** disparar via "Run workflow" no GitHub Actions e verificar que termina verde em <10 min. Em falha, baixar o artifact `playwright-report` para diagnosticar.
- **CI (agendado):** após o merge, conferir no dia seguinte às 12:00 UTC se a execução agendada aparece em Actions com status verde.
- **Critério de pronto:** os 3 fluxos (login UI, criação de post via API + render no feed, comentário UI) passam em CI agendado por dois dias consecutivos sem flakes.
