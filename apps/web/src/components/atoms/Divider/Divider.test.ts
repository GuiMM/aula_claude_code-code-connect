import { describe, it, expect } from 'vitest'
import { Divider } from './Divider'

describe('Divider', () => {
  it('renders a line without label by default', () => {
    const el = Divider()
    const lines = el.querySelectorAll('.h-px')
    expect(lines.length).toBe(1)
    expect(el.querySelector('span')).toBeNull()
  })

  it('renders label and two lines when label is provided', () => {
    const el = Divider({ label: 'ou entre com outras contas' })
    expect(el.querySelector('span')?.textContent).toBe('ou entre com outras contas')
    const lines = el.querySelectorAll('.h-px')
    expect(lines.length).toBe(2)
  })
})
