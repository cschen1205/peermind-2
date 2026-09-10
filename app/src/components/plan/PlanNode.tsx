import { Handle, Position, type Node, type NodeProps } from '@xyflow/react'
import { cn } from '@/lib/utils'
import type { PlanNodeKind } from './buildPlanTree'

export type PlanNodeData = {
  label: string
  subtitle?: string
  kind: PlanNodeKind
  skipped?: boolean
  selected?: boolean
  onSelect?: () => void
}

const KIND_CLASS: Record<PlanNodeKind, string> = {
  paper: 'bg-pm-graph-method-fill border-pm-graph-method-stroke',
  director: 'bg-pm-wf-current-fill border-pm-wf-current-stroke',
  group: 'bg-pm-surface border-pm-wf-idle-stroke',
  findings: 'bg-pm-graph-claim-fill border-pm-graph-claim-stroke',
  agent: 'bg-pm-surface border-pm-wf-idle-stroke',
}

export function PlanNode({ data }: NodeProps<Node<PlanNodeData>>) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={data.selected}
      className={cn(
        'nodrag nopan min-w-[168px] max-w-[180px] cursor-pointer rounded-[9px] border px-3 py-2.5',
        data.skipped
          ? 'border-dashed border-pm-wf-blocked-stroke bg-pm-wf-blocked-fill opacity-80'
          : KIND_CLASS[data.kind],
        data.selected && 'border-pm-accent shadow-[0_0_0_3px_#6554cf55]',
      )}
      onClick={(event) => {
        event.stopPropagation()
        data.onSelect?.()
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          data.onSelect?.()
        }
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!size-2 !border-pm-line !bg-pm-surface"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!size-2 !border-pm-line !bg-pm-surface"
      />
      <p className="text-[13px] font-[650] leading-tight text-pm-ink">{data.label}</p>
      {data.subtitle ? (
        <p className="mt-1 text-[11px] leading-snug text-pm-muted">{data.subtitle}</p>
      ) : null}
    </div>
  )
}
