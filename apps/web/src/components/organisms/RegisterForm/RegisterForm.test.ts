import { describe, it, expect, vi } from 'vitest'
import { RegisterForm } from './RegisterForm'

const flush = () => new Promise((r) => setTimeout(r, 0))

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

  it('calls onSubmit with form data when submitted', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const form = RegisterForm({ onSubmit }) as HTMLFormElement

    const nameInput = form.querySelector<HTMLInputElement>('input[name="name"]')!
    const emailInput = form.querySelector<HTMLInputElement>('input[name="email"]')!
    const passwordInput = form.querySelector<HTMLInputElement>('input[name="password"]')!
    nameInput.value = 'Maria Silva'
    emailInput.value = 'maria@example.com'
    passwordInput.value = 'secret123'

    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    await flush()

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

  it('shows error message when onSubmit rejects', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('Este email já está cadastrado.'))
    const form = RegisterForm({ onSubmit }) as HTMLFormElement

    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    await flush()

    const errorEl = form.querySelector('[data-error]')!
    expect(errorEl.textContent).toBe('Este email já está cadastrado.')
    expect(errorEl.classList.contains('hidden')).toBe(false)
  })

  it('disables submit button during submission and re-enables after', async () => {
    let resolve!: () => void
    const onSubmit = vi.fn().mockReturnValue(new Promise<void>((r) => { resolve = r }))
    const form = RegisterForm({ onSubmit }) as HTMLFormElement
    const btn = form.querySelector<HTMLButtonElement>('button[type="submit"]')!

    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    await flush()
    expect(btn.disabled).toBe(true)

    resolve()
    await flush()
    expect(btn.disabled).toBe(false)
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
