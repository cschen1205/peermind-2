import type { AskPeerMindConfig } from './ask'
import type { ComparisonPreset } from './comparison'
import type {
  FindingRecord,
  ReportDefinition,
  ReviewDocument,
  ReviewSignal,
  ReviewerAgent,
} from './finding'
import type { CounterfactualRecord, InvestigationRecord, PlaybackEvent } from './investigation'
import type {
  DemoMetadata,
  PaperGraph,
  PaperMetadata,
  PaperSection,
  PaperSummary,
  SourceRecord,
} from './paper'

export interface ReviewerRun {
  signals: ReviewSignal[]
  candidateAgents: ReviewerAgent[]
  selectedAgentIds: string[]
  routingEvents: PlaybackEvent[]
  review: ReviewDocument
}

export interface DemoDataPackage {
  schemaVersion: '1.0'
  demo: DemoMetadata
  paper: PaperMetadata
  sources: SourceRecord[]
  sections: PaperSection[]
  paperGraph: PaperGraph
  paperSummary: PaperSummary
  reviewerRun: ReviewerRun
  findings: FindingRecord[]
  investigations: InvestigationRecord[]
  counterfactualTests: CounterfactualRecord[]
  report: ReportDefinition
  askPeerMind?: AskPeerMindConfig
  comparisonPreset?: ComparisonPreset
}
