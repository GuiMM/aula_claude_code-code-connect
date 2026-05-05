import { Link } from '../../atoms/Link/Link'

export interface AuthFooterPromptProps {
  text: string
  linkText: string
  onLinkClick?: () => void
}

export function AuthFooterPrompt({ text, linkText, onLinkClick }: AuthFooterPromptProps): HTMLElement {
  const wrapper = document.createElement('p')
  wrapper.className = 'text-sm text-text-muted text-center'

  const textNode = document.createTextNode(text + ' ')
  wrapper.appendChild(textNode)

  wrapper.appendChild(Link({ text: linkText, variant: 'accent', onClick: onLinkClick }))

  return wrapper
}
