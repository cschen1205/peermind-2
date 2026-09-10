import { Search } from 'lucide-react'
import { EmptyState } from '@/components/EmptyState'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  NODE_TYPE_LABELS,
  SOURCE_TYPE_LABELS,
  findingsForSources,
  getNode,
  getSource,
  neighborNodes,
  sourceLocation,
} from '@/data/queryPackage'
import { cn } from '@/lib/utils'
import { useDemoStore } from '@/store/demoStore'
import { SourceLink } from './SourceLink'

export function SourceInspector({
  onRevealSource,
  className,
}: {
  onRevealSource?: () => void
  className?: string
} = {}) {
  const pkg = useDemoStore((s) => s.package)
  const selectedPaperNodeId = useDemoStore((s) => s.selectedPaperNodeId)
  const selectedSourceIds = useDemoStore((s) => s.selectedSourceIds)
  const focusSelection = useDemoStore((s) => s.focusSelection)
  const openAsk = useDemoStore((s) => s.openAsk)

  if (!pkg) {
    return (
      <div className={cn('flex min-h-0 flex-1 flex-col', className)}>
        <p className="eyebrow mb-3">Inspector</p>
        <EmptyState
          title="Load a package to inspect sources."
          description="Graph nodes and excerpts appear here after a valid package is loaded."
        />
      </div>
    )
  }

  const node = selectedPaperNodeId ? getNode(pkg, selectedPaperNodeId) : undefined
  const source = getSource(pkg, selectedSourceIds[0] ?? node?.sourceIds[0] ?? '')
  const connectedNodes = node ? neighborNodes(pkg, node.id) : []
  const connectedFindings = findingsForSources(pkg, selectedSourceIds)

  function openSource() {
    if (!source) return
    onRevealSource?.()
    window.setTimeout(() => {
      document.getElementById(`source-card-${source.id}`)?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      })
    }, 50)
  }

  if (!source && !node) {
    return (
      <div className={cn('flex min-h-0 flex-1 flex-col', className)}>
        <p className="eyebrow mb-3">Inspector</p>
        <EmptyState
          title="Select a graph node"
          description="The inspector shows the record ID, type, source location, excerpt, and connected records."
        />
      </div>
    )
  }

  return (
    <div className={cn('flex min-h-0 flex-1 flex-col', className)}>
      <p className="eyebrow mb-3">Inspector</p>
      <ScrollArea className="min-h-0 flex-1 pr-2">
        {node ? (
          <div className="mb-4">
            <p className="font-mono text-[12px] text-pm-accent">{node.id}</p>
            <p className="mt-1 text-[12px] font-bold tracking-[0.08em] text-pm-muted uppercase">
              {NODE_TYPE_LABELS[node.type]}
            </p>
            <h3 className="type-h3 mt-2">{node.label}</h3>
            {node.summary ? (
              <p className="mt-2 text-[14px] text-pm-muted">{node.summary}</p>
            ) : null}
          </div>
        ) : null}

        {source ? (
          <div className="rounded-[8px] border border-pm-line bg-pm-bg-subtle p-3.5">
            <p className="font-mono text-[12px] text-pm-accent">{source.id}</p>
            <p className="mt-1 text-[12px] font-bold tracking-[0.08em] text-pm-muted uppercase">
              {SOURCE_TYPE_LABELS[source.type]}
            </p>
            <p className="mt-2 text-[15px] font-[650]">{source.label}</p>
            <p className="mt-1 text-[13px] text-pm-muted">{sourceLocation(pkg, source) || '—'}</p>
            {source.excerpt ? (
              <p className="type-paper mt-3 text-pm-ink">{source.excerpt}</p>
            ) : null}
          </div>
        ) : null}

        {connectedNodes.length > 0 ? (
          <div className="mt-4">
            <p className="text-[12px] font-bold tracking-[0.08em] text-pm-muted uppercase">
              Connected records
            </p>
            <ul className="mt-2 grid gap-1">
              {connectedNodes.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className="w-full rounded-[8px] px-2 py-1.5 text-left text-[13px] text-pm-muted hover:bg-pm-accent-soft hover:text-pm-accent"
                    onClick={() =>
                      focusSelection({ sourceIds: item.sourceIds, paperNodeId: item.id })
                    }
                  >
                    <span className="font-mono text-[12px]">{item.id}</span>
                    <span className="ml-2">{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {connectedFindings.length > 0 ? (
          <div className="mt-4">
            <p className="text-[12px] font-bold tracking-[0.08em] text-pm-muted uppercase">
              Referenced by findings
            </p>
            <ul className="mt-2 grid gap-1">
              {connectedFindings.map((finding) => (
                <li key={finding.id} className="px-2 py-1.5 text-[13px] text-pm-muted">
                  <span className="font-mono text-[12px] text-pm-accent">{finding.id}</span>
                  <span className="ml-2">{finding.category}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {source ? (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-[12px] text-pm-muted">Sources</span>
            {selectedSourceIds.map((id) => (
              <SourceLink key={id} sourceId={id} />
            ))}
          </div>
        ) : null}
      </ScrollArea>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="secondary" size="sm" disabled={!source} onClick={openSource}>
          Open source
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={!source}
          onClick={() => openAsk('source', source ? [source.id] : [])}
        >
          <Search size={14} strokeWidth={1.75} />
          Ask about this source
        </Button>
      </div>
    </div>
  )
}
