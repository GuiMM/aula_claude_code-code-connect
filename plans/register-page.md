# Plano — Página de Cadastro (Atomic Design, Vanilla TS + Vite)

## Contexto

A página de [Login](./login-page.md) já foi implementada seguindo Atomic Design conforme `CLAUDE.md`. Agora precisamos adicionar a página de **Cadastro**, conforme o design Figma node `155:3469` (file `7Yfz59GFZeM9D4rlVEwM0I`).

Ao analisar o Figma, descobrimos que a paleta de cores e a tipografia atualmente em [apps/web/src/style.css](../apps/web/src/style.css) **divergem dos tokens oficiais do design**. Como Login e Cadastro compartilham praticamente todos os componentes, esta task aproveita para alinhar a paleta nos componentes compartilhados (decisão confirmada com o usuário) — assim o Login fica fiel ao mockup junto do Cadastro, sem duplicação.

**Saída esperada:** páginas `#/login` e `#/cadastro` renderizadas em `localhost`, fiéis ao Figma, com componentes atômicos individualmente testados via Vitest.

---

## 1. Tokens de design (correção a partir do Figma)

Substituir o conteúdo de [apps/web/src/style.css](../apps/web/src/style.css) pelos tokens oficiais do Figma:

```css
@import "tailwindcss";

@theme {
  /* Cores oficiais (nomes do Figma) */
  --color-bg-page: #00090E;        /* "Grafite"        */
  --color-bg-card: #171D1F;        /* "Cinza Escuro"   */
  --color-bg-input: #888888;       /* "Cinza médio"    */
  --color-text-primary: #E1E1E1;   /* "Offwhite"       */
  --color-text-muted: #888888;     /* "Cinza médio"    */
  --color-text-on-input: #00090E;  /* "Grafite"        */
  --color-text-on-primary: #132E35;/* "Verde petróleo" */
  --color-brand-green: #81FE88;    /* "Verde destaque" */
  --color-border-subtle: #888888;  /* borda do checkbox */

  /* Tipografia */
  --font-sans: "Prompt", system-ui, sans-serif;
  --font-icon: "Material Icons", sans-serif;
}
```

**Observação:** os *nomes* das classes Tailwind (`bg-brand-green`, `bg-bg-card`, `text-text-muted`, etc.) permanecem iguais; só os valores mudam — então a maioria dos testes existentes continua válida.

Ajustar [apps/web/index.html](../apps/web/index.html):
- Adicionar `<link>` do Google Fonts para **Prompt** (400, 600) e **Material Icons**.
- Trocar `<title>` para `code connect` (genérico, já que agora há duas rotas).
- Aplicar `font-family: var(--font-sans)` no `<body>` via classe ou regra global em `style.css`.

---

## 2. Ajustes nos componentes compartilhados existentes

### [atoms/Input/Input.ts](../apps/web/src/components/atoms/Input/Input.ts)
No Figma, o `<input>` tem **fundo cinza claro `#888` com texto escuro `#00090E` e placeholder em cinza médio escuro**. Ajustar classes:
- `bg-bg-input` (já era, agora valor é `#888`) — sem mudança de classe
- Adicionar `text-text-on-input placeholder:text-bg-card` para o texto digitado escuro
- Manter `rounded-md`, `px-4`, `py-2`

Atualizar `Input.test.ts` se algum teste verifica especificamente `text-white` ou similar.

### [atoms/Button/Button.ts](../apps/web/src/components/atoms/Button/Button.ts)
- **Variant `primary`**: trocar `text-black`/`text-white` por `text-text-on-primary` (verde petróleo `#132E35`), font `font-semibold`.
- Adicionar prop opcional `iconAfter?: string` — nome de Material Icon (ex: `'arrow_forward'`). Renderiza um `<span class="material-icons">` após o label. Mantém retrocompatibilidade.
- Adicionar campo correspondente em `ButtonProps`.
- Cobrir `iconAfter` em `Button.test.ts` (renderiza span com classe correta e textContent igual ao nome do ícone).

### [atoms/Heading/Heading.ts](../apps/web/src/components/atoms/Heading/Heading.ts)
Ajustar tamanhos para casar com o Figma:
- `level=1` → `text-[31px] font-semibold leading-[1.5] text-text-primary`
- `level=2` → `text-[22px] leading-[1.5] text-text-primary`
- `level=3` → `text-[18px] font-semibold text-text-primary`

(Deixar testes existentes passando — apenas substituir as asserções de classes.)

### [atoms/Link/Link.ts](../apps/web/src/components/atoms/Link/Link.ts)
- Adicionar prop `iconAfter?: string` (mesma ideia do Button) — usado pelo "Faça seu login! [icon login]" do Cadastro e "Crie seu cadastro! [icon]" do Login.
- Variant `accent` → `text-brand-green` (já é, valor mudou para `#81FE88` automaticamente via @theme).

### [atoms/Checkbox/Checkbox.ts](../apps/web/src/components/atoms/Checkbox/Checkbox.ts)
- Cor da borda no Figma é `#888` (cinza médio), label em `#888`. Atualizar classes para `border-border-subtle` (já era, valor mudou) e `text-text-muted` no label.

### [organisms/LoginForm/LoginForm.ts](../apps/web/src/components/organisms/LoginForm/LoginForm.ts)
- Trocar o label do botão de `'Login →'` para `'Login'` + `iconAfter: 'arrow_forward'`.
- Trocar o `linkText` do `AuthFooterPrompt` de `'Crie seu cadastro! 📋'` por `'Crie seu cadastro!'` + (opcional) `iconAfter: 'arrow_forward'` se estendermos `AuthFooterPrompt` para repassar o ícone.
- Estender `AuthFooterPrompt` com prop `linkIcon?: string` (passa direto para `Link({ iconAfter })`).
- Subtítulo já é `'Boas-vindas! Faça seu login.'` — manter.

### [pages/LoginPage/LoginPage.ts](../apps/web/src/components/pages/LoginPage/LoginPage.ts)
- Trocar `onSignup: () => console.log(...)` por `onSignup: () => { window.location.hash = '#/cadastro' }`.
- Manter `onSubmit` e `onForgotPassword` como stubs.

---

## 3. Novos componentes para o Cadastro

### organisms/RegisterForm/RegisterForm.ts (+ .test.ts)

Importante: o Cadastro **não tem** o link "Esqueci a senha" (apenas o checkbox "Lembrar-me" sozinho). Por isso, **não reutiliza** `RememberRow` — usa o `Checkbox` direto.

```ts
import { Heading } from '../../atoms/Heading/Heading'
import { Button } from '../../atoms/Button/Button'
import { Checkbox } from '../../atoms/Checkbox/Checkbox'
import { Divider } from '../../atoms/Divider/Divider'
import { FormField } from '../../molecules/FormField/FormField'
import { SocialLogins } from '../../molecules/SocialLogins/SocialLogins'
import { AuthFooterPrompt } from '../../molecules/AuthFooterPrompt/AuthFooterPrompt'

export interface RegisterFormData {
  name: string
  email: string
  password: string
  remember: boolean
}

export interface RegisterFormProps {
  onSubmit?: (data: RegisterFormData) => void
  onLogin?: () => void
}

export function RegisterForm({ onSubmit, onLogin }: RegisterFormProps = {}): HTMLElement
```

Estrutura interna:
- `Heading({ text: 'Cadastro', level: 1 })`
- `<p class="text-[22px] text-text-primary">Olá! Preencha seus dados.</p>`
- `FormField({ label: 'Nome',  name: 'name',     placeholder: 'Nome completo' })`
- `FormField({ label: 'Email', name: 'email',    type: 'email', placeholder: 'Digite seu email' })`
- `FormField({ label: 'Senha', name: 'password', type: 'password', placeholder: '••••••' })`
- `Checkbox({ label: 'Lembrar-me', name: 'remember' })`
- `Button({ label: 'Cadastrar', type: 'submit', variant: 'primary', iconAfter: 'arrow_forward' })`
- `Divider({ label: 'ou entre com outras contas' })`
- `SocialLogins({ providers: [github, gmail] })` — mesmos providers do Login
- `AuthFooterPrompt({ text: 'Já tem conta?', linkText: 'Faça seu login!', linkIcon: 'login', onLinkClick: onLogin })`

Submit handler igual ao do `LoginForm` — coleta `FormData`, `preventDefault`, chama `onSubmit`.

**Testes** (`RegisterForm.test.ts`) — espelhando o padrão de `LoginForm.test.ts`:
1. Renderiza heading "Cadastro", subtitle, 3 inputs (name/email/password), checkbox, botão submit, divider, social logins, footer prompt "Já tem conta?".
2. Submit chama `onSubmit` com objeto `{ name, email, password, remember }`.
3. `preventDefault` do submit.
4. Footer prompt aciona `onLogin` ao clicar no link.

### pages/RegisterPage/RegisterPage.ts (+ .test.ts)

```ts
import { AuthTemplate } from '../../templates/AuthTemplate/AuthTemplate'
import { AuthBanner } from '../../organisms/AuthBanner/AuthBanner'
import { RegisterForm } from '../../organisms/RegisterForm/RegisterForm'

export function RegisterPage(): HTMLElement {
  return AuthTemplate({
    banner: AuthBanner({ imageSrc: '/banner-cadastro.png' }),
    form: RegisterForm({
      onSubmit: (data) => console.log('Register attempt:', data),
      onLogin:  () => { window.location.hash = '#/login' },
    }),
  })
}
```

**Teste** (`RegisterPage.test.ts`):
- Renderiza um elemento contendo `<h1>Cadastro</h1>` e um `<img>` com `src="/banner-cadastro.png"`.

---

## 4. Roteamento (hash router em `main.ts`)

Reescrever [apps/web/src/main.ts](../apps/web/src/main.ts):

```ts
import './style.css'
import { LoginPage }    from './components/pages/LoginPage/LoginPage'
import { RegisterPage } from './components/pages/RegisterPage/RegisterPage'

const root = document.querySelector<HTMLDivElement>('#app')!

function render() {
  const route = window.location.hash || '#/login'
  root.replaceChildren(route === '#/cadastro' ? RegisterPage() : LoginPage())
}

window.addEventListener('hashchange', render)
render()
```

Sem dependências adicionais. Default = `#/login`. Rota desconhecida cai no Login.

---

## 5. Banner do Cadastro

Durante a implementação, baixar o asset principal do banner do Figma (URL `imgRectangle1726` retornada pelo `get_design_context`: `https://www.figma.com/api/mcp/asset/cfcf2246-6204-48f7-b523-e5534cbfb553`) e salvar como [apps/web/public/banner-cadastro.png](../apps/web/public/banner-cadastro.png).

Comando (PowerShell):
```powershell
Invoke-WebRequest -Uri "https://www.figma.com/api/mcp/asset/cfcf2246-6204-48f7-b523-e5534cbfb553" -OutFile "apps/web/public/banner-cadastro.png"
```

A logo "code connect" no rodapé do banner pode ou não estar embutida no PNG (no Figma é um node separado `Logo` posicionado sobre a imagem). Após baixar, validar visualmente — se não estiver embutida, considerar adicionar a logo via `<img>` overlay no `AuthBanner` (ponto de extensão; deferir se ficar bom como veio).

---

## 6. Arquivos — resumo

### Criar
- [apps/web/public/banner-cadastro.png](../apps/web/public/banner-cadastro.png) — download via Figma MCP
- `apps/web/src/components/organisms/RegisterForm/RegisterForm.ts` + `.test.ts`
- `apps/web/src/components/pages/RegisterPage/RegisterPage.ts` + `.test.ts`

### Modificar
- [apps/web/src/style.css](../apps/web/src/style.css) — tokens corrigidos + font-family
- [apps/web/index.html](../apps/web/index.html) — Google Fonts (Prompt + Material Icons) + `<title>` genérico
- [apps/web/src/main.ts](../apps/web/src/main.ts) — hash router
- [apps/web/src/components/atoms/Input/Input.ts](../apps/web/src/components/atoms/Input/Input.ts) — texto escuro sobre fundo cinza claro
- [apps/web/src/components/atoms/Button/Button.ts](../apps/web/src/components/atoms/Button/Button.ts) — `iconAfter` + cor de texto do primary
- [apps/web/src/components/atoms/Link/Link.ts](../apps/web/src/components/atoms/Link/Link.ts) — `iconAfter`
- [apps/web/src/components/atoms/Heading/Heading.ts](../apps/web/src/components/atoms/Heading/Heading.ts) — tamanhos do Figma
- [apps/web/src/components/atoms/Checkbox/Checkbox.ts](../apps/web/src/components/atoms/Checkbox/Checkbox.ts) — cor da borda/label
- [apps/web/src/components/molecules/AuthFooterPrompt/AuthFooterPrompt.ts](../apps/web/src/components/molecules/AuthFooterPrompt/AuthFooterPrompt.ts) — prop `linkIcon`
- [apps/web/src/components/organisms/LoginForm/LoginForm.ts](../apps/web/src/components/organisms/LoginForm/LoginForm.ts) — usar `iconAfter` na Button "Login"
- [apps/web/src/components/pages/LoginPage/LoginPage.ts](../apps/web/src/components/pages/LoginPage/LoginPage.ts) — `onSignup` → hash route
- Testes correspondentes que assertam classes alteradas

### Não tocar
- `AuthTemplate`, `AuthBanner`, `PageBackground`, `FormField`, `SocialButton`, `SocialLogins`, `Label`, `Divider`, `RememberRow` — todos reutilizados sem mudança lógica.

---

## 7. Riscos / pontos de atenção

1. **Diferença de tokens afeta visual do Login**: o Login passará a usar a paleta correta (cor primária `#81FE88` no lugar de `#62F277`, fundo `#00090E` no lugar de `#0B0C10`, etc.). Decisão já confirmada — esperado e desejado.
2. **Input no Figma é cinza claro com texto escuro**: visualmente diferente do que o Login mostra hoje (fundo escuro). Vai mudar nos dois — alinha com o design.
3. **Material Icons via CDN**: depende de rede. Se quiser evitar dependência externa, posso trocar por SVG inline no `Icon` atom (mais código, mais robusto). Como o usuário não levantou isso, mantenho via Google Fonts.
4. **Decoração de correntes do fundo**: continua deferida (mesma decisão do plano do Login). O Figma mostra elos de corrente sutis (opacity 0.3) atrás do card; sem asset estruturado para isso ainda. Manter `PageBackground` plano por ora — comentário no código sobre o ponto de extensão.
5. **Banner do Cadastro**: o asset baixado pode não conter a logo "code connect" no rodapé (no Figma é overlay). Validar visualmente após download — se faltar, adicionar logo overlay no `AuthBanner` (props já permitem, basta passar um children adicional ou criar uma variante).
6. **Submit do Cadastro**: stub (`console.log`). Integração com `POST /v1/auth/register` em `apps/api` fica para próxima task.

---

## 8. Verificação ponta a ponta

1. `pnpm --filter web dev` → abrir `http://localhost:5173`:
   - Default mostra Login fiel ao mockup (cores oficiais, fonte Prompt).
   - Clicar em **"Crie seu cadastro!"** → URL muda para `#/cadastro` → renderiza Cadastro fiel ao mockup do Figma.
   - Clicar em **"Faça seu login!"** no Cadastro → volta para `#/login`.
2. Conferir manualmente: digitar nos 3 campos do Cadastro, marcar/desmarcar checkbox, hover no botão verde, clicar nos botões sociais, submit do form (deve logar `{ name, email, password, remember }` no console + `preventDefault`).
3. `pnpm --filter web test` → todos os `*.test.ts` passam (incluindo os ajustes nos testes existentes).
4. `pnpm web:build` → build de produção sem erros (TS strict + Vite).
5. Smoke do monorepo: `pnpm dev` (api + web em paralelo) continua funcionando.
6. Validar visualmente lado a lado com o screenshot do Figma do Cadastro (node `155:3469`) — espaçamentos, tipografia, cores.
