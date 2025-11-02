import { useConfig } from '@/lib/config'

const renderIcon = (network) => {
  switch (network) {
    case 'twitter':
      return (
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M23.954 4.569c-.885.389-1.83.654-2.825.775a4.958 4.958 0 0 0 2.163-2.723 9.86 9.86 0 0 1-3.127 1.194 4.92 4.92 0 0 0-8.384 4.482 13.963 13.963 0 0 1-10.141-5.15 4.822 4.822 0 0 0-.664 2.475 4.92 4.92 0 0 0 2.188 4.096 4.904 4.904 0 0 1-2.228-.616v.06a4.923 4.923 0 0 0 3.946 4.827 4.996 4.996 0 0 1-2.224.084 4.935 4.935 0 0 0 4.598 3.417 9.868 9.868 0 0 1-7.262 2.034 13.94 13.94 0 0 0 7.548 2.213c9.056 0 14.01-7.496 14.01-13.986 0-.213-.004-.425-.014-.636a9.935 9.935 0 0 0 2.46-2.548z" />
        </svg>
      )
    case 'github':
      return (
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12 0C5.372 0 0 5.373 0 12c0 5.303 3.438 9.8 8.207 11.387.6.111.793-.26.793-.577 0-.285-.01-1.04-.016-2.042-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.758-1.333-1.758-1.09-.745.083-.73.083-.73 1.205.085 1.84 1.238 1.84 1.238 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.606-2.665-.305-5.466-1.334-5.466-5.932 0-1.31.469-2.381 1.236-3.221-.124-.303-.535-1.527.117-3.184 0 0 1.008-.322 3.3 1.23a11.52 11.52 0 0 1 3.003-.404c1.02.005 2.047.138 3.003.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.657.242 2.881.119 3.184.77.84 1.235 1.911 1.235 3.221 0 4.61-2.807 5.624-5.48 5.921.43.371.823 1.102.823 2.222 0 1.606-.015 2.898-.015 3.293 0 .319.192.694.8.576C20.565 21.796 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
        </svg>
      )
    case 'linkedin':
      return (
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.036-1.852-3.036-1.853 0-2.136 1.447-2.136 2.942v5.663H9.354V9h3.414v1.561h.047c.476-.9 1.637-1.85 3.369-1.85 3.601 0 4.268 2.37 4.268 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM7.119 20.452H3.554V9h3.565v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.226.792 24 1.771 24h20.451C23.2 24 24 23.226 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
        </svg>
      )
    default:
      return null
  }
}

const SocialLinks = ({ className = '' }) => {
  const BLOG = useConfig()

  const configuredLinks = BLOG.socialLinks || {}

  const items = [
    { id: 'twitter', label: 'Twitter', href: configuredLinks.twitter || BLOG.socialLink },
    { id: 'github', label: 'GitHub', href: configuredLinks.github },
    { id: 'linkedin', label: 'LinkedIn', href: configuredLinks.linkedin }
  ].filter((item) => item.href)

  if (!items.length) return null

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {items.map((item) => (
        <a
          key={item.id}
          href={item.href}
          target="_blank"
          rel="noreferrer"
          aria-label={item.label}
          className="transition-colors hover:text-gray-900 dark:hover:text-gray-100"
        >
          {renderIcon(item.id)}
        </a>
      ))}
    </div>
  )
}

export default SocialLinks
