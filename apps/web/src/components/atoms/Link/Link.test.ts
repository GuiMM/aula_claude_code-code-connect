import { describe, it, expect, vi } from 'vitest'
import { Link } from './Link'

describe('Link', () => {
  it('renders anchor with text', () => {
    const link = Link({ text: 'Esqueci a senha' })
    expect(link.tagName).toBe('A')
    expect(link.textContent).toBe('Esqueci a senha')
  })

  it('defaults href to #', () => {
    const link = Link({ text: 'Test' })
    expect(link.href).toContain('#')
  })

  it('applies accent styling for accent variant', () => {
    const link = Link({ text: 'Crie seu cadastro!', variant: 'accent' })
    expect(link.className).toContain('text-brand-green')
  })

  it('applies muted styling for default variant', () => {
    const link = Link({ text: 'Esqueci a senha' })
    expect(link.className).toContain('text-text-muted')
  })

  it('fires onClick and prevents default when clicked', () => {
    const onClick = vi.fn()
    const link = Link({ text: 'Click me', onClick })
    const event = new MouseEvent('click', { bubbles: true, cancelable: true })
    link.dispatchEvent(event)
    expect(onClick).toHaveBeenCalledOnce()
    expect(event.defaultPrevented).toBe(true)
  })
})
