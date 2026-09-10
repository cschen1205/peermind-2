import { cn } from '@/lib/utils'
import { REVISION_STATUS_LABELS, type RevisionIssueStatus } from '@/types/revision'

const STATUS_CLASS: Record<RevisionIssueStatus, string> = {
  addressed: 'bg-pm-status-verified-fill text-pm-status-verified',
  partially_addressed: 'bg-pm-status-supported-fill text-pm-status-supported',
  remaining: 'bg-pm-status-refuted-fill text-pm-status-refuted',
  new: 'bg-pm-accent-soft text-pm-accent',
}

export function RevisionStatusPill({
  status,
  className,
}: {
  status: RevisionIssueStatus
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-[5px] px-2 py-1 text-[12px] font-bold tracking-[0.02em]',
        STATUS_CLASS[status],
        className,
      )}
    >
      {REVISION_STATUS_LABELS[status]}
    </span>
  )
}
