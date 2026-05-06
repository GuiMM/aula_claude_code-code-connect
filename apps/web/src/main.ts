import './style.css'
import { LoginPage } from './components/pages/LoginPage/LoginPage'
import { RegisterPage } from './components/pages/RegisterPage/RegisterPage'
import { HomePage } from './components/pages/HomePage/HomePage'
import { getToken } from './services/tokenStorage'

const root = document.querySelector<HTMLDivElement>('#app')!

function render() {
  const hash = window.location.hash || '#/login'
  const isLoggedIn = !!getToken()

  if (isLoggedIn && (hash === '#/login' || hash === '#/cadastro')) {
    window.location.hash = '#/home'
    return
  }

  if (hash === '#/cadastro') {
    root.replaceChildren(RegisterPage())
  } else if (hash === '#/home') {
    root.replaceChildren(HomePage())
  } else {
    root.replaceChildren(LoginPage())
  }
}

window.addEventListener('hashchange', render)
render()
