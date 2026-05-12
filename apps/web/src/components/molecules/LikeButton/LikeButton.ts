import { Icon } from '../../atoms/Icon/Icon'

export interface LikeButtonProps {
  count: number
  liked: boolean
  disabled?: boolean
  onClick?: () => void
}

export function LikeButton({ count, liked, disabled = false, onClick }: LikeButtonProps): HTMLButtonElement {
  const btn = document.createElement('button')
  btn.type = 'button'
  btn.disabled = disabled

  const activeClass = liked
    ? 'text-red-400 hover:text-red-300'
    : 'text-text-muted hover:text-white'

  btn.className = `flex items-center gap-1.5 text-sm ${activeClass} transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer`
  btn.setAttribute('aria-label', `${liked ? 'Descurtir' : 'Curtir'} post (${count} curtidas)`)
  btn.setAttribute('aria-pressed', String(liked))

  btn.appendChild(Icon({ name: liked ? 'heart_filled' : 'heart', className: 'w-5 h-5 shrink-0' }))
  const span = document.createElement('span')
  span.textContent = String(count)
  btn.appendChild(span)

  if (onClick && !disabled) {
    btn.addEventListener('click', onClick)
  }

  return btn
}
