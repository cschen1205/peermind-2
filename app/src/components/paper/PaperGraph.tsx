import { useEffect, useRef } from 'react'
import { Graph, NodeEvent } from '@antv/g6'
import { RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NODE_TYPE_LABELS } from '@/data/queryPackage'
import { cn } from '@/lib/utils'
import { cssVar, graphNodeColors, NODE_SWATCH_CLASS } from '@/styles/graphStyles'
import type { PaperGraph as PaperGraphData, PaperNode } from '@/types/paper'

const NODE_TYPES: PaperNode['type'][] = ['method', 'claim', 'evidence', 'gap', 'question']

export function GraphLegend({
  graph,
  onNodeSelect,
}: {
  graph: PaperGraphData
  onNodeSelect: (nodeId: string) => void
}) {
  return (
    <ul className="flex flex-wrap items-center gap-2">
      {NODE_TYPES.filter((type) => graph.nodes.some((node) => node.type === type)).map((type) => {
        const sample = graph.nodes.find((node) => node.type === type)
        return (
          <li key={type}>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-[5px] px-1.5 py-1 text-[11px] font-bold tracking-[0.04em] text-pm-muted uppercase"
              onClick={() => sample && onNodeSelect(sample.id)}
            >
              <span
                className={cn('size-2 rounded-full', NODE_SWATCH_CLASS[type])}
                aria-hidden="true"
              />
              {NODE_TYPE_LABELS[type]}
            </button>
          </li>
        )
      })}
    </ul>
  )
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function nodeKind(datum: { data?: Record<string, unknown> }): PaperNode['type'] {
  const kind = datum.data?.kind
  if (
    kind === 'method' ||
    kind === 'claim' ||
    kind === 'evidence' ||
    kind === 'gap' ||
    kind === 'question'
  ) {
    return kind
  }
  return 'claim'
}

function toGraphData(graph: PaperGraphData) {
  const hints = new Map((graph.layoutHints ?? []).map((hint) => [hint.nodeId, hint]))
  return {
    nodes: graph.nodes.map((node) => {
      const hint = hints.get(node.id)
      return {
        id: node.id,
        data: { kind: node.type, label: node.label },
        style: { x: hint?.x ?? 0, y: hint?.y ?? 0 },
      }
    }),
    edges: graph.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      data: { relation: edge.relation },
    })),
  }
}

export function PaperGraph({
  graph,
  selectedNodeId,
  onNodeSelect,
  showHeader = true,
}: {
  graph: PaperGraphData
  selectedNodeId?: string
  onNodeSelect: (nodeId: string) => void
  showHeader?: boolean
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const graphRef = useRef<Graph | null>(null)
  const onSelectRef = useRef(onNodeSelect)

  useEffect(() => {
    onSelectRef.current = onNodeSelect
  }, [onNodeSelect])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const reduced = prefersReducedMotion()
    const ink = cssVar('--pm-ink')
    const muted = cssVar('--pm-muted')
    const accent = cssVar('--pm-accent')
    const edgeStroke = cssVar('--pm-graph-edge')
    const data = toGraphData(graph)

    const instance = new Graph({
      container,
      autoFit: { type: 'view', animation: false },
      padding: 28,
      animation: reduced ? false : { duration: 280 },
      data,
      node: {
        type: 'rect',
        style: {
          size: [148, 46],
          radius: 8,
          lineWidth: 1.5,
          opacity: 1,
          fill: (datum) => graphNodeColors(nodeKind(datum)).fill,
          stroke: (datum) => graphNodeColors(nodeKind(datum)).stroke,
          lineDash: (datum) => (nodeKind(datum) === 'gap' ? [5, 3] : [0, 0]),
          labelText: (datum) => String(datum.data?.label ?? datum.id),
          labelFill: ink,
          labelFontSize: 12,
          labelFontWeight: 650,
          labelFontFamily: 'Inter, sans-serif',
          labelWordWrap: true,
          labelMaxLines: 2,
          labelMaxWidth: 132,
          labelPlacement: 'center',
          cursor: 'pointer',
        },
        state: {
          selected: {
            lineWidth: 3,
            stroke: accent,
            lineDash: [],
            opacity: 1,
          },
        },
      },
      edge: {
        type: 'polyline',
        style: {
          stroke: edgeStroke,
          lineWidth: 1.25,
          endArrow: true,
          labelText: (datum) => String(datum.data?.relation ?? ''),
          labelFill: muted,
          labelFontSize: 10,
          labelBackground: true,
          labelBackgroundFill: cssVar('--pm-bg-paper-grid'),
          labelBackgroundOpacity: 0.92,
        },
      },
      behaviors: ['drag-canvas', 'zoom-canvas'],
    })

    instance.on(NodeEvent.CLICK, (event) => {
      if (!('target' in event) || !event.target || typeof event.target !== 'object') return
      if (!('id' in event.target)) return
      const id = String(event.target.id)
      if (id) onSelectRef.current(id)
    })

    void instance.render()
    graphRef.current = instance

    let fitted = false
    const observer = new ResizeObserver(() => {
      const width = container.clientWidth
      const height = container.clientHeight
      if (width > 0 && height > 0) {
        instance.setSize(width, height)
        if (!fitted) {
          fitted = true
          void instance.fitView({ when: 'always' }, false)
        }
      }
    })
    observer.observe(container)

    return () => {
      observer.disconnect()
      instance.destroy()
      graphRef.current = null
    }
  }, [graph])

  useEffect(() => {
    const instance = graphRef.current
    if (!instance) return
    const states: Record<string, string[]> = {}
    for (const node of graph.nodes) {
      states[node.id] = selectedNodeId && node.id === selectedNodeId ? ['selected'] : []
    }
    void instance.setElementState(states, false)
  }, [graph.nodes, selectedNodeId])

  function resetView() {
    const instance = graphRef.current
    if (!instance) return
    const animate = prefersReducedMotion() ? false : { duration: 280 }
    void instance.fitView({ when: 'always' }, animate)
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      {showHeader ? (
        <div className="flex items-center justify-between gap-3 border-b border-pm-line px-[18px] py-3.5">
          <p className="text-[13px] text-pm-muted">Paper Evidence Graph</p>
          <GraphLegend graph={graph} onNodeSelect={onNodeSelect} />
        </div>
      ) : null}
      <div className="relative min-h-0 flex-1">
        <div
          ref={containerRef}
          className={cn(
            'absolute inset-0 bg-pm-bg-paper-grid',
            showHeader && 'min-h-[420px]',
          )}
          role="img"
          aria-label="Paper evidence graph"
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="absolute top-3 right-3 z-10"
          onClick={resetView}
        >
          <RotateCcw size={14} strokeWidth={1.75} />
          Reset view
        </Button>
      </div>
    </div>
  )
}
