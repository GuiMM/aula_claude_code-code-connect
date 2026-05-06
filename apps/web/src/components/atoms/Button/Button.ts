import { cva, type VariantProps } from 'class-variance-authority'
import { Icon, type IconName } from '../Icon/Icon'

const buttonVariants = cva(
  'flex items-center justify-center gap-2 rounded-lg cursor-pointer hover:brightness-110 transition-all focus-visible:outline-2 focus-visible:outline-brand-green focus-visible:outline-offset-2',
  {
    variants: {
      variant: {
        primary: 'w-full bg-brand-green text-text-on-primary font-semibold py-3 px-6',
        social: 'flex-col border border-border-subtle bg-bg-input px-6 py-3',
      },
    },
    defaultVariants: { variant: 'primary' },
  }
)

export interface ButtonProps extends VariantProps<typeof buttonVariants> {
  label: string
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
  el.className = buttonVariants({ variant })

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
