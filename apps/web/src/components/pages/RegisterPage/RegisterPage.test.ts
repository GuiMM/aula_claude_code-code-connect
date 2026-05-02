import { describe, it, expect } from 'vitest'
import { RegisterPage } from './RegisterPage'

describe('RegisterPage', () => {
  it('renders the cadastro heading', () => {
    const el = RegisterPage()
    expect(el.querySelector('h1')?.textContent).toBe('Cadastro')
  })

  it('renders the register banner', () => {
    const el = RegisterPage()
    const img = el.querySelector('img')
    expect(img?.getAttribute('src')).toBe('/banner-cadastro.webp')
  })

  it('renders the register form fields', () => {
    const el = RegisterPage()
    expect(el.querySelector('input[name="name"]')).not.toBeNull()
    expect(el.querySelector('input[name="email"]')).not.toBeNull()
    expect(el.querySelector('input[name="password"]')).not.toBeNull()
  })
})
