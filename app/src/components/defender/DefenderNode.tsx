import { Handle, Position, type Node, type NodeProps } from '@xyflow/react'
import type { NodePlayState } from '@/demo/playbackEngine'
import { cn } from '@/lib/utils'

export type DefenderNodeData = {
  label: string
  subtitle?: string
  state: NodePlayState
  selected?: boolean
  onSelect?: () => void
}

const STATE_CLASS: Record<NodePlayState, string> = {
  idle: 'bg-pm-wf-idle-fill border-pm-wf-idle-stroke',
  current:
    'bg-pm-wf-current-fill border-pm-wf-current-stroke border-[2.5px] shadow-[0_0_0_3px_#6554cf22]',
  done: 'bg-pm-wf-done-fill border-pm-wf-done-stroke',
  blocked: 'bg-pm-wf-blocked-fill border-pm-wf-blocked-stroke border-dashed',
  skipped: 'bg-pm-wf-idle-fill border-pm-wf-idle-stroke opacity-40',
  counterfactual: 'bg-pm-wf-cf-fill border-pm-wf-cf-stroke',
}

export function DefenderNode({ data }: NodeProps<Node<DefenderNodeData>>) {
  return (
    <div
      className={cn(
        'nodrag min-w-[168px] max-w-[200px] cursor-pointer rounded-[9px] border px-3 py-2.5',
        STATE_CLASS[data.state],
        data.selected && 'shadow-[0_0_0_3px_#6554cf55]',
      )}
      onClick={(event) => {
        event.stopPropagation()
        data.onSelect?.()
      }}
    >
      <Handle type="target" position={Position.Left} className="!size-2 !border-pm-line !bg-pm-surface" />
      <Handle type="source" position={Position.Right} className="!size-2 !border-pm-line !bg-pm-surface" />
      <Handle
        type="target"
        position={Position.Top}
        id="t-top"
        className="!size-2 !border-pm-line !bg-pm-surface"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="s-bottom"
        className="!size-2 !border-pm-line !bg-pm-surface"
      />
      <p className="text-[13px] font-[650] leading-tight text-pm-ink">{data.label}</p>
      {data.subtitle ? (
        <p className="mt-1 text-[11px] leading-snug text-pm-muted">{data.subtitle}</p>
      ) : null}
    </div>
  )
}
