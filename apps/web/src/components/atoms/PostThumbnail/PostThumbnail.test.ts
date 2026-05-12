import { describe, it, expect } from 'vitest'
import { PostThumbnail } from './PostThumbnail'

describe('PostThumbnail', () => {
  it('renders an img when src is provided', () => {
    const el = PostThumbnail({ src: 'https://example.com/img.jpg', alt: 'Test' })
    expect(el.tagName).toBe('IMG')
    expect((el as HTMLImageElement).src).toContain('example.com/img.jpg')
    expect((el as HTMLImageElement).alt).toBe('Test')
  })

  it('renders placeholder div when src is null', () => {
    const el = PostThumbnail({ src: null, alt: 'Test' })
    expect(el.tagName).toBe('DIV')
    expect(el.querySelector('svg')).not.toBeNull()
  })

  it('renders placeholder div when src is undefined', () => {
    const el = PostThumbnail({ alt: 'Test' })
    expect(el.tagName).toBe('DIV')
  })

  it('img has lazy loading attribute', () => {
    const el = PostThumbnail({ src: 'https://example.com/img.jpg', alt: 'Test' }) as HTMLImageElement
    expect(el.loading).toBe('lazy')
  })
})
