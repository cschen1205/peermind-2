import { useRef, useState } from 'react'
import { FileText, Upload } from 'lucide-react'
import { RevisionInspector } from '@/components/revision/RevisionInspector'
import {
  RevisionIssueList,
  type RevisionFilter,
} from '@/components/revision/RevisionIssueList'
import { RevisionSummary } from '@/components/revision/RevisionSummary'
import { WorkflowLayout } from '@/components/layout/WorkflowLayout'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { PREPARED_REVISION_INPUTS, preparedRevisionResult } from '@/data/revisionCheck'
import { isPdfFile } from '@/data/adapters/paperFileAdapter'
import { REVIEW_FILE_ACCEPT } from '@/data/adapters/reviewFileAdapter'
import { cn } from '@/lib/utils'
import type { RevisionCheckInputs, RevisionCheckResult } from '@/types/revision'

const CHECK_STEPS = [
  'Reading the original review',
  'Locating each finding in the updated paper',
  'Checking whether the issue was addressed',
  'Scanning the revision for new issues',
]

function sleep(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

export function RevisePage() {
  const reviewInput = useRef<HTMLInputElement>(null)
  const paperInput = useRef<HTMLInputElement>(null)
  const checkRun = useRef(0)
  const [inputs, setInputs] = useState<RevisionCheckInputs>({
    reviewLabel: '',
    paperLabel: '',
  })
  const [result, setResult] = useState<RevisionCheckResult>()
  const [editing, setEditing] = useState(true)
  const [busy, setBusy] = useState(false)
  const [processStep, setProcessStep] = useState(-1)
  const [filter, setFilter] = useState<RevisionFilter>('all')
  const [selectedId, setSelectedId] = useState<string>()

  const showInputs = !result || editing
  const selectedIssue =
    result?.issues.find((issue) => issue.id === selectedId) ??
    result?.issues.find((issue) => filter === 'all' || issue.status === filter)

  function onReviewFile(file: File) {
    setInputs((current) => ({
      ...current,
      reviewFileName: file.name,
      reviewLabel: current.reviewLabel.trim() || 'Original review',
    }))
  }

  function onPaperFile(file: File) {
    if (!isPdfFile(file)) return
    setInputs((current) => ({
      ...current,
      paperFileName: file.name,
      paperLabel: current.paperLabel.trim() || 'Updated manuscript',
    }))
  }

  async function runCheck() {
    const runId = ++checkRun.current
    const nextInputs = {
      ...PREPARED_REVISION_INPUTS,
      ...inputs,
      reviewFileName: inputs.reviewFileName || PREPARED_REVISION_INPUTS.reviewFileName,
      paperFileName: inputs.paperFileName || PREPARED_REVISION_INPUTS.paperFileName,
      reviewLabel: inputs.reviewLabel.trim() || PREPARED_REVISION_INPUTS.reviewLabel,
      paperLabel: inputs.paperLabel.trim() || PREPARED_REVISION_INPUTS.paperLabel,
    }
    setInputs(nextInputs)
    setBusy(true)
    setProcessStep(0)

    try {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const stepMs = reduced ? 80 : 420
      for (let index = 0; index < CHECK_STEPS.length; index += 1) {
        if (checkRun.current !== runId) return
        setProcessStep(index)
        await sleep(stepMs)
      }
      if (checkRun.current !== runId) return
      const next = preparedRevisionResult(nextInputs)
      setResult(next)
      setSelectedId(next.issues[0]?.id)
      setFilter('all')
      setEditing(false)
    } finally {
      if (checkRun.current === runId) {
        setBusy(false)
        setProcessStep(-1)
      }
    }
  }

  return (
    <WorkflowLayout stage="revise">
      <div className="mb-7 flex items-end justify-between gap-5 max-[760px]:flex-col max-[760px]:items-start">
        <div>
          <p className="eyebrow">07 / Revise</p>
          <h1 className="type-h1">Did the revision fix the review?</h1>
          <p className="mt-3 max-w-[720px] text-pm-muted">
            Load the original review and the updated manuscript. PeerMind checks each prior issue
            and looks for problems the revision introduced.
          </p>
        </div>
      </div>

      {showInputs ? (
        <div className="grid grid-cols-2 gap-5 max-[1100px]:grid-cols-1">
          <Card className="gap-4 rounded-[11px] p-6 shadow-none ring-0">
            <p className="eyebrow">Original review</p>
            <p className="text-[14px] text-pm-muted">
              The findings to re-check. Markdown, text, HTML, or JSON.
            </p>
            <label className="grid gap-1">
              <span className="text-[12px] font-bold tracking-[0.08em] text-pm-muted uppercase">
                Review label
              </span>
              <input
                value={inputs.reviewLabel}
                onChange={(event) =>
                  setInputs((current) => ({ ...current, reviewLabel: event.target.value }))
                }
                placeholder="e.g. ChatGPT review of v1"
                className="h-10 rounded-[8px] border border-pm-line bg-pm-surface px-3 text-[14px] font-[650] text-pm-ink outline-none placeholder:font-normal placeholder:text-pm-muted focus-visible:border-pm-accent"
              />
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="secondary" size="sm" onClick={() => reviewInput.current?.click()}>
                <FileText size={14} strokeWidth={1.75} />
                Upload review
              </Button>
              <input
                ref={reviewInput}
                type="file"
                accept={REVIEW_FILE_ACCEPT}
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  event.target.value = ''
                  if (file) onReviewFile(file)
                }}
              />
              <p className="min-w-0 truncate text-[13px] text-pm-muted">
                {inputs.reviewFileName ?? 'No review file'}
              </p>
            </div>
          </Card>

          <Card className="gap-4 rounded-[11px] p-6 shadow-none ring-0">
            <p className="eyebrow">Updated manuscript</p>
            <p className="text-[14px] text-pm-muted">
              The revised PDF to check against those findings.
            </p>
            <label className="grid gap-1">
              <span className="text-[12px] font-bold tracking-[0.08em] text-pm-muted uppercase">
                Paper label
              </span>
              <input
                value={inputs.paperLabel}
                onChange={(event) =>
                  setInputs((current) => ({ ...current, paperLabel: event.target.value }))
                }
                placeholder="e.g. Manuscript v2"
                className="h-10 rounded-[8px] border border-pm-line bg-pm-surface px-3 text-[14px] font-[650] text-pm-ink outline-none placeholder:font-normal placeholder:text-pm-muted focus-visible:border-pm-accent"
              />
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="secondary" size="sm" onClick={() => paperInput.current?.click()}>
                <Upload size={14} strokeWidth={1.75} />
                Upload PDF
              </Button>
              <input
                ref={paperInput}
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  event.target.value = ''
                  if (file) onPaperFile(file)
                }}
              />
              <p className="min-w-0 truncate text-[13px] text-pm-muted">
                {inputs.paperFileName ?? 'No manuscript'}
              </p>
            </div>
          </Card>
        </div>
      ) : null}

      {showInputs && busy ? (
        <div className="mt-5 rounded-[16px] bg-pm-nav p-7 text-white">
          <div className="flex items-center justify-between text-[14px] text-pm-nav-muted">
            <span>Checking revision</span>
            <span className="rounded-[5px] bg-white/10 px-2 py-1 text-[12px] font-bold text-pm-nav-text">
              In progress
            </span>
          </div>
          <h2 className="mt-[18px] text-[22px] font-[650] text-white">
            {inputs.paperFileName ?? 'Updated manuscript'}
          </h2>
          <ol className="mt-5 grid gap-2.5">
            {CHECK_STEPS.map((step, index) => {
              const done = index < processStep
              const current = index === processStep
              return (
                <li
                  key={step}
                  className={cn(
                    'flex items-center gap-3 text-[14px]',
                    done && 'text-[#8ee0c0]',
                    current && 'font-[650] text-white',
                    !done && !current && 'text-pm-nav-muted',
                  )}
                >
                  <span
                    className={cn(
                      'inline-flex size-5 items-center justify-center rounded-full border text-[11px] font-bold',
                      done && 'border-[#8ee0c0] bg-[#8ee0c0]/15 text-[#8ee0c0]',
                      current && 'border-white bg-white/15 text-white',
                      !done && !current && 'border-white/25 text-pm-nav-muted',
                    )}
                  >
                    {done ? '✓' : index + 1}
                  </span>
                  {step}
                </li>
              )
            })}
          </ol>
        </div>
      ) : null}

      {showInputs && !busy ? (
        <div className="mt-5 flex flex-wrap gap-2">
          <Button onClick={() => void runCheck()}>Check revision →</Button>
        </div>
      ) : null}

      {result && !editing ? (
        <div>
          <RevisionSummary result={result} />

          <p className="mt-5 max-w-[72ch] text-[14px] leading-relaxed text-pm-ink">
            {result.summary}
          </p>
          <p className="mt-3 text-[13px] text-pm-muted">
            This demo uses a prepared revision check of {result.inputs.reviewFileName} against{' '}
            {result.inputs.paperFileName}. Uploaded files are shown as input, not scored by a live
            model.
          </p>

          <div className="mt-4">
            <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
              Change inputs
            </Button>
          </div>

          <div className="mt-6 grid grid-cols-[minmax(0,1.35fr)_minmax(280px,0.85fr)] gap-5 max-[1100px]:grid-cols-1">
            <RevisionIssueList
              issues={result.issues}
              selectedId={selectedIssue?.id}
              filter={filter}
              onFilter={setFilter}
              onSelect={setSelectedId}
            />
            <RevisionInspector issue={selectedIssue} />
          </div>
        </div>
      ) : null}
    </WorkflowLayout>
  )
}
