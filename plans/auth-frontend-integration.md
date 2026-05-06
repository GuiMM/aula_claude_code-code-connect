# Integração frontend ↔ backend de autenticação (axios)

## Context

O backend NestJS (`apps/api`) já expõe os endpoints de autenticação (`POST /v1/auth/register`, `POST /v1/auth/login`, `GET /v1/auth/me`) com Swagger em `/docs`, JWT (1h) via Bearer token. O frontend Vite + TS vanilla (`apps/web`) já tem as telas de login e cadastro com Atomic Design, mas os formulários apenas dão `console.log` na submissão — não há cliente HTTP, persistência de token, nem navegação pós-login.

Esta tarefa conecta os dois lados usando **axios**, normaliza o campo `username → email` (descompasso com o DTO do backend), habilita CORS na API e cria uma `HomePage` mínima para fechar o fluxo end-to-end.

## Decisões alinhadas com o usuário

1. Renomear o campo `username` do LoginForm para `email` (alinha com `LoginDto`).
2. Habilitar CORS na API para `http://localhost:5173` (origem do Vite dev).
3. Criar `HomePage` placeholder em `#/home` que lê `GET /v1/auth/me` e tem botão de logout.
4. `Lembrar-me` controla persistência: `localStorage` quando marcado, `sessionStorage` quando não.

---

## Mudanças

### Backend — 1 arquivo

**[apps/api/src/main.ts](../apps/api/src/main.ts)** — habilitar CORS antes de `app.listen`:
```ts
app.enableCors({
  origin: process.env.WEB_ORIGIN ?? 'http://localhost:5173',
  credentials: false,
})
```
Sem `credentials: true` porque o token trafega por Bearer header, não cookie.

---

### Frontend

#### 1. Dependência e env

- `pnpm --filter web add axios`
- Novo **[apps/web/.env](../apps/web/.env)** (não versionado):
  ```
  VITE_API_BASE_URL=http://localhost:3000/v1
  ```
- Novo **[apps/web/.env.example](../apps/web/.env.example)** (versionado, template):
  ```
  VITE_API_BASE_URL=http://localhost:3000/v1
  ```

#### 2. Camada de serviços — nova pasta `src/services/`

**[apps/web/src/services/tokenStorage.ts](../apps/web/src/services/tokenStorage.ts)**
- Chave: `code-connect:token`
- `setToken(token: string, persistent: boolean)` — grava em `localStorage` se `persistent`, senão `sessionStorage`
- `getToken(): string | null` — lê `localStorage` primeiro, depois `sessionStorage`
- `clearToken()` — limpa os dois storages

**[apps/web/src/services/http.ts](../apps/web/src/services/http.ts)**
- Instância axios com `baseURL: import.meta.env.VITE_API_BASE_URL`
- Request interceptor: anexa `Authorization: Bearer ${token}` se `getToken()` retornar valor
- Response interceptor: em `401`, chama `clearToken()` e faz `window.location.hash = '#/login'`

**[apps/web/src/services/auth.ts](../apps/web/src/services/auth.ts)**
- `login({ email, password }) → Promise<{ access_token: string }>`
- `register({ name, email, password }) → Promise<{ id, name, email }>`
- `getMe() → Promise<{ id: string; name: string; email: string }>`
- `logout(): void` — apenas `clearToken()` (backend é stateless)
- Mapeia erros axios para `Error` com mensagem amigável em PT-BR usando `error.response?.data?.message`:
  - `401` → `'Email ou senha inválidos.'`
  - `409` → `'Este email já está cadastrado.'`
  - `400` → mensagem do Nest ou `'Dados inválidos.'`

#### 3. Ajuste no LoginForm

**[apps/web/src/components/organisms/LoginForm/LoginForm.ts](../apps/web/src/components/organisms/LoginForm/LoginForm.ts)**
- Renomear `username` → `email` em: `LoginFormData`, no `FormField` (label `'Email'`, name `'email'`, type `'email'`, placeholder `'seu@email.com'`) e no `FormData.get`
- Adicionar `<p data-error class="text-sm text-red-400 hidden">` acima do botão de submit
- Tornar `onSubmit?: (data) => Promise<void> | void`; no handler de submit: limpa o erro, desabilita o botão, faz `await onSubmit?.(data)`, em `catch` exibe a mensagem, `finally` reabilita o botão

#### 4. Ajuste no RegisterForm

**[apps/web/src/components/organisms/RegisterForm/RegisterForm.ts](../apps/web/src/components/organisms/RegisterForm/RegisterForm.ts)**
- Mesmo padrão: `<p data-error>` + `onSubmit` async com loading/error (campos já batem com o DTO)

#### 5. Páginas

**[apps/web/src/components/pages/LoginPage/LoginPage.ts](../apps/web/src/components/pages/LoginPage/LoginPage.ts)**
- `onSubmit`: chama `auth.login({ email, password })`, guarda token via `setToken(access_token, data.remember)`, navega para `#/home`
- Em erro: relança o `Error` para o formulário exibir

**[apps/web/src/components/pages/RegisterPage/RegisterPage.ts](../apps/web/src/components/pages/RegisterPage/RegisterPage.ts)**
- `onSubmit`: chama `auth.register(data)`, em seguida `auth.login({ email, password })` (auto-login pós-cadastro), guarda token, navega para `#/home`
- Em erro: relança o `Error` para o formulário exibir

**Nova: [apps/web/src/components/pages/HomePage/HomePage.ts](../apps/web/src/components/pages/HomePage/HomePage.ts)**
- No mount, chama `auth.getMe()`: em sucesso renderiza `Olá, {name}!`; em erro redireciona para `#/login`
- Botão `Sair` → `auth.logout()` + `window.location.hash = '#/login'`
- Layout mínimo Tailwind: `min-h-screen bg-page text-text-primary flex flex-col items-center justify-center gap-6`

#### 6. Roteamento

**[apps/web/src/main.ts](../apps/web/src/main.ts)**
- Adicionar case `#/home → HomePage()`
- Se já existir token e a rota for `#/login` ou `#/cadastro`, redirecionar para `#/home` (evita tela de login para quem já está autenticado)
- Default permanece `LoginPage`

#### 7. Testes

- **LoginForm.test.ts** — atualizar campo `email` (era `username`); cobrir erro do `onSubmit` em `[data-error]` e desabilitar botão durante loading
- **RegisterForm.test.ts** — cobrir erro em `[data-error]` e estado de loading
- Novos:
  - **src/services/tokenStorage.test.ts** — set/get/clear cobrindo `localStorage` e `sessionStorage`
  - **src/services/auth.test.ts** — mocka axios; verifica payloads e mapeamento de erros (401, 409, 400)
  - **src/components/pages/HomePage/HomePage.test.ts** — render com mock de `auth.getMe`, clique no logout limpa token

---

## Arquivos críticos

| Arquivo | Ação |
|---|---|
| `apps/api/src/main.ts` | Adicionar `enableCors` |
| `apps/web/package.json` | `pnpm add axios` |
| `apps/web/.env` | Criar (não versionar) |
| `apps/web/.env.example` | Criar (versionar) |
| `apps/web/src/services/tokenStorage.ts` | Novo |
| `apps/web/src/services/http.ts` | Novo |
| `apps/web/src/services/auth.ts` | Novo |
| `apps/web/src/components/organisms/LoginForm/LoginForm.ts` | Rename username→email, async onSubmit, erro UI |
| `apps/web/src/components/organisms/RegisterForm/RegisterForm.ts` | Async onSubmit, erro UI |
| `apps/web/src/components/pages/LoginPage/LoginPage.ts` | Wiring real com auth.login |
| `apps/web/src/components/pages/RegisterPage/RegisterPage.ts` | Wiring real com auth.register |
| `apps/web/src/components/pages/HomePage/HomePage.ts` | Novo |
| `apps/web/src/main.ts` | Rota `#/home` + redirect quando logado |

---

## Verificação end-to-end

1. `pnpm --filter web test` — todos os testes verdes
2. `pnpm dev` (api + web em paralelo) e testar:
   - `http://localhost:5173` → tela de login
   - **Cadastro**: `#/cadastro`, preencher → vai para `#/home` com `Olá, {nome}!`
   - **Login**: Sair → `#/login`, entrar com as credenciais → vai para `#/home`
   - **Erro 401**: senha errada → `[data-error]` exibe mensagem
   - **Erro 409**: email já cadastrado → erro amigável no form
   - **Persistência**: marcar "Lembrar-me", recarregar → continua logado; sem marcar, fechar aba → volta ao login
   - **Logout**: limpa token e vai para `#/login`
   - **Network tab**: requisição para `/v1/auth/me` tem header `Authorization: Bearer …`
3. Swagger em `http://localhost:3000/docs` — confirmar endpoints batem com o que o front chama
