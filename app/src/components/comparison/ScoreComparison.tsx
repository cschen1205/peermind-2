import { groupAverage, type Scorecard } from '@/data/extractReviewScores'
import { cn } from '@/lib/utils'

function formatScore(cell: { score: string; scale: string; scaleLabel: string } | undefined) {
  if (!cell) return null
  return (
    <div>
      <p className="font-[650] text-pm-ink">
        {cell.score}
        <span className="text-[13px] font-normal text-pm-muted"> / {cell.scale}</span>
      </p>
      {cell.scaleLabel ? (
        <p className="mt-0.5 text-[12px] leading-snug text-pm-muted">{cell.scaleLabel}</p>
      ) : null}
    </div>
  )
}

export function ScoreComparison({ scorecard }: { scorecard: Scorecard }) {
  const headerCell =
    'bg-pm-bg-subtle px-3 py-2 text-[12px] font-bold tracking-[0.08em] text-pm-muted uppercase'
  const bodyCell = 'px-3 py-3 align-top text-[14px] text-pm-ink'

  return (
    <section>
      <p className="eyebrow mb-3">Score comparison</p>
      <p className="mb-3 text-[13px] text-pm-muted">
        Official review scores from the comparison inputs, shown next to the locked PeerMind
        ratings. ChatGPT scores are self-assigned by that review and can be wrong; they are not
        a verification result. Prepared OpenReview scores are stored with each reviewer;
        uploaded files are parsed from Soundness / Presentation / Contribution / Rating /
        Confidence lines.
      </p>
      <div className="overflow-x-auto rounded-[11px] border border-pm-line bg-pm-surface">
        <table className="w-full min-w-[560px] border-collapse text-left">
          <thead>
            <tr className="border-b border-pm-line">
              <th className={cn(headerCell, 'min-w-[120px]')} rowSpan={2}>
                Metric
              </th>
              {scorecard.groups.map((group) => (
                <th
                  key={group.source}
                  className={headerCell}
                  colSpan={group.columnIds.length}
                >
                  {group.source}
                  {group.columnIds.length > 1 ? (
                    <span className="mt-0.5 block font-medium tracking-normal text-pm-muted normal-case">
                      {group.columnIds.length} reviewers
                    </span>
                  ) : null}
                </th>
              ))}
            </tr>
            <tr className="border-b border-pm-line">
              {scorecard.columns.map((column) => (
                <th key={column.id} className={cn(headerCell, 'min-w-[88px] font-medium normal-case tracking-normal')}>
                  {column.short}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {scorecard.metrics.map((row) => (
              <tr key={row.label} className="border-t border-pm-line">
                <td className={cn(bodyCell, 'font-[650]')}>{row.label}</td>
                {scorecard.columns.map((column) => (
                  <td key={column.id} className={bodyCell}>
                    {formatScore(row.cells[column.id]) ?? (
                      <span className="text-pm-muted">—</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {scorecard.groups
        .filter((group) => group.columnIds.length > 1)
        .map((group) => {
          const rating = scorecard.metrics.find((row) => row.label === 'Rating')
          const summary = rating ? groupAverage(rating, group.columnIds) : undefined
          if (!summary) return null
          return (
            <p key={group.source} className="mt-2 text-[13px] text-pm-muted">
              {group.source} rating average {summary.mean.toFixed(1)} / {summary.scale} (range{' '}
              {summary.min}–{summary.max}, n={summary.count}).
            </p>
          )
        })}
    </section>
  )
}
