import { Icon } from '../../atoms/Icon/Icon'
import { Link } from '../../atoms/Link/Link'
import { logout } from '../../../services/auth'

export interface SidebarProps {
  isAuthenticated: boolean
  onNavigate?: () => void
}

interface NavLink {
  text: string
  href: string
}

const NAV_LINKS: NavLink[] = [
  { text: 'Feed', href: '#/feed' },
]

export function Sidebar({ isAuthenticated, onNavigate }: SidebarProps): HTMLElement {
  const aside = document.createElement('aside')
  aside.className =
    'w-60 shrink-0 flex flex-col gap-6 bg-bg-card border-r border-border-subtle min-h-screen px-4 py-6'
  aside.setAttribute('aria-label', 'Menu lateral')

  const logoWrapper = document.createElement('div')
  logoWrapper.className = 'flex items-center gap-2 px-2'

  const logoIcon = Icon({ name: 'code', className: 'w-7 h-7 text-brand-green' })
  logoWrapper.appendChild(logoIcon)

  const logoText = document.createElement('span')
  logoText.className = 'text-white font-bold text-lg tracking-tight'
  logoText.textContent = 'CodeConnect'
  logoWrapper.appendChild(logoText)

  aside.appendChild(logoWrapper)

  const divider = document.createElement('hr')
  divider.className = 'border-border-subtle'
  aside.appendChild(divider)

  const nav = document.createElement('nav')
  nav.className = 'flex flex-col gap-1 flex-1'

  for (const item of NAV_LINKS) {
    const link = Link({ text: item.text, href: item.href })
    link.className =
      'px-3 py-2 rounded-lg text-sm text-text-muted hover:bg-bg-input hover:text-white transition-colors'
    if (onNavigate) {
      link.addEventListener('click', () => setTimeout(onNavigate, 0))
    }
    nav.appendChild(link)
  }

  aside.appendChild(nav)

  const footer = document.createElement('div')
  footer.className = 'pt-4 border-t border-border-subtle'

  if (isAuthenticated) {
    const logoutLink = document.createElement('button')
    logoutLink.type = 'button'
    logoutLink.className =
      'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-text-muted hover:bg-bg-input hover:text-white transition-colors cursor-pointer'
    logoutLink.setAttribute('aria-label', 'Sair da conta')
    logoutLink.appendChild(Icon({ name: 'logout', className: 'w-4 h-4 shrink-0' }))
    const span = document.createElement('span')
    span.textContent = 'Sair'
    logoutLink.appendChild(span)
    logoutLink.addEventListener('click', () => {
      logout()
      window.location.hash = '#/feed'
    })
    footer.appendChild(logoutLink)
  } else {
    const loginLink = Link({ text: 'Login', href: '#/login', iconAfter: 'login' })
    loginLink.className =
      'flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-text-muted hover:bg-bg-input hover:text-white transition-colors'
    footer.appendChild(loginLink)
  }

  aside.appendChild(footer)
  return aside
}
