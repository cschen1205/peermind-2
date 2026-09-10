import { Link, useParams } from 'react-router-dom'
import { EmptyState } from '@/components/EmptyState'
import { SpecificityCheck } from '@/components/counterfactual/SpecificityCheck'
import { SensitivityResult } from '@/components/counterfactual/SensitivityResult'
import { VariantCard } from '@/components/counterfactual/VariantCard'
import { WorkflowLayout } from '@/components/layout/WorkflowLayout'
import { PaperPreview } from '@/components/paper/PaperPreview'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  findingIdsWithTests,
  getCounterfactual,
  getFinding,
} from '@/data/queryPackage'
import { useDemoStore } from '@/store/demoStore'

export function CounterfactualPage() {
  const { findingId = '' } = useParams()
  const pkg = useDemoStore((s) => s.package)
  const selectedSourceIds = useDemoStore((s) => s.selectedSourceIds)
  const focusSelection = useDemoStore((s) => s.focusSelection)

  if (!pkg) return null

  const finding = getFinding(pkg, findingId)
  const test = getCounterfactual(pkg, findingId)
  const otherTests = findingIdsWithTests(pkg).filter((id) => id !== findingId)

  return (
    <WorkflowLayout stage="test">
      <div className="mb-7 flex items-end justify-between gap-5 max-[760px]:flex-col max-[760px]:items-start">
        <div>
          <p className="eyebrow">04 / Test{finding ? ` / ${finding.id}` : ''}</p>
          <h1 className="type-h1 max-w-[18ch]">A control experiment on this critique</h1>
          <p className="mt-3 max-w-[36rem] text-pm-muted">
            The reviewer should update only when the relevant evidence changes — not when we reword
            or hide something unrelated.
          </p>
        </div>
        <Link to="/report" className="no-print">
          <Button>Continue to Report →</Button>
        </Link>
      </div>

      {!finding ? (
        <EmptyState
          title="Finding not in this package"
          description="Return to Review and choose a critique that exists in the loaded demo package."
          action={
            <Link to="/review">
              <Button variant="secondary">All findings</Button>
            </Link>
          }
        />
      ) : !test ? (
        <EmptyState
          title="No prepared counterfactual test for this finding"
          description="This demo does not invent a test when the package has none. Open a prepared test or continue to the report."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              {otherTests.map((id) => (
                <Link key={id} to={`/test/${id}`}>
                  <Button size="sm">Open {id}</Button>
                </Link>
              ))}
              <Link to="/report">
                <Button variant="secondary" size="sm">
                  Continue to Report
                </Button>
              </Link>
            </div>
          }
        />
      ) : (
        <>
          <p className="type-quote mb-7 max-w-[52rem]">{finding.critique}</p>

          <div className="grid grid-cols-3 gap-4 max-[1100px]:grid-cols-1">
            <VariantCard variant={test.baseline} role="baseline" />
            <VariantCard variant={test.targeted} role="targeted" />
            <VariantCard variant={test.control} role="control" />
          </div>

          <div className="mt-6">
            <SensitivityResult
              expectedBehavior={test.expectedBehavior}
              result={test.result}
              explanation={test.explanation}
              variants={{
                baseline: test.baseline,
                targeted: test.targeted,
                control: test.control,
              }}
            />
          </div>

          <div className="mt-6">
            <SpecificityCheck finding={finding} test={test} />
          </div>

          <Card className="mt-6 p-5 shadow-none ring-0">
            <p className="mb-3 text-[14px] text-pm-muted">
              Sources cited in this test. Click a source ID above to highlight it here.
            </p>
            <PaperPreview
              paper={pkg.paper}
              sourceRecords={pkg.sources}
              activeSourceIds={selectedSourceIds}
              pkg={pkg}
              onSourceSelect={(sourceId) => focusSelection({ sourceIds: [sourceId] })}
              hideEyebrow
            />
          </Card>
        </>
      )}
    </WorkflowLayout>
  )
}
