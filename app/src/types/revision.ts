export type RevisionIssueStatus =
  | 'addressed'
  | 'partially_addressed'
  | 'remaining'
  | 'new'

export type RevisionSeverity = 'major' | 'minor' | 'suggestion'

export const REVISION_STATUS_LABELS: Record<RevisionIssueStatus, string> = {
  addressed: 'Addressed',
  partially_addressed: 'Partially addressed',
  remaining: 'Remaining',
  new: 'New issue',
}

export const REVISION_SEVERITY_LABELS: Record<RevisionSeverity, string> = {
  major: 'Major',
  minor: 'Minor',
  suggestion: 'Suggestion',
}

export interface RevisionScore {
  overall: number
  scale: number
  label: string
}

export interface RevisionIssue {
  id: string
  status: RevisionIssueStatus
  severity: RevisionSeverity
  title: string
  originalAllegation: string
  revisionEvidence: string
  assessment: string
  sourceRefs: string[]
}

export interface RevisionCheckInputs {
  reviewFileName?: string
  reviewLabel: string
  paperFileName?: string
  paperLabel: string
}

export interface RevisionCheckResult {
  inputs: RevisionCheckInputs
  priorScore: RevisionScore
  updatedScore: RevisionScore
  summary: string
  issues: RevisionIssue[]
}

export interface RevisionCheckSummaryCounts {
  addressed: number
  partiallyAddressed: number
  remaining: number
  newIssues: number
}

export function summarizeRevisionIssues(issues: RevisionIssue[]): RevisionCheckSummaryCounts {
  return {
    addressed: issues.filter((issue) => issue.status === 'addressed').length,
    partiallyAddressed: issues.filter((issue) => issue.status === 'partially_addressed').length,
    remaining: issues.filter((issue) => issue.status === 'remaining').length,
    newIssues: issues.filter((issue) => issue.status === 'new').length,
  }
}
