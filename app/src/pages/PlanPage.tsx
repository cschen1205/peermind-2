import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { WorkflowLayout } from '@/components/layout/WorkflowLayout'
import { PlanInspector } from '@/components/plan/PlanInspector'
import { PlanTree } from '@/components/plan/PlanTree'
import {
  PLAN_DIRECTOR_ID,
  buildPlanTree,
  getPlanAssignment,
} from '@/components/plan/buildPlanTree'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useDemoStore } from '@/store/demoStore'

export function PlanPage() {
  const pkg = useDemoStore((s) => s.package)
  const [selectedNodeId, setSelectedNodeId] = useState(PLAN_DIRECTOR_ID)

  const tree = useMemo(() => (pkg ? buildPlanTree(pkg) : { nodes: [], edges: [] }), [pkg])
  const assignment = pkg ? getPlanAssignment(pkg, selectedNodeId) : undefined

  if (!pkg) return null

  return (
    <WorkflowLayout stage="plan" fill>
      <div className="mb-7 flex shrink-0 items-end justify-between gap-5 max-[760px]:flex-col max-[760px]:items-start">
        <div>
          <p className="eyebrow">02 / Plan</p>
          <h1 className="type-h1">The director decides what to run.</h1>
          <p className="mt-3 max-w-[720px] text-pm-muted">
            Reviewers generate candidate findings first. The Verification Network is planned
            after those reviews, not beside them. Click a node to see the assigned work.
          </p>
        </div>
        <Link to="/review">
          <Button>Continue to Review →</Button>
        </Link>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_minmax(280px,360px)] gap-[18px] overflow-hidden max-[1100px]:grid-cols-1 max-[1100px]:overflow-y-auto">
        <Card className="flex min-h-0 flex-col overflow-hidden p-0 shadow-none ring-0 max-[1100px]:min-h-[320px]">
          <PlanTree
            className="min-h-0 flex-1"
            graphNodes={tree.nodes}
            graphEdges={tree.edges}
            selectedNodeId={selectedNodeId}
            onNodeSelect={setSelectedNodeId}
          />
          <div className="flex shrink-0 flex-wrap gap-4 border-t border-pm-line px-4 py-3 text-[12px] text-pm-muted">
            <span className="inline-flex items-center gap-2">
              <span className="size-2.5 rounded-[3px] bg-pm-wf-current-fill ring-1 ring-pm-wf-current-stroke" />
              Director
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="size-2.5 rounded-[3px] bg-pm-surface ring-1 ring-pm-wf-idle-stroke" />
              Selected
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="size-2.5 rounded-[3px] border border-dashed border-pm-wf-blocked-stroke bg-pm-wf-blocked-fill" />
              Skipped
            </span>
          </div>
        </Card>

        <Card className="flex min-h-0 flex-col overflow-hidden p-4 shadow-none ring-0 max-[1100px]:min-h-[280px]">
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain pr-1">
            <PlanInspector assignment={assignment} onOpenNode={setSelectedNodeId} />
          </div>
        </Card>
      </div>
    </WorkflowLayout>
  )
}
