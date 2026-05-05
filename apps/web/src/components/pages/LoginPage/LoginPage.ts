import { AuthTemplate } from '../../templates/AuthTemplate/AuthTemplate'
import { AuthBanner } from '../../organisms/AuthBanner/AuthBanner'
import { LoginForm } from '../../organisms/LoginForm/LoginForm'

export function LoginPage(): HTMLElement {
  return AuthTemplate({
    banner: AuthBanner({ imageSrc: '/banner.png' }),
    form: LoginForm({
      onSubmit: (data) => {
        console.log('Login attempt:', { username: data.username, remember: data.remember })
      },
      onForgotPassword: () => {
        console.log('Forgot password clicked')
      },
      onSignup: () => {
        console.log('Signup clicked')
      },
    }),
  })
}
