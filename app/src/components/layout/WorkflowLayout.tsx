import type { ReactNode } from 'react'
import { NavLink, useParams } from 'react-router-dom'
import { WorkflowHeader } from './AppHeader'
import { useDemoStore } from '@/store/demoStore'
import { cn } from '@/lib/utils'

const NAV = [
  { to: '/understand', label: 'Understand', index: '01', stage: 'understand' },
  { to: '/review', label: 'Review', index: '02', stage: 'review' },
  { to: '/challenge', label: 'Challenge', index: '03', stage: 'challenge' },
  { to: '/test', label: 'Test', index: '04', stage: 'test' },
  { to: '/report', label: 'Report', index: '05', stage: 'report' },
  { to: '/compare', label: 'Compare', index: '06', stage: 'compare' },
] as const

export function WorkflowLayout({
  stage,
  children,
}: {
  stage: string
  children: ReactNode
}) {
  const paperTitle = useDemoStore((s) => s.package?.paper.title)
  const findingId = useDemoStore((s) => s.selectedFindingId ?? s.package?.findings[0]?.id)
  const params = useParams()

  return (
    <div className="min-h-svh bg-pm-bg">
      <WorkflowHeader currentStage={stage} />
      <div className="grid min-h-[calc(100svh-var(--pm-header-height))] grid-cols-[var(--pm-sidebar-width)_minmax(0,1fr)] max-[760px]:block print:block">
        <aside className="flex flex-col border-r border-pm-line bg-pm-bg-subtle px-4 py-7 max-[760px]:border-r-0 max-[760px]:border-b max-[760px]:px-3 max-[760px]:py-2 print:hidden">
          {paperTitle ? (
            <p className="mb-5 px-3 text-[12px] leading-5 text-pm-muted max-[760px]:hidden">
              {paperTitle}
            </p>
          ) : null}
          <nav aria-label="Main navigation" className="grid gap-1.5 max-[760px]:flex max-[760px]:overflow-auto">
            {NAV.map((item) => {
              const href =
                item.to === '/challenge' || item.to === '/test'
                  ? `${item.to}/${params.findingId ?? findingId ?? ''}`
                  : item.to
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
            Every critique must
            <br />
            survive a challenge.
            <br />
            <br />
            PeerMind / Research preview
          </div>
        </aside>
        <main className="mx-auto w-full max-w-[1600px] px-[clamp(20px,4vw,64px)] pt-[38px] pb-[60px]">
          <div className="page-enter">{children}</div>
        </main>
      </div>
    </div>
  )
}
