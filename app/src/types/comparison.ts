import type { FindingValidity } from './finding'

export interface HumanReviewInput {
  id: string
  label: string
  reviewText: string
  sourceType: 'openreview' | 'manual' | 'other'
  sourceUrl?: string
}

export interface ComparisonInputBundle {
  humanReviews: HumanReviewInput[]
  metaReview?: HumanReviewInput
  authorRebuttal?: HumanReviewInput
  baselineReview?: HumanReviewInput
}

export interface ComparisonTheme {
  id: string
  label: string
  peerMindFindingIds: string[]
  humanFindingIds: string[]
  baselineFindingIds?: string[]
  relation: 'shared' | 'human_only' | 'peermind_only' | 'disagreement'
  sourceIds?: string[]
  defenderStatus?: FindingValidity
  explanation?: string
}

export interface ComparisonSummary {
  sharedCount: number
  humanOnlyCount: number
  peerMindOnlyCount: number
  disagreementCount: number
  refutedCount?: number
}

export interface ComparisonResult {
  themes: ComparisonTheme[]
  summary: ComparisonSummary
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
