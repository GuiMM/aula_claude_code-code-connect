import { describe, it, expect, vi } from 'vitest'
import { RememberRow } from './RememberRow'

describe('RememberRow', () => {
  it('renders checkbox and forgot-password link', () => {
    const el = RememberRow()
    expect(el.querySelector('input[type="checkbox"]')).not.toBeNull()
    expect(el.querySelector('a')?.textContent).toBe('Esqueci a senha')
  })

  it('calls onForgotPassword when link is clicked', () => {
    const onForgotPassword = vi.fn()
    const el = RememberRow({ onForgotPassword })
    el.querySelector('a')!.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
    expect(onForgotPassword).toHaveBeenCalledOnce()
  })
})
