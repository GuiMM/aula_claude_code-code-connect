import { SearchInput } from '../../molecules/SearchInput/SearchInput'
import { PostCard, type PostCardData } from '../../molecules/PostCard/PostCard'

export interface PostFeedProps {
  posts: PostCardData[]
  totalPages: number
  currentPage: number
  onSearch: (query: string) => void
  onLoadPage: (page: number) => void
  onPostClick: (id: string) => void
  loading?: boolean
}

function createEmptyState(): HTMLElement {
  const div = document.createElement('div')
  div.className = 'flex flex-col items-center gap-3 py-16 text-text-muted'
  div.setAttribute('aria-live', 'polite')

  const msg = document.createElement('p')
  msg.className = 'text-base'
  msg.textContent = 'Nenhum post encontrado.'
  div.appendChild(msg)
  return div
}

function createLoadingState(): HTMLElement {
  const grid = document.createElement('div')
  grid.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
  grid.setAttribute('aria-busy', 'true')
  grid.setAttribute('aria-label', 'Carregando posts...')

  for (let i = 0; i < 6; i++) {
    const skeleton = document.createElement('div')
    skeleton.className = 'bg-bg-card border border-border-subtle rounded-xl overflow-hidden animate-pulse'
    const thumb = document.createElement('div')
    thumb.className = 'w-full aspect-video bg-bg-input'
    const body = document.createElement('div')
    body.className = 'p-4 flex flex-col gap-2'
    body.appendChild(Object.assign(document.createElement('div'), { className: 'h-4 bg-bg-input rounded w-3/4' }))
    body.appendChild(Object.assign(document.createElement('div'), { className: 'h-3 bg-bg-input rounded w-full' }))
    body.appendChild(Object.assign(document.createElement('div'), { className: 'h-3 bg-bg-input rounded w-2/3' }))
    skeleton.appendChild(thumb)
    skeleton.appendChild(body)
    grid.appendChild(skeleton)
  }
  return grid
}

export function PostFeed({
  posts,
  totalPages,
  currentPage,
  onSearch,
  onLoadPage,
  onPostClick,
  loading = false,
}: PostFeedProps): HTMLElement {
  const wrapper = document.createElement('div')
  wrapper.className = 'flex flex-col gap-6'

  const header = document.createElement('div')
  header.className = 'flex items-center justify-between gap-4'

  const title = document.createElement('h1')
  title.className = 'text-xl font-semibold text-white shrink-0'
  title.textContent = 'Feed'
  header.appendChild(title)

  header.appendChild(SearchInput({ onSearch }))
  wrapper.appendChild(header)

  if (loading) {
    wrapper.appendChild(createLoadingState())
    return wrapper
  }

  if (posts.length === 0) {
    wrapper.appendChild(createEmptyState())
    return wrapper
  }

  const grid = document.createElement('div')
  grid.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'

  for (const post of posts) {
    grid.appendChild(PostCard({ post, onClick: onPostClick }))
  }
  wrapper.appendChild(grid)

  if (totalPages > 1) {
    const pagination = document.createElement('div')
    pagination.className = 'flex items-center justify-center gap-2'

    const prevBtn = document.createElement('button')
    prevBtn.type = 'button'
    prevBtn.textContent = '← Anterior'
    prevBtn.disabled = currentPage <= 1
    prevBtn.className =
      'px-3 py-1.5 rounded-lg text-sm border border-border-subtle text-text-muted hover:bg-bg-input disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors'
    prevBtn.addEventListener('click', () => onLoadPage(currentPage - 1))

    const pageInfo = document.createElement('span')
    pageInfo.className = 'text-sm text-text-muted px-2'
    pageInfo.textContent = `${currentPage} / ${totalPages}`

    const nextBtn = document.createElement('button')
    nextBtn.type = 'button'
    nextBtn.textContent = 'Próximo →'
    nextBtn.disabled = currentPage >= totalPages
    nextBtn.className =
      'px-3 py-1.5 rounded-lg text-sm border border-border-subtle text-text-muted hover:bg-bg-input disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors'
    nextBtn.addEventListener('click', () => onLoadPage(currentPage + 1))

    pagination.append(prevBtn, pageInfo, nextBtn)
    wrapper.appendChild(pagination)
  }

  return wrapper
}
