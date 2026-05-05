import { describe, it, expect, vi } from 'vitest'
import { AuthFooterPrompt } from './AuthFooterPrompt'

describe('AuthFooterPrompt', () => {
  it('renders text and link', () => {
    const el = AuthFooterPrompt({ text: 'Ainda não tem conta?', linkText: 'Crie seu cadastro!' })
    expect(el.textContent).toContain('Ainda não tem conta?')
    expect(el.querySelector('a')?.textContent).toBe('Crie seu cadastro!')
  })

  it('applies accent style to the link', () => {
    const el = AuthFooterPrompt({ text: 'Ainda não tem conta?', linkText: 'Crie seu cadastro!' })
    const link = el.querySelector('a')!
    expect(link.className).toContain('text-brand-green')
  })

  it('calls onLinkClick when link is clicked', () => {
    const onLinkClick = vi.fn()
    const el = AuthFooterPrompt({ text: 'Ainda não tem conta?', linkText: 'Crie seu cadastro!', onLinkClick })
    el.querySelector('a')!.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
    expect(onLinkClick).toHaveBeenCalledOnce()
  })
})
