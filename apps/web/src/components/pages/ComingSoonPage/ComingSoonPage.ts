import { FeedTemplate } from '../../templates/FeedTemplate/FeedTemplate'

export interface ComingSoonPageProps {
  title?: string
}

export function ComingSoonPage({ title }: ComingSoonPageProps = {}): HTMLElement {
  const content = document.createElement('div')
  content.className = 'flex flex-col items-center justify-center gap-3 py-24 text-center'

  if (title) {
    const eyebrow = document.createElement('p')
    eyebrow.className = 'text-sm text-text-muted uppercase tracking-wide'
    eyebrow.textContent = title
    content.appendChild(eyebrow)
  }

  const heading = document.createElement('h1')
  heading.className = 'text-3xl font-semibold text-white'
  heading.textContent = 'Em construção'
  content.appendChild(heading)

  const sub = document.createElement('p')
  sub.className = 'text-sm text-text-muted max-w-md'
  sub.textContent = 'Esta página ainda está sendo desenvolvida. Volte em breve!'
  content.appendChild(sub)

  return FeedTemplate({ content })
}
