import type { DemoStage } from '@/store/demoStore'
import type { AskContextScope } from '@/types/ask'

export const ASK_SCOPE_LABELS: Record<AskContextScope, string> = {
  whole_paper: 'Whole paper',
  section: 'Selected section',
  source: 'Selected evidence',
  paper_graph_node: 'Paper graph node',
  finding: 'Selected critique',
  evidence_ledger: 'Evidence ledger',
  counterfactual_test: 'Counterfactual test',
  report: 'Report finding',
  comparison: 'Comparison theme',
}

export function deriveAskContext(input: {
  stage: DemoStage
  selectedPaperNodeId?: string
  selectedSourceIds: string[]
  selectedFindingId?: string
  selectedComparisonThemeId?: string
}): { scope: AskContextScope; contextIds: string[] } {
  const {
    stage,
    selectedPaperNodeId,
    selectedSourceIds,
    selectedFindingId,
    selectedComparisonThemeId,
  } = input

  if (stage === 'compare') {
    return {
      scope: 'comparison',
      contextIds: selectedComparisonThemeId ? [selectedComparisonThemeId] : [],
    }
  }
  if (stage === 'test') {
    return {
      scope: 'counterfactual_test',
      contextIds: selectedFindingId ? [selectedFindingId] : [],
    }
  }
  if (stage === 'understand') {
    if (selectedPaperNodeId) {
      return { scope: 'paper_graph_node', contextIds: [selectedPaperNodeId] }
    }
    if (selectedSourceIds[0]) {
      return { scope: 'source', contextIds: [selectedSourceIds[0]] }
    }
    return { scope: 'whole_paper', contextIds: [] }
  }
  if (
    (stage === 'review' || stage === 'challenge' || stage === 'report') &&
    selectedFindingId
  ) {
    return { scope: 'finding', contextIds: [selectedFindingId] }
  }
  return { scope: 'whole_paper', contextIds: [] }
}
