import './style.css'
import { LoginPage } from './components/pages/LoginPage/LoginPage'
import { RegisterPage } from './components/pages/RegisterPage/RegisterPage'
import { FeedPage } from './components/pages/FeedPage/FeedPage'
import { PostDetailPage } from './components/pages/PostDetailPage/PostDetailPage'
import { getToken } from './services/tokenStorage'

const root = document.querySelector<HTMLDivElement>('#app')!

function render() {
  const hash = window.location.hash || '#/feed'
  const isLoggedIn = !!getToken()

  if (isLoggedIn && (hash === '#/login' || hash === '#/cadastro')) {
    window.location.hash = '#/feed'
    return
  }

  if (hash === '#/cadastro') {
    root.replaceChildren(RegisterPage())
  } else if (hash === '#/login') {
    root.replaceChildren(LoginPage())
  } else if (hash.startsWith('#/posts/')) {
    const postId = hash.replace('#/posts/', '').split('/')[0]
    root.replaceChildren(PostDetailPage({ postId }))
  } else {
    root.replaceChildren(FeedPage())
  }
}

window.addEventListener('hashchange', render)
render()
