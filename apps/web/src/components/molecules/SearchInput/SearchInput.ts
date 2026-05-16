import { Icon } from '../../atoms/Icon/Icon'

export interface SearchInputProps {
  placeholder?: string
  onSearch: (query: string) => void
  debounceMs?: number
}

export function SearchInput({
  placeholder = 'Buscar posts...',
  onSearch,
  debounceMs = 400,
}: SearchInputProps): HTMLDivElement {
  const wrapper = document.createElement('div')
  wrapper.className = 'relative flex items-center'

  const iconWrapper = document.createElement('div')
  iconWrapper.className = 'absolute left-3 text-text-muted pointer-events-none'
  iconWrapper.appendChild(Icon({ name: 'search', className: 'w-4 h-4' }))
  wrapper.appendChild(iconWrapper)

  const input = document.createElement('input')
  input.type = 'search'
  input.placeholder = placeholder
  input.className =
    'w-full bg-bg-input border border-border-subtle rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-text-muted focus:outline-none focus:border-brand-green transition-colors'
  input.setAttribute('aria-label', placeholder)

  let timer: ReturnType<typeof setTimeout>
  input.addEventListener('input', () => {
    clearTimeout(timer)
    timer = setTimeout(() => onSearch(input.value.trim()), debounceMs)
  })

  wrapper.appendChild(input)
  return wrapper
}
