export interface SocialButtonProps {
  label: string
  iconSrc: string
  onClick?: () => void
}

export function SocialButton({ label, iconSrc, onClick }: SocialButtonProps): HTMLButtonElement {
  const btn = document.createElement('button')
  btn.type = 'button'
  btn.className =
    'flex flex-col items-center gap-2 rounded-lg border border-border-subtle bg-bg-input px-8 py-3 cursor-pointer hover:brightness-110 transition-all focus-visible:outline-2 focus-visible:outline-brand-green focus-visible:outline-offset-2'

  const img = document.createElement('img')
  img.src = iconSrc
  img.alt = label
  img.className = 'h-7 w-7 object-contain'

  const span = document.createElement('span')
  span.textContent = label
  span.className = 'text-sm text-text-muted'

  btn.appendChild(img)
  btn.appendChild(span)

  if (onClick) btn.addEventListener('click', onClick)

  return btn
}
