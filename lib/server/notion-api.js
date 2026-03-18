import { NotionAPI } from 'notion-client'

const { NOTION_ACCESS_TOKEN } = process.env

const client = new NotionAPI({ authToken: NOTION_ACCESS_TOKEN })

function getBlockSource (block) {
  return block?.properties?.source?.[0]?.[0] ?? null
}

function getAttachmentUrlRequests (recordMap) {
  if (!recordMap?.block) return []

  return Object.entries(recordMap.block).flatMap(([blockId, entry]) => {
    const block = entry?.value
    const source = getBlockSource(block)

    if (
      block?.type !== 'file' ||
      !source?.startsWith('attachment:') ||
      recordMap.signed_urls?.[blockId]
    ) {
      return []
    }

    return [{
      blockId,
      request: {
        permissionRecord: { table: 'block', id: blockId },
        url: source
      }
    }]
  })
}

function unwrapRecordEntry (entry) {
  const wrappedValue = entry?.value

  if (
    wrappedValue &&
    typeof wrappedValue === 'object' &&
    'value' in wrappedValue &&
    'role' in wrappedValue
  ) {
    return wrappedValue
  }

  return entry
}

function normalizeRecordTable (table) {
  if (!table || typeof table !== 'object') return table

  return Object.fromEntries(
    Object.entries(table).map(([id, entry]) => [id, unwrapRecordEntry(entry)])
  )
}

function normalizeRecordMap (recordMap) {
  if (!recordMap || typeof recordMap !== 'object') return recordMap

  return {
    ...recordMap,
    block: normalizeRecordTable(recordMap.block),
    collection: normalizeRecordTable(recordMap.collection),
    collection_view: normalizeRecordTable(recordMap.collection_view),
    notion_user: normalizeRecordTable(recordMap.notion_user)
  }
}

async function addAttachmentSignedUrls (recordMap) {
  const attachmentRequests = getAttachmentUrlRequests(recordMap)

  if (!attachmentRequests.length) return recordMap

  try {
    const { signedUrls = [] } = await client.getSignedFileUrls(
      attachmentRequests.map(({ request }) => request)
    )

    recordMap.signed_urls = { ...(recordMap.signed_urls || {}) }

    signedUrls.forEach((signedUrl, index) => {
      if (signedUrl) {
        const { blockId } = attachmentRequests[index]
        recordMap.signed_urls[blockId] = signedUrl
      }
    })
  } catch (error) {
    console.warn('NotionAPI getSignedFileUrls error', error?.message || error)
  }

  return recordMap
}

function normalizeUserResponse (response) {
  if (!response || typeof response !== 'object') return response

  return {
    ...response,
    recordMapWithRoles: response.recordMapWithRoles
      ? {
          ...response.recordMapWithRoles,
          notion_user: normalizeRecordTable(response.recordMapWithRoles.notion_user)
        }
      : response.recordMapWithRoles
  }
}

function normalizeUserIds (userIds) {
  if (!Array.isArray(userIds)) return [userIds]

  return userIds.map(userId => (Array.isArray(userId) ? userId[1] ?? userId[0] : userId))
}

const api = {
  async getPage (...args) {
    const recordMap = normalizeRecordMap(await client.getPage(...args))
    return addAttachmentSignedUrls(recordMap)
  },

  async getBlocks (blockIds, ...args) {
    const response = await client.getBlocks(blockIds, ...args)
    const recordMap = normalizeRecordMap(response?.recordMap || {})
    return addAttachmentSignedUrls(recordMap)
  },

  async getUsers (userIds, ...args) {
    const response = await client.getUsers(normalizeUserIds(userIds), ...args)
    return normalizeUserResponse(response)
  }
}

export default api
