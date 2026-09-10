import type { EvidenceRecord, FindingValidity } from './finding'

export interface ReplanEvent {
  reason: string
  attempt: number
  maxAttempts: number
  spawnedAgentIds: string[]
  requestedEvidence: string[]
}

export type PlaybackEvent =
  | { type: 'message'; text: string }
  | { type: 'activate_node'; nodeId: string }
  | { type: 'complete_node'; nodeId: string }
  | { type: 'spawn_agent'; agentId: string }
  | { type: 'reveal_source'; sourceIds: string[] }
  | { type: 'update_ledger'; evidenceRecordIds: string[] }
  | { type: 'replan'; replan: ReplanEvent }
  | { type: 'verdict'; status: FindingValidity }
  | { type: 'stop'; reason: string }

export interface WorkflowNodeData {
  id: string
  label: string
  subtitle?: string
  kind?: string
  x?: number
  y?: number
}

export interface WorkflowEdgeData {
  id: string
  source: string
  target: string
  relation?: string
}

export interface EvidenceLedger {
  for: EvidenceRecord[]
  against: EvidenceRecord[]
  gaps: EvidenceRecord[]
}

export interface InvestigationRecord {
  findingId: string
  agentIds: string[]
  workflowNodes: WorkflowNodeData[]
  workflowEdges: WorkflowEdgeData[]
  events: PlaybackEvent[]
  finalLedger: EvidenceLedger
  initialVerdict: FindingValidity
  limitations: string[]
  counterfactualTestId?: string
}

export type CounterfactualResult =
  | 'passed'
  | 'failed'
  | 'inconclusive'
  | 'not_applicable'

export interface CounterfactualVariant {
  label: string
  description: string
  changedSourceIds: string[]
  reviewerResponse: string
}

export interface CounterfactualRecord {
  id: string
  findingId: string
  baseline: CounterfactualVariant
  targeted: CounterfactualVariant
  control: CounterfactualVariant
  expectedBehavior: string
  result: CounterfactualResult
  explanation: string
}
