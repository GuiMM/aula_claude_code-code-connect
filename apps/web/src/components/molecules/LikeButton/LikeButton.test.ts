import { describe, it, expect, vi } from 'vitest'
import { LikeButton } from './LikeButton'

describe('LikeButton', () => {
  it('renders like count', () => {
    const btn = LikeButton({ count: 7, liked: false })
    expect(btn.textContent).toContain('7')
  })

  it('shows liked state with aria-pressed=true', () => {
    const btn = LikeButton({ count: 3, liked: true })
    expect(btn.getAttribute('aria-pressed')).toBe('true')
  })

  it('shows not liked state with aria-pressed=false', () => {
    const btn = LikeButton({ count: 3, liked: false })
    expect(btn.getAttribute('aria-pressed')).toBe('false')
  })

  it('calls onClick when clicked and not disabled', () => {
    const onClick = vi.fn()
    const btn = LikeButton({ count: 0, liked: false, onClick })
    btn.click()
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('is disabled when disabled=true', () => {
    const btn = LikeButton({ count: 0, liked: false, disabled: true })
    expect(btn.disabled).toBe(true)
  })

  it('does not call onClick when disabled', () => {
    const onClick = vi.fn()
    const btn = LikeButton({ count: 0, liked: false, disabled: true, onClick })
    btn.click()
    expect(onClick).not.toHaveBeenCalled()
  })
})
