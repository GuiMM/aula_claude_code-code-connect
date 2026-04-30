import { describe, it, expect, vi } from 'vitest'
import { LoginForm } from './LoginForm'

describe('LoginForm', () => {
  it('renders heading, fields, button, divider, social logins and footer prompt', () => {
    const el = LoginForm()
    expect(el.querySelector('h1')?.textContent).toBe('Login')
    expect(el.querySelectorAll('input[type="text"], input[type="password"]').length).toBe(2)
    expect(el.querySelector('button[type="submit"]')).not.toBeNull()
    expect(el.querySelector('a')?.textContent).toContain('Esqueci a senha')
  })

  it('calls onSubmit with form data when submitted', () => {
    const onSubmit = vi.fn()
    const form = LoginForm({ onSubmit }) as HTMLFormElement

    const usernameInput = form.querySelector<HTMLInputElement>('input[name="username"]')!
    const passwordInput = form.querySelector<HTMLInputElement>('input[name="password"]')!
    usernameInput.value = 'admin'
    passwordInput.value = 'secret'

    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ username: 'admin', password: 'secret' }),
    )
  })

  it('prevents default form submission', () => {
    const form = LoginForm() as HTMLFormElement
    const event = new Event('submit', { bubbles: true, cancelable: true })
    form.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(true)
  })

  it('renders github and gmail social buttons', () => {
    const el = LoginForm()
    const imgs = el.querySelectorAll('img')
    const srcs = Array.from(imgs).map((img) => img.getAttribute('src') ?? '')
    expect(srcs).toContain('/github_logo.png')
    expect(srcs).toContain('/gmail.png')
  })
})
