export type LinkVariant = 'default' | 'accent'

export interface LinkProps {
  text: string
  href?: string
  variant?: LinkVariant
  iconAfter?: string
  onClick?: (e: MouseEvent) => void
}

export function Link({ text, href = '#', variant = 'default', iconAfter, onClick }: LinkProps): HTMLAnchorElement {
  const el = document.createElement('a')
  el.href = href

  if (variant === 'accent') {
    el.className = 'inline-flex items-center gap-1 text-sm text-brand-green hover:underline cursor-pointer'
  } else {
    el.className = 'text-sm text-text-muted hover:text-white hover:underline cursor-pointer'
  }

  if (iconAfter) {
    const labelSpan = document.createElement('span')
    labelSpan.textContent = text
    el.appendChild(labelSpan)
    const iconSpan = document.createElement('span')
    iconSpan.className = 'material-icons text-[18px]'
    iconSpan.textContent = iconAfter
    el.appendChild(iconSpan)
  } else {
    el.textContent = text
  }

  if (onClick) {
    el.addEventListener('click', (e) => {
      e.preventDefault()
      onClick(e)
    })
  }

  return el
}
