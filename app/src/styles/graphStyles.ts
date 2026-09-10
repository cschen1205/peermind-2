import type { HighlightRole, PaperNode } from '@/types/paper'

export const GRAPH_NODE_TOKEN_NAMES: Record<
  PaperNode['type'],
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
  claim: 'bg-pm-graph-claim-dot',
  evidence: 'bg-pm-graph-evidence-dot',
  gap: 'bg-pm-graph-gap-dot',
  question: 'bg-pm-graph-question-dot',
}

export const NODE_CHIP_CLASS: Record<PaperNode['type'], string> = {
  method: 'bg-pm-graph-method-fill text-pm-ink ring-1 ring-pm-graph-method-stroke',
  claim: 'bg-pm-graph-claim-fill text-pm-ink ring-1 ring-pm-graph-claim-stroke',
  evidence: 'bg-pm-graph-evidence-fill text-pm-ink ring-1 ring-pm-graph-evidence-stroke',
  gap: 'bg-pm-graph-gap-fill text-pm-ink ring-1 ring-pm-graph-gap-stroke',
  question: 'bg-pm-graph-question-fill text-pm-ink ring-1 ring-pm-graph-question-stroke',
}

export function cssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

export function graphNodeColors(type: PaperNode['type']): { fill: string; stroke: string; dot: string } {
  const tokens = GRAPH_NODE_TOKEN_NAMES[type] ?? GRAPH_NODE_TOKEN_NAMES.claim
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
