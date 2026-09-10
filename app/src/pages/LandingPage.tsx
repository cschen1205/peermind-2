import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload } from 'lucide-react'
import { MarketingHeader } from '@/components/layout/AppHeader'
import { StatusPill } from '@/components/StatusPill'
import { ValidationDiagnostic } from '@/components/ValidationDiagnostic'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { fetchPreparedPackage } from '@/data/adapters/bundledPackageAdapter'
import { createPaperObjectUrl, isPdfFile } from '@/data/adapters/paperFileAdapter'
import { cn } from '@/lib/utils'
import { useDemoStore } from '@/store/demoStore'

const PILLARS = [
  {
    step: '01 / MAKE IT TESTABLE',
    title: 'Define what would prove it wrong.',
    body: 'Each criticism has a precise allegation and an explicit falsification condition.',
  },
  {
    step: '02 / CHALLENGE IT',
    title: 'Search for counter-evidence.',
    body: 'A verifier follows references, checks numbers, and tests the reviewer’s interpretation.',
  },
  {
    step: '03 / CHANGE THE EVIDENCE',
    title: 'Test whether reasoning updates.',
    body: 'The defender edits a sandbox copy, then asks the reviewer to reassess the same critique.',
  },
]

const PROCESS_STEPS = [
  'Reading the manuscript',
  'Extracting sections and sources',
  'Building the evidence graph',
  'Routing specialist reviewers',
  'Preparing investigations',
]

function sleep(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

export function LandingPage() {
  const navigate = useNavigate()
  const fileInput = useRef<HTMLInputElement>(null)
  const intakeRun = useRef(0)
  const loadedPaperRef = useRef<HTMLElement>(null)
  const scrollToLoaded = useRef(false)
  const [busy, setBusy] = useState(false)
  const [processStep, setProcessStep] = useState(-1)
  const pkg = useDemoStore((s) => s.package)
  const status = useDemoStore((s) => s.packageStatus)
  const errors = useDemoStore((s) => s.packageErrors)
  const uploadedPaperName = useDemoStore((s) => s.uploadedPaperName)
  const beginLoading = useDemoStore((s) => s.beginLoading)
  const failLoading = useDemoStore((s) => s.failLoading)
  const loadFromUnknown = useDemoStore((s) => s.loadFromUnknown)
  const setUploadedPaper = useDemoStore((s) => s.setUploadedPaper)

  const processing = busy && processStep >= 0

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

  async function ingestPdf(file: File) {
    if (!isPdfFile(file)) {
      failLoading('Upload a PDF manuscript to start the review.')
      return
    }

    const runId = ++intakeRun.current
    scrollToLoaded.current = false
    setBusy(true)
    beginLoading()
    setProcessStep(0)
    setUploadedPaper(createPaperObjectUrl(file), file.name)

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
      loadFromUnknown(raw)
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
              AI peer review with unit tests.
              <br />
              Every critique must <em className="not-italic text-pm-accent">survive a challenge.</em>
            </h1>
            <p className="mt-[22px] max-w-[550px] text-[18px] text-pm-muted">
              Upload a manuscript, then walk Understand → Report. The UI stays generic; the review
              is prepared from the paper you load.
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <Button disabled={busy} onClick={() => fileInput.current?.click()}>
                <Upload size={16} strokeWidth={1.75} />
                {processing ? 'Processing…' : 'Upload manuscript'}
              </Button>
              <input
                ref={fileInput}
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  event.target.value = ''
                  if (file) void ingestPdf(file)
                }}
              />
            </div>
          </div>
          {processing ? (
            <div className="rounded-[16px] bg-pm-nav p-7 text-white shadow-[0_20px_45px_#20233918]">
              <div className="flex items-center justify-between text-[14px] text-pm-nav-muted">
                <span>Processing manuscript</span>
                <span className="rounded-[5px] bg-white/10 px-2 py-1 text-[12px] font-bold text-pm-nav-text">
                  In progress
                </span>
              </div>
              <h2 className="mt-[18px] text-[22px] font-[650] text-white">
                {uploadedPaperName ?? 'Uploaded PDF'}
              </h2>
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
          ) : (
            <div className="rounded-[16px] bg-pm-nav p-7 text-white shadow-[0_20px_45px_#20233918]">
              <div className="flex items-center justify-between text-[14px] text-pm-nav-muted">
                <span>Product preview</span>
                <span className="rounded-[5px] bg-white/10 px-2 py-1 text-[12px] font-bold text-pm-nav-text">
                  Empty until upload
                </span>
              </div>
              <p className="type-quote mt-[18px] text-white">
                A critique is an allegation until evidence, counter-evidence, and a test survive
                inspection.
              </p>
              <hr className="my-5 border-white/20" />
              <p className="text-[14px] text-pm-nav-muted">
                No sample finding is hard-coded here. After you upload a paper, the title and review
                counts appear below.
              </p>
            </div>
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
                <StatusPill key={finding.id} status={finding.validity} />
              ))}
            </div>
            <div className="mt-6">
              <Button onClick={() => navigate('/understand')}>Start Review →</Button>
            </div>
          </section>
        ) : processing ? null : (
          <section className="mt-6 rounded-[13px] border border-dashed border-pm-accent-line bg-[#f8f7ff] p-6">
            <p className="text-[14px] text-pm-muted">
              No manuscript loaded. Workflow routes stay locked until you upload a PDF and the
              prepared review is validated.
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
