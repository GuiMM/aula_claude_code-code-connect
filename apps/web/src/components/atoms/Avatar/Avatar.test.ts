import { describe, it, expect } from 'vitest'
import { Avatar } from './Avatar'

describe('Avatar', () => {
  it('renders a div with initials from two-word name', () => {
    const el = Avatar({ name: 'Ana Beatriz' })
    expect(el.tagName).toBe('DIV')
    expect(el.textContent).toBe('AB')
  })

  it('renders initials from single-word name', () => {
    const el = Avatar({ name: 'Carlos' })
    expect(el.textContent).toBe('CA')
  })

  it('renders initials from first and last word of long name', () => {
    const el = Avatar({ name: 'Maria Fernanda Lima' })
    expect(el.textContent).toBe('ML')
  })

  it('applies medium size by default', () => {
    const el = Avatar({ name: 'Ana Silva' })
    expect(el.className).toContain('w-9')
  })

  it('applies small size', () => {
    const el = Avatar({ name: 'Ana Silva', size: 'sm' })
    expect(el.className).toContain('w-7')
  })

  it('applies large size', () => {
    const el = Avatar({ name: 'Ana Silva', size: 'lg' })
    expect(el.className).toContain('w-11')
  })

  it('sets aria-label to name', () => {
    const el = Avatar({ name: 'Fernanda Lima' })
    expect(el.getAttribute('aria-label')).toBe('Fernanda Lima')
  })
})
