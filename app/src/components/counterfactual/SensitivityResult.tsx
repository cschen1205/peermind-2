import { cn } from '@/lib/utils'
import type { CounterfactualResult, CounterfactualVariant } from '@/types/investigation'

export const SENSITIVITY_LABELS: Record<CounterfactualResult, string> = {
  passed: 'Passed',
  failed: 'Failed',
  inconclusive: 'Inconclusive',
  not_applicable: 'Not applicable',
}

const SENSITIVITY_CLASS: Record<CounterfactualResult, string> = {
  passed: 'bg-pm-status-verified-fill text-pm-status-verified',
  failed: 'bg-pm-status-refuted-fill text-pm-status-refuted',
  inconclusive: 'bg-pm-status-supported-fill text-pm-status-supported',
  not_applicable: 'bg-pm-status-unverified-fill text-pm-status-unverified',
}

const RESULT_QUESTION: Record<CounterfactualResult, string> = {
  passed: 'The pass rule held.',
  failed: 'The pass rule did not hold.',
  inconclusive: 'The test cannot decide.',
  not_applicable: 'No meaningful counterfactual.',
}

export function SensitivityResult({
  expectedBehavior,
  result,
  explanation,
  variants,
}: {
  expectedBehavior: string
  result: CounterfactualResult
  explanation: string
  variants: {
    baseline: CounterfactualVariant
    targeted: CounterfactualVariant
    control: CounterfactualVariant
  }
}) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-[11px] border border-pm-line bg-pm-surface p-5">
          <p className="eyebrow mb-1">Pass rule</p>
          <p className="text-[15px] font-[650] text-pm-ink">What should happen</p>
          <p className="mt-3 text-[15px] leading-relaxed text-pm-ink">{expectedBehavior}</p>
        </section>
        <section className="rounded-[11px] border border-pm-line bg-pm-surface p-5">
          <p className="eyebrow mb-1">Outcome</p>
          <p className="text-[15px] font-[650] text-pm-ink">{RESULT_QUESTION[result]}</p>
          <span
            className={cn(
              'mt-3 inline-flex rounded-[5px] px-2 py-1 text-[12px] font-bold',
              SENSITIVITY_CLASS[result],
            )}
          >
            {SENSITIVITY_LABELS[result]}
          </span>
          <p className="mt-3 text-[15px] leading-relaxed text-pm-ink">{explanation}</p>
        </section>
      </div>

      <section className="rounded-[11px] border border-pm-line bg-pm-surface p-5">
        <p className="eyebrow mb-3">What the reviewer said on each version</p>
        <div className="grid grid-cols-3 gap-4 max-[1100px]:grid-cols-1">
          <ResponseLine step="1" label="Baseline" text={variants.baseline.reviewerResponse} />
          <ResponseLine step="2" label="Targeted" text={variants.targeted.reviewerResponse} accent />
          <ResponseLine step="3" label="Control" text={variants.control.reviewerResponse} />
        </div>
      </section>
    </div>
  )
}

function ResponseLine({
  step,
  label,
  text,
  accent = false,
}: {
  step: string
  label: string
  text: string
  accent?: boolean
}) {
  return (
    <div>
      <p className="text-[12px] font-bold tracking-[0.15em] text-pm-muted uppercase">
        {step} · {label}
      </p>
      <p className={cn('mt-2 text-[14px] leading-relaxed', accent ? 'font-[650] text-pm-ink' : 'text-pm-ink')}>
        {text}
      </p>
    </div>
  )
}
