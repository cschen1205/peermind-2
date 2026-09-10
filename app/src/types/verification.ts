import type {
  EvidenceRecord,
  EvidenceVerdict,
  FindingStatus,
  ImpactLevel,
  SensitivityLevel,
  SeverityLevel,
  VerificationContract,
} from './finding'

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
  | { type: 'skip_node'; nodeId: string; reason: string }
  | { type: 'spawn_agent'; agentId: string }
  | { type: 'reveal_source'; sourceIds: string[] }
  | { type: 'update_ledger'; evidenceRecordIds: string[] }
  | { type: 'replan'; replan: ReplanEvent }
  | { type: 'evidence_verdict'; status: EvidenceVerdict }
  | { type: 'impact_update'; assessmentId: string }
  | { type: 'calibrate'; findingId: string }
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
  provenance: string[]
  toolsUsed: string[]
}

export interface VerificationRecord {
  findingId: string
  contract: VerificationContract
  agentIds: string[]
  invokedToolIds: string[]
  skippedTools: Array<{ id: string; label: string; reason: string }>
  workflowNodes: WorkflowNodeData[]
  workflowEdges: WorkflowEdgeData[]
  events: PlaybackEvent[]
  ledger: EvidenceLedger
  evidenceVerdict: EvidenceVerdict
  limitations: string[]
  impactAssessmentId?: string
}

export interface ImpactAssessment {
  id: string
  findingId: string
  scopeRelevance: ImpactLevel
  scopeExplanation: string
  necessity: ImpactLevel
  necessityExplanation: string
  sensitivity: SensitivityLevel
  sensitivityExplanation: string
  counterfactualTestId?: string
  finalSeverity: SeverityLevel
  status: FindingStatus
}

export interface CounterfactualVariant {
  label: string
  description: string
  changedSourceIds: string[]
  claimSupport: string
}

export interface CounterfactualRecord {
  id: string
  findingId: string
  identifiable: boolean
  reason?: string
  currentSupport?: string
  intervention?: string
  reevaluatedSupport?: string
  sensitivity?: Exclude<SensitivityLevel, 'unknown' | 'not_identifiable'>
  current?: CounterfactualVariant
  intervened?: CounterfactualVariant
}
