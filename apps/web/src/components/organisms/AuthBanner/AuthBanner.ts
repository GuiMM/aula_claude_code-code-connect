export interface AuthBannerProps {
  imageSrc: string
  alt?: string
}

export function AuthBanner({ imageSrc, alt = 'code connect' }: AuthBannerProps): HTMLElement {
  const wrapper = document.createElement('div')
  wrapper.className = 'relative hidden md:block'

  const img = document.createElement('img')
  img.src = imageSrc
  img.alt = alt
  img.className = 'w-full h-full object-cover'

  wrapper.appendChild(img)

  return wrapper
}
