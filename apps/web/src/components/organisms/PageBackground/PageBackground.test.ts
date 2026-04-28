import { describe, it, expect } from 'vitest'
import { PageBackground } from './PageBackground'

describe('PageBackground', () => {
  it('renders a div with full-viewport dark background', () => {
    const el = PageBackground()
    expect(el.tagName).toBe('DIV')
    expect(el.className).toContain('bg-bg-page')
    expect(el.className).toContain('min-h-screen')
  })
})
