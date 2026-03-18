import { Text, useNotionContext } from 'react-notion-x'
import { useConfig } from '@/lib/config'
import { getHtmlFileUrl } from '@/lib/notion/file'

function FileIcon (props) {
  return (
    <svg {...props} viewBox="0 0 30 30">
      <path d="M22,8v12c0,3.866-3.134,7-7,7s-7-3.134-7-7V8c0-2.762,2.238-5,5-5s5,2.238,5,5v12c0,1.657-1.343,3-3,3s-3-1.343-3-3V8h-2v12c0,2.762,2.238,5,5,5s5-2.238,5-5V8c0-3.866-3.134-7-7-7S6,4.134,6,8v12c0,4.971,4.029,9,9,9s9-4.029,9-9V8H22z" />
    </svg>
  )
}

export default function File ({ block }) {
  const BLOG = useConfig()
  const { recordMap } = useNotionContext()
  const href = getHtmlFileUrl(BLOG.path, block.id)

  return (
    <div className="notion-file">
      <a
        className="notion-file-link"
        href={href}
        target="_blank"
        rel="noopener noreferrer"
      >
        <FileIcon className="notion-file-icon" />
        <div className="notion-file-info">
          <div className="notion-file-title">
            <Text value={block?.properties?.title || [['File']]} block={block} />
          </div>
          {block?.properties?.size && (
            <div className="notion-file-size">
              <Text value={block.properties.size} block={block} />
            </div>
          )}
        </div>
      </a>
    </div>
  )
}
