import type { FindingStatus } from './finding'

export interface ReviewScore {
  label: string
  score: string
  scale: string
  scaleLabel: string
}

export interface HumanReviewInput {
  id: string
  label: string
  reviewText: string
  sourceType: 'openreview' | 'manual' | 'other'
  sourceUrl?: string
  fileName?: string
  ratings?: ReviewScore[]
}

export interface ComparisonExcerpt {
  reviewId: string
  reviewerLabel: string
  text: string
}

export interface ComparisonInputBundle {
  humanReviews: HumanReviewInput[]
  metaReview?: HumanReviewInput
  authorRebuttal?: HumanReviewInput
  baselineReview?: HumanReviewInput
}

export type ComparisonItemKind = 'weakness' | 'question'

export interface ComparisonTheme {
  id: string
  label: string
  kind?: ComparisonItemKind
  peerMindFindingIds: string[]
  humanFindingIds: string[]
  baselineFindingIds?: string[]
  relation: 'shared' | 'human_only' | 'peermind_only' | 'disagreement'
  sourceIds?: string[]
  verificationStatus?: FindingStatus
  explanation?: string
  excerpts?: ComparisonExcerpt[]
}

export interface ComparisonSummary {
  sharedCount: number
  humanOnlyCount: number
  peerMindOnlyCount: number
  disagreementCount: number
  refutedCount?: number
  questionCount?: number
  questionMappedCount?: number
  questionOpenCount?: number
}

export type ComparisonCalloutTag = 'incorrect' | 'too_broad' | 'missed' | 'shared'

export type ComparisonPartyId = 'chatgpt' | 'openreview' | 'peermind'

export interface ComparisonCallout {
  id: string
  tag: ComparisonCalloutTag
  reviewerLabel: string
  title: string
  detail: string
  themeId?: string
}

export interface ComparisonPartyScore {
  id: ComparisonPartyId
  label: string
  raisedCount: number
  missedCount: number
  incorrectCount: number
  tooBroadCount: number
  addedCount?: number
  verifiedCount?: number
  refutedCount?: number
  note: string
}

export interface ComparisonAgentSummary {
  agentId: string
  agentLabel: string
  headline: string
  verdict: string
  parties?: ComparisonPartyScore[]
  callouts: ComparisonCallout[]
}

export interface ComparisonResult {
  themes: ComparisonTheme[]
  questions?: ComparisonTheme[]
  summary: ComparisonSummary
  agentSummary?: ComparisonAgentSummary
}

export interface ComparisonPreset {
  id: string
  inputs?: ComparisonInputBundle
  result: ComparisonResult
}

export interface LockedRun {
  runId: string
  lockedAt: string
  packageHash?: string
  findingIds: string[]
}
