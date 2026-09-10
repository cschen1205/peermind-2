import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Upload, X } from 'lucide-react'
import { MarketingHeader } from '@/components/layout/AppHeader'
import { StatusPill } from '@/components/StatusPill'
import { ValidationDiagnostic } from '@/components/ValidationDiagnostic'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { fetchPreparedPackage } from '@/data/adapters/bundledPackageAdapter'
import { createPaperObjectUrl, isPdfFile } from '@/data/adapters/paperFileAdapter'
import { REVIEW_STYLES, reviewStyleById, type ReviewStyle } from '@/data/reviewStyles'
import { cn } from '@/lib/utils'
import { useDemoStore } from '@/store/demoStore'

const PILLARS = [
  {
    step: '01 / IS IT TRUE?',
    title: 'Collect evidence and counter-evidence.',
    body: 'Each candidate finding is checked against the manuscript before it can enter a review.',
  },
  {
    step: '02 / DOES IT APPLY?',
    title: 'Judge scope and necessity.',
    body: 'A true finding still has to apply to the paper’s actual claims and experimental setup.',
  },
  {
    step: '03 / DOES IT MATTER?',
    title: 'Separate impact from truth.',
    body: 'Severity is calibrated only after verification. Counterfactual tests are optional tools.',
  },
]

const PROCESS_STEPS = [
  'Reading the manuscript',
  'Extracting sections and sources',
  'Building the evidence graph',
  'Planning reviewers and verifiers',
  'Preparing verification',
]

const CONFERENCE_STYLES = REVIEW_STYLES.filter((style) => style.kind === 'conference')
const JOURNAL_STYLES = REVIEW_STYLES.filter((style) => style.kind === 'journal')

function sleep(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

function ProductPreview() {
  return (
    <div className="rounded-[16px] bg-pm-nav p-7 text-white shadow-[0_20px_45px_#20233918]">
      <div className="flex items-center justify-between text-[14px] text-pm-nav-muted">
        <span>Product preview</span>
        <span className="rounded-[5px] bg-white/10 px-2 py-1 text-[12px] font-bold text-pm-nav-text">
          Empty until upload
        </span>
      </div>
      <p className="type-quote mt-[18px] text-white">
        A critique is an allegation until evidence, impact, and a calibrated comment are inspectable.
      </p>
      <hr className="my-5 border-white/20" />
      <p className="text-[14px] text-pm-nav-muted">
        No sample finding is hard-coded here. After you upload a paper, the title and review counts
        appear below.
      </p>
    </div>
  )
}

function ReviewStylePreview({ style }: { style: ReviewStyle }) {
  return (
    <div className="rounded-[16px] bg-pm-nav p-7 text-white shadow-[0_20px_45px_#20233918]">
      <div className="flex items-center justify-between gap-3 text-[14px] text-pm-nav-muted">
        <span>Review style</span>
        <span className="rounded-[5px] bg-white/10 px-2 py-1 text-[12px] font-bold text-pm-nav-text">
          {style.kind === 'journal' ? 'Journal' : 'Conference'}
        </span>
      </div>
      <h2 className="mt-[18px] text-[22px] font-[650] text-white">{style.label}</h2>
      <p className="mt-1 text-[14px] text-pm-nav-muted">{style.fullName}</p>
      <p className="mt-4 text-[15px] leading-relaxed text-pm-nav-text">{style.summary}</p>
      <hr className="my-5 border-white/20" />
      <p className="text-[12px] font-bold tracking-[0.08em] text-pm-nav-muted uppercase">
        What this style looks for
      </p>
      <ul className="mt-2.5 grid gap-2">
        {style.looksFor.map((item) => (
          <li key={item} className="text-[14px] leading-relaxed text-pm-nav-text">
            {item}
          </li>
        ))}
      </ul>
      <p className="mt-5 text-[12px] font-bold tracking-[0.08em] text-pm-nav-muted uppercase">
        Typical review form
      </p>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {style.formSections.map((section) => (
          <span
            key={section}
            className="rounded-[5px] bg-white/10 px-2 py-1 text-[12px] font-bold text-pm-nav-text"
          >
            {section}
          </span>
        ))}
      </div>
      <p className="mt-5 text-[12px] font-bold tracking-[0.08em] text-pm-nav-muted uppercase">
        Scores
      </p>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {style.scores.map((score) => (
          <span
            key={score}
            className="rounded-[5px] bg-white/10 px-2 py-1 text-[12px] font-bold text-pm-nav-text"
          >
            {score}
          </span>
        ))}
      </div>
    </div>
  )
}

function ProcessingPreview({ paperName, processStep }: { paperName?: string; processStep: number }) {
  return (
    <div className="rounded-[16px] bg-pm-nav p-7 text-white shadow-[0_20px_45px_#20233918]">
      <div className="flex items-center justify-between text-[14px] text-pm-nav-muted">
        <span>Processing manuscript</span>
        <span className="rounded-[5px] bg-white/10 px-2 py-1 text-[12px] font-bold text-pm-nav-text">
          In progress
        </span>
      </div>
      <h2 className="mt-[18px] text-[22px] font-[650] text-white">{paperName ?? 'Uploaded PDF'}</h2>
      <ol className="mt-5 grid gap-2.5">
        {PROCESS_STEPS.map((step, index) => {
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
  )
}

export function LandingPage() {
  const navigate = useNavigate()
  const fileInput = useRef<HTMLInputElement>(null)
  const intakeRun = useRef(0)
  const loadedPaperRef = useRef<HTMLElement>(null)
  const scrollToLoaded = useRef(false)
  const [busy, setBusy] = useState(false)
  const [processStep, setProcessStep] = useState(-1)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [reviewStyleId, setReviewStyleId] = useState('')
  const pkg = useDemoStore((s) => s.package)
  const status = useDemoStore((s) => s.packageStatus)
  const errors = useDemoStore((s) => s.packageErrors)
  const uploadedPaperName = useDemoStore((s) => s.uploadedPaperName)
  const beginLoading = useDemoStore((s) => s.beginLoading)
  const failLoading = useDemoStore((s) => s.failLoading)
  const clearIntake = useDemoStore((s) => s.clearIntake)
  const applyConferenceStyle = useDemoStore((s) => s.applyConferenceStyle)
  const loadFromUnknown = useDemoStore((s) => s.loadFromUnknown)
  const setUploadedPaper = useDemoStore((s) => s.setUploadedPaper)

  const processing = busy && processStep >= 0
  const selectedStyle = reviewStyleById(reviewStyleId)
  const hasManuscript = pendingFile !== null

  useEffect(() => {
    if (!scrollToLoaded.current || processing || status !== 'ready' || !pkg) return
    scrollToLoaded.current = false
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const frame = window.requestAnimationFrame(() => {
      loadedPaperRef.current?.scrollIntoView({
        behavior: reduced ? 'auto' : 'smooth',
        block: 'start',
      })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [pkg, processing, status])

  function acceptManuscript(file: File) {
    if (!isPdfFile(file)) {
      failLoading('Upload a PDF manuscript to start the review.')
      return
    }
    intakeRun.current += 1
    setBusy(false)
    setProcessStep(-1)
    setPendingFile(file)
    setReviewStyleId('')
    clearIntake()
  }

  function removeManuscript() {
    intakeRun.current += 1
    setBusy(false)
    setProcessStep(-1)
    setPendingFile(null)
    setReviewStyleId('')
    clearIntake()
  }

  function onReviewStyleChange(nextId: string) {
    setReviewStyleId(nextId)
    const style = reviewStyleById(nextId)
    if (style && status === 'ready') {
      applyConferenceStyle(style.conferenceStyle)
    }
  }

  async function startReview() {
    if (!pendingFile || processing) return

    const runId = ++intakeRun.current
    scrollToLoaded.current = false
    setBusy(true)
    beginLoading()
    setProcessStep(0)
    setUploadedPaper(createPaperObjectUrl(pendingFile), pendingFile.name)

    try {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const stepMs = reduced ? 140 : 1800
      for (let index = 0; index < PROCESS_STEPS.length; index += 1) {
        if (intakeRun.current !== runId) return
        setProcessStep(index)
        await sleep(stepMs)
      }
      if (intakeRun.current !== runId) return
      setProcessStep(PROCESS_STEPS.length)
      await sleep(reduced ? 80 : 700)
      const raw = await fetchPreparedPackage()
      if (intakeRun.current !== runId) return
      scrollToLoaded.current = true
      loadFromUnknown(raw, selectedStyle?.conferenceStyle)
    } catch (error) {
      if (intakeRun.current !== runId) return
      const message = error instanceof Error ? error.message : 'Could not process the selected file.'
      failLoading(message)
    } finally {
      if (intakeRun.current === runId) {
        setBusy(false)
        setProcessStep(-1)
      }
    }
  }

  return (
    <div className="min-h-svh bg-pm-bg">
      <MarketingHeader />
      <main className="mx-auto w-full max-w-[1600px] px-[clamp(20px,4vw,64px)] pt-5 pb-[60px]">
        <section
          className={cn(
            'page-enter grid min-h-[420px] grid-cols-[1.1fr_1fr] gap-[50px] py-5 max-[1100px]:grid-cols-1 max-[1100px]:gap-7',
            processing ? 'items-start' : 'items-center',
          )}
        >
          <div>
            <p className="eyebrow">Falsifiable AI peer review</p>
            <h1 className="type-display max-w-[640px]">
              Existing AI reviewers generate critiques.{' '}
              <em className="not-italic text-pm-accent">PeerMind verifies them.</em>
            </h1>
            <p className="mt-[22px] max-w-[550px] text-[18px] text-pm-muted">
              PeerMind does not trust its own reviewers. Upload a manuscript, choose a review style,
              then walk Understand → Plan → Review → Verify → Synthesize.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-2.5">
              {hasManuscript ? (
                <div className="inline-flex h-[42px] max-w-full items-center gap-2 rounded-[8px] border border-pm-line bg-pm-surface pr-1.5 pl-[14px] text-[14px] font-[650] text-pm-ink">
                  <FileText size={16} strokeWidth={1.75} className="shrink-0 text-pm-accent" />
                  <span className="min-w-0 max-w-[240px] truncate">{pendingFile.name}</span>
                  <button
                    type="button"
                    aria-label="Remove manuscript"
                    onClick={removeManuscript}
                    className="inline-flex size-7 shrink-0 items-center justify-center rounded-[6px] text-pm-muted transition-colors hover:bg-pm-bg hover:text-pm-ink"
                  >
                    <X size={16} strokeWidth={1.75} />
                  </button>
                </div>
              ) : (
                <Button disabled={busy} onClick={() => fileInput.current?.click()}>
                  <Upload size={16} strokeWidth={1.75} />
                  Upload manuscript
                </Button>
              )}
              <Button
                variant={hasManuscript ? 'default' : 'secondary'}
                disabled={!hasManuscript || processing}
                onClick={() => void startReview()}
              >
                {processing ? 'Processing…' : 'Review'}
              </Button>
              <input
                ref={fileInput}
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  event.target.value = ''
                  if (file) acceptManuscript(file)
                }}
              />
            </div>
            {hasManuscript ? (
              <label className="mt-4 grid max-w-[360px] gap-1.5">
                <span className="text-[12px] font-bold tracking-[0.08em] text-pm-muted uppercase">
                  Review Style
                </span>
                <select
                  value={reviewStyleId}
                  disabled={processing}
                  onChange={(event) => onReviewStyleChange(event.target.value)}
                  className="h-11 w-full rounded-[8px] border border-pm-line bg-pm-surface px-3 text-[14px] font-[650] text-pm-ink outline-none focus-visible:border-pm-accent disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="">Choose a venue</option>
                  <optgroup label="Conferences">
                    {CONFERENCE_STYLES.map((style) => (
                      <option key={style.id} value={style.id}>
                        {style.label}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Journals">
                    {JOURNAL_STYLES.map((style) => (
                      <option key={style.id} value={style.id}>
                        {style.label}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </label>
            ) : null}
          </div>
          {processing ? (
            <ProcessingPreview
              paperName={uploadedPaperName ?? pendingFile?.name}
              processStep={processStep}
            />
          ) : selectedStyle ? (
            <ReviewStylePreview style={selectedStyle} />
          ) : (
            <ProductPreview />
          )}
        </section>

        {status === 'invalid' && !processing ? (
          <div className="mt-6">
            <ValidationDiagnostic errors={errors} />
          </div>
        ) : null}

        {status === 'ready' && pkg && !processing ? (
          <section
            ref={loadedPaperRef}
            className="mt-6 scroll-mt-[calc(var(--pm-header-height)+16px)] rounded-[13px] border border-dashed border-pm-accent-line bg-[#f8f7ff] p-6"
          >
            <p className="eyebrow">Loaded paper</p>
            <h2 className="type-h2">{pkg.paper.title}</h2>
            <p className="mt-3 text-[14px] text-pm-muted">
              {[
                uploadedPaperName,
                pkg.paper.authors?.join(', '),
                pkg.paper.venue,
                pkg.paper.year,
                selectedStyle ? `Style: ${selectedStyle.label}` : null,
              ]
                .filter(Boolean)
                .join(' · ')}
            </p>
            <p className="mt-4 text-[14px] text-pm-ink">{pkg.demo.description ?? pkg.demo.title}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-[5px] bg-pm-status-unverified-fill px-2 py-1 text-[12px] font-bold text-pm-muted-2">
                {pkg.sources.length} sources
              </span>
              <span className="rounded-[5px] bg-pm-status-unverified-fill px-2 py-1 text-[12px] font-bold text-pm-muted-2">
                {pkg.paperGraph.nodes.length} graph nodes
              </span>
              <span className="rounded-[5px] bg-pm-status-unverified-fill px-2 py-1 text-[12px] font-bold text-pm-muted-2">
                {pkg.findings.length} findings
              </span>
              {pkg.findings.slice(0, 4).map((finding) => (
                <StatusPill key={finding.id} status={finding.status} kind="status" />
              ))}
            </div>
            <div className="mt-6">
              <Button onClick={() => navigate('/understand')}>Start Review →</Button>
            </div>
          </section>
        ) : processing ? null : (
          <section className="mt-6 rounded-[13px] border border-dashed border-pm-accent-line bg-[#f8f7ff] p-6">
            <p className="text-[14px] text-pm-muted">
              {hasManuscript
                ? 'Manuscript selected. Choose a review style if you want, then click Review to process the paper.'
                : 'No manuscript loaded. Workflow routes stay locked until you upload a PDF and the prepared review is validated.'}
            </p>
          </section>
        )}

        <section id="how-it-works" className="mt-12 grid grid-cols-3 gap-[18px] max-[760px]:grid-cols-1">
          {PILLARS.map((pillar) => (
            <Card key={pillar.step} className="p-6 shadow-none ring-0">
              <div className="mb-4 font-mono text-[13px] text-pm-accent">{pillar.step}</div>
              <h3 className="type-h3">{pillar.title}</h3>
              <p className="mt-2.5 text-[14px] text-pm-muted">{pillar.body}</p>
            </Card>
          ))}
        </section>

        <section id="about" className="mt-8 rounded-[9px] border border-pm-line bg-white/50 px-[18px] py-3.5 text-[14px] text-pm-muted">
          This demonstration processes an uploaded PDF, then replays a prepared review. It does not
          run a live model or contact a network service after the first local load.
        </section>
      </main>
    </div>
  )
}
