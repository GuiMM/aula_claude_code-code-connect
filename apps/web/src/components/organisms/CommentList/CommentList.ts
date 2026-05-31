import { CommentItem } from '../../molecules/CommentItem/CommentItem'
import type { PostComment } from '../../../services/posts'

export interface CommentListProps {
  comments: PostComment[]
  onReply?: (parentId: string, content: string) => Promise<void>
}

export function CommentList({ comments, onReply }: CommentListProps): HTMLElement {
  const list = document.createElement('div')
  list.className = 'flex flex-col gap-6'
  list.setAttribute('aria-live', 'polite')

  if (comments.length === 0) {
    const empty = document.createElement('p')
    empty.className = 'text-sm text-bg-card py-4'
    empty.textContent = 'Seja o primeiro a comentar!'
    list.appendChild(empty)
    return list
  }

  const byParent = new Map<string, PostComment[]>()
  for (const comment of comments) {
    if (comment.parentId) {
      const arr = byParent.get(comment.parentId) ?? []
      arr.push(comment)
      byParent.set(comment.parentId, arr)
    }
  }

  const topLevel = comments.filter((c) => c.parentId === null)
  for (const comment of topLevel) {
    const replies = byParent.get(comment.id) ?? []
    list.appendChild(
      CommentItem({
        comment,
        replies: replies.slice().reverse(),
        onReply,
      }),
    )
  }

  return list
}
