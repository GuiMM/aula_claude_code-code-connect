import { describe, it, expect } from 'vitest'
import { TextArea } from './TextArea'

describe('TextArea', () => {
  it('renders a textarea element', () => {
    const el = TextArea({ name: 'content' })
    expect(el.tagName).toBe('TEXTAREA')
  })

  it('sets name attribute', () => {
    const el = TextArea({ name: 'content' })
    expect(el.name).toBe('content')
  })

  it('uses name as id by default', () => {
    const el = TextArea({ name: 'content' })
    expect(el.id).toBe('content')
  })

  it('uses custom id when provided', () => {
    const el = TextArea({ name: 'content', id: 'post-content' })
    expect(el.id).toBe('post-content')
  })

  it('sets placeholder when provided', () => {
    const el = TextArea({ name: 'content', placeholder: 'Escreva aqui...' })
    expect(el.placeholder).toBe('Escreva aqui...')
  })

  it('sets initial value when provided', () => {
    const el = TextArea({ name: 'content', value: 'hello' })
    expect(el.value).toBe('hello')
  })

  it('uses default rows when not provided', () => {
    const el = TextArea({ name: 'content' })
    expect(Number(el.rows)).toBe(5)
  })

  it('uses custom rows when provided', () => {
    const el = TextArea({ name: 'content', rows: 10 })
    expect(Number(el.rows)).toBe(10)
  })
})
