export interface TextAreaProps {
  name: string
  placeholder?: string
  value?: string
  id?: string
  rows?: number
}

export function TextArea({ name, placeholder, value, id, rows = 5 }: TextAreaProps): HTMLTextAreaElement {
  const el = document.createElement('textarea')
  el.name = name
  el.id = id ?? name
  el.rows = rows
  el.className =
    'w-full rounded-lg bg-bg-input border border-border-subtle text-white placeholder-text-muted px-4 py-3 text-sm focus:outline-none focus:border-brand-green transition-colors resize-none'

  if (placeholder) el.placeholder = placeholder
  if (value) el.value = value

  return el
}
