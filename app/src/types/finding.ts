export type FindingValidity =
  | 'verified'
  | 'supported'
  | 'refuted'
  | 'unverified'
  | 'disputed'
  | 'human_required'
  | 'not_checked'

export const FINDING_VALIDITY_LABELS: Record<FindingValidity, string> = {
  verified: 'Verified',
  supported: 'Supported Concern',
  refuted: 'Refuted',
  unverified: 'Unverified',
  disputed: 'Disputed',
  human_required: 'Human Required',
  not_checked: 'Not Checked',
}

export interface CritiqueContract {
  allegation: string
  type: string
  scope: string
  falsifier: string
  evidenceBurden: string
  stopRule: string
  relevanceTarget: string
}

export interface EvidenceRecord {
  id: string
  direction: 'for' | 'against' | 'gap'
  sourceIds: string[]
  summary: string
  toolId?: string
}

export interface FindingRecord {
  id: string
  category: string
  critique: string
  reviewerAgentId: string
  sourceIds: string[]
  contract: CritiqueContract
  evidenceFor: EvidenceRecord[]
  evidenceAgainst: EvidenceRecord[]
  missingEvidence: string[]
  validity: FindingValidity
  importance: {
    level: string
    explanation: string
  }
  sensitivity?: {
    status: 'passed' | 'failed' | 'inconclusive' | 'not_applicable'
    explanation: string
  }
  limitations: string[]
  nextAction?: string
}

export interface ReviewSignal {
  id: string
  label: string
  sourceIds: string[]
}

export interface ReviewerAgent {
  id: string
  label: string
  description?: string
  selected: boolean
  triggerSignalIds: string[]
}

export interface ReviewDocument {
  overallAssessment: string
  strengths: string[]
  authorQuestions: string[]
  findingIds: string[]
}

export interface ReportDefinition {
  summary: string
}
