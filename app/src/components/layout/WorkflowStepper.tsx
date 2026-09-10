import { Link } from 'react-router-dom'
import { useDemoStore } from '@/store/demoStore'
import { cn } from '@/lib/utils'

const STEPS = [
  { id: 'understand', label: 'Understand', to: '/understand' },
  { id: 'plan', label: 'Plan', to: '/plan' },
  { id: 'review', label: 'Review', to: '/review' },
  { id: 'verify', label: 'Verify', to: '/verify' },
  { id: 'synthesize', label: 'Synthesize', to: '/synthesize' },
] as const

function stepHref(path: string, findingId?: string) {
  if (path === '/verify') {
    return findingId ? `${path}/${findingId}` : path
  }
  return path
}

export function WorkflowStepper({ current }: { current: string }) {
  const packageReady = useDemoStore((s) => s.packageStatus === 'ready')
  const findingId = useDemoStore((s) => s.selectedFindingId ?? s.package?.findings[0]?.id)
  const currentIndex = STEPS.findIndex((step) => step.id === current)

  return (
    <nav aria-label="Workflow" className="flex min-w-0 flex-wrap items-center gap-3">
      <ol className="flex flex-wrap items-center gap-2">
        {STEPS.map((step, index) => {
          const done = currentIndex > index
          const active = step.id === current
          const href = stepHref(step.to, findingId)
          const className = cn(
            'inline-flex items-center gap-2 rounded-[8px] px-1 py-1 text-[12px] font-medium',
            !packageReady && 'pointer-events-none opacity-50',
            active ? 'text-pm-accent' : done ? 'text-pm-status-verified' : 'text-pm-muted',
          )
          const disc = (
            <span
              className={cn(
                'grid size-[22px] place-items-center rounded-full border text-[11px] font-bold',
                active && 'border-pm-accent bg-pm-accent text-white',
                done && !active && 'border-[#a5d3bb] bg-pm-status-verified-fill text-pm-status-verified',
                !active && !done && 'border-pm-line bg-pm-bg text-pm-muted',
              )}
            >
              {index + 1}
            </span>
          )

          return (
            <li key={step.id} className="flex items-center gap-2">
              {packageReady ? (
                <Link to={href} className={className} aria-current={active ? 'step' : undefined}>
                  {disc}
                  {step.label}
                </Link>
              ) : (
                <span className={className}>
                  {disc}
                  {step.label}
                </span>
              )}
              {index < STEPS.length - 1 ? (
                <span className="text-pm-line" aria-hidden="true">
                  →
                </span>
              ) : null}
            </li>
          )
        })}
      </ol>
      <span className="hidden h-6 w-px bg-pm-line sm:block" aria-hidden="true" />
      <div className="flex flex-col">
        <span className="text-[10px] font-bold tracking-[0.12em] text-pm-muted uppercase">
          Evaluation
        </span>
        <div className="flex items-center gap-2">
          {packageReady ? (
            <Link
              to="/compare"
              className={cn(
                'text-[12px] font-medium',
                current === 'compare' ? 'text-pm-accent' : 'text-pm-muted',
              )}
            >
              Compare
            </Link>
          ) : (
            <span className="text-[12px] text-pm-muted opacity-50">Compare</span>
          )}
          <span className="text-pm-line" aria-hidden="true">
            ·
          </span>
          <Link
            to="/revise"
            className={cn(
              'text-[12px] font-medium',
              current === 'revise' ? 'text-pm-accent' : 'text-pm-muted',
            )}
          >
            Revise
          </Link>
        </div>
      </div>
    </nav>
  )
}
