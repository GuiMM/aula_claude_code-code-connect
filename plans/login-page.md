# Plano — Página de Login (Atomic Design, Vanilla TS + Vite)

## Contexto

O `apps/web` está hoje no boilerplate do Vite (vanilla TypeScript, sem Tailwind, sem framework de teste, sem componentes). Vamos transformá-lo em uma SPA com a primeira tela funcional — **Login** — seguindo Atomic Design conforme exigido pelo `CLAUDE.md`. Já existem em `public/`: `banner.png` (com a logo "code connect" embutida no rodapé da imagem), `github_logo.png`, `gmail.png`.

A página de **Cadastro** virá depois e compartilha o mesmo layout base (mesmo card de duas colunas, mesmo fundo escuro), mudando apenas o banner e os campos do formulário. O plano isola essa diferença num único *template* reutilizável e mantém o restante por composição.

Saída esperada: tela de login renderizada em `localhost`, fiel ao mockup, com componentes atômicos individualmente testados via Vitest.

---

## 1. Setup de infraestrutura

Comandos rodados a partir de `apps/web/`:

```bash
pnpm add -D tailwindcss @tailwindcss/vite vitest happy-dom
```

**Criar `apps/web/vite.config.ts`** — único config, com plugin do Tailwind v4 e bloco `test` do Vitest:

```ts
/// <reference types="vitest" />
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss()],
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['src/**/*.test.ts'],
  },
})
```

**Reescrever `apps/web/src/style.css`** com import do Tailwind v4 + tokens de tema (cores aproximadas do mockup; ajustáveis):

```css
@import "tailwindcss";

@theme {
  --color-brand-green: #62F277;
  --color-bg-page: #0B0C10;
  --color-bg-card: #17181E;
  --color-bg-input: #2A2C36;
  --color-border-subtle: #2A2C36;
  --color-text-muted: #A0A3B1;
}
```

**Ajustar `apps/web/tsconfig.json`** — adicionar `"vitest/globals"` em `compilerOptions.types` para `describe/it/expect` sem imports.

**Ajustar `apps/web/package.json`** — adicionar scripts `"test": "vitest run"` e `"test:watch": "vitest"`. Adicionar `"web:test": "pnpm --filter web test"` no `package.json` da raiz.

---

## 2. Padrão de componente

**Decisão: factory function que retorna `HTMLElement`.**

Motivo: parents compõem com `appendChild`, listeners ficam locais ao componente, testes operam direto em DOM nodes (sem `innerHTML`), e props com tipos garantem que strings de usuário vão por `textContent` (sem risco de XSS).

Cada pasta tem `<Name>.ts` + `<Name>.test.ts`. Exemplo `Button.ts`:

```ts
export interface ButtonProps {
  label: string
  variant?: 'primary' | 'social'
  iconSrc?: string
  type?: 'button' | 'submit'
  onClick?: (e: MouseEvent) => void
}

export function Button(props: ButtonProps): HTMLButtonElement { /* ... */ }
```

Cada teste cobre: render com props default, ao menos uma interação (click/change/submit), e renderização condicional relevante (variant, iconSrc, error state, etc.).

---

## 3. Componentes a criar

Marcação: **(R)** = reutilizado pelo futuro Register, **(L)** = exclusivo do Login.

### Atoms — [apps/web/src/components/atoms/](../apps/web/src/components/atoms/)

| Componente | Responsabilidade |
|---|---|
| **Button** (R) | Variantes `primary` (verde) e `social` (ícone em cima, label embaixo) |
| **Input** (R) | `<input>` controlado por props (`type`, `name`, `placeholder`, `value`) |
| **Label** (R) | `<label>` tipográfico, vinculado por `htmlFor` |
| **Checkbox** (R) | Checkbox + label inline |
| **Link** (R) | `<a>` estilizado (sublinhado + cores por variant) |
| **Heading** (R) | `<h1>`/`<h2>` com tipografia consistente |
| **Divider** (R) | HR horizontal com label centralizada opcional |

### Molecules — [apps/web/src/components/molecules/](../apps/web/src/components/molecules/)

| Componente | Responsabilidade |
|---|---|
| **FormField** (R) | `Label` + `Input` empilhados verticalmente |
| **RememberRow** (L) | `Checkbox` "Lembrar-me" + `Link` "Esqueci a senha" em flex row |
| **SocialButton** (R) | `Button` social com ícone (PNG) acima e label abaixo |
| **SocialLogins** (R) | Linha de `SocialButton`s. Aceita lista de providers via props |
| **AuthFooterPrompt** (R) | "Ainda não tem conta? `Link` Crie seu cadastro!" — texto e link via props |

### Organisms — [apps/web/src/components/organisms/](../apps/web/src/components/organisms/)

| Componente | Responsabilidade |
|---|---|
| **AuthBanner** (R) | Coluna esquerda do card: `<img>` cobrindo a célula. Recebe `imageSrc` + `alt`. A logo "code connect" já vem embutida no PNG do banner. |
| **LoginForm** (L) | Coluna direita do Login: `Heading` + subtítulo + 2× `FormField` + `RememberRow` + `Button` submit + `Divider` + `SocialLogins` + `AuthFooterPrompt`. Lida com submit. |
| **PageBackground** (R) | `<div>` viewport com fundo `bg-page`. (Decoração de correntes ao fundo: ver Item 6.) |

### Templates — [apps/web/src/components/templates/](../apps/web/src/components/templates/)

| Componente | Responsabilidade |
|---|---|
| **AuthTemplate** (R) | Centraliza um card de duas colunas dentro do `PageBackground`. Slots: `banner: HTMLElement` (esquerda), `form: HTMLElement` (direita). Sem nenhuma cópia ou lógica de auth. |

API:

```ts
export interface AuthTemplateProps {
  banner: HTMLElement   // ex: AuthBanner({ imageSrc: '/banner.png' })
  form: HTMLElement     // ex: LoginForm({ onSubmit }) ou RegisterForm({ onSubmit })
}
export function AuthTemplate(props: AuthTemplateProps): HTMLElement
```

### Pages — [apps/web/src/components/pages/](../apps/web/src/components/pages/)

| Componente | Responsabilidade |
|---|---|
| **LoginPage** (L) | Compõe `AuthTemplate` com `AuthBanner({ imageSrc: '/banner.png' })` + `LoginForm({ onSubmit })`. `onSubmit` por enquanto é stub (`console.log` + `e.preventDefault()`); integração com `apps/api` fica para depois. |

### Mount

Reescrever [apps/web/src/main.ts](../apps/web/src/main.ts):

```ts
import './style.css'
import { LoginPage } from './components/pages/LoginPage/LoginPage'

const root = document.querySelector<HTMLDivElement>('#app')!
root.replaceChildren(LoginPage())
```

Atualizar `<title>` em [apps/web/index.html](../apps/web/index.html) para `code connect — Login`.

---

## 4. O que isola o Login do futuro Cadastro

Quando o Cadastro chegar, só será necessário criar:
- `organisms/RegisterForm/RegisterForm.ts` (mesmo shape de `LoginForm`, com campos próprios)
- `pages/RegisterPage/RegisterPage.ts` que compõe `AuthTemplate` com banner próprio + `RegisterForm`

`AuthTemplate`, `AuthBanner`, `PageBackground`, todos os atoms e quase todas as molecules ficam intactos. Decisão de roteamento (hash router em `main.ts` vs entry-points múltiplos no Vite) fica deferida para quando o Cadastro for implementado.

---

## 5. Arquivos a criar e excluir

### Criar

- [apps/web/vite.config.ts](../apps/web/vite.config.ts)
- 7 atoms × 2 arquivos = 14 (`Button`, `Input`, `Label`, `Checkbox`, `Link`, `Heading`, `Divider`)
- 5 molecules × 2 arquivos = 10 (`FormField`, `RememberRow`, `SocialButton`, `SocialLogins`, `AuthFooterPrompt`)
- 3 organisms × 2 arquivos = 6 (`AuthBanner`, `LoginForm`, `PageBackground`)
- 1 template × 2 arquivos = 2 (`AuthTemplate`)
- 1 page × 2 arquivos = 2 (`LoginPage`)

Cada par segue o padrão `apps/web/src/components/<level>/<Name>/<Name>.ts` + `<Name>.test.ts`.

### Reescrever

- [apps/web/src/main.ts](../apps/web/src/main.ts) — passa a montar `LoginPage()`
- [apps/web/src/style.css](../apps/web/src/style.css) — `@import "tailwindcss"` + `@theme`
- [apps/web/tsconfig.json](../apps/web/tsconfig.json) — adicionar `"vitest/globals"` aos `types`
- [apps/web/package.json](../apps/web/package.json) — scripts `test`/`test:watch`
- [apps/web/index.html](../apps/web/index.html) — `<title>`
- Raiz [package.json](../package.json) — script `web:test`

### Excluir

- [apps/web/src/counter.ts](../apps/web/src/counter.ts) — boilerplate
- [apps/web/src/assets/vite.svg](../apps/web/src/assets/vite.svg)
- [apps/web/src/assets/typescript.svg](../apps/web/src/assets/typescript.svg)
- [apps/web/src/assets/hero.png](../apps/web/src/assets/hero.png)
- A pasta `apps/web/src/assets/` (vazia depois)

### Manter

- [apps/web/public/](../apps/web/public/) — `banner.png`, `github_logo.png`, `gmail.png`, `favicon.svg`, `icons.svg` (este último não é usado pelo Login mas pode servir mais à frente)

---

## 6. Pontos a confirmar / riscos

1. **Decoração de correntes do fundo**: o mockup mostra ícones de elo de corrente bem sutis atrás do card. Não temos asset para isso. Plano: **renderizar `PageBackground` apenas com o fundo escuro plano agora**, deixando comentário no código sobre o ponto de extensão. Se quiser, depois adicionamos um SVG repetido como `background-image`.
2. **Tailwind v4 + Vite v8**: `@tailwindcss/vite` ainda é jovem em Vite v8. Risco baixo, mas se quebrar resolvemos com `pnpm add vite@^7 -D` ou voltando para Tailwind v3.
3. **Submit do Login**: stub por enquanto (`console.log({ user, pass })`). Integração com `POST /v1/auth/login` em `apps/api` fica para próxima task — nem o endpoint existe ainda.
4. **Cores**: tokens em `@theme` são aproximações do mockup. Posso ajustar se houver paleta oficial.
5. **Eslint/Prettier no `apps/web`**: o `CLAUDE.md` só os menciona para `apps/api`. Não vou adicioná-los nesta task.

---

## 7. Verificação ponta a ponta

1. `pnpm --filter web dev` → abrir `http://localhost:5173` → ver a página de Login renderizada, fiel ao mockup.
2. Conferir manualmente: digitar nos inputs, marcar/desmarcar checkbox, clicar nos links sociais, hover no botão verde, submit do form (deve logar credenciais no console + `preventDefault`).
3. `pnpm --filter web test` → todos os `*.test.ts` passam.
4. `pnpm web:build` → build de produção sem erros (TS strict + Vite).
5. Smoke do monorepo: `pnpm dev` (api + web em paralelo) continua funcionando.
