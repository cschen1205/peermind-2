import { RevisionStatusPill } from '@/components/revision/RevisionStatusPill'
import { cn } from '@/lib/utils'
import {
  REVISION_SEVERITY_LABELS,
  type RevisionIssue,
  type RevisionIssueStatus,
} from '@/types/revision'

export type RevisionFilter = 'all' | RevisionIssueStatus

export const REVISION_FILTERS: { id: RevisionFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'addressed', label: 'Addressed' },
  { id: 'partially_addressed', label: 'Partial' },
  { id: 'remaining', label: 'Remaining' },
  { id: 'new', label: 'New' },
]

export function RevisionIssueList({
  issues,
  selectedId,
  filter,
  onFilter,
  onSelect,
}: {
  issues: RevisionIssue[]
  selectedId?: string
  filter: RevisionFilter
  onFilter: (filter: RevisionFilter) => void
  onSelect: (id: string) => void
}) {
  const visible = issues.filter((issue) => filter === 'all' || issue.status === filter)

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow mb-1">Issue ledger</p>
          <h2 className="text-[17px] font-[650] text-pm-ink">What the revision did</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {REVISION_FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={cn(
                'rounded-[5px] px-2 py-1 text-[12px] font-bold',
                filter === item.id
                  ? 'bg-pm-accent-soft text-pm-accent'
                  : 'bg-pm-status-unverified-fill text-pm-muted-2',
              )}
              onClick={() => onFilter(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        {visible.length === 0 ? (
          <p className="rounded-[11px] border border-pm-line bg-pm-surface p-4 text-[14px] text-pm-muted">
            No issues in this filter.
          </p>
        ) : (
          visible.map((issue) => {
            const selected = issue.id === selectedId
            return (
              <button
                key={issue.id}
                type="button"
                className={cn(
                  'rounded-[11px] border border-pm-line bg-pm-surface p-[18px] text-left transition-[border-color,box-shadow] hover:border-pm-finding-hover-line hover:[box-shadow:var(--pm-shadow-card-hover)]',
                  selected && 'border-pm-accent bg-pm-accent-soft/30',
                )}
                onClick={() => onSelect(issue.id)}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[12px] text-pm-accent">{issue.id}</span>
                  <RevisionStatusPill status={issue.status} />
                  <span className="rounded-[5px] bg-pm-status-unverified-fill px-2 py-1 text-[12px] font-bold text-pm-muted-2">
                    {REVISION_SEVERITY_LABELS[issue.severity]}
                  </span>
                </div>
                <p className="mt-3 text-[15px] font-[650] text-pm-ink">{issue.title}</p>
                <p className="mt-2 line-clamp-2 text-[14px] text-pm-muted">
                  {issue.assessment}
                </p>
              </button>
            )
          })
        )}
      </div>
    </section>
  )
}
