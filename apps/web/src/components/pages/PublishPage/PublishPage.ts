import { FeedTemplate } from '../../templates/FeedTemplate/FeedTemplate'
import { PublishForm } from '../../organisms/PublishForm/PublishForm'
import { createPost } from '../../../services/posts'
import { getToken } from '../../../services/tokenStorage'

export function PublishPage(): HTMLElement {
  if (!getToken()) {
    window.location.hash = '#/login'
    return document.createElement('div')
  }

  const form = PublishForm({
    onSubmit: async (data) => {
      await createPost({
        title: data.title,
        description: data.description,
        content: data.content,
        thumbnailUrl: data.thumbnailUrl || undefined,
      })
      window.location.hash = '#/feed'
    },
  })

  return FeedTemplate({ content: form })
}
