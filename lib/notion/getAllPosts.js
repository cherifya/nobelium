import { config as BLOG } from '@/lib/server/config'
import { Client } from '@notionhq/client'
import { idToUuid } from 'notion-utils'
import dayjs from '@/lib/dayjs'
import api from '@/lib/server/notion-api'
import getAllPageIds from './getAllPageIds'
import getPageProperties from './getPageProperties'
import filterPublishedPosts from './filterPublishedPosts'

/**
 * @param {{ includePages: boolean }} - false: posts only / true: include pages
 */
export async function getAllPosts ({ includePages = false }) {
  const id = idToUuid(process.env.NOTION_PAGE_ID)

  // Try the official Notion API first (handles queryCollection deprecation)
  if (process.env.NOTION_ACCESS_TOKEN) {
    try {
      const posts = await getAllPostsOfficial({ includePages })
      if (posts && posts.length > 0) return posts
    } catch (e) {
      console.warn('Official Notion API failed, falling back to unofficial:', e.message)
    }
  }

  // Fallback: unofficial API (notion-client)
  return getAllPostsUnofficial({ includePages, id })
}

/**
 * Original unofficial API path (notion-client + queryCollection)
 */
async function getAllPostsUnofficial ({ includePages, id }) {
  const response = await api.getPage(id)

  const collection = Object.values(response.collection)[0]?.value
  const collectionQuery = response.collection_query
  const block = response.block
  const schema = collection?.schema

  const rawMetadata = block[id].value

  if (
    rawMetadata?.type !== 'collection_view_page' &&
    rawMetadata?.type !== 'collection_view'
  ) {
    console.log(`pageId "${id}" is not a database`)
    return null
  }

  const pageIds = getAllPageIds(collectionQuery)
  const data = []
  for (let i = 0; i < pageIds.length; i++) {
    const id = pageIds[i]
    const properties = (await getPageProperties(id, block, schema)) || {}
    properties.fullWidth = block[id].value?.format?.page_full_width ?? false
    properties.date = (
      properties.date?.start_date
        ? dayjs.tz(properties.date.start_date, BLOG.timezone)
        : dayjs(block[id].value?.created_time)
    ).valueOf()
    data.push(properties)
  }

  const posts = filterPublishedPosts({ posts: data, includePages })
  if (BLOG.sortByDate) {
    posts.sort((a, b) => b.date - a.date)
  }
  return posts
}

/**
 * Official Notion API path — works when queryCollection endpoint is deprecated.
 * Resolves the collection/database ID from the page, then queries via dataSources.
 */
async function getAllPostsOfficial ({ includePages = false }) {
  const notion = new Client({ auth: process.env.NOTION_ACCESS_TOKEN })
  const pageId = process.env.NOTION_PAGE_ID

  // The NOTION_PAGE_ID may point to a collection_view_page (a page wrapping the database).
  // We need to find the actual database/collection ID.
  const databaseId = await resolveCollectionId(notion, pageId)

  // Query all pages from the database
  let allResults = []
  let hasMore = true
  let startCursor = undefined

  while (hasMore) {
    const response = await notion.dataSources.query({
      data_source_id: databaseId,
      start_cursor: startCursor,
      page_size: 100
    })
    allResults = allResults.concat(response.results)
    hasMore = response.has_more
    startCursor = response.next_cursor
  }

  // Map Notion API response to the format expected by the rest of the app
  const data = allResults.map(page => {
    const props = page.properties || {}

    const findProp = (name) => {
      const key = Object.keys(props).find(k => k.toLowerCase() === name.toLowerCase())
      return key ? props[key] : null
    }

    const getTitle = (prop) => {
      if (!prop || prop.type !== 'title') return ''
      return prop.title?.map(t => t.plain_text).join('') || ''
    }

    const getRichText = (prop) => {
      if (!prop || prop.type !== 'rich_text') return ''
      return prop.rich_text?.map(t => t.plain_text).join('') || ''
    }

    const getSelect = (prop) => {
      if (!prop) return ''
      if (prop.type === 'select') return prop.select?.name || ''
      if (prop.type === 'status') return prop.status?.name || ''
      return ''
    }

    const getMultiSelect = (prop) => {
      if (!prop || prop.type !== 'multi_select') return []
      return prop.multi_select?.map(s => s.name) || []
    }

    const getDate = (prop) => {
      if (!prop || prop.type !== 'date' || !prop.date) return null
      return { start_date: prop.date.start }
    }

    const title = getTitle(findProp('title') || findProp('name'))
    const slug = getRichText(findProp('slug'))
    const type = getSelect(findProp('type'))
    const status = getSelect(findProp('status'))
    const summary = getRichText(findProp('summary'))
    const tags = getMultiSelect(findProp('tags'))
    const dateVal = getDate(findProp('date'))

    const date = (
      dateVal?.start_date
        ? dayjs.tz(dateVal.start_date, BLOG.timezone)
        : dayjs(page.created_time)
    ).valueOf()

    return {
      id: page.id,
      title,
      slug,
      type,
      status,
      summary,
      tags,
      date,
      fullWidth: false
    }
  })

  const posts = filterPublishedPosts({ posts: data, includePages })
  if (BLOG.sortByDate) {
    posts.sort((a, b) => b.date - a.date)
  }
  return posts
}

/**
 * Resolve the actual database/collection ID from a NOTION_PAGE_ID.
 * The page ID might be a collection_view_page that wraps the database,
 * in which case we need to extract the collection_id from the block data.
 */
async function resolveCollectionId (notion, pageId) {
  // First, try querying directly — it might already be a database ID
  try {
    await notion.dataSources.retrieve({ data_source_id: pageId })
    return pageId
  } catch (e) {
    // Not a database — it's probably a collection_view_page wrapping one.
    // Use the unofficial API to get the collection_id from the block.
  }

  const id = idToUuid(pageId)
  const response = await api.getPage(id)
  const block = response.block?.[id]?.value
  const collectionId = block?.collection_id

  if (collectionId) return collectionId

  // Last resort: check format.collection_pointer
  const pointer = block?.format?.collection_pointer?.id
  if (pointer) return pointer

  // Give up, try the original ID
  return pageId
}
