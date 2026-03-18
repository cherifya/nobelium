import { idToUuid } from 'notion-utils'

function extractBlockIds (result) {
  if (!result || typeof result !== 'object') return []

  if (Array.isArray(result.blockIds)) {
    return result.blockIds
  }

  if (Array.isArray(result.collection_group_results?.blockIds)) {
    return result.collection_group_results.blockIds
  }

  return Object.values(result).flatMap(extractBlockIds)
}

export default function getAllPageIds (collectionQuery, viewId) {
  const views = Object.values(collectionQuery || {})[0] || {}
  const pageSet = new Set()

  const targetViews = viewId
    ? [views[idToUuid(viewId)]].filter(Boolean)
    : Object.values(views)

  targetViews.forEach(view => {
    extractBlockIds(view).forEach(id => pageSet.add(id))
  })

  return [...pageSet]
}
