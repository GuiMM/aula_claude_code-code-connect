export type AvatarSize = 'sm' | 'md' | 'lg'

export interface AvatarProps {
  name: string
  size?: AvatarSize
}

const SIZE_CLASSES: Record<AvatarSize, string> = {
  sm: 'w-7 h-7 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-11 h-11 text-base',
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function Avatar({ name, size = 'md' }: AvatarProps): HTMLDivElement {
  const el = document.createElement('div')
  el.className = `${SIZE_CLASSES[size]} rounded-full bg-brand-green text-text-on-primary font-semibold flex items-center justify-center shrink-0`
  el.textContent = getInitials(name)
  el.setAttribute('aria-label', name)
  el.title = name
  return el
}
