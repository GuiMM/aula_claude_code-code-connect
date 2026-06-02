import { describe, it, expect } from 'vitest'
import { FormTextArea } from './FormTextArea'

describe('FormTextArea', () => {
  it('renders label and textarea', () => {
    const el = FormTextArea({ label: 'Conteúdo', name: 'content' })
    expect(el.querySelector('label')?.textContent).toBe('Conteúdo')
    expect(el.querySelector('textarea')).not.toBeNull()
  })

  it('associates label with textarea via id', () => {
    const el = FormTextArea({ label: 'Conteúdo', name: 'content' })
    const label = el.querySelector('label') as HTMLLabelElement
    const textarea = el.querySelector('textarea') as HTMLTextAreaElement
    expect(label.htmlFor).toBe(textarea.id)
  })

  it('sets name on textarea', () => {
    const el = FormTextArea({ label: 'Conteúdo', name: 'content' })
    const textarea = el.querySelector('textarea') as HTMLTextAreaElement
    expect(textarea.name).toBe('content')
  })

  it('passes placeholder to textarea', () => {
    const el = FormTextArea({ label: 'Conteúdo', name: 'content', placeholder: 'Escreva...' })
    const textarea = el.querySelector('textarea') as HTMLTextAreaElement
    expect(textarea.placeholder).toBe('Escreva...')
  })
})
