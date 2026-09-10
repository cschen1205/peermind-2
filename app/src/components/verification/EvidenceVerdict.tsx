import { StatusPill } from '@/components/StatusPill'
import type { EvidenceVerdict as EvidenceVerdictValue } from '@/types/finding'

export function EvidenceVerdict({
  status,
  limitations,
  stopReason,
}: {
  status: EvidenceVerdictValue
  limitations: string[]
  stopReason?: string
}) {
  return (
    <div className="rounded-[11px] border border-pm-line bg-pm-surface p-5">
      <p className="eyebrow mb-3">Evidence verdict</p>
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-[14px] font-[650]">Current evidence verdict</span>
        <StatusPill status={status} kind="verdict" />
      </div>
      {stopReason ? (
        <div className="mt-4 rounded-[8px] border-l-[3px] border-pm-accent bg-pm-accent-soft px-4 py-3">
          <p className="text-[12px] font-bold tracking-[0.15em] text-pm-accent uppercase">
            Stop rule reached
          </p>
          <p className="mt-1 text-[14px] text-pm-ink">{stopReason}</p>
        </div>
      ) : null}
      {limitations.length > 0 ? (
        <div className="mt-4">
          <p className="text-[12px] font-bold tracking-[0.08em] text-pm-muted uppercase">
            Current limit
          </p>
          <ul className="mt-2 grid gap-1">
            {limitations.map((item) => (
              <li key={item} className="text-[14px] text-pm-ink">
                {item}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
