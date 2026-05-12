import { describe, it, expect, vi } from 'vitest'
import { FeedTemplate } from './FeedTemplate'

vi.mock('../../../services/tokenStorage', () => ({ getToken: vi.fn().mockReturnValue(null) }))
vi.mock('../../../services/auth', () => ({ logout: vi.fn() }))

describe('FeedTemplate', () => {
  it('renders a sidebar and main area', () => {
    const content = document.createElement('div')
    content.textContent = 'Conteúdo'
    const el = FeedTemplate({ content })
    expect(el.querySelector('aside')).not.toBeNull()
    expect(el.querySelector('main')).not.toBeNull()
  })

  it('renders content inside main', () => {
    const content = document.createElement('div')
    content.textContent = 'Meu conteúdo'
    const el = FeedTemplate({ content })
    const main = el.querySelector('main')!
    expect(main.textContent).toContain('Meu conteúdo')
  })
})
