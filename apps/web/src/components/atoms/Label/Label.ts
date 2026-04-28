export interface LabelProps {
  text: string
  htmlFor: string
}

export function Label({ text, htmlFor }: LabelProps): HTMLLabelElement {
  const el = document.createElement('label')
  el.htmlFor = htmlFor
  el.textContent = text
  el.className = 'text-sm font-medium text-white'
  return el
}
