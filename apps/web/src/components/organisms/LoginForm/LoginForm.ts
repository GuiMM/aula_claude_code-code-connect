import { Heading } from '../../atoms/Heading/Heading'
import { Button } from '../../atoms/Button/Button'
import { Divider } from '../../atoms/Divider/Divider'
import { FormField } from '../../molecules/FormField/FormField'
import { RememberRow } from '../../molecules/RememberRow/RememberRow'
import { SocialLogins } from '../../molecules/SocialLogins/SocialLogins'
import { AuthFooterPrompt } from '../../molecules/AuthFooterPrompt/AuthFooterPrompt'

export interface LoginFormData {
  username: string
  password: string
  remember: boolean
}

export interface LoginFormProps {
  onSubmit?: (data: LoginFormData) => void
  onForgotPassword?: () => void
  onSignup?: () => void
}

export function LoginForm({ onSubmit, onForgotPassword, onSignup }: LoginFormProps = {}): HTMLElement {
  const form = document.createElement('form')
  form.className = 'flex flex-col gap-6 w-full'
  form.noValidate = true

  const header = document.createElement('div')
  header.className = 'flex flex-col gap-6'
  header.appendChild(Heading({ text: 'Login', level: 1 }))
  const subtitle = document.createElement('p')
  subtitle.textContent = 'Boas-vindas! Faça seu login.'
  subtitle.className = 'text-2xl text-text-primary'
  header.appendChild(subtitle)

  const fields = document.createElement('div')
  fields.className = 'flex flex-col gap-4'
  fields.appendChild(FormField({ label: 'Email ou usuário', name: 'username', placeholder: 'usuario123' }))
  fields.appendChild(FormField({ label: 'Senha', name: 'password', type: 'password', placeholder: '••••••' }))

  const submitBtn = Button({ label: 'Login', iconAfter: 'arrow_forward', type: 'submit', variant: 'primary' })

  form.appendChild(header)
  form.appendChild(fields)
  form.appendChild(RememberRow({ onForgotPassword }))
  form.appendChild(submitBtn)
  form.appendChild(Divider({ label: 'ou entre com outras contas' }))
  form.appendChild(
    SocialLogins({
      providers: [
        { label: 'Github', iconSrc: '/github_logo.png' },
        { label: 'Gmail', iconSrc: '/gmail.png' },
      ],
    }),
  )
  form.appendChild(
    AuthFooterPrompt({
      text: 'Ainda não tem conta?',
      linkText: 'Crie seu cadastro!',
      onLinkClick: onSignup,
    }),
  )

  form.addEventListener('submit', (e) => {
    e.preventDefault()
    const data = new FormData(form)
    onSubmit?.({
      username: (data.get('username') as string) ?? '',
      password: (data.get('password') as string) ?? '',
      remember: data.get('remember') === 'on',
    })
  })

  return form
}
