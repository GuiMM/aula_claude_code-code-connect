import { describe, it, expect, vi } from 'vitest'
import { Sidebar } from './Sidebar'

// mock logout to avoid real imports
vi.mock('../../../services/auth', () => ({ logout: vi.fn() }))

describe('Sidebar', () => {
  it('renders CodeConnect logo text', () => {
    const el = Sidebar({ isAuthenticated: false })
    expect(el.textContent).toContain('CodeConnect')
  })

  it('renders Feed nav link', () => {
    const el = Sidebar({ isAuthenticated: false })
    const link = el.querySelector('a[href="#/feed"]')
    expect(link).not.toBeNull()
  })

  it('shows Login link when not authenticated', () => {
    const el = Sidebar({ isAuthenticated: false })
    const link = el.querySelector('a[href="#/login"]')
    expect(link).not.toBeNull()
    expect(el.textContent).toContain('Login')
  })

  it('shows Sair button when authenticated', () => {
    const el = Sidebar({ isAuthenticated: true })
    expect(el.textContent).toContain('Sair')
    expect(el.querySelector('a[href="#/login"]')).toBeNull()
  })

  it('has correct landmark role', () => {
    const el = Sidebar({ isAuthenticated: false })
    expect(el.tagName).toBe('ASIDE')
    expect(el.getAttribute('aria-label')).toBe('Menu lateral')
  })
})
