function firstValue (value) {
  return Array.isArray(value) ? value[0] : value
}

export default function filterPublishedPosts({ posts, includePages }) {
  if (!posts || !posts.length) return []
  return posts
    .filter(post =>
      includePages
        ? firstValue(post?.type) === 'Post' || firstValue(post?.type) === 'Page'
        : firstValue(post?.type) === 'Post'
    )
    .filter(post =>
      post.title &&
      post.slug &&
      firstValue(post?.status) === 'Published' &&
      post.date <= new Date()
    )
}
