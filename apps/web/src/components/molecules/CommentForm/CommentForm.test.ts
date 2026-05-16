import { describe, it, expect, vi } from 'vitest'
import { CommentForm } from './CommentForm'

describe('CommentForm', () => {
  it('renders textarea and submit button when enabled', () => {
    const form = CommentForm({ onSubmit: vi.fn() })
    expect(form.querySelector('textarea')).not.toBeNull()
    expect(form.querySelector('button')).not.toBeNull()
  })

  it('renders disabled message when disabled=true', () => {
    const form = CommentForm({ onSubmit: vi.fn(), disabled: true, disabledMessage: 'Faça login' })
    expect(form.querySelector('textarea')).toBeNull()
    expect(form.textContent).toContain('Faça login')
  })

  it('calls onSubmit with textarea content on button click', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const form = CommentForm({ onSubmit })
    const textarea = form.querySelector('textarea')!
    const btn = form.querySelector('button')!
    textarea.value = 'Ótimo post!'
    btn.click()
    expect(onSubmit).toHaveBeenCalledWith('Ótimo post!')
  })

  it('does not call onSubmit with empty content', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const form = CommentForm({ onSubmit })
    const btn = form.querySelector('button')!
    btn.click()
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
