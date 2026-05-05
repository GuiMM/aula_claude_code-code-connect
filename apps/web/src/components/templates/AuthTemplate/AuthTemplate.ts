import { PageBackground } from '../../organisms/PageBackground/PageBackground'

export interface AuthTemplateProps {
  banner: HTMLElement
  form: HTMLElement
}

export function AuthTemplate({ banner, form }: AuthTemplateProps): HTMLElement {
  const bg = PageBackground()

  const card = document.createElement('div')
  card.className =
    'grid grid-cols-1 md:grid-cols-2 w-full max-w-4xl rounded-2xl overflow-hidden bg-bg-card shadow-2xl'

  const formWrapper = document.createElement('div')
  formWrapper.className = 'flex flex-col justify-center px-10 py-12'
  formWrapper.appendChild(form)

  card.appendChild(banner)
  card.appendChild(formWrapper)
  bg.appendChild(card)

  return bg
}
