import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { ComparisonInspector } from '@/components/comparison/ComparisonInspector'
import { ComparisonSummary } from '@/components/comparison/ComparisonSummary'
import {
  FindingAlignment,
  themeMatchesFilter,
  type AlignmentFilter,
} from '@/components/comparison/FindingAlignment'
import { ReviewInput } from '@/components/comparison/ReviewInput'
import { EmptyState } from '@/components/EmptyState'
import { WorkflowLayout } from '@/components/layout/WorkflowLayout'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { readJsonFile } from '@/data/adapters/jsonFileAdapter'
import { useDemoStore } from '@/store/demoStore'

export function ComparePage() {
  const pkg = useDemoStore((s) => s.package)
  const lockedRun = useDemoStore((s) => s.lockedRun)
  const comparisonInputs = useDemoStore((s) => s.comparisonInputs)
  const comparisonResult = useDemoStore((s) => s.comparisonResult)
  const comparisonUsedPrepared = useDemoStore((s) => s.comparisonUsedPrepared)
  const selectedThemeId = useDemoStore((s) => s.selectedComparisonThemeId)
  const setSelectedThemeId = useDemoStore((s) => s.setSelectedComparisonThemeId)
  const updateHumanReview = useDemoStore((s) => s.updateHumanReview)
  const addHumanReviewer = useDemoStore((s) => s.addHumanReviewer)
  const setOptionalReview = useDemoStore((s) => s.setOptionalReview)
  const loadPreparedComparison = useDemoStore((s) => s.loadPreparedComparison)
  const runPreparedCompare = useDemoStore((s) => s.runPreparedCompare)
  const importComparisonJson = useDemoStore((s) => s.importComparisonJson)
  const fileInput = useRef<HTMLInputElement>(null)
  const [filter, setFilter] = useState<AlignmentFilter>('all')
  const [editing, setEditing] = useState(false)

  if (!pkg) return null

  if (!lockedRun) {
    return (
      <WorkflowLayout stage="compare">
        <p className="eyebrow">06 / Compare</p>
        <h1 className="type-h1">Independent review comparison</h1>
        <div className="mt-7">
          <EmptyState
            title="Lock the PeerMind run first"
            description="Independent reviews are loaded only after the generated review is locked on Report. The locked run does not change."
            action={
              <Link to="/report">
                <Button>Go to Report</Button>
              </Link>
            }
          />
        </div>
      </WorkflowLayout>
    )
  }

  const showInputs = !comparisonResult || editing
  const selectedTheme = comparisonResult?.themes.find((theme) => theme.id === selectedThemeId)
  const visibleSelected =
    selectedTheme && comparisonResult && themeMatchesFilter(selectedTheme, filter)
      ? selectedTheme
      : comparisonResult?.themes.find((theme) => themeMatchesFilter(theme, filter))

  return (
    <WorkflowLayout stage="compare">
      <div className="mb-7 flex items-end justify-between gap-5 max-[760px]:flex-col max-[760px]:items-start">
        <div>
          <p className="eyebrow">06 / Compare</p>
          <h1 className="type-h1">Independent review comparison</h1>
          <p className="mt-2 text-[13px] font-bold tracking-[0.08em] text-pm-muted uppercase">
            Blind comparison: Yes
          </p>
        </div>
      </div>

      {showInputs ? (
        <div className="grid grid-cols-2 gap-5 max-[1100px]:grid-cols-1">
          <Card className="gap-4 rounded-[11px] p-6 shadow-none ring-0">
            <p className="eyebrow">Locked PeerMind run</p>
            <p className="flex items-center gap-2 text-[15px] font-[650]">
              <Lock size={16} strokeWidth={1.75} />
              Locked
            </p>
            <h2 className="type-h3">{pkg.paper.title}</h2>
            <p className="text-[14px] text-pm-muted">
              {(pkg.paper.authors ?? []).join(', ')}
              {pkg.paper.venue ? ` · ${pkg.paper.venue}` : ''}
              {pkg.paper.year ? ` · ${pkg.paper.year}` : ''}
            </p>
            <p className="type-trace text-pm-muted">{lockedRun.runId}</p>
            <p className="text-[14px] text-pm-ink">{lockedRun.findingIds.length} findings</p>
          </Card>

          <Card className="gap-4 rounded-[11px] p-6 shadow-none ring-0">
            <p className="eyebrow">Comparison inputs</p>
            <ReviewInput
              inputs={comparisonInputs}
              onUpdateReview={(id, text) => updateHumanReview(id, { reviewText: text })}
              onAddReviewer={addHumanReviewer}
              onSetOptional={setOptionalReview}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => fileInput.current?.click()}>
                Import comparison JSON
              </Button>
              <input
                ref={fileInput}
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  event.target.value = ''
                  if (!file) return
                  void readJsonFile(file).then((raw) => {
                    if (importComparisonJson(raw)) setEditing(false)
                  })
                }}
              />
              <Button variant="secondary" onClick={() => {
                if (loadPreparedComparison()) setEditing(false)
              }}>
                Load prepared comparison
              </Button>
              <Button
                onClick={() => {
                  if (runPreparedCompare()) setEditing(false)
                }}
              >
                Compare Reviews →
              </Button>
            </div>
          </Card>
        </div>
      ) : comparisonResult ? (
        <div>
          <ComparisonSummary
            humanReviewerCount={comparisonInputs.humanReviews.length}
            peerMindFindingCount={pkg.findings.length}
            summary={comparisonResult.summary}
          />

          {comparisonUsedPrepared ? (
            <p className="mt-4 text-[13px] text-pm-muted">
              This demo uses the prepared alignment. Pasted text is shown as input, not scored by a
              live matcher.
            </p>
          ) : null}

          <p className="mt-6 max-w-[72ch] text-[14px] leading-relaxed text-pm-ink">
            Human reviews are independent reference points, not ground truth. Agreement does not
            prove correctness, and disagreement does not imply PeerMind is wrong.
          </p>

          <div className="mt-3">
            <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
              Change inputs
            </Button>
          </div>

          <div className="mt-6 grid grid-cols-[minmax(0,1fr)_minmax(280px,0.9fr)] gap-5 max-[1100px]:grid-cols-1">
            <FindingAlignment
              themes={comparisonResult.themes}
              selectedId={visibleSelected?.id}
              filter={filter}
              onFilter={setFilter}
              onSelect={setSelectedThemeId}
            />
            <ComparisonInspector theme={visibleSelected} pkg={pkg} />
          </div>
        </div>
      ) : null}
    </WorkflowLayout>
  )
}
