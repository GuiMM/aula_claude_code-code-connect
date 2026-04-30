# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`code-connect` is a pnpm monorepo with two applications:
- `apps/api` — NestJS 11 REST API (TypeScript, Express, port 3000)
- `apps/web` — Vite + TypeScript frontend (vanilla TS, no framework yet)

## Commands

### From repo root

```bash
pnpm dev              # Run api and web in parallel (watch mode)
pnpm api:dev          # Start NestJS in watch mode only
pnpm web:dev          # Start Vite dev server only
pnpm api:build        # Compile NestJS to dist/
pnpm web:build        # TypeScript check + Vite production build
pnpm api:test         # Run API Jest tests
```

### From apps/api

```bash
pnpm lint             # ESLint --fix + TypeScript checking
pnpm format           # Prettier format
pnpm test             # Jest unit tests (*.spec.ts)
pnpm test:watch       # Jest watch mode
pnpm test:cov         # Coverage report
pnpm test:e2e         # E2E tests (config: test/jest-e2e.json)
```

## Architecture

### API (apps/api)

Standard NestJS modular structure. `AppModule` is the root; new features should be added as their own modules under `src/`. Entry point is `src/main.ts`. Tests live alongside source files as `*.spec.ts`; E2E tests are in `test/`.

### Web (apps/web)

Vanilla TypeScript with Vite. Entry: `index.html` → `src/main.ts`. No framework is installed yet — keep new code as plain TypeScript modules unless a framework is explicitly added.

**Component structure — Atomic Design:**

```
src/components/
  atoms/        # Smallest indivisible UI elements (Button, Input, Badge…)
  molecules/    # Composed of atoms (SearchField, CardHeader…)
  organisms/    # Complex sections composed of molecules/atoms (Navbar, PostCard…)
  templates/    # Page-level layout skeletons (no real data)
  pages/        # Templates wired to real data/state
```

Each component lives in its own folder alongside its test file:
```
atoms/Button/
  Button.ts
  Button.test.ts
```

**Styling:** Tailwind CSS. Use utility classes directly; avoid writing custom CSS unless Tailwind cannot cover the case.

**Font sizes:** Always use the closest standard Tailwind token — never use arbitrary values like `text-[18px]`.

| Token | Size | Use for |
|-------|------|---------|
| `text-sm` | 14px | Secondary labels, checkbox labels, input text |
| `text-base` | 16px | Body text |
| `text-lg` | 18px | Subtitles, footer prompts, material icons |
| `text-2xl` | 24px | Form subtitles |
| `text-3xl` | 30px | Page headings (h1) |

Line-height: use `leading-normal` (1.5) instead of `leading-[1.5]`.

**Color palette:** All project colors are defined as CSS custom properties inside the `@theme` block in `apps/web/src/style.css`. Never use raw hex values or built-in Tailwind color names (e.g. `text-white`) directly in components — always reference a semantic token.

| Token | Hex | Use for |
|-------|-----|---------|
| `bg-page` | `#00090E` | Page background |
| `bg-card` | `#171D1F` | Card/panel background |
| `bg-input` | `#888888` | Input field background |
| `text-primary` | `#E1E1E1` | Main body text |
| `text-emphasis` | `#FFFFFF` | High-emphasis text (labels, hover states) |
| `text-muted` | `#888888` | Secondary/dim text |
| `text-on-input` | `#00090E` | Text typed inside an input |
| `text-on-primary` | `#132E35` | Text on the brand-green button |
| `brand-green` | `#81FE88` | Primary action color |
| `border-subtle` | `#888888` | Subtle borders and dividers |

To add a new color: define it in `@theme` first (`--color-<name>: #hex`), then use it as `bg-<name>`, `text-<name>`, etc.

**Testing:** Every component must have a test file (`*.test.ts`) covering its essential use — render with default props, key interactions, and any important conditional rendering. No component is considered done without its test.

### API (REST principles)

- **Resources as nouns:** URLs identify resources (`/posts`, `/posts/:id`), never actions (`/getPosts`).
- **HTTP verbs carry intent:** `GET` (read), `POST` (create), `PUT/PATCH` (update), `DELETE` (remove). Use `PATCH` for partial updates.
- **Status codes are meaningful:** `200 OK`, `201 Created` (with `Location` header), `204 No Content`, `400 Bad Request`, `404 Not Found`, `409 Conflict`, `422 Unprocessable Entity`.
- **Stateless:** no session state on the server; every request is self-contained.
- **Consistent response shape:** successful collections return arrays at a known key; errors always return `{ statusCode, message, error }`.
- **Versioning:** prefix routes with `/v1/` from the start.

### Monorepo

pnpm workspaces with zero-hoisting. Each app manages its own dependencies. Use `pnpm --filter api <cmd>` or `pnpm --filter web <cmd>` to target a specific workspace from the root.

## Git — Conventional Commits

All commits in both `apps/api` and `apps/web` must follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(optional scope): <short description>

[optional body]
[optional footer]
```

| Type | When to use |
|------|-------------|
| `feature` | New feature |
| `fix` | Bug fix |
| `refactor` | Code change that is neither a fix nor a feature |
| `test` | Adding or updating tests |
| `style` | Formatting, Tailwind class reordering (no logic change) |
| `chore` | Tooling, deps, config |
| `docs` | Documentation only |
| `perf` | Performance improvement |

Scope examples: `api`, `web`, `auth`, `posts`, `button`, `navbar`.

Breaking changes: append `!` after the type/scope (`feat(api)!:`) and add `BREAKING CHANGE:` in the footer.
