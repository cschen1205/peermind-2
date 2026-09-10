import { cn } from '@/lib/utils'
import type {
  ComparisonAgentSummary,
  ComparisonCalloutTag,
  ComparisonPartyId,
} from '@/types/comparison'

const TAG_LABEL: Record<ComparisonCalloutTag, string> = {
  incorrect: 'Incorrect',
  too_broad: 'Too broad',
  missed: 'Missed',
  shared: 'Compared',
}

const TAG_CLASS: Record<ComparisonCalloutTag, string> = {
  incorrect: 'bg-pm-status-disputed-fill text-pm-status-disputed',
  too_broad: 'bg-pm-status-supported-fill text-pm-status-supported',
  missed: 'bg-pm-accent-soft text-pm-accent',
  shared: 'bg-pm-status-verified-fill text-pm-status-verified',
}

const CARD_CLASS: Record<ComparisonCalloutTag, string> = {
  incorrect: 'border-pm-status-disputed bg-pm-status-disputed-fill',
  too_broad: 'border-pm-status-supported bg-pm-status-supported-fill',
  missed: 'border-pm-accent-line bg-pm-accent-soft',
  shared: 'border-pm-status-verified bg-pm-status-verified-fill',
}

const PARTY_ACCENT: Record<ComparisonPartyId, string> = {
  chatgpt: 'text-pm-status-disputed',
  openreview: 'text-pm-ink',
  peermind: 'text-pm-accent',
}

export function ComparisonAgentReport({
  summary,
  onSelect,
}: {
  summary: ComparisonAgentSummary
  onSelect?: (themeId?: string) => void
}) {
  return (
    <section className="mt-6 rounded-[13px] border-2 border-pm-accent-line bg-pm-surface p-6">
      <p className="eyebrow">{summary.agentLabel}</p>
      <h2 className="type-h2 mt-2 max-w-[36ch]">{summary.headline}</h2>
      <p className="mt-3 max-w-[72ch] text-[16px] leading-relaxed text-pm-ink">{summary.verdict}</p>

      {summary.parties && summary.parties.length > 0 ? (
        <div className="mt-6 grid grid-cols-3 gap-3 max-[1100px]:grid-cols-1">
          {summary.parties.map((party) => (
            <div key={party.id} className="rounded-[11px] border border-pm-line bg-pm-bg p-4">
              <p className={cn('text-[13px] font-bold tracking-[0.08em] uppercase', PARTY_ACCENT[party.id])}>
                {party.label}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <p className="type-stat text-pm-ink">{party.raisedCount}</p>
                  <p className="mt-1 text-[12px] font-bold text-pm-muted uppercase">Raised</p>
                </div>
                <div>
                  <p className="type-stat text-pm-ink">{party.missedCount}</p>
                  <p className="mt-1 text-[12px] font-bold text-pm-muted uppercase">Missed</p>
                </div>
                <div>
                  <p className="type-stat text-pm-status-disputed">{party.incorrectCount}</p>
                  <p className="mt-1 text-[12px] font-bold text-pm-muted uppercase">Incorrect</p>
                </div>
                <div>
                  <p className="type-stat text-pm-status-supported">{party.tooBroadCount}</p>
                  <p className="mt-1 text-[12px] font-bold text-pm-muted uppercase">Too broad</p>
                </div>
              </div>
              <p className="mt-3 text-[13px] leading-relaxed text-pm-ink">{party.note}</p>
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-6 grid grid-cols-2 gap-3 max-[1100px]:grid-cols-1">
        {summary.callouts.map((callout) => (
          <button
            key={callout.id}
            type="button"
            className={cn(
              'rounded-[11px] border p-4 text-left',
              CARD_CLASS[callout.tag],
              callout.themeId && 'cursor-pointer',
            )}
            onClick={() => {
              if (callout.themeId) onSelect?.(callout.themeId)
            }}
          >
            <span
              className={cn(
                'inline-flex rounded-[5px] px-2 py-1 text-[12px] font-bold tracking-[0.08em] uppercase',
                TAG_CLASS[callout.tag],
              )}
            >
              {TAG_LABEL[callout.tag]} · {callout.reviewerLabel}
            </span>
            <p className="mt-3 text-[16px] font-[650] text-pm-ink">{callout.title}</p>
            <p className="mt-2 text-[14px] leading-relaxed text-pm-ink">{callout.detail}</p>
          </button>
        ))}
      </div>
    </section>
  )
}
