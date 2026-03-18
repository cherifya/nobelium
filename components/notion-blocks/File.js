import { Text } from 'react-notion-x'
import { useConfig } from '@/lib/config'
import { getBlockFileTitle, getHtmlFileUrl } from '@/lib/notion/file'

export default function File ({ block }) {
  const BLOG = useConfig()
  const href = getHtmlFileUrl(BLOG.path, block.id)
  const title = getBlockFileTitle(block)

  return (
    <section className="my-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <div className="flex flex-col gap-4 border-b border-zinc-200 bg-zinc-50 px-4 py-4 dark:border-zinc-700 dark:bg-zinc-950/60 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">
            HTML Preview
          </div>
          <div className="truncate text-base font-semibold text-zinc-900 dark:text-zinc-100">
            <Text value={block?.properties?.title || [['File']]} block={block} />
          </div>
          {block?.properties?.size && (
            <div className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              <Text value={block.properties.size} block={block} />
            </div>
          )}
        </div>
        <a
          className="inline-flex shrink-0 items-center justify-center rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition hover:border-zinc-900 hover:bg-zinc-900 hover:text-white dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-100 dark:hover:bg-zinc-100 dark:hover:text-zinc-900"
          href={href}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open In New Tab
        </a>
      </div>
      <div className="bg-zinc-100 dark:bg-zinc-950">
        <iframe
          src={href}
          title={title}
          loading="lazy"
          className="block h-[24rem] w-full border-0 bg-white dark:bg-zinc-950 md:h-[28rem]"
        />
      </div>
    </section>
  )
}
