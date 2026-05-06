import { getMe, logout } from '../../../services/auth'
import { Button } from '../../atoms/Button/Button'

export function HomePage(): HTMLElement {
  const page = document.createElement('div')
  page.className = 'min-h-screen bg-page text-text-primary flex flex-col items-center justify-center gap-6'

  const greeting = document.createElement('h1')
  greeting.className = 'text-3xl font-bold text-text-emphasis'
  greeting.textContent = 'Carregando...'

  const logoutBtn = Button({ label: 'Sair', iconAfter: 'logout', variant: 'primary' })
  logoutBtn.addEventListener('click', () => {
    logout()
    window.location.hash = '#/login'
  })

  page.appendChild(greeting)
  page.appendChild(logoutBtn)

  getMe()
    .then((user) => {
      greeting.textContent = `Olá, ${user.name}!`
    })
    .catch(() => {
      window.location.hash = '#/login'
    })

  return page
}
