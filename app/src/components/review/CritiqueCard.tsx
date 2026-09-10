import { Link } from 'react-router-dom'
import { StatusPill } from '@/components/StatusPill'
import { SourceLink } from '@/components/paper/SourceLink'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { getAgentLabel } from '@/data/queryPackage'
import { cn } from '@/lib/utils'
import { useDemoStore } from '@/store/demoStore'
import type { DemoDataPackage } from '@/types/demoPackage'
import type { FindingRecord } from '@/types/finding'

export function CritiqueCard({
  finding,
  pkg,
  onInspect,
  embedded = false,
}: {
  finding: FindingRecord
  pkg: DemoDataPackage
  onInspect: (findingId: string) => void
  embedded?: boolean
}) {
  const selectedFindingId = useDemoStore((s) => s.selectedFindingId)
  const focusSelection = useDemoStore((s) => s.focusSelection)
  const agent = getAgentLabel(pkg, finding.reviewerAgentId)
  const selected = selectedFindingId === finding.id

  const body = (
    <>
      {embedded ? (
        <>
          <p className="type-quote">{finding.critique}</p>
          <p className="mt-4 text-[13px] text-pm-muted">Reviewer: {agent}</p>
        </>
      ) : (
        <button
          type="button"
          className="w-full text-left"
          onClick={() => {
            focusSelection({ sourceIds: finding.sourceIds, findingId: finding.id })
          }}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[12px] text-pm-accent">{finding.id}</span>
            <span className="rounded-[5px] bg-pm-status-unverified-fill px-2 py-1 text-[12px] font-bold text-pm-muted-2">
              {finding.category}
            </span>
            <StatusPill status={finding.validity} className="ml-auto" />
          </div>
          <p className="type-quote mt-4">{finding.critique}</p>
          <p className="mt-4 text-[13px] text-pm-muted">Reviewer: {agent}</p>
        </button>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-[12px] text-pm-muted">Source path</span>
        {finding.sourceIds.map((id) => (
          <SourceLink key={id} sourceId={id} />
        ))}
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <Button variant="secondary" size="sm" onClick={() => onInspect(finding.id)}>
          Inspect contract
        </Button>
        <Link to={`/challenge/${finding.id}`}>
          <Button
            size="sm"
            onClick={() =>
              focusSelection({ sourceIds: finding.sourceIds, findingId: finding.id })
            }
          >
            Challenge →
          </Button>
        </Link>
      </div>
    </>
  )

  if (embedded) return <div>{body}</div>

  return (
    <Card
      className={cn(
        'rounded-[11px] p-[22px] shadow-none ring-0 transition-[border-color,box-shadow] hover:border-pm-finding-hover-line hover:[box-shadow:var(--pm-shadow-card-hover)]',
        selected && 'border-pm-accent bg-pm-accent-soft/30',
      )}
    >
      {body}
    </Card>
  )
}
