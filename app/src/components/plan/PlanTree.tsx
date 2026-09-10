import { useMemo } from 'react'
import {
  Background,
  ReactFlow,
  ReactFlowProvider,
  type Edge,
  type Node,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { cn } from '@/lib/utils'
import { PlanNode, type PlanNodeData } from './PlanNode'
import type { PlanGraphEdge, PlanGraphNode } from './buildPlanTree'

const nodeTypes = { plan: PlanNode }

function PlanCanvas({
  graphNodes,
  graphEdges,
  selectedNodeId,
  onNodeSelect,
  className,
}: {
  graphNodes: PlanGraphNode[]
  graphEdges: PlanGraphEdge[]
  selectedNodeId?: string
  onNodeSelect: (nodeId: string) => void
  className?: string
}) {
  const nodes: Node<PlanNodeData>[] = useMemo(
    () =>
      graphNodes.map((node) => ({
        id: node.id,
        type: 'plan',
        position: { x: node.x, y: node.y },
        data: {
          label: node.label,
          subtitle: node.subtitle,
          kind: node.kind,
          skipped: node.skipped,
          selected: selectedNodeId === node.id,
          onSelect: () => onNodeSelect(node.id),
        },
        selected: selectedNodeId === node.id,
        draggable: false,
        connectable: false,
        selectable: true,
      })),
    [graphNodes, onNodeSelect, selectedNodeId],
  )

  const edges: Edge[] = useMemo(
    () =>
      graphEdges.map((edge) => {
        const connected =
          selectedNodeId === edge.source || selectedNodeId === edge.target
        return {
          id: edge.id,
          source: edge.source,
          target: edge.target,
          type: 'smoothstep',
          animated: connected && !edge.skipped,
          style: {
            stroke: edge.skipped
              ? 'var(--pm-wf-edge-replan)'
              : connected
                ? 'var(--pm-wf-edge-current)'
                : 'var(--pm-wf-edge-idle)',
            strokeWidth: connected ? 2 : 1.5,
            strokeDasharray: edge.skipped || connected ? '6 4' : undefined,
          },
        }
      }),
    [graphEdges, selectedNodeId],
  )

  return (
    <div
      className={cn('h-full min-h-[280px] w-full bg-pm-bg-paper-grid', className)}
      aria-label="Review plan tree"
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.12 }}
        minZoom={0.55}
        maxZoom={1.15}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable
        panOnDrag
        zoomOnScroll
        onNodeClick={(_, node) => onNodeSelect(node.id)}
      >
        <Background gap={18} color="#e8ebf2" />
      </ReactFlow>
    </div>
  )
}

export function PlanTree({
  graphNodes,
  graphEdges,
  selectedNodeId,
  onNodeSelect,
  className,
}: {
  graphNodes: PlanGraphNode[]
  graphEdges: PlanGraphEdge[]
  selectedNodeId?: string
  onNodeSelect: (nodeId: string) => void
  className?: string
}) {
  return (
    <ReactFlowProvider>
      <PlanCanvas
        graphNodes={graphNodes}
        graphEdges={graphEdges}
        selectedNodeId={selectedNodeId}
        onNodeSelect={onNodeSelect}
        className={className}
      />
    </ReactFlowProvider>
  )
}
