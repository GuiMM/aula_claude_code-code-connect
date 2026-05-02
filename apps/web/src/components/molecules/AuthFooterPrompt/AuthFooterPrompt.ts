import { Link } from '../../atoms/Link/Link'
import type { IconName } from '../../atoms/Icon/Icon'

export interface AuthFooterPromptProps {
  text: string
  linkText: string
  linkIcon?: IconName
  onLinkClick?: () => void
}

export function AuthFooterPrompt({ text, linkText, linkIcon, onLinkClick }: AuthFooterPromptProps): HTMLElement {
  const wrapper = document.createElement('p')
  wrapper.className = 'text-lg text-text-primary text-center'

  const textNode = document.createTextNode(text + ' ')
  wrapper.appendChild(textNode)

  wrapper.appendChild(Link({ text: linkText, variant: 'accent', iconAfter: linkIcon, onClick: onLinkClick }))

  return wrapper
}
