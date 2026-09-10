import { Lock, TriangleAlert, User } from 'lucide-react'
import type { FindingValidity } from '@/types/finding'
import { FINDING_VALIDITY_LABELS } from '@/types/finding'
import { cn } from '@/lib/utils'

const STATUS_CLASS: Record<FindingValidity, string> = {
  verified: 'bg-pm-status-verified-fill text-pm-status-verified',
  supported: 'bg-pm-status-supported-fill text-pm-status-supported',
  refuted: 'bg-pm-status-refuted-fill text-pm-status-refuted',
  unverified: 'bg-pm-status-unverified-fill text-pm-status-unverified',
  disputed: 'bg-pm-status-disputed-fill text-pm-status-disputed',
  human_required: 'bg-pm-status-human-fill text-pm-status-human',
  not_checked: 'bg-pm-status-unverified-fill text-pm-status-unverified',
}

export function StatusPill({
  status,
  className,
}: {
  status: FindingValidity
  className?: string
}) {
  const Icon = status === 'human_required' ? User : status === 'supported' ? TriangleAlert : null

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-[5px] px-2 py-1 text-[12px] font-bold tracking-[0.02em]',
        STATUS_CLASS[status],
        className,
      )}
    >
      {status === 'human_required' ? <Lock size={12} strokeWidth={2} /> : null}
      {Icon && status !== 'human_required' ? <Icon size={12} strokeWidth={2} /> : null}
      {FINDING_VALIDITY_LABELS[status]}
    </span>
  )
}
