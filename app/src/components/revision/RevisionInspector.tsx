import { RevisionStatusPill } from '@/components/revision/RevisionStatusPill'
import { REVISION_SEVERITY_LABELS, type RevisionIssue } from '@/types/revision'

export function RevisionInspector({ issue }: { issue?: RevisionIssue }) {
  if (!issue) {
    return (
      <div>
        <p className="eyebrow mb-3">Selected issue</p>
        <p className="text-[14px] text-pm-muted">Select an issue to inspect the revision check.</p>
      </div>
    )
  }

  return (
    <div>
      <p className="eyebrow mb-3">Selected issue</p>
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-[12px] text-pm-accent">{issue.id}</span>
        <RevisionStatusPill status={issue.status} />
        <span className="rounded-[5px] bg-pm-status-unverified-fill px-2 py-1 text-[12px] font-bold text-pm-muted-2">
          {REVISION_SEVERITY_LABELS[issue.severity]}
        </span>
      </div>
      <p className="type-h3 mt-3">{issue.title}</p>

      <section className="mt-5 rounded-[11px] border border-pm-line bg-pm-bg p-4">
        <p className="eyebrow">Original review</p>
        <p className="type-paper mt-2 text-pm-ink">{issue.originalAllegation}</p>
      </section>

      <section className="mt-4 rounded-[11px] border border-pm-line bg-pm-bg p-4">
        <p className="eyebrow">Updated paper</p>
        <p className="type-paper mt-2 text-pm-ink">{issue.revisionEvidence}</p>
      </section>

      <section className="mt-4 rounded-[11px] border border-pm-accent-line bg-pm-accent-soft/35 p-4">
        <p className="eyebrow">PeerMind check</p>
        <p className="type-paper mt-2 text-pm-ink">{issue.assessment}</p>
      </section>

      {issue.sourceRefs.length > 0 ? (
        <p className="mt-4 text-[12px] text-pm-muted">{issue.sourceRefs.join(' · ')}</p>
      ) : null}
    </div>
  )
}
