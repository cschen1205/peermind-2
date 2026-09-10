import type { ComparisonSummary as ComparisonSummaryData } from '@/types/comparison'

export function ComparisonSummary({
  humanReviewerCount,
  peerMindFindingCount,
  summary,
}: {
  humanReviewerCount: number
  peerMindFindingCount: number
  summary: ComparisonSummaryData
}) {
  const stats = [
    { label: 'Human reviewers', value: humanReviewerCount },
    { label: 'PeerMind findings', value: peerMindFindingCount },
    { label: 'Shared', value: summary.sharedCount },
    { label: 'Human-only', value: summary.humanOnlyCount },
    { label: 'PeerMind-only', value: summary.peerMindOnlyCount },
  ]

  return (
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
  )
}
