import { describe, it, expect } from 'vitest'
import { AuthBanner } from './AuthBanner'

describe('AuthBanner', () => {
  it('renders an img with the provided src', () => {
    const el = AuthBanner({ imageSrc: '/banner.png' })
    const img = el.querySelector('img') as HTMLImageElement
    expect(img.src).toContain('/banner.png')
  })

  it('uses default alt text when not provided', () => {
    const el = AuthBanner({ imageSrc: '/banner.png' })
    const img = el.querySelector('img') as HTMLImageElement
    expect(img.alt).toBe('code connect')
  })

  it('uses custom alt text when provided', () => {
    const el = AuthBanner({ imageSrc: '/register-banner.png', alt: 'Cadastro' })
    const img = el.querySelector('img') as HTMLImageElement
    expect(img.alt).toBe('Cadastro')
  })
})
