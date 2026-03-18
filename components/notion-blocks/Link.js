import { useConfig } from '@/lib/config'
import {
  getHtmlFileBlockIdFromUrl,
  getHtmlFileUrl,
  isHtmlFileName
} from '@/lib/notion/file'

export default function Link (props) {
  const BLOG = useConfig()
  const {
    children,
    className,
    href,
    enableInlineHtmlAttachmentPreview = false,
    ...rest
  } = props

  const blockId = getHtmlFileBlockIdFromUrl(href)
  const previewHref = blockId ? getHtmlFileUrl(BLOG.path, blockId) : href
  const shouldInlinePreview = (
    enableInlineHtmlAttachmentPreview &&
    className === 'notion-file-link' &&
    isHtmlFileName(href) &&
    !!blockId
  )

  if (!shouldInlinePreview) {
    return (
      <a className={className} href={href} {...rest}>
        {children}
      </a>
    )
  }

  return (
    <section className="my-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <div className="flex flex-col gap-4 border-b border-zinc-200 bg-zinc-50 px-4 py-4 dark:border-zinc-700 dark:bg-zinc-950/60 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">
            HTML Preview
          </div>
          <div className="flex min-w-0 items-center gap-3 [&_.notion-file-icon]:shrink-0 [&_.notion-file-info]:min-w-0 [&_.notion-file-size]:mt-1 [&_.notion-file-size]:text-sm [&_.notion-file-size]:text-zinc-500 [&_.notion-file-title]:truncate [&_.notion-file-title]:text-base [&_.notion-file-title]:font-semibold [&_.notion-file-title]:text-zinc-900 dark:[&_.notion-file-size]:text-zinc-400 dark:[&_.notion-file-title]:text-zinc-100">
            {children}
          </div>
        </div>
        <a
          className="inline-flex shrink-0 items-center justify-center rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition hover:border-zinc-900 hover:bg-zinc-900 hover:text-white dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-100 dark:hover:bg-zinc-100 dark:hover:text-zinc-900"
          href={previewHref}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open In New Tab
        </a>
      </div>
      <div className="bg-zinc-100 dark:bg-zinc-950">
        <iframe
          src={previewHref}
          title="HTML Preview"
          loading="lazy"
          className="block h-[24rem] w-full border-0 bg-white dark:bg-zinc-950 md:h-[28rem]"
        />
      </div>
    </section>
  )
}
