import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Sidebar } from './Sidebar'
import * as authService from '../../../services/auth'

vi.mock('../../../services/auth', () => ({ logout: vi.fn() }))

describe('Sidebar', () => {
  beforeEach(() => {
    window.location.hash = ''
    vi.clearAllMocks()
  })

  it('renders code/connect logo', () => {
    const el = Sidebar({ isAuthenticated: false })
    expect(el.textContent).toContain('code')
    expect(el.textContent).toContain('connect')
  })

  it('renders "Publicar" button linking to /publicar', () => {
    const el = Sidebar({ isAuthenticated: false })
    const publish = el.querySelector('a[href="#/publicar"]')
    expect(publish).not.toBeNull()
    expect(publish?.textContent).toContain('Publicar')
  })

  it('renders Feed, Perfil and Sobre nós nav items with icons', () => {
    const el = Sidebar({ isAuthenticated: false })
    expect(el.querySelector('a[href="#/feed"]')).not.toBeNull()
    expect(el.querySelector('a[href="#/perfil"]')).not.toBeNull()
    expect(el.querySelector('a[href="#/sobre"]')).not.toBeNull()
    const feed = el.querySelector('a[href="#/feed"]')!
    expect(feed.querySelector('svg')).not.toBeNull()
  })

  it('shows Sair button when authenticated and calls logout on click', () => {
    const el = Sidebar({ isAuthenticated: true })
    const sair = Array.from(el.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Sair'),
    )
    expect(sair).toBeDefined()
    sair!.click()
    expect(authService.logout).toHaveBeenCalled()
  })

  it('shows Login link when not authenticated', () => {
    const el = Sidebar({ isAuthenticated: false })
    expect(el.querySelector('a[href="#/login"]')).not.toBeNull()
  })

  it('has correct landmark role', () => {
    const el = Sidebar({ isAuthenticated: false })
    expect(el.tagName).toBe('ASIDE')
    expect(el.getAttribute('aria-label')).toBe('Menu lateral')
  })
})
