import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { EmptyState } from '@/components/EmptyState'
import { CounterfactualTool } from '@/components/impact/CounterfactualTool'
import { ScopeNecessity } from '@/components/impact/ScopeNecessity'
import { StatusPill } from '@/components/StatusPill'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { getCounterfactual, getImpactAssessment } from '@/data/queryPackage'
import { useDemoStore } from '@/store/demoStore'
import { SEVERITY_LEVEL_LABELS } from '@/types/finding'
import type { DemoDataPackage } from '@/types/demoPackage'
import type { EvidenceVerdict } from '@/types/finding'

export function ImpactPanel({
  pkg,
  findingId,
  evidenceVerdict,
  onBack,
}: {
  pkg: DemoDataPackage
  findingId: string
  evidenceVerdict: EvidenceVerdict
  onBack: () => void
}) {
  const assessment = getImpactAssessment(pkg, findingId)
  const counterfactual = getCounterfactual(pkg, findingId)
  const openAsk = useDemoStore((s) => s.openAsk)

  return (
    <div className="grid gap-6">
      <Card className="gap-0 p-6 shadow-none ring-0">
        <p className="eyebrow mb-3">Impact</p>
        <h2 className="type-h2">Does the critique apply, and does it matter?</h2>

        {!assessment ? (
          <div className="mt-5">
            <EmptyState
              title="No impact assessment"
              description="This finding has no prepared impact record. Continue to Synthesize, or return to Evidence."
              action={
                <Link to="/synthesize">
                  <Button variant="secondary" size="sm">
                    Continue to Synthesize
                  </Button>
                </Link>
              }
            />
          </div>
        ) : evidenceVerdict === 'refuted' ? (
          <div className="mt-5 rounded-[8px] border-l-[3px] border-pm-status-refuted bg-pm-status-refuted-fill px-4 py-3">
            <p className="text-[12px] font-bold tracking-[0.15em] text-pm-status-refuted uppercase">
              Impact not applicable
            </p>
            <p className="mt-2 text-[15px] leading-relaxed text-pm-ink">
              The evidence verdict is refuted. Scope, necessity, and sensitivity are not judged
              for a finding that does not hold.
            </p>
          </div>
        ) : (
          <div className="mt-6">
            <ScopeNecessity assessment={assessment} />
          </div>
        )}

        {assessment ? (
          <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-pm-line pt-5">
            <div className="grid gap-1">
              <p className="text-[12px] font-bold tracking-[0.15em] text-pm-muted uppercase">
                Final status
              </p>
              <StatusPill status={assessment.status} kind="status" />
            </div>
            <div className="grid gap-1">
              <p className="text-[12px] font-bold tracking-[0.15em] text-pm-muted uppercase">
                Final severity
              </p>
              <p className="text-[15px] font-[650] text-pm-ink">
                {SEVERITY_LEVEL_LABELS[assessment.finalSeverity]}
              </p>
            </div>
          </div>
        ) : null}
      </Card>

      {counterfactual ? <CounterfactualTool test={counterfactual} /> : null}

      <div className="flex flex-wrap gap-2 no-print">
        <Button variant="secondary" onClick={onBack}>
          Back to Evidence
        </Button>
        <Button variant="secondary" onClick={() => openAsk('impact', [findingId])}>
          <Search size={14} strokeWidth={1.75} />
          Ask about this impact judgment
        </Button>
        <Link to="/synthesize">
          <Button>Continue to Synthesize →</Button>
        </Link>
      </div>
    </div>
  )
}
