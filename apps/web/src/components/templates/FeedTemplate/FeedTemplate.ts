import { Sidebar } from '../../organisms/Sidebar/Sidebar'
import { getToken } from '../../../services/tokenStorage'

export interface FeedTemplateProps {
  content: HTMLElement
  onNavigate?: () => void
}

export function FeedTemplate({ content, onNavigate }: FeedTemplateProps): HTMLElement {
  const isAuthenticated = !!getToken()

  const root = document.createElement('div')
  root.className = 'flex min-h-screen bg-bg-page'

  root.appendChild(Sidebar({ isAuthenticated, onNavigate }))

  const main = document.createElement('main')
  main.className = 'flex-1 p-6 overflow-y-auto'
  main.appendChild(content)
  root.appendChild(main)

  return root
}
