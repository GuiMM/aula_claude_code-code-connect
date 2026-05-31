import { describe, it, expect, vi } from 'vitest'
import { ComingSoonPage } from './ComingSoonPage'

vi.mock('../../../services/tokenStorage', () => ({
  getToken: vi.fn(() => null),
}))

describe('ComingSoonPage', () => {
  it('renders "Em construção" heading', () => {
    const el = ComingSoonPage()
    expect(el.textContent).toContain('Em construção')
  })

  it('renders provided title as eyebrow', () => {
    const el = ComingSoonPage({ title: 'Publicar' })
    expect(el.textContent).toContain('Publicar')
  })

  it('renders sidebar via FeedTemplate', () => {
    const el = ComingSoonPage({ title: 'Perfil' })
    expect(el.querySelector('aside')).not.toBeNull()
  })
})
