import { Link } from 'react-router-dom'
import { SourceLink } from '@/components/paper/SourceLink'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { getAgentLabel, getNode } from '@/data/queryPackage'
import { cn } from '@/lib/utils'
import { useDemoStore } from '@/store/demoStore'
import type { DemoDataPackage } from '@/types/demoPackage'
import { SEVERITY_LEVEL_LABELS, type FindingRecord } from '@/types/finding'

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
  const targetClaim = finding.targetClaimId ? getNode(pkg, finding.targetClaimId) : undefined
  const selected = selectedFindingId === finding.id

  const meta = (
    <>
      <p className="mt-4 text-[13px] text-pm-muted">
        Proposed severity: {SEVERITY_LEVEL_LABELS[finding.proposedSeverity]}
      </p>
      <p className="mt-1 text-[13px] text-pm-muted">Reviewer: {agent}</p>
      {finding.targetClaimId ? (
        <p className="mt-1 text-[13px] text-pm-muted">
          Target claim: {targetClaim?.label ?? finding.targetClaimId}
        </p>
      ) : null}
    </>
  )

  const body = (
    <>
      {embedded ? (
        <>
          <p className="type-quote">{finding.critique}</p>
          {meta}
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
          </div>
          <p className="type-quote mt-4">{finding.critique}</p>
          {meta}
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
        <Link to={`/verify/${finding.id}`}>
          <Button
            size="sm"
            onClick={() =>
              focusSelection({ sourceIds: finding.sourceIds, findingId: finding.id })
            }
          >
            Verify →
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
