import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PostDetail } from './PostDetail'
import type { PostDetail as PostDetailData, PostComment } from '../../../services/posts'

vi.mock('../../../services/tokenStorage', () => ({
  getToken: vi.fn(() => null),
}))

vi.mock('../../../services/posts', async () => {
  const actual = await vi.importActual<typeof import('../../../services/posts')>(
    '../../../services/posts',
  )
  return {
    ...actual,
    likePost: vi.fn(),
    unlikePost: vi.fn(),
    getComments: vi.fn(async () => []),
    createComment: vi.fn(),
  }
})

function makePost(overrides: Partial<PostDetailData> = {}): PostDetailData {
  return {
    id: 'post-1',
    title: 'Meu Post',
    description: 'Descrição do post',
    thumbnailUrl: null,
    content: 'const x = 1\nconsole.log(x)',
    author: { id: 'u1', name: 'Ada' },
    likesCount: 3,
    commentsCount: 0,
    likedByMe: false,
    createdAt: new Date('2026-01-01').toISOString(),
    ...overrides,
  }
}

describe('PostDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders title and description', () => {
    const el = PostDetail({ post: makePost() })
    expect(el.textContent).toContain('Meu Post')
    expect(el.textContent).toContain('Descrição do post')
  })

  it('renders author handle', () => {
    const el = PostDetail({ post: makePost() })
    expect(el.textContent).toContain('@Ada')
  })

  it('renders Código: block with raw post content (no markdown parsing)', () => {
    const el = PostDetail({ post: makePost({ content: '**bold** keeps raw' }) })
    expect(el.textContent).toContain('Código:')
    const codeEl = el.querySelector('pre code')
    expect(codeEl?.textContent).toBe('**bold** keeps raw')
  })

  it('renders top-level comments from initialComments', () => {
    const comment: PostComment = {
      id: 'c1',
      content: 'Top comment',
      author: { id: 'u2', name: 'Linus' },
      parentId: null,
      createdAt: new Date('2026-01-02').toISOString(),
    }
    const el = PostDetail({ post: makePost(), initialComments: [comment] })
    expect(el.textContent).toContain('Top comment')
    expect(el.textContent).toContain('@Linus')
  })

  it('renders Comentários section heading', () => {
    const el = PostDetail({ post: makePost() })
    expect(el.textContent).toContain('Comentários')
  })
})
