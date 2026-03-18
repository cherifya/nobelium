import { idToUuid } from 'notion-utils'
import { NotionAPI } from 'notion-client'
import {
  getBlockFileTitle,
  isHtmlFileBlock
} from '@/lib/notion/file'

const client = new NotionAPI({ authToken: process.env.NOTION_ACCESS_TOKEN })

function getInlineDisposition (filename) {
  const fallback = filename.replace(/[^\x20-\x7E]+/g, '_').replace(/"/g, '') || 'file.html'
  return `inline; filename="${fallback}"; filename*=UTF-8''${encodeURIComponent(filename)}`
}

function normalizeBlockId (value) {
  if (typeof value !== 'string') return null

  const trimmed = value.trim().toLowerCase()
  return trimmed.includes('-') ? trimmed : idToUuid(trimmed)
}

export default async function handler (req, res) {
  if (req.method !== 'GET') {
    res.status(204).end()
    return
  }

  const blockId = normalizeBlockId(
    Array.isArray(req.query.blockId) ? req.query.blockId[0] : req.query.blockId
  )

  if (!blockId) {
    res.status(400).send('Invalid block id')
    return
  }

  const response = await client.getBlocks([blockId])
  const block = response?.recordMap?.block?.[blockId]?.value

  if (!block || block.type !== 'file' || !isHtmlFileBlock(block)) {
    res.status(404).send('HTML file block not found')
    return
  }

  const rawSource = block?.properties?.source?.[0]?.[0]

  const source = rawSource?.startsWith('attachment:')
    ? (await client.getSignedFileUrls([{
        permissionRecord: { table: 'block', id: blockId },
        url: rawSource
      }]))?.signedUrls?.[0]
    : rawSource

  if (!source) {
    res.status(404).send('File source not found')
    return
  }

  const upstream = await fetch(source)

  if (!upstream.ok) {
    res.status(upstream.status).send('Unable to load file')
    return
  }

  const title = getBlockFileTitle(block)
  const body = Buffer.from(await upstream.arrayBuffer())

  res.setHeader('Cache-Control', 'private, no-store')
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.setHeader('Content-Disposition', getInlineDisposition(title))
  res.setHeader(
    'Content-Security-Policy',
    'sandbox allow-downloads allow-forms allow-modals allow-popups allow-same-origin allow-scripts'
  )
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Robots-Tag', 'noindex')
  res.status(200).send(body)
}
