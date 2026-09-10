import { useEffect, useRef } from 'react'
import { highlightClass } from '@/styles/graphStyles'
import { sourceLocation } from '@/data/queryPackage'
import { cn } from '@/lib/utils'
import type { DemoDataPackage } from '@/types/demoPackage'
import type { SourceRecord } from '@/types/paper'

export function EvidenceHighlight({
  source,
  selected,
  pkg,
  onSelect,
}: {
  source: SourceRecord
  selected: boolean
  pkg: DemoDataPackage
  onSelect: (sourceId: string) => void
}) {
  const role = source.highlightRegions?.[0]?.role
  const location = sourceLocation(pkg, source)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (selected) {
      cardRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }, [selected])

  return (
    <div
      ref={cardRef}
      id={`source-card-${source.id}`}
      role="button"
      tabIndex={0}
      className={cn(
        'w-full cursor-pointer rounded-[8px] border border-pm-line p-3.5 text-left transition-[box-shadow]',
        highlightClass(role, selected),
      )}
      onClick={() => onSelect(source.id)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onSelect(source.id)
        }
      }}
    >
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="type-trace rounded-[5px] bg-pm-status-unverified-fill px-2 py-1 text-pm-muted">
          {source.id}
        </span>
        <span className="text-[12px] font-bold tracking-[0.02em] text-pm-muted uppercase">
          {source.type}
        </span>
        {location ? <span className="text-[12px] text-pm-muted">{location}</span> : null}
      </div>
      {source.excerpt ? (
        <p className="type-paper text-pm-ink">{source.excerpt}</p>
      ) : (
        <p className="text-[14px] text-pm-muted">{source.label}</p>
      )}
    </div>
  )
}
