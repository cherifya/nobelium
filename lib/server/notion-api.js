import { NotionAPI } from 'notion-client'

const { NOTION_ACCESS_TOKEN } = process.env

const client = new NotionAPI({ authToken: NOTION_ACCESS_TOKEN })

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
    const recordMap = await client.getPage(...args)
    return normalizeRecordMap(recordMap)
  },

  async getUsers (userIds, ...args) {
    const response = await client.getUsers(normalizeUserIds(userIds), ...args)
    return normalizeUserResponse(response)
  }
}

export default api
