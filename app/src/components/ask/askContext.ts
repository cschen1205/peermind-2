import type { DemoStage, VerifyPanel } from '@/store/demoStore'
import type { AskContextScope } from '@/types/ask'

export const ASK_SCOPE_LABELS: Record<AskContextScope, string> = {
  whole_paper: 'Whole paper',
  section: 'Selected section',
  source: 'Selected evidence',
  paper_graph_node: 'Paper graph node',
  finding: 'Selected critique',
  verification: 'Verification',
  evidence_ledger: 'Evidence ledger',
  impact: 'Impact',
  counterfactual_test: 'Counterfactual test',
  synthesis: 'Synthesize finding',
  comparison: 'Comparison finding',
}

export function deriveAskContext(input: {
  stage: DemoStage
  selectedPaperNodeId?: string
  selectedSourceIds: string[]
  selectedFindingId?: string
  selectedComparisonThemeId?: string
  verifyPanel?: VerifyPanel
}): { scope: AskContextScope; contextIds: string[] } {
  const {
    stage,
    selectedPaperNodeId,
    selectedSourceIds,
    selectedFindingId,
    selectedComparisonThemeId,
    verifyPanel,
  } = input

  if (stage === 'compare') {
    return {
      scope: 'comparison',
      contextIds: selectedComparisonThemeId ? [selectedComparisonThemeId] : [],
    }
  }
  if (stage === 'verify' && selectedFindingId) {
    return {
      scope: verifyPanel === 'impact' ? 'impact' : 'verification',
      contextIds: [selectedFindingId],
    }
  }
  if (stage === 'understand' || stage === 'plan') {
    if (selectedPaperNodeId) {
      return { scope: 'paper_graph_node', contextIds: [selectedPaperNodeId] }
    }
    if (selectedSourceIds[0]) {
      return { scope: 'source', contextIds: [selectedSourceIds[0]] }
    }
    return { scope: 'whole_paper', contextIds: [] }
  }
  if ((stage === 'review' || stage === 'synthesize') && selectedFindingId) {
    return {
      scope: stage === 'synthesize' ? 'synthesis' : 'finding',
      contextIds: [selectedFindingId],
    }
  }
  return { scope: 'whole_paper', contextIds: [] }
}
