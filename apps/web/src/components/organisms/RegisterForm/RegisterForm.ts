import { Heading } from '../../atoms/Heading/Heading'
import { Button } from '../../atoms/Button/Button'
import { Checkbox } from '../../atoms/Checkbox/Checkbox'
import { Divider } from '../../atoms/Divider/Divider'
import { FormField } from '../../molecules/FormField/FormField'
import { SocialLogins } from '../../molecules/SocialLogins/SocialLogins'
import { AuthFooterPrompt } from '../../molecules/AuthFooterPrompt/AuthFooterPrompt'

export interface RegisterFormData {
  name: string
  email: string
  password: string
  remember: boolean
}

export interface RegisterFormProps {
  onSubmit?: (data: RegisterFormData) => void
  onLogin?: () => void
}

export function RegisterForm({ onSubmit, onLogin }: RegisterFormProps = {}): HTMLElement {
  const form = document.createElement('form')
  form.className = 'flex flex-col gap-6 w-full'
  form.noValidate = true

  const header = document.createElement('div')
  header.className = 'flex flex-col gap-6'
  header.appendChild(Heading({ text: 'Cadastro', level: 1 }))
  const subtitle = document.createElement('p')
  subtitle.textContent = 'Olá! Preencha seus dados.'
  subtitle.className = 'text-2xl text-text-primary'
  header.appendChild(subtitle)

  const fields = document.createElement('div')
  fields.className = 'flex flex-col gap-4'
  fields.appendChild(FormField({ label: 'Nome', name: 'name', placeholder: 'Nome completo' }))
  fields.appendChild(FormField({ label: 'Email', name: 'email', type: 'email', placeholder: 'Digite seu email' }))
  fields.appendChild(FormField({ label: 'Senha', name: 'password', type: 'password', placeholder: '••••••' }))

  form.appendChild(header)
  form.appendChild(fields)
  form.appendChild(Checkbox({ label: 'Lembrar-me', name: 'remember' }))
  form.appendChild(Button({ label: 'Cadastrar', iconAfter: 'arrow_forward', type: 'submit', variant: 'primary' }))
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
      text: 'Já tem conta?',
      linkText: 'Faça seu login!',
      linkIcon: 'login',
      onLinkClick: onLogin,
    }),
  )

  form.addEventListener('submit', (e) => {
    e.preventDefault()
    const data = new FormData(form)
    onSubmit?.({
      name: (data.get('name') as string) ?? '',
      email: (data.get('email') as string) ?? '',
      password: (data.get('password') as string) ?? '',
      remember: data.get('remember') === 'on',
    })
  })

  return form
}
