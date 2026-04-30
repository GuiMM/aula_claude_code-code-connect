import { describe, it, expect } from 'vitest'
import { Label } from './Label'

describe('Label', () => {
  it('renders with correct text and htmlFor', () => {
    const label = Label({ text: 'Email ou usuário', htmlFor: 'username' })
    expect(label.tagName).toBe('LABEL')
    expect(label.textContent).toBe('Email ou usuário')
    expect(label.htmlFor).toBe('username')
  })

  it('applies text styling', () => {
    const label = Label({ text: 'Senha', htmlFor: 'password' })
    expect(label.className).toContain('text-text-emphasis')
  })
})
