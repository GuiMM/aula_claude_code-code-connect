import { Avatar } from '../../atoms/Avatar/Avatar'
import { Icon } from '../../atoms/Icon/Icon'
import { PostThumbnail } from '../../atoms/PostThumbnail/PostThumbnail'

export interface PostCardData {
  id: string
  title: string
  description: string
  thumbnailUrl: string | null
  author: { id: string; name: string }
  likesCount: number
  commentsCount: number
  likedByMe: boolean | null
  createdAt: string | Date
}

export interface PostCardProps {
  post: PostCardData
  onClick?: (id: string) => void
}

function formatRelativeDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const diffMs = Date.now() - d.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'hoje'
  if (diffDays === 1) return 'ontem'
  if (diffDays < 7) return `há ${diffDays} dias`
  if (diffDays < 30) return `há ${Math.floor(diffDays / 7)} sem.`
  if (diffDays < 365) return `há ${Math.floor(diffDays / 30)} meses`
  return `há ${Math.floor(diffDays / 365)} anos`
}

export function PostCard({ post, onClick }: PostCardProps): HTMLElement {
  const article = document.createElement('article')
  article.className =
    'bg-bg-card border border-border-subtle rounded-xl overflow-hidden cursor-pointer hover:border-brand-green/50 transition-colors group'
  article.setAttribute('role', 'button')
  article.setAttribute('tabindex', '0')

  article.addEventListener('click', () => onClick?.(post.id))
  article.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onClick?.(post.id)
    }
  })

  const thumbnail = PostThumbnail({ src: post.thumbnailUrl, alt: post.title })
  thumbnail.classList.add('w-full')
  article.appendChild(thumbnail)

  const body = document.createElement('div')
  body.className = 'p-4 flex flex-col gap-3'

  const title = document.createElement('h2')
  title.className =
    'text-base font-semibold text-white leading-snug group-hover:text-brand-green transition-colors line-clamp-2'
  title.textContent = post.title
  body.appendChild(title)

  const desc = document.createElement('p')
  desc.className = 'text-sm text-text-muted line-clamp-2 leading-relaxed'
  desc.textContent = post.description
  body.appendChild(desc)

  const meta = document.createElement('div')
  meta.className = 'flex items-center gap-2 mt-auto pt-2 border-t border-border-subtle'

  const avatar = Avatar({ name: post.author.name, size: 'sm' })
  meta.appendChild(avatar)

  const authorDate = document.createElement('div')
  authorDate.className = 'flex flex-col min-w-0'

  const authorName = document.createElement('span')
  authorName.className = 'text-xs font-medium text-white truncate'
  authorName.textContent = post.author.name
  authorDate.appendChild(authorName)

  const dateEl = document.createElement('span')
  dateEl.className = 'text-xs text-text-muted'
  dateEl.textContent = formatRelativeDate(post.createdAt)
  authorDate.appendChild(dateEl)

  meta.appendChild(authorDate)

  const stats = document.createElement('div')
  stats.className = 'flex items-center gap-3 ml-auto shrink-0'

  const likesStat = document.createElement('div')
  likesStat.className = 'flex items-center gap-1 text-xs text-text-muted'
  const heartIcon = Icon({
    name: post.likedByMe ? 'heart_filled' : 'heart',
    className: `w-4 h-4 shrink-0 ${post.likedByMe ? 'text-red-400' : ''}`,
  })
  likesStat.appendChild(heartIcon)
  const likesSpan = document.createElement('span')
  likesSpan.textContent = String(post.likesCount)
  likesStat.appendChild(likesSpan)
  stats.appendChild(likesStat)

  const commentsStat = document.createElement('div')
  commentsStat.className = 'flex items-center gap-1 text-xs text-text-muted'
  commentsStat.appendChild(Icon({ name: 'comment', className: 'w-4 h-4 shrink-0' }))
  const commentsSpan = document.createElement('span')
  commentsSpan.textContent = String(post.commentsCount)
  commentsStat.appendChild(commentsSpan)
  stats.appendChild(commentsStat)

  meta.appendChild(stats)
  body.appendChild(meta)
  article.appendChild(body)

  return article
}
