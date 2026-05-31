import { http } from './http'

export interface PostAuthor {
  id: string
  name: string
}

export interface PostSummary {
  id: string
  title: string
  description: string
  thumbnailUrl: string | null
  author: PostAuthor
  likesCount: number
  commentsCount: number
  likedByMe: boolean | null
  createdAt: string
}

export interface PostDetail extends PostSummary {
  content: string
}

export interface PostComment {
  id: string
  content: string
  author: PostAuthor
  parentId: string | null
  createdAt: string
}

export interface PaginatedPosts {
  data: PostSummary[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface GetPostsParams {
  q?: string
  page?: number
  limit?: number
}

export async function getPosts(params: GetPostsParams = {}): Promise<PaginatedPosts> {
  const searchParams = new URLSearchParams()
  if (params.q) searchParams.set('q', params.q)
  if (params.page) searchParams.set('page', String(params.page))
  if (params.limit) searchParams.set('limit', String(params.limit))

  const query = searchParams.toString()
  const res = await http.get<PaginatedPosts>(`/posts${query ? `?${query}` : ''}`)
  return res.data
}

export async function getPost(id: string): Promise<PostDetail> {
  const res = await http.get<PostDetail>(`/posts/${id}`)
  return res.data
}

export async function likePost(id: string): Promise<void> {
  await http.post(`/posts/${id}/likes`)
}

export async function unlikePost(id: string): Promise<void> {
  await http.delete(`/posts/${id}/likes`)
}

export async function getComments(postId: string): Promise<PostComment[]> {
  const res = await http.get<PostComment[]>(`/posts/${postId}/comments`)
  return res.data
}

export async function createComment(
  postId: string,
  content: string,
  parentCommentId?: string,
): Promise<PostComment> {
  const body: { content: string; parentCommentId?: string } = { content }
  if (parentCommentId) body.parentCommentId = parentCommentId
  const res = await http.post<PostComment>(`/posts/${postId}/comments`, body)
  return res.data
}
