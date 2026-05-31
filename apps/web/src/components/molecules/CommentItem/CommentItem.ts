import { Avatar } from '../../atoms/Avatar/Avatar'
import { CommentForm } from '../CommentForm/CommentForm'
import type { PostComment } from '../../../services/posts'

export interface CommentItemProps {
  comment: PostComment
  replies?: PostComment[]
  onReply?: (parentId: string, content: string) => Promise<void>
  isReply?: boolean
}

function renderHeader(comment: PostComment): HTMLElement {
  const header = document.createElement('div')
  header.className = 'flex items-start gap-3'
  header.appendChild(Avatar({ name: comment.author.name, size: 'sm' }))

  const body = document.createElement('div')
  body.className = 'flex flex-col gap-1 min-w-0 flex-1'

  const name = document.createElement('span')
  name.className = 'text-sm font-semibold text-bg-card'
  name.textContent = `@${comment.author.name}`
  body.appendChild(name)

  const text = document.createElement('p')
  text.className = 'text-sm text-bg-card leading-relaxed break-words'
  text.textContent = comment.content
  body.appendChild(text)

  header.appendChild(body)
  return header
}

export function CommentItem({
  comment,
  replies = [],
  onReply,
  isReply = false,
}: CommentItemProps): HTMLElement {
  const wrapper = document.createElement('article')
  wrapper.className = 'flex flex-col gap-3'
  wrapper.setAttribute('data-comment-id', comment.id)

  wrapper.appendChild(renderHeader(comment))

  if (isReply) {
    return wrapper
  }

  const actions = document.createElement('div')
  actions.className = 'flex items-center gap-4 pl-10'

  let formOpen = false
  const formContainer = document.createElement('div')
  formContainer.className = 'pl-10 hidden'

  if (onReply) {
    const replyBtn = document.createElement('button')
    replyBtn.type = 'button'
    replyBtn.className = 'text-sm text-bg-card font-semibold hover:underline cursor-pointer'
    replyBtn.textContent = 'Responder'
    replyBtn.addEventListener('click', () => {
      formOpen = !formOpen
      formContainer.classList.toggle('hidden', !formOpen)
    })
    actions.appendChild(replyBtn)
  }

  wrapper.appendChild(actions)

  if (onReply) {
    formContainer.appendChild(
      CommentForm({
        onSubmit: async (content) => {
          await onReply(comment.id, content)
          formOpen = false
          formContainer.classList.add('hidden')
        },
      }),
    )
    wrapper.appendChild(formContainer)
  }

  if (replies.length > 0) {
    let repliesOpen = false

    const toggleWrapper = document.createElement('div')
    toggleWrapper.className = 'flex items-center gap-3 pl-10'

    const line = document.createElement('span')
    line.className = 'h-px w-8 bg-bg-card/40'
    toggleWrapper.appendChild(line)

    const toggleBtn = document.createElement('button')
    toggleBtn.type = 'button'
    toggleBtn.className = 'text-sm text-bg-card font-semibold hover:underline cursor-pointer'
    toggleBtn.textContent = `Ver respostas (${replies.length})`
    toggleWrapper.appendChild(toggleBtn)
    wrapper.appendChild(toggleWrapper)

    const repliesContainer = document.createElement('div')
    repliesContainer.className = 'pl-10 flex flex-col gap-4 hidden'
    for (const reply of replies) {
      repliesContainer.appendChild(
        CommentItem({ comment: reply, isReply: true }),
      )
    }
    wrapper.appendChild(repliesContainer)

    toggleBtn.addEventListener('click', () => {
      repliesOpen = !repliesOpen
      repliesContainer.classList.toggle('hidden', !repliesOpen)
      toggleBtn.textContent = repliesOpen
        ? 'Ocultar respostas'
        : `Ver respostas (${replies.length})`
    })
  }

  return wrapper
}
