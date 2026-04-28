import { describe, it, expect } from 'vitest'
import { Heading } from './Heading'

describe('Heading', () => {
  it('renders h1 by default', () => {
    const el = Heading({ text: 'Login' })
    expect(el.tagName).toBe('H1')
    expect(el.textContent).toBe('Login')
  })

  it('renders h2 when level 2 is specified', () => {
    const el = Heading({ text: 'Boas-vindas!', level: 2 })
    expect(el.tagName).toBe('H2')
  })

  it('applies larger text for h1', () => {
    const el = Heading({ text: 'Title', level: 1 })
    expect(el.className).toContain('text-2xl')
  })

  it('applies smaller text for h2', () => {
    const el = Heading({ text: 'Sub', level: 2 })
    expect(el.className).toContain('text-lg')
  })
})
