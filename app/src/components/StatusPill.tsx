import type { EvidenceVerdict, FindingStatus } from '@/types/finding'
import { EVIDENCE_VERDICT_LABELS, FINDING_STATUS_LABELS } from '@/types/finding'
import { cn } from '@/lib/utils'

export type StatusPillValue = EvidenceVerdict | FindingStatus

const VERDICT_CLASS: Record<EvidenceVerdict, string> = {
  supported: 'bg-pm-status-verified-fill text-pm-status-verified',
  partially_supported: 'bg-pm-status-supported-fill text-pm-status-supported',
  refuted: 'bg-pm-status-refuted-fill text-pm-status-refuted',
  unverifiable: 'bg-pm-status-unverified-fill text-pm-status-unverified',
  open_question: 'bg-pm-status-supported-fill text-pm-status-supported',
}

const STATUS_CLASS: Record<FindingStatus, string> = {
  verified_high_impact: 'bg-pm-status-verified-fill text-pm-status-verified',
  verified_moderate_impact: 'bg-pm-status-verified-fill text-pm-status-verified',
  verified_low_impact: 'bg-pm-status-verified-fill text-pm-status-verified',
  partially_supported: 'bg-pm-status-supported-fill text-pm-status-supported',
  refuted: 'bg-pm-status-refuted-fill text-pm-status-refuted',
  unverifiable: 'bg-pm-status-unverified-fill text-pm-status-unverified',
  open_question: 'bg-pm-status-supported-fill text-pm-status-supported',
  severity_downgraded: 'bg-pm-status-supported-fill text-pm-status-supported',
}

function isFindingOnly(status: StatusPillValue): status is FindingStatus {
  return (
    status.startsWith('verified_') ||
    status === 'severity_downgraded'
  )
}

export function StatusPill({
  status,
  kind,
  className,
}: {
  status: StatusPillValue
  kind?: 'verdict' | 'status'
  className?: string
}) {
  const asStatus = kind === 'status' || (kind !== 'verdict' && isFindingOnly(status))
  const label = asStatus
    ? FINDING_STATUS_LABELS[status as FindingStatus]
    : (EVIDENCE_VERDICT_LABELS[status as EvidenceVerdict] ??
      FINDING_STATUS_LABELS[status as FindingStatus])
  const tone = asStatus
    ? STATUS_CLASS[status as FindingStatus]
    : (VERDICT_CLASS[status as EvidenceVerdict] ?? STATUS_CLASS[status as FindingStatus])

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-[5px] px-2 py-1 text-[12px] font-bold tracking-[0.02em]',
        tone,
        className,
      )}
    >
      {label}
    </span>
  )
}
