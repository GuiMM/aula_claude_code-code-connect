import { describe, it, expect, vi } from 'vitest'
import { PostCard, type PostCardData } from './PostCard'

const mockPost: PostCardData = {
  id: '1',
  title: 'TypeScript Generics',
  description: 'Aprenda generics de verdade',
  thumbnailUrl: 'https://example.com/thumb.jpg',
  author: { id: 'a1', name: 'Ana Silva' },
  likesCount: 5,
  commentsCount: 3,
  likedByMe: false,
  createdAt: new Date().toISOString(),
}

describe('PostCard', () => {
  it('renders post title', () => {
    const el = PostCard({ post: mockPost })
    expect(el.textContent).toContain('TypeScript Generics')
  })

  it('renders post description', () => {
    const el = PostCard({ post: mockPost })
    expect(el.textContent).toContain('Aprenda generics de verdade')
  })

  it('renders author name', () => {
    const el = PostCard({ post: mockPost })
    expect(el.textContent).toContain('Ana Silva')
  })

  it('renders likes count', () => {
    const el = PostCard({ post: mockPost })
    expect(el.textContent).toContain('5')
  })

  it('renders comments count', () => {
    const el = PostCard({ post: mockPost })
    expect(el.textContent).toContain('3')
  })

  it('renders thumbnail image when src provided', () => {
    const el = PostCard({ post: mockPost })
    const img = el.querySelector('img')
    expect(img).not.toBeNull()
  })

  it('renders placeholder when thumbnailUrl is null', () => {
    const el = PostCard({ post: { ...mockPost, thumbnailUrl: null } })
    expect(el.querySelector('img')).toBeNull()
    expect(el.querySelector('div svg')).not.toBeNull()
  })

  it('calls onClick when clicked', () => {
    const onClick = vi.fn()
    const el = PostCard({ post: mockPost, onClick })
    el.click()
    expect(onClick).toHaveBeenCalledWith('1')
  })

  it('is keyboard accessible with Enter key', () => {
    const onClick = vi.fn()
    const el = PostCard({ post: mockPost, onClick })
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    expect(onClick).toHaveBeenCalledWith('1')
  })
})
