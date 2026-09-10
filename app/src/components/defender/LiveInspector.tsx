import { SourceLink } from '@/components/paper/SourceLink'
import { StatusPill } from '@/components/StatusPill'
import { NODE_STATE_LABELS, type NodeInspection } from '@/demo/playbackEngine'
import { getAgentLabel, getSource, sourceLocation } from '@/data/queryPackage'
import type { DemoDataPackage } from '@/types/demoPackage'
import type { EvidenceLedger } from '@/types/investigation'

const EVIDENCE_LABEL = {
  for: 'Evidence for',
  against: 'Counter-evidence',
  gap: 'Gap',
} as const

export function LiveInspector({
  pkg,
  ledger,
  message,
  inspection,
}: {
  pkg: DemoDataPackage
  ledger?: EvidenceLedger
  message?: string
  inspection?: NodeInspection
}) {
  if (!inspection) {
    return (
      <div>
        <p className="eyebrow mb-3">Current action</p>
        <p className="text-[14px] leading-relaxed text-pm-ink">
          {message ?? 'Click a workflow step to see what it does and what it produced.'}
        </p>
      </div>
    )
  }

  const sources = inspection.sourceIds
    .map((id) => getSource(pkg, id))
    .filter((source): source is NonNullable<typeof source> => Boolean(source))
  const evidence = ledger
    ? [...ledger.for, ...ledger.against, ...ledger.gaps].filter((item) =>
        inspection.evidenceIds.includes(item.id),
      )
    : []
  const agents = inspection.spawnedAgentIds.map((id) => getAgentLabel(pkg, id))

  return (
    <div className="flex min-h-0 flex-col gap-5">
      <div>
        <p className="eyebrow mb-3">Current action</p>
        <p className="text-[16px] font-[650] leading-snug text-pm-ink">{inspection.node.label}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {inspection.kindLabel ? (
            <span className="rounded-[5px] bg-pm-bg-subtle px-2 py-1 text-[12px] font-bold tracking-[0.04em] text-pm-muted uppercase">
              {inspection.kindLabel}
            </span>
          ) : null}
          <span className="text-[12px] text-pm-muted">{NODE_STATE_LABELS[inspection.state]}</span>
        </div>
      </div>

      <section>
        <p className="text-[12px] font-bold tracking-[0.08em] text-pm-muted uppercase">
          What this step does
        </p>
        <p className="mt-2 text-[14px] leading-relaxed text-pm-ink">{inspection.purpose}</p>
      </section>

      <section>
        <p className="text-[12px] font-bold tracking-[0.08em] text-pm-muted uppercase">Output</p>
        {!inspection.started ? (
          <p className="mt-2 text-[14px] leading-relaxed text-pm-muted">
            This step has not run yet. Play or step the investigation to produce its result.
          </p>
        ) : !inspection.hasOutput ? (
          <p className="mt-2 text-[14px] leading-relaxed text-pm-muted">
            This step is active, but no sources, evidence, or verdict have been written yet.
          </p>
        ) : (
          <div className="mt-2 grid gap-3">
            {inspection.message ? (
              <p className="text-[14px] leading-relaxed text-pm-ink">{inspection.message}</p>
            ) : null}

            {sources.length > 0 ? (
              <div className="rounded-[8px] border border-pm-line bg-pm-bg-subtle p-3.5">
                <p className="text-[12px] font-bold tracking-[0.08em] text-pm-muted uppercase">
                  Sources examined
                </p>
                <ul className="mt-2 grid gap-2">
                  {sources.map((source) => (
                    <li key={source.id}>
                      <p className="text-[14px] font-[650]">{source.label}</p>
                      <p className="mt-0.5 text-[12px] text-pm-muted">
                        {sourceLocation(pkg, source) || '—'}
                      </p>
                      <div className="mt-1">
                        <SourceLink sourceId={source.id} />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {evidence.length > 0 ? (
              <ul className="grid gap-2">
                {evidence.map((item) => (
                  <li
                    key={item.id}
                    className="rounded-[8px] border border-pm-line bg-pm-bg-subtle p-3.5"
                  >
                    <p className="text-[12px] font-bold tracking-[0.08em] text-pm-muted uppercase">
                      {EVIDENCE_LABEL[item.direction]}
                    </p>
                    <p className="mt-1 text-[14px] leading-relaxed text-pm-ink">{item.summary}</p>
                  </li>
                ))}
              </ul>
            ) : null}

            {agents.length > 0 ? (
              <p className="text-[14px] text-pm-ink">
                Specialist called: {agents.join(', ')}
              </p>
            ) : null}

            {inspection.replan ? (
              <div className="rounded-[8px] border-l-[3px] border-pm-status-supported bg-pm-status-supported-fill px-3.5 py-3">
                <p className="text-[12px] font-bold tracking-[0.15em] text-pm-status-supported uppercase">
                  Replan {inspection.replan.attempt} / {inspection.replan.maxAttempts}
                </p>
                <p className="mt-1 text-[14px] text-pm-ink">{inspection.replan.reason}</p>
              </div>
            ) : null}

            {inspection.verdict ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[13px] text-pm-muted">Validity</span>
                <StatusPill status={inspection.verdict} />
              </div>
            ) : null}

            {inspection.stopReason ? (
              <p className="text-[14px] leading-relaxed text-pm-ink">
                Stop: {inspection.stopReason}
              </p>
            ) : null}
          </div>
        )}
      </section>
    </div>
  )
}
