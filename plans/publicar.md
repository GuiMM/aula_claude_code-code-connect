# Plano — Página "Publicar" (criar novo post)

## Context

A rota `#/publicar` hoje mostra apenas um placeholder (`ComingSoonPage`). O objetivo é
implementar a tela de **Publicar** descrita no Figma: um formulário autenticado para o
usuário criar um novo post (título, descrição, conteúdo e imagem de capa).

A boa notícia: **o backend já está pronto**. Existe `POST /v1/posts` protegido por JWT
(`apps/api/src/posts/posts.controller.ts`) que aceita o `CreatePostDto`:
`title` (3–255), `description` (≥10), `content` (≥10), `thumbnailUrl?` (URL válida) e
retorna o `PostDetailDto` com `id`. Portanto **este é um trabalho 100% de frontend** —
nenhuma mudança de API, DTO ou banco é necessária.

> Observação: o design no Figma não pôde ser carregado (limite do plano Starter do Figma
> MCP foi atingido). O plano abaixo foi alinhado com o usuário e segue fielmente o contrato
> da API e os padrões já existentes no frontend. Os detalhes visuais finos (espaçamentos,
> textos exatos, ícones) devem ser ajustados conforme o Figma durante a implementação.

### Decisões confirmadas com o usuário
- **Imagem de capa:** campo de **URL** (input de texto) — o backend só aceita `thumbnailUrl`
  como string; não há upload de arquivo. Sem mudança de backend.
- **Campos do formulário:** Título, Descrição, Conteúdo e Imagem de capa (URL).
- **Após publicar com sucesso:** redirecionar para o feed (`#/feed`).

## Padrões existentes a reutilizar

- Serviço de posts: [posts.ts](apps/web/src/services/posts.ts) — usa `http` (axios com
  Bearer token automático). Já tem `getPost`, `createComment` etc. Vamos adicionar `createPost`.
- Organism de formulário: [RegisterForm.ts](apps/web/src/components/organisms/RegisterForm/RegisterForm.ts)
  — padrão de `form` + `FormData` + `errorEl` oculto + `submitBtn.disabled` + try/catch.
- Página: [RegisterPage.ts](apps/web/src/components/pages/RegisterPage/RegisterPage.ts) — wireia
  organism ao serviço e faz o redirect via `window.location.hash`.
- Layout autenticado: [FeedTemplate.ts](apps/web/src/components/templates/FeedTemplate/FeedTemplate.ts)
  (Sidebar + `<main>`) — usado pelas páginas internas.
- Molecule de campo: [FormField.ts](apps/web/src/components/molecules/FormField/FormField.ts)
  (Label + Input). Vamos criar o equivalente para textarea.
- Átomos: `Input`, `Button` (`iconAfter: 'arrow_forward'`, `type: 'submit'`, `variant: 'primary'`),
  `Heading`, `Label`.
- Roteador: [main.ts](apps/web/src/main.ts) — hash-based; trocar o branch `#/publicar`.

## Mudanças

### 1. Serviço — `createPost`
Arquivo: [posts.ts](apps/web/src/services/posts.ts)
- Adicionar interface `CreatePostInput { title; description; content; thumbnailUrl?: string }`.
- Adicionar `export async function createPost(input: CreatePostInput): Promise<PostDetail>`
  que faz `http.post<PostDetail>('/posts', body)` (omitindo `thumbnailUrl` quando vazio,
  espelhando o padrão de `createComment`). Retorna `res.data`.

### 2. Átomo `TextArea` (novo)
Pasta: `apps/web/src/components/atoms/TextArea/`
- `TextArea.ts`: `TextArea({ name, placeholder, value?, id?, rows? }): HTMLTextAreaElement`.
  Mesmas classes Tailwind do `Input` (`bg-bg-input`, `border-border-subtle`, etc.), com
  `min-h`/`rows` para o conteúdo. Hoje a textarea é criada inline em `CommentForm`; criar o
  átomo torna o padrão reutilizável e atende à regra "todo componente tem teste".
- `TextArea.test.ts`: renderiza com `tagName === 'TEXTAREA'`, aplica `name`/`placeholder`.

### 3. Molécula `FormTextArea` (novo)
Pasta: `apps/web/src/components/molecules/FormTextArea/`
- `FormTextArea.ts`: paralela ao `FormField`, compõe `Label` + `TextArea` (mesmo wrapper
  `flex flex-col gap-2`, deriva `id` de `name`).
- `FormTextArea.test.ts`: renderiza label associada (`htmlFor`) + textarea com `name`.

### 4. Organism `PublishForm` (novo)
Pasta: `apps/web/src/components/organisms/PublishForm/`
- `PublishForm.ts`: espelha `RegisterForm`. Estrutura:
  - `Heading({ text: 'Publicar', level: 1 })` + subtítulo.
  - `FormField` para **Título** (`name="title"`), **Descrição** (`name="description"`) e
    **Imagem de capa** (`name="thumbnailUrl"`, `placeholder` de URL).
  - `FormTextArea` para **Conteúdo** (`name="content"`).
  - `errorEl` oculto + `Button({ label: 'Publicar', iconAfter: 'arrow_forward', type: 'submit' })`.
  - Props: `{ onSubmit?: (data: PublishFormData) => Promise<void> | void }` onde
    `PublishFormData = { title; description; content; thumbnailUrl: string }`.
  - No `submit`: `preventDefault`, lê via `FormData`, desabilita o botão, chama `onSubmit`,
    exibe mensagem no `errorEl` em caso de erro (try/catch/finally) — igual ao RegisterForm.
- `PublishForm.test.ts`: (a) renderiza os 4 campos; (b) `onSubmit` é chamado com os valores
  digitados; (c) mensagem de erro aparece quando `onSubmit` rejeita. Usar o helper
  `flush = () => new Promise(r => setTimeout(r, 0))` como nos testes de formulário existentes.

### 5. Página `PublishPage` (novo)
Pasta: `apps/web/src/components/pages/PublishPage/`
- `PublishPage.ts`: envolve `PublishForm` em `FeedTemplate` (layout com Sidebar). Guarda de
  autenticação: se `!getToken()`, redireciona para `#/login`. No `onSubmit`, chama
  `createPost({...})` e em seguida `window.location.hash = '#/feed'`.
- `PublishPage.test.ts`: renderiza dentro do FeedTemplate; verifica presença do formulário.

### 6. Roteamento
Arquivo: [main.ts](apps/web/src/main.ts)
- Importar `PublishPage` e trocar o branch:
  `else if (hash === '#/publicar') { root.replaceChildren(PublishPage()) }`
  (remover o `ComingSoonPage({ title: 'Publicar' })`). Os links da `Sidebar` para
  `#/publicar` já existem.

## Verificação

1. **Testes unitários (web):** `pnpm --filter web test` (Vitest + happy-dom) — todos os novos
   `*.test.ts` devem passar.
2. **Type-check/build:** `pnpm web:build` (tsc + vite build) sem erros.
3. **End-to-end manual:** `pnpm dev` (sobe api + web). Logar, clicar em "Publicar" na Sidebar,
   preencher título/descrição/conteúdo e uma URL de imagem, enviar. Esperado: `201` em
   `POST /v1/posts`, redirecionamento para `#/feed` e o novo post aparecendo no topo do feed.
4. **Casos de borda:** enviar sem login → redireciona para `#/login`; backend rejeitando
   (ex.: título < 3 chars) → mensagem de erro visível no formulário, botão reabilitado.
5. (Opcional) Atualizar a suíte Playwright em `apps/web` com um fluxo de publicação.

## Fora de escopo
- Upload de arquivo de imagem (backend não suporta; usaríamos Multer + static serving — fica
  para depois).
- Editor markdown com preview, rascunhos, edição de post existente (`PATCH`).
