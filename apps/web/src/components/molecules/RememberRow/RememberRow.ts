import { Checkbox } from '../../atoms/Checkbox/Checkbox'
import { Link } from '../../atoms/Link/Link'

export interface RememberRowProps {
  onForgotPassword?: () => void
}

export function RememberRow({ onForgotPassword }: RememberRowProps = {}): HTMLElement {
  const wrapper = document.createElement('div')
  wrapper.className = 'flex items-center justify-between'

  wrapper.appendChild(Checkbox({ label: 'Lembrar-me', name: 'remember' }))
  wrapper.appendChild(Link({
    text: 'Esqueci a senha',
    variant: 'default',
    onClick: onForgotPassword,
  }))

  return wrapper
}
