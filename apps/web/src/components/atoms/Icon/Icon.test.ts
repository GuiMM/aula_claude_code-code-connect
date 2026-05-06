import { describe, it, expect } from 'vitest'
import { Icon } from './Icon'

describe('Icon', () => {
  it('renders an SVG element', () => {
    const icon = Icon({ name: 'arrow_forward' })
    expect(icon.tagName.toLowerCase()).toBe('svg')
  })

  it('is aria-hidden to assistive technologies', () => {
    const icon = Icon({ name: 'arrow_forward' })
    expect(icon.getAttribute('aria-hidden')).toBe('true')
  })

  it('has a path element with the correct glyph', () => {
    const icon = Icon({ name: 'arrow_forward' })
    expect(icon.querySelector('path')).not.toBeNull()
    expect(icon.querySelector('path')?.getAttribute('d')).toContain('M12 4')
  })

  it('renders the login icon path', () => {
    const icon = Icon({ name: 'login' })
    expect(icon.querySelector('path')?.getAttribute('d')).toContain('M11 7')
  })

  it('applies default size class', () => {
    const icon = Icon({ name: 'arrow_forward' })
    expect(icon.getAttribute('class')).toContain('w-5')
  })

  it('accepts a custom className', () => {
    const icon = Icon({ name: 'arrow_forward', className: 'w-4 h-4' })
    expect(icon.getAttribute('class')).toBe('w-4 h-4')
  })
})
