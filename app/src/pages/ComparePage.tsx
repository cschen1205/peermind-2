import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { ComparisonInspector } from '@/components/comparison/ComparisonInspector'
import { ComparisonAgentReport } from '@/components/comparison/ComparisonAgentReport'
import { ComparisonSummary } from '@/components/comparison/ComparisonSummary'
import { ScoreComparison } from '@/components/comparison/ScoreComparison'
import {
  FindingAlignment,
  themeMatchesFilter,
  type AlignmentFilter,
  type StatusFilter,
} from '@/components/comparison/FindingAlignment'
import { ReviewInput } from '@/components/comparison/ReviewInput'
import { EmptyState } from '@/components/EmptyState'
import { WorkflowLayout } from '@/components/layout/WorkflowLayout'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { readReviewFile } from '@/data/adapters/reviewFileAdapter'
import { buildScorecard } from '@/data/extractReviewScores'
import { useDemoStore } from '@/store/demoStore'

export function ComparePage() {
  const pkg = useDemoStore((s) => s.package)
  const lockedRun = useDemoStore((s) => s.lockedRun)
  const comparisonInputs = useDemoStore((s) => s.comparisonInputs)
  const comparisonResult = useDemoStore((s) => s.comparisonResult)
  const selectedThemeId = useDemoStore((s) => s.selectedComparisonThemeId)
  const setSelectedThemeId = useDemoStore((s) => s.setSelectedComparisonThemeId)
  const updateHumanReview = useDemoStore((s) => s.updateHumanReview)
  const addHumanReviewer = useDemoStore((s) => s.addHumanReviewer)
  const removeHumanReviewer = useDemoStore((s) => s.removeHumanReviewer)
  const runCompare = useDemoStore((s) => s.runCompare)
  const importReviewParse = useDemoStore((s) => s.importReviewParse)
  const [filter, setFilter] = useState<AlignmentFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [questionFilter, setQuestionFilter] = useState<AlignmentFilter>('all')
  const [questionStatusFilter, setQuestionStatusFilter] = useState<StatusFilter>('all')
  const [editing, setEditing] = useState(false)
  const [hasCompared, setHasCompared] = useState(false)

  if (!pkg) return null

  if (!lockedRun) {
    return (
      <WorkflowLayout stage="compare">
        <p className="eyebrow">06 / Compare</p>
        <h1 className="type-h1">Independent review comparison</h1>
        <div className="mt-7">
          <EmptyState
            title="Lock the PeerMind run first"
            description="Independent reviews are loaded only after the generated review is locked on Synthesize. The locked run does not change."
            action={
              <Link to="/synthesize">
                <Button>Go to Synthesize</Button>
              </Link>
            }
          />
        </div>
      </WorkflowLayout>
    )
  }

  const showInputs = !hasCompared || editing
  const questionRows = comparisonResult?.questions ?? []
  const allRows = comparisonResult ? [...comparisonResult.themes, ...questionRows] : []
  const selectedTheme = allRows.find((theme) => theme.id === selectedThemeId)
  const selectedFilter =
    selectedTheme?.kind === 'question' ? questionFilter : filter
  const selectedStatusFilter =
    selectedTheme?.kind === 'question' ? questionStatusFilter : statusFilter
  const visibleSelected =
    selectedTheme && themeMatchesFilter(selectedTheme, selectedFilter, selectedStatusFilter)
      ? selectedTheme
      : comparisonResult?.themes.find((theme) => themeMatchesFilter(theme, filter, statusFilter)) ??
        questionRows.find((theme) =>
          themeMatchesFilter(theme, questionFilter, questionStatusFilter),
        )
  const uploadedReviewCount = comparisonInputs.humanReviews.filter((review) =>
    review.reviewText.trim(),
  ).length
  const scorecard = comparisonResult ? buildScorecard(pkg, comparisonInputs) : undefined

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
        <Link to="/revise">
          <Button variant="secondary">Check a revision →</Button>
        </Link>
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
            <p className="text-[14px] text-pm-muted">
              Upload each review file and name the reviewer. Click Compare Reviews to score
              weaknesses and questions against the locked PeerMind run.
            </p>
            <ReviewInput
              inputs={comparisonInputs}
              onUpdateReview={updateHumanReview}
              onAddReviewer={addHumanReviewer}
              onRemoveReviewer={removeHumanReviewer}
              onUploadFile={(id, file) => {
                const slot = comparisonInputs.humanReviews.find((review) => review.id === id)
                const typedName = slot?.label.trim() ?? ''
                const customName = /^Reviewer\s+\d+$/i.test(typedName) ? undefined : typedName
                void readReviewFile(file).then((parsed) => {
                  importReviewParse(id, parsed, customName)
                })
              }}
            />
            <div className="mt-2">
              <Button
                onClick={() => {
                  if (runCompare()) {
                    setHasCompared(true)
                    setEditing(false)
                  }
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
            reviewerCount={uploadedReviewCount || comparisonInputs.humanReviews.length}
            peerMindFindingCount={pkg.findings.length}
            summary={comparisonResult.summary}
          />

          {comparisonResult.agentSummary ? (
            <ComparisonAgentReport
              summary={comparisonResult.agentSummary}
              onSelect={setSelectedThemeId}
            />
          ) : null}

          <p className="mt-4 text-[13px] text-pm-muted">
            Weaknesses are the scored comparison. Questions are listed separately and do not
            count as missing PeerMind findings unless they restate a locked claim.
          </p>

          <div className="mt-3">
            <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
              Change inputs
            </Button>
          </div>

          {scorecard ? (
            <div className="mt-6">
              <ScoreComparison scorecard={scorecard} />
            </div>
          ) : null}

          <div className="mt-6 grid grid-cols-[minmax(0,1.35fr)_minmax(280px,0.85fr)] gap-5 max-[1100px]:grid-cols-1">
            <div className="grid gap-10">
              <FindingAlignment
                themes={comparisonResult.themes}
                reviews={comparisonInputs.humanReviews}
                pkg={pkg}
                selectedId={visibleSelected?.id}
                filter={filter}
                statusFilter={statusFilter}
                onFilter={setFilter}
                onStatusFilter={setStatusFilter}
                onSelect={setSelectedThemeId}
              />
              {questionRows.length > 0 ? (
                <FindingAlignment
                  mode="questions"
                  themes={questionRows}
                  reviews={comparisonInputs.humanReviews}
                  pkg={pkg}
                  selectedId={visibleSelected?.id}
                  filter={questionFilter}
                  statusFilter={questionStatusFilter}
                  onFilter={setQuestionFilter}
                  onStatusFilter={setQuestionStatusFilter}
                  onSelect={setSelectedThemeId}
                />
              ) : null}
            </div>
            <ComparisonInspector theme={visibleSelected} pkg={pkg} />
          </div>
        </div>
      ) : null}
    </WorkflowLayout>
  )
}
