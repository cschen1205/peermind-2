import { FINDING_VALIDITY_LABELS, type FindingValidity } from '@/types/finding'
import { cn } from '@/lib/utils'

const FILTER_ORDER: FindingValidity[] = [
  'verified',
  'supported',
  'refuted',
  'unverified',
  'disputed',
  'human_required',
  'not_checked',
]

const COUNT_CLASS: Record<FindingValidity, string> = {
  verified: 'text-pm-status-verified',
  supported: 'text-pm-status-supported',
  refuted: 'text-pm-status-refuted',
  unverified: 'text-pm-status-unverified',
  disputed: 'text-pm-status-disputed',
  human_required: 'text-pm-status-human',
  not_checked: 'text-pm-status-unverified',
}

export function TrustProfile({
  counts,
}: {
  counts: Record<FindingValidity, number>
}) {
  const visible = FILTER_ORDER.filter((status) => counts[status] > 0)

  return (
    <div>
      <p className="eyebrow mb-3">Trust profile</p>
      <div className="grid grid-cols-4 gap-3 max-[1100px]:grid-cols-2 max-[760px]:grid-cols-1">
        {visible.map((status) => (
          <div
            key={status}
            className="rounded-[11px] border border-pm-line bg-pm-surface p-5"
          >
            <p className={cn('type-stat', COUNT_CLASS[status])}>{counts[status]}</p>
            <p className="mt-2 text-[13px] font-[650] text-pm-ink">
              {FINDING_VALIDITY_LABELS[status]}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
