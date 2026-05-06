import { describe, it, expect, beforeEach } from 'vitest'
import { setToken, getToken, clearToken } from './tokenStorage'

const TOKEN_KEY = 'code-connect:token'

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
})

describe('tokenStorage', () => {
  it('setToken persistent=true saves to localStorage', () => {
    setToken('abc123', true)
    expect(localStorage.getItem(TOKEN_KEY)).toBe('abc123')
    expect(sessionStorage.getItem(TOKEN_KEY)).toBeNull()
  })

  it('setToken persistent=false saves to sessionStorage', () => {
    setToken('abc123', false)
    expect(sessionStorage.getItem(TOKEN_KEY)).toBe('abc123')
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull()
  })

  it('getToken returns localStorage token first', () => {
    localStorage.setItem(TOKEN_KEY, 'from-local')
    sessionStorage.setItem(TOKEN_KEY, 'from-session')
    expect(getToken()).toBe('from-local')
  })

  it('getToken returns sessionStorage token when localStorage is empty', () => {
    sessionStorage.setItem(TOKEN_KEY, 'from-session')
    expect(getToken()).toBe('from-session')
  })

  it('getToken returns null when no token is stored', () => {
    expect(getToken()).toBeNull()
  })

  it('clearToken removes token from both storages', () => {
    localStorage.setItem(TOKEN_KEY, 'local')
    sessionStorage.setItem(TOKEN_KEY, 'session')
    clearToken()
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull()
    expect(sessionStorage.getItem(TOKEN_KEY)).toBeNull()
  })

  it('setToken persistent=true removes previous sessionStorage token', () => {
    sessionStorage.setItem(TOKEN_KEY, 'old-session')
    setToken('new-local', true)
    expect(sessionStorage.getItem(TOKEN_KEY)).toBeNull()
    expect(localStorage.getItem(TOKEN_KEY)).toBe('new-local')
  })
})
