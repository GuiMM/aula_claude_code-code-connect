import { describe, it, expect } from 'vitest'
import { FormField } from './FormField'

describe('FormField', () => {
  it('renders label and input', () => {
    const el = FormField({ label: 'Email ou usuário', name: 'username' })
    expect(el.querySelector('label')?.textContent).toBe('Email ou usuário')
    expect(el.querySelector('input')).not.toBeNull()
  })

  it('associates label with input via id', () => {
    const el = FormField({ label: 'Senha', name: 'password', type: 'password' })
    const label = el.querySelector('label') as HTMLLabelElement
    const input = el.querySelector('input') as HTMLInputElement
    expect(label.htmlFor).toBe(input.id)
  })

  it('passes type to input', () => {
    const el = FormField({ label: 'Senha', name: 'password', type: 'password' })
    const input = el.querySelector('input') as HTMLInputElement
    expect(input.type).toBe('password')
  })

  it('passes placeholder to input', () => {
    const el = FormField({ label: 'Email', name: 'email', placeholder: 'usuario@exemplo.com' })
    const input = el.querySelector('input') as HTMLInputElement
    expect(input.placeholder).toBe('usuario@exemplo.com')
  })
})
