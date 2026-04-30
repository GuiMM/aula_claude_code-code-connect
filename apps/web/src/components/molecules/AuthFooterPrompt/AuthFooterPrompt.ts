import { Link } from '../../atoms/Link/Link'

export interface AuthFooterPromptProps {
  text: string
  linkText: string
  linkIcon?: string
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
