import { describe, it, expect, vi, beforeEach } from 'vitest'
import { login, register, getMe, logout } from './auth'
import * as tokenStorage from './tokenStorage'

vi.mock('./http', () => {
  const mockHttp = {
    post: vi.fn(),
    get: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  }
  return { http: mockHttp }
})

vi.mock('./tokenStorage', () => ({
  getToken: vi.fn(),
  setToken: vi.fn(),
  clearToken: vi.fn(),
}))

import { http } from './http'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('auth.login', () => {
  it('posts to /auth/login and returns access_token', async () => {
    vi.mocked(http.post).mockResolvedValue({ data: { access_token: 'tok' } })
    const result = await login({ email: 'a@b.com', password: '1234' })
    expect(http.post).toHaveBeenCalledWith('/auth/login', { email: 'a@b.com', password: '1234' })
    expect(result).toEqual({ access_token: 'tok' })
  })

  it('throws friendly error on 401', async () => {
    const err = Object.assign(new Error(), {
      isAxiosError: true,
      response: { status: 401, data: { message: 'Unauthorized' } },
    })
    vi.mocked(http.post).mockRejectedValue(err)
    await expect(login({ email: 'a@b.com', password: 'wrong' })).rejects.toThrow('Email ou senha inválidos.')
  })

  it('throws friendly error on 409', async () => {
    const err = Object.assign(new Error(), {
      isAxiosError: true,
      response: { status: 409, data: { message: 'Conflict' } },
    })
    vi.mocked(http.post).mockRejectedValue(err)
    await expect(login({ email: 'a@b.com', password: 'pw' })).rejects.toThrow('Este email já está cadastrado.')
  })
})

describe('auth.register', () => {
  it('posts to /auth/register and returns user', async () => {
    const user = { id: '1', name: 'Ana', email: 'ana@test.com' }
    vi.mocked(http.post).mockResolvedValue({ data: user })
    const result = await register({ name: 'Ana', email: 'ana@test.com', password: 'pass123' })
    expect(http.post).toHaveBeenCalledWith('/auth/register', { name: 'Ana', email: 'ana@test.com', password: 'pass123' })
    expect(result).toEqual(user)
  })
})

describe('auth.getMe', () => {
  it('gets /auth/me and returns user', async () => {
    const user = { id: '1', name: 'Ana', email: 'ana@test.com' }
    vi.mocked(http.get).mockResolvedValue({ data: user })
    const result = await getMe()
    expect(http.get).toHaveBeenCalledWith('/auth/me')
    expect(result).toEqual(user)
  })
})

describe('auth.logout', () => {
  it('calls clearToken', () => {
    logout()
    expect(tokenStorage.clearToken).toHaveBeenCalledOnce()
  })
})
