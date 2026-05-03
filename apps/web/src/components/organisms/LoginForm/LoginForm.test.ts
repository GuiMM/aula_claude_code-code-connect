import { describe, it, expect, vi } from 'vitest'
import { LoginForm } from './LoginForm'

const flush = () => new Promise((r) => setTimeout(r, 0))

describe('LoginForm', () => {
  it('renders heading, fields, button, divider, social logins and footer prompt', () => {
    const el = LoginForm()
    expect(el.querySelector('h1')?.textContent).toBe('Login')
    expect(el.querySelectorAll('input[type="email"], input[type="password"]').length).toBe(2)
    expect(el.querySelector('button[type="submit"]')).not.toBeNull()
    expect(el.querySelector('a')?.textContent).toContain('Esqueci a senha')
  })

  it('calls onSubmit with form data when submitted', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const form = LoginForm({ onSubmit }) as HTMLFormElement

    const emailInput = form.querySelector<HTMLInputElement>('input[name="email"]')!
    const passwordInput = form.querySelector<HTMLInputElement>('input[name="password"]')!
    emailInput.value = 'user@test.com'
    passwordInput.value = 'secret'

    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    await flush()

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'user@test.com', password: 'secret' }),
    )
  })

  it('prevents default form submission', () => {
    const form = LoginForm() as HTMLFormElement
    const event = new Event('submit', { bubbles: true, cancelable: true })
    form.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(true)
  })

  it('shows error message when onSubmit rejects', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('Email ou senha inválidos.'))
    const form = LoginForm({ onSubmit }) as HTMLFormElement

    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    await flush()

    const errorEl = form.querySelector('[data-error]')!
    expect(errorEl.textContent).toBe('Email ou senha inválidos.')
    expect(errorEl.classList.contains('hidden')).toBe(false)
  })

  it('disables submit button during submission and re-enables after', async () => {
    let resolve!: () => void
    const onSubmit = vi.fn().mockReturnValue(new Promise<void>((r) => { resolve = r }))
    const form = LoginForm({ onSubmit }) as HTMLFormElement
    const btn = form.querySelector<HTMLButtonElement>('button[type="submit"]')!

    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    await flush()
    expect(btn.disabled).toBe(true)

    resolve()
    await flush()
    expect(btn.disabled).toBe(false)
  })

  it('renders github and gmail social buttons', () => {
    const el = LoginForm()
    const srcs = Array.from(el.querySelectorAll('img')).map((img) => img.getAttribute('src') ?? '')
    expect(srcs).toContain('/github_logo.png')
    expect(srcs).toContain('/gmail.png')
  })
})
