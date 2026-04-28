import { describe, it, expect, vi } from 'vitest'
import { SocialButton } from './SocialButton'

describe('SocialButton', () => {
  it('renders icon and label', () => {
    const btn = SocialButton({ label: 'Github', iconSrc: '/github_logo.png' })
    const img = btn.querySelector('img') as HTMLImageElement
    const span = btn.querySelector('span')
    expect(img.src).toContain('/github_logo.png')
    expect(span?.textContent).toBe('Github')
  })

  it('fires onClick when clicked', () => {
    const onClick = vi.fn()
    const btn = SocialButton({ label: 'Github', iconSrc: '/github_logo.png', onClick })
    btn.click()
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('uses label as img alt text', () => {
    const btn = SocialButton({ label: 'Gmail', iconSrc: '/gmail.png' })
    const img = btn.querySelector('img') as HTMLImageElement
    expect(img.alt).toBe('Gmail')
  })
})
