import { SocialButton } from '../SocialButton/SocialButton'

export interface SocialProvider {
  label: string
  iconSrc: string
  onClick?: () => void
}

export interface SocialLoginsProps {
  providers: SocialProvider[]
}

export function SocialLogins({ providers }: SocialLoginsProps): HTMLElement {
  const wrapper = document.createElement('div')
  wrapper.className = 'flex items-center justify-center gap-4'

  for (const provider of providers) {
    wrapper.appendChild(SocialButton(provider))
  }

  return wrapper
}
