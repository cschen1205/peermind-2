import { getAgentLabel } from '@/data/queryPackage'
import type { DemoDataPackage } from '@/types/demoPackage'
import type { ReplanEvent } from '@/types/investigation'

export function ReplanStatus({
  pkg,
  replan,
}: {
  pkg: DemoDataPackage
  replan?: ReplanEvent
}) {
  if (!replan) return null

  const agents = replan.spawnedAgentIds.map((id) => getAgentLabel(pkg, id))

  return (
    <aside className="rounded-[8px] border-l-[3px] border-pm-status-supported bg-pm-status-supported-fill px-4 py-3.5">
      <p className="text-[12px] font-bold tracking-[0.15em] text-pm-status-supported uppercase">
        Evidence gap
      </p>
      <p className="mt-2 text-[14px] text-pm-ink">{replan.reason}</p>
      <p className="mt-2 text-[13px] text-pm-muted">
        Replan {replan.attempt} / {replan.maxAttempts}
      </p>
      {agents.length > 0 ? (
        <ul className="mt-2 grid gap-1 text-[14px] text-pm-ink">
          {agents.map((label) => (
            <li key={label}>→ {label}</li>
          ))}
        </ul>
      ) : null}
      {replan.requestedEvidence.length > 0 ? (
        <ul className="mt-2 grid gap-1 text-[13px] text-pm-muted">
          {replan.requestedEvidence.map((item) => (
            <li key={item}>Requested: {item}</li>
          ))}
        </ul>
      ) : null}
    </aside>
  )
}
