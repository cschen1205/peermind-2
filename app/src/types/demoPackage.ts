import type { AskPeerMindConfig } from './ask'
import type { ComparisonPreset } from './comparison'
import type {
  FindingRecord,
  ReviewDocument,
  ReviewSignal,
  ReviewerAgent,
  SkippedCapability,
} from './finding'
import type { ConferenceStyle } from './paper'
import type {
  DemoMetadata,
  PaperGraph,
  PaperMetadata,
  PaperSection,
  PaperSummary,
  SourceRecord,
} from './paper'
import type {
  CounterfactualRecord,
  ImpactAssessment,
  PlaybackEvent,
  VerificationRecord,
} from './verification'

export interface ReviewPlan {
  paperType: string
  centralClaimIds: string[]
  selectedReviewerIds: string[]
  selectedVerifierIds: string[]
  skippedReviewers: SkippedCapability[]
  skippedVerifiers: SkippedCapability[]
  routingEvents: PlaybackEvent[]
  notes?: string[]
}

export interface ReviewerRun {
  signals: ReviewSignal[]
  candidateAgents: ReviewerAgent[]
  selectedAgentIds: string[]
  routingEvents?: PlaybackEvent[]
  review: ReviewDocument
}

export interface ReviewRating {
  label: string
  score: string
  scale: string
  scaleLabel: string
}

export interface SynthesisDefinition {
  summary: string
  strengths: string[]
  majorWeaknesses: string[]
  minorWeaknesses: string[]
  authorQuestions: string[]
  evidenceNotes?: string[]
  recommendation?: string
  confidence?: string
  ratings?: ReviewRating[]
  conferenceStyle: ConferenceStyle
}

export interface DemoDataPackage {
  schemaVersion: '2.0'
  demo: DemoMetadata
  paper: PaperMetadata
  sources: SourceRecord[]
  sections: PaperSection[]
  paperGraph: PaperGraph
  paperSummary: PaperSummary
  reviewPlan: ReviewPlan
  reviewerRun: ReviewerRun
  findings: FindingRecord[]
  verifications: VerificationRecord[]
  impactAssessments: ImpactAssessment[]
  counterfactualTests: CounterfactualRecord[]
  synthesis: SynthesisDefinition
  askPeerMind?: AskPeerMindConfig
  comparisonPreset?: ComparisonPreset
}
