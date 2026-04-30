import { AuthTemplate } from '../../templates/AuthTemplate/AuthTemplate'
import { AuthBanner } from '../../organisms/AuthBanner/AuthBanner'
import { RegisterForm } from '../../organisms/RegisterForm/RegisterForm'

export function RegisterPage(): HTMLElement {
  return AuthTemplate({
    banner: AuthBanner({ imageSrc: '/banner-cadastro.png' }),
    form: RegisterForm({
      onSubmit: (data) => {
        console.log('Register attempt:', data)
      },
      onLogin: () => {
        window.location.hash = '#/login'
      },
    }),
  })
}
