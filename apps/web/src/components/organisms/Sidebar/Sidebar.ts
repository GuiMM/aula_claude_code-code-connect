import { Icon, type IconName } from '../../atoms/Icon/Icon'
import { logout } from '../../../services/auth'

export interface SidebarProps {
  isAuthenticated: boolean
  onNavigate?: () => void
}

interface NavItem {
  text: string
  href: string
  icon: IconName
}

const NAV_ITEMS: NavItem[] = [
  { text: 'Feed', href: '#/feed', icon: 'home' },
  { text: 'Perfil', href: '#/perfil', icon: 'person' },
  { text: 'Sobre nós', href: '#/sobre', icon: 'info' },
]

function buildLogo(): HTMLElement {
  const wrapper = document.createElement('div')
  wrapper.className = 'flex items-center gap-2'
  wrapper.appendChild(Icon({ name: 'code', className: 'w-7 h-7 text-brand-green' }))

  const label = document.createElement('span')
  label.className = 'text-white font-semibold text-lg leading-none'
  label.innerHTML = '<span class="text-white">code</span><span class="text-brand-green">/</span><span class="text-white">connect</span>'
  wrapper.appendChild(label)
  return wrapper
}

function buildNavItem(item: NavItem, active: boolean, onNavigate?: () => void): HTMLAnchorElement {
  const link = document.createElement('a')
  link.href = item.href
  const colorClass = active ? 'text-white' : 'text-text-muted hover:text-white'
  link.className = `flex flex-col items-center gap-2 ${colorClass} transition-colors cursor-pointer`

  link.appendChild(Icon({ name: item.icon, className: 'w-8 h-8 shrink-0' }))

  const label = document.createElement('span')
  label.className = 'text-sm'
  label.textContent = item.text
  link.appendChild(label)

  if (onNavigate) {
    link.addEventListener('click', () => setTimeout(onNavigate, 0))
  }
  return link
}

export function Sidebar({ isAuthenticated, onNavigate }: SidebarProps): HTMLElement {
  const aside = document.createElement('aside')
  aside.className =
    'w-44 shrink-0 bg-bg-card rounded-lg flex flex-col items-center gap-20 px-4 py-10'
  aside.setAttribute('aria-label', 'Menu lateral')

  aside.appendChild(buildLogo())

  const publishLink = document.createElement('a')
  publishLink.href = '#/publicar'
  publishLink.textContent = 'Publicar'
  publishLink.className =
    'border border-brand-green text-brand-green rounded-lg py-3 px-4 w-full text-center text-sm font-semibold hover:bg-brand-green/10 transition-colors cursor-pointer'
  if (onNavigate) {
    publishLink.addEventListener('click', () => setTimeout(onNavigate, 0))
  }
  aside.appendChild(publishLink)

  const currentHash = window.location.hash || '#/feed'

  const nav = document.createElement('nav')
  nav.className = 'flex flex-col items-center gap-10 flex-1'

  for (const item of NAV_ITEMS) {
    nav.appendChild(buildNavItem(item, currentHash === item.href, onNavigate))
  }

  if (isAuthenticated) {
    const logoutBtn = document.createElement('button')
    logoutBtn.type = 'button'
    logoutBtn.className =
      'flex flex-col items-center gap-2 text-text-muted hover:text-white transition-colors cursor-pointer'
    logoutBtn.setAttribute('aria-label', 'Sair da conta')
    logoutBtn.appendChild(Icon({ name: 'logout', className: 'w-8 h-8 shrink-0' }))
    const label = document.createElement('span')
    label.className = 'text-sm'
    label.textContent = 'Sair'
    logoutBtn.appendChild(label)
    logoutBtn.addEventListener('click', () => {
      logout()
      window.location.hash = '#/login'
    })
    nav.appendChild(logoutBtn)
  } else {
    const loginLink = document.createElement('a')
    loginLink.href = '#/login'
    loginLink.className =
      'flex flex-col items-center gap-2 text-text-muted hover:text-white transition-colors cursor-pointer'
    loginLink.appendChild(Icon({ name: 'login', className: 'w-8 h-8 shrink-0' }))
    const loginLabel = document.createElement('span')
    loginLabel.className = 'text-sm'
    loginLabel.textContent = 'Login'
    loginLink.appendChild(loginLabel)
    nav.appendChild(loginLink)
  }

  aside.appendChild(nav)
  return aside
}
