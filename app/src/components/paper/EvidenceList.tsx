import { EvidenceHighlight } from './EvidenceHighlight'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import type { DemoDataPackage } from '@/types/demoPackage'
import type { SourceRecord } from '@/types/paper'

function orderedSources(sourceRecords: SourceRecord[], activeSourceIds: string[]) {
  return [...sourceRecords].sort((a, b) => {
    const aActive = activeSourceIds.includes(a.id) ? 0 : 1
    const bActive = activeSourceIds.includes(b.id) ? 0 : 1
    if (aActive !== bActive) return aActive - bActive
    return (a.page ?? 0) - (b.page ?? 0)
  })
}

export function EvidenceList({
  sourceRecords,
  activeSourceIds,
  pkg,
  onSourceSelect,
  className,
  showEyebrow = true,
}: {
  sourceRecords: SourceRecord[]
  activeSourceIds: string[]
  pkg: DemoDataPackage
  onSourceSelect: (sourceId: string) => void
  className?: string
  showEyebrow?: boolean
}) {
  const primaryId = activeSourceIds[0]
  const ordered = orderedSources(sourceRecords, activeSourceIds)

  return (
    <div className={cn('flex min-h-0 flex-1 flex-col', className)}>
      {showEyebrow ? <p className="eyebrow mb-3">Evidence</p> : null}
      <ScrollArea className="min-h-0 flex-1 pr-2">
        <div className="grid gap-2.5">
          {ordered.map((source) => (
            <EvidenceHighlight
              key={source.id}
              source={source}
              selected={source.id === primaryId}
              pkg={pkg}
              onSelect={onSourceSelect}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
