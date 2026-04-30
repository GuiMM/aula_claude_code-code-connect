# Plano — Publicar `aula_claude_code` no GitHub via MCP + abrir PR da Login Page

## Contexto

O repositório `code-connect` é um monorepo pnpm criado durante o curso de engenharia de software com IA (Claude Code). Hoje ele existe **apenas localmente**, com 1 commit inicial e várias mudanças não commitadas que **já implementam por inteiro** o plano em [login-page.md](./login-page.md) — todos os atoms, molecules, organisms, template e a `LoginPage` estão no working directory com seus testes (`*.test.ts`), além das mudanças de infra (Tailwind v4, Vitest, deleção do boilerplate Vite, assets em `public/`).

**Objetivo desta task:**

1. Publicar o repo no GitHub do usuário (`GuiMM`) como `aula_claude_code`, **público**.
2. Estruturar o histórico em duas etapas:
   - `main` recebe o commit inicial existente + um commit de docs (README + CLAUDE.md + plans/).
   - Branch `feat/login-page` traz a implementação dividida em ~6 commits semânticos seguindo Conventional Commits.
3. Abrir um PR `feat/login-page → main` com descrição **didática** (motivada pelo curso) que conta a história "plano → execução".
4. Criar um `README.md` na raiz que documenta a base arquitetural do projeto (monorepo, Atomic Design, REST, comandos).

**Como o MCP substitui o `gh` CLI:**

Todas as operações com o GitHub são feitas via **MCP Server do GitHub** já configurado no ambiente — sem necessidade de instalar ou autenticar o `gh` CLI. As ferramentas usadas são:

| Ferramenta MCP | Substitui |
|---|---|
| `mcp__github__get_me` | `gh auth status` |
| `mcp__github__create_repository` | `gh repo create` |
| `mcp__github__push_files` | `git push` (múltiplos arquivos em 1 commit) |
| `mcp__github__create_branch` | `git checkout -b` + `git push` |
| `mcp__github__create_pull_request` | `gh pr create` |

**Importante:** O working directory local permanece **inalterado** — nenhum `git commit` ou `git push` local é necessário. O repositório remoto é construído diretamente via MCP, lendo o conteúdo dos arquivos locais e enviando ao GitHub.

---

## Stage 0 — Verificar autenticação MCP

Chamar `mcp__github__get_me` e confirmar que a conta retornada é `GuiMM`.

Se retornar outro usuário ou erro, parar e reportar ao usuário — não prosseguir.

---

## Stage 1 — Criar repositório no GitHub

Chamar `mcp__github__create_repository` com:

```
name:        aula_claude_code
description: "Estudos de engenharia de software com IA (Claude Code) — monorepo pnpm com NestJS + Vite/TS."
private:     false
autoInit:    true   ← cria branch `main` com um README padrão (será sobrescrito no Stage 2)
```

O `autoInit: true` é necessário para que o repositório já tenha uma branch `main` antes das próximas chamadas (GitHub não aceita `push_files` em repo vazio sem SHA base).

---

## Stage 2 — Commit de docs em `main`

Chamar `mcp__github__push_files` com:

```
owner:   GuiMM
repo:    aula_claude_code
branch:  main
message: "docs: add README, CLAUDE.md and login page plan"
files:
  - path: README.md              ← conteúdo gerado (ver seção "Conteúdo do README" abaixo)
  - path: CLAUDE.md              ← lido de apps/web/../CLAUDE.md local (raiz do repo)
  - path: plans/login-page.md   ← lido de plans/login-page.md local
  - path: plans/github-publish-and-login-pr.md  ← este arquivo
```

Após este push, `main` terá 2 commits:
1. `Initial commit` (do autoInit)
2. `docs: add README, CLAUDE.md and login page plan`

---

## Stage 3 — Criar branch `feat/login-page`

Chamar `mcp__github__create_branch` com:

```
owner:       GuiMM
repo:        aula_claude_code
branch:      feat/login-page
from_branch: main
```

A branch parte do topo de `main`, portanto o PR só mostrará o diff dos commits abaixo — sem misturar com os docs.

---

## Stage 4 — 6 commits semânticos em `feat/login-page`

Cada commit = uma chamada `mcp__github__push_files` para `feat/login-page`. Ler cada arquivo localmente e passar o conteúdo no campo `content`.

### Commit 1 — `chore(web): setup tailwind v4 and vitest`

```
files:
  - apps/web/package.json
  - apps/web/tsconfig.json
  - apps/web/vite.config.ts
  - apps/web/src/style.css
  - package.json
  - pnpm-lock.yaml
```

### Commit 2 — `chore(web): remove vite boilerplate, add login assets`

```
files:
  - apps/web/index.html
  - apps/web/src/main.ts          ← versão modificada (monta LoginPage)
  - apps/web/public/banner.png        ← binário PNG (ver nota abaixo)
  - apps/web/public/github_logo.png   ← binário PNG
  - apps/web/public/gmail.png         ← binário PNG
```

> **Nota sobre binários (PNG):** O `mcp__github__push_files` envia conteúdo como string. Para arquivos binários, ler o arquivo com `base64` e passar o resultado diretamente — o GitHub interpreta o conteúdo como base64 quando o campo `encoding` está presente na API de blobs. Se `push_files` não suportar binários, usar `mcp__github__create_or_update_file` individualmente para cada PNG.
>
> Os arquivos deletados localmente (`apps/web/src/counter.ts`, `apps/web/src/assets/`) **não existem no remoto** (repositório recém-criado), portanto não precisam ser explicitamente removidos — simplesmente não são enviados.

### Commit 3 — `feat(web): add login atoms (Button, Input, Label, Checkbox, Link, Heading, Divider)`

```
files (14 arquivos — cada atom: <Name>.ts + <Name>.test.ts):
  - apps/web/src/components/atoms/Button/Button.ts
  - apps/web/src/components/atoms/Button/Button.test.ts
  - apps/web/src/components/atoms/Input/Input.ts
  - apps/web/src/components/atoms/Input/Input.test.ts
  - apps/web/src/components/atoms/Label/Label.ts
  - apps/web/src/components/atoms/Label/Label.test.ts
  - apps/web/src/components/atoms/Checkbox/Checkbox.ts
  - apps/web/src/components/atoms/Checkbox/Checkbox.test.ts
  - apps/web/src/components/atoms/Link/Link.ts
  - apps/web/src/components/atoms/Link/Link.test.ts
  - apps/web/src/components/atoms/Heading/Heading.ts
  - apps/web/src/components/atoms/Heading/Heading.test.ts
  - apps/web/src/components/atoms/Divider/Divider.ts
  - apps/web/src/components/atoms/Divider/Divider.test.ts
```

### Commit 4 — `feat(web): add login molecules`

```
files (10 arquivos):
  - apps/web/src/components/molecules/FormField/FormField.ts
  - apps/web/src/components/molecules/FormField/FormField.test.ts
  - apps/web/src/components/molecules/RememberRow/RememberRow.ts
  - apps/web/src/components/molecules/RememberRow/RememberRow.test.ts
  - apps/web/src/components/molecules/SocialButton/SocialButton.ts
  - apps/web/src/components/molecules/SocialButton/SocialButton.test.ts
  - apps/web/src/components/molecules/SocialLogins/SocialLogins.ts
  - apps/web/src/components/molecules/SocialLogins/SocialLogins.test.ts
  - apps/web/src/components/molecules/AuthFooterPrompt/AuthFooterPrompt.ts
  - apps/web/src/components/molecules/AuthFooterPrompt/AuthFooterPrompt.test.ts
```

### Commit 5 — `feat(web): add organisms and AuthTemplate`

```
files (8 arquivos):
  - apps/web/src/components/organisms/AuthBanner/AuthBanner.ts
  - apps/web/src/components/organisms/AuthBanner/AuthBanner.test.ts
  - apps/web/src/components/organisms/LoginForm/LoginForm.ts
  - apps/web/src/components/organisms/LoginForm/LoginForm.test.ts
  - apps/web/src/components/organisms/PageBackground/PageBackground.ts
  - apps/web/src/components/organisms/PageBackground/PageBackground.test.ts
  - apps/web/src/components/templates/AuthTemplate/AuthTemplate.ts
  - apps/web/src/components/templates/AuthTemplate/AuthTemplate.test.ts
```

### Commit 6 — `feat(web): wire LoginPage and mount on #app`

```
files (2 arquivos):
  - apps/web/src/components/pages/LoginPage/LoginPage.ts
  - apps/web/src/components/pages/LoginPage/LoginPage.test.ts
```

> `apps/web/src/main.ts` foi incluído no Commit 2 para manter o boilerplate-removal e o entrypoint no mesmo commit, como no plano original.

---

## Stage 5 — Abrir PR

Chamar `mcp__github__create_pull_request` com:

```
owner: GuiMM
repo:  aula_claude_code
title: "feat(web): login page (Atomic Design, vanilla TS + Vite)"
head:  feat/login-page
base:  main
body:  (conteúdo abaixo)
```

### Corpo do PR (didático, em pt-BR)

```markdown
## Contexto

Este é o primeiro PR de feature do `aula_claude_code` — projeto de estudos do curso de
engenharia de software com IA, usando Claude Code como par. O objetivo é demonstrar um fluxo
**plano-dirigido**: a IA produz um plano detalhado, o humano aprova, a IA executa, e o PR
conta a história dessa execução.

O plano deste PR vive em [`plans/login-page.md`](../blob/main/plans/login-page.md). Recomendo
abrir lado a lado com o diff para acompanhar.

## O que entra

Implementação completa da tela de **Login** do `code-connect`, seguindo Atomic Design
(atoms → molecules → organisms → template → page), com Vanilla TypeScript + Vite +
Tailwind v4 + Vitest. Todos os 16 componentes têm seu `*.test.ts` correspondente.

### Decisões de arquitetura
- **Factory function `(props) => HTMLElement`** como padrão de componente — evita `innerHTML`,
  garante que strings de usuário vão por `textContent` (sem XSS), e deixa testes operando
  direto em DOM nodes.
- **`AuthTemplate` recebe slots** (`banner`, `form`) para que o futuro Cadastro reutilize 100%
  da estrutura, mudando apenas banner e formulário.
- **Tailwind v4 com `@theme`** centraliza tokens de cor (`--color-brand-green`, `--color-bg-page`…)
  na própria CSS — sem `tailwind.config.js`.

### Não entra (deferido)
- Integração com `apps/api` (`POST /v1/auth/login`) — endpoint ainda não existe; submit é stub.
- Roteamento (Cadastro, recuperação de senha) — decisão entre hash router vs entry-points
  múltiplos do Vite fica para quando a segunda tela chegar.

## Estrutura dos commits

Cada commit cobre uma camada para facilitar o code review:

1. `chore(web): setup tailwind v4 and vitest` — infra (deps, vite.config, tsconfig, style.css)
2. `chore(web): remove vite boilerplate, add login assets` — limpeza + PNGs do mockup + main.ts
3. `feat(web): add login atoms` — Button, Input, Label, Checkbox, Link, Heading, Divider
4. `feat(web): add login molecules` — FormField, RememberRow, SocialButton, SocialLogins, AuthFooterPrompt
5. `feat(web): add organisms and AuthTemplate` — AuthBanner, LoginForm, PageBackground, AuthTemplate
6. `feat(web): wire LoginPage and mount on #app` — LoginPage + test

## Como verificar localmente

```bash
pnpm install
pnpm --filter web test     # 16 *.test.ts passam
pnpm --filter web build    # tsc strict + vite build limpos
pnpm --filter web dev      # http://localhost:5173 mostra a tela de login
```

Manualmente: digitar nos inputs, marcar checkbox, hover no botão verde, clicar nos botões
sociais (GitHub/Gmail), submeter o form (deve logar credenciais no console + `preventDefault`).

## Aprendizados do curso registrados aqui

- Como o CLAUDE.md molda o comportamento do agente (Atomic Design + Conventional Commits viram regras duráveis).
- Como o modo Plan separa "design" de "execução" — todo o diff abaixo é consequência direta de `plans/login-page.md`.
- Como dividir commits semanticamente paga juros: dá para revisar camada por camada e reverter parcialmente se precisar.
- Como o MCP Server do GitHub permite criar repositórios, branches, commits e PRs diretamente do ambiente do Claude Code — sem `gh` CLI ou `git push` local.
```

---

## Conteúdo do README.md (raiz)

```markdown
# code-connect

> Monorepo do curso "Engenharia de Software com IA" — clone simplificado de uma rede social
> de devs, construído como par entre humano e Claude Code.

## Sobre

Projeto educacional. O objetivo é exercitar:
- Fluxo plano-dirigido com Claude Code (`/plan` → revisar → executar → PR).
- Boas práticas de monorepo (pnpm workspaces, zero-hoisting).
- Atomic Design no frontend.
- REST API com NestJS seguindo princípios stateless / recursos-como-substantivos.
- Conventional Commits.

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | Vite + TypeScript (vanilla, sem framework UI) + Tailwind v4 + Vitest + happy-dom |
| Backend  | NestJS 11 + Express + TypeScript + Jest |
| Workspace | pnpm workspaces (zero-hoisting) |
| Convenções | Conventional Commits, Atomic Design, REST |

## Estrutura

```
code-connect/
├── apps/
│   ├── api/          # NestJS REST API (porta 3000)
│   └── web/          # Vite + TypeScript (porta 5173)
│       └── src/
│           └── components/
│               ├── atoms/       # Button, Input, Label, Checkbox, Link, Heading, Divider
│               ├── molecules/   # FormField, RememberRow, SocialButton, SocialLogins, AuthFooterPrompt
│               ├── organisms/   # AuthBanner, LoginForm, PageBackground
│               ├── templates/   # AuthTemplate
│               └── pages/       # LoginPage
└── plans/            # Planos de feature aprovados antes da execução
```

## Comandos

| Comando | O que faz |
|---|---|
| `pnpm dev` | Roda api e web em paralelo (watch mode) |
| `pnpm api:dev` | Só o NestJS em watch mode |
| `pnpm web:dev` | Só o Vite dev server |
| `pnpm web:test` | Vitest (todos os `*.test.ts` do web) |
| `pnpm api:test` | Jest (todos os `*.spec.ts` do api) |
| `pnpm web:build` | `tsc --strict` + build de produção Vite |
| `pnpm api:build` | Compila NestJS para `dist/` |

## Atomic Design no `apps/web`

Componentes seguem 5 camadas:

| Camada | O que é | Exemplo |
|---|---|---|
| **atoms** | Menor unidade indivisível | `Button`, `Input` |
| **molecules** | Composição de atoms | `FormField` (Label + Input) |
| **organisms** | Seções complexas | `LoginForm` (vários FormField + botão) |
| **templates** | Esqueleto de página sem dados reais | `AuthTemplate` (banner slot + form slot) |
| **pages** | Template + dados/estado reais | `LoginPage` |

Padrão de componente: **factory function** `(props) => HTMLElement`.
Por quê: evita `innerHTML` (segurança contra XSS), facilita testes em DOM nodes reais.

Cada componente tem seu `*.test.ts` — nenhum componente está "pronto" sem ele.

## REST no `apps/api`

- URLs identificam **recursos** (`/posts`, `/posts/:id`), nunca ações (`/getPosts`).
- Verbos HTTP carregam a intenção: `GET` (leitura), `POST` (criação), `PATCH` (atualização parcial), `DELETE` (remoção).
- Status codes significativos: `201 Created` + header `Location`, `204 No Content`, `409 Conflict`, `422 Unprocessable Entity`.
- Rotas prefixadas com `/v1/` desde o início.
- Sem estado no servidor — cada request é autocontido.

## Workflow plano-dirigido

1. Descrever a feature ao Claude Code e pedir `/plan`.
2. Revisar e salvar o plano em `plans/<nome-da-feature>.md`.
3. Aprovar o plano e deixar a IA executar numa branch `feat/<nome>`.
4. Abrir PR contra `main` linkando o plano na descrição.

Os planos em `plans/` são a fonte da verdade — o código é consequência deles.

## Como rodar

```bash
git clone https://github.com/GuiMM/aula_claude_code.git
cd aula_claude_code
pnpm install
pnpm dev
# web: http://localhost:5173
# api: http://localhost:3000
```
```

---

## Arquivos críticos (para leitura local antes dos push_files)

| Arquivo local | Para qual commit |
|---|---|
| `CLAUDE.md` | Stage 2 — docs em main |
| `plans/login-page.md` | Stage 2 — docs em main |
| `apps/web/package.json` | Commit 1 |
| `apps/web/tsconfig.json` | Commit 1 |
| `apps/web/vite.config.ts` | Commit 1 |
| `apps/web/src/style.css` | Commit 1 |
| `package.json` | Commit 1 |
| `pnpm-lock.yaml` | Commit 1 |
| `apps/web/index.html` | Commit 2 |
| `apps/web/src/main.ts` | Commit 2 |
| `apps/web/public/banner.png` | Commit 2 (binário) |
| `apps/web/public/github_logo.png` | Commit 2 (binário) |
| `apps/web/public/gmail.png` | Commit 2 (binário) |
| `apps/web/src/components/atoms/**` | Commit 3 (14 arquivos) |
| `apps/web/src/components/molecules/**` | Commit 4 (10 arquivos) |
| `apps/web/src/components/organisms/**` + `templates/**` | Commit 5 (8 arquivos) |
| `apps/web/src/components/pages/**` | Commit 6 (2 arquivos) |

---

## Pontos a confirmar / riscos

1. **Binários PNG (banner.png, github_logo.png, gmail.png):** `push_files` aceita `content` como string. Ler com base64 e tentar passar diretamente. Se falhar, usar `mcp__github__create_or_update_file` individualmente para cada PNG — essa ferramenta usa a Contents API que suporta base64.

2. **`pnpm-lock.yaml`:** arquivo grande; verificar se o MCP não trunca conteúdo. Se necessário, pular o lockfile do push (não é bloqueante para o GitHub, apenas para reproductibilidade local).

3. **Tamanho do push_files:** commits 3 e 4 têm 14 e 10 arquivos respectivamente. Caso o MCP retorne erro de payload, dividir em chamadas menores (ex.: 2 push_files por commit, com a mesma mensagem).

4. **Repo já existente:** se `aula_claude_code` já existir na conta `GuiMM`, `create_repository` retornará erro. Verificar antes com `mcp__github__get_file_contents` ou listar repos. Se existir, pular o Stage 1 e continuar do Stage 2.

---

## Verificação ponta a ponta

Após `mcp__github__create_pull_request` retornar a URL:

1. Abrir a URL do PR no browser.
2. Conferir no GitHub:
   - Repo `aula_claude_code` é público.
   - `main` tem README, CLAUDE.md, plans/ — sem código de componentes.
   - PR `feat/login-page → main` mostra 6 commits em ordem, descrição didática renderizada.
   - Aba "Files changed" mostra apenas arquivos do login (não README/CLAUDE.md/plans).
3. Localmente (opcional):
   - `git remote add origin https://github.com/GuiMM/aula_claude_code.git`
   - `git fetch origin` — confirmar que branches existem no remoto.

Se tudo acima estiver verde, a task está concluída.
