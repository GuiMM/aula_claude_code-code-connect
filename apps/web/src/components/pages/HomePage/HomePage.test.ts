import { describe, it, expect, vi, beforeEach } from 'vitest'
import { HomePage } from './HomePage'

vi.mock('../../../services/auth', () => ({
  getMe: vi.fn(),
  logout: vi.fn(),
}))

vi.mock('../../../services/tokenStorage', () => ({
  getToken: vi.fn(),
  clearToken: vi.fn(),
}))

import { getMe, logout } from '../../../services/auth'

const flush = () => new Promise((r) => setTimeout(r, 0))

beforeEach(() => {
  vi.clearAllMocks()
  window.location.hash = ''
})

describe('HomePage', () => {
  it('renders greeting with user name after getMe resolves', async () => {
    vi.mocked(getMe).mockResolvedValue({ id: '1', name: 'Ana', email: 'ana@test.com' })
    const page = HomePage()
    await flush()
    expect(page.querySelector('h1')?.textContent).toBe('Olá, Ana!')
  })

  it('redirects to #/login when getMe rejects', async () => {
    vi.mocked(getMe).mockRejectedValue(new Error('Unauthorized'))
    HomePage()
    await flush()
    expect(window.location.hash).toBe('#/login')
  })

  it('calls logout and navigates to #/login when Sair is clicked', async () => {
    vi.mocked(getMe).mockResolvedValue({ id: '1', name: 'Ana', email: 'ana@test.com' })
    const page = HomePage()
    await flush()

    const btn = Array.from(page.querySelectorAll('button')).find((b) => b.textContent?.includes('Sair'))!
    btn.dispatchEvent(new MouseEvent('click', { bubbles: true }))

    expect(logout).toHaveBeenCalledOnce()
    expect(window.location.hash).toBe('#/login')
  })
})
