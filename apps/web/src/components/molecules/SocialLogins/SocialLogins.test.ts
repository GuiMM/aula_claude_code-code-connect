import { describe, it, expect } from 'vitest'
import { SocialLogins } from './SocialLogins'

describe('SocialLogins', () => {
  it('renders one button per provider', () => {
    const el = SocialLogins({
      providers: [
        { label: 'Github', iconSrc: '/github_logo.png' },
        { label: 'Gmail', iconSrc: '/gmail.png' },
      ],
    })
    const buttons = el.querySelectorAll('button')
    expect(buttons.length).toBe(2)
  })

  it('renders correct labels for each provider', () => {
    const el = SocialLogins({
      providers: [
        { label: 'Github', iconSrc: '/github_logo.png' },
        { label: 'Gmail', iconSrc: '/gmail.png' },
      ],
    })
    const spans = el.querySelectorAll('span')
    expect(spans[0].textContent).toBe('Github')
    expect(spans[1].textContent).toBe('Gmail')
  })
})
