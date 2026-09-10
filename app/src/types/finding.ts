export type EvidenceVerdict =
  | 'supported'
  | 'partially_supported'
  | 'refuted'
  | 'unverifiable'
  | 'open_question'

export type FindingStatus =
  | 'verified_high_impact'
  | 'verified_moderate_impact'
  | 'verified_low_impact'
  | 'partially_supported'
  | 'refuted'
  | 'unverifiable'
  | 'open_question'
  | 'severity_downgraded'

export type ImpactLevel = 'high' | 'moderate' | 'low' | 'unknown'
export type SensitivityLevel = ImpactLevel | 'not_identifiable'
export type SeverityLevel = 'major' | 'minor' | 'suggestion' | 'none'

export const EVIDENCE_VERDICT_LABELS: Record<EvidenceVerdict, string> = {
  supported: 'Supported',
  partially_supported: 'Partially supported',
  refuted: 'Refuted',
  unverifiable: 'Unverifiable',
  open_question: 'Open question',
}

export const FINDING_STATUS_LABELS: Record<FindingStatus, string> = {
  verified_high_impact: 'Verified — High impact',
  verified_moderate_impact: 'Verified — Moderate impact',
  verified_low_impact: 'Verified — Low impact',
  partially_supported: 'Partially supported',
  refuted: 'Refuted',
  unverifiable: 'Unverifiable',
  open_question: 'Open question',
  severity_downgraded: 'Severity downgraded',
}

export const IMPACT_LEVEL_LABELS: Record<ImpactLevel, string> = {
  high: 'High',
  moderate: 'Moderate',
  low: 'Low',
  unknown: 'Unknown',
}

export const SENSITIVITY_LEVEL_LABELS: Record<SensitivityLevel, string> = {
  high: 'High',
  moderate: 'Moderate',
  low: 'Low',
  unknown: 'Unknown',
  not_identifiable: 'Not identifiable',
}

export const SEVERITY_LEVEL_LABELS: Record<SeverityLevel, string> = {
  major: 'Major',
  minor: 'Minor',
  suggestion: 'Suggestion',
  none: 'None',
}

export interface VerificationContract {
  allegation: string
  targetClaimId?: string
  verificationQuestion: string
  evidenceBurden: string
  falsifier: string
  preferredTools: string[]
  stopRule: string
}

export interface EvidenceRecord {
  id: string
  direction: 'for' | 'against' | 'gap'
  sourceIds: string[]
  summary: string
  toolId?: string
}

export interface FindingImpact {
  scopeRelevance: ImpactLevel
  necessity: ImpactLevel
  sensitivity: SensitivityLevel
  explanation: string
}

export interface FindingRecord {
  id: string
  category: string
  critique: string
  reviewerAgentId: string
  targetClaimId?: string
  sourceIds: string[]
  proposedSeverity: SeverityLevel
  contract: VerificationContract
  evidenceFor: EvidenceRecord[]
  evidenceAgainst: EvidenceRecord[]
  missingEvidence: string[]
  evidenceVerdict: EvidenceVerdict
  impact?: FindingImpact
  finalSeverity: SeverityLevel
  status: FindingStatus
  calibratedComment?: string
  limitations: string[]
  nextAction?: string
}

export interface ReviewSignal {
  id: string
  label: string
  sourceIds: string[]
}

export type ReviewerRole = 'reviewer' | 'verifier' | 'director' | 'meta_reviewer'

export interface ReviewerAgent {
  id: string
  label: string
  role: ReviewerRole
  description?: string
  selected: boolean
  triggerSignalIds: string[]
}

export interface SkippedCapability {
  id: string
  label: string
  reason: string
}

export interface ReviewDocument {
  findingIds: string[]
  draftNotes?: string[]
  authorQuestions: string[]
}
