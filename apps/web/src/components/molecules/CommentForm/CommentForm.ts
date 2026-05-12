export interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>
  disabled?: boolean
  disabledMessage?: string
}

export function CommentForm({ onSubmit, disabled = false, disabledMessage }: CommentFormProps): HTMLElement {
  const wrapper = document.createElement('div')
  wrapper.className = 'flex flex-col gap-2'

  if (disabled && disabledMessage) {
    const notice = document.createElement('p')
    notice.className = 'text-sm text-text-muted text-center py-3 bg-bg-input rounded-lg'
    notice.textContent = disabledMessage
    wrapper.appendChild(notice)
    return wrapper
  }

  const textarea = document.createElement('textarea')
  textarea.placeholder = 'Escreva um comentário...'
  textarea.rows = 3
  textarea.className =
    'w-full bg-bg-input border border-border-subtle rounded-lg px-3 py-2 text-sm text-white placeholder-text-muted resize-none focus:outline-none focus:border-brand-green transition-colors'
  textarea.setAttribute('aria-label', 'Escreva um comentário')
  wrapper.appendChild(textarea)

  const footer = document.createElement('div')
  footer.className = 'flex justify-end'

  const btn = document.createElement('button')
  btn.type = 'button'
  btn.textContent = 'Comentar'
  btn.className =
    'rounded-lg bg-brand-green text-text-on-primary font-semibold px-4 py-2 text-sm cursor-pointer hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed'

  let submitting = false
  btn.addEventListener('click', async () => {
    const value = textarea.value.trim()
    if (!value || submitting) return
    submitting = true
    btn.disabled = true
    btn.textContent = 'Enviando...'
    try {
      await onSubmit(value)
      textarea.value = ''
    } finally {
      submitting = false
      btn.disabled = false
      btn.textContent = 'Comentar'
    }
  })

  footer.appendChild(btn)
  wrapper.appendChild(footer)
  return wrapper
}
