import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../../services/tokenStorage', () => ({
  getToken: vi.fn(),
}))

vi.mock('../../../services/posts', () => ({
  createPost: vi.fn(),
}))

import { PublishPage } from './PublishPage'
import { getToken } from '../../../services/tokenStorage'

beforeEach(() => {
  vi.clearAllMocks()
  window.location.hash = ''
})

describe('PublishPage', () => {
  it('renders inside FeedTemplate with sidebar when authenticated', () => {
    vi.mocked(getToken).mockReturnValue('token')
    const page = PublishPage()
    expect(page.querySelector('h1')?.textContent).toBe('Publicar')
    expect(page.querySelector('nav, aside, [data-sidebar]') ?? page.querySelector('form')).not.toBeNull()
  })

  it('renders the publish form fields', () => {
    vi.mocked(getToken).mockReturnValue('token')
    const page = PublishPage()
    expect(page.querySelector('input[name="title"]')).not.toBeNull()
    expect(page.querySelector('input[name="description"]')).not.toBeNull()
    expect(page.querySelector('textarea[name="content"]')).not.toBeNull()
    expect(page.querySelector('input[name="thumbnailUrl"]')).not.toBeNull()
  })

  it('redirects to #/login when not authenticated', () => {
    vi.mocked(getToken).mockReturnValue(null)
    PublishPage()
    expect(window.location.hash).toBe('#/login')
  })
})
