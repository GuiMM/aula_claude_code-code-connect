export interface DividerProps {
  label?: string
}

export function Divider({ label }: DividerProps = {}): HTMLElement {
  const wrapper = document.createElement('div')
  wrapper.className = 'flex items-center gap-3 my-2'

  const lineLeft = document.createElement('div')
  lineLeft.className = 'flex-1 h-px bg-border-subtle'

  wrapper.appendChild(lineLeft)

  if (label) {
    const span = document.createElement('span')
    span.textContent = label
    span.className = 'text-xs text-text-muted whitespace-nowrap'
    wrapper.appendChild(span)

    const lineRight = document.createElement('div')
    lineRight.className = 'flex-1 h-px bg-border-subtle'
    wrapper.appendChild(lineRight)
  }

  return wrapper
}
