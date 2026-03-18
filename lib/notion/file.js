import { getTextContent } from 'notion-utils'

export function getBlockFileTitle (block) {
  return getTextContent(block?.properties?.title) || 'File'
}

export function getBlockFileSource (block, recordMap) {
  return recordMap?.signed_urls?.[block?.id] || block?.properties?.source?.[0]?.[0] || null
}

export function isHtmlFileName (value = '') {
  return /\.html?$/i.test(value.split('?')[0] || '')
}

export function isHtmlFileBlock (block) {
  if (block?.type !== 'file') return false

  return (
    isHtmlFileName(getBlockFileTitle(block)) ||
    isHtmlFileName(block?.properties?.source?.[0]?.[0] || '')
  )
}

export function getHtmlFileBlockIdFromUrl (value) {
  if (typeof value !== 'string' || !value.length) return null

  try {
    const url = new URL(value, 'https://example.com')

    if (url.pathname.startsWith('/api/notion-file/')) {
      return url.pathname.split('/').pop() || null
    }

    return url.searchParams.get('id')
  } catch {
    return null
  }
}

export function getHtmlFileUrl (basePath = '', blockId) {
  return `${basePath || ''}/api/notion-file/${blockId}`
}
