import { Avatar } from '../../atoms/Avatar/Avatar'
import { Icon, type IconName } from '../../atoms/Icon/Icon'
import { CommentForm } from '../../molecules/CommentForm/CommentForm'
import { CommentList } from '../CommentList/CommentList'
import {
  type PostDetail as PostDetailData,
  type PostComment,
  likePost,
  unlikePost,
  getComments,
  createComment,
} from '../../../services/posts'
import { getToken } from '../../../services/tokenStorage'

export interface PostDetailProps {
  post: PostDetailData
  initialComments?: PostComment[]
}

function buildActionIcon(name: IconName, count: number, ariaLabel: string): HTMLElement {
  const wrapper = document.createElement('div')
  wrapper.className = 'flex flex-col items-center gap-1 text-text-muted'
  wrapper.setAttribute('aria-label', ariaLabel)
  wrapper.appendChild(Icon({ name, className: 'w-6 h-6 shrink-0' }))
  const label = document.createElement('span')
  label.className = 'text-xs'
  label.textContent = String(count)
  wrapper.appendChild(label)
  return wrapper
}

function buildLikeAction(
  initialCount: number,
  initialLiked: boolean,
  isLoggedIn: boolean,
  postId: string,
): HTMLElement {
  const wrapper = document.createElement('button')
  wrapper.type = 'button'
  wrapper.disabled = !isLoggedIn
  wrapper.className =
    'flex flex-col items-center gap-1 text-text-muted hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'

  let liked = initialLiked
  let count = initialCount

  const iconWrapper = document.createElement('span')
  const label = document.createElement('span')
  label.className = 'text-xs'
  wrapper.append(iconWrapper, label)

  function render() {
    iconWrapper.replaceChildren(
      Icon({ name: liked ? 'heart_filled' : 'heart', className: 'w-6 h-6 shrink-0' }),
    )
    label.textContent = String(count)
    wrapper.setAttribute(
      'aria-label',
      `${liked ? 'Descurtir' : 'Curtir'} post (${count} curtidas)`,
    )
    wrapper.setAttribute('aria-pressed', String(liked))
    if (liked) {
      wrapper.classList.add('text-red-400')
    } else {
      wrapper.classList.remove('text-red-400')
    }
  }
  render()

  if (isLoggedIn) {
    wrapper.addEventListener('click', async () => {
      try {
        if (liked) {
          await unlikePost(postId)
          liked = false
          count--
        } else {
          await likePost(postId)
          liked = true
          count++
        }
        render()
      } catch {
        /* noop */
      }
    })
  }
  return wrapper
}

export function PostDetail({ post, initialComments = [] }: PostDetailProps): HTMLElement {
  const isLoggedIn = !!getToken()

  const wrapper = document.createElement('div')
  wrapper.className = 'flex flex-col gap-8 max-w-3xl mx-auto'

  // --- Card publicação ---
  const card = document.createElement('article')
  card.className = 'rounded-lg overflow-hidden'

  const header = document.createElement('div')
  header.className = 'bg-[#848484] px-4 py-6 flex justify-center items-center min-h-[160px]'
  if (post.thumbnailUrl) {
    const img = document.createElement('img')
    img.src = post.thumbnailUrl
    img.alt = post.title
    img.className = 'max-h-48 object-cover rounded-md'
    header.appendChild(img)
  } else {
    const preview = document.createElement('pre')
    preview.className =
      'bg-bg-card rounded-md p-4 font-mono text-xs text-text-secondary overflow-hidden max-w-full w-full whitespace-pre-wrap'
    const lines = post.content.split('\n').slice(0, 10).join('\n')
    preview.textContent = lines
    header.appendChild(preview)
  }
  card.appendChild(header)

  const footer = document.createElement('div')
  footer.className = 'bg-bg-card p-4 flex flex-col gap-4'

  const title = document.createElement('h2')
  title.className = 'text-xl font-semibold text-white'
  title.textContent = post.title
  footer.appendChild(title)

  const desc = document.createElement('p')
  desc.className = 'text-sm text-text-muted'
  desc.textContent = post.description
  footer.appendChild(desc)

  const actionsRow = document.createElement('div')
  actionsRow.className = 'flex items-center justify-between'

  const leftActions = document.createElement('div')
  leftActions.className = 'flex items-center gap-6'
  leftActions.appendChild(buildLikeAction(post.likesCount, !!post.likedByMe, isLoggedIn, post.id))
  leftActions.appendChild(buildActionIcon('share', 0, 'Compartilhar'))

  const commentCountWrapper = buildActionIcon('chat', 0, 'Comentários')
  const commentCountLabel = commentCountWrapper.querySelector('span')!
  leftActions.appendChild(commentCountWrapper)

  actionsRow.appendChild(leftActions)

  const authorBox = document.createElement('div')
  authorBox.className = 'flex items-center gap-2'
  authorBox.appendChild(Avatar({ name: post.author.name, size: 'sm' }))
  const authorName = document.createElement('span')
  authorName.className = 'text-sm text-white'
  authorName.textContent = `@${post.author.name}`
  authorBox.appendChild(authorName)
  actionsRow.appendChild(authorBox)

  footer.appendChild(actionsRow)
  card.appendChild(footer)
  wrapper.appendChild(card)

  // --- Card "Código:" ---
  const codeSection = document.createElement('section')
  codeSection.className = 'flex flex-col gap-3'

  const codeLabel = document.createElement('p')
  codeLabel.className = 'text-text-muted text-lg font-semibold'
  codeLabel.textContent = 'Código:'
  codeSection.appendChild(codeLabel)

  const codeBox = document.createElement('div')
  codeBox.className = 'bg-bg-card rounded-lg p-4 shadow-lg'
  const pre = document.createElement('pre')
  pre.className = 'font-mono text-sm text-text-secondary whitespace-pre-wrap'
  const code = document.createElement('code')
  code.textContent = post.content
  pre.appendChild(code)
  codeBox.appendChild(pre)
  codeSection.appendChild(codeBox)

  wrapper.appendChild(codeSection)

  // --- Seção Comentários ---
  const commentsSection = document.createElement('section')
  commentsSection.className = 'bg-bg-section rounded-lg p-8 flex flex-col gap-6'

  const commentsTitle = document.createElement('h2')
  commentsTitle.className = 'text-bg-card text-xl font-semibold'
  commentsTitle.textContent = 'Comentários'
  commentsSection.appendChild(commentsTitle)

  const listContainer = document.createElement('div')
  commentsSection.appendChild(listContainer)

  let comments = [...initialComments]

  async function handleReply(parentId: string, content: string): Promise<void> {
    const newReply = await createComment(post.id, content, parentId)
    comments = [...comments, newReply]
    renderComments()
  }

  function renderComments() {
    listContainer.replaceChildren(
      CommentList({ comments, onReply: isLoggedIn ? handleReply : undefined }),
    )
    commentCountLabel.textContent = String(comments.length)
  }
  renderComments()

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

  if (initialComments.length === 0) {
    getComments(post.id)
      .then((fetched) => {
        comments = fetched
        renderComments()
      })
      .catch(() => {
        /* noop */
      })
  }

  return wrapper
}
