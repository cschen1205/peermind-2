import type { ReactNode } from 'react'
import { NavLink, useParams } from 'react-router-dom'
import { WorkflowHeader } from './AppHeader'
import { useDemoStore } from '@/store/demoStore'
import { cn } from '@/lib/utils'

const NAV = [
  { to: '/understand', label: 'Understand', index: '01', stage: 'understand' },
  { to: '/plan', label: 'Plan', index: '02', stage: 'plan' },
  { to: '/review', label: 'Review', index: '03', stage: 'review' },
  { to: '/verify', label: 'Verify', index: '04', stage: 'verify' },
  { to: '/synthesize', label: 'Synthesize', index: '05', stage: 'synthesize' },
  { to: '/compare', label: 'Compare', index: '06', stage: 'compare' },
  { to: '/revise', label: 'Revise', index: '07', stage: 'revise' },
] as const

export function WorkflowLayout({
  stage,
  children,
  fill = false,
}: {
  stage: string
  children: ReactNode
  fill?: boolean
}) {
  const paperTitle = useDemoStore((s) => s.package?.paper.title)
  const findingId = useDemoStore((s) => s.selectedFindingId ?? s.package?.findings[0]?.id)
  const params = useParams()

  return (
    <div className="flex h-svh flex-col overflow-hidden bg-pm-bg print:h-auto print:overflow-visible">
      <WorkflowHeader currentStage={stage} />
      <div className="grid min-h-0 flex-1 grid-cols-[var(--pm-sidebar-width)_minmax(0,1fr)] overflow-hidden max-[760px]:grid-cols-1 max-[760px]:grid-rows-[auto_minmax(0,1fr)] print:block print:h-auto print:overflow-visible">
        <aside className="flex min-h-0 flex-col overflow-y-auto overscroll-y-contain border-r border-pm-line bg-pm-bg-subtle px-4 py-7 max-[760px]:overflow-x-auto max-[760px]:overflow-y-hidden max-[760px]:border-r-0 max-[760px]:border-b max-[760px]:px-3 max-[760px]:py-2 print:hidden">
          {paperTitle ? (
            <p className="mb-5 px-3 text-[12px] leading-5 text-pm-muted max-[760px]:hidden">
              {paperTitle}
            </p>
          ) : null}
          <nav aria-label="Main navigation" className="grid gap-1.5 max-[760px]:flex">
            {NAV.map((item) => {
              const href =
                item.to === '/verify' ? `${item.to}/${params.findingId ?? findingId ?? ''}` : item.to
              return (
                <NavLink
                  key={item.to}
                  to={href}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-[8px] px-3 py-2.5 text-[14px] text-pm-muted max-[760px]:whitespace-nowrap',
                      isActive && 'bg-pm-accent-soft font-bold text-pm-accent',
                    )
                  }
                >
                  <span className="w-[18px] text-[12px] opacity-65 max-[760px]:hidden">
                    {item.index}
                  </span>
                  {item.label}
                </NavLink>
              )
            })}
          </nav>
          <div className="mt-auto px-3 pt-10 text-[12px] text-pm-muted max-[760px]:hidden">
            PeerMind / Research preview
          </div>
        </aside>
        <main
          className={cn(
            'mx-auto min-h-0 w-full max-w-[1600px] px-[clamp(20px,4vw,64px)] pt-[38px] pb-[60px] print:overflow-visible',
            fill ? 'flex flex-col overflow-hidden' : 'overflow-y-auto overscroll-y-contain',
          )}
        >
          <div className={cn('page-enter', fill && 'flex min-h-0 flex-1 flex-col')}>{children}</div>
        </main>
      </div>
    </div>
  )
}
