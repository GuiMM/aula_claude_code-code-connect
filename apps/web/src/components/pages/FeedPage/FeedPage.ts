import { FeedTemplate } from '../../templates/FeedTemplate/FeedTemplate'
import { PostFeed } from '../../organisms/PostFeed/PostFeed'
import { getPosts, type PostSummary } from '../../../services/posts'

export function FeedPage(): HTMLElement {
  let currentPage = 1
  let currentQuery = ''

  const feedEl = PostFeed({
    posts: [],
    totalPages: 1,
    currentPage: 1,
    loading: true,
    onSearch: handleSearch,
    onLoadPage: handleLoadPage,
    onPostClick: handlePostClick,
  })

  const wrapper = FeedTemplate({ content: feedEl })

  async function loadPosts() {
    const result = await getPosts({ q: currentQuery || undefined, page: currentPage, limit: 9 })

    const newFeed = PostFeed({
      posts: result.data as PostSummary[],
      totalPages: result.totalPages,
      currentPage: result.page,
      loading: false,
      onSearch: handleSearch,
      onLoadPage: handleLoadPage,
      onPostClick: handlePostClick,
    })

    const main = wrapper.querySelector('main')!
    main.replaceChildren(newFeed)
  }

  function handleSearch(query: string) {
    currentQuery = query
    currentPage = 1
    loadPosts()
  }

  function handleLoadPage(page: number) {
    currentPage = page
    loadPosts()
  }

  function handlePostClick(id: string) {
    window.location.hash = `#/posts/${id}`
  }

  loadPosts()
  return wrapper
}
