import type { EvidenceLedger, VerificationRecord } from '@/types/verification'

export function ToolTrace({
  verification,
}: {
  verification: Pick<VerificationRecord, 'invokedToolIds' | 'skippedTools' | 'ledger'>
}) {
  const ledger: EvidenceLedger = verification.ledger
  const invoked = unique(verification.invokedToolIds)
  const extraToolsUsed = unique(ledger.toolsUsed).filter((tool) => !invoked.includes(tool))
  const provenance = unique(ledger.provenance)

  return (
    <div className="rounded-[11px] border border-pm-line bg-pm-surface p-4">
      <p className="eyebrow mb-2">Tool trace</p>
      <p className="mb-3 text-[13px] leading-snug text-pm-muted">
        Tools this finding invoked or skipped.
      </p>

      {invoked.length > 0 ? (
        <section>
          <p className="text-[11px] font-bold tracking-[0.08em] text-pm-muted uppercase">
            Invoked
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {invoked.map((tool) => (
              <span
                key={tool}
                className="rounded-[5px] bg-pm-accent-soft px-2 py-0.5 text-[12px] font-bold text-pm-accent"
              >
                {tool}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      {verification.skippedTools.length > 0 ? (
        <section className="mt-3">
          <p className="text-[11px] font-bold tracking-[0.08em] text-pm-muted uppercase">
            Skipped
          </p>
          <ul className="mt-1.5 grid gap-1.5">
            {verification.skippedTools.map((tool) => (
              <li
                key={tool.id}
                className="rounded-[8px] border-l-[3px] border-pm-line bg-pm-status-unverified-fill px-3 py-2"
              >
                <p className="text-[13px] font-[650] text-pm-ink">{tool.label}</p>
                <p className="mt-0.5 text-[12px] leading-snug text-pm-muted">{tool.reason}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {extraToolsUsed.length > 0 ? (
        <section className="mt-3">
          <p className="text-[11px] font-bold tracking-[0.08em] text-pm-muted uppercase">
            Also used
          </p>
          <p className="type-trace mt-1.5 text-pm-ink">{extraToolsUsed.join(' · ')}</p>
        </section>
      ) : null}

      {provenance.length > 0 ? (
        <section className="mt-3">
          <p className="text-[11px] font-bold tracking-[0.08em] text-pm-muted uppercase">
            Provenance
          </p>
          <p className="type-trace mt-1.5 text-pm-muted">{provenance.join(' · ')}</p>
        </section>
      ) : null}
    </div>
  )
}

function unique(values: string[]): string[] {
  return [...new Set(values)]
}
