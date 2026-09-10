import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PaperPreview } from '@/components/paper/PaperPreview'
import { StatusPill } from '@/components/StatusPill'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { getSources } from '@/data/queryPackage'
import { cn } from '@/lib/utils'
import { useDemoStore } from '@/store/demoStore'
import type { DemoDataPackage } from '@/types/demoPackage'
import type { FindingRecord } from '@/types/finding'

const CONTRACT_FIELDS: { key: keyof FindingRecord['contract']; label: string }[] = [
  { key: 'allegation', label: 'Allegation' },
  { key: 'type', label: 'Type' },
  { key: 'scope', label: 'Scope' },
  { key: 'falsifier', label: 'Falsification condition' },
  { key: 'evidenceBurden', label: 'Evidence burden' },
  { key: 'stopRule', label: 'Stop rule' },
  { key: 'relevanceTarget', label: 'Relevance target' },
]

export function CritiqueContract({
  pkg,
  finding,
  open,
  onOpenChange,
}: {
  pkg: DemoDataPackage
  finding?: FindingRecord
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const selectedSourceIds = useDemoStore((s) => s.selectedSourceIds)
  const focusSelection = useDemoStore((s) => s.focusSelection)
  const findingSources = finding ? getSources(pkg, finding.sourceIds) : []
  const activeSource =
    findingSources.find((source) => source.id === selectedSourceIds[0]) ?? findingSources[0]

  useEffect(() => {
    if (!open || !finding) return
    const current = selectedSourceIds[0]
    if (current && finding.sourceIds.includes(current)) return
    const first = finding.sourceIds[0]
    if (!first) return
    focusSelection({ sourceIds: [first], findingId: finding.id })
  }, [finding, focusSelection, open, selectedSourceIds])

  function selectSource(sourceId: string) {
    if (!finding) return
    focusSelection({ sourceIds: [sourceId], findingId: finding.id })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="h-[min(92vh,900px)] w-[min(96vw,1400px)] max-w-none overflow-hidden p-0 sm:max-w-none"
        style={{ display: 'flex', flexDirection: 'column' }}
        aria-describedby={undefined}
      >
        {finding ? (
          <div className="flex min-h-0 flex-1 flex-col">
            <header className="shrink-0 border-b border-pm-line px-6 py-4 pr-14">
              <p className="eyebrow mb-1">Critique contract</p>
              <DialogTitle className="font-mono text-[13px] text-pm-accent">
                {finding.id}
              </DialogTitle>
              <DialogDescription className="type-quote mt-2 line-clamp-3 text-[22px] text-pm-ink">
                {finding.critique}
              </DialogDescription>
            </header>

            <div className="grid min-h-0 flex-1 grid-cols-2 max-[900px]:grid-cols-1">
              <section className="flex min-h-0 flex-col border-r border-pm-line bg-pm-bg-subtle p-5 max-[900px]:border-r-0 max-[900px]:border-b">
                <div className="mb-3 shrink-0">
                  <p className="eyebrow mb-1">Paper preview</p>
                  <p className="text-[13px] text-pm-muted">
                    {activeSource
                      ? `${activeSource.id} · ${activeSource.label}${activeSource.page ? ` · p. ${activeSource.page}` : ''}`
                      : 'Select a source to open the manuscript.'}
                  </p>
                </div>
                <PaperPreview
                  paper={pkg.paper}
                  sourceRecords={findingSources}
                  activeSourceIds={
                    activeSource ? [activeSource.id] : finding.sourceIds.slice(0, 1)
                  }
                  highlightSourceIds={finding.sourceIds}
                  pkg={pkg}
                  hideEyebrow
                  showEvidenceList={false}
                  className="min-h-[280px] flex-1"
                  onSourceSelect={selectSource}
                />
                <div className="mt-3 flex shrink-0 flex-wrap items-center gap-2">
                  <span className="text-[12px] text-pm-muted">Sources</span>
                  {finding.sourceIds.map((id) => (
                    <button
                      key={id}
                      type="button"
                      className={cn(
                        'type-trace rounded-[5px] px-2 py-1',
                        id === activeSource?.id
                          ? 'bg-pm-accent-soft text-pm-accent'
                          : 'bg-pm-status-unverified-fill text-pm-muted hover:text-pm-accent',
                      )}
                      onClick={() => selectSource(id)}
                    >
                      {id}
                    </button>
                  ))}
                </div>
                {activeSource?.excerpt ? (
                  <p className="type-paper mt-3 shrink-0 text-pm-ink">{activeSource.excerpt}</p>
                ) : null}
              </section>

              <div className="min-h-0 overflow-y-auto p-6">
                <div className="grid gap-5">
                  {CONTRACT_FIELDS.map((field) => (
                    <section key={field.key}>
                      <p className="text-[12px] font-bold tracking-[0.08em] text-pm-muted uppercase">
                        {field.label}
                      </p>
                      <p className="mt-1.5 text-[15px] text-pm-ink">{finding.contract[field.key]}</p>
                    </section>
                  ))}
                  <section>
                    <p className="text-[12px] font-bold tracking-[0.08em] text-pm-muted uppercase">
                      Current status
                    </p>
                    <div className="mt-2">
                      <StatusPill status={finding.validity} />
                    </div>
                  </section>
                </div>
              </div>
            </div>

            <footer className="flex shrink-0 flex-wrap gap-2 border-t border-pm-line bg-pm-surface px-6 py-4">
              <Link
                to={`/challenge/${finding.id}`}
                onClick={() =>
                  focusSelection({ sourceIds: finding.sourceIds, findingId: finding.id })
                }
              >
                <Button>Challenge this critique →</Button>
              </Link>
            </footer>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
