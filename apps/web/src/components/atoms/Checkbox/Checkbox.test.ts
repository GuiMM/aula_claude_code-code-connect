import { describe, it, expect, vi } from 'vitest'
import { Checkbox } from './Checkbox'

describe('Checkbox', () => {
  it('renders checkbox and label', () => {
    const el = Checkbox({ label: 'Lembrar-me', name: 'remember' })
    const input = el.querySelector('input[type="checkbox"]') as HTMLInputElement
    const label = el.querySelector('label')
    expect(input).not.toBeNull()
    expect(label?.textContent).toBe('Lembrar-me')
  })

  it('renders unchecked by default', () => {
    const el = Checkbox({ label: 'Lembrar-me', name: 'remember' })
    const input = el.querySelector('input') as HTMLInputElement
    expect(input.checked).toBe(false)
  })

  it('renders checked when checked prop is true', () => {
    const el = Checkbox({ label: 'Lembrar-me', name: 'remember', checked: true })
    const input = el.querySelector('input') as HTMLInputElement
    expect(input.checked).toBe(true)
  })

  it('calls onChange when toggled', () => {
    const onChange = vi.fn()
    const el = Checkbox({ label: 'Lembrar-me', name: 'remember', onChange })
    const input = el.querySelector('input') as HTMLInputElement
    input.checked = true
    input.dispatchEvent(new Event('change'))
    expect(onChange).toHaveBeenCalledWith(true)
  })
})
