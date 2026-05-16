# Plano: Feed de Posts (Figma node 155:3099)

## Contexto

O CodeConnect precisa de sua funcionalidade central: um feed de posts de código. Hoje a aplicação tem apenas páginas de autenticação; o `HomePage` é um stub com "Hello, {nome}!" e um botão de logout. A URL Figma referenciada (`node-id=155-3099`) mostra a tela de feed com sidebar lateral, cards de post com thumbnail, título, autor, data, contadores de likes/comentários e um campo de busca full-text.

**Regras de negócio:**
- Qualquer visitante (não logado) pode ver o feed e os detalhes de um post.
- Apenas usuários logados podem criar posts, curtir e comentar.
- O link no menu lateral alterna entre "Login" e "Sair" conforme o estado de autenticação.
- A busca full-text é processada no backend (PostgreSQL).
- Quando um post não tem thumbnail, exibe um placeholder visual.
- Feed e detalhes do post compartilham elementos de layout via um `FeedTemplate`.

---

## Parte 1 — Backend (`apps/api`)

### 1.1 Configurar TypeORM CLI para migrations

O projeto usa `synchronize: true` em dev. Para este feature, como há relações entre entidades, vamos manter `synchronize: true` em dev e preparar a infra de migrations para futuro deploy.

**Alterar** `apps/api/src/app.module.ts`:
- Adicionar `entities` explicitamente: `[User, Post, Comment, Like]`

**Adicionar** scripts em `apps/api/package.json`:
```json
"migration:generate": "typeorm-ts-node-commonjs migration:generate -d src/data-source.ts",
"migration:run":      "typeorm-ts-node-commonjs migration:run -d src/data-source.ts",
"migration:revert":   "typeorm-ts-node-commonjs migration:revert -d src/data-source.ts",
"seed":              "ts-node src/seeders/seed.ts"
```

**Criar** `apps/api/src/data-source.ts` (DataSource standalone para CLI).

### 1.2 Entidades

#### `apps/api/src/posts/entities/post.entity.ts`
```
id          UUID PK
title       varchar(255)  NOT NULL
description text          NOT NULL
content     text          NOT NULL
thumbnailUrl varchar(500) NULLABLE
userId      UUID FK → users.id  ON DELETE CASCADE
createdAt   timestamp DEFAULT NOW()
updatedAt   timestamp DEFAULT NOW() ON UPDATE
```
Relações:
- `@ManyToOne(() => User)` → `author`
- `@OneToMany(() => Comment)` → `comments`
- `@OneToMany(() => Like)` → `likes`

#### `apps/api/src/posts/entities/comment.entity.ts`
```
id        UUID PK
content   text NOT NULL
postId    UUID FK → posts.id  ON DELETE CASCADE
userId    UUID FK → users.id  ON DELETE CASCADE
createdAt timestamp DEFAULT NOW()
```

#### `apps/api/src/posts/entities/like.entity.ts`
```
id      UUID PK
postId  UUID FK → posts.id  ON DELETE CASCADE
userId  UUID FK → users.id  ON DELETE CASCADE
UNIQUE(postId, userId)
```

### 1.3 DTOs

`apps/api/src/posts/dto/`:
- `create-post.dto.ts` — `title`, `description`, `content`, `thumbnailUrl?` (IsString, IsOptional, IsUrl)
- `create-comment.dto.ts` — `content` (IsString, MinLength 1)
- `posts-query.dto.ts` — `q?` (IsOptional, IsString), `page?` (IsInt, default 1), `limit?` (IsInt, default 10, Max 50)

### 1.4 PostsModule — rotas

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET    | `/v1/posts` | público | Lista com paginação e full-text search |
| POST   | `/v1/posts` | obrigatório | Cria post |
| GET    | `/v1/posts/:id` | público | Detalhe do post |
| PATCH  | `/v1/posts/:id` | obrigatório (dono) | Atualiza post |
| DELETE | `/v1/posts/:id` | obrigatório (dono) | Remove post |
| POST   | `/v1/posts/:id/likes` | obrigatório | Like no post |
| DELETE | `/v1/posts/:id/likes` | obrigatório | Unlike |
| GET    | `/v1/posts/:id/comments` | público | Lista comentários |
| POST   | `/v1/posts/:id/comments` | obrigatório | Comenta no post |

**Full-text search** (`GET /v1/posts?q=termo`):
```typescript
// No PostsService
qb.where(
  "to_tsvector('portuguese', post.title || ' ' || post.description) @@ plainto_tsquery('portuguese', :q)",
  { q }
)
```

**Optional auth guard** — criar `apps/api/src/auth/guards/optional-jwt-auth.guard.ts`:
```typescript
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user) { return user || null; }
}
```
Usar nas rotas públicas que precisam identificar o usuário (ex: GET /posts para saber se já curtiu).

**Response shape de post:**
```typescript
{
  id, title, description, content, thumbnailUrl,
  author: { id, name },
  likesCount, commentsCount,
  likedByMe: boolean,  // null se não autenticado
  createdAt
}
```

### 1.5 Seed

**Criar** `apps/api/src/seeders/seed.ts`:
- Conecta ao DB via DataSource
- Cria 3 usuários de exemplo (se não existirem)
- Gera 20 posts mockados com:
  - 14 com thumbnailUrl (URLs de imagens placeholder estáticas)
  - 6 sem thumbnailUrl (para testar placeholder no frontend)
  - Distribuídos entre os 3 autores
  - Alguns com likes e comentários

Usar `faker` ou array fixo de dados — dado que é curso, array fixo é mais legível.

### 1.6 Arquivos a criar/modificar no backend

| Ação | Arquivo |
|------|---------|
| Criar | `apps/api/src/posts/post.module.ts` |
| Criar | `apps/api/src/posts/posts.controller.ts` |
| Criar | `apps/api/src/posts/posts.service.ts` |
| Criar | `apps/api/src/posts/entities/post.entity.ts` |
| Criar | `apps/api/src/posts/entities/comment.entity.ts` |
| Criar | `apps/api/src/posts/entities/like.entity.ts` |
| Criar | `apps/api/src/posts/dto/create-post.dto.ts` |
| Criar | `apps/api/src/posts/dto/create-comment.dto.ts` |
| Criar | `apps/api/src/posts/dto/posts-query.dto.ts` |
| Criar | `apps/api/src/auth/guards/optional-jwt-auth.guard.ts` |
| Criar | `apps/api/src/data-source.ts` |
| Criar | `apps/api/src/seeders/seed.ts` |
| Modificar | `apps/api/src/app.module.ts` (registrar PostsModule + entidades) |
| Modificar | `apps/api/package.json` (scripts de migration + seed) |

---

## Parte 2 — Frontend (`apps/web`)

### 2.1 Novos componentes (Atomic Design)

#### Atoms
- **`PostThumbnail`** — `<img>` com `onerror` substituindo por placeholder (div com ícone de código + bg cinza escuro). Props: `src?: string`, `alt: string`.
- **`Avatar`** — Círculo com iniciais do nome do usuário. Props: `name: string`, `size?: 'sm'|'md'`.
- **`Badge`** — Pill com texto. Props: `label: string` (reusar ou criar — verificar se já existe como `Label`).

#### Molecules
- **`PostCard`** — Card de post para o feed. Usa `PostThumbnail`, `Avatar`, `Link`. Props: `post: PostSummary`. Ao clicar navega para `#/posts/:id`.
- **`SearchInput`** — Campo de busca com debounce. Reutiliza `Input` atom. Props: `onSearch: (q: string) => void`, `placeholder?: string`.
- **`LikeButton`** — Botão de curtir com contagem. Props: `count: number`, `liked: boolean`, `disabled: boolean`, `onClick: () => void`.
- **`CommentForm`** — Textarea + botão submit. Props: `onSubmit: (content: string) => void`, `disabled: boolean`.

#### Organisms
- **`Sidebar`** — Menu lateral com logo CodeConnect, links de navegação, e link dinâmico Login/Sair. Props: `isAuthenticated: boolean`. O toggle "Login/Sair" usa `getToken()` para determinar estado.
- **`PostFeed`** — SearchInput no topo + lista de PostCards + paginação simples. Props: `posts: PostSummary[]`, `onSearch: (q: string) => void`, `onLoadMore: () => void`.
- **`PostDetail`** — Detalhes completos do post: thumbnail grande, conteúdo, LikeButton, lista de comentários, CommentForm (desabilitado se não logado).

#### Templates
- **`FeedTemplate`** — Layout com sidebar esquerda (240px) + área de conteúdo principal. Props: `children: HTMLElement`, `isAuthenticated: boolean`. Reutilizado tanto no FeedPage quanto no PostDetailPage.

#### Pages
- **`FeedPage`** — FeedTemplate + PostFeed. Chama `GET /v1/posts` com debounce na busca.
- **`PostDetailPage`** — FeedTemplate + PostDetail. Chama `GET /v1/posts/:id` e `GET /v1/posts/:id/comments`.

### 2.2 Serviço de API

**Criar** `apps/web/src/services/posts.ts`:
```typescript
getPosts(params: { q?: string; page?: number; limit?: number })
getPost(id: string)
createPost(data: CreatePostData)
likePost(id: string)
unlikePost(id: string)
getComments(postId: string)
createComment(postId: string, content: string)
```

### 2.3 Routing

**Modificar** `apps/web/src/main.ts`:
- Adicionar rotas: `#/feed` (FeedPage), `#/posts/:id` (PostDetailPage)
- Rota padrão para visitantes não autenticados: redirecionar para `#/feed` (não para `#/login`)
- Rota `#/home` mantida para usuários logados (ou redirecionar para `#/feed` também)
- Extrair `:id` do hash para rotas com parâmetros: `window.location.hash.split('/')[2]`

### 2.4 Sidebar — toggle Login/Sair

```typescript
// Dentro de Sidebar.ts
const isLoggedIn = !!getToken();
const authLink = isLoggedIn
  ? Link({ label: 'Sair', href: '#', onClick: () => { logout(); renderPage(); } })
  : Link({ label: 'Login', href: '#/login' });
```

### 2.5 Placeholder de thumbnail

```typescript
// PostThumbnail.ts
const img = document.createElement('img');
img.src = src || '';
img.onerror = () => {
  img.replaceWith(createPlaceholder()); // div com ícone + bg-bg-card
};
if (!src) img.dispatchEvent(new Event('error'));
```

### 2.6 Arquivos a criar/modificar no frontend

| Ação | Arquivo |
|------|---------|
| Criar | `apps/web/src/components/atoms/PostThumbnail/PostThumbnail.ts` + `.test.ts` |
| Criar | `apps/web/src/components/atoms/Avatar/Avatar.ts` + `.test.ts` |
| Criar | `apps/web/src/components/molecules/PostCard/PostCard.ts` + `.test.ts` |
| Criar | `apps/web/src/components/molecules/SearchInput/SearchInput.ts` + `.test.ts` |
| Criar | `apps/web/src/components/molecules/LikeButton/LikeButton.ts` + `.test.ts` |
| Criar | `apps/web/src/components/molecules/CommentForm/CommentForm.ts` + `.test.ts` |
| Criar | `apps/web/src/components/organisms/Sidebar/Sidebar.ts` + `.test.ts` |
| Criar | `apps/web/src/components/organisms/PostFeed/PostFeed.ts` + `.test.ts` |
| Criar | `apps/web/src/components/organisms/PostDetail/PostDetail.ts` + `.test.ts` |
| Criar | `apps/web/src/components/templates/FeedTemplate/FeedTemplate.ts` + `.test.ts` |
| Criar | `apps/web/src/components/pages/FeedPage/FeedPage.ts` + `.test.ts` |
| Criar | `apps/web/src/components/pages/PostDetailPage/PostDetailPage.ts` + `.test.ts` |
| Criar | `apps/web/src/services/posts.ts` |
| Modificar | `apps/web/src/main.ts` (novas rotas, redirect padrão para feed) |

---

## Parte 3 — Design (Figma node 155:3099)

Layout inferido do Figma e requisitos do usuário:
- **Sidebar** (esquerda, fixo): logo CodeConnect, links de navegação, link Login/Sair no rodapé.
- **Header da área principal**: título "Feed" + SearchInput à direita.
- **Grid de posts**: cards com thumbnail (16:9), título, avatar do autor + nome, data relativa, ícone de coração + contagem, ícone de comentário + contagem.
- **Cores**: seguir tokens existentes (`bg-bg-page`, `bg-bg-card`, `text-text-muted`, `brand-green`).
- **Placeholder**: div de mesma proporção do thumbnail com ícone `</>` centralizado e cor `bg-bg-card`.

---

## Parte 4 — Ordem de implementação

1. **Backend entidades + módulo** (sem migrations, `synchronize: true` cuida do schema em dev)
2. **Seed** (dados mockados para testar o frontend imediatamente)
3. **Frontend: atoms novos** (PostThumbnail, Avatar)
4. **Frontend: molecules** (PostCard, SearchInput, LikeButton, CommentForm)
5. **Frontend: Sidebar organism + FeedTemplate**
6. **Frontend: PostFeed organism + FeedPage**
7. **Frontend: PostDetail organism + PostDetailPage**
8. **Frontend: routing + redirect padrão**
9. **Testes** para todos os novos componentes

---

## Verificação

```bash
# 1. Subir banco
docker compose up -d

# 2. Rodar seed
cd apps/api && pnpm seed

# 3. Testar API
curl http://localhost:3000/v1/posts
curl "http://localhost:3000/v1/posts?q=typescript"
curl http://localhost:3000/v1/posts/[id]

# 4. Frontend
pnpm dev
# Abrir http://localhost:5173
# - Sem login: ver feed, não conseguir curtir/comentar
# - Com login: conseguir curtir e comentar
# - Busca com debounce filtra posts no backend
# - Posts sem thumbnailUrl mostram placeholder

# 5. Testes
pnpm api:test
cd apps/web && pnpm test
```
