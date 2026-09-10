import type { HighlightRole, PaperNode, PaperNodeType } from '@/types/paper'

type VisualKind = 'method' | 'claim' | 'evidence' | 'gap' | 'question'

const VISUAL_FAMILY: Record<PaperNodeType, VisualKind> = {
  method: 'method',
  experiment: 'method',
  dataset: 'method',
  equation: 'method',
  claim: 'claim',
  contribution: 'claim',
  assumption: 'claim',
  result: 'claim',
  metric: 'claim',
  baseline: 'claim',
  evidence: 'evidence',
  table: 'evidence',
  figure: 'evidence',
  gap: 'gap',
  limitation: 'gap',
  scope: 'gap',
  appendix: 'gap',
  question: 'question',
  reference: 'question',
}

export function visualNodeKind(type: PaperNodeType): VisualKind {
  return VISUAL_FAMILY[type] ?? 'claim'
}

export const GRAPH_NODE_TOKEN_NAMES: Record<
  VisualKind,
  { fill: string; stroke: string; dot: string }
> = {
  method: {
    fill: '--pm-graph-method-fill',
    stroke: '--pm-graph-method-stroke',
    dot: '--pm-graph-method-dot',
  },
  claim: {
    fill: '--pm-graph-claim-fill',
    stroke: '--pm-graph-claim-stroke',
    dot: '--pm-graph-claim-dot',
  },
  evidence: {
    fill: '--pm-graph-evidence-fill',
    stroke: '--pm-graph-evidence-stroke',
    dot: '--pm-graph-evidence-dot',
  },
  gap: {
    fill: '--pm-graph-gap-fill',
    stroke: '--pm-graph-gap-stroke',
    dot: '--pm-graph-gap-dot',
  },
  question: {
    fill: '--pm-graph-question-fill',
    stroke: '--pm-graph-question-stroke',
    dot: '--pm-graph-question-dot',
  },
}

const HIGHLIGHT_CLASS: Record<HighlightRole, string> = {
  claim: 'bg-pm-hl-claim',
  evidence_for: 'bg-pm-hl-evidence',
  counter_evidence: 'bg-pm-hl-counter',
  context: 'bg-pm-hl-context',
  selected: 'bg-pm-hl-selected',
}

export const NODE_SWATCH_CLASS: Record<PaperNode['type'], string> = {
  method: 'bg-pm-graph-method-dot',
  experiment: 'bg-pm-graph-method-dot',
  dataset: 'bg-pm-graph-method-dot',
  equation: 'bg-pm-graph-method-dot',
  claim: 'bg-pm-graph-claim-dot',
  contribution: 'bg-pm-graph-claim-dot',
  assumption: 'bg-pm-graph-claim-dot',
  result: 'bg-pm-graph-claim-dot',
  metric: 'bg-pm-graph-claim-dot',
  baseline: 'bg-pm-graph-claim-dot',
  evidence: 'bg-pm-graph-evidence-dot',
  table: 'bg-pm-graph-evidence-dot',
  figure: 'bg-pm-graph-evidence-dot',
  gap: 'bg-pm-graph-gap-dot',
  limitation: 'bg-pm-graph-gap-dot',
  scope: 'bg-pm-graph-gap-dot',
  appendix: 'bg-pm-graph-gap-dot',
  question: 'bg-pm-graph-question-dot',
  reference: 'bg-pm-graph-question-dot',
}

export const NODE_CHIP_CLASS: Record<PaperNode['type'], string> = {
  method: 'bg-pm-graph-method-fill text-pm-ink ring-1 ring-pm-graph-method-stroke',
  experiment: 'bg-pm-graph-method-fill text-pm-ink ring-1 ring-pm-graph-method-stroke',
  dataset: 'bg-pm-graph-method-fill text-pm-ink ring-1 ring-pm-graph-method-stroke',
  equation: 'bg-pm-graph-method-fill text-pm-ink ring-1 ring-pm-graph-method-stroke',
  claim: 'bg-pm-graph-claim-fill text-pm-ink ring-1 ring-pm-graph-claim-stroke',
  contribution: 'bg-pm-graph-claim-fill text-pm-ink ring-1 ring-pm-graph-claim-stroke',
  assumption: 'bg-pm-graph-claim-fill text-pm-ink ring-1 ring-pm-graph-claim-stroke',
  result: 'bg-pm-graph-claim-fill text-pm-ink ring-1 ring-pm-graph-claim-stroke',
  metric: 'bg-pm-graph-claim-fill text-pm-ink ring-1 ring-pm-graph-claim-stroke',
  baseline: 'bg-pm-graph-claim-fill text-pm-ink ring-1 ring-pm-graph-claim-stroke',
  evidence: 'bg-pm-graph-evidence-fill text-pm-ink ring-1 ring-pm-graph-evidence-stroke',
  table: 'bg-pm-graph-evidence-fill text-pm-ink ring-1 ring-pm-graph-evidence-stroke',
  figure: 'bg-pm-graph-evidence-fill text-pm-ink ring-1 ring-pm-graph-evidence-stroke',
  gap: 'bg-pm-graph-gap-fill text-pm-ink ring-1 ring-pm-graph-gap-stroke',
  limitation: 'bg-pm-graph-gap-fill text-pm-ink ring-1 ring-pm-graph-gap-stroke',
  scope: 'bg-pm-graph-gap-fill text-pm-ink ring-1 ring-pm-graph-gap-stroke',
  appendix: 'bg-pm-graph-gap-fill text-pm-ink ring-1 ring-pm-graph-gap-stroke',
  question: 'bg-pm-graph-question-fill text-pm-ink ring-1 ring-pm-graph-question-stroke',
  reference: 'bg-pm-graph-question-fill text-pm-ink ring-1 ring-pm-graph-question-stroke',
}

export function cssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

export function graphNodeColors(type: PaperNode['type']): { fill: string; stroke: string; dot: string } {
  const tokens = GRAPH_NODE_TOKEN_NAMES[visualNodeKind(type)]
  return {
    fill: cssVar(tokens.fill),
    stroke: cssVar(tokens.stroke),
    dot: cssVar(tokens.dot),
  }
}

export function highlightClass(role: HighlightRole | undefined, selected: boolean): string {
  if (selected) {
    return `${HIGHLIGHT_CLASS.selected} ring-2 ring-pm-accent`
  }
  return HIGHLIGHT_CLASS[role ?? 'context']
}
