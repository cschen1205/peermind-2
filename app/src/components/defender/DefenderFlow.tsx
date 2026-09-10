import { useMemo } from 'react'
import {
  Background,
  ReactFlow,
  ReactFlowProvider,
  type Edge,
  type Node,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import type { NodePlayState } from '@/demo/playbackEngine'
import { DefenderNode, type DefenderNodeData } from './DefenderNode'
import type { WorkflowEdgeData, WorkflowNodeData } from '@/types/investigation'

const nodeTypes = { defender: DefenderNode }

function edgeVisual(
  sourceState: NodePlayState | undefined,
  targetState: NodePlayState | undefined,
  relation?: string,
): { stroke: string; animated: boolean; dashed: boolean } {
  const currentLike = sourceState === 'current' || targetState === 'current'
  const blockedLike =
    relation === 'replan' || sourceState === 'blocked' || targetState === 'blocked'
  const doneLike = sourceState === 'done' && (targetState === 'done' || targetState === 'current')

  if (blockedLike) {
    return { stroke: 'var(--pm-wf-edge-replan)', animated: false, dashed: true }
  }
  if (currentLike) {
    return { stroke: 'var(--pm-wf-edge-current)', animated: true, dashed: true }
  }
  if (doneLike || (sourceState === 'done' && targetState === 'done')) {
    return { stroke: 'var(--pm-wf-edge-done)', animated: false, dashed: false }
  }
  return { stroke: 'var(--pm-wf-edge-idle)', animated: false, dashed: false }
}

function DefenderCanvas({
  workflowNodes,
  workflowEdges,
  nodeStates,
  selectedNodeId,
  onNodeSelect,
}: {
  workflowNodes: WorkflowNodeData[]
  workflowEdges: WorkflowEdgeData[]
  nodeStates: Record<string, NodePlayState>
  selectedNodeId?: string
  onNodeSelect?: (nodeId: string) => void
}) {
  const nodes: Node<DefenderNodeData>[] = useMemo(
    () =>
      workflowNodes.map((node) => ({
        id: node.id,
        type: 'defender',
        position: { x: node.x ?? 0, y: node.y ?? 0 },
        data: {
          label: node.label,
          subtitle: node.subtitle,
          state: nodeStates[node.id] ?? 'idle',
          selected: selectedNodeId === node.id,
          onSelect: () => onNodeSelect?.(node.id),
        },
        selected: selectedNodeId === node.id,
        draggable: false,
        connectable: false,
        selectable: true,
      })),
    [nodeStates, onNodeSelect, selectedNodeId, workflowNodes],
  )

  const edges: Edge[] = useMemo(
    () =>
      workflowEdges.map((edge) => {
        const visual = edgeVisual(nodeStates[edge.source], nodeStates[edge.target], edge.relation)
        return {
          id: edge.id,
          source: edge.source,
          target: edge.target,
          animated: visual.animated,
          style: {
            stroke: visual.stroke,
            strokeWidth: visual.animated ? 2 : 1.5,
            strokeDasharray: visual.dashed ? '6 4' : undefined,
            animation: visual.animated ? 'pm-edge-dash 1s linear infinite' : undefined,
          },
        }
      }),
    [nodeStates, workflowEdges],
  )

  return (
    <div className="h-[min(34vh,280px)] min-h-[200px] w-full bg-pm-bg-paper-grid">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.22 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable
        panOnDrag
        zoomOnScroll
        onNodeClick={(_, node) => onNodeSelect?.(node.id)}
      >
        <Background gap={18} color="#e8ebf2" />
      </ReactFlow>
    </div>
  )
}

export function DefenderFlow({
  workflowNodes,
  workflowEdges,
  nodeStates,
  selectedNodeId,
  onNodeSelect,
}: {
  workflowNodes: WorkflowNodeData[]
  workflowEdges: WorkflowEdgeData[]
  nodeStates: Record<string, NodePlayState>
  selectedNodeId?: string
  onNodeSelect?: (nodeId: string) => void
}) {
  return (
    <ReactFlowProvider>
      <DefenderCanvas
        workflowNodes={workflowNodes}
        workflowEdges={workflowEdges}
        nodeStates={nodeStates}
        selectedNodeId={selectedNodeId}
        onNodeSelect={onNodeSelect}
      />
    </ReactFlowProvider>
  )
}
