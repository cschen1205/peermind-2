import { SourceLink } from '@/components/paper/SourceLink'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { CounterfactualVariant } from '@/types/investigation'

const ROLE = {
  baseline: {
    step: '1',
    eyebrow: 'Baseline',
    title: 'Unchanged paper',
    hint: 'Starting verdict. Nothing edited.',
  },
  targeted: {
    step: '2',
    eyebrow: 'Targeted change',
    title: 'Relevant evidence changed',
    hint: 'The real test. Only this column should move the verdict.',
  },
  control: {
    step: '3',
    eyebrow: 'Control',
    title: 'Irrelevant change',
    hint: 'Placebo edit. The verdict should stay put.',
  },
} as const

export function VariantCard({
  variant,
  role,
}: {
  variant: CounterfactualVariant
  role: keyof typeof ROLE
}) {
  const meta = ROLE[role]
  const highlighted = role === 'targeted'

  return (
    <Card
      className={cn(
        'h-full gap-0 p-6 shadow-none ring-0',
        highlighted && 'border-pm-accent-line bg-pm-accent-soft/40',
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            'mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full text-[12px] font-bold',
            highlighted
              ? 'bg-pm-accent text-white'
              : 'bg-pm-status-unverified-fill text-pm-muted-2',
          )}
        >
          {meta.step}
        </span>
        <div>
          <p className="eyebrow mb-1">{meta.eyebrow}</p>
          <p className="text-[15px] font-[650] text-pm-ink">{meta.title}</p>
        </div>
      </div>
      <p className="mt-2 text-[13px] leading-relaxed text-pm-muted">{meta.hint}</p>

      <div className="mt-4 rounded-[9px] bg-pm-bg-subtle px-4 py-3">
        <p className="text-[12px] font-bold tracking-[0.15em] text-pm-muted uppercase">
          Reviewer says
        </p>
        <p className="type-paper mt-2 text-pm-ink">{variant.reviewerResponse}</p>
      </div>

      <div className="mt-4 border-t border-pm-line pt-4">
        <p className="text-[12px] font-bold tracking-[0.15em] text-pm-muted uppercase">
          What we changed
        </p>
        <h3 className="type-h3 mt-2">{variant.label}</h3>
        <p className="mt-2 text-[14px] leading-relaxed text-pm-ink">{variant.description}</p>
        {variant.changedSourceIds.length > 0 ? (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-[12px] text-pm-muted">Touched sources</span>
            {variant.changedSourceIds.map((id) => (
              <SourceLink key={id} sourceId={id} />
            ))}
          </div>
        ) : (
          <p className="mt-3 text-[12px] text-pm-muted">No manuscript edit.</p>
        )}
      </div>
    </Card>
  )
}
