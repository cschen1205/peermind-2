import type { RevisionCheckResult } from '@/types/revision'
import { summarizeRevisionIssues } from '@/types/revision'

export function RevisionSummary({ result }: { result: RevisionCheckResult }) {
  const counts = summarizeRevisionIssues(result.issues)
  const scoreDelta = result.updatedScore.overall - result.priorScore.overall
  const deltaLabel = scoreDelta > 0 ? `+${scoreDelta}` : `${scoreDelta}`

  const stats = [
    { label: 'Addressed', value: counts.addressed },
    { label: 'Partial', value: counts.partiallyAddressed },
    { label: 'Remaining', value: counts.remaining },
    { label: 'New issues', value: counts.newIssues },
    { label: 'Score change', value: deltaLabel },
  ]

  return (
    <div>
      <div className="grid grid-cols-5 gap-3 max-[1100px]:grid-cols-2 max-[760px]:grid-cols-1">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-[11px] border border-pm-line bg-pm-surface p-4">
            <p className="text-[12px] font-bold tracking-[0.08em] text-pm-muted uppercase">
              {stat.label}
            </p>
            <p className="type-stat mt-2 text-pm-ink">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 max-[760px]:grid-cols-1">
        <div className="rounded-[11px] border border-pm-line bg-pm-surface p-4">
          <p className="text-[12px] font-bold tracking-[0.08em] text-pm-muted uppercase">
            Prior review
          </p>
          <p className="mt-2 text-[22px] font-[650] text-pm-ink">
            {result.priorScore.overall}
            <span className="text-[13px] font-normal text-pm-muted">
              {' '}
              / {result.priorScore.scale}
            </span>
          </p>
          <p className="mt-1 text-[13px] text-pm-muted">{result.priorScore.label}</p>
        </div>
        <div className="rounded-[11px] border border-pm-accent-line bg-pm-accent-soft/40 p-4">
          <p className="text-[12px] font-bold tracking-[0.08em] text-pm-muted uppercase">
            After revision check
          </p>
          <p className="mt-2 text-[22px] font-[650] text-pm-ink">
            {result.updatedScore.overall}
            <span className="text-[13px] font-normal text-pm-muted">
              {' '}
              / {result.updatedScore.scale}
            </span>
          </p>
          <p className="mt-1 text-[13px] text-pm-muted">{result.updatedScore.label}</p>
        </div>
      </div>
    </div>
  )
}
