import './style.css'
import { LoginPage } from './components/pages/LoginPage/LoginPage'
import { RegisterPage } from './components/pages/RegisterPage/RegisterPage'

const root = document.querySelector<HTMLDivElement>('#app')!

function render() {
  const route = window.location.hash || '#/login'
  root.replaceChildren(route === '#/cadastro' ? RegisterPage() : LoginPage())
}

window.addEventListener('hashchange', render)
render()
