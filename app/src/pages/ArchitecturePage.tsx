import { Link } from 'react-router-dom'
import { FileDiff, Search } from 'lucide-react'
import { MarketingHeader } from '@/components/layout/AppHeader'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

const STAGES = [
  {
    label: 'Understand',
    body: 'Map the paper as a source-linked graph, then inspect the exact excerpt.',
  },
  {
    label: 'Plan',
    body: 'The director selects reviewers and verifiers, and shows what was skipped.',
  },
  {
    label: 'Review',
    body: 'Specialists write candidate findings and verification contracts, not the final review.',
  },
  {
    label: 'Verify',
    body: 'Collect evidence, then judge scope, necessity, and sensitivity separately.',
  },
  {
    label: 'Synthesize',
    body: 'Rewrite the ledger into a calibrated conference review, then lock the run.',
  },
  {
    label: 'Compare',
    body: 'Load independent reviews after lock. Agreement is not ground truth.',
  },
]

export function ArchitecturePage() {
  return (
    <div className="min-h-svh bg-pm-bg">
      <MarketingHeader />
      <main className="page-enter mx-auto w-full max-w-[1600px] px-[clamp(20px,4vw,64px)] pt-[38px] pb-[60px]">
        <p className="eyebrow">Proposed system design</p>
        <h1 className="type-h1">Existing reviewers generate critiques. PeerMind verifies them.</h1>
        <p className="mt-3 max-w-[720px] text-pm-muted">
          Five workflow stages, then an independent evaluation. Ask PeerMind stays a secondary
          inspector, not the product. There is no Test stage.
        </p>

        <ol className="mt-8 grid grid-cols-6 gap-3 max-[1100px]:grid-cols-3 max-[760px]:grid-cols-1">
          {STAGES.map((stage, index) => (
            <li key={stage.label}>
              <Card className="h-full border-t-[3px] border-t-pm-accent p-5 shadow-none ring-0">
                <div className="font-mono text-[13px] text-pm-accent">
                  0{index + 1} / {stage.label.toUpperCase()}
                </div>
                <h3 className="type-h3 mt-3">{stage.label}</h3>
                <p className="mt-2 text-[14px] text-pm-muted">{stage.body}</p>
              </Card>
            </li>
          ))}
        </ol>

        <div className="mt-6 grid grid-cols-2 gap-3 max-[760px]:grid-cols-1">
          <Card className="flex flex-col gap-3 p-6 shadow-none ring-0">
            <p className="eyebrow">Secondary</p>
            <div className="flex items-center gap-2">
              <Search size={16} strokeWidth={1.75} />
              <h3 className="type-h3">Ask PeerMind</h3>
            </div>
            <p className="max-w-[64ch] text-[14px] text-pm-muted">
              A context drawer over the current source, verification, impact judgment, synthesis
              finding, or comparison item. Collapsed by default. Prepared answers only in this demo.
            </p>
          </Card>
          <Card className="flex flex-col gap-3 p-6 shadow-none ring-0">
            <p className="eyebrow">Evaluation</p>
            <div className="flex items-center gap-2">
              <FileDiff size={16} strokeWidth={1.75} />
              <h3 className="type-h3">Revision check</h3>
            </div>
            <p className="max-w-[64ch] text-[14px] text-pm-muted">
              After a review exists, load the updated manuscript. PeerMind checks whether each
              prior issue was addressed and whether the revision introduced new ones.
            </p>
            <div>
              <Link to="/revise">
                <Button variant="secondary" size="sm">
                  Open revision check
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        <div className="mt-8">
          <Link to="/">
            <Button variant="secondary">Back to intake</Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
