import { describe, it, expect, vi } from 'vitest'
import { PublishForm } from './PublishForm'

const flush = () => new Promise((r) => setTimeout(r, 0))

describe('PublishForm', () => {
  it('renders heading, subtitle and all 4 fields', () => {
    const el = PublishForm()
    expect(el.querySelector('h1')?.textContent).toBe('Publicar')
    expect(el.querySelector('input[name="title"]')).not.toBeNull()
    expect(el.querySelector('input[name="description"]')).not.toBeNull()
    expect(el.querySelector('textarea[name="content"]')).not.toBeNull()
    expect(el.querySelector('input[name="thumbnailUrl"]')).not.toBeNull()
  })

  it('renders a submit button', () => {
    const el = PublishForm()
    expect(el.querySelector('button[type="submit"]')).not.toBeNull()
  })

  it('calls onSubmit with form data when submitted', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const form = PublishForm({ onSubmit }) as HTMLFormElement

    const titleInput = form.querySelector<HTMLInputElement>('input[name="title"]')!
    const descriptionInput = form.querySelector<HTMLInputElement>('input[name="description"]')!
    const contentTextarea = form.querySelector<HTMLTextAreaElement>('textarea[name="content"]')!
    const thumbnailInput = form.querySelector<HTMLInputElement>('input[name="thumbnailUrl"]')!

    titleInput.value = 'Meu Post'
    descriptionInput.value = 'Uma descrição'
    contentTextarea.value = 'Conteúdo do post'
    thumbnailInput.value = 'https://example.com/img.png'

    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    await flush()

    expect(onSubmit).toHaveBeenCalledWith({
      title: 'Meu Post',
      description: 'Uma descrição',
      content: 'Conteúdo do post',
      thumbnailUrl: 'https://example.com/img.png',
    })
  })

  it('shows error message when onSubmit rejects', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('Título muito curto.'))
    const form = PublishForm({ onSubmit }) as HTMLFormElement

    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    await flush()

    const errorEl = form.querySelector('[data-error]')!
    expect(errorEl.textContent).toBe('Título muito curto.')
    expect(errorEl.classList.contains('hidden')).toBe(false)
  })

  it('disables submit button during submission and re-enables after', async () => {
    let resolve!: () => void
    const onSubmit = vi.fn().mockReturnValue(new Promise<void>((r) => { resolve = r }))
    const form = PublishForm({ onSubmit }) as HTMLFormElement
    const btn = form.querySelector<HTMLButtonElement>('button[type="submit"]')!

    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    await flush()
    expect(btn.disabled).toBe(true)

    resolve()
    await flush()
    expect(btn.disabled).toBe(false)
  })

  it('prevents default form submission', () => {
    const form = PublishForm() as HTMLFormElement
    const event = new Event('submit', { bubbles: true, cancelable: true })
    form.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(true)
  })
})
