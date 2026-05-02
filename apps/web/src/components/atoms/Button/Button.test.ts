import { describe, it, expect, vi } from 'vitest'
import { Button } from './Button'

describe('Button', () => {
  it('renders with label and primary variant by default', () => {
    const btn = Button({ label: 'Login' })
    expect(btn.tagName).toBe('BUTTON')
    expect(btn.textContent).toContain('Login')
    expect(btn.type).toBe('button')
    expect(btn.className).toContain('bg-brand-green')
  })

  it('renders with type submit when specified', () => {
    const btn = Button({ label: 'Entrar', type: 'submit' })
    expect(btn.type).toBe('submit')
  })

  it('fires onClick when clicked', () => {
    const onClick = vi.fn()
    const btn = Button({ label: 'Go', onClick })
    btn.click()
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('renders social variant without green background', () => {
    const btn = Button({ label: 'Github', variant: 'social' })
    expect(btn.className).not.toContain('bg-brand-green')
    expect(btn.className).toContain('border-border-subtle')
  })

  it('renders icon when iconSrc is provided', () => {
    const btn = Button({ label: 'Github', variant: 'social', iconSrc: '/github_logo.png' })
    const img = btn.querySelector('img')
    expect(img).not.toBeNull()
    expect(img?.getAttribute('src')).toBe('/github_logo.png')
  })

  it('does not render img when iconSrc is absent', () => {
    const btn = Button({ label: 'Login' })
    expect(btn.querySelector('img')).toBeNull()
  })

  it('renders SVG icon when iconAfter is provided', () => {
    const btn = Button({ label: 'Cadastrar', iconAfter: 'arrow_forward' })
    const icon = btn.querySelector('svg[aria-hidden="true"]')
    expect(icon).not.toBeNull()
  })

  it('does not render SVG icon when iconAfter is absent', () => {
    const btn = Button({ label: 'Login' })
    expect(btn.querySelector('svg')).toBeNull()
  })
})
