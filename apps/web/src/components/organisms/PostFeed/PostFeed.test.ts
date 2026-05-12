import { describe, it, expect, vi } from 'vitest'
import { PostFeed } from './PostFeed'
import type { PostCardData } from '../../molecules/PostCard/PostCard'

const mockPosts: PostCardData[] = [
  {
    id: '1',
    title: 'Post 1',
    description: 'Desc 1',
    thumbnailUrl: null,
    author: { id: 'a1', name: 'Ana' },
    likesCount: 0,
    commentsCount: 0,
    likedByMe: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Post 2',
    description: 'Desc 2',
    thumbnailUrl: 'https://example.com/img.jpg',
    author: { id: 'a2', name: 'Carlos' },
    likesCount: 3,
    commentsCount: 1,
    likedByMe: true,
    createdAt: new Date().toISOString(),
  },
]

describe('PostFeed', () => {
  it('renders Feed heading', () => {
    const el = PostFeed({ posts: mockPosts, totalPages: 1, currentPage: 1, onSearch: vi.fn(), onLoadPage: vi.fn(), onPostClick: vi.fn() })
    expect(el.textContent).toContain('Feed')
  })

  it('renders post cards', () => {
    const el = PostFeed({ posts: mockPosts, totalPages: 1, currentPage: 1, onSearch: vi.fn(), onLoadPage: vi.fn(), onPostClick: vi.fn() })
    expect(el.textContent).toContain('Post 1')
    expect(el.textContent).toContain('Post 2')
  })

  it('renders empty state when posts is empty', () => {
    const el = PostFeed({ posts: [], totalPages: 0, currentPage: 1, onSearch: vi.fn(), onLoadPage: vi.fn(), onPostClick: vi.fn() })
    expect(el.textContent).toContain('Nenhum post encontrado')
  })

  it('renders loading skeleton when loading=true', () => {
    const el = PostFeed({ posts: [], totalPages: 0, currentPage: 1, loading: true, onSearch: vi.fn(), onLoadPage: vi.fn(), onPostClick: vi.fn() })
    expect(el.querySelector('[aria-busy="true"]')).not.toBeNull()
  })

  it('does not render pagination when totalPages=1', () => {
    const el = PostFeed({ posts: mockPosts, totalPages: 1, currentPage: 1, onSearch: vi.fn(), onLoadPage: vi.fn(), onPostClick: vi.fn() })
    expect(el.textContent).not.toContain('Próximo')
  })

  it('renders pagination when totalPages>1', () => {
    const el = PostFeed({ posts: mockPosts, totalPages: 3, currentPage: 2, onSearch: vi.fn(), onLoadPage: vi.fn(), onPostClick: vi.fn() })
    expect(el.textContent).toContain('Próximo')
    expect(el.textContent).toContain('Anterior')
  })
})
