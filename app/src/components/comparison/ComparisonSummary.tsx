import type { ComparisonSummary as ComparisonSummaryData } from '@/types/comparison'

export function ComparisonSummary({
  reviewerCount,
  peerMindFindingCount,
  summary,
}: {
  reviewerCount: number
  peerMindFindingCount: number
  summary: ComparisonSummaryData
}) {
  const stats = [
    { label: 'Reviewers', value: reviewerCount },
    { label: 'PeerMind findings', value: peerMindFindingCount },
    { label: 'Shared weaknesses', value: summary.sharedCount },
    { label: 'Reviewer-only weaknesses', value: summary.humanOnlyCount },
    { label: 'PeerMind-only', value: summary.peerMindOnlyCount },
  ]
  const questionStats =
    summary.questionCount != null
      ? [
          { label: 'Questions', value: summary.questionCount },
          { label: 'Restate a finding', value: summary.questionMappedCount ?? 0 },
          { label: 'Open questions', value: summary.questionOpenCount ?? 0 },
        ]
      : []

  return (
    <div className="grid gap-3">
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
      {questionStats.length > 0 ? (
        <div className="grid grid-cols-3 gap-3 max-[760px]:grid-cols-1">
          {questionStats.map((stat) => (
            <div key={stat.label} className="rounded-[11px] border border-pm-line bg-pm-surface p-4">
              <p className="text-[12px] font-bold tracking-[0.08em] text-pm-muted uppercase">
                {stat.label}
              </p>
              <p className="type-stat mt-2 text-pm-ink">{stat.value}</p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
