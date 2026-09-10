import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { ConferenceReview } from '@/components/synthesize/ConferenceReview'
import { FindingReportCard } from '@/components/synthesize/FindingReportCard'
import { TrustProfile } from '@/components/synthesize/TrustProfile'
import { VerificationContract } from '@/components/review/VerificationContract'
import { WorkflowLayout } from '@/components/layout/WorkflowLayout'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  conferenceReviewFileName,
  conferenceReviewMarkdown,
  downloadTextFile,
} from '@/data/exportConferenceReview'
import { getFinding, trustProfileCounts } from '@/data/queryPackage'
import { CONFERENCE_STYLE_LABELS } from '@/data/reviewStyles'
import { cn } from '@/lib/utils'
import { useDemoStore } from '@/store/demoStore'
import type { FindingStatus } from '@/types/finding'

type ReportFilter = 'all' | FindingStatus

const FILTERS: { id: ReportFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'verified_high_impact', label: 'Verified' },
  { id: 'partially_supported', label: 'Partially supported' },
  { id: 'refuted', label: 'Refuted' },
  { id: 'unverifiable', label: 'Unverifiable' },
  { id: 'open_question', label: 'Open' },
  { id: 'severity_downgraded', label: 'Downgraded' },
]

const CALIBRATION_RULES = [
  'Never say “missing” if evidence exists.',
  'Never say “invalidates” unless impact is high.',
  'Use qualified language when evidence is partial.',
  'Mention material counter-evidence.',
  'Distinguish required correction, additional evidence, and optional suggestion.',
  'Do not introduce new unverified criticisms.',
]

export function SynthesizePage() {
  const pkg = useDemoStore((s) => s.package)
  const lockedRun = useDemoStore((s) => s.lockedRun)
  const lockRun = useDemoStore((s) => s.lockRun)
  const showToast = useDemoStore((s) => s.showToast)
  const focusSelection = useDemoStore((s) => s.focusSelection)
  const navigate = useNavigate()
  const [filter, setFilter] = useState<ReportFilter>('all')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [contractFindingId, setContractFindingId] = useState<string>()

  if (!pkg) return null

  const paper = pkg.paper
  const synthesis = pkg.synthesis
  const contractFinding = contractFindingId ? getFinding(pkg, contractFindingId) : undefined

  function inspectFinding(id: string) {
    if (!pkg) return
    const next = getFinding(pkg, id)
    if (!next) return
    focusSelection({
      sourceIds: next.sourceIds[0] ? [next.sourceIds[0]] : next.sourceIds,
      findingId: next.id,
    })
    setContractFindingId(id)
  }

  const counts = trustProfileCounts(pkg.findings)
  const findings =
    filter === 'all'
      ? pkg.findings
      : filter === 'verified_high_impact'
        ? pkg.findings.filter((item) => item.status.startsWith('verified_'))
        : pkg.findings.filter((item) => item.status === filter)
  const defaultExpandedId = findings.find((item) => item.calibratedComment)?.id
  const overallRating = pkg.synthesis.ratings?.find((item) => item.label === 'Rating')

  function handleLock() {
    lockRun()
    setConfirmOpen(false)
    navigate('/compare')
  }

  function handleExport() {
    const markdown = conferenceReviewMarkdown(paper, synthesis)
    downloadTextFile(conferenceReviewFileName(paper), markdown)
    showToast('Review exported.')
  }

  return (
    <WorkflowLayout stage="synthesize">
      <div className="mb-7 flex items-end justify-between gap-5 max-[760px]:flex-col max-[760px]:items-start">
        <div>
          <p className="eyebrow">05 / Synthesize</p>
          <h1 className="type-h1">Calibrated review</h1>
          <p className="mt-3 max-w-[52rem] text-[15px] text-pm-muted">
            Verified findings, then a calibrated review. The ledger goes in; a constructive rewrite
            comes out.
          </p>
        </div>
        <Button variant="secondary" className="no-print" onClick={handleExport}>
          Export
        </Button>
      </div>

      <Card className="grid gap-5 p-6 shadow-none ring-0">
        <div>
          <p className="eyebrow mb-3">Paper</p>
          <h2 className="type-h3">{pkg.paper.title}</h2>
          <p className="mt-2 text-[14px] text-pm-muted">
            {(pkg.paper.authors ?? []).join(', ')}
            {pkg.paper.venue ? ` · ${pkg.paper.venue}` : ''}
            {pkg.paper.year ? ` · ${pkg.paper.year}` : ''}
          </p>
          <p className="mt-2 text-[13px] font-[650] text-pm-muted">
            Conference style: {CONFERENCE_STYLE_LABELS[pkg.synthesis.conferenceStyle]}
            {overallRating ? ` · Rating ${overallRating.score} / ${overallRating.scale}` : ''}
          </p>
        </div>
        <div>
          <p className="eyebrow mb-3">Review summary</p>
          <div className="grid max-w-[90ch] gap-3">
            {pkg.synthesis.summary.split(/\n\n+/).map((paragraph) => (
              <p key={paragraph} className="text-[15px] leading-relaxed text-pm-ink">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </Card>

      <Card className="mt-6 gap-0 p-6 shadow-none ring-0">
        <p className="eyebrow mb-3">Review calibration</p>
        <ul className="grid gap-2">
          {CALIBRATION_RULES.map((rule) => (
            <li key={rule} className="text-[14px] leading-relaxed text-pm-ink">
              {rule}
            </li>
          ))}
        </ul>
      </Card>

      <div className="mt-8">
        <TrustProfile counts={counts} />
      </div>

      <div className="mt-8">
        <p className="eyebrow mb-3">Filter</p>
        <div className="flex flex-wrap gap-2 no-print">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={cn(
                'rounded-[5px] px-2 py-1 text-[12px] font-bold',
                filter === item.id
                  ? 'bg-pm-accent-soft text-pm-accent'
                  : 'bg-pm-status-unverified-fill text-pm-muted-2',
              )}
              onClick={() => setFilter(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="mt-4 grid gap-3">
          {findings.length === 0 ? (
            <p className="text-[14px] text-pm-muted">No findings match this filter.</p>
          ) : (
            findings.map((finding) => (
              <FindingReportCard
                key={finding.id}
                finding={finding}
                pkg={pkg}
                defaultExpanded={finding.id === defaultExpandedId}
                onOpenSource={inspectFinding}
              />
            ))
          )}
        </div>
      </div>

      <div className="mt-8">
        <ConferenceReview synthesis={pkg.synthesis} />
      </div>

      <Card className="mt-8 p-6 shadow-none ring-0 no-print">
        <p className="eyebrow mb-3">PeerMind run lock</p>
        {lockedRun ? (
          <div>
            <p className="flex items-center gap-2 text-[15px] font-[650]">
              <Lock size={16} strokeWidth={1.75} />
              Locked
            </p>
            <p className="type-trace mt-2 text-pm-muted">{lockedRun.runId}</p>
            <p className="mt-1 text-[13px] text-pm-muted">{lockedRun.lockedAt}</p>
            <Button className="mt-4" onClick={() => navigate('/compare')}>
              Compare reviews →
            </Button>
          </div>
        ) : (
          <div className="flex flex-wrap items-end justify-between gap-4">
            <p className="max-w-[52ch] text-[14px] text-pm-muted">
              Lock this run before loading independent comparison reviews. The generated review
              will not change after lock.
            </p>
            <Button variant="secondary" onClick={() => setConfirmOpen(true)}>
              <Lock size={16} strokeWidth={1.75} />
              Lock and Compare
            </Button>
          </div>
        )}
      </Card>

      <VerificationContract
        pkg={pkg}
        finding={contractFinding}
        open={Boolean(contractFinding)}
        onOpenChange={(open) => {
          if (!open) setContractFindingId(undefined)
        }}
      />

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Lock this run?</DialogTitle>
            <DialogDescription>
              Independent reviews are loaded only after the PeerMind run is locked. The generated
              review will not change.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleLock}>Lock and Compare</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </WorkflowLayout>
  )
}
