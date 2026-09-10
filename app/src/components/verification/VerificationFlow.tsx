import { useCallback, useMemo } from 'react'
import { RotateCcw } from 'lucide-react'
import {
  Background,
  Panel,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Edge,
  type Node,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Button } from '@/components/ui/button'
import type { NodePlayState } from '@/demo/playbackEngine'
import { VerificationNode, type VerificationNodeData } from './VerificationNode'
import type { WorkflowEdgeData, WorkflowNodeData } from '@/types/verification'

const nodeTypes = { verification: VerificationNode }

const NODE_WIDTH = 220
const NODE_HEIGHT = 72
const NODE_GAP_Y = 120
const GRAPH_PAD_Y = 40
const FIT_PADDING = 0.1

function layoutNodes(nodes: WorkflowNodeData[]): WorkflowNodeData[] {
  const positioned = nodes.filter((node) => node.x != null && node.y != null)
  const maxX = positioned.reduce((max, node) => Math.max(max, node.x ?? 0), 0)
  const maxY = positioned.reduce((max, node) => Math.max(max, node.y ?? 0), 0)
  let skipIndex = 0
  let fallbackIndex = 0

  return nodes.map((node) => {
    if (node.x != null && node.y != null) return node
    if (node.kind === 'skip') {
      const next = {
        ...node,
        x: 36 + skipIndex * NODE_WIDTH,
        y: (positioned.length > 0 ? maxY : 88) + NODE_GAP_Y,
      }
      skipIndex += 1
      return next
    }
    const next = {
      ...node,
      x: positioned.length > 0 ? maxX + NODE_WIDTH : 36 + fallbackIndex * NODE_WIDTH,
      y: positioned.length > 0 ? 88 : 16,
    }
    fallbackIndex += 1
    return next
  })
}

function graphCanvasHeight(nodes: WorkflowNodeData[]): number {
  if (nodes.length === 0) return 320
  const maxBottom = Math.max(...nodes.map((node) => (node.y ?? 0) + NODE_HEIGHT))
  return Math.max(280, Math.round(maxBottom + GRAPH_PAD_Y))
}

export function verificationGraphHeight(nodes: WorkflowNodeData[]): number {
  return graphCanvasHeight(layoutNodes(nodes))
}

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

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function GraphResetButton() {
  const { fitView } = useReactFlow()
  const resetView = useCallback(() => {
    void fitView({
      padding: FIT_PADDING,
      duration: prefersReducedMotion() ? 0 : 280,
    })
  }, [fitView])

  return (
    <Panel position="top-right" className="m-2">
      <Button type="button" variant="secondary" size="sm" onClick={resetView}>
        <RotateCcw size={14} strokeWidth={1.75} />
        Reset view
      </Button>
    </Panel>
  )
}

function VerificationCanvas({
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
  const laidOut = useMemo(() => layoutNodes(workflowNodes), [workflowNodes])
  const height = useMemo(() => graphCanvasHeight(laidOut), [laidOut])

  const nodes: Node<VerificationNodeData>[] = useMemo(
    () =>
      laidOut.map((node) => ({
        id: node.id,
        type: 'verification',
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
    [laidOut, nodeStates, onNodeSelect, selectedNodeId],
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
    <div className="relative w-full bg-pm-bg-paper-grid" style={{ height }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: FIT_PADDING }}
        minZoom={0.45}
        maxZoom={1.5}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable
        panOnDrag
        zoomOnScroll
        onNodeClick={(_, node) => onNodeSelect?.(node.id)}
      >
        <Background gap={18} color="#e8ebf2" />
        <GraphResetButton />
      </ReactFlow>
    </div>
  )
}

export function VerificationFlow({
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
      <VerificationCanvas
        workflowNodes={workflowNodes}
        workflowEdges={workflowEdges}
        nodeStates={nodeStates}
        selectedNodeId={selectedNodeId}
        onNodeSelect={onNodeSelect}
      />
    </ReactFlowProvider>
  )
}
