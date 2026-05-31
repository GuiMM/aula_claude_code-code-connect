# Plano — Página "Acervo" (refator do Post Detail) — Figma 155:3195

## Contexto

A `PostDetailPage` atual mostra um post com thumbnail, corpo em markdown e comentários flat. O design do Figma ("CodeConnect – Acervo") restyle essa mesma página como um layout de "acervo de código": card escuro com pré-visualização do código, bloco separado **"Código:"** com o corpo em monoespaçada, e seção de comentários em fundo cinza claro com **respostas aninhadas** ("Responder" / "Ver respostas"). A sidebar também é redesenhada (logo + botão "Publicar" + Feed/Perfil/Sobre nós/Sair com ícones grandes acima do label).

A intenção do trabalho é aproximar a UI atual do design final do Figma, mantendo a mesma rota (`#/posts/:id`) e estendendo o backend para suportar replies de comentário (necessário para a hierarquia visual do design).

### Decisões de escopo (confirmadas)
- **Refatorar a `PostDetailPage` existente** (URL `#/posts/:id` permanece).
- **Estender o backend** com `parentId` no `Comment` + suporte a replies no mesmo endpoint `POST /posts/:id/comments` (campo opcional `parentCommentId` no body).
- **Atualizar a Sidebar** para combinar com o Figma; itens novos (Publicar, Perfil, Sobre nós) apontam para uma página placeholder "Em construção".

### Fora do escopo (recomendado adiar)
- **Tags do post**: o design mostra tags ("React" repetido 4×) mas o modelo `Post` não tem `tags`, e o usuário não pediu explicitamente. Recomendo deixar para um próximo PR (requer coluna + DTO + UI de edição).
- **Mais de 1 nível de aninhamento na UI**: o backend já suporta N níveis via `parentId`, mas a UI renderizará só 1 nível (igual ao Figma). Replies de replies viram irmãs visualmente.

---

## Mudanças

### Backend — `apps/api`

**[apps/api/src/posts/entities/comment.entity.ts](apps/api/src/posts/entities/comment.entity.ts)** — adicionar self-reference:
- Nova coluna `parentId: string | null` (`@Column({ nullable: true })`).
- Relação `@ManyToOne(() => Comment, c => c.replies, { onDelete: 'CASCADE', nullable: true })` `parent`.
- Relação inversa `@OneToMany(() => Comment, c => c.parent)` `replies`.
- Como `synchronize: true` está ligado (ver [apps/api/src/app.module.ts](apps/api/src/app.module.ts)), a coluna é adicionada automaticamente no próximo start; sem migration.

**[apps/api/src/posts/dto/create-comment.dto.ts](apps/api/src/posts/dto/create-comment.dto.ts)** — adicionar campo opcional:
- `@IsOptional() @IsUUID() parentCommentId?: string;`

**[apps/api/src/posts/dto/post-response.dto.ts](apps/api/src/posts/dto/post-response.dto.ts)** — `CommentResponseDto` ganha:
- `parentId: string | null;`

**[apps/api/src/posts/posts.service.ts](apps/api/src/posts/posts.service.ts#L148)** — `createComment`:
- Se `dto.parentCommentId` vier: buscar o parent (`commentsRepo.findOne({ where: { id: parentCommentId } })`), garantir que existe e que `parent.postId === postId`; caso contrário lançar `BadRequestException('Resposta inválida')`.
- Persistir `parentId` no novo comentário.
- Retornar com `parentId` populado.

**[apps/api/src/posts/posts.service.ts](apps/api/src/posts/posts.service.ts#L129)** — `getComments`:
- Continuar retornando lista flat ordenada por `createdAt DESC`, mas incluir `parentId` em cada item. (A árvore é montada no front; mais simples e flexível do que devolver JSON aninhado.)

**[apps/api/src/posts/posts.controller.ts](apps/api/src/posts/posts.controller.ts#L121)** — sem mudança estrutural; o `CreateCommentDto` agora aceita `parentCommentId` no body.

### Frontend — `apps/web`

**Serviços**

**[apps/web/src/services/posts.ts](apps/web/src/services/posts.ts)**:
- Interface `PostComment`: adicionar `parentId: string | null`.
- `createComment(postId, content, parentCommentId?)`: aceitar 3º parâmetro opcional, enviar como `{ content, parentCommentId }`.

**Sidebar (reescrita visual)**

**[apps/web/src/components/organisms/Sidebar/Sidebar.ts](apps/web/src/components/organisms/Sidebar/Sidebar.ts)** — reescrever:
- Container: `w-44` (~177 px), `bg-bg-card`, `rounded-lg`, `flex flex-col items-center gap-20 px-4 py-10`.
- Topo: logo CodeConnect (Icon `code` verde + texto "code/connect"; usar `Icon` existente).
- Botão "Publicar": `border border-brand-green text-brand-green rounded-lg py-3 px-4 w-full text-center`, leva para `#/publicar`.
- Itens de nav (Feed, Perfil, Sobre nós, Sair) — cada item: `flex flex-col items-center gap-2 text-text-muted`, com Icon (32 px) em cima + label embaixo. Item ativo: `text-white`.
- Hrefs: `#/feed`, `#/perfil`, `#/sobre`; "Sair" continua sendo botão que chama `logout()` e vai para `#/login`.
- Reaproveitar [Icon](apps/web/src/components/atoms/Icon/Icon.ts) e [Link](apps/web/src/components/atoms/Link/Link.ts).

**[apps/web/src/components/organisms/Sidebar/Sidebar.test.ts](apps/web/src/components/organisms/Sidebar/Sidebar.test.ts)** — atualizar para cobrir: logo presente, botão Publicar, 4 itens de nav, Sair chama `logout()` quando autenticado.

**PostDetail (refator pesado)**

**[apps/web/src/components/organisms/PostDetail/PostDetail.ts](apps/web/src/components/organisms/PostDetail/PostDetail.ts)** — substituir a estrutura por:
1. **Card publicação** (`rounded-lg overflow-hidden`):
   - Header `bg-[#848484] px-4 py-6 flex justify-center`: se `post.thumbnailUrl` existir, mostrar com `object-cover`; senão, mostrar um bloco "preview de código" estilizado (`bg-bg-card` com primeiras ~10 linhas de `post.content` em `font-mono text-xs text-text-secondary`).
   - Footer `bg-bg-card p-4 flex flex-col gap-4`:
     - `<h2>` título (`text-xl font-semibold text-white`).
     - `<p>` descrição (`text-sm text-text-muted`).
     - Linha de ações: `<div class="flex items-center justify-between">`. Esquerda: 3 ícones (`code`, `share`, `chat`) com contagem abaixo — reaproveitar [LikeButton](apps/web/src/components/molecules/LikeButton/LikeButton.ts) só para o like real (substituir o "code" se conveniente) ou criar uma molécula leve `ActionIcon` interna. Direita: avatar do autor + `@${author.name}`.
2. **Card "Código:"**:
   - Label `<p>Código:</p>` em cima (`text-text-muted text-lg font-semibold`).
   - Container `bg-bg-card rounded-lg p-4 shadow-lg`: `<pre><code>` com `font-mono text-sm text-text-secondary whitespace-pre-wrap` contendo `post.content` cru (sem parse markdown).
3. **Seção Comentários** (`bg-text-muted/bg-[#888] rounded-lg p-8`):
   - Título `<h2>Comentários</h2>` (`text-bg-card text-xl font-semibold`).
   - `<CommentList comments={...} onReply={...} />` (nova organism — abaixo).
   - `<CommentForm onSubmit={createTopLevelComment} />` reutilizado.

Remover o helper inline `renderMarkdown` (vira monoespaçada cru no bloco código).

**[apps/web/src/components/organisms/PostDetail/PostDetail.test.ts](apps/web/src/components/organisms/PostDetail/PostDetail.test.ts)** (criar — não existe hoje, e CLAUDE.md exige): cobrir título/descrição renderizados, autor renderizado, bloco Código com `post.content` cru, e que comentários top-level são exibidos.

**CommentList + CommentItem (novos)**

**[apps/web/src/components/organisms/CommentList/CommentList.ts](apps/web/src/components/organisms/CommentList/CommentList.ts)** (novo):
- Recebe `{ comments: PostComment[]; onReply: (parentId, content) => Promise<PostComment> }`.
- Agrupa lista flat em mapa `parentId → replies`; renderiza só os top-level (`parentId === null`); cada um vira `CommentItem` que recebe seus `replies` correspondentes.

**[apps/web/src/components/organisms/CommentList/CommentList.test.ts](apps/web/src/components/organisms/CommentList/CommentList.test.ts)** (novo).

**[apps/web/src/components/molecules/CommentItem/CommentItem.ts](apps/web/src/components/molecules/CommentItem/CommentItem.ts)** (novo):
- Recebe `{ comment, replies, onReply }`.
- Renderiza: Avatar (sm) + `@${author.name}` + texto inline.
- Abaixo: link "Responder" (toggle do formulário inline).
- Se há replies: toggle "Ver respostas" / "Ocultar respostas" (com linha decorativa antes do label) que mostra/esconde container `pl-10` contendo cada reply.
- Replies renderizadas no mesmo layout, mas SEM "Responder" próprio (UI 1 nível só — Figma).
- Cores conforme Figma: texto `text-bg-card` (escuro sobre fundo claro da seção).

**[apps/web/src/components/molecules/CommentItem/CommentItem.test.ts](apps/web/src/components/molecules/CommentItem/CommentItem.test.ts)** (novo): cobrir render do conteúdo, toggle de respostas, e que `onReply` é chamado ao submeter.

**Página placeholder**

**[apps/web/src/components/pages/ComingSoonPage/ComingSoonPage.ts](apps/web/src/components/pages/ComingSoonPage/ComingSoonPage.ts)** (novo): retorna um `FeedTemplate` com `<h1>Em construção</h1>` no `main`. Aceita prop `title?: string` para exibir "Publicar", "Perfil" ou "Sobre nós".

**[apps/web/src/components/pages/ComingSoonPage/ComingSoonPage.test.ts](apps/web/src/components/pages/ComingSoonPage/ComingSoonPage.test.ts)** (novo).

**Roteador**

**[apps/web/src/main.ts](apps/web/src/main.ts)** — adicionar rotas:
- `#/publicar` → `ComingSoonPage({ title: 'Publicar' })`
- `#/perfil` → `ComingSoonPage({ title: 'Perfil' })`
- `#/sobre` → `ComingSoonPage({ title: 'Sobre nós' })`

**Tokens / fontes**

**[apps/web/src/style.css](apps/web/src/style.css)** — ajustar tokens para bater com Figma e adicionar 2 novos:
- `--color-brand-green: #81FE88` (era `#62F277`)
- `--color-bg-card: #171D1F` (era `#17181E` — praticamente igual, mas exato)
- `--color-text-muted: #888888` (era `#A0A3B1`)
- `--color-text-secondary: #BCBCBC` (novo — texto do código)
- `--color-bg-section: #888888` (novo — fundo da seção Comentários)

**[apps/web/index.html](apps/web/index.html#L11)** — adicionar import de Roboto Mono (para o bloco "Código:"):
```html
<link href="https://fonts.googleapis.com/css2?family=Prompt:wght@400;600&family=Roboto+Mono:wght@400&display=swap" rel="stylesheet" />
```

### Componentes/helpers reaproveitados (não modificar)
- [Avatar](apps/web/src/components/atoms/Avatar/Avatar.ts)
- [Icon](apps/web/src/components/atoms/Icon/Icon.ts)
- [Link](apps/web/src/components/atoms/Link/Link.ts)
- [CommentForm](apps/web/src/components/molecules/CommentForm/CommentForm.ts)
- [LikeButton](apps/web/src/components/molecules/LikeButton/LikeButton.ts)
- [FeedTemplate](apps/web/src/components/templates/FeedTemplate/FeedTemplate.ts)

---

## Verificação

1. **API tests** — `pnpm api:test` na raiz. Cobertura mínima: `createComment` rejeita `parentCommentId` de outro post; `getComments` retorna `parentId` em cada item.
2. **Web tests** — `pnpm --filter web test`. Todos os componentes novos com testes verdes; testes existentes ajustados.
3. **End-to-end manual** (`pnpm dev` da raiz):
   - Logar.
   - Abrir um post (`#/posts/<id>`).
   - Conferir contra screenshot do Figma:
     - Sidebar com logo, botão "Publicar" verde com borda, 4 itens com ícone grande acima do label.
     - Card publicação com header cinza + footer escuro com título/descrição/ações + autor à direita.
     - Bloco "Código:" separado com `post.content` em monoespaçada.
     - Seção Comentários em fundo cinza claro com texto escuro.
   - Clicar "Responder" num comentário → formulário inline aparece → submeter → reply aparece aninhada e contador local reflete; recarregar para confirmar persistência.
   - Clicar "Ver respostas" / "Ocultar respostas" → toggle funciona.
   - Clicar Publicar / Perfil / Sobre nós → navega para placeholder.
   - Clicar Sair → desloga e volta para login.
