import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useDemoStore } from '@/store/demoStore'
import type { PlanAssignment, PlanSubtask } from './buildPlanTree'

const TASK_KIND_LABEL: Record<PlanSubtask['kind'], string> = {
  signal: 'Signal',
  agent: 'Specialist',
  finding: 'Finding',
  claim: 'Claim',
  decision: 'Decision',
}

const STATUS_LABEL = {
  selected: 'Selected',
  skipped: 'Skipped',
  context: 'Context',
} as const

export function PlanInspector({
  assignment,
  onOpenNode,
}: {
  assignment?: PlanAssignment
  onOpenNode?: (nodeId: string) => void
}) {
  const focusSelection = useDemoStore((s) => s.focusSelection)

  if (!assignment) {
    return (
      <div>
        <p className="eyebrow mb-3">Assigned work</p>
        <p className="text-[14px] leading-relaxed text-pm-muted">
          Click a node in the plan tree to see the work the director assigned there.
        </p>
      </div>
    )
  }

  function openTask(task: PlanSubtask) {
    if (task.sourceIds?.length || task.findingId || task.paperNodeId) {
      focusSelection({
        sourceIds: task.sourceIds ?? [],
        findingId: task.findingId,
        paperNodeId: task.paperNodeId,
      })
    }
    if (task.agentId) onOpenNode?.(task.agentId)
  }

  return (
    <div className="flex min-h-0 flex-col gap-5">
      <div>
        <p className="eyebrow mb-3">Assigned work</p>
        <p className="text-[16px] font-[650] leading-snug text-pm-ink">{assignment.title}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {assignment.roleLabel ? (
            <span className="rounded-[5px] bg-pm-bg-subtle px-2 py-1 text-[12px] font-bold tracking-[0.04em] text-pm-muted uppercase">
              {assignment.roleLabel}
            </span>
          ) : null}
          <span
            className={cn(
              'rounded-[5px] px-2 py-1 text-[12px] font-bold tracking-[0.02em]',
              assignment.status === 'skipped'
                ? 'bg-pm-wf-blocked-fill text-pm-status-supported'
                : assignment.status === 'selected'
                  ? 'bg-pm-accent-soft text-pm-accent'
                  : 'bg-pm-status-unverified-fill text-pm-muted-2',
            )}
          >
            {STATUS_LABEL[assignment.status]}
          </span>
        </div>
      </div>

      <section>
        <p className="text-[12px] font-bold tracking-[0.08em] text-pm-muted uppercase">
          What the director assigned
        </p>
        <p className="mt-2 text-[14px] leading-relaxed text-pm-ink">{assignment.summary}</p>
        {assignment.kind === 'agent' && assignment.tasks.length > 0 ? (
          <p className="mt-2 text-[13px] text-pm-muted">
            {assignment.tasks.filter((task) => task.kind === 'finding').length} findings ·{' '}
            {assignment.tasks.filter((task) => task.kind === 'signal').length} signals
          </p>
        ) : null}
      </section>

      {assignment.skipReason ? (
        <aside className="rounded-[8px] border-l-[3px] border-pm-line bg-pm-status-unverified-fill px-3.5 py-3">
          <p className="text-[12px] font-bold tracking-[0.15em] text-pm-muted uppercase">
            Skip reason
          </p>
          <p className="mt-1 text-[14px] text-pm-ink">{assignment.skipReason}</p>
        </aside>
      ) : null}

      <section>
        <p className="text-[12px] font-bold tracking-[0.08em] text-pm-muted uppercase">
          Subtasks
        </p>
        {assignment.tasks.length === 0 ? (
          <p className="mt-2 text-[14px] leading-relaxed text-pm-muted">
            The director did not assign further subtasks to this node.
          </p>
        ) : (
          <ul className="mt-2 grid gap-2">
            {assignment.tasks.map((task) => (
              <li key={task.id}>
                <button
                  type="button"
                  className="w-full rounded-[8px] border border-pm-line bg-pm-bg-subtle p-3.5 text-left hover:border-pm-accent"
                  onClick={() => openTask(task)}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-[5px] bg-pm-surface px-2 py-0.5 text-[11px] font-bold tracking-[0.06em] text-pm-muted uppercase">
                      {TASK_KIND_LABEL[task.kind]}
                    </span>
                    {task.findingId ? (
                      <span className="font-mono text-[12px] text-pm-accent">{task.findingId}</span>
                    ) : null}
                  </div>
                  <p className="mt-1.5 text-[14px] font-[650] text-pm-ink">{task.label}</p>
                  {task.detail ? (
                    <p className="mt-1 text-[13px] leading-relaxed text-pm-muted">{task.detail}</p>
                  ) : null}
                </button>
                {task.findingId ? (
                  <div className="mt-1.5">
                    <Link to="/review">
                      <Button variant="ghost" size="sm">
                        Open in Review →
                      </Button>
                    </Link>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      {assignment.notes && assignment.notes.length > 0 ? (
        <section>
          <p className="text-[12px] font-bold tracking-[0.08em] text-pm-muted uppercase">
            Routing notes
          </p>
          <ul className="mt-2 grid gap-2">
            {assignment.notes.map((note) => (
              <li key={note} className="text-[14px] leading-relaxed text-pm-ink">
                {note}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
