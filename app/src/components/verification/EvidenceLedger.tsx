import { Search } from 'lucide-react'
import { SourceLink } from '@/components/paper/SourceLink'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useDemoStore } from '@/store/demoStore'
import type { EvidenceRecord } from '@/types/finding'
import type { EvidenceLedger as EvidenceLedgerData } from '@/types/verification'

const COLUMNS: { key: 'for' | 'against' | 'gaps'; label: string; tone: string }[] = [
  { key: 'for', label: 'Evidence for', tone: 'border-t-pm-status-verified' },
  { key: 'against', label: 'Counter-evidence', tone: 'border-t-pm-status-refuted' },
  { key: 'gaps', label: 'Gaps', tone: 'border-t-pm-status-supported' },
]

export function EvidenceLedger({
  ledger,
  visibleIds,
}: {
  ledger: EvidenceLedgerData
  visibleIds: string[]
}) {
  const focusSelection = useDemoStore((s) => s.focusSelection)
  const openAsk = useDemoStore((s) => s.openAsk)
  const visible = new Set(visibleIds)

  return (
    <div>
      <p className="eyebrow mb-3">Evidence ledger</p>
      <div className="grid grid-cols-3 gap-3 max-[1100px]:grid-cols-1">
        {COLUMNS.map((column) => {
          const rows = ledger[column.key].filter((item) => visible.has(item.id))
          return (
            <section
              key={column.key}
              className={cn(
                'rounded-[11px] border border-pm-line border-t-[3px] bg-pm-surface p-4',
                column.tone,
              )}
            >
              <h3 className="text-[15px] font-[650]">{column.label}</h3>
              {rows.length === 0 ? (
                <p className="mt-3 text-[13px] text-pm-muted">None revealed yet.</p>
              ) : (
                <ul className="mt-3 grid gap-2">
                  {rows.map((row) => (
                    <LedgerRow
                      key={row.id}
                      record={row}
                      onOpen={focusSelection}
                      onAsk={() => openAsk('evidence_ledger', [row.id])}
                    />
                  ))}
                </ul>
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}

function LedgerRow({
  record,
  onOpen,
  onAsk,
}: {
  record: EvidenceRecord
  onOpen: (input: { sourceIds: string[] }) => void
  onAsk: () => void
}) {
  return (
    <li className="rounded-[8px] border border-pm-line bg-pm-bg-subtle">
      <button
        type="button"
        className="w-full rounded-[8px] p-3 text-left hover:border-pm-accent"
        onClick={() => onOpen({ sourceIds: record.sourceIds })}
      >
        <p className="font-mono text-[12px] text-pm-muted">{record.id}</p>
        <p className="mt-1 text-[14px] text-pm-ink">{record.summary}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="text-[12px] text-pm-muted">Provenance</span>
          {record.sourceIds.map((id) => (
            <SourceLink key={id} sourceId={id} />
          ))}
          {record.toolId ? (
            <span className="type-trace text-pm-muted">{record.toolId}</span>
          ) : null}
        </div>
      </button>
      <div className="px-3 pb-3">
        <Button variant="secondary" size="sm" onClick={onAsk}>
          <Search size={14} strokeWidth={1.75} />
          Ask about this evidence
        </Button>
      </div>
    </li>
  )
}
