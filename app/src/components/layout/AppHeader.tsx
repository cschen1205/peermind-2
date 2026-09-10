import { Link } from 'react-router-dom'
import { AskPeerMindButton } from '@/components/ask/AskPeerMindButton'
import { Button } from '@/components/ui/button'
import { useDemoStore } from '@/store/demoStore'
import { BrandMark } from './BrandMark'
import { DemoModeBadge } from './DemoModeBadge'
import { WorkflowStepper } from './WorkflowStepper'

export function MarketingHeader() {
  const ready = useDemoStore((s) => s.packageStatus === 'ready')
  const resetDemo = useDemoStore((s) => s.resetDemo)

  return (
    <header className="sticky top-0 z-20 flex h-[var(--pm-header-height)] items-center justify-between border-b border-pm-line bg-pm-surface px-8 max-[760px]:px-[18px]">
      <BrandMark />
      <nav className="flex items-center gap-[18px] text-[14px]">
        <Link to="/architecture" className="text-pm-muted hover:text-pm-ink max-[760px]:hidden">
          How it works
        </Link>
        <a href="#about" className="text-pm-muted hover:text-pm-ink max-[760px]:hidden">
          About
        </a>
        {ready ? (
          <Button variant="secondary" size="sm" onClick={resetDemo}>
            Reset demo
          </Button>
        ) : null}
      </nav>
    </header>
  )
}

export function WorkflowHeader({ currentStage }: { currentStage: string }) {
  const ready = useDemoStore((s) => s.packageStatus === 'ready')
  const resetDemo = useDemoStore((s) => s.resetDemo)

  return (
    <header className="sticky top-0 z-20 flex h-[var(--pm-header-height)] items-center gap-5 border-b border-pm-line bg-pm-surface px-8 max-[760px]:px-[18px] print:hidden">
      <BrandMark />
      <div className="min-w-0 flex-1">
        <WorkflowStepper current={currentStage} />
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden text-[12px] tracking-[0.06em] text-pm-muted uppercase min-[1440px]:inline">
          Interactive demonstration
        </span>
        <AskPeerMindButton className="max-[760px]:hidden" />
        {ready ? (
          <Button variant="secondary" size="sm" onClick={resetDemo}>
            Reset demo
          </Button>
        ) : null}
        <DemoModeBadge />
      </div>
    </header>
  )
}
