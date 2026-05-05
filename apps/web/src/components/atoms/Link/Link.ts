export type LinkVariant = 'default' | 'accent'

export interface LinkProps {
  text: string
  href?: string
  variant?: LinkVariant
  onClick?: (e: MouseEvent) => void
}

export function Link({ text, href = '#', variant = 'default', onClick }: LinkProps): HTMLAnchorElement {
  const el = document.createElement('a')
  el.href = href
  el.textContent = text

  if (variant === 'accent') {
    el.className = 'text-sm text-brand-green hover:underline cursor-pointer'
  } else {
    el.className = 'text-sm text-text-muted hover:text-white hover:underline cursor-pointer'
  }

  if (onClick) {
    el.addEventListener('click', (e) => {
      e.preventDefault()
      onClick(e)
    })
  }

  return el
}
