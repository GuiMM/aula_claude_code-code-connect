import { describe, it, expect, vi } from 'vitest'
import { CommentItem } from './CommentItem'
import type { PostComment } from '../../../services/posts'

function makeComment(overrides: Partial<PostComment> = {}): PostComment {
  return {
    id: 'c1',
    content: 'Comentário top-level',
    author: { id: 'u1', name: 'Ada' },
    parentId: null,
    createdAt: new Date('2026-01-01').toISOString(),
    ...overrides,
  }
}

describe('CommentItem', () => {
  it('renders author name and content', () => {
    const el = CommentItem({ comment: makeComment() })
    expect(el.textContent).toContain('@Ada')
    expect(el.textContent).toContain('Comentário top-level')
  })

  it('does not render Responder when onReply is not provided', () => {
    const el = CommentItem({ comment: makeComment() })
    expect(el.textContent).not.toContain('Responder')
  })

  it('renders Responder when onReply is provided and toggles form', () => {
    const onReply = vi.fn().mockResolvedValue(undefined)
    const el = CommentItem({ comment: makeComment(), onReply })

    const replyBtn = Array.from(el.querySelectorAll('button')).find(
      (b) => b.textContent === 'Responder',
    )
    expect(replyBtn).toBeDefined()

    const formContainer = el.querySelector('div.hidden')
    expect(formContainer).not.toBeNull()
    replyBtn!.click()
    expect(el.querySelector('div.hidden')).not.toBe(formContainer)
  })

  it('calls onReply with parent id and content when submitting', async () => {
    const onReply = vi.fn().mockResolvedValue(undefined)
    const el = CommentItem({ comment: makeComment({ id: 'parent-1' }), onReply })

    const replyBtn = Array.from(el.querySelectorAll('button')).find(
      (b) => b.textContent === 'Responder',
    )!
    replyBtn.click()

    const textarea = el.querySelector('textarea')!
    textarea.value = 'Minha resposta'
    const submitBtn = Array.from(el.querySelectorAll('button')).find(
      (b) => b.textContent === 'Comentar',
    )!
    submitBtn.click()

    await Promise.resolve()
    expect(onReply).toHaveBeenCalledWith('parent-1', 'Minha resposta')
  })

  it('renders "Ver respostas" toggle when replies exist', () => {
    const replies = [
      makeComment({ id: 'r1', parentId: 'c1', content: 'Reply 1' }),
      makeComment({ id: 'r2', parentId: 'c1', content: 'Reply 2' }),
    ]
    const el = CommentItem({ comment: makeComment(), replies })

    const toggle = Array.from(el.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Ver respostas'),
    )
    expect(toggle).toBeDefined()
    expect(toggle!.textContent).toContain('(2)')

    toggle!.click()
    expect(toggle!.textContent).toContain('Ocultar respostas')
    expect(el.textContent).toContain('Reply 1')
    expect(el.textContent).toContain('Reply 2')
  })

  it('does not render Responder for replies (isReply=true)', () => {
    const onReply = vi.fn()
    const el = CommentItem({
      comment: makeComment(),
      isReply: true,
      onReply,
    })
    expect(el.textContent).not.toContain('Responder')
  })
})
