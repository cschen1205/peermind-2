import { SourceLink } from '@/components/paper/SourceLink'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { SENSITIVITY_LEVEL_LABELS } from '@/types/finding'
import type { CounterfactualRecord, CounterfactualVariant } from '@/types/verification'

function VariantColumn({
  variant,
  role,
}: {
  variant: CounterfactualVariant
  role: 'current' | 'intervened'
}) {
  const highlighted = role === 'intervened'

  return (
    <Card
      className={cn(
        'h-full gap-0 p-6 shadow-none ring-0',
        highlighted && 'border-pm-accent-line bg-pm-accent-soft/40',
      )}
    >
      <p className="eyebrow mb-1">{role === 'current' ? 'Current' : 'Intervention'}</p>
      <h3 className="type-h3 mt-2">{variant.label}</h3>
      <p className="mt-2 text-[14px] leading-relaxed text-pm-ink">{variant.description}</p>
      <p className="type-paper mt-4 text-pm-ink">{variant.claimSupport}</p>
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
    </Card>
  )
}

export function CounterfactualTool({ test }: { test: CounterfactualRecord }) {
  if (!test.identifiable) {
    return (
      <Card className="gap-0 p-6 shadow-none ring-0">
        <p className="eyebrow mb-3">Counterfactual tool</p>
        <h3 className="type-h3">COUNTERFACTUAL TEST: NOT IDENTIFIABLE</h3>
        <p className="mt-4 text-[12px] font-bold tracking-[0.15em] text-pm-muted uppercase">
          Reason
        </p>
        <p className="mt-1 text-[15px] leading-relaxed text-pm-ink">{test.reason}</p>
        <p className="mt-4 text-[14px] leading-relaxed text-pm-muted">
          Keep the finding uncertain, or request clarification. Do not invent an experimental
          outcome.
        </p>
      </Card>
    )
  }

  return (
    <Card className="gap-0 p-6 shadow-none ring-0">
      <p className="eyebrow mb-3">Counterfactual tool</p>
      <dl className="grid gap-4 text-[15px]">
        {test.currentSupport ? (
          <div>
            <dt className="text-[12px] font-bold tracking-[0.15em] text-pm-muted uppercase">
              Current support
            </dt>
            <dd className="mt-1 text-pm-ink">{test.currentSupport}</dd>
          </div>
        ) : null}
        {test.intervention ? (
          <div>
            <dt className="text-[12px] font-bold tracking-[0.15em] text-pm-muted uppercase">
              Intervention
            </dt>
            <dd className="mt-1 text-pm-ink">{test.intervention}</dd>
          </div>
        ) : null}
        {test.reevaluatedSupport ? (
          <div>
            <dt className="text-[12px] font-bold tracking-[0.15em] text-pm-muted uppercase">
              Re-evaluated support
            </dt>
            <dd className="mt-1 text-pm-ink">{test.reevaluatedSupport}</dd>
          </div>
        ) : null}
        {test.sensitivity ? (
          <div>
            <dt className="text-[12px] font-bold tracking-[0.15em] text-pm-muted uppercase">
              Sensitivity
            </dt>
            <dd className="mt-1 font-[650] text-pm-ink">
              {SENSITIVITY_LEVEL_LABELS[test.sensitivity]}
            </dd>
          </div>
        ) : null}
      </dl>
      {test.current || test.intervened ? (
        <div className="mt-5 grid grid-cols-2 gap-3 max-[1100px]:grid-cols-1">
          {test.current ? <VariantColumn variant={test.current} role="current" /> : null}
          {test.intervened ? (
            <VariantColumn variant={test.intervened} role="intervened" />
          ) : null}
        </div>
      ) : null}
    </Card>
  )
}
