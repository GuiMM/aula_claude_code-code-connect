import { cva, type VariantProps } from 'class-variance-authority'
import { Icon, type IconName } from '../Icon/Icon'

const linkVariants = cva('cursor-pointer', {
  variants: {
    variant: {
      default: 'text-sm text-text-muted hover:text-text-emphasis hover:underline',
      accent: 'inline-flex items-center gap-1 text-sm text-brand-green underline underline-offset-2 hover:brightness-110',
    },
  },
  defaultVariants: { variant: 'default' },
})

export interface LinkProps extends VariantProps<typeof linkVariants> {
  text: string
  href?: string
  iconAfter?: IconName
  onClick?: (e: MouseEvent) => void
}

export function Link({ text, href = '#', variant = 'default', iconAfter, onClick }: LinkProps): HTMLAnchorElement {
  const el = document.createElement('a')
  el.href = href
  el.className = linkVariants({ variant })

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
