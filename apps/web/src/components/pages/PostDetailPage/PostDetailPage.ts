import { FeedTemplate } from '../../templates/FeedTemplate/FeedTemplate'
import { PostDetail } from '../../organisms/PostDetail/PostDetail'
import { getPost } from '../../../services/posts'

export interface PostDetailPageProps {
  postId: string
}

function createLoading(): HTMLElement {
  const div = document.createElement('div')
  div.className = 'flex flex-col gap-4 max-w-3xl mx-auto animate-pulse'
  div.setAttribute('aria-label', 'Carregando post...')
  div.appendChild(Object.assign(document.createElement('div'), { className: 'aspect-video w-full bg-bg-card rounded-xl' }))
  div.appendChild(Object.assign(document.createElement('div'), { className: 'h-6 bg-bg-card rounded w-2/3' }))
  div.appendChild(Object.assign(document.createElement('div'), { className: 'h-4 bg-bg-card rounded w-full' }))
  div.appendChild(Object.assign(document.createElement('div'), { className: 'h-4 bg-bg-card rounded w-3/4' }))
  return div
}

function createError(message: string): HTMLElement {
  const div = document.createElement('div')
  div.className = 'flex flex-col items-center gap-4 py-16 text-text-muted max-w-3xl mx-auto'
  const p = document.createElement('p')
  p.className = 'text-base'
  p.textContent = message
  const backBtn = document.createElement('button')
  backBtn.type = 'button'
  backBtn.className = 'text-sm text-brand-green hover:underline cursor-pointer'
  backBtn.textContent = '← Voltar ao feed'
  backBtn.addEventListener('click', () => { window.location.hash = '#/feed' })
  div.append(p, backBtn)
  return div
}

export function PostDetailPage({ postId }: PostDetailPageProps): HTMLElement {
  const loadingEl = createLoading()
  const wrapper = FeedTemplate({ content: loadingEl })

  getPost(postId)
    .then((post) => {
      const detailEl = PostDetail({ post })
      const main = wrapper.querySelector('main')!
      main.replaceChildren(detailEl)
    })
    .catch(() => {
      const main = wrapper.querySelector('main')!
      main.replaceChildren(createError('Post não encontrado ou ocorreu um erro.'))
    })

  return wrapper
}
