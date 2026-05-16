import { Avatar } from '../../atoms/Avatar/Avatar'
import { PostThumbnail } from '../../atoms/PostThumbnail/PostThumbnail'
import { CommentForm } from '../../molecules/CommentForm/CommentForm'
import { LikeButton } from '../../molecules/LikeButton/LikeButton'
import {
  type PostDetail as PostDetailData,
  type PostComment,
  likePost,
  unlikePost,
  getComments,
  createComment,
} from '../../../services/posts'
import { getToken } from '../../../services/tokenStorage'
import { Icon } from '../../atoms/Icon/Icon'

export interface PostDetailProps {
  post: PostDetailData
  initialComments?: PostComment[]
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function renderCommentItem(comment: PostComment): HTMLElement {
  const item = document.createElement('div')
  item.className = 'flex gap-3 py-3 border-b border-border-subtle last:border-0'

  item.appendChild(Avatar({ name: comment.author.name, size: 'sm' }))

  const content = document.createElement('div')
  content.className = 'flex flex-col gap-0.5 min-w-0'

  const header = document.createElement('div')
  header.className = 'flex items-baseline gap-2'

  const name = document.createElement('span')
  name.className = 'text-sm font-medium text-white'
  name.textContent = comment.author.name
  header.appendChild(name)

  const date = document.createElement('span')
  date.className = 'text-xs text-text-muted'
  date.textContent = formatDate(comment.createdAt)
  header.appendChild(date)

  const text = document.createElement('p')
  text.className = 'text-sm text-text-muted leading-relaxed'
  text.textContent = comment.content

  content.append(header, text)
  item.appendChild(content)
  return item
}

export function PostDetail({ post, initialComments = [] }: PostDetailProps): HTMLElement {
  const isLoggedIn = !!getToken()

  const wrapper = document.createElement('div')
  wrapper.className = 'flex flex-col gap-6 max-w-3xl mx-auto'

  const backBtn = document.createElement('button')
  backBtn.type = 'button'
  backBtn.className =
    'self-start flex items-center gap-1 text-sm text-text-muted hover:text-white transition-colors cursor-pointer'
  backBtn.appendChild(Object.assign(document.createElementNS('http://www.w3.org/2000/svg', 'svg'), {
    innerHTML: '<path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>',
  }))
  const backBtnIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  backBtnIcon.setAttribute('viewBox', '0 0 24 24')
  backBtnIcon.setAttribute('fill', 'currentColor')
  backBtnIcon.setAttribute('class', 'w-4 h-4')
  const backPath = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  backPath.setAttribute('d', 'M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z')
  backBtnIcon.appendChild(backPath)

  backBtn.innerHTML = ''
  backBtn.appendChild(backBtnIcon)
  const backLabel = document.createElement('span')
  backLabel.textContent = 'Voltar ao feed'
  backBtn.appendChild(backLabel)
  backBtn.addEventListener('click', () => history.back())
  wrapper.appendChild(backBtn)

  wrapper.appendChild(PostThumbnail({ src: post.thumbnailUrl, alt: post.title }))

  const meta = document.createElement('div')
  meta.className = 'flex items-center gap-3'
  meta.appendChild(Avatar({ name: post.author.name, size: 'md' }))

  const authorInfo = document.createElement('div')
  authorInfo.className = 'flex flex-col'
  const authorName = document.createElement('span')
  authorName.className = 'text-sm font-medium text-white'
  authorName.textContent = post.author.name
  const postDate = document.createElement('span')
  postDate.className = 'text-xs text-text-muted'
  postDate.textContent = formatDate(post.createdAt)
  authorInfo.append(authorName, postDate)
  meta.appendChild(authorInfo)
  wrapper.appendChild(meta)

  const title = document.createElement('h1')
  title.className = 'text-2xl font-bold text-white leading-snug'
  title.textContent = post.title
  wrapper.appendChild(title)

  const desc = document.createElement('p')
  desc.className = 'text-text-muted leading-relaxed'
  desc.textContent = post.description
  wrapper.appendChild(desc)

  const divider = document.createElement('hr')
  divider.className = 'border-border-subtle'
  wrapper.appendChild(divider)

  const contentEl = document.createElement('div')
  contentEl.className = 'prose prose-invert prose-sm max-w-none text-text-muted'
  contentEl.innerHTML = renderMarkdown(post.content)
  wrapper.appendChild(contentEl)

  const divider2 = document.createElement('hr')
  divider2.className = 'border-border-subtle'
  wrapper.appendChild(divider2)

  let likedState = !!post.likedByMe
  let likeCountState = post.likesCount

  const likeContainer = document.createElement('div')

  function renderLike() {
    likeContainer.replaceChildren(
      LikeButton({
        count: likeCountState,
        liked: likedState,
        disabled: !isLoggedIn,
        onClick: isLoggedIn
          ? async () => {
              try {
                if (likedState) {
                  await unlikePost(post.id)
                  likedState = false
                  likeCountState--
                } else {
                  await likePost(post.id)
                  likedState = true
                  likeCountState++
                }
                renderLike()
              } catch {
                /* noop */
              }
            }
          : undefined,
      }),
    )
  }
  renderLike()
  wrapper.appendChild(likeContainer)

  const commentsSection = document.createElement('section')
  commentsSection.className = 'flex flex-col gap-4'

  const commentsTitle = document.createElement('h2')
  commentsTitle.className = 'text-base font-semibold text-white flex items-center gap-2'
  commentsTitle.appendChild(Icon({ name: 'comment', className: 'w-4 h-4' }))
  const commentsLabel = document.createElement('span')
  commentsLabel.textContent = 'Comentários'
  commentsTitle.appendChild(commentsLabel)
  commentsSection.appendChild(commentsTitle)

  const commentsList = document.createElement('div')
  commentsList.className = 'flex flex-col'
  commentsList.setAttribute('aria-live', 'polite')

  let comments = [...initialComments]

  function renderComments() {
    commentsList.replaceChildren()
    if (comments.length === 0) {
      const empty = document.createElement('p')
      empty.className = 'text-sm text-text-muted py-4'
      empty.textContent = 'Seja o primeiro a comentar!'
      commentsList.appendChild(empty)
    } else {
      for (const c of comments) {
        commentsList.appendChild(renderCommentItem(c))
      }
    }
  }
  renderComments()
  commentsSection.appendChild(commentsList)

  commentsSection.appendChild(
    CommentForm({
      disabled: !isLoggedIn,
      disabledMessage: 'Faça login para comentar',
      onSubmit: async (content) => {
        const newComment = await createComment(post.id, content)
        comments = [newComment, ...comments]
        renderComments()
      },
    }),
  )

  wrapper.appendChild(commentsSection)

  // Load comments in background if not pre-fetched
  if (initialComments.length === 0) {
    getComments(post.id).then((fetched) => {
      comments = fetched
      renderComments()
    }).catch(() => { /* noop */ })
  }

  return wrapper
}

function renderMarkdown(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="bg-bg-input rounded-lg p-4 overflow-x-auto my-4"><code class="text-brand-green text-xs font-mono">$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code class="bg-bg-input px-1 rounded text-brand-green text-xs">$1</code>')
    .replace(/^## (.+)$/gm, '<h2 class="text-lg font-semibold text-white mt-6 mb-2">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 class="text-base font-semibold text-white mt-4 mb-1">$1</h3>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-white">$1</strong>')
    .replace(/\n\n/g, '</p><p class="my-2">')
    .replace(/\n/g, '<br>')
}
