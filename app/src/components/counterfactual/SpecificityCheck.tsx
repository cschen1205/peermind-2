import { StatusPill } from '@/components/StatusPill'
import { Card } from '@/components/ui/card'
import { SENSITIVITY_LABELS } from './SensitivityResult'
import { cn } from '@/lib/utils'
import type { FindingRecord } from '@/types/finding'
import type { CounterfactualRecord } from '@/types/investigation'

const SENSITIVITY_CLASS = {
  passed: 'bg-pm-status-verified-fill text-pm-status-verified',
  failed: 'bg-pm-status-refuted-fill text-pm-status-refuted',
  inconclusive: 'bg-pm-status-supported-fill text-pm-status-supported',
  not_applicable: 'bg-pm-status-unverified-fill text-pm-status-unverified',
} as const

export function SpecificityCheck({
  finding,
  test,
}: {
  finding: FindingRecord
  test: CounterfactualRecord
}) {
  const sensitivity = finding.sensitivity ?? {
    status: test.result,
    explanation: test.explanation,
  }

  return (
    <div>
      <p className="eyebrow mb-1">Three different questions</p>
      <p className="mb-4 max-w-[46rem] text-[14px] leading-relaxed text-pm-muted">
        Validity, sensitivity, and importance are not the same score. A critique can be factually
        right, scientifically minor, and still fail this test — or the reverse.
      </p>
      <div className="grid grid-cols-3 gap-3 max-[1100px]:grid-cols-1">
        <Card className="gap-0 p-5 shadow-none ring-0">
          <p className="text-[12px] font-bold tracking-[0.15em] text-pm-muted uppercase">
            Critique validity
          </p>
          <p className="mt-2 text-[15px] font-[650] text-pm-ink">Is the criticism factually right?</p>
          <div className="mt-3">
            <StatusPill status={finding.validity} />
          </div>
          <ul className="mt-3 grid gap-1">
            {finding.limitations.map((item) => (
              <li key={item} className="text-[14px] text-pm-ink">
                {item}
              </li>
            ))}
          </ul>
        </Card>

        <Card className="gap-0 p-5 shadow-none ring-0">
          <p className="text-[12px] font-bold tracking-[0.15em] text-pm-muted uppercase">
            Reviewer sensitivity
          </p>
          <p className="mt-2 text-[15px] font-[650] text-pm-ink">
            Does the reviewer update on the right evidence?
          </p>
          <div className="mt-3">
            <span
              className={cn(
                'inline-flex rounded-[5px] px-2 py-1 text-[12px] font-bold',
                SENSITIVITY_CLASS[sensitivity.status],
              )}
            >
              {SENSITIVITY_LABELS[sensitivity.status]}
            </span>
          </div>
          <p className="mt-3 text-[14px] text-pm-ink">{sensitivity.explanation}</p>
        </Card>

        <Card className="gap-0 p-5 shadow-none ring-0">
          <p className="text-[12px] font-bold tracking-[0.15em] text-pm-muted uppercase">
            Scientific importance
          </p>
          <p className="mt-2 text-[15px] font-[650] text-pm-ink">
            Even if valid, does it matter for the paper?
          </p>
          <p className="mt-3 text-[15px] font-[650] text-pm-ink">{finding.importance.level}</p>
          <p className="mt-2 text-[14px] text-pm-ink">{finding.importance.explanation}</p>
        </Card>
      </div>
    </div>
  )
}
