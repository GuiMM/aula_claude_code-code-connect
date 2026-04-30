import { describe, it, expect, vi } from 'vitest'
import { RegisterForm } from './RegisterForm'

describe('RegisterForm', () => {
  it('renders heading, subtitle, fields, checkbox, button, divider, social logins and footer prompt', () => {
    const el = RegisterForm()
    expect(el.querySelector('h1')?.textContent).toBe('Cadastro')
    expect(el.querySelector('p')?.textContent).toBe('Olá! Preencha seus dados.')
    expect(el.querySelectorAll('input[type="text"], input[type="email"], input[type="password"]').length).toBe(3)
    expect(el.querySelector('input[type="checkbox"]')).not.toBeNull()
    expect(el.querySelector('button[type="submit"]')).not.toBeNull()
    expect(el.textContent).toContain('Já tem conta?')
  })

  it('calls onSubmit with form data when submitted', () => {
    const onSubmit = vi.fn()
    const form = RegisterForm({ onSubmit }) as HTMLFormElement

    const nameInput = form.querySelector<HTMLInputElement>('input[name="name"]')!
    const emailInput = form.querySelector<HTMLInputElement>('input[name="email"]')!
    const passwordInput = form.querySelector<HTMLInputElement>('input[name="password"]')!
    nameInput.value = 'Maria Silva'
    emailInput.value = 'maria@example.com'
    passwordInput.value = 'secret123'

    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Maria Silva', email: 'maria@example.com', password: 'secret123' }),
    )
  })

  it('prevents default form submission', () => {
    const form = RegisterForm() as HTMLFormElement
    const event = new Event('submit', { bubbles: true, cancelable: true })
    form.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(true)
  })

  it('calls onLogin when footer link is clicked', () => {
    const onLogin = vi.fn()
    const el = RegisterForm({ onLogin })
    const links = el.querySelectorAll('a')
    const loginLink = Array.from(links).find((a) => a.textContent?.includes('Faça seu login'))!
    loginLink.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
    expect(onLogin).toHaveBeenCalledOnce()
  })

  it('renders github and gmail social buttons', () => {
    const el = RegisterForm()
    const srcs = Array.from(el.querySelectorAll('img')).map((img) => img.getAttribute('src') ?? '')
    expect(srcs).toContain('/github_logo.png')
    expect(srcs).toContain('/gmail.png')
  })
})
