import { describe, it, expect, vi } from 'vitest'
import { CommentList } from './CommentList'
import type { PostComment } from '../../../services/posts'

function make(
  id: string,
  content: string,
  parentId: string | null = null,
  authorName = 'Ada',
): PostComment {
  return {
    id,
    content,
    author: { id: 'u', name: authorName },
    parentId,
    createdAt: new Date('2026-01-01').toISOString(),
  }
}

describe('CommentList', () => {
  it('shows empty state when no comments', () => {
    const el = CommentList({ comments: [] })
    expect(el.textContent).toContain('Seja o primeiro a comentar!')
  })

  it('renders top-level comments and nests replies', () => {
    const comments: PostComment[] = [
      make('1', 'Top A'),
      make('2', 'Top B'),
      make('3', 'Reply to A', '1'),
    ]
    const el = CommentList({ comments, onReply: vi.fn() })

    const topLevel = el.querySelectorAll('article[data-comment-id]')
    expect(topLevel.length).toBeGreaterThanOrEqual(2)
    expect(el.textContent).toContain('Top A')
    expect(el.textContent).toContain('Top B')

    const toggle = Array.from(el.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Ver respostas'),
    )
    expect(toggle).toBeDefined()
  })

  it('does not render replies as top-level comments', () => {
    const comments: PostComment[] = [
      make('1', 'Top'),
      make('2', 'Reply', '1'),
    ]
    const el = CommentList({ comments })
    const topRoots = Array.from(el.children).filter(
      (c) => c.tagName === 'ARTICLE',
    )
    expect(topRoots).toHaveLength(1)
    expect(topRoots[0].getAttribute('data-comment-id')).toBe('1')
  })
})
