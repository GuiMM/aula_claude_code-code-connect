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
| `pnpm api:seed` | Popula o banco com usuários, posts e comentários de exemplo |

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
