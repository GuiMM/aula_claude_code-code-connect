import { Icon, type IconName } from '../Icon/Icon'

export type ButtonVariant = 'primary' | 'social'

export interface ButtonProps {
  label: string
  variant?: ButtonVariant
  iconSrc?: string
  iconAfter?: IconName
  type?: 'button' | 'submit'
  onClick?: (e: MouseEvent) => void
}

export function Button({
  label,
  variant = 'primary',
  iconSrc,
  iconAfter,
  type = 'button',
  onClick,
}: ButtonProps): HTMLButtonElement {
  const el = document.createElement('button')
  el.type = type

  if (variant === 'primary') {
    el.className =
      'w-full flex items-center justify-center gap-2 rounded-lg bg-brand-green text-text-on-primary font-semibold py-3 px-6 cursor-pointer hover:brightness-110 transition-all focus-visible:outline-2 focus-visible:outline-brand-green focus-visible:outline-offset-2'
  } else {
    el.className =
      'flex flex-col items-center gap-2 rounded-lg border border-border-subtle bg-bg-input px-6 py-3 cursor-pointer hover:brightness-110 transition-all focus-visible:outline-2 focus-visible:outline-brand-green focus-visible:outline-offset-2'
  }

  if (iconSrc) {
    const img = document.createElement('img')
    img.src = iconSrc
    img.alt = ''
    img.className = 'h-6 w-6'
    el.appendChild(img)
  }

  const span = document.createElement('span')
  span.textContent = label
  el.appendChild(span)

  if (iconAfter) {
    el.appendChild(Icon({ name: iconAfter }))
  }

  if (onClick) el.addEventListener('click', onClick)

  return el
}
