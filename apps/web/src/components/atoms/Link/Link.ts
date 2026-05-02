import { Icon, type IconName } from '../Icon/Icon'

export type LinkVariant = 'default' | 'accent'

export interface LinkProps {
  text: string
  href?: string
  variant?: LinkVariant
  iconAfter?: IconName
  onClick?: (e: MouseEvent) => void
}

export function Link({ text, href = '#', variant = 'default', iconAfter, onClick }: LinkProps): HTMLAnchorElement {
  const el = document.createElement('a')
  el.href = href

  if (variant === 'accent') {
    el.className =
      'inline-flex items-center gap-1 text-sm text-brand-green underline underline-offset-2 hover:brightness-110 cursor-pointer'
  } else {
    el.className = 'text-sm text-text-muted hover:text-text-emphasis hover:underline cursor-pointer'
  }

  if (iconAfter) {
    const labelSpan = document.createElement('span')
    labelSpan.textContent = text
    el.appendChild(labelSpan)
    el.appendChild(Icon({ name: iconAfter }))
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
