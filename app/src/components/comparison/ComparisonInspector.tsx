import { Search } from 'lucide-react'
import { StatusPill } from '@/components/StatusPill'
import { SourceLink } from '@/components/paper/SourceLink'
import { Button } from '@/components/ui/button'
import { RELATION_LABELS } from '@/components/comparison/FindingAlignment'
import { getFinding } from '@/data/queryPackage'
import { useDemoStore } from '@/store/demoStore'
import type { ComparisonTheme } from '@/types/comparison'
import type { DemoDataPackage } from '@/types/demoPackage'

export function ComparisonInspector({
  theme,
  pkg,
}: {
  theme?: ComparisonTheme
  pkg: DemoDataPackage
}) {
  const humanReviews = useDemoStore((s) => s.comparisonInputs.humanReviews)
  const focusSelection = useDemoStore((s) => s.focusSelection)
  const openAsk = useDemoStore((s) => s.openAsk)

  if (!theme) {
    return (
      <div>
        <p className="eyebrow mb-3">Selected comparison item</p>
        <p className="text-[14px] text-pm-muted">Select a theme to inspect alignment.</p>
      </div>
    )
  }

  const findings = theme.peerMindFindingIds
    .map((id) => getFinding(pkg, id))
    .filter((item) => item !== undefined)
  const humanExcerpt = humanReviews.map((review) => review.reviewText.trim()).filter(Boolean)[0]
  const sourceIds = theme.sourceIds ?? findings.flatMap((finding) => finding.sourceIds)
  const uniqueSources = [...new Set(sourceIds)]

  return (
    <div>
      <p className="eyebrow mb-3">Selected comparison item</p>
      <p className="type-h3">{theme.label}</p>
      <p className="mt-2 text-[12px] font-bold tracking-[0.08em] text-pm-muted uppercase">
        {RELATION_LABELS[theme.relation]}
      </p>

      <section className="mt-5 rounded-[11px] border border-pm-line bg-pm-surface p-4">
        <p className="eyebrow">Human review</p>
        <p className="type-paper mt-2 text-[15px] text-pm-ink">
          {humanExcerpt || theme.explanation || 'No human excerpt in the current inputs.'}
        </p>
      </section>

      <section className="mt-3 rounded-[11px] border border-pm-line bg-pm-surface p-4">
        <p className="eyebrow">PeerMind finding</p>
        {findings.length === 0 ? (
          <p className="mt-2 text-[14px] text-pm-muted">No PeerMind finding on this theme.</p>
        ) : (
          findings.map((finding) => (
            <div key={finding.id} className="mt-2">
              <p className="font-mono text-[12px] text-pm-accent">{finding.id}</p>
              <p className="type-quote mt-2 text-[22px]">{finding.critique}</p>
            </div>
          ))
        )}
      </section>

      {theme.explanation ? (
        <p className="mt-4 text-[14px] leading-relaxed text-pm-ink">{theme.explanation}</p>
      ) : null}

      {uniqueSources.length > 0 ? (
        <div className="mt-4">
          <p className="text-[12px] font-bold tracking-[0.08em] text-pm-muted uppercase">
            Evidence
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {uniqueSources.map((id) => (
              <SourceLink key={id} sourceId={id} />
            ))}
          </div>
        </div>
      ) : null}

      {theme.defenderStatus ? (
        <div className="mt-4">
          <p className="mb-2 text-[12px] font-bold tracking-[0.08em] text-pm-muted uppercase">
            Defender status
          </p>
          <StatusPill status={theme.defenderStatus} />
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={uniqueSources.length === 0}
          onClick={() => {
            const first = uniqueSources[0]
            if (!first) return
            focusSelection({ sourceIds: uniqueSources })
            document.getElementById(`source-card-${first}`)?.scrollIntoView({
              block: 'nearest',
              behavior: 'smooth',
            })
          }}
        >
          Open source
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => openAsk('comparison', [theme.id])}
        >
          <Search size={14} strokeWidth={1.75} />
          Ask about this comparison
        </Button>
      </div>
    </div>
  )
}
