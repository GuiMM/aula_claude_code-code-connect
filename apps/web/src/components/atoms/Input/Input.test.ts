import { describe, it, expect } from 'vitest'
import { Input } from './Input'

describe('Input', () => {
  it('renders with correct type and name', () => {
    const input = Input({ name: 'username' })
    expect(input.tagName).toBe('INPUT')
    expect(input.type).toBe('text')
    expect(input.name).toBe('username')
  })

  it('renders password type when specified', () => {
    const input = Input({ name: 'password', type: 'password' })
    expect(input.type).toBe('password')
  })

  it('sets placeholder when provided', () => {
    const input = Input({ name: 'user', placeholder: 'usuario123' })
    expect(input.placeholder).toBe('usuario123')
  })

  it('sets initial value when provided', () => {
    const input = Input({ name: 'user', value: 'admin' })
    expect(input.value).toBe('admin')
  })

  it('uses name as id by default', () => {
    const input = Input({ name: 'email' })
    expect(input.id).toBe('email')
  })

  it('uses custom id when provided', () => {
    const input = Input({ name: 'email', id: 'login-email' })
    expect(input.id).toBe('login-email')
  })
})
