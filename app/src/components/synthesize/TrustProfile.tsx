import { EVIDENCE_VERDICT_LABELS, FINDING_STATUS_LABELS } from '@/types/finding'
import type { EvidenceVerdict, FindingStatus } from '@/types/finding'
import type { TrustProfile as TrustProfileCounts } from '@/data/queryPackage'
import { cn } from '@/lib/utils'

const VERDICT_ORDER: EvidenceVerdict[] = [
  'supported',
  'partially_supported',
  'refuted',
  'unverifiable',
  'open_question',
]

const STATUS_ORDER: FindingStatus[] = [
  'verified_high_impact',
  'verified_moderate_impact',
  'verified_low_impact',
  'partially_supported',
  'refuted',
  'unverifiable',
  'open_question',
  'severity_downgraded',
]

const VERDICT_CLASS: Record<EvidenceVerdict, string> = {
  supported: 'text-pm-status-verified',
  partially_supported: 'text-pm-status-supported',
  refuted: 'text-pm-status-refuted',
  unverifiable: 'text-pm-status-unverified',
  open_question: 'text-pm-status-supported',
}

const STATUS_CLASS: Record<FindingStatus, string> = {
  verified_high_impact: 'text-pm-status-verified',
  verified_moderate_impact: 'text-pm-status-verified',
  verified_low_impact: 'text-pm-status-verified',
  partially_supported: 'text-pm-status-supported',
  refuted: 'text-pm-status-refuted',
  unverifiable: 'text-pm-status-unverified',
  open_question: 'text-pm-status-supported',
  severity_downgraded: 'text-pm-status-supported',
}

export function TrustProfile({
  counts,
}: {
  counts: TrustProfileCounts
}) {
  const verdicts = VERDICT_ORDER.filter((status) => counts.verdicts[status] > 0)
  const statuses = STATUS_ORDER.filter((status) => counts.statuses[status] > 0)

  return (
    <div className="grid gap-8">
      <section>
        <p className="eyebrow mb-3">Evidence verdicts</p>
        <div className="grid grid-cols-4 gap-3 max-[1100px]:grid-cols-2 max-[760px]:grid-cols-1">
          {verdicts.map((status) => (
            <div key={status} className="rounded-[11px] border border-pm-line bg-pm-surface p-5">
              <p className={cn('type-stat', VERDICT_CLASS[status])}>{counts.verdicts[status]}</p>
              <p className="mt-2 text-[13px] font-[650] text-pm-ink">
                {EVIDENCE_VERDICT_LABELS[status]}
              </p>
            </div>
          ))}
        </div>
      </section>
      <section>
        <p className="eyebrow mb-3">Final statuses</p>
        <div className="grid grid-cols-4 gap-3 max-[1100px]:grid-cols-2 max-[760px]:grid-cols-1">
          {statuses.map((status) => (
            <div key={status} className="rounded-[11px] border border-pm-line bg-pm-surface p-5">
              <p className={cn('type-stat', STATUS_CLASS[status])}>{counts.statuses[status]}</p>
              <p className="mt-2 text-[13px] font-[650] text-pm-ink">
                {FINDING_STATUS_LABELS[status]}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
