import { describe, it, expect } from 'vitest'
import { LoginPage } from './LoginPage'

describe('LoginPage', () => {
  it('renders the full login page structure', () => {
    const page = LoginPage()
    expect(page.className).toContain('bg-bg-page')
    expect(page.querySelector('h1')?.textContent).toBe('Login')
    expect(page.querySelector('img[alt="code connect"]')).not.toBeNull()
    expect(page.querySelector('form')).not.toBeNull()
  })

  it('renders social login buttons', () => {
    const page = LoginPage()
    const imgs = page.querySelectorAll('img')
    const srcs = Array.from(imgs).map((img) => img.getAttribute('src') ?? '')
    expect(srcs).toContain('/github_logo.png')
    expect(srcs).toContain('/gmail.png')
  })

  it('renders signup prompt', () => {
    const page = LoginPage()
    expect(page.textContent).toContain('Ainda não tem conta?')
    expect(page.textContent).toContain('Crie seu cadastro!')
  })
})
