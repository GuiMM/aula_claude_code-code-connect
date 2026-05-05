export interface InputProps {
  name: string
  type?: 'text' | 'password' | 'email'
  placeholder?: string
  value?: string
  id?: string
}

export function Input({ name, type = 'text', placeholder, value, id }: InputProps): HTMLInputElement {
  const el = document.createElement('input')
  el.type = type
  el.name = name
  el.id = id ?? name
  el.className =
    'w-full rounded-lg bg-bg-input border border-border-subtle text-white placeholder-text-muted px-4 py-3 text-sm focus:outline-none focus:border-brand-green transition-colors'

  if (placeholder) el.placeholder = placeholder
  if (value) el.value = value

  return el
}
