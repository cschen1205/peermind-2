import type { Components } from 'react-markdown'
import ReactMarkdown from 'react-markdown'
import rehypeKatex from 'rehype-katex'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import { normalizeMathDelimiters } from '@/lib/markdown'
import { cn } from '@/lib/utils'
import 'katex/dist/katex.min.css'

const components: Components = {
  a({ href, children }) {
    if (
      !href ||
      !(
        href.startsWith('http://') ||
        href.startsWith('https://') ||
        href.startsWith('#') ||
        href.startsWith('/')
      )
    ) {
      return <span>{children}</span>
    }
    const external = href.startsWith('http://') || href.startsWith('https://')
    return (
      <a href={href} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}>
        {children}
      </a>
    )
  },
}

export function MarkdownView({
  children,
  className,
}: {
  children: string
  className?: string
}) {
  return (
    <div className={cn('pm-markdown', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[[rehypeKatex, { throwOnError: false }]]}
        components={components}
      >
        {normalizeMathDelimiters(children)}
      </ReactMarkdown>
    </div>
  )
}
