import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { MarketingHeader } from '@/components/layout/AppHeader'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

const STAGES = [
  {
    label: 'Understand',
    body: 'Map the paper as a source-linked graph, then inspect the exact excerpt.',
  },
  {
    label: 'Review',
    body: 'Route specialists from paper signals and write critiques as contracts.',
  },
  {
    label: 'Challenge',
    body: 'Run a defender investigation: evidence, counter-evidence, bounded replan.',
  },
  {
    label: 'Test',
    body: 'Change one targeted claim, keep a control, and separate three judgments.',
  },
  {
    label: 'Report',
    body: 'Publish mixed statuses with limits, then lock the run.',
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
        <h1 className="type-h1">An investigation for every critique.</h1>
        <p className="mt-3 max-w-[720px] text-pm-muted">
          Six stages, then an independent evaluation. Ask PeerMind stays a secondary inspector, not
          the product.
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

        <Card className="mt-6 flex flex-col gap-3 p-6 shadow-none ring-0">
          <p className="eyebrow">Secondary</p>
          <div className="flex items-center gap-2">
            <Search size={16} strokeWidth={1.75} />
            <h3 className="type-h3">Ask PeerMind</h3>
          </div>
          <p className="max-w-[64ch] text-[14px] text-pm-muted">
            A context drawer over the current source, finding, or comparison item. Collapsed by
            default. Prepared answers only in this demo.
          </p>
        </Card>

        <div className="mt-8">
          <Link to="/">
            <Button variant="secondary">Back to intake</Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
