import { AuthTemplate } from '../../templates/AuthTemplate/AuthTemplate'
import { AuthBanner } from '../../organisms/AuthBanner/AuthBanner'
import { RegisterForm } from '../../organisms/RegisterForm/RegisterForm'
import { register, login } from '../../../services/auth'
import { setToken } from '../../../services/tokenStorage'

export function RegisterPage(): HTMLElement {
  return AuthTemplate({
    banner: AuthBanner({ imageSrc: '/banner-cadastro.webp' }),
    form: RegisterForm({
      onSubmit: async (data) => {
        await register({ name: data.name, email: data.email, password: data.password })
        const { access_token } = await login({ email: data.email, password: data.password })
        setToken(access_token, data.remember)
        window.location.hash = '#/home'
      },
      onLogin: () => {
        window.location.hash = '#/login'
      },
    }),
  })
}
