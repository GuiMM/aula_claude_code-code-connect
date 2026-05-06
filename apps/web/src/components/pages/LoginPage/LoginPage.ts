import { AuthTemplate } from '../../templates/AuthTemplate/AuthTemplate'
import { AuthBanner } from '../../organisms/AuthBanner/AuthBanner'
import { LoginForm } from '../../organisms/LoginForm/LoginForm'
import { login } from '../../../services/auth'
import { setToken } from '../../../services/tokenStorage'

export function LoginPage(): HTMLElement {
  return AuthTemplate({
    banner: AuthBanner({ imageSrc: '/banner.webp' }),
    form: LoginForm({
      onSubmit: async (data) => {
        const { access_token } = await login({ email: data.email, password: data.password })
        setToken(access_token, data.remember)
        window.location.hash = '#/home'
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
