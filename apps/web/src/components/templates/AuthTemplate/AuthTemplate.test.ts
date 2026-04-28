import { describe, it, expect } from 'vitest'
import { AuthTemplate } from './AuthTemplate'

describe('AuthTemplate', () => {
  it('renders banner and form inside the card', () => {
    const banner = document.createElement('div')
    banner.setAttribute('data-testid', 'banner')

    const form = document.createElement('form')
    form.setAttribute('data-testid', 'form')

    const el = AuthTemplate({ banner, form })

    expect(el.querySelector('[data-testid="banner"]')).not.toBeNull()
    expect(el.querySelector('[data-testid="form"]')).not.toBeNull()
  })

  it('renders the page background wrapper', () => {
    const banner = document.createElement('div')
    const form = document.createElement('form')
    const el = AuthTemplate({ banner, form })
    expect(el.className).toContain('bg-bg-page')
  })

  it('contains the card with two-column grid layout', () => {
    const banner = document.createElement('div')
    const form = document.createElement('form')
    const el = AuthTemplate({ banner, form })
    const card = el.querySelector('.grid')
    expect(card).not.toBeNull()
    expect(card?.className).toContain('md:grid-cols-2')
  })
})
