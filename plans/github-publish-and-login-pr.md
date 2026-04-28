# Plano — Publicar `aula_claude_code` no GitHub via MCP + abrir PR da Login Page

## Contexto

O repositório `code-connect` é um monorepo pnpm criado durante o curso de engenharia de software com IA (Claude Code). Hoje ele existe **apenas localmente**, com 1 commit inicial e várias mudanças não commitadas que **já implementam por inteiro** o plano em [login-page.md](./login-page.md).

**Objetivo desta task:**

1. Publicar o repo no GitHub do usuário (`GuiMM`) como `aula_claude_code`, **público**.
2. Estruturar o histórico em duas etapas:
   - `main` recebe o commit inicial existente + um commit de docs (README + CLAUDE.md + plans/).
   - Branch `feat/login-page` traz a implementação dividida em ~6 commits semânticos seguindo Conventional Commits.
3. Abrir um PR `feat/login-page → main` com descrição **didática** que conta a história "plano → execução".
4. Criar um `README.md` na raiz que documenta a base arquitetural do projeto.

**Como o MCP substitui o `gh` CLI:**

Todas as operações com o GitHub são feitas via **MCP Server do GitHub** já configurado no ambiente.

| Ferramenta MCP | Substitui |
|---|---|
| `mcp__github__get_me` | `gh auth status` |
| `mcp__github__create_repository` | `gh repo create` |
| `mcp__github__push_files` | `git push` (múltiplos arquivos em 1 commit) |
| `mcp__github__create_branch` | `git checkout -b` + `git push` |
| `mcp__github__create_pull_request` | `gh pr create` |

**Importante:** O working directory local permanece **inalterado** — nenhum `git commit` ou `git push` local é necessário.
