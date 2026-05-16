import { Icon } from '../Icon/Icon'

export interface PostThumbnailProps {
  src?: string | null
  alt: string
}

function createPlaceholder(): HTMLDivElement {
  const div = document.createElement('div')
  div.className =
    'w-full aspect-video bg-bg-input flex items-center justify-center rounded-lg'
  div.setAttribute('aria-hidden', 'true')

  const icon = Icon({ name: 'code', className: 'w-12 h-12 text-text-muted' })
  div.appendChild(icon)
  return div
}

export function PostThumbnail({ src, alt }: PostThumbnailProps): HTMLElement {
  if (!src) return createPlaceholder()

  const img = document.createElement('img')
  img.src = src
  img.alt = alt
  img.className = 'w-full aspect-video object-cover rounded-lg'
  img.loading = 'lazy'
  img.addEventListener('error', () => {
    img.replaceWith(createPlaceholder())
  })

  return img
}
